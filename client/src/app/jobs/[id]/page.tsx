"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Banknote,
  Bookmark,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Share2,
  Trophy,
} from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { JobRow } from "@/components/features/job-card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast";
import { get, post } from "@/lib/api";
import { cn, formatDate, formatSalary, getInitials, timeAgo } from "@/lib/utils";
import type { Company, Job } from "@/types";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["job", params.id],
    queryFn: () => get<Job>(`/jobs/${params.id}`),
  });

  const saveMutation = useMutation({
    mutationFn: () => post<{ saved: boolean }>(`/jobs/${params.id}/save`),
    onSuccess: (res) => {
      toast(res.data.saved ? "Job saved" : "Job removed from saved", {
        variant: res.data.saved ? "success" : "info",
      });
      refetch();
    },
    onError: () => {
      if (!isAuthenticated) router.push("/login");
      else toast("Something went wrong", { variant: "error" });
    },
  });

  const job = data?.data;
  const company = job?.company as Company | undefined;

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/jobs/${params.id}`);
      return;
    }
    router.push(`/jobs/${params.id}/apply`);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/jobs/${params.id}`);
      return;
    }
    saveMutation.mutate();
  };

  return (
    <PublicLayout>
      {isLoading ? (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : isError || !job ? (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState onRetry={() => refetch()} />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
          {/* Header */}
          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border bg-secondary text-xl font-bold text-primary">
                  {company?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logo} alt={company.name} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    getInitials(company?.name || "SF")
                  )}
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{company?.name}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(job.createdAt)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary">{job.jobType}</Badge>
                    <Badge variant="outline">{job.remoteType}</Badge>
                    <Badge variant="muted">{job.experienceLevel}</Badge>
                    {job.deadline && (
                      <Badge variant="warning" className="gap-1">
                        <CalendarDays className="h-3 w-3" />
                        Apply by {formatDate(job.deadline)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  variant={job.saved ? "secondary" : "outline"}
                  onClick={handleSave}
                  loading={saveMutation.isPending}
                >
                  <Bookmark className={cn("h-4 w-4", job.saved && "fill-current")} />
                  {job.saved ? "Saved" : "Save"}
                </Button>
                <Button variant="ghost" onClick={() => toast("Link copied", { variant: "info" })}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t pt-5">
              <div>
                <p className="text-xs text-muted-foreground">Salary</p>
                <p className="flex items-center gap-1.5 font-semibold">
                  <Banknote className="h-4 w-4 text-success" />
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="font-semibold">{job.experienceLevel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Job Type</p>
                <p className="font-semibold">{job.jobType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Applications</p>
                <p className="font-semibold">{job.applicationsCount}</p>
              </div>
            </div>

            <Button size="lg" variant="gradient" className="mt-6 w-full sm:w-auto" onClick={handleApply}>
              <Briefcase className="h-4 w-4" />
              {job.applied ? "View Application" : "Apply Now"}
            </Button>
          </section>

          {/* Body */}
          <section className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <div className="space-y-3">
                <h2 className="text-xl font-bold">About this role</h2>
                <div className="whitespace-pre-line leading-relaxed text-muted-foreground">{job.description}</div>
              </div>

              {job.responsibilities?.length ? (
                <div className="space-y-3">
                  <h2 className="text-xl font-bold">Responsibilities</h2>
                  <ul className="space-y-2">
                    {job.responsibilities.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {job.requirements?.length ? (
                <div className="space-y-3">
                  <h2 className="text-xl font-bold">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {job.skills?.length ? (
                <div className="space-y-3">
                  <h2 className="text-xl font-bold">Required skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">{skill}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {job.benefits?.length ? (
                <div className="space-y-3">
                  <h2 className="text-xl font-bold">Benefits</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {job.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm">
                        <Trophy className="h-4 w-4 text-warning" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="space-y-4 p-5">
                  <h3 className="flex items-center gap-2 font-semibold">About {company?.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-secondary font-bold text-primary">
                      {company?.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={company.logo} alt={company.name} className="h-full w-full rounded-lg object-cover" />
                      ) : (
                        getInitials(company?.name || "SF")
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{company?.name}</p>
                      <p className="text-xs text-muted-foreground">{company?.industry}</p>
                    </div>
                  </div>
                  {company?.description && (
                    <p className="line-clamp-4 text-sm text-muted-foreground">{company.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {company?.headquarters && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{company.headquarters}</span>}
                    {company?.size && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{company.size}</span>}
                  </div>
                  <Separator />
                  <Button variant="outline" asChild className="w-full" size="sm">
                    <Link href={`/companies/${company?.slug}`}>View company page</Link>
                  </Button>
                </CardContent>
              </Card>

              <div className="rounded-xl border bg-muted/40 p-5">
                <h3 className="mb-2 font-semibold">Interested?</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {job.applied ? "You've already applied for this position." : "Submit your application and track your progress."}
                </p>
                <Button className="w-full" onClick={handleApply} disabled={job.applied}>
                  {job.applied ? "Application Submitted" : "Apply Now"}
                </Button>
              </div>
            </div>
          </section>

          {/* Similar jobs */}
          {job.similar?.length ? (
            <section className="space-y-4">
              <h2 className="text-xl font-bold">Similar jobs</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {job.similar.map((similarJob) => (
                  <JobRow key={similarJob._id} job={similarJob} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </PublicLayout>
  );
}
