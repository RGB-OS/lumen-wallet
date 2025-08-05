import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { ListAssetsResponse, RgbTransfer } from '@/types/rgb-types';
import { useRLNApi, useRLNState } from '@/providers/nodeProvider';

export const AssetPage = () => {
  const { asset_id } = useParams();
  const key = `listtransfers:${JSON.stringify({asset_id:asset_id})}`;
  const { fetchApi } = useRLNApi();

  const assetsData = useRLNState<ListAssetsResponse>('listassets');
  const {
    data: transfersData,
    status: txStatus,
    error: txError,
    refetch,
  } = useRLNState<{ transfers: RgbTransfer[] }>(key);
console.log('AssetPage transfersData', transfersData, 'txStatus', txStatus, 'txError', txError);
  const transfers = transfersData?.transfers ?? [];

  const asset = useMemo(() => {
    if (assetsData.status !== 'success' || !assetsData.data || !asset_id) return null;
    const all = [
      ...(assetsData.data.nia ?? []),
      ...(assetsData.data.uda ?? []),
      ...(assetsData.data.cfa ?? []),
    ];
    return all.find((a) => a.asset_id === asset_id);
  }, [assetsData.data, asset_id]);

  const fetchTransfers = async () => {
    console.log('Fetching transfers for asset_id:', asset_id);
    if (!asset_id) return;
    await fetchApi<{ transfers: RgbTransfer[] }>('listtransfers', 'POST', { asset_id });
  }
  useEffect(() => {
    if (!asset_id) return;
    fetchTransfers()
  }, [asset_id]);

  if (assetsData.status === 'loading') {
    return <div className="p-6 text-sm">Loading asset data...</div>;
  }

  if (!asset) {
    return <div className="p-6 text-sm text-destructive">Asset not found.</div>;
  }

  const formattedBalance = (
    asset.balance.spendable / Math.pow(10, asset.precision)
  ).toLocaleString();

  return (
    <div className="h-full w-full bg-background">
      <Card>
        <CardContent className="p-6 space-y-2">
          <div className="text-2xl font-semibold">{asset.name}</div>
          <div className="text-sm text-muted-foreground break-all">{asset.asset_id}</div>
          <div className="text-xl font-bold">
            {formattedBalance} {asset.ticker ?? '—'}
          </div>
          <div className="flex gap-4 mt-4">
            <Link to={`/wallet/send/${asset_id}`} className='w-1/2'> <Button className='w-full'>Send</Button></Link>
            <Link to={`/wallet/receive`} className='w-1/2'>  <Button className='w-full' variant="outline">Receive</Button></Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">Transfers</div>
            <RefreshCw
              onClick={() => fetchTransfers()}
              className={`h-4 w-4 cursor-pointer ${txStatus === 'loading' ? 'animate-spin' : ''}`}
            />
          </div>

          {txStatus === 'loading' && (
            <p className="text-sm text-muted-foreground">Loading transfers...</p>
          )}
          {txStatus === 'error' && (
            <div className="text-sm text-red-500">
              <p>{txError}</p>
              <Button variant="outline" size="sm" onClick={fetchTransfers} className="mt-2">
                Retry
              </Button>
            </div>
          )}
          {txStatus === 'success' && transfers.length === 0 && (
            <p className="text-sm text-muted-foreground">No transfers found.</p>
          )}
          {txStatus === 'success' && transfers.length > 0 && (
            <div className="space-y-3">
              {transfers.map((tx) => (
                <div key={tx.idx} className="p-4 border rounded-md bg-card">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Kind: {tx.kind}</span>
                    <span className="text-xs text-muted-foreground">{tx.status}</span>
                  </div>
                  <div className="text-sm mt-1 font-mono truncate">
                    TxID: {tx.txid}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Value: {tx.requested_assignment?.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Expires: {new Date(tx.expiration * 1000).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
