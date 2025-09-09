import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useToastActions } from '@/hooks/useToastActions';
import { nodeService } from '@/services/nodeService';
import { closeWindow } from '@/utils';

interface InvoiceGenerationConfirmationProps {
  invoiceData?: {
    asset_id?: string;
    amount?: number;
    duration_seconds: number;
    witness: boolean;
    blind?: boolean;
  };
}

export const InvoiceGenerationConfirmation: React.FC<InvoiceGenerationConfirmationProps> = ({ 
  invoiceData 
}) => {
  const [searchParams] = useSearchParams();
  const { showTransferSuccess, showTransferError } = useToastActions();
  const [isLoading, setIsLoading] = useState(false);
  const [assetInfo, setAssetInfo] = useState<any>(null);

  // Get invoice data from URL params if not provided directly
  const getInvoiceData = () => {
    if (invoiceData) return invoiceData;
    
    const assetId = searchParams.get('asset_id');
    const amount = searchParams.get('amount');
    const durationSeconds = searchParams.get('duration_seconds');
    const witness = searchParams.get('witness');
    const blind = searchParams.get('blind');
    
    console.log('URL params:', { assetId, amount, durationSeconds, witness, blind });
    
    if (!durationSeconds || witness === null) {
      console.error('Missing required params: durationSeconds or witness');
      return null;
    }

    // If no asset_id is provided, it should be treated as a blind invoice
    const isBlind = blind === 'true' || (!assetId && !amount);
    
    return {
      asset_id: assetId || undefined,
      amount: amount ? parseInt(amount) : undefined,
      duration_seconds: parseInt(durationSeconds),
      witness: witness === 'true',
      blind: isBlind
    };
  };

  const invData = getInvoiceData();

  // Fetch asset info if asset_id is provided
  React.useEffect(() => {
    if (invData?.asset_id) {
      const fetchAssetInfo = async () => {
        try {
          const assets = await nodeService.listassets();
          const asset = assets.nia.find((a: any) => a.asset_id === invData.asset_id);
          if (asset) {
            setAssetInfo(asset);
          }
        } catch (error) {
          console.error('Failed to fetch asset info:', error);
        }
      };
      fetchAssetInfo();
    }
  }, [invData?.asset_id]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatValue = (value: number, precision: number = 0) => {
    return (value / Math.pow(10, precision)).toLocaleString();
  };

  const handleConfirm = async () => {
    if (!invData) return;

    setIsLoading(true);
    try {
      let result;
      // For blind invoices, we don't need asset_id
      if (invData.blind) {
        result = await nodeService.rgbinvoice({
          asset_id: undefined,
          amount: undefined,
          duration_seconds: invData.duration_seconds,
          min_confirmations: 1,
          witness: invData.witness
        });
      } else {
        // For non-blind invoices, asset_id is required
        if (!invData.asset_id) {
          throw new Error('Asset ID is required for non-blind invoices');
        }
        result = await nodeService.rgbinvoice({
          asset_id: invData.asset_id,
          amount: invData.amount,
          duration_seconds: invData.duration_seconds,
          min_confirmations: 1,
          witness: invData.witness
        });
      }
      
      // Send success message to background script
      if (typeof browser !== 'undefined' && browser.runtime) {
        browser.runtime.sendMessage({ 
          type: 'invoice-generation-response', 
          success: true, 
          result 
        });
      } else {
        console.warn('Browser runtime not available');
      }
      
      showTransferSuccess('Invoice generated successfully');
      
      // Close popup after a short delay
      closeWindow()
      
    } catch (error: any) {
      console.error('Invoice generation failed:', error);
      showTransferError(error.message || 'Invoice generation failed');
      
      // Send error message to background script
      if (typeof browser !== 'undefined' && browser.runtime) {
        browser.runtime.sendMessage({ 
          type: 'invoice-generation-response', 
          success: false, 
          error: error.message 
        });
      } else {
        console.warn('Browser runtime not available');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Send cancellation message to background script
    if (typeof browser !== 'undefined' && browser.runtime) {
      browser.runtime.sendMessage({ 
        type: 'invoice-generation-response', 
        success: false, 
        error: 'Invoice generation cancelled by user' 
      });
    } else {
      console.warn('Browser runtime not available');
    }
    
    // Show cancellation message before closing
    showTransferError('Invoice generation cancelled');
    
    // Close popup after a short delay
    closeWindow()
  };

  if (!invData) {
    return (
              <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Icons.circleAlert className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Invalid Invoice Data</h2>
        <p className="text-muted-foreground text-center mb-4">
          The invoice generation data is missing or invalid.
        </p>
        <Button onClick={() => {
          closeWindow()
        }}>
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
          <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.wallet className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Generate Invoice</h1>
          <p className="text-gray-dark">
            Review the invoice details before generating
          </p>
        </div>

        {/* Invoice Details */}
        <Card className='rounded-lg shadow-md'>
          {/* <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.wallet className="h-5 w-5" />
              Invoice Details
            </CardTitle>
          </CardHeader> */}
          <CardContent className="space-y-4">
            {/* Asset Information */}
            {invData.asset_id && assetInfo && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-dark uppercase tracking-wide">Asset</p>
                    <p className="font-semibold">{assetInfo.name}</p>
                    <p className="text-sm text-muted-foreground">{assetInfo.ticker}</p>
                  </div>
                  <Badge variant="secondary">
                    {assetInfo.asset_id.slice(0, 8)}...
                  </Badge>
                </div>
              </div>
            )}

            {/* Amount */}
            {invData.amount && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-dark uppercase tracking-wide">Amount</span>
                <span className="font-semibold">
                  {formatValue(invData.amount, assetInfo?.precision || 0)} {assetInfo?.ticker || 'units'}
                </span>
              </div>
            )}

            {/* Duration */}
            <div className="flex items-center justify-between">
              <span className="ttext-xs text-gray-dark uppercase tracking-wide">Expiration</span>
              <span className="font-semibold">{formatDuration(invData.duration_seconds)}</span>
            </div>

            {/* Type */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-dark uppercase tracking-wide">Type</span>
              <div className="flex gap-2">
                {invData.blind && <Badge variant="outline">Blind</Badge>}
                {invData.witness && <Badge variant="outline">Witness</Badge>}
                {!invData.blind && !invData.witness && <Badge variant="outline">Standard</Badge>}
              </div>
            </div>

            {/* Blind Invoice Warning */}
            {invData.blind && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Icons.circleAlert className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Blind Invoice</p>
                    <p>This is a blind invoice. The sender won't know the asset or amount until they pay.</p>
                  </div>
                </div>
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
                Generating...
              </>
            ) : (
              <>
                <Icons.wallet className="mr-2 h-4 w-4" />
                Generate Invoice
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleCancel}
            variant="outline"
            disabled={isLoading}
            className="w-full bg-white"
          >
            <Icons.x className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>

        {/* Info Note */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This will generate an RGB invoice that can be shared with others to receive payments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerationConfirmation;

