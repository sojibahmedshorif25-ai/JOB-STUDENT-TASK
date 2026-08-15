"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen } from "lucide-react";

import { StudentDashboard } from "@/components/layout/student-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CertificateCard } from "@/components/features/certificate-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";
import type { Certificate } from "@/types";

export default function CertificatesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["certificates"],
    queryFn: () => get<Certificate[]>("/enrollments/certificates"),
  });

  const certificates = data?.data || [];

  return (
    <StudentDashboard headerTitle="Certificates">
      <PageHeader
        title="My Certificates"
        description="Certificates you've earned by completing courses."
      >
        <Button asChild variant="outline">
          <Link href="/courses">
            <BookOpen className="h-4 w-4" />
            Find a course
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={<Award className="h-7 w-7" />}
          title="No certificates yet"
          description="Complete a course to earn your first certificate."
          action={
            <Button asChild>
              <Link href="/courses">Explore courses</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <CertificateCard key={certificate._id} certificate={certificate} />
          ))}
        </div>
      )}
    </StudentDashboard>
  );
}
