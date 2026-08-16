"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Eye, MapPin, Plus, Users2 } from "lucide-react";

import { RecruiterDashboard } from "@/components/layout/recruiter-dashboard";
import { Button } from "@/components/ui/button";
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

export default function RecruiterJobsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recruiter-jobs"],
    queryFn: () => get<Job[]>("/jobs/recruiter"),
  });

  const jobs = data?.data || [];

  return (
    <RecruiterDashboard headerTitle="My jobs">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My jobs</h1>
          <p className="text-sm text-muted-foreground">Manage your posted jobs and their applicants.</p>
        </div>
        <Button asChild>
          <Link href="/recruiter/jobs/new">
            <Plus className="h-4 w-4" />
            Post a job
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-7 w-7" />}
          title="No jobs posted yet"
          description="Post your first job to start receiving applications."
          action={
            <Button asChild>
              <Link href="/recruiter/jobs/new">
                <Plus className="h-4 w-4" />
                Post a job
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job._id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{job.title}</h3>
                    <Badge variant={STATUS_VARIANT[job.status || "draft"] || "secondary"}>{job.status}</Badge>
                    <Badge variant="outline">{job.jobType}</Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location} · {job.remoteType}
                    </span>
                    <span>Posted {formatDate(job.createdAt)}</span>
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/recruiter/applicants?job=${job._id}`}>
                    <Button variant="outline" size="sm">
                      <Users2 className="h-4 w-4" />
                      {job.applicationsCount ?? 0} applicants
                    </Button>
                  </Link>
                  <Link href={`/recruiter/jobs/${job._id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </RecruiterDashboard>
  );
}
