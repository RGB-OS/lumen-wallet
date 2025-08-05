import { useForm } from 'react-hook-form';
// import { useRLNState, useRLNApi } from '@/hooks/useRouteData';
// import { ListAssetsResponse } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMemo, useState } from 'react';

import QRCode from 'react-qr-code';
import { Copy } from 'lucide-react';
import { ListAssetsResponse } from '@/types/rgb-types';
import { useRLNApi, useRLNState } from '@/providers/nodeProvider';
import { useNavigate, useParams } from 'react-router-dom';

interface ReceiveAssetForm {
  asset_id?: string;
  amount?: number;
  expiration: string;
  blind: boolean;
}

export default function ReceiveAssetPage() {
  const [blind, setBlind] = useState(false);
  const [invoice, setInvoice] = useState<string | null>(null);
  const assetsData = useRLNState<ListAssetsResponse>('listassets');
  const { fetchApi } = useRLNApi();
  const { asset_id } = useParams();
  
  const assetOptions = useMemo(() => {
    if (assetsData.status !== 'success' || !assetsData.data) return [];
    return [...(assetsData.data.nia ?? []), ...(assetsData.data.uda ?? []), ...(assetsData.data.cfa ?? [])];
  }, [assetsData.data]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ReceiveAssetForm>({
    defaultValues: { expiration: '3600', blind: false },
  });
  const navigate = useNavigate();
  const onSubmit = async (data: ReceiveAssetForm) => {
    try {
      const body: any = {
        duration_seconds: parseInt(data.expiration, 10),
      };
      if (!data.blind) {
        body.asset_id = data.asset_id;
        body.amount = data.amount;
      }

    //   const { data: result, error } = await fetchApi<{ invoice: string }>('rgbinvoice', 'POST', body);

    const error = null; // Simulating no error for this example
    const result={
        invoice:'rgb:nkHbmy97-R4cjRCe-j~VvT~E-0UQ0OW8-jOCCW6O-EqeCq9M/RWhwUfTMpuP2Zfx1~j4nswCANGeJrYOqDcKelaMV4zU/RddcT/bc:utxob:v9tb4ND2-1~zE7KG-_1U9WyJ-Zv2r7P5-VWQvAqr-vK20bbh-tCAi9?assignment_name=assetOwner&expiry=1754401124&endpoints=rpcs://proxy.iriswallet.com/0.2/json-rpc'
    }
      if (error || !result?.invoice) {
        // toast.error('Failed to generate invoice');
        return;
      }

      setInvoice(result.invoice);
    } catch (err) {
    //   toast.error('Something went wrong generating the invoice');
    }
  };

  const copyToClipboard = async () => {
    if (invoice) {
      await navigator.clipboard.writeText(invoice);
    //   toast.success('Invoice copied to clipboard');
    }
  };
  const handleDone = () => {
    setInvoice(null);
    navigate(`/wallet/asset/${asset_id}`);

  }

  if (invoice) {
    return (
      <div className="min-h-screen w-full bg-background">
        <Card>
          <CardContent className="p-6 space-y-4 flex flex-col items-center">
            <div className="text-lg font-semibold">Your RGB Invoice</div>
            <QRCode value={invoice} className="h-40 w-40" />
            <div className="w-full flex items-center gap-2">
              <Input readOnly value={invoice} className="w-full font-mono" />
              <Button size="icon" variant="outline" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={handleDone} className='w-full'>DONE</Button>
          </CardContent>
        </Card>

      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background p-6 space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch id="blind" checked={blind} onCheckedChange={(v) => { setBlind(v); setValue('blind', v); }} />
              <Label htmlFor="blind">Blind receive</Label>
            </div>

            {!blind && (
              <div className="space-y-2">
                <Label htmlFor="asset_id">Asset</Label>
                <Select onValueChange={(val) => setValue('asset_id', val)}>
                  <SelectTrigger id="asset_id">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetOptions.map((a) => (
                      <SelectItem key={a.asset_id} value={a.asset_id}>
                        {a.ticker ?? a.name} ({a.asset_id.slice(0, 8)}...)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Select onValueChange={(val) => setValue('expiration', val)} defaultValue="3600">
                <SelectTrigger id="expiration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3600">1 Hour</SelectItem>
                  <SelectItem value="21600">6 Hours</SelectItem>
                  <SelectItem value="86400">1 Day</SelectItem>
                  <SelectItem value="172800">2 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isSubmitting}>Generate Invoice</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
