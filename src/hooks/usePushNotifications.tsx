import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from 'sonner';

interface PushNotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  permission: NotificationPermission;
  registration: ServiceWorkerRegistration | null;
}

export const usePushNotifications = () => {
  const { isAdmin } = useAdmin();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isEnabled: false,
    permission: 'default',
    registration: null,
  });
  const [loading, setLoading] = useState(false);

  // Check if push notifications are supported
  useEffect(() => {
    const isSupported = 'serviceWorker' in navigator && 'Notification' in window;
    setState(prev => ({ 
      ...prev, 
      isSupported,
      permission: isSupported ? Notification.permission : 'denied'
    }));

    if (isSupported && isAdmin) {
      registerServiceWorker();
    }
  }, [isAdmin]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[Push] Service Worker registered:', registration);
      
      setState(prev => ({ 
        ...prev, 
        registration,
        isEnabled: Notification.permission === 'granted'
      }));
    } catch (error) {
      console.error('[Push] Service Worker registration failed:', error);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    setLoading(true);

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({ 
        ...prev, 
        permission,
        isEnabled: permission === 'granted'
      }));

      if (permission === 'granted') {
        await registerServiceWorker();
        toast.success('Push notifications enabled!');
        return true;
      } else if (permission === 'denied') {
        toast.error('Push notifications were denied. Please enable them in browser settings.');
        return false;
      } else {
        toast.info('Push notification permission was dismissed');
        return false;
      }
    } catch (error) {
      console.error('[Push] Error requesting permission:', error);
      toast.error('Failed to enable push notifications');
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.isSupported]);

  const showNotification = useCallback(async (title: string, body: string, data?: any) => {
    if (!state.isEnabled || !state.registration) {
      // Fall back to in-app toast if notifications not enabled
      toast.info(title, { description: body });
      return;
    }

    try {
      // Use service worker to show notification (works even when tab is in background)
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body,
          data
        });
      } else {
        // Fallback to direct notification API
        await state.registration.showNotification(title, {
          body,
          icon: '/favicon.png',
          badge: '/favicon.png',
          tag: 'admin-notification-' + Date.now(),
          requireInteraction: true,
          data: data || { url: '/admin/orders' }
        });
      }
    } catch (error) {
      console.error('[Push] Error showing notification:', error);
      toast.info(title, { description: body });
    }
  }, [state.isEnabled, state.registration]);

  const testNotification = useCallback(async () => {
    if (!state.isEnabled) {
      const enabled = await requestPermission();
      if (!enabled) return;
    }

    await showNotification(
      '🔔 Test Notification',
      'Push notifications are working correctly!',
      { url: '/admin' }
    );
  }, [state.isEnabled, requestPermission, showNotification]);

  return {
    isSupported: state.isSupported,
    isEnabled: state.isEnabled,
    permission: state.permission,
    loading,
    requestPermission,
    showNotification,
    testNotification,
    registration: state.registration
  };
};
