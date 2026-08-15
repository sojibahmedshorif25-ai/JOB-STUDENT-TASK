"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, ShieldX } from "lucide-react";
import type { Role } from "@/types";

interface RequireAuthProps {
  roles?: Role[];
  children: React.ReactNode;
}

export function RequireAuth({ roles, children }: RequireAuthProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (roles && !roles.includes(user!.role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldX className="h-8 w-8" />
        </span>
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="max-w-sm text-muted-foreground">
          You don&apos;t have permission to access this page. Please contact your administrator if
          you believe this is a mistake.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
