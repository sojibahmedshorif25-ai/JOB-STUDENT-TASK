"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobRow } from "@/components/features/job-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { get } from "@/lib/api";
import type { Job } from "@/types";

export function FeaturedJobs() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobs", "featured"],
    queryFn: () => get<Job[]>("/jobs?sort=newest&limit=5"),
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Featured jobs</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Opportunities matched to your skills</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Apply to internships, full-time roles and contracts from companies that are hiring now.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/jobs">
            Browse all jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError || !data?.data?.length ? (
        <EmptyState
          icon={<Briefcase className="h-7 w-7" />}
          title="No jobs yet"
          description="Jobs posted by recruiters will appear here."
        />
      ) : (
        <div className="space-y-3">
          {data.data.map((job) => (
            <JobRow key={job._id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
