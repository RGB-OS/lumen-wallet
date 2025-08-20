import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { ListAssetsResponse, RgbTransfer } from '@/types/rgb-types';
import { useRLNApi, useRLNState } from '@/providers/nodeProvider';
import { nodeService } from '@/services/nodeService';
import { twMerge } from 'tailwind-merge';

const TransferKind: any = {
  Issuance: Icons.plus,
  ReceiveBlind: Icons.arrowDownLeft,
  ReceiveWitness: Icons.arrowDownLeft,
  Send: Icons.arrowUpRight,
} as const;

const colorsKind: any = {
  Issuance: 'bg-[#111111]',
  ReceiveBlind: 'bg-[#33C75C]',
  ReceiveWitness: 'bg-[#33C75C]',
  Send: 'bg-[#FF9000]',
}

const statusColors: any = {
  WaitingCounterparty: 'text-[#FF9000]',
  WaitingConfirmations: 'text-[#FF9000]',
  Settled: "text-[#33C75C]",
  Failed: "text-[#EB1932]",
}

export const AssetPage = () => {
  const { asset_id } = useParams();
  const key = `listtransfers:${JSON.stringify({ asset_id: asset_id })}`;
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
    await nodeService.refreshtransfers();
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
    <div className="h-full w-full bg-background space-y-6 px-6">
      <Card className='rounded-lg shadow-md'>
        <CardContent className="p-6 space-y-2">
          <div className="text-lg font-semibold">{asset.name}</div>

          <div className="text-xl font-bold">
            {formattedBalance} {asset.ticker ?? '—'}
          </div>
          <div className="text-sm break-all text-gray-dark">{asset.asset_id}</div>
          <div className="flex gap-4 mt-4 justify-center">
            <div className="flex flex-col items-center space-y-2">

              <Link to={`/wallet/receive/${asset_id}`}> <Button className="size-16 text-foreground bg-white rounded-2xl" variant="outline" >
                <Icons.recive className="size-8" />
              </Button>
              </Link>
              <span>Recive</span>
            </div>

            <div className="flex flex-col items-center  space-y-2">
              <Link to={`/wallet/send/${asset_id}`}>
                <Button className="size-16 text-foreground bg-white rounded-2xl" variant="outline" >
                  <Icons.send className="size-8" />
                </Button>
              </Link>
              <span>Send</span>
            </div>

          </div>
        </CardContent>
      </Card>
      <div className="space-y-6 py-1">

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
            {transfers.map((tx) => {
              const Icon = TransferKind[tx.kind] ? TransferKind[tx.kind] : null;
              const formattedValue = tx.requested_assignment?.value ? (
                tx.requested_assignment?.value / Math.pow(10, asset.precision)
              ).toLocaleString() : tx.requested_assignment?.value;
              return <Link to={`/wallet/tx/${tx.idx}`} key={tx.idx} className=" bg-card flex flex-row p-4 border border-border rounded-lg hover:border-foreground/20  transition-colors cursor-ponter text-foreground">

                <div className={twMerge("h-10 w-10 text-white rounded-full flex items-center justify-center text-lg uppercase", colorsKind[tx.kind] ?? 'bg-gray-500')}>
                  <Icon></Icon>

                </div>

                <div className='flex-1 flex flex-row justify-between items-center ml-4'>
                  <div className='text-left'>
                    <div className="text-sm font-semibold text-foreground">
                      {tx.kind} {formattedValue} {asset.ticker ?? '—'}
                    </div>
                    <div className="text-xs text-gray-dark mt-1">
                      exp: {new Date(tx.expiration * 1000).toLocaleString()}
                    </div>
                  </div>
                  <div className='text-right'>
                    <span className={twMerge("text-sm font-semibold ", statusColors[tx.status])}>{tx.status}</span>
                    <div className="text-xs mt-1 font-mono truncate text-gray-dark">
                      tx: {tx.txid ? formatAddress(tx.txid) : '—'}
                    </div>
                  </div>

                </div>
              </Link>
            })}
          </div>
        )}
      </div>

    </div>
  );
};
