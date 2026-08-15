"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CalendarDays, MapPin } from "lucide-react";

import { StudentDashboard } from "@/components/layout/student-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/features/status-badge";
import { get } from "@/lib/api";
import { cn, formatDate, formatSalary } from "@/lib/utils";
import type { Application, Job, Company } from "@/types";

const COLUMNS: Array<{ key: string; label: string; color: string }> = [
  { key: "Applied", label: "Applied", color: "bg-info" },
  { key: "Shortlisted", label: "Shortlisted", color: "bg-warning" },
  { key: "Interview", label: "Interview", color: "bg-accent" },
  { key: "Offer", label: "Offer", color: "bg-success" },
  { key: "Rejected", label: "Rejected", color: "bg-destructive" },
];

export default function ApplicationsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["applications", "mine"],
    queryFn: () => get<Application[]>("/applications/my"),
  });

  const applications = data?.data || [];

  return (
    <StudentDashboard headerTitle="Applications">
      <PageHeader
        title="Application Tracker"
        description="Track every job application from applied to offer."
      >
        <Button asChild>
          <Link href="/jobs">
            <Briefcase className="h-4 w-4" />
            Find jobs
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col.key} className="space-y-3">
              <Skeleton className="h-8 w-24" />
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Apply to jobs and track your progress here."
          action={
            <Button asChild>
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => {
            const columnApps = applications.filter((a) => a.status === column.key);
            return (
              <div key={column.key} className="w-72 shrink-0">
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", column.color)} />
                  <h3 className="text-sm font-semibold">{column.label}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {columnApps.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {columnApps.map((application) => {
                    const job = application.job as Job | undefined;
                    const company = job?.company as Company | undefined;
                    return (
                      <Card key={application._id} className="p-4 transition-all hover:shadow-md">
                        <Link href={`/jobs/${job?._id}`} className="font-semibold hover:text-primary">
                          {job?.title || "Job"}
                        </Link>
                        <p className="text-xs text-muted-foreground">{company?.name}</p>
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" /> {job?.location}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <CalendarDays className="h-3 w-3" /> Applied {formatDate(application.createdAt)}
                          </p>
                          {job && (
                            <p className="font-medium text-foreground">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                          )}
                        </div>
                        {application.interview && typeof application.interview !== "string" && (
                          <div className="mt-3 rounded-lg bg-accent/10 p-2.5 text-xs">
                            <p className="flex items-center gap-1 font-medium text-accent-foreground">
                              <CalendarDays className="h-3 w-3" />
                              {new Date(application.interview.scheduledAt).toLocaleString()}
                            </p>
                            <p className="mt-0.5 text-muted-foreground">{application.interview.type} interview</p>
                          </div>
                        )}
                        <div className="mt-3">
                          <StatusBadge status={application.status} />
                        </div>
                      </Card>
                    );
                  })}
                  {columnApps.length === 0 && (
                    <div className="rounded-xl border border-dashed py-8 text-center text-xs text-muted-foreground">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentDashboard>
  );
}
