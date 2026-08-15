"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, XCircle } from "lucide-react";

import { AdminDashboard } from "@/components/layout/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useToast } from "@/components/ui/toast";
import { get, put } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Company, User } from "@/types";

export default function AdminCompaniesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => get<Company[]>("/admin/companies"),
  });

  const toggleVerify = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) => put(`/admin/companies/${id}/verify`, { verified }),
    onSuccess: () => {
      toast("Company verification updated", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
    },
    onError: (e: Error) => toast(e.message, { variant: "error" }),
  });

  const companies = data?.data || [];

  return (
    <AdminDashboard headerTitle="Companies">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
        <p className="text-sm text-muted-foreground">Verify companies and review their profiles.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : companies.length === 0 ? (
        <EmptyState icon={<Building2 className="h-7 w-7" />} title="No companies yet" />
      ) : (
        <div className="space-y-3">
          {companies.map((company) => {
            const owner = company.owner as User | undefined;
            return (
              <Card key={company._id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {company.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={company.logo} alt={company.name} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-6 w-6" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{company.name}</p>
                        {company.verified ? (
                          <Badge variant="success">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <XCircle className="h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {company.industry || "—"} · {company.headquarters || "—"} · Owner: {owner?.name || "—"}
                      </p>
                      {company.website && (
                        <a href={company.website} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                          {company.website}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Joined {formatDate(company.createdAt)}</p>
                    <Button
                      className="mt-2"
                      size="sm"
                      variant={company.verified ? "outline" : "default"}
                      onClick={() => toggleVerify.mutate({ id: company._id, verified: !company.verified })}
                      loading={toggleVerify.isPending && toggleVerify.variables?.id === company._id}
                    >
                      {company.verified ? "Revoke verification" : "Verify company"}
                    </Button>
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
