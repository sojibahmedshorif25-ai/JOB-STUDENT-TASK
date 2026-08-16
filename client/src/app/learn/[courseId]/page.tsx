"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  HelpCircle,
  PlayCircle,
  RotateCcw,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { RequireAuth } from "@/components/guard/require-auth";
import { useToast } from "@/components/ui/toast";
import { get, post, put } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Course, Enrollment, Lesson } from "@/types";

interface QuizResult {
  score: number;
  correctCount: number;
  incorrectCount: number;
  total: number;
  percentage: number;
  passed: boolean;
  results: Array<{ questionId?: string; correct: boolean; correctAnswer: string; explanation: string }>;
}

function QuizView({
  lesson,
  courseId,
  moduleId,
  onCompleted,
}: {
  lesson: Lesson;
  courseId: string;
  moduleId: string;
  onCompleted: () => void;
}) {
  const { toast } = useToast();
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [result, setResult] = React.useState<QuizResult | null>(null);

  const submitMutation = useMutation({
    mutationFn: () =>
      post<QuizResult>("/courses/quiz/submit", {
        courseId,
        moduleId,
        lessonId: lesson._id,
        answers,
      }),
    onSuccess: (res) => {
      setResult(res.data);
      toast(res.data.passed ? "Quiz passed! 🎉" : "Quiz completed", {
        variant: res.data.passed ? "success" : "warning",
        description: `Score: ${res.data.percentage}%`,
      });
      onCompleted();
    },
    onError: (error) => {
      toast("Quiz submission failed", {
        description: error instanceof Error ? error.message : "Please try again",
        variant: "error",
      });
    },
  });

  const questions = lesson.quiz?.questions || [];

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center rounded-2xl border bg-card p-8 text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Trophy className="h-8 w-8" />
          </span>
          <h3 className="text-2xl font-bold">{result.percentage}%</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.correctCount} correct · {result.incorrectCount} incorrect
          </p>
          <Badge variant={result.passed ? "success" : "destructive"} className="mt-3">
            {result.passed ? "Passed" : "Not passed"}
          </Badge>
          <Button variant="outline" className="mt-6" onClick={() => { setAnswers({}); setResult(null); }}>
            <RotateCcw className="h-4 w-4" />
            Retake quiz
          </Button>
        </div>

        <div className="space-y-4">
          {questions.map((q, qi) => {
            const r = result.results[qi];
            return (
              <Card key={qi}>
                <CardContent className="space-y-3 p-5">
                  <p className="font-medium">{qi + 1}. {q.question}</p>
                  <p className="text-sm text-muted-foreground">
                    Correct answer: <span className="font-semibold text-success">{r?.correctAnswer}</span>
                  </p>
                  {r?.explanation && (
                    <div className="rounded-lg bg-secondary/50 p-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Explanation: </span>
                      {r.explanation}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Quiz: {lesson.quiz?.title || lesson.title}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {Object.keys(answers).length}/{questions.length} answered
        </div>
      </div>
      <Progress value={(Object.keys(answers).length / Math.max(questions.length, 1)) * 100} className="h-2" />

      <div className="space-y-5">
        {questions.map((q, qi) => (
          <Card key={qi}>
            <CardContent className="space-y-3 p-5">
              <p className="font-medium">{qi + 1}. {q.question}</p>
              <div className="grid gap-2">
                {q.options.map((option) => {
                  const value = `${qi}-${option.text}`;
                  const selected = answers[q._id || qi] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q._id || String(qi)]: value }))}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                        selected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                          : "hover:border-primary/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs",
                          selected ? "border-primary bg-primary text-primary-foreground" : "border-muted",
                        )}
                      >
                        {String.fromCharCode(65 + option.text.charCodeAt(0) % 26) || qi + 1}
                      </span>
                      {option.text}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        size="lg"
        className="w-full"
        loading={submitMutation.isPending}
        disabled={Object.keys(answers).length < questions.length}
        onClick={() => submitMutation.mutate()}
      >
        Submit Quiz
      </Button>
    </div>
  );
}

function LearningContent({ courseId }: { courseId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [lessonComplete, setLessonComplete] = React.useState(false);

  const lessonId = searchParams.get("lesson") || "";

  const { data: enrollmentData, isLoading, isError, refetch } = useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: () => get<Enrollment>(`/enrollments/${courseId}`),
  });

  const { data: courseData } = useQuery({
    queryKey: ["course-by-id", courseId],
    queryFn: () => get<Course>(`/courses/${courseId}`),
  });

  const enrollment = enrollmentData?.data;
  const course = courseData?.data;

  React.useEffect(() => {
    if (!courseId) return;
    try {
      const stored = localStorage.getItem(`notes_${courseId}`);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate notes from localStorage on mount
        setNotes(JSON.parse(stored));
      }
    } catch {
      /* ignore */
    }
  }, [courseId]);

  const allLessons = React.useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.flatMap((m) =>
      m.lessons.map((l) => ({ ...l, _moduleId: m._id })),
    );
  }, [course]);

  const currentIndex = allLessons.findIndex((l) => l._id === lessonId);
  const currentLesson: (Lesson & { _moduleId: string }) | undefined = allLessons[currentIndex] || allLessons[0];
  const currentLessonId = currentLesson?._id || "";

  const isCompleted = enrollment?.progress.some(
    (p) => String(p.lessonId) === String(currentLessonId) && p.completed,
  );

  const completedCount = enrollment?.progress.filter((p) => p.completed).length || 0;
  const totalCount = allLessons.length;

  React.useEffect(() => {
    if (currentLessonId) {
      router.replace(`/learn/${courseId}?lesson=${currentLessonId}`, { scroll: false });
    }
  }, [currentLessonId, courseId, router]);

  const completeMutation = useMutation({
    mutationFn: () =>
      put<{ percentComplete: number; completed: boolean }>(`/enrollments/${courseId}/progress`, {
        courseId,
        lessonId: currentLessonId,
      }),
    onSuccess: (res) => {
      setLessonComplete(true);
      toast("Lesson completed! 🎉", {
        description: res.data.completed ? "Course completed — certificate earned!" : `Course progress: ${res.data.percentComplete}%`,
      });
      refetch();
    },
    onError: () => toast("Could not update progress", { variant: "error" }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !enrollment || !course || !currentLesson) {
    return (
      <div className="p-6">
        <ErrorState
          title="Learning content unavailable"
          description="You may not be enrolled in this course."
          onRetry={() => refetch()}
        />
        <Button className="mt-4" asChild>
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>
    );
  }

  const handleComplete = () => {
    completeMutation.mutate();
  };

  const goToLesson = (index: number) => {
    const next = allLessons[index];
    if (!next) return;
    router.push(`/learn/${courseId}?lesson=${next._id}`);
    setLessonComplete(false);
  };

  const saveNote = (text: string) => {
    const updated = { ...notes, [currentLessonId]: text };
    setNotes(updated);
    localStorage.setItem(`notes_${courseId}`, JSON.stringify(updated));
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="iconSm" onClick={() => router.push("/dashboard/courses")} aria-label="Back to courses">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight">{course.title}</p>
            <p className="text-xs text-muted-foreground">
              {enrollment.percentComplete}% complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <Progress value={enrollment.percentComplete} className="h-2 w-32" />
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Curriculum sidebar */}
        <aside className="w-full shrink-0 border-b bg-card lg:w-80 lg:border-b-0 lg:border-r lg:overflow-y-auto" style={{ maxHeight: "calc(100vh - 3.5rem)" }}>
          <div className="max-h-72 overflow-y-auto lg:max-h-none lg:overflow-y-auto">
          <div className="border-b p-4">
            <p className="text-sm font-semibold">Course content</p>
            <p className="text-xs text-muted-foreground">
              {completedCount}/{totalCount} lessons completed
            </p>
          </div>
          <nav className="space-y-4 p-3" aria-label="Curriculum">
            {course.modules?.map((module) => (
              <div key={module._id}>
                <p className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {module.title}
                </p>
                <div className="space-y-0.5">
                  {module.lessons.map((lesson) => {
                    const done = enrollment.progress.some(
                      (p) => String(p.lessonId) === String(lesson._id) && p.completed,
                    );
                    const active = String(lesson._id) === String(currentLessonId);
                    return (
                      <button
                        key={lesson._id}
                        onClick={() => {
                          router.push(`/learn/${courseId}?lesson=${lesson._id}`);
                          setLessonComplete(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                          active ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className={cn("h-4 w-4 shrink-0", active ? "text-primary-foreground" : "text-success")} />
                        ) : (
                          <Circle className={cn("h-4 w-4 shrink-0", active ? "text-primary-foreground/70" : "text-muted-foreground")} />
                        )}
                        <span className="flex-1 truncate">{lesson.title}</span>
                        {lesson.type === "quiz" && (
                          <HelpCircle className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          </div>
        </aside>

        {/* Lesson content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">{currentLesson.type}</Badge>
              {currentLesson.duration ? (
                <Badge variant="muted">{currentLesson.duration} min</Badge>
              ) : null}
              {isCompleted && <Badge variant="success">Completed</Badge>}
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{currentLesson.title}</h1>

            {currentLesson.type === "video" ? (
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border bg-gradient-to-br from-primary via-purple-500 to-accent">
                {currentLesson.videoUrl ? (
                  <video src={currentLesson.videoUrl} controls className="h-full w-full object-contain bg-black" />
                ) : (
                  <>
                    <span className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
                    <div className="flex flex-col items-center gap-3 text-white">
                      <PlayCircle className="h-20 w-20 opacity-80" />
                      <p className="text-sm opacity-80">Video lesson preview</p>
                    </div>
                  </>
                )}
              </div>
            ) : null}

            <Card>
              <CardContent className="space-y-4 p-6">
                <h2 className="flex items-center gap-2 font-semibold">
                  {currentLesson.type === "reading" ? <FileText className="h-5 w-5 text-info" /> : null}
                  Lesson content
                </h2>
                <div className="whitespace-pre-line leading-relaxed text-muted-foreground">
                  {currentLesson.content || "This lesson is part of the course curriculum. Content will be available in the full course."}
                </div>
              </CardContent>
            </Card>

            {currentLesson.type === "quiz" && (
              <QuizView
                lesson={currentLesson}
                courseId={courseId}
                moduleId={currentLesson._moduleId}
                onCompleted={() => refetch()}
              />
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="outline"
                onClick={() => goToLesson(currentIndex - 1)}
                disabled={currentIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={handleComplete}
                variant={lessonComplete || isCompleted ? "outline" : "gradient"}
                loading={completeMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCompleted || lessonComplete ? "Completed ✓" : "Mark as Complete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => goToLesson(currentIndex + 1)}
                disabled={currentIndex >= allLessons.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>

        {/* Notes sidebar */}
        <aside className="w-full shrink-0 border-t bg-card lg:w-80 lg:border-l lg:border-t-0 lg:overflow-y-auto" style={{ maxHeight: "calc(100vh - 3.5rem)" }}>
          <div className="border-b p-4">
            <p className="text-sm font-semibold">My Notes</p>
            <p className="text-xs text-muted-foreground">Saved automatically to this device</p>
          </div>
          <div className="p-4">
            <Textarea
              rows={10}
              placeholder="Take notes for this lesson…"
              value={notes[currentLessonId] || ""}
              onChange={(e) => saveNote(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Progress: {completedCount}/{totalCount} · {enrollment.percentComplete}%
            </p>
            <Progress value={enrollment.percentComplete} className="mt-2 h-1.5" />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function LearnPage() {
  const params = useParams<{ courseId: string }>();
  return (
    <RequireAuth roles={["STUDENT", "ADMIN"]}>
      <React.Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <LearningContent courseId={params.courseId} />
      </React.Suspense>
    </RequireAuth>
  );
}
