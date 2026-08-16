"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarDays,
  FolderGit2,
  Play,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { StudentDashboard } from "@/components/layout/student-dashboard";
import { StatsCard } from "@/components/shared/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { JobRow } from "@/components/features/job-card";
import { StatusBadge } from "@/components/features/status-badge";
import { useAuth } from "@/contexts/auth-context";
import { get } from "@/lib/api";
import type { Application, Enrollment, Job } from "@/types";

const SKILLS = [
  { name: "JavaScript", value: 92 },
  { name: "React", value: 84 },
  { name: "Next.js", value: 78 },
  { name: "Node.js", value: 71 },
  { name: "MongoDB", value: 65 },
  { name: "TypeScript", value: 58 },
];

const STATUS_FLOW = ["Applied", "Shortlisted", "Interview", "Offer"];

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: enrollmentsData, isLoading: loadingCourses } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => get<Enrollment[]>("/enrollments"),
  });

  const { data: applicationsData } = useQuery({
    queryKey: ["applications", "mine"],
    queryFn: () => get<Application[]>("/applications/my"),
  });

  const { data: jobsData } = useQuery({
    queryKey: ["jobs", "recommended"],
    queryFn: () => get<Job[]>("/jobs?sort=newest&limit=4"),
  });

  const enrollments = enrollmentsData?.data || [];
  const applications = applicationsData?.data || [];
  const continueCourse = enrollments.find((e) => !e.completed);
  const nextInterview = applications.find((a) => a.status === "Interview");

  return (
    <StudentDashboard headerTitle="Dashboard">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name?.split(" ")[0]} 👋</h2>
      </div>
      <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your career journey.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Courses" value={enrollments.length} icon={BookOpen} hint="In progress & completed" />
        <StatsCard label="Projects" value="3" icon={FolderGit2} hint="Published projects" accent="success" />
        <StatsCard label="Applications" value={applications.length} icon={Briefcase} hint={`${applications.filter((a) => a.status === "Shortlisted").length} shortlisted`} accent="info" />
        <StatsCard label="Interviews" value={applications.filter((a) => a.status === "Interview").length} icon={CalendarDays} hint="Scheduled interviews" accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Continue learning */}
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                Continue Learning
              </h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/courses">
                  All courses <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {loadingCourses ? (
              <Skeleton className="h-40 w-full rounded-xl" />
            ) : !continueCourse ? (
              <EmptyState
                title="No courses yet"
                description="Enroll in a course to start learning."
                action={<Button asChild size="sm"><Link href="/courses">Browse courses</Link></Button>}
              />
            ) : (
              <Link
                href={`/learn/${continueCourse.course && typeof continueCourse.course !== "string" ? continueCourse.course._id : continueCourse.course}`}
                className="block rounded-xl border bg-secondary/30 p-5 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {continueCourse.course && typeof continueCourse.course !== "string"
                        ? continueCourse.course.category
                        : "Course"}
                    </p>
                    <h4 className="mt-1 font-semibold">
                      {continueCourse.course && typeof continueCourse.course !== "string"
                        ? continueCourse.course.title
                        : "Continue learning"}
                    </h4>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={continueCourse.percentComplete} className="h-2 w-28 sm:w-40" />
                      <span className="text-sm font-semibold text-primary">{continueCourse.percentComplete}%</span>
                    </div>
                  </div>
                  <Button size="sm" variant="gradient" className="shrink-0">
                    <Play className="h-4 w-4" />
                    Continue
                  </Button>
                </div>
              </Link>
            )}

            {/* Application status timeline */}
            <div className="border-t pt-4">
              <h4 className="mb-3 text-sm font-semibold">Application Status</h4>
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Apply to jobs to track your application progress.
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  {STATUS_FLOW.map((status, i) => {
                    const hasReached = applications.some((a) => a.status === status);
                    return (
                      <React.Fragment key={status}>
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                              hasReached
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted text-muted-foreground"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="hidden text-[10px] text-muted-foreground sm:block">{status}</span>
                        </div>
                        {i < STATUS_FLOW.length - 1 && (
                          <div className={`h-0.5 flex-1 rounded ${hasReached ? "bg-primary" : "bg-muted"}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skill progress */}
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold">
                  <TrendingUp className="h-4 w-4 text-success" />
                  Skill Progress
                </h3>
              </div>
              <div className="space-y-3">
                {SKILLS.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-muted-foreground">{skill.value}%</span>
                    </div>
                    <Progress
                      value={skill.value}
                      className="h-1.5"
                      indicatorClassName={skill.value >= 80 ? "bg-success" : undefined}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {nextInterview && nextInterview.interview && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="space-y-2 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Upcoming Interview
                  </h3>
                  <StatusBadge status="Interview" />
                </div>
                {typeof nextInterview.interview !== "string" && (
                  <>
                    <p className="text-sm font-medium">
                      {new Date(nextInterview.interview.scheduledAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {nextInterview.interview.type} interview · {nextInterview.interview.durationMinutes} min
                    </p>
                    {nextInterview.interview.meetingLink && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={nextInterview.interview.meetingLink} target="_blank" rel="noopener noreferrer">
                          Join meeting
                        </a>
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recommended jobs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Briefcase className="h-5 w-5 text-primary" />
            Recommended for you
          </h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {jobsData?.data?.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {jobsData.data.slice(0, 4).map((job) => (
              <JobRow key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Briefcase className="h-7 w-7" />}
            title="No recommended jobs"
            description="Complete more courses to get better job recommendations."
          />
        )}
      </section>
    </StudentDashboard>
  );
}
