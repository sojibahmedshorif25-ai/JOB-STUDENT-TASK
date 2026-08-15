"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Award, CalendarDays, Landmark, ShieldCheck } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Certificate, Course, User } from "@/types";

export default function VerifyCertificatePage() {
  const params = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verify-certificate", params.id],
    queryFn: () => get<Certificate>("/enrollments/certificates/verify/" + params.id),
  });

  const certificate = data?.data;
  const course = certificate?.course as Course | undefined;
  const user = certificate?.user as User | undefined;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {isLoading ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : isError || !certificate ? (
          <ErrorState
            title="Certificate not found"
            description="This certificate could not be verified. The ID may be invalid or the certificate has been revoked."
          />
        ) : (
          <div className="relative overflow-hidden rounded-2xl border bg-card p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
                <Award className="h-8 w-8" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Certificate Verified</p>
              <p className="mt-6 text-sm text-muted-foreground">This certifies that</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{user?.name || "Student"}</h1>
              <p className="mt-4 text-sm text-muted-foreground">has successfully completed the course</p>
              <h2 className="mt-1 text-2xl font-bold text-primary">{course?.title || "Course"}</h2>
              <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t pt-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  Issued {formatDate(certificate.issueDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Landmark className="h-4 w-4" />
                  SkillForge Academy
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  Authentic
                </span>
              </div>
              <p className="mt-8 font-mono text-xs text-muted-foreground">
                Certificate ID: <span className="font-semibold text-foreground">{certificate.certificateId}</span>
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified by SkillForge
              </p>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
