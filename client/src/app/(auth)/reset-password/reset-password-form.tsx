"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { post } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      toast("Invalid reset link", {
        description: "The reset link is missing. Please request a new one.",
        variant: "error",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await post("/auth/reset-password", { token, ...data });
      toast("Password reset!", { description: "You can now login with your new password." });
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Password reset failed";
      toast("Password reset failed", { description: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Set a new password</h1>
        <p className="text-muted-foreground">Choose a strong password for your account.</p>
      </div>

      {!token ? (
        <div className="space-y-4">
          <p className="text-sm text-destructive">
            This reset link is invalid or missing. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                className="pl-9 pr-9"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your password"
                className="pl-9"
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            <KeyRound className="h-4 w-4" />
            Reset password
          </Button>
        </form>
      )}
    </div>
  );
}
