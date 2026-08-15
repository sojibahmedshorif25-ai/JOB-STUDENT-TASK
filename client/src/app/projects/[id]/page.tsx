"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Code2, ExternalLink, Eye, Heart } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { get, post } from "@/lib/api";
import { formatDate, getInitials } from "@/lib/utils";
import type { Project, User } from "@/types";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [liked, setLiked] = React.useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["project", params.id],
    queryFn: () => get<Project>(`/projects/${params.id}`),
  });

  const handleLike = async () => {
    try {
      await post(`/projects/${params.id}/like`);
      setLiked(true);
      refetch();
    } catch {
      toast("Please login to like projects", { variant: "info" });
    }
  };

  const project = data?.data;
  const author = project?.author as User | undefined;

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !project) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState onRetry={() => refetch()} />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-accent to-info sm:h-96">
          {project.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-7xl font-black text-white/80">{project.title[0]?.toUpperCase()}</span>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="secondary">{tech}</Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{project.title}</h1>
            {author && (
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  {author.avatar ? <AvatarImage src={author.avatar} alt={author.name} /> : <AvatarFallback>{getInitials(author.name)}</AvatarFallback>}
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{author.name}</p>
                  <p className="text-xs text-muted-foreground">{author.headline}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            {project.githubUrl && (
              <Button variant="outline" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Code2 className="h-4 w-4" />
                  Code
                </a>
              </Button>
            )}
            {project.liveUrl && (
              <Button variant="gradient" asChild>
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y py-3 text-sm text-muted-foreground">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 transition-colors hover:text-destructive"
          >
            <Heart className={liked ? "h-4 w-4 fill-destructive text-destructive" : "h-4 w-4"} />
            {project.likes || 0} likes
          </button>
          <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{project.views || 0} views</span>
          <span>Published {formatDate(project.createdAt)}</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold">About this project</h2>
          <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{project.description}</p>
        </div>

        {project.features?.length ? (
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Key features</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {project.features.map((feature) => (
                <Card key={feature}>
                  <CardContent className="p-4 text-sm">{feature}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </PublicLayout>
  );
}
