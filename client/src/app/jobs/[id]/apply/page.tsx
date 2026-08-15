"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, FileText, Send } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { RequireAuth } from "@/components/guard/require-auth";
import { useToast } from "@/components/ui/toast";
import { get, post } from "@/lib/api";
import { formatSalary, getInitials } from "@/lib/utils";
import type { Company, Job, Resume } from "@/types";

const applicationSchema = z.object({
  resumeId: z.string().optional(),
  resumeUrl: z.string().optional(),
  coverLetter: z.string().min(20, "Cover letter should be at least 20 characters").max(5000),
  expectedSalary: z.string().optional(),
  availability: z.string().min(1, "Availability is required"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

function ApplyContent({ jobId }: { jobId: string }) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const [selectedResumeId, setSelectedResumeId] = React.useState("");

  const { data: jobData, isLoading, isError, refetch } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => get<Job>(`/jobs/${jobId}`),
  });

  const { data: resumeData } = useQuery({
    queryKey: ["resume"],
    queryFn: () => get<Resume>("/resume"),
  });

  const applyMutation = useMutation({
    mutationFn: (data: ApplicationForm) => post(`/applications/job/${jobId}`, data),
    onSuccess: () => {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (error) => {
      toast("Application failed", {
        description: error instanceof Error ? error.message : "Please try again",
        variant: "error",
      });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { resumeId: "", resumeUrl: "", coverLetter: "", expectedSalary: "" },
  });

  const job = jobData?.data;
  const company = job?.company as Company | undefined;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-10">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !job) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-16">
        <div className="flex flex-col items-center rounded-2xl border bg-card p-10 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </span>
          <h1 className="mt-6 text-2xl font-bold">Application submitted!</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Your application for <strong>{job.title}</strong> at <strong>{company?.name}</strong> has
            been received. The recruiter will review your profile and update the status.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gradient">
              <Link href="/dashboard/applications">
                Track your application
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/jobs">Browse more jobs</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = (data: ApplicationForm) => {
    applyMutation.mutate({
      ...data,
      expectedSalary: data.expectedSalary === "" ? undefined : Number(data.expectedSalary),
    } as unknown as ApplicationForm);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-10">
      <div>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-secondary text-lg font-bold text-primary">
            {company?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={company.name} className="h-full w-full rounded-xl object-cover" />
            ) : (
              getInitials(company?.name || "SF")
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Applying for</p>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-sm text-muted-foreground">
              {company?.name} · {job.location} · {formatSalary(job.salaryMin, job.salaryMax)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.skills?.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary" className="font-normal">{skill}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Application details</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Resume</Label>
              {resumeData?.data ? (
                <div className="flex items-center justify-between rounded-lg border bg-secondary/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Resume on file</span>
                    <span className="text-xs text-muted-foreground">
                      {resumeData.data.personal?.fullName || "My Resume"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={selectedResumeId === resumeData.data._id ? "secondary" : "outline"}
                    onClick={() => {
                      const id = selectedResumeId === resumeData.data._id ? "" : resumeData.data._id;
                      setSelectedResumeId(id);
                      setValue("resumeId", id);
                    }}
                  >
                    {selectedResumeId === resumeData.data._id ? "Selected" : "Select"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-dashed px-4 py-3">
                  <span className="text-sm text-muted-foreground">No resume on file.</span>
                  <Button type="button" size="sm" variant="outline" asChild>
                    <Link href="/dashboard/resume">Build one</Link>
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                rows={5}
                placeholder="Tell the recruiter why you're a great fit for this role…"
                {...register("coverLetter")}
              />
              {errors.coverLetter && <p className="text-sm text-destructive">{errors.coverLetter.message}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expectedSalary">Expected Salary</Label>
                <Input
                  id="expectedSalary"
                  type="number"
                  placeholder="e.g. 75000"
                  {...register("expectedSalary")}
                />
                {errors.expectedSalary && <p className="text-sm text-destructive">{errors.expectedSalary.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input id="availability" placeholder="e.g. Immediately, 2 weeks notice" {...register("availability")} />
                {errors.availability && <p className="text-sm text-destructive">{errors.availability.message}</p>}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={applyMutation.isPending}>
              <Send className="h-4 w-4" />
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApplyPage() {
  const params = useParams<{ id: string }>();
  return (
    <PublicLayout>
      <RequireAuth roles={["STUDENT"]}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ApplyContent jobId={params.id} />
        </div>
      </RequireAuth>
    </PublicLayout>
  );
}
