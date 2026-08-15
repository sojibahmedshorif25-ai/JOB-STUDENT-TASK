import { ArrowDown } from "lucide-react";

const CAREER_PATH = [
  { label: "HTML", color: "text-orange-500" },
  { label: "CSS", color: "text-blue-500" },
  { label: "JavaScript", color: "text-yellow-500" },
  { label: "React", color: "text-cyan-500" },
  { label: "Next.js", color: "text-neutral-400" },
  { label: "Projects", color: "text-emerald-500" },
  { label: "Interview", color: "text-violet-500" },
  { label: "Job", color: "text-primary" },
];

export function CareerPath() {
  return (
    <section className="border-y bg-muted/40" id="career-path">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Career path</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Follow the path to Frontend Developer</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            A structured roadmap that takes you from the fundamentals all the way to your first job offer.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {CAREER_PATH.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-xl border bg-card px-4 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                <span className={`text-sm font-bold sm:text-base ${step.color}`}>{step.label}</span>
              </div>
              {i < CAREER_PATH.length - 1 && (
                <ArrowDown className="hidden h-4 w-4 text-muted-foreground/50 sm:block sm:rotate-0 lg:-rotate-90 lg:transform-none" />
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Frontend Developer · Backend Developer · Full Stack · Data Analyst · DevOps — build any path.
        </p>
      </div>
    </section>
  );
}
