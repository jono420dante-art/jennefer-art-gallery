import { useMemo, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { noticeNextStep, noticeTypeLabel, type OperationalNoticeType } from "@/lib/operationalNotices";

export type OperationalNotification = {
  id: string | number;
  title: string;
  body: string;
  type: OperationalNoticeType;
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
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="flex min-w-0 flex-wrap items-center gap-2 text-base font-bold text-foreground">
            <Bell className="h-4 w-4" /> Action queue
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Resolve an item to keep its history while clearing it from the active queue.</p>
        </div>
        {unreadCount > 0 && <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={markAllAsRead}><Check className="mr-2 h-4 w-4" />Resolve all</Button>}
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
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
            <Card key={notification.id} className={`p-3 transition-colors ${isRead ? "bg-background/70" : "border-primary/40 bg-primary/5"}`}>
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words font-semibold text-foreground">{notification.title}</h3>
                    <Badge className={typeStyles[notification.type]}>{noticeTypeLabel(notification.type)}</Badge>
                    {!isRead && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                  </div>
                  <p className="mt-1.5 break-words text-sm leading-5 text-muted-foreground">{notification.body}</p>
                  {!isRead && <p className="mt-2 rounded-md bg-muted/70 px-2 py-1 text-xs leading-4 text-muted-foreground"><strong className="text-foreground">Next step:</strong> {noticeNextStep(notification.type)}</p>}
                  {timestamp && !Number.isNaN(timestamp.getTime()) && <p className="mt-2 text-[11px] text-muted-foreground">{timestamp.toLocaleString()}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {!isRead && eventId !== null && <Button variant="outline" size="sm" aria-label="Resolve operational notice" onClick={() => { setReadIds((current) => new Set(current).add(String(eventId))); onMarkRead?.(eventId); }}><Check className="mr-1 h-3.5 w-3.5" />Resolve</Button>}
                  <Button variant="ghost" size="icon" aria-label="Hide notice for this visit" onClick={() => hideForSession(notification.id)}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
