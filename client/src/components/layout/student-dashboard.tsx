import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  FolderGit2,
  Briefcase,
  Bookmark,
  FilePlus2,
  MessagesSquare,
  Award,
  Bell,
  Settings,
} from "lucide-react";
import { DashboardLayout, type NavItem } from "@/components/layout/dashboard-layout";
import { RequireAuth } from "@/components/guard/require-auth";

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/progress", label: "Learning Progress", icon: BarChart3 },
  { href: "/dashboard/projects", label: "Projects", icon: FolderGit2 },
  { href: "/dashboard/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { href: "/dashboard/applications", label: "Applications", icon: Briefcase },
  { href: "/dashboard/resume", label: "Resume Builder", icon: FilePlus2 },
  { href: "/dashboard/interview-prep", label: "Interview Prep", icon: MessagesSquare },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function StudentDashboard({ children, headerTitle }: { children: React.ReactNode; headerTitle?: string }) {
  return (
    <RequireAuth roles={["STUDENT"]}>
      <DashboardLayout navItems={NAV_ITEMS} headerTitle={headerTitle}>
        {children}
      </DashboardLayout>
    </RequireAuth>
  );
}
