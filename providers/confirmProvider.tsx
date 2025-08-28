import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

interface ConfirmProviderProps {
  children: React.ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolve, setResolve] = useState<(value: boolean) => void>(() => {});

  const confirm = useCallback((confirmOptions: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolvePromise) => {
      setOptions(confirmOptions);
      setResolve(() => resolvePromise);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolve(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolve(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      resolve(false);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {options.title || 'Confirm Action'}
            </DialogTitle>
            {options.description && (
              <DialogDescription>
                {options.description}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              {options.cancelText || 'Cancel'}
            </Button>
            <Button
              variant={options.variant || 'default'}
              onClick={handleConfirm}
            >
              {options.confirmText || 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
};

