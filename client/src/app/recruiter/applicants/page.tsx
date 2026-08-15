"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Eye, UsersRound } from "lucide-react";

import { RecruiterDashboard } from "@/components/layout/recruiter-dashboard";
import { Button } from "@/components/ui/button";
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

export default function ApplicantsPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <ApplicantsContent />
    </React.Suspense>
  );
}

function ApplicantsContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job") || "";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recruiter-applications", jobId],
    queryFn: () => get<Application[]>(jobId ? `/applications/job/${jobId}` : "/applications/recruiter"),
  });

  const applications = data?.data || [];

  return (
    <RecruiterDashboard headerTitle="Applicants">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Applicants</h1>
        <p className="text-sm text-muted-foreground">
          {jobId ? "Applications for a specific job." : "All applications across your jobs."}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<UsersRound className="h-7 w-7" />}
          title="No applications yet"
          description="Applications from students will appear here."
        />
      ) : (
        <div className="space-y-3">
          {applications.map((application) => {
            const student = typeof application.student === "object" ? application.student : undefined;
            const job = typeof application.job === "object" ? application.job : undefined;
            return (
              <Card key={application._id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {(student?.name || "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{student?.name || "Student"}</p>
                        <Badge variant={STATUS_VARIANT[application.status]}>{application.status}</Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {job?.title || "Job"} · Applied {formatDate(application.createdAt)}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(student?.skills || []).slice(0, 4).map((skill: string) => (
                          <span key={skill} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link href={`/recruiter/applicants/${application._id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </RecruiterDashboard>
  );
}
