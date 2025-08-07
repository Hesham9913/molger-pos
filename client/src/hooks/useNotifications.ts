import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  icon?: string;
  style?: React.CSSProperties;
}

export const useNotifications = () => {
  const isInitialized = useRef(false);
  const showNotification = useCallback((
    message: string, 
    type: NotificationType = 'info', 
    options: NotificationOptions = {}
  ) => {
    const defaultOptions = {
      duration: 4000,
      position: 'top-right' as const,
      style: {
        background: '#363636',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '14px',
        padding: '12px 16px',
      },
    };

    const mergedOptions = { ...defaultOptions, ...options };

    switch (type) {
      case 'success':
        toast.success(message, mergedOptions);
        break;
      case 'error':
        toast.error(message, mergedOptions);
        break;
      case 'warning':
        toast(message, {
          ...mergedOptions,
          icon: '⚠️',
        });
        break;
      case 'info':
      default:
        toast(message, mergedOptions);
        break;
    }
  }, []);

  const showSuccess = useCallback((message: string, options?: NotificationOptions) => {
    showNotification(message, 'success', options);
  }, [showNotification]);

  const showError = useCallback((message: string, options?: NotificationOptions) => {
    showNotification(message, 'error', options);
  }, [showNotification]);

  const showWarning = useCallback((message: string, options?: NotificationOptions) => {
    showNotification(message, 'warning', options);
  }, [showNotification]);

  const showInfo = useCallback((message: string, options?: NotificationOptions) => {
    showNotification(message, 'info', options);
  }, [showNotification]);

  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);

  const initializeNotifications = useCallback(() => {
    if (isInitialized.current) {
      return; // Already initialized, skip
    }
    
    isInitialized.current = true;
    // Initialize any notification settings
    // This could include setting up sound notifications, etc.
    console.log('Notifications initialized');
  }, []);

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissAll,
    initializeNotifications,
  };
}; 