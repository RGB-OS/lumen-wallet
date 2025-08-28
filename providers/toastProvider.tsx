import React from 'react';
import { Toaster } from 'sonner';

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        expand={true}
        richColors={true}
        closeButton={true}
        duration={4000}
        // toastOptions={{
        //   style: {
        //     background: 'hsl(var(--background))',
        //     color: 'hsl(var(--foreground))',
        //     border: '1px solid hsl(var(--border))',
        //   },
        // }}
      />
    </>
  );
};

