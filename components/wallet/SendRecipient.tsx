import { useForm } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import z from 'zod';
import { nodeService } from '@/services/nodeService';

const schema = z.object({
  recipient: z.string().min(1, 'Invoice or BTC address is required')
});

type Form = z.infer<typeof schema>;

function isLikelyRgbInvoice(value: string): boolean {
  return value.startsWith('rgb:');
}

// Basic best-practice BTC address validation (covers legacy, P2SH, Bech32) without heavy libs
function isLikelyBitcoinAddress(value: string): boolean {
  // quick excludes
  if (value.length < 26 || value.length > 62) return false;
  const base58 = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  const bech32 = /^(bc1|tb1|bcrt1)[0-9ac-hj-np-z]{11,}$/; // human part + data; testnet/regtest included
  if (value.startsWith('1') || value.startsWith('3')) {
    return base58.test(value);
  }
  if (value.toLowerCase().startsWith('bc1') || value.toLowerCase().startsWith('tb1') || value.toLowerCase().startsWith('bcrt1')) {
    return bech32.test(value.toLowerCase());
  }
  return false;
}

export default function SendRecipient() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>();
  const value = watch('recipient') || '';

  const isValid = isLikelyRgbInvoice(value) || isLikelyBitcoinAddress(value);

  const onSubmit = async (data: Form) => {
    const input = data.recipient.trim();
    if (isLikelyRgbInvoice(input)) {
      try {
        const decoded = await nodeService.decodergbinvoice({ invoice: input });
        if (decoded?.asset_id) {
          navigate(`/wallet/send/${decoded.asset_id}`, { state: { invoice: input } });
        } else {
            console.log('decoded', decoded);
          // Fallback to generic send page if asset id missing
          navigate('/wallet/send', { state: { invoice: input } });
        }
        return;
      } catch (e) {
        // If decode fails, keep user on page; button remains enabled only by basic check
        return;
      }
    }
    if (isLikelyBitcoinAddress(input)) {
      navigate('/wallet/send-btc', { state: { address: input } });
      return;
    }
  };

  return (
    <div className="flex-1 w-full h-full space-y-6 px-6">
      <Card className='rounded-lg shadow-md'>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipient">Receiver</Label>
            <Input id="recipient" placeholder="Enter RGB invoice or BTC address" {...register('recipient')} />
            {errors.recipient && <p className="text-destructive text-sm">{errors.recipient.message}</p>}
          </div>
        </CardContent>
      </Card>
      <Button disabled={!isValid || isSubmitting} onClick={handleSubmit(onSubmit)} className='absolute bottom-4 left-4 right-4 font-semibold h-10'>
        Next
      </Button>
    </div>
  );
}


