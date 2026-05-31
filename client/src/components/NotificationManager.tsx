import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      // Check current permission status
      setIsSubscribed(Notification.permission === 'granted');

      // Register service worker
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        console.log('Service Worker registered:', registration);
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!isSupported) {
      alert('Your browser does not support notifications');
      return;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setIsSubscribed(permission === 'granted');

      if (permission === 'granted') {
        // Show a test notification
        showNotification({
          title: 'Notifications Enabled',
          body: 'You will now receive updates about new reviews, messages, and artwork sales.',
          tag: 'welcome',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = () => {
    setIsSubscribed(false);
    // Note: Users can re-enable in browser settings
  };

  return (
    <div className="flex items-center gap-2">
      {isSupported && (
        <>
          {isSubscribed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={disableNotifications}
              title="Notifications enabled"
              className="text-green-500 hover:text-green-600"
            >
              <Bell className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={requestNotificationPermission}
              disabled={isLoading}
              title="Enable notifications"
              className="text-gray-400 hover:text-gray-600"
            >
              <BellOff className="w-5 h-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export function showNotification(options: {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  requireInteraction?: boolean;
  data?: Record<string, any>;
  actions?: any[];
}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Send to service worker
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: options,
      });
    } else {
      // Fallback: show notification directly
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag || 'notification',
        requireInteraction: options.requireInteraction || false,
        data: options.data || {},
      });
    }
  }
}
