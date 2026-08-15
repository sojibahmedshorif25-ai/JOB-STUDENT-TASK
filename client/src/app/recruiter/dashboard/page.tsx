"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Eye, Users2, X, Building2, TrendingUp } from "lucide-react";

import { RecruiterDashboard } from "@/components/layout/recruiter-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { del, get } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { Application, Company, Job } from "@/types";

export default function RecruiterOverviewPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companyData, isLoading: companyLoading } = useQuery({
    queryKey: ["my-company"],
    queryFn: () => get<Company>("/companies/mine"),
  });
  const company = companyData?.data;

  const { data: jobsData } = useQuery({
    queryKey: ["recruiter-jobs"],
    queryFn: () => get<Job[]>("/jobs/recruiter"),
  });
  const jobs = jobsData?.data || [];

  const { data: applicationsData } = useQuery({
    queryKey: ["recruiter-applications"],
    queryFn: () => get<Application[]>("/applications/recruiter?limit=6"),
  });
  const applications = applicationsData?.data || [];

  const remove = useMutation({
    mutationFn: (id: string) => del(`/jobs/${id}`),
    onSuccess: () => {
      toast("Job removed", { variant: "info" });
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-applications"] });
    },
  });

  const activeJobs = jobs.filter((j) => j.status === "published").length;
  const totalApplicants = applications.length;

  return (
    <RecruiterDashboard headerTitle="Overview">
      {companyLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : !company ? (
        <EmptyState
          icon={<Building2 className="h-7 w-7" />}
          title="No company profile"
          description="Set up your company profile to start posting jobs."
          action={
            <Button asChild>
              <Link href="/recruiter/company">Create company profile</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Active jobs</p>
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-3xl font-bold">{activeJobs}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total applicants</p>
                  <Users2 className="h-4 w-4 text-success" />
                </div>
                <p className="mt-2 text-3xl font-bold">{totalApplicants}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Jobs posted</p>
                  <TrendingUp className="h-4 w-4 text-info" />
                </div>
                <p className="mt-2 text-3xl font-bold">{jobs.length}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent jobs</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/recruiter/jobs">View all</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job._id} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{job.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {job.jobType} · {job.location} · {formatDate(job.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link href={`/recruiter/applicants?job=${job._id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                          Applicants
                        </Button>
                      </Link>
                      <Link href={`/recruiter/jobs/${job._id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => remove.mutate(job._id)}
                        aria-label="Remove job"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <p className="text-sm text-muted-foreground">No jobs yet. Post your first job.</p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent applications</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/recruiter/applicants">View all</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {applications.map((app) => {
                  const student = typeof app.student === "object" ? app.student : undefined;
                  const job = typeof app.job === "object" ? app.job : undefined;
                  return (
                    <div key={app._id} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{student?.name || "Student"}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          Applied for {job?.title || "job"} · {formatDate(app.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Link href={`/recruiter/applicants/${app._id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
                {applications.length === 0 && (
                  <p className="text-sm text-muted-foreground">No applications yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </RecruiterDashboard>
  );
}
