"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Building2, CalendarDays, ExternalLink, MapPin, Users } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { JobCard } from "@/components/features/job-card";
import { get } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import type { Company, Job } from "@/types";

export default function CompanyDetailPage() {
  const params = useParams<{ slug: string }>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["company", params.slug],
    queryFn: () => get<Company>(`/companies/slug/${params.slug}`),
  });

  const { data: jobsData } = useQuery({
    queryKey: ["company-jobs", params.slug],
    queryFn: () => get<Job[]>(`/jobs?company=${(data?.data?._id) || ""}&limit=6`),
    enabled: !!data?.data?._id,
  });

  const company = data?.data;

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !company) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState onRetry={() => refetch()} />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white">
                {company.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logo} alt={company.name} className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  getInitials(company.name)
                )}
              </div>
              <div className="space-y-2">
                <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                  {company.name}
                  {company.verified && <BadgeCheck className="h-6 w-6 text-primary" aria-label="Verified company" />}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {company.industry && <Badge variant="secondary">{company.industry}</Badge>}
                  {company.size && <Badge variant="outline">{company.size}</Badge>}
                  {company.verified && <Badge variant="success">Verified</Badge>}
                </div>
              </div>
            </div>
            {company.website && (
              <Button variant="outline" asChild>
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Visit website
                </a>
              </Button>
            )}
          </div>

          {company.description && (
            <p className="mt-6 max-w-3xl leading-relaxed text-muted-foreground">{company.description}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t pt-5 text-sm text-muted-foreground">
            {company.headquarters && (
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{company.headquarters}</span>
            )}
            {company.foundedYear && (
              <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Founded {company.foundedYear}</span>
            )}
            {company.email && <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" />{company.email}</span>}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Open positions</h2>
            <span className="text-sm text-muted-foreground">{jobsData?.data?.length || 0} jobs</span>
          </div>
          {jobsData?.data?.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobsData.data.map((job) => (
                <JobCard key={job._id} job={job} compact />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No open positions right now</p>
              <p className="text-sm text-muted-foreground">Check back soon for new opportunities.</p>
            </div>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}
