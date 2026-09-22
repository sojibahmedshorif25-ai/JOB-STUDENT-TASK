"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Award, CalendarDays, Check, Download, Landmark, Printer, Share2, ShieldCheck } from "lucide-react";
import * as React from "react";

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63c.9 0 1.63-.73 1.63-1.63s-.73-1.63-1.63-1.63Z" />
    </svg>
  );
}

import { PublicLayout } from "@/components/layout/public-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Certificate, Course, User } from "@/types";

export default function VerifyCertificatePage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verify-certificate", params.id],
    queryFn: () => get<Certificate>("/enrollments/certificates/verify/" + params.id),
  });

  const certificate = data?.data;
  const course = certificate?.course as Course | undefined;
  const user = certificate?.user as User | undefined;

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast("Certificate verification link copied!", { variant: "success" });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddLinkedIn = () => {
    if (!certificate) return;
    const certTitle = encodeURIComponent(course?.title || "Full-Stack Development");
    const certId = encodeURIComponent(certificate.certificateId);
    const certUrl = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "");
    const date = new Date(certificate.issueDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certTitle}&organizationName=SkillForge%20Academy&issueYear=${year}&issueMonth=${month}&certUrl=${certUrl}&certId=${certId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {isLoading ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : isError || !certificate ? (
          <ErrorState
            title="Certificate not found"
            description="This certificate could not be verified. The ID may be invalid or the certificate has been revoked."
          />
        ) : (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Official Verification Record
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="mr-1.5 h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy Link"}
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / PDF
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddLinkedIn}
                  className="bg-[#0A66C2] text-white hover:bg-[#084e96] border-0"
                >
                  <LinkedinIcon className="mr-1.5 h-3.5 w-3.5" /> Add to LinkedIn
                </Button>
              </div>
            </div>

            {/* Certificate Canvas */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-double border-primary/20 bg-card p-8 text-center sm:p-14 shadow-xl">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-4 rounded-2xl border border-primary/10" />

              <div className="relative">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-xl ring-4 ring-primary/20">
                  <Award className="h-10 w-10" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
                  Certificate of Achievement
                </p>
                <p className="mt-8 text-sm font-medium text-muted-foreground">This is to certify that</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl text-foreground">
                  {user?.name || "Candidate"}
                </h1>
                <p className="mt-6 text-sm text-muted-foreground">
                  has successfully mastered all curriculum modules, passed required technical evaluations, and completed
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">
                  {course?.title || "Full Stack Engineering"}
                </h2>

                <div className="mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-b py-6 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Issued: {formatDate(certificate.issueDate)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Landmark className="h-4 w-4 text-primary" />
                    SkillForge Academy
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    Authenticity Guaranteed
                  </span>
                </div>

                <div className="mt-8 flex flex-col items-center justify-center gap-2">
                  <p className="font-mono text-xs text-muted-foreground">
                    Credential ID: <span className="font-bold text-foreground font-mono">{certificate.certificateId}</span>
                  </p>
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Permanently Recorded & Verified by SkillForge
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

