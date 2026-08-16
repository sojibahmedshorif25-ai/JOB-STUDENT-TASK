"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-info/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,#6366f1_1px,transparent_0)] [background-size:32px_32px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              The all-in-one career platform
            </Badge>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Learn Skills.{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Build Projects.
              </span>{" "}
              Get Hired.
            </h1>

            <p className="max-w-lg text-lg text-muted-foreground">
              Master in-demand skills, build real-world projects, prepare for interviews and
              connect with opportunities—all in one platform.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="gradient" asChild>
                <Link href="/courses">
                  Explore Courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/jobs">
                  <Briefcase className="h-4 w-4" />
                  Find Jobs
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
              <div className="flex -space-x-3">
                {["JS", "RA", "MC", "AS"].map((initials, i) => (
                  <Avatar key={i} className="h-9 w-9 border-2 border-background">
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 font-semibold">
                  10,000+ students
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <p className="text-muted-foreground">joined SkillForge this year</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-2xl" aria-hidden="true" />
      <Card className="relative overflow-hidden border bg-card/90 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">SkillForge Dashboard</p>
              <p className="text-[11px] text-muted-foreground">Welcome back, Sojib</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4">
          <div className="col-span-2 space-y-4">
            <div className="rounded-xl border p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <BookOpen className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">Next.js Full Stack</p>
                    <p className="text-[10px] text-muted-foreground">Module 3 · Authentication</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">78%</span>
              </div>
              <Progress value={78} className="mt-3 h-1.5" />
            </div>

            <div className="rounded-xl border p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold">Skill Progress</p>
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              </div>
              <div className="space-y-2">
                {[
                  { name: "JavaScript", value: 92 },
                  { name: "React", value: 84 },
                  { name: "Next.js", value: 78 },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="w-16 text-[10px] text-muted-foreground">{s.name}</span>
                    <Progress value={s.value} className="h-1.5 flex-1" indicatorClassName="bg-success" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold">Recommended</p>
                <Briefcase className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-xs font-medium">Frontend Developer</p>
              <p className="text-[10px] text-muted-foreground">React · Next.js · TS</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-[9px]">Remote</Badge>
                <Badge variant="secondary" className="text-[9px]">$85k</Badge>
              </div>
            </div>

            <div className="rounded-xl border p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold">Application</p>
                <Award className="h-3.5 w-3.5 text-success" />
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Shortlisted
              </div>
            </div>

            <div className="rounded-xl border bg-primary p-3.5 text-primary-foreground">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold">Upcoming</p>
                <CalendarDays className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs font-medium">Technical Interview</p>
              <p className="text-[10px] opacity-80">Tomorrow · 10:00 AM</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
