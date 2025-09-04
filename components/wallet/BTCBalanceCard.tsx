import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useBTCBalance } from '@/hooks/useWalletQueries';

export const BTCBalanceCard = () => {
  const { data, isLoading, error, refetch } = useBTCBalance();
  const [totalValue, setTotalValue] = useState('0.00000000');

  useEffect(() => {
    if (data?.vanilla?.spendable != null) {
      const btcAmount = parseFloat(satoshisToBTC(data.vanilla.spendable));
      setTotalValue(btcAmount.toFixed(8));
    }
  }, [data]);
  
  if (isLoading) {
    return <div className="h-6 w-32 mt-1 animate-pulse bg-gray-300 rounded" />;
  }

  if (error) {
    return (
      <div className="text-red-500 flex space-x-2 items-center">
        <p>Error: {error.message}</p>
        <RefreshCw
        onClick={() => refetch()}
        className={`h-4 w-4 cursor-pointer`}
      />
      </div>
    );
  }

  return (
    <p className="text-xl font-bold text-bitcoin flex items-center space-x-2">
      <span>{totalValue} BTC</span>
      <RefreshCw
        onClick={() => refetch()}
        className={`h-4 w-4 cursor-pointer`}
      />
    </p>
  );
};

