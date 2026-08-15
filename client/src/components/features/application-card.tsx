import Link from "next/link";
import { Briefcase, CalendarClock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate, formatSalary } from "@/lib/utils";
import { StatusBadge } from "@/components/features/status-badge";
import type { Application, Job, Company } from "@/types";

export function ApplicationCard({ application }: { application: Application }) {
  const job = application.job as Job | undefined;
  const company = job?.company as Company | undefined;

  return (
    <Card className="group p-4 transition-all hover:border-primary/50 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/jobs/${job?._id}`} className="font-semibold transition-colors group-hover:text-primary">
            {job?.title || "Job"}
          </Link>
          <p className="text-sm text-muted-foreground">{company?.name}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job?.jobType}</span>
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job?.location}</span>
        {job && <span className="font-medium text-foreground">{formatSalary(job.salaryMin, job.salaryMax)}</span>}
        <span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />Applied {formatDate(application.createdAt)}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
        {application.statusHistory.slice(-3).map((h, i) => (
          <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {h.status}
          </span>
        ))}
      </div>
    </Card>
  );
}
