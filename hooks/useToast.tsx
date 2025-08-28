import { toast as sonnerToast, type ToastT } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  const toast = (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      return sonnerToast(options);
    }

    const { title, description, duration = 4000, action } = options;

    if (action) {
      return sonnerToast(title || 'Notification', {
        description,
        duration,
        action: {
          label: action.label,
          onClick: action.onClick,
        },
      });
    }

    return sonnerToast(title || 'Notification', {
      description,
      duration,
    });
  };

  const success = (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      return sonnerToast.success(options);
    }

    const { title, description, duration = 4000, action } = options;

    if (action) {
      return sonnerToast.success(title || 'Success', {
        description,
        duration,
        action: {
          label: action.label,
          onClick: action.onClick,
        },
      });
    }

    return sonnerToast.success(title || 'Success', {
      description,
      duration,
    });
  };

  const error = (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      return sonnerToast.error(options);
    }

    const { title, description, duration = 4000, action } = options;

    if (action) {
      return sonnerToast.error(title || 'Error', {
        description,
        duration,
        action: {
          label: action.label,
          onClick: action.onClick,
        },
      });
    }

    return sonnerToast.error(title || 'Error', {
      description,
      duration,
    });
  };

  const warning = (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      return sonnerToast.warning(options);
    }

    const { title, description, duration = 4000, action } = options;

    if (action) {
      return sonnerToast.warning(title || 'Warning', {
        description,
        duration,
        action: {
          label: action.label,
          onClick: action.onClick,
        },
      });
    }

    return sonnerToast.warning(title || 'Warning', {
      description,
      duration,
    });
  };

  const info = (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      return sonnerToast.info(options);
    }

    const { title, description, duration = 4000, action } = options;

    if (action) {
      return sonnerToast.info(title || 'Info', {
        description,
        duration,
        action: {
          label: action.label,
          onClick: action.onClick,
        },
      });
    }

    return sonnerToast.info(title || 'Info', {
      description,
      duration,
    });
  };

  const dismiss = (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  };

  const dismissAll = () => {
    sonnerToast.dismiss();
  };

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };
};