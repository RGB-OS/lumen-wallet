import { z } from 'zod';

// Base schemas
export const addressSchema = z
  .string()
  .min(26, 'Address must be at least 26 characters')
  .max(35, 'Address must be at most 35 characters')
  .regex(/^[a-zA-Z0-9]+$/, 'Address must contain only alphanumeric characters');

export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .max(1000000, 'Amount cannot exceed 1,000,000');

export const assetIdSchema = z
  .string()
  .regex(/^rgb:[a-zA-Z0-9-]+$/, 'Invalid asset ID format');

export const feeRateSchema = z
  .number()
  .min(1, 'Fee rate must be at least 1')
  .max(1000, 'Fee rate cannot exceed 1000');

// Transfer schemas
export const transferSchema = z.object({
  assetId: assetIdSchema,
  amount: amountSchema,
  recipient: addressSchema,
  feeRate: feeRateSchema.optional().default(5),
});

export const createUTXOSchema = z.object({
  num: z.number().int().min(1).max(100),
  size: z.number().int().min(1000).max(1000000),
  feeRate: feeRateSchema,
  upTo: z.boolean().optional().default(false),
  skipSync: z.boolean().optional().default(false),
});

// Asset schemas
export const assetSchema = z.object({
  assetId: assetIdSchema,
  ticker: z.string().min(1).max(10).optional(),
  name: z.string().min(1).max(100).optional(),
  precision: z.number().int().min(0).max(18).optional(),
});

// Wallet schemas
export const walletAddressSchema = z.object({
  address: addressSchema,
  network: z.enum(['mainnet', 'testnet', 'regtest']),
});

// Form validation schemas
export const sendAssetFormSchema = z.object({
  assetId: assetIdSchema,
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 1000000;
  }, 'Please enter a valid amount between 0 and 1,000,000'),
  recipient: addressSchema,
  feeRate: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 1000;
  }, 'Please enter a valid fee rate between 1 and 1000'),
});

export const createUTXOFormSchema = z.object({
  num: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 100;
  }, 'Please enter a valid number between 1 and 100'),
  size: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1000 && num <= 1000000;
  }, 'Please enter a valid size between 1,000 and 1,000,000'),
  feeRate: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 1000;
  }, 'Please enter a valid fee rate between 1 and 1000'),
});

// Utility functions
export function validateAddress(address: string): { isValid: boolean; error?: string } {
  try {
    addressSchema.parse(address);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid address format' };
  }
}

export function validateAmount(amount: number): { isValid: boolean; error?: string } {
  try {
    amountSchema.parse(amount);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid amount' };
  }
}

export function validateAssetId(assetId: string): { isValid: boolean; error?: string } {
  try {
    assetIdSchema.parse(assetId);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid asset ID format' };
  }
}

// Type exports
export type TransferData = z.infer<typeof transferSchema>;
export type CreateUTXOData = z.infer<typeof createUTXOSchema>;
export type AssetData = z.infer<typeof assetSchema>;
export type WalletAddressData = z.infer<typeof walletAddressSchema>;
export type SendAssetFormData = z.infer<typeof sendAssetFormSchema>;
export type CreateUTXOFormData = z.infer<typeof createUTXOFormSchema>;









