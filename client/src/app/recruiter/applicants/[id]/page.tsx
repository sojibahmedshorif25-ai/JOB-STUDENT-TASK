"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, ExternalLink, FileText, Mail, MapPin } from "lucide-react";

import { RecruiterDashboard } from "@/components/layout/recruiter-dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { useToast } from "@/components/ui/toast";
import { get, post, put } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Application, Interview } from "@/types";

const STATUS_OPTIONS = ["Applied", "Shortlisted", "Interview", "Offer", "Rejected"];

export default function ApplicantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newStatus, setNewStatus] = React.useState("");
  const [statusNote, setStatusNote] = React.useState("");
  const [interviewType, setInterviewType] = React.useState("Technical");
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [duration, setDuration] = React.useState("60");
  const [meetingLink, setMeetingLink] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["application", params.id],
    queryFn: () => get<Application>(`/applications/${params.id}`),
  });

  const application = data?.data;
  const student = typeof application?.student === "object" ? application.student : undefined;
  const job = typeof application?.job === "object" ? application.job : undefined;
  const interview = typeof application?.interview === "object" ? (application.interview as Interview) : undefined;

  const updateStatus = useMutation({
    mutationFn: () => put(`/applications/${params.id}/status`, { status: newStatus, note: statusNote }),
    onSuccess: () => {
      toast("Application status updated", { variant: "success" });
      setStatusNote("");
      queryClient.invalidateQueries({ queryKey: ["application"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-applications"] });
    },
    onError: (e: Error) => toast(e.message, { variant: "error" }),
  });

  const schedule = useMutation({
    mutationFn: () =>
      post("/interview/schedule", {
        applicationId: params.id,
        type: interviewType,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: Number(duration),
        meetingLink,
        notes,
      }),
    onSuccess: () => {
      toast("Interview scheduled", { variant: "success" });
      setScheduledAt("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["application"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-applications"] });
    },
    onError: (e: Error) => toast(e.message, { variant: "error" }),
  });

  if (isLoading) {
    return (
      <RecruiterDashboard headerTitle="Application">
        <Skeleton className="h-96 w-full rounded-xl" />
      </RecruiterDashboard>
    );
  }

  if (isError || !application) {
    return (
      <RecruiterDashboard headerTitle="Application">
        <ErrorState onRetry={() => refetch()} />
      </RecruiterDashboard>
    );
  }

  const resumeUrl = application.resumeUrl || (typeof application.resume === "string" ? application.resume : "");

  return (
    <RecruiterDashboard headerTitle="Application">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="iconSm" onClick={() => router.push("/recruiter/applicants")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-tight">{student?.name || "Applicant"}</h1>
          <p className="truncate text-sm text-muted-foreground">
            Application for <span className="font-medium">{job?.title || "job"}</span>
          </p>
        </div>
        <Badge className="ml-auto" variant={application.status === "Offer" ? "success" : application.status === "Rejected" ? "destructive" : application.status === "Interview" ? "warning" : "secondary"}>
          {application.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-semibold">Candidate profile</h2>
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {(student?.name || "?").charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-lg font-semibold">{student?.name}</p>
                  <p className="text-sm text-muted-foreground">{student?.headline || "No headline"}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {student?.email && (
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{student.email}</span>
                    )}
                    {student?.location && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{student.location}</span>
                    )}
                  </div>
                </div>
              </div>
              {student?.skills && student.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              {student?.bio && <p className="text-sm text-muted-foreground">{student.bio}</p>}
            </CardContent>
          </Card>

          {application.coverLetter && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-3 font-semibold">Cover letter</h2>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{application.coverLetter}</p>
              </CardContent>
            </Card>
          )}

          {application.expectedSalary != null && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-3 font-semibold">Application details</h2>
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Expected salary</p>
                    <p className="font-medium">${application.expectedSalary}</p>
                  </div>
                  {application.availability && (
                    <div>
                      <p className="text-muted-foreground">Availability</p>
                      <p className="font-medium">{application.availability}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Applied</p>
                    <p className="font-medium">{formatDate(application.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {resumeUrl && (
            <Button asChild variant="outline" className="w-full">
              <a href={resumeUrl} target="_blank" rel="noreferrer">
                <FileText className="h-4 w-4" />
                View resume
              </a>
            </Button>
          )}

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-semibold">Update status</h2>
              <div className="space-y-2">
                <Label htmlFor="status">New status</Label>
                <select id="status" value={newStatus || application.status} onChange={(e) => setNewStatus(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusNote">Note (optional)</Label>
                <Input id="statusNote" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Internal note for the candidate…" />
              </div>
              <Button className="w-full" onClick={() => updateStatus.mutate()} loading={updateStatus.isPending}>
                Save status
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <CalendarClock className="h-4 w-4 text-primary" />
                Schedule interview
              </h2>
              <div className="space-y-2">
                <Label htmlFor="interviewType">Type</Label>
                <select id="interviewType" value={interviewType} onChange={(e) => setInterviewType(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option>Technical</option>
                  <option>Behavioral</option>
                  <option>HR</option>
                  <option>System Design</option>
                  <option>Mock</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Date & time</Label>
                <Input id="scheduledAt" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingLink">Meeting link</Label>
                <Input id="meetingLink" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => schedule.mutate()} loading={schedule.isPending} disabled={!scheduledAt}>
                Schedule interview
              </Button>
            </CardContent>
          </Card>

          {interview && (
            <Card>
              <CardContent className="space-y-2 p-6">
                <h2 className="font-semibold">Scheduled interview</h2>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{interview.type}</span>
                  <span>{formatDate(interview.scheduledAt)}</span>
                </div>
                {interview.meetingLink && (
                  <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Join meeting
                  </a>
                )}
                <Badge variant="info">{interview.status}</Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </RecruiterDashboard>
  );
}
