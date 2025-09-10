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
      />
    </>
  );
};

