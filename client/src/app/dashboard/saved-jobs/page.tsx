"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { StudentDashboard } from "@/components/layout/student-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { JobRow } from "@/components/features/job-card";
import { useToast } from "@/components/ui/toast";
import { get, post } from "@/lib/api";
import type { Job } from "@/types";

export default function SavedJobsPage() {
  const { toast } = useToast();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: () => get<Job[]>("/jobs/saved"),
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId: string) => post(`/jobs/${jobId}/save`),
    onSuccess: () => {
      toast("Job removed from saved", { variant: "info" });
      refetch();
    },
  });

  const jobs = data?.data || [];

  return (
    <StudentDashboard headerTitle="Saved Jobs">
      <PageHeader
        title="Saved Jobs"
        description="Jobs you've saved to apply to later."
      >
        <Button asChild>
          <Link href="/jobs">Browse jobs</Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-7 w-7" />}
          title="No saved jobs"
          description="Save jobs you're interested in to find them here."
          action={
            <Button asChild>
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job._id} className="relative">
              <JobRow job={job} />
              <Button
                variant="ghost"
                size="iconSm"
                className="absolute right-3 top-3"
                onClick={() => unsaveMutation.mutate(job._id)}
                aria-label="Remove from saved"
              >
                <BookmarkCheck className="h-4 w-4 text-primary" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </StudentDashboard>
  );
}
