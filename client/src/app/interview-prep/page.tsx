"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MessagesSquare, Play, Timer, Trophy } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast";
import { get, post } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { InterviewQuestion } from "@/types";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-success/10 text-success",
  Medium: "bg-warning/10 text-warning",
  Hard: "bg-destructive/10 text-destructive",
};

function QuestionCard({ question }: { question: InterviewQuestion }) {
  const [showAnswer, setShowAnswer] = React.useState(false);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{question.category}</Badge>
            {question.topic && <Badge variant="muted">{question.topic}</Badge>}
            <Badge className={DIFFICULTY_COLORS[question.difficulty]}>{question.difficulty}</Badge>
          </div>
        </div>
        <p className="font-medium leading-relaxed">{question.question}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAnswer((v) => !v)}
            className="text-muted-foreground"
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
            <ChevronDown className={cn("h-4 w-4 transition-transform", showAnswer && "rotate-180")} />
          </Button>
        </div>
        {showAnswer && question.answer && (
          <div className="rounded-lg bg-secondary/50 p-4 text-sm leading-relaxed text-muted-foreground">
            <p className="mb-1 font-semibold text-foreground">Answer</p>
            {question.answer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MockInterview() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [category, setCategory] = React.useState("All");
  const [current, setCurrent] = React.useState(0);
  const [questions, setQuestions] = React.useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [seconds, setSeconds] = React.useState(0);
  const [phase, setPhase] = React.useState<"start" | "active" | "done">("start");
  const [result, setResult] = React.useState<{ score: number; strengths: string[]; weak: string[] } | null>(null);

  const startTimer = React.useCallback(() => {
    setPhase("active");
    setCurrent(0);
    setAnswers({});
    setSeconds(0);
  }, []);

  React.useEffect(() => {
    if (phase !== "active") return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const startMock = async () => {
    if (!isAuthenticated) {
      toast("Login to practice a mock interview", { variant: "info" });
      return;
    }
    setOpen(true);
    setPhase("start");
    try {
      const res = await get<InterviewQuestion[]>(`/interview/mock?category=${category}&count=5`);
      setQuestions(res.data);
    } catch {
      setQuestions([]);
    }
  };

  const finishMock = async () => {
    const answered = questions
      .filter((_, i) => answers[i] && answers[i].trim().length > 10)
      .length;
    const score = Math.round((answered / Math.max(questions.length, 1)) * 100);
    setResult({
      score,
      strengths:
        score >= 60
          ? ["You gave complete, thoughtful answers", "Good coverage of the topic"]
          : ["You attempted all questions"],
      weak: score < 60 ? ["Answers were too brief", "Add more technical detail"] : [],
    });
    setPhase("done");

    for (const q of questions) {
      await post("/interview/progress", {
        category: q.category,
        questionId: q._id,
        answer: answers[questions.indexOf(q)],
        timeTakenSeconds: seconds,
      }).catch(() => undefined);
    }
  };

  return (
    <>
      <Button size="lg" variant="gradient" onClick={startMock}>
        <Play className="h-4 w-4" />
        Start Mock Interview
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          {phase === "start" && (
            <>
              <DialogHeader>
                <DialogTitle>Mock Interview</DialogTitle>
                <DialogDescription>
                  Answer 5 questions on the spot. We&apos;ll score your responses and show your strengths
                  and weak areas at the end.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                {["All", "JavaScript", "React", "Next.js", "Node.js", "MongoDB", "Behavioral"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all",
                      category === c ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "hover:border-primary/40",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <Button onClick={startTimer} disabled={questions.length === 0}>
                Begin Interview
              </Button>
            </>
          )}

          {phase === "active" && questions.length > 0 && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-3">
                  <span>Question {current + 1} of {questions.length}</span>
                  <span className="flex items-center gap-1.5 text-base font-mono">
                    <Timer className="h-4 w-4" />
                    {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {questions[current].category} · {questions[current].difficulty}
                </DialogDescription>
              </DialogHeader>
              <p className="text-lg font-medium leading-relaxed">{questions[current].question}</p>
              <Textarea
                rows={5}
                placeholder="Type your answer here… (aim for a detailed, structured response)"
                value={answers[current] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [current]: e.target.value }))}
              />
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  disabled={current === 0}
                >
                  Previous
                </Button>
                {current < questions.length - 1 ? (
                  <Button onClick={() => setCurrent((c) => c + 1)}>Next Question</Button>
                ) : (
                  <Button onClick={finishMock}>Finish Interview</Button>
                )}
              </div>
            </>
          )}

          {phase === "done" && result && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  Interview complete!
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-xl border bg-secondary/30 p-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-foreground">
                    {result.score}%
                  </div>
                  <div>
                    <p className="font-semibold">Your Score</p>
                    <p className="text-sm text-muted-foreground">Based on answer completeness</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-success">Strengths</p>
                  {result.strengths.map((s) => (
                    <p key={s} className="text-sm text-muted-foreground">• {s}</p>
                  ))}
                </div>
                {result.weak.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-destructive">Areas to improve</p>
                    {result.weak.map((w) => (
                      <p key={w} className="text-sm text-muted-foreground">• {w}</p>
                    ))}
                  </div>
                )}
                <Button className="w-full" onClick={() => setOpen(false)}>Done</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function InterviewPrepPage() {
  const [category, setCategory] = React.useState("All");

  const { data: categoriesData } = useQuery({
    queryKey: ["interview-categories"],
    queryFn: () => get<Array<{ name: string; count: number }>>("/interview/questions/categories"),
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["interview-questions", category],
    queryFn: () => get<InterviewQuestion[]>(`/interview/questions?category=${category}`),
  });

  const categories = ["All", ...(categoriesData?.data?.map((c) => c.name) || [])];

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            title="Interview Preparation"
            description="Practice real interview questions with answers, hints and a timed mock interview."
          />
          <MockInterview />
        </div>

        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="flex h-auto flex-wrap justify-start gap-1 overflow-x-auto">
            {categories.slice(0, 8).map((c) => (
              <TabsTrigger key={c} value={c} className="capitalize">
                {c}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={category} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 w-full rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : !data?.data?.length ? (
              <EmptyState
                icon={<MessagesSquare className="h-7 w-7" />}
                title="No questions yet"
                description="More questions are being added for this category."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {data.data.map((q) => (
                  <QuestionCard key={q._id} question={q} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  );
}
