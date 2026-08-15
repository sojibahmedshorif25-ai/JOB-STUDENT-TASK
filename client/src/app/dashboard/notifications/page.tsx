"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Award,
  Bell,
  Briefcase,
  CalendarDays,
  CheckCheck,
  FileText,
  GraduationCap,
  Trash2,
} from "lucide-react";

import { StudentDashboard } from "@/components/layout/student-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useToast } from "@/components/ui/toast";
import { del, get, put } from "@/lib/api";
import { cn, timeAgo } from "@/lib/utils";
import type { NotificationItem } from "@/types";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Course: <GraduationCap className="h-4 w-4" />,
  Job: <Briefcase className="h-4 w-4" />,
  Application: <FileText className="h-4 w-4" />,
  Interview: <CalendarDays className="h-4 w-4" />,
  Certificate: <Award className="h-4 w-4" />,
  System: <Bell className="h-4 w-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  Course: "bg-primary/10 text-primary",
  Job: "bg-info/10 text-info",
  Application: "bg-success/10 text-success",
  Interview: "bg-warning/10 text-warning",
  Certificate: "bg-accent/10 text-accent-foreground",
  System: "bg-muted text-muted-foreground",
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => get<NotificationItem[]>("/notifications?limit=50"),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => put(`/notifications/${id}/read`),
    onSuccess: () => refetch(),
  });

  const markAllRead = useMutation({
    mutationFn: () => put("/notifications/read-all"),
    onSuccess: () => refetch(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => del(`/notifications/${id}`),
    onSuccess: () => {
      toast("Notification deleted", { variant: "info" });
      refetch();
    },
  });

  const notifications = data?.data || [];
  const unreadCount = (data?.meta?.unreadCount as number) || 0;

  return (
    <StudentDashboard headerTitle="Notifications">
      <PageHeader title="Notifications" description={`${unreadCount} unread notifications`}>
        <Button variant="outline" onClick={() => markAllRead.mutate()} loading={markAllRead.isPending}>
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-7 w-7" />}
          title="No notifications"
          description="You're all caught up!"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={cn(
                "p-4 transition-all hover:shadow-md",
                !notification.read && "border-primary/40 bg-primary/[0.03]",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    TYPE_COLORS[notification.type] || TYPE_COLORS.System,
                  )}
                >
                  {TYPE_ICONS[notification.type] || TYPE_ICONS.System}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{notification.title}</p>
                    {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  {notification.message && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
                  )}
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{timeAgo(notification.createdAt)}</span>
                    {notification.link && (
                      <Link href={notification.link} className="text-primary hover:underline">
                        View details
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  {!notification.read && (
                    <Button variant="ghost" size="iconSm" onClick={() => markRead.mutate(notification._id)} aria-label="Mark as read">
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="iconSm" onClick={() => remove.mutate(notification._id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </StudentDashboard>
  );
}
