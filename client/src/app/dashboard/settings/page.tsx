"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Globe, MapPin, Save } from "lucide-react";

import { StudentDashboard } from "@/components/layout/student-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { get, put } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { User } from "@/types";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  headline: z.string().max(200, "Headline is too long").optional().or(z.literal("")),
  bio: z.string().max(1000, "Bio is too long").optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  github: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  skills: z.string().optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => get<User>("/users/profile"),
    enabled: !!user,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      headline: "",
      bio: "",
      location: "",
      website: "",
      github: "",
      linkedin: "",
      skills: "",
    },
  });

  React.useEffect(() => {
    if (profile?.data) {
      const p = profile.data;
      reset({
        name: p.name || "",
        headline: p.headline || "",
        bio: p.bio || "",
        location: p.location || "",
        website: p.website || "",
        github: p.github || "",
        linkedin: p.linkedin || "",
        skills: (p.skills || []).join(", "),
      });
    }
  }, [profile, reset]);

  const save = useMutation({
    mutationFn: (values: ProfileForm) =>
      put("/users/profile", {
        ...values,
        skills: values.skills
          ? values.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      }),
    onSuccess: async () => {
      toast("Profile updated", { variant: "success" });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      refreshUser();
    },
    onError: (e: Error) => toast(e.message, { variant: "error" }),
  });

  if (!user) {
    return (
      <StudentDashboard headerTitle="Settings">
        <Skeleton className="h-96 w-full rounded-xl" />
      </StudentDashboard>
    );
  }

  return (
    <StudentDashboard headerTitle="Settings">
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-xl font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardContent className="space-y-6 p-6">
          {!profile ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input id="headline" placeholder="e.g. Full-stack developer" {...register("headline")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} placeholder="Tell recruiters about yourself" {...register("bio")} />
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="location" placeholder="City, Country" className="pl-9" {...register("location")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="website" placeholder="https://" className="pl-9" {...register("website")} />
                  </div>
                  {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="github" placeholder="https://github.com/" className="pl-9" {...register("github")} />
                  </div>
                  {errors.github && <p className="text-sm text-destructive">{errors.github.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" placeholder="https://linkedin.com/in/" {...register("linkedin")} />
                {errors.linkedin && <p className="text-sm text-destructive">{errors.linkedin.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input id="skills" placeholder="JavaScript, React, Node.js" {...register("skills")} />
              </div>

              <div className="flex justify-end border-t pt-4">
                <Button type="submit" loading={save.isPending}>
                  <Save className="h-4 w-4" />
                  Save changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </StudentDashboard>
  );
}
