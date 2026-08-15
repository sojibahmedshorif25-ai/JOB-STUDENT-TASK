"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/features/course-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { get } from "@/lib/api";
import type { Course } from "@/types";

export function FeaturedCourses() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["courses", "featured"],
    queryFn: () => get<Course[]>("/courses?featured=true&limit=6"),
  });

  return (
    <section className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Featured courses</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Learn skills that get you hired</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Project-based courses designed by engineers, for engineers.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/courses">
              View all courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-44 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : isError || !data?.data?.length ? (
          <EmptyState
            title="Courses coming soon"
            description="Start the backend server and run the seed script to load courses."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((course, i) => (
              <CourseCard key={course._id} course={course} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
