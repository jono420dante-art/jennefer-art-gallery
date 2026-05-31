import { useState } from 'react';
import { Bell, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: number;
  title: string;
  body: string;
  type: 'review' | 'message' | 'sale' | 'system';
  timestamp: Date;
  isRead: boolean;
  data?: Record<string, any>;
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'New Review Submitted',
      body: 'A new 5-star review has been submitted for "Riana"',
      type: 'review',
      timestamp: new Date(Date.now() - 3600000),
      isRead: false,
    },
    {
      id: 2,
      title: 'New Message',
      body: 'Someone inquired about commissioning a custom portrait',
      type: 'message',
      timestamp: new Date(Date.now() - 7200000),
      isRead: false,
    },
    {
      id: 3,
      title: 'Artwork Sold',
      body: '"Bunny Cuddles" has been sold via PayPal',
      type: 'sale',
      timestamp: new Date(Date.now() - 86400000),
      isRead: true,
    },
  ]);

  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    enableReviews: true,
    enableMessages: true,
    enableSales: true,
    enableSystem: true,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'message':
        return 'bg-purple-100 text-purple-800';
      case 'sale':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'review':
        return '⭐';
      case 'message':
        return '💬';
      case 'sale':
        return '💰';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </h2>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            Settings
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card className="p-4 bg-muted/50">
          <h3 className="font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.enableReviews}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    enableReviews: e.target.checked,
                  })
                }
              />
              <span>Enable review notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.enableMessages}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    enableMessages: e.target.checked,
                  })
                }
              />
              <span>Enable message notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.enableSales}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    enableSales: e.target.checked,
                  })
                }
              />
              <span>Enable sale notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.enableSystem}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    enableSystem: e.target.checked,
                  })
                }
              />
              <span>Enable system notifications</span>
            </label>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 cursor-pointer transition-colors ${
                notification.isRead
                  ? 'bg-background'
                  : 'bg-accent/10 border-accent/50'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getTypeIcon(notification.type)}</span>
                    <h3 className="font-semibold">{notification.title}</h3>
                    <Badge className={getTypeColor(notification.type)}>
                      {notification.type}
                    </Badge>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-accent ml-auto" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.body}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {notification.timestamp.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
