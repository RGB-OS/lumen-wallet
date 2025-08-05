import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { BTCBalance } from '@/types/rgb-types';
import { useRLNState } from '@/providers/nodeProvider';

export const BTCBalanceCard = () => {
  const { data, status, error, refetch } = useRLNState<BTCBalance>('btcbalance');
  const [totalValue, setTotalValue] = useState('0.00000000');

  useEffect(() => {
    if (data?.vanilla?.spendable != null) {
      const btcAmount = parseFloat(satoshisToBTC(data.vanilla.spendable));
      setTotalValue(btcAmount.toFixed(8));
    }
  }, [data]);

  if (status === 'loading') {
    return <div className="h-6 w-32 animate-pulse bg-gray-300 rounded" />;
  }

  if (status === 'error') {
    return (
      <div className="text-red-500 flex space-x-2 items-center">
        <p>Error: {error}</p>
        <RefreshCw
        onClick={refetch}
        className={`h-4 w-4 cursor-pointer`}
      />
      </div>
    );
  }

  return (
    <p className="text-xl font-bold text-bitcoin flex items-center space-x-2">
      <span>{totalValue} BTC</span>
      <RefreshCw
        onClick={refetch}
        className={`h-4 w-4 cursor-pointer`}
      />
    </p>
  );
};

