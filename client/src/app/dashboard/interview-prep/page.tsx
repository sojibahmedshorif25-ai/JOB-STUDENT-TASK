"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, CalendarDays, Flame, MessageSquareText, Star } from "lucide-react";

import { StudentDashboard } from "@/components/layout/student-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { InterviewProgress } from "@/types";

export default function InterviewPrepDashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["interview-progress"],
    queryFn: () => get<InterviewProgress[]>("/interview/progress/my"),
  });

  const attempts = data?.data || [];
  const totalAnswered = attempts.length;
  const avgRating =
    attempts.length > 0
      ? (attempts.reduce((acc, a) => acc + (a.rating || 0), 0) / attempts.length).toFixed(1)
      : "0.0";
  const categories = Array.from(new Set(attempts.map((a) => a.category)));

  return (
    <StudentDashboard headerTitle="Interview Prep">
      <PageHeader title="Interview Preparation" description="Practice questions and improve your interview skills.">
        <Button asChild>
          <Link href="/interview-prep">
            <MessageSquareText className="h-4 w-4" />
            Practice now
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Questions answered</p>
                  <MessageSquareText className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-3xl font-bold">{totalAnswered}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Average rating</p>
                  <Star className="h-4 w-4 text-warning" />
                </div>
                <p className="mt-2 text-3xl font-bold">{avgRating} <span className="text-base font-normal text-muted-foreground">/ 5</span></p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Categories practiced</p>
                  <Flame className="h-4 w-4 text-accent" />
                </div>
                <p className="mt-2 text-3xl font-bold">{categories.length}</p>
              </CardContent>
            </Card>
          </div>

          {attempts.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={<BarChart3 className="h-7 w-7" />}
                title="No practice yet"
                description="Answer your first interview question to see your progress here."
                action={
                  <Button asChild>
                    <Link href="/interview-prep">Start practicing</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="mb-4 font-semibold">Recent attempts</h2>
                <div className="space-y-3">
                  {attempts.slice(0, 10).map((attempt) => (
                    <div key={attempt._id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {typeof attempt.questionId === "object" && attempt.questionId
                            ? attempt.questionId.question
                            : "Interview question"}
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary">{attempt.category}</Badge>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(attempt.createdAt)}
                          </span>
                        </p>
                      </div>
                      {attempt.rating != null && (
                        <div className="flex shrink-0 items-center gap-1 text-sm font-medium">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          {attempt.rating}/5
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </StudentDashboard>
  );
}
