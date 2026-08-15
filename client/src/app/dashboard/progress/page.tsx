"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, BookOpen, TrendingUp } from "lucide-react";

import { StudentDashboard } from "@/components/layout/student-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { get } from "@/lib/api";
import type { Course, Enrollment } from "@/types";

export default function ProgressPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => get<Enrollment[]>("/enrollments"),
  });

  const enrollments = data?.data || [];
  const average =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + e.percentComplete, 0) / enrollments.length)
      : 0;

  const completedCount = enrollments.filter((e) => e.completed).length;

  return (
    <StudentDashboard headerTitle="Progress">
      <PageHeader title="Learning Progress" description="Track how far you've come in each course.">
        <Button asChild variant="outline">
          <Link href="/courses">
            <BookOpen className="h-4 w-4" />
            Browse courses
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Average completion</p>
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-3xl font-bold">{average}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Courses completed</p>
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <p className="mt-2 text-3xl font-bold">{completedCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Courses in progress</p>
                  <BookOpen className="h-4 w-4 text-info" />
                </div>
                <p className="mt-2 text-3xl font-bold">{enrollments.length - completedCount}</p>
              </CardContent>
            </Card>
          </div>

          {enrollments.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={<BarChart3 className="h-7 w-7" />}
                title="No courses yet"
                description="Enroll in a course to start tracking your progress."
              />
            </div>
          ) : (
            <Card className="mt-6">
              <CardContent className="space-y-6 p-6">
                {enrollments.map((enrollment) => {
                  const course = enrollment.course as Course | undefined;
                  const totalLessons = course?.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
                  const completedLessons = enrollment.progress?.filter((p) => p.completed).length || 0;
                  return (
                    <div key={enrollment._id}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {course?.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-12 w-20 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <BookOpen className="h-5 w-5" />
                            </span>
                          )}
                          <div>
                            <p className="font-medium">{course?.title || "Course"}</p>
                            <p className="text-xs text-muted-foreground">
                              {completedLessons}/{totalLessons} lessons completed
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-primary">{enrollment.percentComplete}%</span>
                      </div>
                      <Progress value={enrollment.percentComplete} className="h-2.5" />
                      <div className="mt-2 flex justify-end">
                        <Button asChild variant={enrollment.completed ? "outline" : "default"} size="sm">
                          <Link href={`/courses/${(course as Course)?._id || enrollment.course}`}>
                            {enrollment.completed ? "Review course" : "Continue learning"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </StudentDashboard>
  );
}
