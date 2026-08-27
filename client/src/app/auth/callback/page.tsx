"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { post, setToken, USER_KEY } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { AuthResponse, User } from "@/types";

const DASHBOARD_PATHS: Record<string, string> = {
  STUDENT: "/dashboard",
  RECRUITER: "/recruiter",
  ADMIN: "/admin",
};

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const handleError = searchParams.get("error");
    if (handleError) {
      if (!cancelled) {
        setError(
          handleError === "state_mismatch"
            ? "Google sign-in failed (state mismatch). Please try again."
            : `Google sign-in failed: ${handleError}`
        );
      }
      return;
    }

    const handleCallback = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (!session?.user?.email) {
          throw new Error("Google session not found. Please try again.");
        }

        const res = await post<AuthResponse>("/auth/google", {});

        const user = res.data.user;
        const normalized: User = { ...user, _id: user._id || user.id || "" };
        setToken(res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(normalized));

        if (!cancelled) {
          setUser(normalized);
          router.replace(DASHBOARD_PATHS[normalized.role] || "/dashboard");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Google login failed. Please try again.");
        }
      }
    };

    handleCallback();
    return () => {
      cancelled = true;
    };
  }, [router, setUser, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Login failed</h1>
        <p className="text-muted-foreground">{error}</p>
        <a href="/login" className="text-sm font-medium text-primary hover:underline">
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground">Signing you in with Google...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Signing you in with Google...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </React.Suspense>
  );
}
