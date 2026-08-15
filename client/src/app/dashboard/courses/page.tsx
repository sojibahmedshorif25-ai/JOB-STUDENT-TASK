"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Play } from "lucide-react";

import { StudentDashboard } from "@/components/layout/student-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Course, Enrollment } from "@/types";

export default function MyCoursesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => get<Enrollment[]>("/enrollments"),
  });

  const enrollments = data?.data || [];

  return (
    <StudentDashboard headerTitle="My Courses">
      <PageHeader
        title="My Courses"
        description="Continue where you left off or start something new."
        >
        <Button asChild>
          <Link href="/courses">
            <BookOpen className="h-4 w-4" />
            Browse courses
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : enrollments.length === 0 ? (
        <EmptyState
          title="No enrollments yet"
          description="Enroll in a course to start your learning journey."
          action={
            <Button asChild>
              <Link href="/courses">Explore courses</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const course = enrollment.course as Course | undefined;
            return (
              <Card key={enrollment._id} className="transition-all hover:shadow-md">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent font-bold text-primary-foreground">
                    {course?.title?.[0]?.toUpperCase() || "C"}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/learn/${course?._id || enrollment.course}`}
                        className="font-semibold hover:text-primary"
                      >
                        {course?.title || "Course"}
                      </Link>
                      {enrollment.completed ? (
                        <Badge variant="success">Completed</Badge>
                      ) : (
                        <Badge variant="secondary">{enrollment.percentComplete}%</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>{course?.category}</span>
                      <span>{course?.level}</span>
                      {enrollment.lastAccessedAt && <span>Last accessed {formatDate(enrollment.lastAccessedAt)}</span>}
                    </div>
                    <Progress value={enrollment.percentComplete} className="h-2" />
                  </div>
                  <Button
                    variant={enrollment.completed ? "outline" : "gradient"}
                    size="sm"
                    className="shrink-0"
                    asChild
                  >
                    <Link href={`/learn/${course?._id || enrollment.course}`}>
                      <Play className="h-4 w-4" />
                      {enrollment.completed ? "Review Course" : "Continue Learning"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </StudentDashboard>
  );
}
