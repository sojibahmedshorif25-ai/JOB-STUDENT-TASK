"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Globe, Save } from "lucide-react";

import { RecruiterDashboard } from "@/components/layout/recruiter-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { get, post, put } from "@/lib/api";
import type { Company } from "@/types";

const companySchema = z.object({
  name: z.string().min(2, "Company name is required"),
  logo: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  size: z.string().optional(),
  headquarters: z.string().optional(),
  description: z.string().max(3000).optional().or(z.literal("")),
  foundedYear: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

type CompanyForm = z.infer<typeof companySchema>;

export default function CompanyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companyData } = useQuery({
    queryKey: ["my-company"],
    queryFn: () => get<Company>("/companies/mine"),
  });
  const company = companyData?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: "", logo: "", website: "", industry: "", size: "", headquarters: "", description: "", foundedYear: "", email: "", phone: "" },
  });

  React.useEffect(() => {
    if (company) {
      reset({
        name: company.name || "",
        logo: company.logo || "",
        website: company.website || "",
        industry: company.industry || "",
        size: company.size || "",
        headquarters: company.headquarters || "",
        description: company.description || "",
        foundedYear: company.foundedYear ? String(company.foundedYear) : "",
        email: company.email || "",
        phone: company.phone || "",
      });
    }
  }, [company, reset]);

  const save = useMutation({
    mutationFn: (values: CompanyForm) => {
      const payload = {
        ...values,
        foundedYear: values.foundedYear ? Number(values.foundedYear) : undefined,
      };
      return company ? put(`/companies/${company._id}`, payload) : post("/companies", payload);
    },
    onSuccess: () => {
      toast(company ? "Company updated" : "Company created", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["my-company"] });
    },
    onError: (e: Error) => toast(e.message, { variant: "error" }),
  });

  if (!companyData) {
    return (
      <RecruiterDashboard headerTitle="Company profile">
        <Skeleton className="h-96 w-full rounded-xl" />
      </RecruiterDashboard>
    );
  }

  return (
    <RecruiterDashboard headerTitle="Company profile">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Company profile</h1>
        <p className="text-sm text-muted-foreground">
          {company ? "Update your company information." : "Create your company profile to start posting jobs."}
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Company name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" className="pl-9" {...register("name")} />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="website" placeholder="https://" className="pl-9" {...register("website")} />
                </div>
                {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input id="logo" placeholder="https://…" {...register("logo")} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" placeholder="e.g. Technology" {...register("industry")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Company size</Label>
                <Input id="size" placeholder="e.g. 10-50 employees" {...register("size")} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="headquarters">Headquarters</Label>
                <Input id="headquarters" placeholder="e.g. Dhaka, Bangladesh" {...register("headquarters")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded year</Label>
                <Input id="foundedYear" type="number" placeholder="2015" {...register("foundedYear")} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Contact email</Label>
                <Input id="email" type="email" placeholder="careers@company.com" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+880…" {...register("phone")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} placeholder="Tell candidates about your company" {...register("description")} />
            </div>

            <div className="flex justify-end border-t pt-4">
              <Button type="submit" loading={save.isPending}>
                <Save className="h-4 w-4" />
                {company ? "Save changes" : "Create company"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </RecruiterDashboard>
  );
}
