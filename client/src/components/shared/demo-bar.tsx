"use client";

import * as React from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  Sparkles,
  UserCheck,
  Briefcase,
  ShieldAlert,
  FileCode2,
  ChevronDown,
  X,
  Bot,
} from "lucide-react";
import Link from "next/link";

export function DemoBar() {
  const { user, login, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = React.useState(false);
  const [loggingIn, setLoggingIn] = React.useState<string | null>(null);

  const handleQuickLogin = async (role: "STUDENT" | "RECRUITER" | "ADMIN", email: string) => {
    setLoggingIn(role);
    try {
      const loggedUser = await login(email, "password123");
      toast(`Switched to demo ${role.toLowerCase()} account!`, { variant: "success" });
      if (role === "STUDENT") router.push("/dashboard");
      else if (role === "RECRUITER") router.push("/recruiter/dashboard");
      else if (role === "ADMIN") router.push("/admin/dashboard");
    } catch (err: any) {
      toast("Quick demo login failed", {
        variant: "error",
        description: err?.message || "Check your backend server connection.",
      });
    } finally {
      setLoggingIn(null);
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 rounded-full border border-primary/30 bg-card/90 px-3.5 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md transition-all hover:bg-primary/10 print:hidden"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>⚡ Quick Demo Bar</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Demo accounts and quick links"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-2xl z-50 rounded-2xl border border-primary/20 bg-card/95 p-2.5 shadow-2xl backdrop-blur-xl transition-all print:hidden"
    >
      <div className="flex items-center justify-between gap-3 px-2 pb-1.5 border-b border-border/50 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5 font-bold text-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          ⚡ Portfolio Evaluator Toolbar
        </span>
        <div className="flex items-center gap-2">
          {user && (
            <span className="text-[11px]">
              Logged in: <strong className="text-primary">{user.role}</strong> ({user.name})
            </span>
          )}
          <button
            onClick={() => setCollapsed(true)}
            className="rounded p-0.5 hover:bg-secondary text-muted-foreground"
            title="Minimize"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-2">
        <button
          onClick={() => handleQuickLogin("STUDENT", "sojib@student.dev")}
          disabled={Boolean(loggingIn)}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
            user?.role === "STUDENT"
              ? "border-primary bg-primary/15 text-primary font-semibold"
              : "hover:bg-secondary text-muted-foreground"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Student Demo</span>
        </button>

        <button
          onClick={() => handleQuickLogin("RECRUITER", "recruiter1@company.dev")}
          disabled={Boolean(loggingIn)}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
            user?.role === "RECRUITER"
              ? "border-primary bg-primary/15 text-primary font-semibold"
              : "hover:bg-secondary text-muted-foreground"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5 text-blue-500" />
          <span>Recruiter Demo</span>
        </button>

        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

        <Link
          href="/api-docs"
          className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary transition-all"
        >
          <FileCode2 className="h-3.5 w-3.5 text-purple-500" />
          <span>API Docs</span>
        </Link>

        <Link
          href="/interview-prep"
          className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary transition-all"
        >
          <Bot className="h-3.5 w-3.5 text-amber-500" />
          <span>AI Interview</span>
        </Link>

        <Link
          href="/u/demo"
          className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 text-rose-500" />
          <span>Portfolio /u/demo</span>
        </Link>
      </div>
    </aside>
  );
}
