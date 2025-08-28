import { useToast } from './useToast';

export const useToastActions = () => {
  const toast = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast.success({
      title,
      description,
    });
  };

  const showError = (title: string, description?: string) => {
    toast.error({
      title,
      description,
    });
  };

  const showWarning = (title: string, description?: string) => {
    toast.warning({
      title,
      description,
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast.info({
      title,
      description,
    });
  };

  const showTransferSuccess = (action: string) => {
    toast.success({
      title: `${action} Successful`,
      description: `Your ${action.toLowerCase()} has been completed successfully.`,
    });
  };

  const showTransferError = (action: string, error?: string) => {
    toast.error({
      title: `${action} Failed`,
      description: error || `Failed to ${action.toLowerCase()}. Please try again.`,
    });
  };

  const showNetworkError = () => {
    toast.error({
      title: 'Network Error',
      description: 'Unable to connect to the network. Please check your connection.',
    });
  };

  const showValidationError = (field: string) => {
    toast.error({
      title: 'Validation Error',
      description: `Please check the ${field} field and try again.`,
    });
  };

  const showCopiedToClipboard = (item: string) => {
    toast.success({
      title: 'Copied!',
      description: `${item} has been copied to clipboard.`,
    });
  };

  const showLoading = (action: string) => {
    return toast.info({
      title: `${action} in Progress`,
      description: `Please wait while we process your ${action.toLowerCase()}.`,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showTransferSuccess,
    showTransferError,
    showNetworkError,
    showValidationError,
    showCopiedToClipboard,
    showLoading,
    toast, // Expose the raw toast functions
  };
};

