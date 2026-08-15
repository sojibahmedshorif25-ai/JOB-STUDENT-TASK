"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  ListChecks,
  PlayCircle,
  Star,
  Users,
  FileText,
  HelpCircle,
} from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast";
import { get, post } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import type { Course, User } from "@/types";

const LESSON_ICONS: Record<string, React.ReactNode> = {
  video: <PlayCircle className="h-4 w-4 text-primary" />,
  reading: <FileText className="h-4 w-4 text-info" />,
  quiz: <HelpCircle className="h-4 w-4 text-warning" />,
};

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["course", params.slug],
    queryFn: () => get<Course & { isEnrolled?: boolean }>(`/courses/slug/${params.slug}`),
  });

  const enrollMutation = useMutation({
    mutationFn: () => post(`/enrollments/${courseId}`),
    onSuccess: () => {
      toast("Enrolled successfully!", { description: "Good luck with your learning journey!" });
      refetch();
      router.push(`/learn/${courseId}`);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Enrollment failed";
      if (!message.includes("already")) {
        toast("Enrollment failed", { description: message, variant: "error" });
      } else {
        router.push(`/learn/${courseId}`);
      }
    },
  });

  const course = data?.data;
  const courseId = course?._id;
  const instructor = course?.instructor as User | undefined;
  const isEnrolled = course?.isEnrolled;
  const totalLessons = course?.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0;

  const handleEnroll = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${params.slug}`);
      return;
    }
    enrollMutation.mutate();
  };

  return (
    <PublicLayout>
      {isLoading ? (
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      ) : isError || !course ? (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState onRetry={() => refetch()} />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-accent sm:h-80">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <>
                    <span className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
                    <PlayCircle className="h-20 w-20 text-white/80" />
                  </>
                )}
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{course.level}</Badge>
                  <Badge variant="outline">{course.category}</Badge>
                  {course.technology?.map((t) => (
                    <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>
                  ))}
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
                <p className="text-lg text-muted-foreground">{course.description}</p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <strong>{course.rating?.toFixed(1)}</strong>
                    <span className="text-muted-foreground">({course.ratingCount} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" /> {course.studentsEnrolled?.toLocaleString()} students
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" /> {course.durationHours} hours
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <ListChecks className="h-4 w-4" /> {totalLessons} lessons
                  </span>
                </div>

                {instructor && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {instructor.avatar ? <AvatarImage src={instructor.avatar} alt={instructor.name} /> : <AvatarFallback>{getInitials(instructor.name)}</AvatarFallback>}
                    </Avatar>
                    <div>
                      <p className="text-sm text-muted-foreground">Instructor</p>
                      <p className="text-sm font-semibold">{instructor.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enrollment card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-extrabold">
                        {course.price && course.price > 0 ? `$${course.price}` : "Free"}
                      </p>
                      {course.price && course.price > 0 && (
                        <p className="text-sm text-muted-foreground line-through">${Math.round(course.price * 1.5)}</p>
                      )}
                    </div>
                    {course.featured && <Badge variant="success">Featured</Badge>}
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    loading={enrollMutation.isPending}
                    onClick={handleEnroll}
                    variant={isEnrolled ? "outline" : "gradient"}
                  >
                    {isEnrolled ? "Go to Course" : "Enroll Now"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    30-day money-back guarantee · Lifetime access
                  </p>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{course.durationHours} hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Lessons</span>
                      <span className="font-medium">{totalLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Students</span>
                      <span className="font-medium">{course.studentsEnrolled?.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Body */}
          <section className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-10 lg:col-span-2">
              {course.longDescription && (
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold">About this course</h2>
                  <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{course.longDescription}</p>
                </div>
              )}

              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">What you&apos;ll learn</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {course.whatYouWillLearn.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {course.requirements && course.requirements.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold">Requirements</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {course.requirements.map((req) => (
                      <li key={req} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.modules && course.modules.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Course curriculum</h2>
                  <Accordion type="multiple" defaultValue={[course.modules[0]?._id || ""]}>
                    {course.modules.map((module) => (
                      <AccordionItem key={module._id} value={module._id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex flex-col items-start gap-1 text-left">
                            <span className="font-semibold">{module.title}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                              {module.lessons.length} lessons
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1">
                            {module.lessons.map((lesson) => (
                              <li key={lesson._id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-secondary/50">
                                {LESSON_ICONS[lesson.type] || <BookOpen className="h-4 w-4" />}
                                <span className="flex-1">{lesson.title}</span>
                                {lesson.duration ? (
                                  <span className="text-xs text-muted-foreground">{lesson.duration} min</span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>

            {/* Sidebar extras */}
            <div className="space-y-6">
              <Card>
                <CardContent className="space-y-3 p-5">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-4 w-4 text-primary" /> What you get
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Certificate of completion</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Quizzes with explanations</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Progress tracking</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Real-world projects</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      )}
    </PublicLayout>
  );
}
