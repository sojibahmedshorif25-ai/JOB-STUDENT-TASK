import { BookOpenCheck, Layers, Laptop, Code2, BarChart3 } from "lucide-react";

const TECHNOLOGIES = [
  { name: "JavaScript", icon: Code2 },
  { name: "TypeScript", icon: Code2 },
  { name: "React", icon: Layers },
  { name: "Next.js", icon: Laptop },
  { name: "Node.js", icon: Code2 },
  { name: "MongoDB", icon: BarChart3 },
  { name: "Python", icon: Code2 },
  { name: "UI/UX", icon: BookOpenCheck },
];

export function TrustedTech() {
  return (
    <section className="border-y bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Master the technologies companies hire for
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {TECHNOLOGIES.map((tech) => (
            <div key={tech.name} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
              <tech.icon className="h-5 w-5 text-primary/70" />
              <span className="font-semibold">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
