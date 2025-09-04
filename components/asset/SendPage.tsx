import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo, useEffect } from 'react';
import { InvoiceDecoded } from '@/types/rgb-types';
import { nodeService } from '@/services/nodeService';
import { walletService } from '@/services/walletService';
import { useListAssets } from '@/hooks/useWalletQueries';
import z from 'zod';
import { TXIdResponse } from 'rgb-webln-sdk';

const schema = z.object({
  invoice: z.string().min(1, 'Invoice is required').startsWith('rgb:', 'Must start with rgb:'),
  amount: z
    .union([z.string(), z.number()])
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  fee: z.string(),
  donation: z.boolean(),
});
type SendAssetForm = z.infer<typeof schema>;

export default function SendAssetPage() {
  const location = useLocation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SendAssetForm>({
    defaultValues: { donation: false, fee: 'medium' },
  });
  const { asset_id } = useParams();
  const navigate = useNavigate();
  
  // React Query hook
  const { 
    data: assetsData, 
    isLoading: assetsLoading, 
    error: assetsError 
  } = useListAssets();
  
  const [donation, setDonation] = useState(false);
  const [prefilledAmount, setPrefilledAmount] = useState<number | null>(null);
  const [decodedInvoice, setDecodedInvoice] = useState<InvoiceDecoded | null>(null);
  const [txid, setTxid] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const invoiceVal = watch('invoice');
  const initialInvoice = (location.state as any)?.invoice as string | undefined;
  const [selectedAssetId, setSelectedAssetId] = useState(asset_id || '');

  const asset = useMemo(() => {
    if (!assetsData || !selectedAssetId) return null;
    const all = [...(assetsData.nia ?? []), ...(assetsData.uda ?? []), ...(assetsData.cfa ?? [])];
    return all.find((a) => a.asset_id === selectedAssetId);
  }, [assetsData, selectedAssetId]);

  const allAssets = useMemo(() => {
    if (!assetsData) return [];
    return [...(assetsData.nia ?? []), ...(assetsData.uda ?? []), ...(assetsData.cfa ?? [])];
  }, [assetsData]);

  useEffect(() => {
    if (asset_id && !asset && allAssets.length > 0) {
      setSelectedAssetId(allAssets[0].asset_id);
    }
  }, [asset_id, asset, allAssets]);

  useEffect(() => {
    if (initialInvoice && !invoiceVal) {
      setValue('invoice', initialInvoice);
    }
    const decode = async () => {
      if (!invoiceVal) return;
      if (!invoiceVal.startsWith('rgb:')) return;
      try {
        const data = await nodeService.decodergbinvoice({
          invoice: invoiceVal,
        })
        if (!data) {
          setErrorMsg('Invalid RGB invoice format');
          return;
        }

        setDecodedInvoice(data);

        if (data.asset_id === selectedAssetId && data.assignment?.value) {
          const value = data.assignment.value;
          setValue('amount', value);
          setPrefilledAmount(value);
        } else {
          setPrefilledAmount(null);
        }
        setErrorMsg(null);
      } catch (err: any) {
        console.error('Failed to decode invoice:', err);
        setDecodedInvoice(null);
        setPrefilledAmount(null);
        setErrorMsg('Failed to decode RGB invoice');
      }
    };

    decode();
  }, [invoiceVal, selectedAssetId, setValue]);


  const onSubmit = async (data: SendAssetForm) => {
    console.log('Submitting send asset form:', data);
    if (!decodedInvoice) {
      setError('invoice', { type: 'manual', message: 'Invalid or missing decoded invoice' });
      return;
    }

    try {
      // Prepare transaction data
      const transactionData = {
        assignment: {
          type: "Fungible",
          value: +data.amount as number, // Ensure amount is a number
        },
        asset_id: selectedAssetId,
        recipient_id: decodedInvoice.recipient_id,
        transport_endpoints: decodedInvoice.transport_endpoints,
        min_confirmations: 1,
        donation: data.donation,
        fee_rate: data.fee === 'low' ? 2 : data.fee === 'high' ? 10 : 5,
        skip_sync: false,
      };

      // Show confirmation popup
      const response = await walletService.openTransactionConfirmationPopup(transactionData);
      console.log('Transaction response:', response);
      setTxid(response.txid);
      setErrorMsg(null);
    } catch (err: any) {
      console.error('Send asset failed:', err);
      setError('invoice', { type: 'manual', message: err.message || 'Send asset failed' });
      setTxid(null);
    }
  };
  const handleDone = () => {
    setTxid(null);
    navigate(`/wallet/asset/${selectedAssetId}`);
  }
  if (!assetsData) return <div className="p-6">Loading assets...</div>;

  if (!asset && allAssets.length === 0) return <div className="p-6 text-destructive">No assets found</div>;

  if (!asset && allAssets.length > 0) {
    return (
      <div className="flex-1 w-full h-full space-y-6 px-6">
        <Card className='rounded-lg shadow-md'>
          <CardContent className="space-y-6">
            <div className="space-y-2 w-full">
              <Label className='text-gray-dark uppercase text-xs' htmlFor="asset">Select Asset</Label>
              <Select  value={selectedAssetId} onValueChange={(value) => setSelectedAssetId(value)}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Choose an asset to send" />
                </SelectTrigger>
                <SelectContent>
                  {allAssets.map((asset) => (
                    <SelectItem key={asset.asset_id} value={asset.asset_id}>
                      {asset.name || asset.ticker || asset.asset_id} ({asset.ticker || 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => navigate(`/wallet/send/${selectedAssetId}`)} className='w-full font-semibold h-10'>
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!asset) return <div className="p-6 text-destructive">Asset not found</div>;

  const formattedBalance = (asset.balance.spendable / Math.pow(10, asset.precision)).toLocaleString();


  if (txid) {
    return (
      <div className="p-6 space-y-4">
        <Card>
          <CardContent className="space-y-2">
            <h2 className="text-xl font-bold">✅ Transaction Sent</h2>
            <p className="break-all">Tx ID: {txid}</p>
            <Button onClick={handleDone}>Done</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="flex-1 w-full h-full space-y-6 px-6 w-full">
      <Card className='rounded-lg shadow-md'>
        <CardContent className=" space-y-2">
          <div className="text-2xl font-semibold">{asset.name}</div>
          <div className="text-sm text-muted-foreground break-all">{asset.asset_id}</div>
          <div className="text-xl font-bold">
            {formattedBalance} {asset.ticker ?? '—'}
          </div>
        </CardContent>
      </Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className='rounded-lg shadow-md'>
        <CardContent className="space-y-6">
        
            <div className="space-y-2">
              <Label htmlFor="invoice">Invoice</Label>
              <Input
                id="invoice"
                placeholder="Enter RGB invoice..."
                {...register('invoice', {
                  required: 'Invoice is required',
                  validate: value => value.startsWith('rgb:') || 'Invalid RGB invoice',
                })}
              />
              {errors.invoice && <p className="text-destructive text-sm">{errors.invoice.message}</p>}
              {errorMsg && <p className="text-destructive text-sm">{errorMsg}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                disabled={prefilledAmount !== null}
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.00000001, message: 'Amount must be greater than zero' },
                })}
              />
              {errors.amount && <p className="text-destructive text-sm">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Fee</Label>
              <Tabs className="w-full" defaultValue="medium" onValueChange={(val) => setValue('fee', val)}>
                <TabsList className='w-full'>
                  <TabsTrigger value="low">Low</TabsTrigger>
                  <TabsTrigger value="medium">Medium</TabsTrigger>
                  <TabsTrigger value="high">High</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="donation" checked={donation} onCheckedChange={(val) => {
                setDonation(val);
                setValue('donation', val);
              }} />
              <Label htmlFor="donation">Donation</Label>
            </div>

           
          
        </CardContent>
      </Card>
       {errorMsg && (
        <div className="text-sm text-destructive pt-2 mb-4">{errorMsg}</div>)}
      <Button type="submit" disabled={isSubmitting} className='absolute bottom-4 left-4 right-4 font-semibold h-10 '>
              {isSubmitting ? 'Sending...' : 'Send'}
            </Button>
      </form>
    </div>
  );
}
