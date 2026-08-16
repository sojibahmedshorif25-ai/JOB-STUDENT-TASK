"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  Briefcase,
  FolderGit2,
  Menu,
  MessagesSquare,
  Search,
  Users,
  X,
  LayoutDashboard,
  UserCircle2,
  LogOut,
} from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { get } from "@/lib/api";
import { getInitials, timeAgo, cn } from "@/lib/utils";
import type { NotificationItem } from "@/types";

const NAV_LINKS = [
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/interview-prep", label: "Interview Prep", icon: MessagesSquare },
  { href: "/companies", label: "Companies", icon: Users },
];

const DASHBOARD_PATHS: Record<string, string> = {
  STUDENT: "/dashboard",
  RECRUITER: "/recruiter",
  ADMIN: "/admin",
};

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => get<{ _id: string } & NotificationItem[]>("/notifications?limit=5"),
    enabled: isAuthenticated,
  });

  const unreadCount = (notificationsData?.meta?.unreadCount as number | undefined) ?? 0;
  const notifications = notificationsData?.data ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/courses?search=${encodeURIComponent(search.trim())}`);
    setSearch("");
  };

  const dashboardPath = user ? DASHBOARD_PATHS[user.role] || "/dashboard" : "/login";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses…"
                className="h-9 w-48 rounded-full pl-9 lg:w-56"
                aria-label="Search courses"
              />
            </div>
          </form>

          <ThemeToggle />

          {isAuthenticated && user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ["notifications"] })}
                      aria-label="Refresh notifications"
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem key={n._id} asChild>
                        <Link href={n.link || "/dashboard/notifications"} className="flex flex-col items-start gap-0.5 py-2">
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className={cn("text-sm font-medium", !n.read && "text-foreground")}>
                              {n.title}
                            </span>
                            {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                          </div>
                          <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none" aria-label="Account menu">
                    <Avatar className="h-9 w-9 border transition-shadow hover:ring-2 hover:ring-ring">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : (
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      )}
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={dashboardPath}>
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <UserCircle2 className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="shadow-sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            <form onSubmit={handleSearch} className="md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses…"
                  className="h-10 rounded-full pl-9"
                  aria-label="Search courses"
                />
              </div>
            </form>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname.startsWith(link.href)
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/60",
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              {isAuthenticated ? (
                <Button asChild className="flex-1">
                  <Link href={dashboardPath} onClick={() => setMobileOpen(false)}>
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
