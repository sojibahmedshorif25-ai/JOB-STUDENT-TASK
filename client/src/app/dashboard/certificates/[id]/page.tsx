"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Award, Download, Share2, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { RequireAuth } from "@/components/guard/require-auth";
import { useToast } from "@/components/ui/toast";
import { get } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Certificate, Course, User } from "@/types";

function CertificateDetail() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["certificate", params.id],
    queryFn: () => get<Certificate>("/enrollments/certificates/verify/" + params.id),
  });

  const certificate = data?.data;
  const course = certificate?.course as Course | undefined;
  const user = certificate?.user as User | undefined;

  const download = () => {
    toast("Opening print dialog", { variant: "info", description: "Choose 'Save as PDF' to download your certificate." });
    window.print();
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/verify/${certificate?.certificateId}`);
      toast("Link copied to clipboard!", { variant: "success" });
    } catch {
      toast("Could not copy link", { variant: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-96 w-full max-w-3xl rounded-2xl" />
      </div>
    );
  }

  if (isError || !certificate) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 print:py-0">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button onClick={download}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <Button variant="outline" onClick={share}>
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border bg-white p-8 text-neutral-900 shadow-xl sm:p-12 print:shadow-none print:border-0">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-3 rounded-2xl border-2 border-primary/30" />
          <div className="absolute inset-6 rounded-xl border border-primary/20" />
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white">
            <Zap className="h-7 w-7 fill-current" />
          </span>
          <p className="text-2xl font-bold tracking-tight">
            Skill<span className="text-primary">Forge</span>
          </p>

          <h1 className="mt-8 text-3xl font-extrabold uppercase tracking-[0.3em] text-primary">
            Certificate
          </h1>
          <p className="mt-2 text-sm text-neutral-500">of completion</p>

          <p className="mt-10 text-sm text-neutral-500">This certifies that</p>
          <p className="mt-2 text-4xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
            {user?.name || "Student"}
          </p>
          <p className="mt-6 max-w-md text-sm text-neutral-500">
            has successfully completed the course
          </p>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {course?.title || "Course"}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-neutral-500">
            <div>
              <p className="text-xs uppercase tracking-wider">Date</p>
              <p className="mt-1 font-medium text-neutral-800">{formatDate(certificate.issueDate)}</p>
            </div>
            <div className="hidden h-10 w-px bg-neutral-200 sm:block" />
            <div>
              <p className="text-xs uppercase tracking-wider">Certificate ID</p>
              <p className="mt-1 font-mono font-medium text-neutral-800">{certificate.certificateId}</p>
            </div>
            <div className="hidden h-10 w-px bg-neutral-200 sm:block" />
            <div>
              <p className="text-xs uppercase tracking-wider">Issued by</p>
              <p className="mt-1 font-medium text-neutral-800">SkillForge</p>
            </div>
          </div>

          <div className="mt-12 flex w-full items-end justify-between gap-2">
            <div className="min-w-0 text-center">
              <div className="h-px w-24 bg-neutral-300 sm:w-40" />
              <p className="mt-2 text-xs text-neutral-500">Platform Signature</p>
            </div>
            <Award className="h-12 w-12 shrink-0 text-primary/70 sm:h-16 sm:w-16" />
            <div className="min-w-0 text-center">
              <div className="h-px w-24 bg-neutral-300 sm:w-40" />
              <p className="mt-2 text-xs text-neutral-500">Certification Authority</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificateDetailPage() {
  return (
    <RequireAuth roles={["STUDENT", "ADMIN"]}>
      <CertificateDetail />
    </RequireAuth>
  );
}
