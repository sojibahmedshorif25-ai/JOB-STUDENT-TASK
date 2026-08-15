"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Check, Eye, EyeOff, GraduationCap, Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast";
import { authClient, GOOGLE_CALLBACK_URL } from "@/lib/auth-client";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    companyName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;
type Role = "STUDENT" | "RECRUITER";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = React.useState<Role>("STUDENT");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: GOOGLE_CALLBACK_URL,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign-up failed";
      toast("Google sign-up failed", { description: message, variant: "error" });
      setIsGoogleLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      const user = await registerUser({
        ...data,
        role,
        companyName: data.companyName,
      });
      toast("Account created!", { description: `Welcome to SkillForge, ${user.name}!` });
      router.push(role === "RECRUITER" ? "/recruiter" : "/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast("Registration failed", { description: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground">Join SkillForge and start your career journey.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(
          [
            { value: "STUDENT" as Role, icon: GraduationCap, title: "Student", desc: "Learn & get hired" },
            { value: "RECRUITER" as Role, icon: Building2, title: "Recruiter", desc: "Hire talent" },
          ]
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value)}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-xl border p-4 text-center transition-all",
              role === option.value
                ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                : "hover:border-primary/40",
            )}
            aria-pressed={role === option.value}
          >
            {role === option.value && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </span>
            )}
            <option.icon className={cn("h-6 w-6", role === option.value ? "text-primary" : "text-muted-foreground")} />
            <span className="text-sm font-semibold">{option.title}</span>
            <span className="text-xs text-muted-foreground">{option.desc}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="name" placeholder={role === "STUDENT" ? "e.g. Sojib Hasan" : "e.g. Sarah Ahmed"} className="pl-9" {...register("name")} />
          </div>
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com" className="pl-9" {...register("email")} />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        {role === "RECRUITER" && (
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="companyName" placeholder="e.g. TechNova" className="pl-9" {...register("companyName")} />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
          <Label htmlFor="confirmPassword">Confirm Password</Label>
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
          Create Account
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        size="lg"
        onClick={handleGoogleRegister}
        loading={isGoogleLoading}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Sign up with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
