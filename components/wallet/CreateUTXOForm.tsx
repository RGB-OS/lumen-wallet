import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { useCreateUTXOs } from '@/hooks/useWalletQueries';

interface CreateUTXOFormProps {
  onSuccess: () => void;
}

export const CreateUTXOForm: React.FC<CreateUTXOFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    num: 4,
    size: 32500,
    fee_rate: 5,
  });
  const { toast } = useToast();
  const createUTXOsMutation = useCreateUTXOs();

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.num <= 0) {
      toast({
        title: "Invalid Input",
        description: "Number of UTXOs must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (formData.size <= 0) {
      toast({
        title: "Invalid Input",
        description: "UTXO size must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (formData.fee_rate <= 0) {
      toast({
        title: "Invalid Input",
        description: "Fee rate must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    createUTXOsMutation.mutate({
      up_to: false,
      num: formData.num,
      size: formData.size,
      fee_rate: formData.fee_rate,
      skip_sync: false,
    }, {
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        console.error('Failed to create UTXOs:', error);
        toast({
          title: "Error",
          description: "Failed to create UTXOs. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="num">Number of UTXOs</Label>
                      <Input
              id="num"
              type="number"
              min="1"
              value={formData.num}
              onChange={(e) => handleInputChange('num', e.target.value)}
              placeholder="4"
              disabled={createUTXOsMutation.isPending}
            />
          <p className="text-xs text-muted-foreground">
            Number of UTXOs to create
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">UTXO Size (sats)</Label>
                      <Input
              id="size"
              type="number"
              min="1"
              value={formData.size}
              onChange={(e) => handleInputChange('size', e.target.value)}
              placeholder="32500"
              disabled={createUTXOsMutation.isPending}
            />
          <p className="text-xs text-muted-foreground">
            Size of each UTXO in satoshis
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fee_rate">Fee Rate (sat/vB)</Label>
                      <Input
              id="fee_rate"
              type="number"
              min="1"
              value={formData.fee_rate}
              onChange={(e) => handleInputChange('fee_rate', e.target.value)}
              placeholder="5"
              disabled={createUTXOsMutation.isPending}
            />
          <p className="text-xs text-muted-foreground">
            Fee rate in satoshis per virtual byte
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
                  <Button 
            type="submit" 
            className="w-full" 
            disabled={createUTXOsMutation.isPending}
          >
            {createUTXOsMutation.isPending ? 'Creating UTXOs...' : 'Create UTXOs'}
          </Button>
      </div>
    </form>
  );
};
