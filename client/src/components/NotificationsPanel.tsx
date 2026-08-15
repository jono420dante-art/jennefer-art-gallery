import { useMemo, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type OperationalNotification = {
  id: string | number;
  title: string;
  body: string;
  type: "review" | "message" | "sale" | "collector" | "system";
  timestamp: Date | string | null;
  isRead?: boolean | number;
};

const typeStyles: Record<OperationalNotification["type"], string> = {
  review: "bg-blue-100 text-blue-800",
  message: "bg-purple-100 text-purple-800",
  sale: "bg-green-100 text-green-800",
  collector: "bg-pink-100 text-pink-800",
  system: "bg-gray-100 text-gray-800",
};

export function NotificationsPanel({ notifications, onMarkRead, onMarkAllRead }: { notifications: OperationalNotification[]; onMarkRead?: (id: number) => void; onMarkAllRead?: () => void }) {
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const visibleNotifications = useMemo(
    () => notifications.filter((notification) => !hiddenIds.has(String(notification.id))),
    [hiddenIds, notifications],
  );
  const unreadCount = visibleNotifications.filter((notification) => !notification.isRead && !readIds.has(String(notification.id))).length;

  const markAllAsRead = () => {
    setReadIds(new Set(visibleNotifications.map((notification) => String(notification.id))));
    onMarkAllRead?.();
  };
  const hideForSession = (id: string | number) => setHiddenIds((current) => {
    const next = new Set(current);
    next.add(String(id));
    return next;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Bell className="h-5 w-5" /> Live operational activity
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
        </h2>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllAsRead}><Check className="mr-2 h-4 w-4" />Mark read</Button>}
      </div>

      <div className="space-y-2">
        {visibleNotifications.length === 0 ? (
          <Card className="p-7 text-center text-muted-foreground">
            <Bell className="mx-auto mb-2 h-9 w-9 opacity-50" />
            <p>No real operational events have been recorded yet.</p>
          </Card>
        ) : visibleNotifications.map((notification) => {
          const isRead = Boolean(notification.isRead) || readIds.has(String(notification.id));
          const eventId = typeof notification.id === "number" ? notification.id : null;
          const timestamp = notification.timestamp ? new Date(notification.timestamp) : null;
          return (
            <Card key={notification.id} className={`p-4 transition-colors ${isRead ? "bg-background" : "border-primary/40 bg-primary/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{notification.title}</h3>
                    <Badge className={typeStyles[notification.type]}>{notification.type}</Badge>
                    {!isRead && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{notification.body}</p>
                  {timestamp && !Number.isNaN(timestamp.getTime()) && <p className="mt-2 text-xs text-muted-foreground">{timestamp.toLocaleString()}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {!isRead && eventId !== null && <Button variant="ghost" size="icon" aria-label="Mark activity read" onClick={() => { setReadIds((current) => new Set(current).add(String(eventId))); onMarkRead?.(eventId); }}><Check className="h-4 w-4" /></Button>}
                  <Button variant="ghost" size="icon" aria-label="Hide activity for this session" onClick={() => hideForSession(notification.id)}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
