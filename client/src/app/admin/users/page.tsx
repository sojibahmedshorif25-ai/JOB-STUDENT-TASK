"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ShieldOff, ShieldCheck, Users2 } from "lucide-react";

import { AdminDashboard } from "@/components/layout/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useToast } from "@/components/ui/toast";
import { get, put } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";
import * as React from "react";

const ROLE_VARIANT: Record<string, NonNullable<BadgeProps["variant"]>> = {
  STUDENT: "info",
  RECRUITER: "warning",
  ADMIN: "success",
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => get<User[]>("/admin/users" + (search ? `?search=${encodeURIComponent(search)}` : "")),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => put(`/admin/users/${id}/status`, { isActive }),
    onSuccess: () => {
      toast("User status updated", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast(e.message, { variant: "error" }),
  });

  const users = data?.data || [];

  return (
    <AdminDashboard headerTitle="Users">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Manage user accounts across the platform.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            className="w-72 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : users.length === 0 ? (
        <EmptyState icon={<Users2 className="h-7 w-7" />} title="No users found" />
      ) : (
        <Card className="divide-y overflow-hidden">
          {users.map((user) => (
            <div key={user._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{user.name}</p>
                    <Badge variant={ROLE_VARIANT[user.role] || "secondary"}>{user.role}</Badge>
                    {!user.isActive && <Badge variant="destructive">Suspended</Badge>}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email} · Joined {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
              <Button
                variant={user.isActive ? "outline" : "default"}
                size="sm"
                onClick={() => toggleActive.mutate({ id: user._id, isActive: !user.isActive })}
                loading={toggleActive.isPending && toggleActive.variables?.id === user._id}
              >
                {user.isActive ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                {user.isActive ? "Suspend" : "Activate"}
              </Button>
            </div>
          ))}
        </Card>
      )}
    </AdminDashboard>
  );
}
