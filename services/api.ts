import axios, { AxiosInstance, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      timeout: 60000,
    });

    // Set up request interceptor to add auth and base URL
    this.api.interceptors.request.use(
      async (config: any) => {
        const items =
          await storage.getItems(['local:node-endpoint', 'local:access-token'])
        console.log('items', items);

        const nodeEndpoint = items.find(item => item.key === 'local:node-endpoint')?.value ?? null
        const accessToken = items.find(item => item.key === 'local:access-token')?.value ?? null
        if (nodeEndpoint) {
          config.baseURL = nodeEndpoint
        }

        if (accessToken) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${accessToken}`,
          }
        }

        return config
      },
      (error) => Promise.reject(error)
    )
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await storage.removeItem('local:access-token')
        }

        return Promise.reject(error)
      }
    )
  }

  public getApiInstance(): AxiosInstance {
    return this.api;
  }

  // Node connection
  async connectNode(endpoint: string, token: string): Promise<AxiosResponse> {
    return this.api.post('/nodeinfo', { endpoint }, {
      headers: { Authorization: `Bearer ${token}` },
      baseURL: endpoint
    });
  }

  // Wallet APIs
  async getBTCBalance(): Promise<AxiosResponse> {
    return this.api.post('/btcbalance', {
      "skip_sync": false
    });
  }

  async getRGBAssets(): Promise<AxiosResponse> {
    return this.api.post('/listassets', {
      "filter_asset_schemas": [
        "Nia",
        "Uda",
        "Cfa"
      ]
    });
  }

  async getAddress(): Promise<AxiosResponse> {
    return this.api.post('/address');
  }
}

export const apiService = new ApiService();