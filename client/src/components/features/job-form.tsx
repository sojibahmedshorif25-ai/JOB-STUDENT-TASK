"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { post, put } from "@/lib/api";
import type { Job } from "@/types";

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(1, "Location is required"),
  jobType: z.enum(["Full-time", "Part-time", "Internship", "Contract"]),
  remoteType: z.enum(["Remote", "Hybrid", "On-site"]),
  experienceLevel: z.string().optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  salaryCurrency: z.string().optional(),
  skills: z.string().min(1, "At least one skill is required"),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(["published", "draft", "closed"]),
});

type JobForm = z.infer<typeof jobSchema>;

const toLines = (value: string | undefined) =>
  value
    ? value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

export function JobForm({ job, editing }: { job?: Job; editing?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title || "",
      description: job?.description || "",
      location: job?.location || "",
      jobType: job?.jobType || "Full-time",
      remoteType: job?.remoteType || "On-site",
      experienceLevel: job?.experienceLevel || "",
      salaryMin: job?.salaryMin ? String(job.salaryMin) : "",
      salaryMax: job?.salaryMax ? String(job.salaryMax) : "",
      salaryCurrency: job?.salaryCurrency || "$",
      skills: job?.skills?.join(", ") || "",
      responsibilities: job?.responsibilities?.join("\n") || "",
      requirements: job?.requirements?.join("\n") || "",
      benefits: job?.benefits?.join("\n") || "",
      deadline: job?.deadline ? new Date(job.deadline).toISOString().slice(0, 16) : "",
      status: job?.status || "published",
    },
  });

  const submit = useMutation({
    mutationFn: (values: JobForm) => {
      const payload = {
        title: values.title,
        description: values.description,
        location: values.location,
        jobType: values.jobType,
        remoteType: values.remoteType,
        experienceLevel: values.experienceLevel || "Entry",
        salaryMin: values.salaryMin ? Number(values.salaryMin) : undefined,
        salaryMax: values.salaryMax ? Number(values.salaryMax) : undefined,
        salaryCurrency: values.salaryCurrency || "$",
        skills: values.skills.split(",").map((s) => s.trim()).filter(Boolean),
        responsibilities: toLines(values.responsibilities),
        requirements: toLines(values.requirements),
        benefits: toLines(values.benefits),
        deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
        status: values.status,
      };
      return editing && job ? put(`/jobs/${job._id}`, payload) : post("/jobs", payload);
    },
    onSuccess: () => {
      toast(editing ? "Job updated" : "Job published", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      router.push("/recruiter/jobs");
    },
    onError: (e: Error) => toast(e.message, { variant: "error" }),
  });

  const skills = useWatch({ control, name: "skills" });
  const skillTags = skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const status = useWatch({ control, name: "status" });

  return (
    <form onSubmit={handleSubmit((v) => submit.mutate(v))} className="max-w-3xl space-y-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <Briefcase className="h-4 w-4 text-primary" />
            Job details
          </h2>
          <div className="space-y-2">
            <Label htmlFor="title">Job title</Label>
            <Input id="title" placeholder="e.g. Frontend Developer" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={6} placeholder="Describe the role and responsibilities…" {...register("description")} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g. Dhaka, Bangladesh" {...register("location")} />
              {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience level</Label>
              <Input id="experienceLevel" placeholder="e.g. Entry, Mid, Senior" {...register("experienceLevel")} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job type</Label>
              <select id="jobType" className="w-full rounded-md border bg-background px-3 py-2 text-sm" {...register("jobType")}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="remoteType">Remote type</Label>
              <select id="remoteType" className="w-full rounded-md border bg-background px-3 py-2 text-sm" {...register("remoteType")}>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Salary min</Label>
              <Input id="salaryMin" type="number" placeholder="500" {...register("salaryMin")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Salary max</Label>
              <Input id="salaryMax" type="number" placeholder="1200" {...register("salaryMax")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryCurrency">Currency</Label>
              <Input id="salaryCurrency" placeholder="$" {...register("salaryCurrency")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Application deadline</Label>
            <Input id="deadline" type="datetime-local" {...register("deadline")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <h2 className="font-semibold">Skills & requirements</h2>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input id="skills" placeholder="React, TypeScript, Next.js" {...register("skills")} />
            {errors.skills && <p className="text-sm text-destructive">{errors.skills.message}</p>}
            {skillTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {skillTags.map((skill) => (
                  <span key={skill} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
            <Textarea id="responsibilities" rows={4} placeholder="Build and ship features…&#10;Collaborate with the team…" {...register("responsibilities")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (one per line)</Label>
            <Textarea id="requirements" rows={4} placeholder="2+ years of experience…&#10;Strong problem-solving skills…" {...register("requirements")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits (one per line)</Label>
            <Textarea id="benefits" rows={3} placeholder="Remote-friendly…&#10;Health insurance…" {...register("benefits")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="space-y-1">
            <Label htmlFor="status">Posting status</Label>
            <p className="text-xs text-muted-foreground">
              {status === "published" ? "Live — visible to students." : status === "draft" ? "Draft — not visible yet." : "Closed — no longer accepting applications."}
            </p>
          </div>
          <select id="status" className="rounded-md border bg-background px-3 py-2 text-sm" {...register("status")}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Button type="button" variant="outline" asChild>
          <Link href="/recruiter/jobs">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Link>
        </Button>
        <Button type="submit" loading={submit.isPending}>
          <Save className="h-4 w-4" />
          {editing ? "Save changes" : "Publish job"}
        </Button>
      </div>
    </form>
  );
}
