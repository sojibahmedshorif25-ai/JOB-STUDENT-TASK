"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, Sparkles, TrendingUp, Search, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Resume } from "@/types";

interface Props {
  resume: Partial<Resume>;
  onApplyImprovement?: (field: string, value: string) => void;
}

const TARGET_ROLE_KEYWORDS: Record<string, string[]> = {
  "Full-Stack Developer": [
    "React",
    "Next.js",
    "Node.js",
    "TypeScript",
    "Express",
    "MongoDB",
    "REST API",
    "Tailwind CSS",
    "Git",
    "Docker",
    "JWT",
    "Redux / TanStack Query",
    "CI/CD",
  ],
  "Frontend Developer": [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript ES6+",
    "Tailwind CSS",
    "HTML5/CSS3",
    "Responsive Design",
    "TanStack Query",
    "Performance Optimization",
    "UI/UX",
    "Accessibility (a11y)",
  ],
  "Backend Developer": [
    "Node.js",
    "Express",
    "TypeScript",
    "MongoDB / PostgreSQL",
    "RESTful APIs",
    "JWT / OAuth",
    "Database Indexing",
    "Docker",
    "Redis",
    "Unit Testing",
    "Microservices",
  ],
  "Fullstack Developer": [
    "MongoDB",
    "Express.js",
    "React.js",
    "Node.js",
    "Mongoose",
    "JWT Authentication",
    "Tailwind CSS",
    "REST API",
    "Cloudinary",
    "Vercel / Render Deployment",
  ],
};

const POWER_ACTION_VERBS = [
  "Architected",
  "Engineered",
  "Spearheaded",
  "Optimized",
  "Developed",
  "Deployed",
  "Automated",
  "Scaled",
  "Streamlined",
];

export function ResumeAiAnalyzer({ resume }: Props) {
  const [targetRole, setTargetRole] = React.useState("Full-Stack Developer");
  const [analyzing, setAnalyzing] = React.useState(false);

  const keywords = TARGET_ROLE_KEYWORDS[targetRole] || TARGET_ROLE_KEYWORDS["Full-Stack Developer"];

  // Extract all text content from resume
  const allResumeText = React.useMemo(() => {
    const parts: string[] = [];
    if (resume.personal?.fullName) parts.push(resume.personal.fullName);
    if (resume.personal?.title) parts.push(resume.personal.title);
    if (resume.personal?.summary) parts.push(resume.personal.summary);
    if (resume.personal?.email) parts.push(resume.personal.email);
    if (resume.personal?.github) parts.push(resume.personal.github);
    if (resume.personal?.linkedin) parts.push(resume.personal.linkedin);

    resume.sections?.forEach((sec) => {
      sec.items?.forEach((it) => {
        if (it.title) parts.push(it.title);
        if (it.subtitle) parts.push(it.subtitle);
        if (it.description) parts.push(it.description);
        if (it.name) parts.push(it.name);
      });
    });

    return parts.join(" ").toLowerCase();
  }, [resume]);

  const matchedKeywords = keywords.filter((kw) =>
    allResumeText.includes(kw.toLowerCase().split("/")[0].trim())
  );
  const missingKeywords = keywords.filter(
    (kw) => !allResumeText.includes(kw.toLowerCase().split("/")[0].trim())
  );

  // ATS Score Calculation
  const scoreDetails = React.useMemo(() => {
    let score = 0;
    const checks: Array<{ label: string; passed: boolean; tip: string }> = [];

    // 1. Contact completeness (20 pts)
    const hasContact =
      Boolean(resume.personal?.fullName) &&
      Boolean(resume.personal?.email) &&
      (Boolean(resume.personal?.github) || Boolean(resume.personal?.linkedin));
    if (hasContact) score += 20;
    checks.push({
      label: "Contact & Social Profiles",
      passed: hasContact,
      tip: hasContact ? "Complete contact info provided." : "Add GitHub and LinkedIn profile URLs.",
    });

    // 2. Summary quality (20 pts)
    const summaryLen = resume.personal?.summary?.trim().split(/\s+/).length || 0;
    const summaryPassed = summaryLen >= 20;
    if (summaryPassed) score += 20;
    else if (summaryLen > 5) score += 10;
    checks.push({
      label: "Professional Summary",
      passed: summaryPassed,
      tip: summaryPassed
        ? "Concise and informative professional summary."
        : "Expand summary to 30-50 words highlighting your specialty and impact.",
    });

    // 3. Keyword Match Ratio (35 pts)
    const kwRatio = matchedKeywords.length / Math.max(keywords.length, 1);
    const kwScore = Math.round(kwRatio * 35);
    score += kwScore;
    checks.push({
      label: `Role Keywords (${matchedKeywords.length}/${keywords.length})`,
      passed: kwRatio >= 0.6,
      tip:
        kwRatio >= 0.6
          ? "Strong keyword alignment with role."
          : `Include key industry terms: ${missingKeywords.slice(0, 3).join(", ")}.`,
    });

    // 4. Projects & Experience sections (25 pts)
    const hasProjects = resume.sections?.some(
      (s) => s.type === "projects" && s.items && s.items.length > 0
    );
    const hasSkills = resume.sections?.some(
      (s) => s.type === "skills" && s.items && s.items.length >= 3
    );
    if (hasProjects && hasSkills) score += 25;
    else if (hasProjects || hasSkills) score += 15;
    checks.push({
      label: "Projects & Skills Sections",
      passed: Boolean(hasProjects && hasSkills),
      tip: "Include at least 2 showcase projects with measurable achievements.",
    });

    return { totalScore: Math.min(score, 100), checks };
  }, [resume, matchedKeywords, keywords, missingKeywords]);

  const handleScan = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 500);
  };

  return (
    <Card className="border-primary/20 bg-card/60 shadow-sm backdrop-blur-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Resume ATS Analyzer</h3>
              <p className="text-xs text-muted-foreground">Scan your resume against target tech roles</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="h-8 rounded-md border bg-background px-2 text-xs font-medium"
            >
              {Object.keys(TARGET_ROLE_KEYWORDS).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <Button size="sm" variant="outline" onClick={handleScan} disabled={analyzing} className="h-8 text-xs">
              <Search className="mr-1 h-3.5 w-3.5" />
              {analyzing ? "Scanning..." : "Re-Scan"}
            </Button>
          </div>
        </div>

        {/* Score & Gauge */}
        <div className="grid gap-3 rounded-xl border bg-primary/5 p-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 sm:col-span-1">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl font-black text-xl text-white shadow ${
                scoreDetails.totalScore >= 80
                  ? "bg-emerald-500"
                  : scoreDetails.totalScore >= 60
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
            >
              {scoreDetails.totalScore}%
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ATS Score</p>
              <p className="font-bold text-sm">
                {scoreDetails.totalScore >= 80
                  ? "Interview Ready 🎉"
                  : scoreDetails.totalScore >= 60
                  ? "Good - Needs Polish"
                  : "Needs Optimization"}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex justify-between text-xs font-medium">
              <span>ATS Compatibility Index</span>
              <span>{scoreDetails.totalScore}/100</span>
            </div>
            <Progress value={scoreDetails.totalScore} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              Higher score increases pass rate through automated recruiter screening systems.
            </p>
          </div>
        </div>

        {/* ATS Checks */}
        <div className="grid gap-2 sm:grid-cols-2">
          {scoreDetails.checks.map((chk, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-lg border bg-background/50 p-2.5 text-xs"
            >
              {chk.passed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              )}
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">{chk.label}</p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">{chk.tip}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Keywords breakdown */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Target Role Keywords:</span>
            <span className="text-muted-foreground">
              {matchedKeywords.length} of {keywords.length} present
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw) => {
              const present = matchedKeywords.includes(kw);
              return (
                <Badge
                  key={kw}
                  variant={present ? "success" : "muted"}
                  className={`text-[11px] font-mono ${
                    present ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "opacity-60"
                  }`}
                >
                  {present ? "✓ " : "+ "}
                  {kw}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* AI Action Verb recommendations */}
        <div className="rounded-lg border border-primary/20 bg-secondary/30 p-3 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-primary">
            <Wand2 className="h-3.5 w-3.5" />
            <span>Pro Resume Tip — High Impact Bullet Points</span>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Use quantifiable impact verbs:{" "}
            <span className="font-semibold text-foreground font-mono">
              {POWER_ACTION_VERBS.slice(0, 5).join(", ")}
            </span>
            . Example: &ldquo;<em>Architected REST API in Node.js/Express handling 10k+ daily queries with 40% lower response latency.</em>&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
