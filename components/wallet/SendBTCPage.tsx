import { useForm } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/nodeService';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  amount: z
    .union([z.string(), z.number()])
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  fee: z.string(),
});

type Form = z.infer<typeof schema>;

export default function SendBTCPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const address = (location.state as any)?.address as string | undefined;
  const [txid, setTxid] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
    defaultValues: { fee: 'medium' },
  });

  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (params: { amount: number; address: string; fee_rate: number; skip_sync: boolean }) => nodeService.sendbtc(params),
    onSuccess: (data) => {
      setTxid(data.txid);
      setIsSuccess(true);
      queryClient.invalidateQueries();
    }
  });

  const onSubmit = async (data: Form) => {
    if (!address) return;
    const fee_rate = data.fee === 'low' ? 2 : data.fee === 'high' ? 10 : 5;
    await mutateAsync({ amount: Number(data.amount), address, fee_rate, skip_sync: false });
  };

  const handleDone = () => {
    // Navigate back to main page with transaction info
    navigate('/wallet', { 
      state: { 
        showTransaction: true, 
        transaction: {
          txid: txid,
          type: 'BTC_Send',
          amount: (document.getElementById('amount') as HTMLInputElement)?.value,
          address: address
        }
      } 
    });
  };

  if (isSuccess && txid) {
    return (
      <div className="flex-1 w-full h-full space-y-6 px-6 flex flex-col items-center justify-center">
        <Card className='rounded-lg shadow-md max-w-md w-full'>
          <CardContent className="p-6 space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Bitcoin Sent Successfully!</h2>
              <p className="text-sm text-muted-foreground">Your transaction has been submitted to the network.</p>
            </div>
            <div className="space-y-2 text-left">
              <div>
                <label className="text-xs text-gray-dark uppercase tracking-wide">Transaction ID</label>
                <p className="text-sm font-mono break-all mt-1 bg-muted p-2 rounded">
                  {txid}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-dark uppercase tracking-wide">Amount</label>
                <p className="text-sm mt-1">{(document.getElementById('amount') as any)?.value} sats</p>
              </div>
              <div>
                <label className="text-xs text-gray-dark uppercase tracking-wide">To</label>
                <p className="text-sm font-mono break-all mt-1">{address}</p>
              </div>
            </div>
            <Button onClick={handleDone} className="w-full font-semibold h-10">
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full space-y-6 px-6">
      <Card className='rounded-lg shadow-md'>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>To</Label>
            <Input value={address || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (sats)</Label>
            <Input id="amount" type="number" step="1" {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be >= 1 sat' } })} />
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
        </CardContent>
      </Card>
      {error && <div className="text-sm text-destructive pt-2">{(error as any)?.message || 'Send BTC failed'}</div>}
      <Button disabled={isSubmitting || isPending || !address} onClick={handleSubmit(onSubmit)} className='absolute bottom-4 left-4 right-4 font-semibold h-10'>
        {isPending ? 'Sending...' : 'Send BTC'}
      </Button>
    </div>
  );
}


