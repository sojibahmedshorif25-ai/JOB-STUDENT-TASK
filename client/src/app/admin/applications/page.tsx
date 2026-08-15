"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";

import { AdminDashboard } from "@/components/layout/admin-dashboard";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Application } from "@/types";

const STATUS_VARIANT: Record<Application["status"], NonNullable<BadgeProps["variant"]>> = {
  Applied: "secondary",
  Shortlisted: "info",
  Interview: "warning",
  Offer: "success",
  Rejected: "destructive",
};

export default function AdminApplicationsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => get<Application[]>("/admin/applications"),
  });

  const applications = data?.data || [];

  return (
    <AdminDashboard headerTitle="Applications">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <p className="text-sm text-muted-foreground">All job applications on the platform.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : applications.length === 0 ? (
        <EmptyState icon={<FileText className="h-7 w-7" />} title="No applications yet" />
      ) : (
        <div className="space-y-3">
          {applications.map((application) => {
            const student = typeof application.student === "object" ? application.student : undefined;
            const job = typeof application.job === "object" ? application.job : undefined;
            return (
              <Card key={application._id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {(student?.name || "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{student?.name || "Student"}</p>
                        <Badge variant={STATUS_VARIANT[application.status]}>{application.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {job?.title || "Job"} ·{" "}
                        {(typeof job?.company === "object" ? job.company?.name : "") || ""} · Applied{" "}
                        {formatDate(application.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {application.expectedSalary ? `Expected: $${application.expectedSalary}` : ""}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AdminDashboard>
  );
}
