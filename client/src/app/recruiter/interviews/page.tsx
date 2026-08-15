"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, ExternalLink, Video } from "lucide-react";

import { RecruiterDashboard } from "@/components/layout/recruiter-dashboard";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { get, put } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { Interview } from "@/types";

const STATUS_VARIANT: Record<Interview["status"], NonNullable<BadgeProps["variant"]>> = {
  scheduled: "info",
  completed: "success",
  cancelled: "destructive",
};

export default function RecruiterInterviewsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recruiter-interviews"],
    queryFn: () => get<Interview[]>("/interview/recruiter"),
  });

  const complete = useMutation({
    mutationFn: (id: string) => put(`/interview/${id}/status`, { status: "completed" }),
    onSuccess: () => {
      toast("Interview marked as completed", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["recruiter-interviews"] });
    },
    onError: (e: Error) => toast(e.message, { variant: "error" }),
  });

  const interviews = data?.data || [];
  const upcoming = interviews.filter((i) => i.status === "scheduled").length;
  const completed = interviews.filter((i) => i.status === "completed").length;

  return (
    <RecruiterDashboard headerTitle="Interviews">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Interviews</h1>
        <p className="text-sm text-muted-foreground">
          {upcoming} upcoming · {completed} completed
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="h-7 w-7" />}
          title="No interviews scheduled"
          description="Schedule interviews from an applicant's page."
        />
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => {
            const student = typeof interview.student === "object" ? interview.student : undefined;
            const job = typeof interview.job === "object" ? interview.job : undefined;
            const isUpcoming = interview.status === "scheduled" && new Date(interview.scheduledAt) > new Date();
            return (
              <Card key={interview._id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Video className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{student?.name || "Student"}</p>
                        <Badge variant={STATUS_VARIANT[interview.status] || "secondary"}>{interview.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {interview.type} · {job?.title || "Job"} · {formatDate(interview.scheduledAt)}
                      </p>
                      {interview.notes && (
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{interview.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {interview.meetingLink && isUpcoming && (
                      <a href={interview.meetingLink} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                          Join
                        </Button>
                      </a>
                    )}
                    <Link href={`/recruiter/applicants/${interview.application}`}>
                      <Button variant="ghost" size="sm">View application</Button>
                    </Link>
                    {isUpcoming && (
                      <Button variant="ghost" size="sm" onClick={() => complete.mutate(interview._id)}>
                        Mark completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </RecruiterDashboard>
  );
}
