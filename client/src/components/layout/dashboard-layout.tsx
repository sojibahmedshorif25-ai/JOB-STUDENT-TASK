"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X, LucideIcon } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { cn, getInitials } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  exact?: boolean;
}

interface DashboardLayoutProps {
  navItems: NavItem[];
  children: React.ReactNode;
  headerTitle?: string;
}

export function DashboardLayout({ navItems, children, headerTitle }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 top-16 z-40 flex w-64 -translate-x-full flex-col border-r bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen && "translate-x-0",
        )}
      >
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary">
                <Avatar className="h-8 w-8">
                  {user?.avatar ? <AvatarImage src={user.avatar} alt={user?.name || ""} /> : <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.role.toLowerCase()}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-16 z-20 flex h-14 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {headerTitle && <h1 className="text-sm font-semibold sm:text-base">{headerTitle}</h1>}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={cn("fixed bottom-4 right-4 z-50 lg:hidden", !sidebarOpen && "hidden")}
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
