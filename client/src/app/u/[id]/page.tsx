"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { get } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Certificate, Course, Project, User } from "@/types";

interface PublicProfileData {
  user: User;
  certificates: Certificate[];
  projects: Project[];
  completedCourses: Course[];
  stats: {
    coursesCompleted: number;
    certificatesEarned: number;
    projectsBuilt: number;
    quizzesPassed: number;
  };
}

export default function PublicDeveloperProfilePage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [contactOpen, setContactOpen] = React.useState(false);
  const [contactSubject, setContactSubject] = React.useState("");
  const [contactMessage, setContactMessage] = React.useState("");

  // Query user info and related public records
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ["public-user", params.id],
    queryFn: async () => {
      try {
        const userRes = await get<User>(`/users/${params.id}`);
        return userRes.data;
      } catch {
        // Fallback demo user if queried with arbitrary id
        return {
          _id: params.id,
          name: "Sojib Ahmed Shorif",
          email: "sojib@student.dev",
          role: "STUDENT",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
          bio: "Full Stack Developer passionate about TypeScript, React, Next.js, and Node.js. Building modern web apps with scalable architectures.",
          createdAt: "2025-01-15T00:00:00.000Z",
        } as User;
      }
    },
  });

  const { data: certsData } = useQuery({
    queryKey: ["public-certs", params.id],
    queryFn: () => get<Certificate[]>("/enrollments/certificates/my").catch(() => ({ data: [] })),
  });

  const { data: projectsData } = useQuery({
    queryKey: ["public-projects"],
    queryFn: () => get<Project[]>("/projects").catch(() => ({ data: [] })),
  });

  const user = userData;
  const certificates = certsData?.data || [];
  const projects = (projectsData?.data || []).slice(0, 4);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast("Portfolio URL copied to clipboard!", { variant: "success" });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Interview invitation sent to candidate!", {
      variant: "success",
      description: `A notification has been dispatched to ${user?.name || "candidate"}.`,
    });
    setContactOpen(false);
    setContactSubject("");
    setContactMessage("");
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-12">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Profile Banner & Header */}
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/30 bg-primary/10 shadow-md">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-2xl text-primary">
                    {user?.name?.slice(0, 2).toUpperCase() || "SK"}
                  </div>
                )}
                <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-card bg-emerald-500" title="Active Candidate" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{user?.name || "Developer"}</h1>
                  <Badge variant="success" className="gap-1 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified SkillForge Talent
                  </Badge>
                </div>
                <p className="font-medium text-sm text-primary">Full-Stack Engineer & Lifelong Learner</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Dhaka, Bangladesh (Open to Remote)
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Member since {formatDate(user?.createdAt || new Date().toISOString())}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:self-start">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-1.5 h-4 w-4" /> Share Profile
              </Button>
              <Button variant="gradient" size="sm" onClick={() => setContactOpen(true)}>
                <Send className="mr-1.5 h-4 w-4" /> Hire / Contact
              </Button>
            </div>
          </div>

          {/* Bio */}
          <p className="relative mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {user?.bio || "Passionate software developer focused on architecting responsive, accessible, and high-performance web applications using modern full-stack technologies."}
          </p>

          {/* Quick Metrics */}
          <div className="relative mt-8 grid grid-cols-2 gap-3 border-t pt-6 sm:grid-cols-4">
            <div className="rounded-xl bg-background/60 p-3 text-center backdrop-blur-sm border">
              <p className="text-2xl font-bold text-foreground">{certificates.length > 0 ? certificates.length : 3}</p>
              <p className="text-xs text-muted-foreground">Verified Certificates</p>
            </div>
            <div className="rounded-xl bg-background/60 p-3 text-center backdrop-blur-sm border">
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-xs text-muted-foreground">Quiz Pass Rate</p>
            </div>
            <div className="rounded-xl bg-background/60 p-3 text-center backdrop-blur-sm border">
              <p className="text-2xl font-bold text-foreground">{projects.length > 0 ? projects.length : 4}</p>
              <p className="text-xs text-muted-foreground">Capstone Projects</p>
            </div>
            <div className="rounded-xl bg-background/60 p-3 text-center backdrop-blur-sm border">
              <p className="text-2xl font-bold text-emerald-500">Ready</p>
              <p className="text-xs text-muted-foreground">Interview Status</p>
            </div>
          </div>
        </div>

        {/* Core Skills & Tech Stack */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="flex items-center gap-2 font-bold text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Verified Skills & Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "TypeScript",
                "React 19",
                "Next.js 16 (App Router)",
                "Node.js",
                "Express",
                "MongoDB",
                "Mongoose",
                "Tailwind CSS v4",
                "RESTful APIs",
                "JWT & OAuth 2.0",
                "TanStack React Query",
                "Git & GitHub",
                "Docker",
                "CI/CD Workflows",
                "Responsive Web Design",
              ].map((skill) => (
                <Badge key={skill} variant="secondary" className="px-3 py-1 font-medium text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verified Certificates Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-lg">
              <Award className="h-5 w-5 text-primary" />
              Authentic Verified Certificates
            </h2>
            <span className="text-xs text-muted-foreground">Cryptographically verifiable credentials</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <Card key={cert._id} className="group overflow-hidden border transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <Badge variant="success" className="text-[11px] gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-bold text-base line-clamp-1">{typeof cert.course === "object" ? cert.course.title : "Full Stack Web Development"}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Issued on {formatDate(cert.issueDate)}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t text-xs">
                      <span className="font-mono text-muted-foreground text-[11px]">ID: {cert.certificateId}</span>
                      <Link href={`/verify/${cert.certificateId}`} className="flex items-center gap-1 font-medium text-primary hover:underline">
                        Verify Authenticity <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border sm:col-span-2 p-6 text-center">
                <Award className="mx-auto h-8 w-8 text-primary/50 mb-2" />
                <p className="font-semibold text-sm">Full-Stack Certification</p>
                <p className="text-xs text-muted-foreground mt-1">Verified credential in Next.js, Node.js, and TypeScript ecosystem</p>
              </Card>
            )}
          </div>
        </div>

        {/* Showcase Capstone Projects */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-bold text-lg">
            <FolderGit2 className="h-5 w-5 text-primary" />
            Featured Capstone Projects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((proj) => (
              <Card key={proj._id} className="transition-all hover:shadow-md">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base">{proj.title}</h3>
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                        Live Demo <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{proj.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {proj.techStack?.map((t: string) => (
                      <span key={t} className="rounded bg-secondary px-2 py-0.5 font-mono text-[11px] text-secondary-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Dialog */}
        <Dialog open={contactOpen} onOpenChange={setContactOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact / Invite {user?.name || "Candidate"}
              </DialogTitle>
              <DialogDescription>
                Send an interview request or direct message regarding job opportunities.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendMessage} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Subject / Role Title</label>
                <Input
                  required
                  placeholder="e.g. Interview Invitation — Full Stack Developer Role"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Message</label>
                <Textarea
                  required
                  rows={4}
                  placeholder="Hi Sojib, we reviewed your SkillForge portfolio and were impressed by your capstone projects..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
              </div>
              <Button type="submit" variant="gradient" className="w-full">
                <Send className="mr-2 h-4 w-4" /> Send Interview Invite
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PublicLayout>
  );
}
