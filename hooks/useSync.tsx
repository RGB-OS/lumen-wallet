import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/nodeService';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const sync = useCallback(async () => {
    if (isSyncing) return; // Prevent multiple simultaneous syncs

    setIsSyncing(true);
    try {
      await nodeService.sync();
      // Refetch everything so balances/transfers reflect the synced state
      await queryClient.invalidateQueries();
    } catch (error) {
      console.warn('Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, queryClient]);

  return { sync, isSyncing };
}
