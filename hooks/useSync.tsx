import { useCallback, useState } from 'react';
import { nodeService } from '@/services/nodeService';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = useCallback(async () => {
    if (isSyncing) return; // Prevent multiple simultaneous syncs
    
    setIsSyncing(true);
    try {
      await nodeService.sync();
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  return { sync, isSyncing };
}
