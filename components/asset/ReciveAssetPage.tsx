import { useForm } from 'react-hook-form';
// import { useRLNState, useRLNApi } from '@/hooks/useRouteData';
// import { ListAssetsResponse } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMemo, useState, useEffect } from 'react';

import QRCode from 'react-qr-code';
import { Copy } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { nodeService } from '@/services/nodeService';
import { walletService } from '@/services/walletService';
import { useListAssets } from '@/hooks/useWalletQueries';
import axios from 'axios';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { RgbInvoiceResponse } from 'rgb-webln-sdk';

interface ReceiveAssetForm {
  asset_id?: string;
  amount?: number;
  expiration: string;
  blind: boolean;
  witness: boolean;
}

export default function ReceiveAssetPage() {
  const [blind, setBlind] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<string | null>(null);

  // React Query hook
  const {
    data: assetsData,
    isLoading: assetsLoading,
    error: assetsError
  } = useListAssets();

  const { asset_id } = useParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const assetOptions = useMemo(() => {
    if (!assetsData) return [];
    return [...(assetsData.nia ?? []), ...(assetsData.uda ?? []), ...(assetsData.cfa ?? []), ...(assetsData.ifa ?? [])];
  }, [assetsData]);

  const asset = useMemo(() => {
    if (!asset_id || !assetOptions.length) return null;
    return assetOptions.find((a) => a.asset_id === asset_id);
  }, [asset_id, assetOptions])

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ReceiveAssetForm>({
    defaultValues: {
      expiration: '3600',
      blind: false,
      witness: false,
      amount: undefined,
      asset_id: undefined
    },
  });

  useEffect(() => {
    if (!asset) {
      setBlind(true);
      setValue('blind', true);
    } else {
      setBlind(false);
      setValue('blind', false);
    }
  }, [asset, setValue]);
  const witness = watch("witness");
  const navigate = useNavigate();
  const onSubmit = async (data: ReceiveAssetForm) => {
    setErrorMessage(null);

    // Validate required fields
    if (!data.expiration) {
      setErrorMessage('Expiration time is required');
      return;
    }

    if (!data.blind && !asset?.asset_id) {
      setErrorMessage('Asset is required for non-blind invoices');
      return;
    }

    if (!data.blind && !data.amount) {
      setErrorMessage('Amount is required for non-blind invoices');
      return;
    }

    try {
      const body: any = {
        duration_seconds: parseInt(data.expiration || '3600', 10),
        witness: Boolean(data.witness),
        blind: Boolean(data.blind),
      };
      if (!data.blind && asset?.asset_id && data.amount) {
        body.asset_id = asset.asset_id;
        body.amount = Number(data.amount);
      }

      // Show confirmation popup
      try {
        const res = await walletService.openInvoiceGenerationConfirmationPopup(body) as RgbInvoiceResponse;
        if (res && res.invoice) {
          setInvoice(res.invoice);
        } else {
          throw new Error('Invalid response from invoice generation popup');
        }
      } catch (popupError: any) {
        console.error('Popup error:', popupError);
        throw new Error(`Popup error: ${popupError.message || 'Unknown popup error'}`);
      }
    } catch (error: any) {
      let message = error.message || 'Failed to connect to node';
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        // Check known shape
        if (typeof data === 'object' && data !== null) {
          message =
            data.error ||  // your custom backend error string
            data.message ||  // fallback (if using other APIs)
            error.response?.statusText ||
            'Unknown error';
        }
      }
      setErrorMessage(`Error: ${message}`);
    }
  };

  const copyToClipboard = async () => {
    if (invoice) {
      await navigator.clipboard.writeText(invoice);
    }
  };

  const handleDone = () => {
    setInvoice(null);
    navigate(asset_id ? `/wallet/asset/${asset_id}` : `/wallet`);
  }

  if (invoice) {
    return (
      <div className="flex-1 w-full h-full space-y-6 px-6 w-full">
        <Card className='rounded-lg shadow-md'>
          <CardContent className="p-6 space-y-4 flex flex-col items-center">
            <div className="text-lg font-semibold">Your RGB Invoice</div>
            <QRCode value={invoice} className="h-full w-full max-w-64 max-h-64" />
            <div className="w-full flex items-center gap-2">
              <Input readOnly value={invoice} className="w-full font-mono" />
              <Button size="icon" variant="outline" className='size-12' onClick={copyToClipboard}>
                <Copy className="w-5 h-5" />
              </Button>
            </div>

          </CardContent>
        </Card>
        <Button onClick={handleDone} className='absolute bottom-4 left-4 right-4 font-semibold h-10'>DONE</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 w-full h-full space-y-6 px-6 w-full">
      <Card className='rounded-lg shadow-md'>
        <CardContent className="px-6 space-y-6">

          <div className="flex items-center space-x-2">
            <Switch
              disabled={!asset_id}
              id="blind"
              checked={blind || false}
              onCheckedChange={(v) => {
                if (!asset_id) return; // Prevent toggling when disabled
                setBlind(v);
                setValue('blind', v);
              }}
            />
            <Label htmlFor="blind">Blind</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="witness"
              checked={witness || false}
              onCheckedChange={(v) => {
                setValue('witness', v);
              }}
            />
            <Label htmlFor="witness">Witness</Label>
          </div>

          {!blind && (
            <div className="space-y-2">
              <Label htmlFor="asset_id">Asset</Label>
              {asset ? (
                <div className="relative z-50 text-left">
                  <div className="text-lg font-semibold">{asset.name || 'Unknown Asset'}</div>
                  <div className="text-sm text-muted-foreground break-all">{asset.asset_id || 'No Asset ID'}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No asset selected</div>
              )}
              {/* <Select onValueChange={(val) => setValue('asset_id', val)} > */}
              {/* <Select onValueChange={console.log}>
                    <SelectTrigger id="asset_id">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {assetOptions.map((a) => (
                        <SelectItem key={a.asset_id} value={a.asset_id}>
                          {a.ticker ?? a.name} ({a.asset_id.slice(0, 8)}…)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select> */}

              {errors.asset_id && <p className="text-sm text-destructive">{errors.asset_id.message}</p>}
            </div>
          )}

          {!blind && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0.00"
                {...register('amount', {
                  required: !blind,
                  min: { value: 0.00000001, message: 'Must be > 0' },
                })}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="expiration">Invoice Expiry</Label>
            <Tabs
              defaultValue="3600"
              onValueChange={(val) => setValue("expiration", val)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="3600">1 Hour</TabsTrigger>
                <TabsTrigger value="21600">6 Hours</TabsTrigger>
                <TabsTrigger value="86400">1 Day</TabsTrigger>
                <TabsTrigger value="172800">2 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>




        </CardContent>

      </Card>
      {errorMessage && (
        <div className="text-sm text-destructive pt-2 mb-4">{errorMessage}</div>
      )}
      <Button className='absolute bottom-4 left-4 right-4 font-semibold h-10 ' type="submit" disabled={isSubmitting}>Generate Invoice</Button>
    </form>
  );
}
