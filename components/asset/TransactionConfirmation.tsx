import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { SendRGBAsset } from '@/types/rgb-types';
import { nodeService } from '@/services/nodeService';
import { useToastActions } from '@/hooks/useToastActions';
import { closeWindow } from '@/utils';

interface TransactionConfirmationProps {
  transactionData?: SendRGBAsset;
}

export const TransactionConfirmation: React.FC<TransactionConfirmationProps> = ({ 
  transactionData 
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showTransferSuccess, showTransferError } = useToastActions();
  const [isLoading, setIsLoading] = useState(false);
  const [assetInfo, setAssetInfo] = useState<any>(null);
  const [selectedFeeRate, setSelectedFeeRate] = useState<number>(5); // Default to medium

  // Get transaction data from URL params if not provided directly
  const getTransactionData = (): SendRGBAsset | null => {
    if (transactionData) return transactionData;
    
    const recipientId = searchParams.get('recipient_id');
    const assetId = searchParams.get('asset_id');
    const assignmentType = searchParams.get('assignment_type');
    const assignmentValue = searchParams.get('assignment_value');
    const transportEndpoints = searchParams.get('transport_endpoints');
    const donation = searchParams.get('donation');
    const feeRate = searchParams.get('fee_rate');
    const minConfirmations = searchParams.get('min_confirmations');
    const skipSync = searchParams.get('skip_sync');

    if (!recipientId || !assetId || !assignmentValue || !transportEndpoints) {
      return null;
    }

    return {
      recipient_id: recipientId,
      asset_id: assetId,
      assignment: {
        type: assignmentType || 'Fungible', // Default to Fungible if not specified
        value: parseInt(assignmentValue)
      },
      transport_endpoints: transportEndpoints.split(','),
      donation: donation === 'true',
      fee_rate: parseInt(feeRate || '5'), // Default to medium fee rate
      min_confirmations: parseInt(minConfirmations || '1'), // Default to 1 confirmation
      skip_sync: skipSync === 'true'
    };
  };

  const txData = getTransactionData();

  useEffect(() => {
    if (txData?.asset_id) {
      // Fetch asset info to display asset name and ticker
      const fetchAssetInfo = async () => {
        try {
          const assets = await nodeService.listassets();
          const asset = [...(assets.nia ?? []), ...(assets.uda ?? []), ...(assets.cfa ?? []), ...(assets.ifa ?? [])]
            .find((a: any) => a.asset_id === txData.asset_id);
          if (asset) {
            setAssetInfo(asset);
          }
        } catch (error) {
          console.error('Failed to fetch asset info:', error);
        }
      };
      fetchAssetInfo();
    }
  }, [txData?.asset_id]);

  const formatAddress = (address: string) => {
    if (!address) return '—';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatValue = (value: number, precision: number = 0) => {
    return (value / Math.pow(10, precision)).toLocaleString();
  };

  const handleConfirm = async () => {
    if (!txData) return;

    setIsLoading(true);
    try {
      // Ensure the data structure is correct before sending
      const sanitizedData = {
        ...txData,
        assignment: {
          type: txData.assignment.type || 'Fungible',
          value: txData.assignment.value || (txData.assignment as any).amount || 0
        },
        transport_endpoints: Array.isArray(txData.transport_endpoints) 
          ? txData.transport_endpoints 
          : [txData.transport_endpoints].filter(Boolean),
        donation: Boolean(txData.donation),
        fee_rate: selectedFeeRate, // Use the selected fee rate
        min_confirmations: Number(txData.min_confirmations) || 1, // Default to 1
        skip_sync: Boolean(txData.skip_sync)
      };

      const result = await nodeService.sendasset(sanitizedData);
      
      // Send success message to background script
      browser.runtime.sendMessage({ 
        type: 'transaction-confirmation-response', 
        success: true, 
        result 
      });
      
      showTransferSuccess('Transaction sent successfully');
      
      // Close popup after a short delay
      closeWindow()
      
    } catch (error: any) {
      console.error('Transaction failed:', error);
      showTransferError(error.message || 'Transaction failed');
      
      // Send error message to background script
      browser.runtime.sendMessage({ 
        type: 'transaction-confirmation-response', 
        success: false, 
        error: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    // Send rejection message to background script
    browser.runtime.sendMessage({ 
      type: 'transaction-confirmation-response', 
      success: false, 
      error: 'Transaction rejected by user' 
    });
    
    // Show rejection message before closing
    showTransferError('Transaction rejected by user');
    
    // Close popup after a short delay
    closeWindow()
  };

  if (!txData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Icons.circleAlert className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Invalid Transaction</h2>
        <p className="text-muted-foreground text-center mb-4">
          The transaction data is missing or invalid.
        </p>
        <Button onClick={() => window.close()}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="h-16 w-16 bg-destructive text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.arrowUpRight className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Confirm Transaction</h1>
          <p className="text-gray-dark">
            Review the transaction details before confirming
          </p>
        </div>

        {/* Transaction Details */}
        <Card className='rounded-lg shadow-md'>
          {/* <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.wallet className="h-5 w-5" />
              Transaction Details
            </CardTitle>
          </CardHeader> */}
          <CardContent className="space-y-4 text-left">
            {/* Asset and Amount */}
            <div className="flex items-center justify-between bg-muted rounded-lg">
              <div>
                <p className="text-xs text-gray-dark uppercase tracking-wide">Amount</p>
                <p className="text-lg font-semibold">
                  {formatValue(txData.assignment.value, assetInfo?.precision || 0)} {assetInfo?.ticker || 'Unknown'}
                </p>
                {assetInfo?.name && (
                  <p className="text-sm text-muted-foreground">{assetInfo.name}</p>
                )}
              </div>
              <Badge variant="secondary">
                {txData.assignment.type}
              </Badge>
            </div>

            {/* Recipient */}
            <div>
              <label className="text-xs text-gray-dark uppercase tracking-wide">Recipient</label>
              <p className="text-sm font-mono break-all mt-1">
                {txData.recipient_id}
              </p>
            </div>

            {/* Asset ID */}
            <div>
              <label className="text-xs text-gray-dark uppercase tracking-wide">Asset ID</label>
              <p className="text-sm font-mono break-all mt-1">
                {txData.asset_id}
              </p>
            </div>

            {/* Fee Rate Selection */}
            <div>
              <label className="text-xs text-gray-dark uppercase tracking-wide">Fee Rate (sats/vB)  {txData.min_confirmations > 0 &&<Badge variant="outline" className="text-xs">
                    {txData.min_confirmations} confirmation
                  </Badge>}</label>
              <Tabs value={selectedFeeRate.toString()} onValueChange={(value) => setSelectedFeeRate(parseInt(value))} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="3" className="text-xs">
                    <div className="text-center">
                      <div className="font-semibold">Low</div>
                      <div className="text-xs text-muted-foreground">3 sats/vB</div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="5" className="text-xs">
                    <div className="text-center">
                      <div className="font-semibold">Medium</div>
                      <div className="text-xs text-muted-foreground">5 sats/vB</div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="7" className="text-xs">
                    <div className="text-center">
                      <div className="font-semibold">High</div>
                      <div className="text-xs text-muted-foreground">7 sats/vB</div>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Transport Endpoints */}
            <div>
              <label className="text-xs text-gray-dark uppercase tracking-wide">Transport Endpoints</label>
              <div className="mt-1 space-y-1">
                {txData.transport_endpoints.map((endpoint, index) => (
                  <p key={index} className="text-sm font-mono break-all text-muted-foreground">
                    {endpoint}
                  </p>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            {(txData.donation || txData.skip_sync) && (
              <div className="space-y-2">
                {txData.donation && (
                  <Badge variant="outline" className="text-xs">
                    Donation
                  </Badge>
                )}
                {txData.skip_sync && (
                  <Badge variant="outline" className="text-xs">
                    Skip Sync
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icons.check className="mr-2 h-4 w-4" />
                Confirm Transaction
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleReject}
            variant="outline"
            disabled={isLoading}
            className="w-full bg-white"
          >
            <Icons.x className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>

        {/* Warning */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By confirming this transaction, you agree to send the specified amount to the recipient.
            This action cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionConfirmation;
