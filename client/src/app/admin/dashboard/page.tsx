"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Activity, Award, BookOpen, Briefcase, Building2, Users2 } from "lucide-react";

import { AdminDashboard } from "@/components/layout/admin-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  students: number;
  recruiters: number;
  companies: number;
  courses: number;
  jobs: number;
  activeJobs: number;
  applications: number;
  totalApplications: number;
  pendingApplications: number;
  projects: number;
}

export default function AdminOverviewPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => get<DashboardStats>("/admin/dashboard"),
  });

  const stats = data?.data;

  const cards = [
    { label: "Total users", value: stats?.totalUsers, icon: Users2, href: "/admin/users" },
    { label: "Active users (30d)", value: stats?.activeUsers, icon: Activity },
    { label: "Students", value: stats?.students, icon: BookOpen },
    { label: "Recruiters", value: stats?.recruiters, icon: Briefcase },
    { label: "Companies", value: stats?.companies, icon: Building2, href: "/admin/companies" },
    { label: "Courses", value: stats?.courses, icon: BookOpen, href: "/admin/courses" },
    { label: "Jobs", value: stats?.jobs, icon: Briefcase, href: "/admin/jobs" },
    { label: "Applications", value: stats?.applications, icon: Award, href: "/admin/applications" },
  ];

  return (
    <AdminDashboard headerTitle="Overview">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Platform-wide statistics at a glance.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
              const inner = (
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <card.icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-3xl font-bold">{card.value ?? "—"}</p>
                  </CardContent>
                </Card>
              );
              return card.href ? (
                <Link key={card.label} href={card.href} className="block">
                  {inner}
                </Link>
              ) : (
                <div key={card.label}>{inner}</div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-2 font-semibold">Application pipeline</h2>
                <p className="text-sm text-muted-foreground">
                  {stats?.pendingApplications} applications currently in &ldquo;Applied&rdquo; status.
                </p>
                <div className="mt-4 flex items-end gap-3">
                  <div className="rounded-lg bg-primary/10 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{stats?.totalApplications}</p>
                    <p className="text-xs text-muted-foreground">last 30 days</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <p className="text-2xl font-bold">{stats?.applications}</p>
                    <p className="text-xs text-muted-foreground">total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-2 font-semibold">Content health</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Active jobs</span>
                    <span className="font-semibold">{stats?.activeJobs}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Projects</span>
                    <span className="font-semibold">{stats?.projects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Companies</span>
                    <span className="font-semibold">{stats?.companies}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AdminDashboard>
  );
}
