import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-accent px-6 py-16 text-center text-primary-foreground sm:px-12">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
        </div>
        <div className="relative">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Free to start
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Build Skills. Build Your Future.</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
            Join thousands of students learning, building and getting hired. Your career starts now.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="border border-white/30 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              asChild
            >
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
