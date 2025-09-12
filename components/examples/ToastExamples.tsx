import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { useToastActions } from '@/hooks/useToastActions';

export const ToastExamples: React.FC = () => {
  const toast = useToast();
  const {
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
  } = useToastActions();

  const handleBasicToasts = () => {
    toast.success({
      title: 'Success Toast',
      description: 'This is a success message with custom styling.',
    });

    toast.error({
      title: 'Error Toast',
      description: 'This is an error message with custom styling.',
    });

    toast.warning({
      title: 'Warning Toast',
      description: 'This is a warning message with custom styling.',
    });

    toast.info({
      title: 'Info Toast',
      description: 'This is an info message with custom styling.',
    });
  };

  const handleUtilityToasts = () => {
    showTransferSuccess('Asset Transfer');
    showTransferError('Payment Processing', 'Insufficient funds');
    showNetworkError();
    showValidationError('email address');
    showCopiedToClipboard('Wallet Address');
  };

  const handleToastWithAction = () => {
    toast.error({
      title: 'Connection Failed',
      description: 'Unable to connect to the server.',
      action: {
        label: 'Retry',
        onClick: () => {
          toast.success('Retrying connection...');
        },
      },
    });
  };

  const handleLoadingToast = () => {
    const loadingToast = showLoading('Transaction Processing');
    
    // Simulate async operation
    setTimeout(() => {
      toast.dismiss(loadingToast);
      showTransferSuccess('Transaction');
    }, 3000);
  };

  const handleCustomDuration = () => {
    toast.success({
      title: 'Quick Success',
      description: 'This toast will disappear in 2 seconds.',
      duration: 2000,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Toast Notification Examples</CardTitle>
          <CardDescription>
            Click the buttons below to see different types of toast notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleBasicToasts} variant="outline">
              Basic Toast Types
            </Button>
            <Button onClick={handleUtilityToasts} variant="outline">
              Utility Toasts
            </Button>
            <Button onClick={handleToastWithAction} variant="outline">
              Toast with Action
            </Button>
            <Button onClick={handleLoadingToast} variant="outline">
              Loading Toast
            </Button>
            <Button onClick={handleCustomDuration} variant="outline">
              Custom Duration
            </Button>
            <Button 
              onClick={() => toast.toast('Simple message toast')} 
              variant="outline"
            >
              Simple Toast
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Individual Toast Examples</CardTitle>
          <CardDescription>
            Test individual toast types.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => showSuccess('Success!', 'Operation completed successfully.')}
            className="bg-green-600 hover:bg-green-700"
          >
            Success
          </Button>
          <Button 
            onClick={() => showError('Error!', 'Something went wrong.')}
            variant="destructive"
          >
            Error
          </Button>
          <Button 
            onClick={() => showWarning('Warning!', 'Please check your input.')}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Warning
          </Button>
          <Button 
            onClick={() => showInfo('Info!', 'Here is some information.')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Info
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};











