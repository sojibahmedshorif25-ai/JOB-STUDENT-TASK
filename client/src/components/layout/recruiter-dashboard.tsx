"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Briefcase, CalendarClock, CheckSquare, LayoutDashboard, Menu, UsersRound, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { RequireAuth } from "@/components/guard/require-auth";

const NAV_ITEMS = [
  { href: "/recruiter/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/recruiter/company", label: "Company profile", icon: Building2 },
  { href: "/recruiter/jobs", label: "My jobs", icon: Briefcase },
  { href: "/recruiter/applicants", label: "Applicants", icon: UsersRound },
  { href: "/recruiter/interviews", label: "Interviews", icon: CalendarClock },
];

export function RecruiterDashboard({ children, headerTitle }: { children: React.ReactNode; headerTitle: string }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <RequireAuth roles={["RECRUITER"]}>
      <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="text-lg font-bold tracking-tight">
              Skill<span className="text-primary">Forge</span>
            </Link>
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <CheckSquare className="h-3 w-3" />
              Recruiter
            </span>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Link href="/recruiter/company" className="flex items-center gap-2 rounded-full border p-1 pr-3 hover:bg-muted">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium sm:block">{user.name}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 top-16 z-50 flex w-64 -translate-x-full flex-col border-r bg-card transition-transform duration-200 md:static md:z-auto md:w-56 md:translate-x-0",
            sidebarOpen && "translate-x-0",
          )}
        >
          <div className="flex items-center justify-between border-b px-4 py-3 md:hidden">
            <span className="text-sm font-semibold">Recruiter menu</span>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3 md:sticky md:top-24 md:p-0">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 md:hidden">
              <Link
                href="/dashboard"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                Student dashboard
              </Link>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 md:hidden">
            <p className="text-sm text-muted-foreground">{headerTitle}</p>
          </div>
          {children}
        </main>
      </div>
      </div>
    </RequireAuth>
  );
}
