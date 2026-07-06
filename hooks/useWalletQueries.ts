import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/nodeService';
import { 
  NodeInfoResponse, 
  BTCBalance, 
  ListAssetsResponse, 
  ListTransfersResponse,
  ListUnspentsResponse,
  CreateUTXOsRequest,
  SendRGBAsset,
  AddressResponse,
  NetworkInfoResponse
} from '@/types/rgb-types';

// Query Keys
export const queryKeys = {
  nodeInfo: ['nodeInfo'],
  btcBalance: ['btcBalance'],
  listAssets: ['listAssets'],
  listTransfers: (assetId: string) => ['listTransfers', assetId],
  listUnspents: ['listUnspents'],
  listTransactions: ['listTransactions'],
  address: ['address'],
  networkInfo: ['networkInfo'],
} as const;

// Node Info
export const useNodeInfo = () => {
  return useQuery({
    queryKey: queryKeys.nodeInfo,
    queryFn: () => nodeService.nodeinfo(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// BTC Balance
export const useBTCBalance = () => {
  return useQuery({
    queryKey: queryKeys.btcBalance,
    queryFn: () => nodeService.btcbalance(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

// List Assets
export const useListAssets = () => {
  return useQuery({
    queryKey: queryKeys.listAssets,
    queryFn: () => nodeService.listassets(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// List Transfers
export const useListTransfers = (assetId: string) => {
  return useQuery({
    queryKey: queryKeys.listTransfers(assetId),
    queryFn: () => nodeService.listtransfers({ assetId }),
    enabled: !!assetId,
    staleTime: 1000 * 30, // 30 seconds
  });
};

// List Unspents
export const useListUnspents = () => {
  return useQuery({
    queryKey: queryKeys.listUnspents,
    queryFn: () => nodeService.listunspents(),
    staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes - cache kept for 30 minutes
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
};

// Address
export const useAddress = () => {
  return useQuery({
    queryKey: queryKeys.address,
    queryFn: () => nodeService.getaddress(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Network Info
export const useNetworkInfo = () => {
  return useQuery({
    queryKey: queryKeys.networkInfo,
    queryFn: () => nodeService.networkinfo(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// List Transactions
export const useListTransactions = () => {
  return useQuery({
    queryKey: queryKeys.listTransactions,
    queryFn: () => nodeService.listtransactions(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

// Mutations
export const useCreateUTXOs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: CreateUTXOsRequest) => nodeService.createutxos(params),
    onSuccess: () => {
      // Invalidate and refetch unspents
      queryClient.invalidateQueries({ queryKey: queryKeys.listUnspents });
      queryClient.invalidateQueries({ queryKey: queryKeys.btcBalance });
    },
  });
};

export const useFailTransfer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ batch_transfer_idx }: { batch_transfer_idx: number }) => 
      nodeService.failtransfer({ batch_transfer_idx }),
    onSuccess: () => {
      // Invalidate all transfer queries
      queryClient.invalidateQueries({ queryKey: ['listTransfers'] });
    },
  });
};

export const useSendAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: SendRGBAsset) => nodeService.sendasset(params),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.listAssets });
      queryClient.invalidateQueries({ queryKey: ['listTransfers'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.btcBalance });
    },
  });
};

export const useRefreshTransfers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params?: { skip_sync?: boolean }) => nodeService.refreshtransfers(params),
    onSuccess: () => {
      // Refreshing can settle transfers, which changes asset balances too
      queryClient.invalidateQueries({ queryKey: ['listTransfers'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.listAssets });
      queryClient.invalidateQueries({ queryKey: queryKeys.btcBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.listUnspents });
    },
  });
};

// Utility hook for manual refetching
export const useWalletRefetch = () => {
  const queryClient = useQueryClient();
  
  return {
    refetchAll: () => {
      queryClient.invalidateQueries();
    },
    refetchAssets: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listAssets });
    },
    refetchTransfers: () => {
      queryClient.invalidateQueries({ queryKey: ['listTransfers'] });
    },
    refetchUnspents: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listUnspents });
    },
    refetchBalance: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.btcBalance });
    },
  };
};

// Send BTC mutation
export const useSendBTC = () => {
  return useMutation({
    mutationFn: (params: { amount: number; address: string; fee_rate: number; skip_sync: boolean }) => nodeService.sendbtc(params),
  });
};
