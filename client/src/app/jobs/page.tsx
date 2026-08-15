"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Filter, Search } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { JobCard } from "@/components/features/job-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";
import type { Job } from "@/types";

const JOB_TYPES = ["All", "Full-time", "Part-time", "Internship", "Contract"];
const REMOTE_TYPES = ["All", "Remote", "Hybrid", "On-site"];
const EXPERIENCE = ["All", "Entry Level", "Mid Level", "Senior Level"];

export default function JobsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [jobType, setJobType] = React.useState("All");
  const [remoteType, setRemoteType] = React.useState("All");
  const [experience, setExperience] = React.useState("All");
  const [sort, setSort] = React.useState("newest");
  const [page, setPage] = React.useState(1);

  const query = React.useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (jobType !== "All") params.set("jobType", jobType);
    if (remoteType !== "All") params.set("remoteType", remoteType);
    if (experience !== "All") params.set("experienceLevel", experience);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "9");
    return params.toString();
  }, [search, jobType, remoteType, experience, sort, page]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["jobs", query],
    queryFn: () => get<Job[]>("/jobs?" + query),
  });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          title="Find Your Next Opportunity"
          description="Discover jobs matched to your skills from companies hiring now."
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            router.replace(`/jobs?search=${encodeURIComponent(search)}`);
          }}
          className="relative max-w-2xl"
        >
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search job title, company or skill…"
            className="h-12 pl-11 text-base"
            aria-label="Search jobs"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          <Select value={jobType} onValueChange={(v) => { setJobType(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Job type" /></SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={remoteType} onValueChange={(v) => { setRemoteType(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Remote type" /></SelectTrigger>
            <SelectContent>
              {REMOTE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={experience} onValueChange={(v) => { setExperience(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Experience" /></SelectTrigger>
            <SelectContent>
              {EXPERIENCE.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="salaryHigh">Highest Salary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.data?.length ? (
          <EmptyState
            icon={<Briefcase className="h-7 w-7" />}
            title="No jobs found"
            description="Try adjusting your filters or check back soon for new opportunities."
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
            {data.meta && data.meta.totalPages > 1 && (
              <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
