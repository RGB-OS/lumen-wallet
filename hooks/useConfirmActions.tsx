import { useConfirm } from '@/providers/confirmProvider';

export const useConfirmActions = () => {
  const { confirm } = useConfirm();

  const confirmDelete = async (itemName: string) => {
    return await confirm({
      title: 'Delete Confirmation',
      description: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
  };

  const confirmCancel = async (actionName: string) => {
    return await confirm({
      title: 'Cancel Confirmation',
      description: `Are you sure you want to cancel this ${actionName}? This action cannot be undone.`,
      confirmText: 'Cancel',
      cancelText: 'Keep',
      variant: 'destructive',
    });
  };

  const confirmAction = async (title: string, description: string, confirmText = 'Confirm', cancelText = 'Cancel') => {
    return await confirm({
      title,
      description,
      confirmText,
      cancelText,
      variant: 'default',
    });
  };

  const confirmDangerousAction = async (title: string, description: string, confirmText = 'Proceed', cancelText = 'Cancel') => {
    return await confirm({
      title,
      description,
      confirmText,
      cancelText,
      variant: 'destructive',
    });
  };

  return {
    confirmDelete,
    confirmCancel,
    confirmAction,
    confirmDangerousAction,
    confirm, // Expose the raw confirm function for custom use
  };
};

