import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';
import { storage } from '#imports';
import { openLoginTabAndClosePopup } from '@/utils';

// Safe storage access with fallbacks
const getStorageItems = async (keys: string[]): Promise<Array<{ key: string; value: string }>> => {
  try {
    console.log('🔍 Storage check:', { keys });
    
    // Use WXT storage API
    console.log('📦 Using WXT storage');
    const results = await Promise.all(
      keys.map(async (key) => {
        // Ensure key has local: prefix
        const storageKey = (key.startsWith('local:') ? key : `local:${key}`) as `local:${string}`;
        const value = await storage.getItem<string>(storageKey);
        return { key, value: value || '' };
      })
    );
    return results;
  } catch (error) {
    console.warn('⚠️ Storage access failed, using localStorage fallback:', error);
    // Fallback to localStorage for development/testing
    return keys.map(key => ({
      key,
      value: localStorage.getItem(key) || ''
    }));
  }
};

const removeStorageItem = async (key: string): Promise<void> => {
  try {
    // Ensure key has local: prefix
    const storageKey = (key.startsWith('local:') ? key : `local:${key}`) as `local:${string}`;
    await storage.removeItem(storageKey);
  } catch (error) {
    console.warn('Storage removal failed, using localStorage fallback:', error);
    localStorage.removeItem(key);
  }
};

// API Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  error?: string;
  name?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get endpoint and token from extension storage
      const items = await getStorageItems(['local:node-endpoint', 'local:access-token']);
      
      const nodeEndpoint = items.find(item => item.key === 'local:node-endpoint')?.value;
      const accessToken = items.find(item => item.key === 'local:access-token')?.value;

      // Set base URL if endpoint is available
      if (nodeEndpoint) {
        config.baseURL = nodeEndpoint;
      }

      // Add auth token if available
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Add request ID for tracking
      config.headers['X-Request-ID'] = crypto.randomUUID();

      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        params: config.params,
        data: config.data,
      });

      return config;
    } catch (error) {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
      data: response.data,
    });
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const { response, request, message } = error;
    
    console.error('❌ API Error:', {
      status: response?.status,
      url: response?.config?.url,
      message: response?.data?.message || message,
      error: response?.data?.error,
      name: response?.data?.name,
      code: response?.data?.code,
      data: response?.data,
    });

    // Handle different error types
    if (response) {
      // Server responded with error status
      // Try to get the actual error message from the response data
      let errorMessage = getErrorMessage(response.status);
      
      // Check for specific error messages in the response data
      // Priority: error > name > message > default
      if (response.data?.error) {
        errorMessage = response.data.error;
      } else if (response.data?.name) {
        errorMessage = response.data.name;
      } else if (response.data?.message) {
        errorMessage = response.data.message;
      }
      
      // Don't show toast for auth errors (handle in auth flow)
      if (![401, 403].includes(response.status)) {
        toast.error(errorMessage);
      }

      // Handle specific error codes
      switch (response.status) {
        case 401:
          // Handle unauthorized - redirect to login
          handleUnauthorized();
          break;
        case 403:
          // Handle forbidden - show the specific error message from the API
          const forbiddenMessage = response.data?.error || response.data?.message || response.data?.name || 'Access Denied: You do not have permission to perform this action.';
          toast.error(forbiddenMessage);
          break;
        case 404:
          // Handle not found
          toast.error('Not Found: The requested resource was not found.');
          break;
        case 429:
          // Handle rate limiting
          toast.error('Rate Limited: Too many requests. Please try again later.');
          break;
        case 500:
          // Handle server error
          toast.error('Server Error: An internal server error occurred. Please try again later.');
          break;
        case 502:
          // Handle bad gateway
          toast.error('Bad Gateway: The server is temporarily unavailable.');
          break;
        case 503:
          // Handle service unavailable
          toast.error('Service Unavailable: The service is temporarily unavailable.');
          break;
        case 504:
          // Handle gateway timeout
          toast.error('Gateway Timeout: The request timed out. Please try again.');
          break;
        default:
          // Handle any other error status codes
          if (response.status >= 400) {
            toast.error(errorMessage);
          }
          break;
      }
    } else if (request) {
      // Request was made but no response received
      toast.error('Network Error: Unable to connect to the server. Please check your internet connection.');
    } else {
      // Something else happened
      toast.error('Request Error: An error occurred while setting up the request.');
    }

    return Promise.reject(error);
  }
);

// Helper functions
function getErrorMessage(status: number): string {
  const errorMessages: Record<number, string> = {
    400: 'Bad Request - Please check your input and try again.',
    401: 'Unauthorized - Please log in again.',
    403: 'Forbidden - You do not have permission to perform this action.',
    404: 'Not Found - The requested resource was not found.',
    409: 'Conflict - The request conflicts with the current state.',
    422: 'Validation Error - Please check your input and try again.',
    429: 'Too Many Requests - Please try again later.',
    500: 'Internal Server Error - Please try again later.',
    502: 'Bad Gateway - The server is temporarily unavailable.',
    503: 'Service Unavailable - The service is temporarily unavailable.',
    504: 'Gateway Timeout - The request timed out.',
  };

  return errorMessages[status] || 'An unexpected error occurred.';
}

async function handleUnauthorized() {
  try {
    // Clear auth data from extension storage
    await removeStorageItem('local:access-token');
    
    // Open login in a new tab and close the popup
    const isLoginRoute = location.hash === '#/login' || location.hash === '#login';
    if (!isLoginRoute) {
      openLoginTabAndClosePopup();
    }
  } catch (error) {
    console.error('Error handling unauthorized:', error);
  }
}

// Export configured client
export default apiClient;

// Export types for use in other files
export type { AxiosRequestConfig, AxiosResponse, AxiosError };
