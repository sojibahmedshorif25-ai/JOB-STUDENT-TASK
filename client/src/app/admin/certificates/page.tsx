"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";

import { AdminDashboard } from "@/components/layout/admin-dashboard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Certificate, Course, User } from "@/types";

export default function AdminCertificatesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: () => get<Certificate[]>("/admin/certificates"),
  });

  const certificates = data?.data || [];

  return (
    <AdminDashboard headerTitle="Certificates">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
        <p className="text-sm text-muted-foreground">Certificates issued to students.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : certificates.length === 0 ? (
        <EmptyState icon={<Award className="h-7 w-7" />} title="No certificates issued yet" />
      ) : (
        <div className="space-y-3">
          {certificates.map((certificate) => {
            const student = certificate.user as User | undefined;
            const course = certificate.course as Course | undefined;
            return (
              <Card key={certificate._id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
                      <Award className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{student?.name || "Student"}</p>
                      <p className="text-sm text-muted-foreground">Completed {course?.title || "course"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-muted-foreground">{certificate.certificateId}</p>
                    <p className="text-xs text-muted-foreground">Issued {formatDate(certificate.issueDate)}</p>
                    <Link
                      href={`/dashboard/certificates/${certificate._id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AdminDashboard>
  );
}
