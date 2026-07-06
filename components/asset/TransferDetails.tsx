import React, { useState } from 'react';
import { RgbTransfer } from '@/types/rgb-types';
import { twMerge } from 'tailwind-merge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useToastActions } from '@/hooks/useToastActions';
import { useFailTransfer } from '@/hooks/useWalletQueries';
import { useConfirmActions } from '@/hooks/useConfirmActions';

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

interface TransferDetailsProps {
  transaction: RgbTransfer;
  asset: any;
  onClose?: () => void;
  onTransactionUpdate?: () => void;
}

export const TransferDetails: React.FC<TransferDetailsProps> = ({
  transaction,
  asset,
  onClose,
  onTransactionUpdate,
}) => {
  const { showTransferSuccess, showTransferError, showCopiedToClipboard, showError } = useToastActions();
  const { confirmCancel } = useConfirmActions();
  const failTransferMutation = useFailTransfer();
  const Icon = TransferKind[transaction.kind] ? TransferKind[transaction.kind] : null;
  const formattedValue = transaction.requested_assignment?.value ? (
    transaction.requested_assignment?.value / Math.pow(10, asset.precision)
  ).toLocaleString() : transaction.requested_assignment?.value;

  const formatAddress = (address: string) => {
    if (!address) return '—';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopiedToClipboard(label);
    } catch (err) {
      showError("Copy Failed", "Failed to copy to clipboard");
    }
  };

  const handleCancelTransfer = async () => {
    const confirmed = await confirmCancel('transfer');

    if (!confirmed) {
      return;
    }

    failTransferMutation.mutate(
      { batch_transfer_idx: transaction.idx },
      {
        onSuccess: () => {
          showTransferSuccess('Transfer Cancelled');
          onTransactionUpdate?.();
          onClose?.();
        },
        onError: (error) => {
          console.error('Failed to cancel transfer:', error);
          showTransferError('Transfer Cancellation');
        }
      }
    );
  };

    return (
    <>
      {/* Scrollable Content */}
      <div className="overflow-y-auto max-h-[60vh] px-6 pb-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className={twMerge("h-12 w-12 text-white rounded-full flex items-center justify-center text-xl uppercase", colorsKind[transaction.kind] ?? 'bg-gray-500')}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {transaction.kind} {formattedValue} {asset.ticker ?? '—'}
            </h3>
            <Badge variant="secondary" className={twMerge("mt-1 font-semibold", statusColors[transaction.status])}>
              {transaction.status}
            </Badge>
          </div>
        </div>

        {/* Transaction Details */}
        <Card className='rounded-lg shadow-md'>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-dark uppercase tracking-wide">Transaction ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-mono break-all flex-1">
                    {transaction.txid ? formatAddress(transaction.txid) : '—'}
                  </p>
                  {transaction.txid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.txid!, 'Transaction ID')}
                      className="h-6 w-6 p-0 hover:bg-muted"
                    >
                      <Icons.copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-dark uppercase tracking-wide">Index</label>
                <p className="text-sm mt-1">{transaction.idx}</p>
              </div>
              <div>
                <label className="text-xs text-gray-dark uppercase tracking-wide">Created</label>
                <p className="text-sm mt-1">{formatDate(transaction.created_at)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-dark uppercase tracking-wide">Updated</label>
                <p className="text-sm mt-1">{formatDate(transaction.updated_at)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-dark uppercase tracking-wide">Expiration</label>
                <p className="text-sm mt-1">{transaction.expiration_timestamp ? formatDate(transaction.expiration_timestamp) : '—'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-dark uppercase tracking-wide">Recipient ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-mono break-all flex-1">
                    {transaction.recipient_id ? formatAddress(transaction.recipient_id) : '—'}
                  </p>
                  {transaction.recipient_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.recipient_id!, 'Recipient ID')}
                      className="h-6 w-6 p-0 hover:bg-muted"
                    >
                      <Icons.copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Assignment Details */}
            <div>
              <label className="text-xs text-gray-dark uppercase tracking-wide">Requested Assignment</label>
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>Type: {transaction.requested_assignment?.type || '—'}</span>
                  <span>Value: {transaction.requested_assignment?.value || '—'}</span>
                </div>
              </div>
            </div>

            {/* Assignments */}
            {transaction.assignments && transaction.assignments.length > 0 && (
              <div>
                <label className="text-xs text-gray-dark uppercase tracking-wide">Assignments</label>
                <div className="mt-2 space-y-2">
                  {transaction.assignments.map((assignment, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span>Type: {assignment.type}</span>
                        <span>Value: {assignment.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UTXO Information */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs text-gray-dark uppercase tracking-wide">Receive UTXO</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-mono break-all flex-1">
                    {transaction.receive_utxo ? formatAddress(transaction.receive_utxo) : '—'}
                  </p>
                  {transaction.receive_utxo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.receive_utxo!, 'Receive UTXO')}
                      className="h-6 w-6 p-0 hover:bg-muted"
                    >
                      <Icons.copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              {transaction.change_utxo && (
                <div>
                  <label className="text-xs text-gray-dark uppercase tracking-wide">Change UTXO</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-mono break-all flex-1">
                      {formatAddress(transaction.change_utxo)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.change_utxo!, 'Change UTXO')}
                      className="h-6 w-6 p-0 hover:bg-muted"
                    >
                      <Icons.copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Transport Endpoints */}
            {transaction.transport_endpoints && transaction.transport_endpoints.length > 0 && (
              <div>
                <label className="text-xs text-gray-dark uppercase tracking-wide">Transport Endpoints</label>
                <div className="mt-2 space-y-2">
                  {transaction.transport_endpoints.map((endpoint, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span>Type: {endpoint.transport_type}</span>
                        <span>Used: {endpoint.used ? 'Yes' : 'No'}</span>
                      </div>
                      <p className="text-xs font-mono break-all mt-1 text-gray-dark">
                        {endpoint.endpoint}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sticky Cancel Button for WaitingCounterparty status */}
      {transaction.status === 'WaitingCounterparty' && (
        <div className="border-t border-border bg-background px-6 py-4 mt-6">
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">
              This transfer is waiting for the counterparty. You can cancel it if needed.
            </p>
          </div>
          <Button 
            onClick={handleCancelTransfer}
            disabled={failTransferMutation.isPending}
            variant="destructive"
            className="w-full"
          >
            {failTransferMutation.isPending ? (
              <>
                <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <Icons.refresh className="mr-2 h-4 w-4" />
                Cancel Transfer
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
};
