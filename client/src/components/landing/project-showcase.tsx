"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/features/project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { get } from "@/lib/api";
import type { Project } from "@/types";

export function ProjectShowcase() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects", "featured"],
    queryFn: () => get<Project[]>("/projects?sort=popular&limit=3"),
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Project showcase</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Real projects from real students</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            See what our community is building — and share your own work with recruiters.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/projects">
            Explore projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : isError || !data?.data?.length ? (
        <EmptyState
          icon={<FolderGit2 className="h-7 w-7" />}
          title="No projects yet"
          description="Student projects will be showcased here once published."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((project, i) => (
            <ProjectCard key={project._id} project={project} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
