"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { RecruiterDashboard } from "@/components/layout/recruiter-dashboard";
import { JobForm } from "@/components/features/job-form";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";
import type { Job } from "@/types";

export default function EditJobPage() {
  const params = useParams<{ id: string }>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["job", params.id],
    queryFn: () => get<Job>(`/jobs/${params.id}`),
  });

  const job = data?.data;

  return (
    <RecruiterDashboard headerTitle="Edit job">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit job</h1>
        <p className="text-sm text-muted-foreground">Update the details of this job posting.</p>
      </div>
      {isLoading ? (
        <Skeleton className="h-[600px] w-full rounded-xl" />
      ) : isError || !job ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <JobForm job={job} editing />
      )}
    </RecruiterDashboard>
  );
}
