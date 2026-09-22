"use client";

import * as React from "react";
import { Check, Copy, FileCode2, Globe, Lock, Play, Server, ShieldCheck, Terminal } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  category: "Auth" | "Courses" | "Jobs" | "Interview" | "Certificates" | "Resume" | "Admin";
  authRequired: boolean;
  role?: string;
  summary: string;
  requestBody?: Record<string, any>;
  responseExample: Record<string, any>;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/health",
    category: "Auth",
    authRequired: false,
    summary: "System health check and database connectivity probe",
    responseExample: { success: true, status: "ok", db: "connected", timestamp: "2026-09-22T04:00:00.000Z" },
  },
  {
    method: "POST",
    path: "/api/auth/register",
    category: "Auth",
    authRequired: false,
    summary: "Register new user account (Student or Recruiter)",
    requestBody: { name: "Sojib Ahmed", email: "sojib@example.dev", password: "password123", role: "STUDENT" },
    responseExample: { success: true, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6...", user: { id: "65b...", name: "Sojib Ahmed", role: "STUDENT" } },
  },
  {
    method: "POST",
    path: "/api/auth/login",
    category: "Auth",
    authRequired: false,
    summary: "Authenticate credentials and obtain JWT Bearer token",
    requestBody: { email: "sojib@student.dev", password: "password123" },
    responseExample: { success: true, token: "eyJhbGciOiJIUzI1NiIsIn...", user: { id: "65b...", email: "sojib@student.dev", role: "STUDENT" } },
  },
  {
    method: "GET",
    path: "/api/courses",
    category: "Courses",
    authRequired: false,
    summary: "List all courses with filtering by category, level, and keyword search",
    responseExample: {
      success: true,
      data: [
        {
          _id: "65b12a3f...",
          title: "Full-Stack Web Development with Next.js & Node.js",
          level: "Beginner to Advanced",
          enrolledCount: 1420,
          modulesCount: 8,
          durationHours: 42,
        },
      ],
    },
  },
  {
    method: "POST",
    path: "/api/enrollments/quiz/submit",
    category: "Courses",
    authRequired: true,
    summary: "Submit quiz answers, compute instant score and issue certificate upon completion",
    requestBody: { courseId: "65b12a3f...", lessonId: "65b99a...", answers: [{ questionIndex: 0, selectedOption: 2 }] },
    responseExample: { success: true, score: 100, passed: true, certificateIssued: true, certificateId: "SKILL-8F92-491A" },
  },
  {
    method: "GET",
    path: "/api/jobs",
    category: "Jobs",
    authRequired: false,
    summary: "Browse active job openings with pagination, salary filtering, and remote flags",
    responseExample: {
      success: true,
      data: [
        {
          _id: "65c91b...",
          title: "Senior Full Stack Engineer",
          company: { name: "Vercel", logo: "https://..." },
          salary: "$120,000 - $150,000",
          location: "Remote",
          skills: ["React", "Next.js", "TypeScript", "Node.js"],
        },
      ],
    },
  },
  {
    method: "POST",
    path: "/api/jobs/:id/apply",
    category: "Jobs",
    authRequired: true,
    role: "STUDENT",
    summary: "Submit a job application with customized resume link and cover letter",
    requestBody: { resumeUrl: "https://...", coverNote: "Excited about the Full Stack role..." },
    responseExample: { success: true, application: { id: "65d88...", status: "SUBMITTED" } },
  },
  {
    method: "GET",
    path: "/api/enrollments/certificates/verify/:id",
    category: "Certificates",
    authRequired: false,
    summary: "Publicly verify authenticity of a candidate certificate by unique serial hash",
    responseExample: {
      success: true,
      data: {
        certificateId: "SKILL-8F92-491A",
        issueDate: "2026-03-15T12:00:00.000Z",
        user: { name: "Sojib Ahmed Shorif" },
        course: { title: "Full Stack Web Development" },
      },
    },
  },
  {
    method: "GET",
    path: "/api/interview/mock",
    category: "Interview",
    authRequired: false,
    summary: "Fetch curated mock interview questions with difficulty & timed constraints",
    responseExample: {
      success: true,
      data: [
        { _id: "65e1...", question: "Explain the JavaScript event loop and microtask queue.", difficulty: "Medium", category: "JavaScript" },
      ],
    },
  },
  {
    method: "GET",
    path: "/api/admin/stats",
    category: "Admin",
    authRequired: true,
    role: "ADMIN",
    summary: "Platform aggregation analytics (active students, recruiter postings, completion rates)",
    responseExample: {
      success: true,
      data: { totalUsers: 1840, totalCourses: 24, totalJobs: 58, certificatesIssued: 312 },
    },
  },
];

const METHOD_COLORS = {
  GET: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  POST: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  PUT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  PATCH: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  DELETE: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

export default function ApiDocsPage() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = React.useState<string>("All");
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const categories = ["All", "Auth", "Courses", "Jobs", "Certificates", "Interview", "Admin"];

  const filteredEndpoints = ENDPOINTS.filter(
    (e) => activeCategory === "All" || e.category === activeCategory
  );

  const copyCurl = (ep: Endpoint, idx: number) => {
    const baseUrl = "https://job-student-task.onrender.com";
    let cmd = `curl -X ${ep.method} "${baseUrl}${ep.path}"`;
    if (ep.authRequired) cmd += ` \\\n  -H "Authorization: Bearer YOUR_JWT_TOKEN"`;
    if (ep.requestBody) {
      cmd += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(ep.requestBody)}'`;
    }
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    toast("cURL command copied to clipboard!", { variant: "success" });
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            title="Interactive REST API Reference"
            description="Explore and test SkillForge's enterprise REST API architecture with full endpoint schemas."
          />
          <div className="flex items-center gap-2">
            <Badge variant="success" className="gap-1 px-3 py-1 text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              REST API v1.0
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1 text-xs">
              <Server className="h-3.5 w-3.5 text-primary" />
              OpenAPI 3.0 Compatible
            </Badge>
          </div>
        </div>

        {/* Categories Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {categories.map((c) => (
              <TabsTrigger key={c} value={c} className="text-xs">
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Endpoints List */}
        <div className="space-y-4">
          {filteredEndpoints.map((ep, idx) => (
            <Card key={idx} className="overflow-hidden border shadow-sm transition-all hover:border-primary/40">
              <CardContent className="p-0">
                {/* Header bar */}
                <div className="flex flex-col gap-3 border-b bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`rounded-md border px-2.5 py-1 font-mono text-xs font-bold ${
                        METHOD_COLORS[ep.method]
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-semibold text-foreground">{ep.path}</span>
                    {ep.authRequired && (
                      <Badge variant="outline" className="gap-1 text-[11px] text-muted-foreground">
                        <Lock className="h-3 w-3 text-amber-500" />
                        {ep.role ? `${ep.role} Auth` : "JWT Auth"}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCurl(ep, idx)}
                    className="h-8 text-xs gap-1.5 self-start sm:self-auto"
                  >
                    {copiedIndex === idx ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedIndex === idx ? "Copied" : "Copy cURL"}
                  </Button>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">{ep.summary}</p>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* Request payload */}
                    {ep.requestBody && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Terminal className="h-3.5 w-3.5" /> Request Body (JSON)
                        </div>
                        <pre className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto">
                          {JSON.stringify(ep.requestBody, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Response payload */}
                    <div className={`space-y-1.5 ${!ep.requestBody ? "lg:col-span-2" : ""}`}>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <FileCode2 className="h-3.5 w-3.5" /> 200 OK Response Schema
                      </div>
                      <pre className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                        {JSON.stringify(ep.responseExample, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
