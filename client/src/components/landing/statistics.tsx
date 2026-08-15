"use client";

import { BookOpen, Briefcase, FolderGit2, Users } from "lucide-react";

const STATS = [
  { value: "10K+", label: "Students", icon: Users },
  { value: "500+", label: "Courses", icon: BookOpen },
  { value: "2K+", label: "Projects", icon: FolderGit2 },
  { value: "1K+", label: "Jobs", icon: Briefcase },
];

export function Statistics() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-6 rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <stat.icon className="h-5 w-5" />
            </span>
            <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
