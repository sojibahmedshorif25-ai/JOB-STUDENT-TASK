"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search } from "lucide-react";

import { AdminDashboard } from "@/components/layout/admin-dashboard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Course } from "@/types";
import * as React from "react";

export default function AdminCoursesPage() {
  const [search, setSearch] = React.useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-courses", search],
    queryFn: () => get<Course[]>("/admin/courses" + (search ? `?search=${encodeURIComponent(search)}` : "")),
  });

  const courses = data?.data || [];

  return (
    <AdminDashboard headerTitle="Courses">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground">All courses on the platform.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search coursesâ€¦" className="w-full max-w-72 pl-9 sm:w-72" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : courses.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-7 w-7" />} title="No courses found" />
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course._id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnail} alt={course.title} className="h-14 w-20 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen className="h-6 w-6" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/courses/${course.slug}`} className="font-medium hover:underline">
                        {course.title}
                      </Link>
                      <Badge variant={course.published ? "success" : "warning"}>
                        {course.published ? "Published" : "Draft"}
                      </Badge>
                      {course.featured && <Badge variant="accent">Featured</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {course.category || "â€”"} Â· {course.level || "â€”"} Â· {course.studentsEnrolled ?? 0} enrolled Â· Created {formatDate(course.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold">
                  {course.price && course.price > 0 ? `$${course.price}` : "Free"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminDashboard>
  );
}
