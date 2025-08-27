import { useState, useCallback } from 'react';

interface UseDrawerReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const useDrawer = (initialState = false): UseDrawerReturn => {
  const [open, setOpen] = useState(initialState);

  const openDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  return {
    open,
    setOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };
};
