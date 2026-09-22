"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MessagesSquare, Play, Sparkles, Timer, Trophy } from "lucide-react";

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
import { evaluateInterviewResponse, type InterviewFeedback } from "@/lib/ai-interview";
import { CodePlayground } from "@/components/features/code-playground";
import type { InterviewQuestion } from "@/types";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-success/10 text-success",
  Medium: "bg-warning/10 text-warning",
  Hard: "bg-destructive/10 text-destructive",
};

function QuestionCard({ question }: { question: InterviewQuestion }) {
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [showAIHint, setShowAIHint] = React.useState(false);

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
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAnswer((v) => !v)}
            className="text-muted-foreground"
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
            <ChevronDown className={cn("h-4 w-4 transition-transform", showAnswer && "rotate-180")} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAIHint((v) => !v)}
            className="text-primary hover:bg-primary/10"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {showAIHint ? "Hide Key Concepts" : "AI Key Concepts"}
          </Button>
        </div>

        {showAIHint && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="mb-1.5 font-semibold text-primary">💡 Interview Strategy & Key Talking Points:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Start with a high-level definition or problem statement.</li>
              <li>Explain the underlying mechanism (e.g. memory, event cycle, algorithm).</li>
              <li>Mention real-world trade-offs or performance considerations.</li>
              <li>Conclude with a brief production example from your projects.</li>
            </ul>
          </div>
        )}

        {showAnswer && question.answer && (
          <div className="rounded-lg bg-secondary/50 p-4 text-sm leading-relaxed text-muted-foreground">
            <p className="mb-1 font-semibold text-foreground">Model Answer</p>
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
  const [feedbacks, setFeedbacks] = React.useState<Record<number, InterviewFeedback>>({});
  const [overallScore, setOverallScore] = React.useState(0);

  const startTimer = React.useCallback(() => {
    setPhase("active");
    setCurrent(0);
    setAnswers({});
    setFeedbacks({});
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
    const fbMap: Record<number, InterviewFeedback> = {};
    let sum = 0;

    questions.forEach((q, idx) => {
      const fb = evaluateInterviewResponse(q.category, q.question, answers[idx] || "");
      fbMap[idx] = fb;
      sum += fb.score;
    });

    const avg = Math.round(sum / Math.max(questions.length, 1));
    setFeedbacks(fbMap);
    setOverallScore(avg);
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
      <Button size="lg" variant="gradient" onClick={startMock} className="gap-2 shadow-lg shadow-primary/20">
        <Sparkles className="h-4 w-4" />
        AI Mock Interview
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {phase === "start" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Mock Interview
                </DialogTitle>
                <DialogDescription>
                  Answer 5 technical questions under realistic interview timing. Our AI evaluator will assess your technical accuracy, keyword coverage, and structure.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Category</p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {["All", "JavaScript", "React", "Next.js", "Node.js", "MongoDB", "Behavioral"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={cn(
                        "rounded-lg border px-3.5 py-2.5 text-center text-sm font-medium transition-all",
                        category === c ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/30" : "hover:border-primary/40 text-muted-foreground",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={startTimer} disabled={questions.length === 0} className="w-full">
                <Play className="mr-2 h-4 w-4" /> Begin Interview
              </Button>
            </>
          )}

          {phase === "active" && questions.length > 0 && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-3">
                  <span>Question {current + 1} of {questions.length}</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-mono text-xs font-semibold">
                    <Timer className="h-3.5 w-3.5 text-primary" />
                    {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  <span className="font-semibold text-primary">{questions[current].category}</span> · {questions[current].difficulty}
                </DialogDescription>
              </DialogHeader>
              <p className="text-base font-semibold leading-relaxed text-foreground">{questions[current].question}</p>
              <Textarea
                rows={6}
                placeholder="Structure your answer: 1) Definition/Concept, 2) Technical mechanism, 3) Real-world example from your projects..."
                value={answers[current] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [current]: e.target.value }))}
                className="font-mono text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  disabled={current === 0}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  {(answers[current] || "").trim().split(/\s+/).filter(Boolean).length} words
                </span>
                {current < questions.length - 1 ? (
                  <Button size="sm" onClick={() => setCurrent((c) => c + 1)}>Next Question</Button>
                ) : (
                  <Button size="sm" variant="gradient" onClick={finishMock}>Submit for AI Evaluation</Button>
                )}
              </div>
            </>
          )}

          {phase === "done" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  AI Interview Evaluation Complete
                </DialogTitle>
                <DialogDescription>
                  Detailed technical feedback and benchmark analysis
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="flex flex-col items-center justify-center rounded-xl border bg-primary/5 p-4 text-center">
                    <p className="text-3xl font-extrabold text-primary">{overallScore}%</p>
                    <p className="text-xs font-medium text-muted-foreground">Overall Score</p>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-4 text-center">
                    <p className="text-2xl font-bold text-success">
                      {Math.round(Object.values(feedbacks).reduce((a, b) => a + b.accuracy, 0) / Math.max(questions.length, 1))}%
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">Terminology & Accuracy</p>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-4 text-center">
                    <p className="text-2xl font-bold text-blue-500">
                      {Math.round(Object.values(feedbacks).reduce((a, b) => a + b.clarity, 0) / Math.max(questions.length, 1))}%
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">Structure & Clarity</p>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-4 text-center">
                    <p className="text-2xl font-bold text-purple-500">
                      {Math.round(Object.values(feedbacks).reduce((a, b) => a + b.depth, 0) / Math.max(questions.length, 1))}%
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">Depth & Elaboration</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Question-by-Question AI Analysis</p>
                  {questions.map((q, idx) => {
                    const fb = feedbacks[idx];
                    if (!fb) return null;
                    return (
                      <div key={q._id} className="rounded-xl border bg-card p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm">Q{idx + 1}: {q.question}</p>
                          <Badge variant={fb.score >= 70 ? "success" : fb.score >= 50 ? "warning" : "destructive"}>
                            {fb.score}/100
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground italic">&ldquo;{fb.feedbackSummary}&rdquo;</p>
                        {fb.matchedKeywords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 text-xs">
                            <span className="font-medium text-success">Keywords matched:</span>
                            {fb.matchedKeywords.map((kw) => (
                              <span key={kw} className="rounded bg-success/10 px-1.5 py-0.5 font-mono text-success text-[11px]">{kw}</span>
                            ))}
                          </div>
                        )}
                        {fb.suggestedKeywords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 text-xs">
                            <span className="font-medium text-warning">Recommended terms:</span>
                            {fb.suggestedKeywords.map((kw) => (
                              <span key={kw} className="rounded bg-warning/10 px-1.5 py-0.5 font-mono text-warning text-[11px]">{kw}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button className="w-full" onClick={() => setOpen(false)}>Complete Session</Button>
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

        {/* Live Coding Sandbox */}
        <div className="pt-6">
          <CodePlayground />
        </div>
      </div>
    </PublicLayout>
  );
}
