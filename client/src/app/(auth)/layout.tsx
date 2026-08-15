import { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "Authentication" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-accent p-12 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-20 right-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
        </div>

        <div className="relative">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            SkillForge
          </Link>
        </div>

        <div className="relative space-y-6">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
            <GraduationCap className="mb-4 h-10 w-10" />
            <h2 className="text-2xl font-bold">
              &ldquo;SkillForge took me from JavaScript beginner to a full-time developer job.&rdquo;
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/80">Sojib Hasan · Full Stack Developer</p>
          </div>
          <p className="text-sm text-primary-foreground/80">
            Learn. Build. Prepare. Get Hired. — one platform for your entire career journey.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
