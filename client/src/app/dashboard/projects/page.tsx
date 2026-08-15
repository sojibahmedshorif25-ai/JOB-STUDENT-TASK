"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Code2, ExternalLink, FolderGit2, Plus, Trash2 } from "lucide-react";

import { StudentDashboard } from "@/components/layout/student-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { del, get, post, put } from "@/lib/api";
import type { Project } from "@/types";

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  techStack: z.string().min(1, "Add at least one technology"),
  githubUrl: z.string().url("Invalid URL").or(z.literal("")),
  liveUrl: z.string().url("Invalid URL").or(z.literal("")),
  published: z.boolean(),
});

type ProjectForm = z.infer<typeof projectSchema>;

const EMPTY_FORM: ProjectForm = { title: "", description: "", techStack: "", githubUrl: "", liveUrl: "", published: false };

export default function MyProjectsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Project | null>(null);
  const [deleting, setDeleting] = React.useState<Project | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-projects"],
    queryFn: () => get<Project[]>("/projects/mine"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectForm>({ resolver: zodResolver(projectSchema), defaultValues: EMPTY_FORM });

  const saveMutation = useMutation({
    mutationFn: (values: ProjectForm) => {
      const payload = {
        ...values,
        techStack: values.techStack.split(",").map((t) => t.trim()).filter(Boolean),
      };
      return editing
        ? put(`/projects/${editing._id}`, payload)
        : post("/projects", payload);
    },
    onSuccess: () => {
      toast(editing ? "Project updated" : "Project created", { variant: "success" });
      setDialogOpen(false);
      refetch();
      reset(EMPTY_FORM);
      setEditing(null);
    },
    onError: (error) => {
      toast("Failed to save project", {
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (projectId: string) => post(`/projects/${projectId}/publish`),
    onSuccess: () => {
      toast("Project visibility updated");
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => del(`/projects/${projectId}`),
    onSuccess: () => {
      toast("Project deleted", { variant: "info" });
      setDeleting(null);
      refetch();
    },
  });

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    reset({
      title: project.title,
      description: project.description,
      techStack: project.techStack.join(", "),
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      published: project.published || false,
    });
    setDialogOpen(true);
  };

  const projects = data?.data || [];

  return (
    <StudentDashboard headerTitle="Projects">
      <PageHeader title="My Projects" description="Build and showcase your projects to recruiters.">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="h-7 w-7" />}
          title="No projects yet"
          description="Create your first project to showcase your skills."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project._id} className="flex flex-col transition-all hover:shadow-md">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{project.title}</h3>
                  <Badge variant={project.published ? "success" : "muted"}>
                    {project.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{project.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.slice(0, 5).map((tech) => (
                    <Badge key={tech} variant="secondary" className="font-normal">{tech}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                  <div className="flex items-center gap-1">
                    {project.githubUrl && (
                      <Button variant="ghost" size="iconSm" asChild aria-label="GitHub">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Code2 className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button variant="ghost" size="iconSm" asChild aria-label="Live demo">
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="iconSm" onClick={() => router.push(`/projects/${project._id}`)} aria-label="View">
                      <FolderGit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button variant="ghost" size="sm" onClick={() => publishMutation.mutate(project._id)}>
                      {project.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(project)}>Edit</Button>
                    <Button variant="ghost" size="iconSm" onClick={() => setDeleting(project)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Project" : "Create Project"}</DialogTitle>
            <DialogDescription>
              Showcase your work to recruiters with a well described project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. DevMatch — Job Tracker" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} placeholder="What does your project do?" {...register("description")} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="techStack">Tech Stack (comma separated)</Label>
              <Input id="techStack" placeholder="React, Next.js, MongoDB" {...register("techStack")} />
              {errors.techStack && <p className="text-sm text-destructive">{errors.techStack.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input id="githubUrl" placeholder="https://github.com/..." {...register("githubUrl")} />
                {errors.githubUrl && <p className="text-sm text-destructive">{errors.githubUrl.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="liveUrl">Live URL</Label>
                <Input id="liveUrl" placeholder="https://..." {...register("liveUrl")} />
                {errors.liveUrl && <p className="text-sm text-destructive">{errors.liveUrl.message}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="published" {...register("published")} />
              <Label htmlFor="published" className="font-normal">Publish publicly to showcase</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saveMutation.isPending}>
                {editing ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete project?"
        description={`This will permanently delete "${deleting?.title}". This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
      />
    </StudentDashboard>
  );
}
