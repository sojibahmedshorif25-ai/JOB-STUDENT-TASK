"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Search } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { PageHeader } from "@/components/shared/page-header";
import { CompanyCard } from "@/components/features/company-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { get } from "@/lib/api";
import type { Company } from "@/types";

export default function CompaniesPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const query = React.useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", "12");
    return params.toString();
  }, [search, page]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["companies", query],
    queryFn: () => get<Company[]>("/companies?" + query),
  });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          title="Companies Hiring on SkillForge"
          description="Explore companies that trust SkillForge students — from startups to scale-ups."
        />

        <form onSubmit={(e) => { e.preventDefault(); setPage(1); }} className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search companies…"
            className="h-12 pl-11 text-base"
            aria-label="Search companies"
          />
        </form>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.data?.length ? (
          <EmptyState
            icon={<Building2 className="h-7 w-7" />}
            title="No companies found"
            description="Check back soon as new companies join SkillForge."
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.data.map((company, i) => (
                <CompanyCard key={company._id} company={company} index={i} />
              ))}
            </div>
            {data.meta && data.meta.totalPages > 1 && (
              <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
