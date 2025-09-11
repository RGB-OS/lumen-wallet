import { useEffect } from 'react';
import { useRefreshTransfers } from '@/hooks/useWalletQueries';

export function AutoRefreshProvider({ children }: { children: React.ReactNode }) {
  const refreshTransfersMutation = useRefreshTransfers();

  useEffect(() => {
    const interval = setInterval(() => {
      // Call the /refreshtransfers API endpoint every 120 seconds
      refreshTransfersMutation.mutate({ skip_sync: false });
      console.log('Auto-refreshing transfers via /refreshtransfers API...');
    }, 120000); // 120 seconds = 2 minutes


    return () => clearInterval(interval);
  }, [refreshTransfersMutation]);

  return <>{children}</>;
}
