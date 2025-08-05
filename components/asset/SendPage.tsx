import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useState, useMemo } from 'react';
import { useRLNState } from '@/providers/nodeProvider';
import { ListAssetsResponse } from '@/types/rgb-types';

interface SendAssetForm {
    invoice: string;
    amount: number;
    fee: string;
    donation: boolean;
  }
  
  export default function SendAssetPage() {
    const { asset_id } = useParams();
    const navigate = useNavigate();
    const [donation, setDonation] = useState(false);
    const assetsData = useRLNState<ListAssetsResponse>('listassets');
  
    const asset = useMemo(() => {
      if (assetsData.status !== 'success' || !assetsData.data || !asset_id) return null;
      const all = [...(assetsData.data.nia ?? []), ...(assetsData.data.uda ?? []), ...(assetsData.data.cfa ?? [])];
      return all.find((a) => a.asset_id === asset_id);
    }, [assetsData.data, asset_id]);
  
    const {
      register,
      handleSubmit,
      watch,
      setError,
      formState: { errors, isSubmitting }
    } = useForm<SendAssetForm>({
      defaultValues: { donation: false, fee: 'medium' },
    });
  
    const onSubmit = async (data: SendAssetForm) => {
      try {
        // simulate API call
  
        console.log('Sending asset with:', data);
        navigate(`/wallet/asset/${asset_id}`);
      } catch (err) {
        setError('invoice', { type: 'manual', message: 'Invalid RGB invoice' });
      }
    };
  
    if (!asset) return <div className="p-6 text-destructive">Asset not found</div>;
  
    const formattedBalance = (asset.balance.spendable / Math.pow(10, asset.precision)).toLocaleString();
  
    return (
      <div className="min-h-screen w-full bg-background ">
        <Card>
          <CardContent className=" space-y-2">
            <div className="text-2xl font-semibold">{asset.name}</div>
            <div className="text-sm text-muted-foreground break-all">{asset.asset_id}</div>
            <div className="text-xl font-bold">
              {formattedBalance} {asset.ticker ?? '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
        <CardContent className=" space-y-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice</Label>
            <Input
              id="invoice"
              placeholder="Enter RGB invoice..."
              {...register('invoice', {
                required: 'Invoice is required',
                validate: value => value.startsWith('rgb:') || 'Invalid RGB invoice'
              })}
            />
            {errors.invoice && <p className="text-destructive text-sm">{errors.invoice.message}</p>}
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0.00"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.00000001, message: 'Amount must be greater than zero' },
              })}
            />
            {errors.amount && <p className="text-destructive text-sm">{errors.amount.message}</p>}
          </div>
  
          <div className="space-y-2">
            <Label>Fee</Label>
            <Tabs defaultValue="medium" onValueChange={(val) => (watch('fee') === val)}>
              <TabsList>
                <TabsTrigger value="low">Low</TabsTrigger>
                <TabsTrigger value="medium">Medium</TabsTrigger>
                <TabsTrigger value="high">High</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
  
          <div className="flex items-center space-x-2">
            <Switch id="donation" checked={donation} onCheckedChange={setDonation} />
            <Label htmlFor="donation">Donation</Label>
          </div>
  
          <Button type="submit" disabled={isSubmitting}>Send</Button>
        </form>
        </CardContent>
        </Card>
      </div>
    );
  }
  