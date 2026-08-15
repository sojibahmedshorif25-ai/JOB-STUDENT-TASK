import Link from "next/link";
import { Code2, ExternalLink, Eye, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { Project, User } from "@/types";

const GRADIENTS = [
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-orange-500 via-amber-500 to-yellow-400",
  "from-rose-500 via-pink-500 to-fuchsia-500",
  "from-blue-500 via-indigo-500 to-violet-500",
];

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const author = project.author as User | undefined;
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/projects/${project._id}`} className="block">
        <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${gradient}`}>
          {project.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover" />
          ) : (
            <>
              <span className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
              <span className="text-4xl font-black text-white/80">{project.title[0]?.toUpperCase()}</span>
            </>
          )}
        </div>
      </Link>
      <CardContent className="space-y-3 p-4">
        <Link href={`/projects/${project._id}`}>
          <h3 className="line-clamp-1 font-semibold transition-colors group-hover:text-primary">{project.title}</h3>
        </Link>

        {author && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              {author.avatar ? (
                <AvatarImage src={author.avatar} alt={author.name} />
              ) : (
                <AvatarFallback className="text-[9px]">{getInitials(author.name)}</AvatarFallback>
              )}
            </Avatar>
            <span className="text-xs text-muted-foreground">{author.name}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {project.techStack?.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="secondary" className="font-normal">{tech}</Badge>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{project.likes}</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{project.views}</span>
          </div>
          <div className="flex gap-1">
            {project.githubUrl && (
              <Button variant="ghost" size="iconSm" asChild aria-label="GitHub repository">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
