"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, MapPin } from "lucide-react";

import { AdminDashboard } from "@/components/layout/admin-dashboard";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Job } from "@/types";

const STATUS_VARIANT: Record<string, NonNullable<BadgeProps["variant"]>> = {
  published: "success",
  closed: "secondary",
  draft: "warning",
};

export default function AdminJobsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => get<Job[]>("/admin/jobs"),
  });

  const jobs = data?.data || [];

  return (
    <AdminDashboard headerTitle="Jobs">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
        <p className="text-sm text-muted-foreground">All job postings across companies.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : jobs.length === 0 ? (
        <EmptyState icon={<Briefcase className="h-7 w-7" />} title="No jobs posted yet" />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const company = typeof job.company === "object" ? job.company : undefined;
            return (
              <Card key={job._id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/jobs/${job._id}`} className="font-medium hover:underline">
                        {job.title}
                      </Link>
                      <Badge variant={STATUS_VARIANT[job.status || "draft"] || "secondary"}>{job.status}</Badge>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location} · {job.remoteType}
                      </span>
                      <span>{company?.name || "—"}</span>
                      <span>{job.jobType}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job.skills?.slice(0, 5).join(", ")} · Posted {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {job.salaryMin && job.salaryMax ? `${job.salaryCurrency || "$"}${job.salaryMin}–${job.salaryMax}` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">{job.applicationsCount ?? 0} applicants</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AdminDashboard>
  );
}
