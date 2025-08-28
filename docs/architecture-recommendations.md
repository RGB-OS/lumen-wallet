# Architecture Recommendations for Lumen Wallet

## Current State Analysis

### ✅ Strengths
- Modern React 19 + TypeScript stack
- Good separation of concerns
- React Query for data management
- Consistent UI with Shadcn
- Type safety throughout

### ⚠️ Areas for Improvement
- Flat component structure
- Mixed concerns in some components
- No clear feature boundaries
- Missing error boundaries
- No state management strategy for complex state

## Recommended Architecture

### 1. Feature-Based Organization

```
src/
├── features/
│   ├── wallet/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── transactions/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── index.ts
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── constants/
├── app/
│   ├── providers/
│   ├── routing/
│   ├── layouts/
│   └── entrypoints/
└── types/
    └── global.ts
```

### 2. State Management Strategy

#### For Simple State: React Query + Context
- Use React Query for server state
- Use Context for global UI state (theme, auth, etc.)

#### For Complex State: Zustand (Recommended)
```typescript
// stores/walletStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface WalletState {
  selectedAsset: string | null;
  pendingTransactions: Transaction[];
  setSelectedAsset: (assetId: string) => void;
  addPendingTransaction: (tx: Transaction) => void;
}

export const useWalletStore = create<WalletState>()(
  devtools(
    (set) => ({
      selectedAsset: null,
      pendingTransactions: [],
      setSelectedAsset: (assetId) => set({ selectedAsset: assetId }),
      addPendingTransaction: (tx) => 
        set((state) => ({ 
          pendingTransactions: [...state.pendingTransactions, tx] 
        })),
    }),
    { name: 'wallet-store' }
  )
);
```

### 3. Error Handling Strategy

#### Error Boundaries
```typescript
// shared/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### API Error Handling
```typescript
// shared/services/apiClient.ts
import axios from 'axios';
import { toast } from '@/hooks/useToast';

const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 10000,
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    // Don't show toast for 401/403 (handle in auth)
    if (![401, 403].includes(error.response?.status)) {
      toast.error('API Error', message);
    }
    
    return Promise.reject(error);
  }
);
```

### 4. Performance Optimizations

#### Code Splitting
```typescript
// app/routing/lazyRoutes.tsx
import { lazy } from 'react';

export const WalletDashboard = lazy(() => 
  import('@/features/wallet/components/WalletDashboard')
);

export const AssetPage = lazy(() => 
  import('@/features/assets/components/AssetPage')
);
```

#### Memoization Strategy
```typescript
// shared/hooks/useMemoizedCallback.ts
import { useCallback, useRef } from 'react';

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T {
  const ref = useRef<T>(callback);
  ref.current = callback;
  
  return useCallback((...args: any[]) => {
    return ref.current(...args);
  }, deps) as T;
}
```

### 5. Testing Strategy

#### Unit Tests
```typescript
// features/wallet/__tests__/useWalletQueries.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBTCBalance } from '../hooks/useWalletQueries';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useBTCBalance', () => {
  it('should fetch BTC balance', async () => {
    const { result } = renderHook(() => useBTCBalance(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

### 6. Environment Configuration

#### Environment Variables
```typescript
// shared/config/environment.ts
export const config = {
  api: {
    baseUrl: process.env.VITE_API_BASE_URL || 'https://api.example.com',
    timeout: parseInt(process.env.VITE_API_TIMEOUT || '10000'),
  },
  features: {
    enableAnalytics: process.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebugMode: process.env.NODE_ENV === 'development',
  },
} as const;
```

### 7. Type Safety Improvements

#### Strict Type Definitions
```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// types/wallet.ts
export interface WalletState {
  readonly address: string;
  readonly network: Network;
  readonly isConnected: boolean;
  readonly lastSync: Date;
}
```

### 8. Security Considerations

#### Input Validation
```typescript
// shared/validation/schemas.ts
import { z } from 'zod';

export const addressSchema = z.string().regex(/^[a-zA-Z0-9]{26,35}$/);
export const amountSchema = z.number().positive().max(1000000);
export const assetIdSchema = z.string().regex(/^rgb:[a-zA-Z0-9-]+$/);

export const transferSchema = z.object({
  assetId: assetIdSchema,
  amount: amountSchema,
  recipient: addressSchema,
  feeRate: z.number().min(1).max(1000),
});
```

### 9. Monitoring & Analytics

#### Error Tracking
```typescript
// shared/services/errorTracking.ts
export const errorTracking = {
  captureException: (error: Error, context?: any) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      console.error('Error captured:', error, context);
    }
  },
  
  captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    if (process.env.NODE_ENV === 'production') {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  },
};
```

## Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. ✅ React Query migration (already done)
2. ✅ Toast system (already done)
3. ✅ Confirmation system (already done)
4. Add error boundaries
5. Implement proper error handling

### Phase 2: Organization (Week 3-4)
1. Reorganize into feature-based structure
2. Add Zustand for complex state
3. Implement proper type definitions
4. Add input validation

### Phase 3: Performance (Week 5-6)
1. Add code splitting
2. Implement memoization
3. Add performance monitoring
4. Optimize bundle size

### Phase 4: Quality (Week 7-8)
1. Add comprehensive testing
2. Implement monitoring
3. Add security measures
4. Documentation

## Conclusion

The current architecture is solid for a small to medium application, but implementing these recommendations will make it more scalable, maintainable, and robust. The feature-based organization will make it easier to work on specific features without affecting others, while the improved error handling and state management will provide a better user experience.

