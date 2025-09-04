import { useState, useCallback } from 'react';
import { z } from 'zod';
import { useToastActions } from './useToastActions';

interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export function useValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showValidationError } = useToastActions();

  const validate = useCallback((data: unknown): ValidationResult<T> => {
    try {
      const validatedData = schema.parse(data);
      setErrors({});
      return { isValid: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        
        error.errors.forEach((err) => {
          const field = err.path.join('.');
          fieldErrors[field] = err.message;
        });
        
        setErrors(fieldErrors);
        
        // Show first error in toast
        const firstError = Object.values(fieldErrors)[0];
        if (firstError) {
          showValidationError('form');
        }
        
        return { isValid: false, errors: fieldErrors };
      }
      
      return { isValid: false, errors: { general: 'Validation failed' } };
    }
  }, [schema, showValidationError]);

  const validateField = useCallback((field: string, value: unknown): boolean => {
    try {
      // Create a partial schema for the specific field
      const fieldSchema = z.object({ [field]: schema.shape[field as keyof T] });
      fieldSchema.parse({ [field]: value });
      
      // Clear field error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => err.path[0] === field);
        if (fieldError) {
          setErrors(prev => ({ ...prev, [field]: fieldError.message }));
        }
      }
      return false;
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return errors[field];
  }, [errors]);

  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    validate,
    validateField,
    clearErrors,
    getFieldError,
    hasErrors,
    errors,
  };
}





