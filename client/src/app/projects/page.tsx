"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { FolderGit2, Search } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/components/features/project-card";
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
import type { Project } from "@/types";

const TECH = ["All", "React", "Next.js", "TypeScript", "Node.js", "MongoDB", "Express", "Tailwind CSS"];

export default function ProjectsPage() {
  const [search, setSearch] = React.useState("");
  const [technology, setTechnology] = React.useState("All");
  const [sort, setSort] = React.useState("popular");
  const [page, setPage] = React.useState(1);

  const query = React.useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (technology !== "All") params.set("technology", technology);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");
    return params.toString();
  }, [search, technology, sort, page]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["projects", query],
    queryFn: () => get<Project[]>("/projects?" + query),
  });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          title="Student Project Showcase"
          description="Real projects built by SkillForge students. Build yours and get noticed by recruiters."
        />

        <form onSubmit={(e) => { e.preventDefault(); setPage(1); }} className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search projects or technologies…"
            className="h-12 pl-11 text-base"
            aria-label="Search projects"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={technology} onValueChange={(v) => { setTechnology(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Technology" /></SelectTrigger>
            <SelectContent>
              {TECH.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Liked</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.data?.length ? (
          <EmptyState
            icon={<FolderGit2 className="h-7 w-7" />}
            title="No projects found"
            description="Try a different search or publish a project of your own."
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((project, i) => (
                <ProjectCard key={project._id} project={project} index={i} />
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
