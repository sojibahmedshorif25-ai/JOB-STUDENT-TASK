import Link from "next/link";
import { Building2, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials, formatSalary, timeAgo, truncate } from "@/lib/utils";
import type { Job, Company } from "@/types";

export function JobCard({ job, compact = false }: { job: Job; compact?: boolean }) {
  const company = job.company as Company | undefined;

  return (
    <Card className="group flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-secondary text-sm font-bold text-primary">
            {company?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={company.name} className="h-full w-full rounded-lg object-cover" />
            ) : (
              getInitials(company?.name || "SF")
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Link href={`/jobs/${job._id}`}>
              <h3 className="line-clamp-1 font-semibold transition-colors group-hover:text-primary">
                {job.title}
              </h3>
            </Link>
            <p className="line-clamp-1 text-sm text-muted-foreground">{company?.name}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(job.createdAt)}</span>
        </div>

        {!compact && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{truncate(job.description, 140)}</p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {job.skills?.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="font-normal">
              {skill}
            </Badge>
          ))}
          {job.skills && job.skills.length > 4 && (
            <Badge variant="muted" className="font-normal">+{job.skills.length - 4}</Badge>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {job.jobType}
          </span>
          <span className="ml-auto font-medium text-foreground">
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          </span>
        </div>

        <Button size="sm" variant="outline" asChild className="w-full">
          <Link href={`/jobs/${job._id}`}>View Job</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function JobRow({ job }: { job: Job }) {
  const company = job.company as Company | undefined;
  return (
    <Link href={`/jobs/${job._id}`}>
      <Card className="flex items-center gap-4 p-4 transition-all hover:border-primary/50 hover:shadow-md">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-secondary font-bold text-primary">
          {company?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo} alt={company.name} className="h-full w-full rounded-lg object-cover" />
          ) : (
            getInitials(company?.name || "SF")
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold">{job.title}</h4>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{company?.name}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
          </div>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-sm font-semibold">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</p>
          <p className="text-xs text-muted-foreground">{job.jobType}</p>
        </div>
      </Card>
    </Link>
  );
}
