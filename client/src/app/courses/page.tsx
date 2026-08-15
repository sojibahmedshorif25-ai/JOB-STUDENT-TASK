"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Filter, Search, SlidersHorizontal } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { CourseCard } from "@/components/features/course-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import type { Course } from "@/types";

export default function CoursesPage() {
  return (
    <React.Suspense
      fallback={
        <PublicLayout>
          <PageHeader
            title="Learn Skills That Get You Hired"
            description="Explore project-based courses designed to take you from fundamentals to job-ready."
          />
          <div className="space-y-4">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </PublicLayout>
      }
    >
      <CoursesContent />
    </React.Suspense>
  );
}

function CoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [category, setCategory] = React.useState("All");
  const [level, setLevel] = React.useState("All");
  const [sort, setSort] = React.useState("popular");
  const [page, setPage] = React.useState(1);

  const query = React.useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);
    if (level !== "All") params.set("level", level);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");
    return params.toString();
  }, [search, category, level, sort, page]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["courses", query],
    queryFn: () => get<Course[]>("/courses?" + query),
  });

  const { data: filters } = useQuery({
    queryKey: ["course-filters"],
    queryFn: () => get<{ categories: string[]; technologies: string[] }>("/courses/filters"),
  });

  const categories = ["All", ...(filters?.data?.categories || [])];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    router.replace(`/courses?search=${encodeURIComponent(search)}`);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          title="Learn Skills That Get You Hired"
          description="Explore project-based courses designed to take you from fundamentals to job-ready."
        />

        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search courses, skills or technologies…"
            className="h-12 pl-11 text-base"
            aria-label="Search courses"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={(v) => { setLevel(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              {["All", "Beginner", "Intermediate", "Advanced"].map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="priceLow">Price: Low to High</SelectItem>
              <SelectItem value="priceHigh">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setLevel("All");
              setSort("popular");
              setPage(1);
            }}
            className="text-muted-foreground"
          >
            <Filter className="h-4 w-4" />
            Reset
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
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.data?.length ? (
          <EmptyState
            title="No courses found"
            description="Try adjusting your search or filters to find what you're looking for."
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((course, i) => (
                <CourseCard key={course._id} course={course} index={i} />
              ))}
            </div>
            {data.meta && data.meta.totalPages > 1 && (
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
