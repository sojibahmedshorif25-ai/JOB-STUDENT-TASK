import { BookOpen, Code2, FolderGit2, MessagesSquare, Send, Trophy } from "lucide-react";

const STEPS = [
  { icon: BookOpen, title: "Learn", description: "Master in-demand skills with structured, project-based courses." },
  { icon: Code2, title: "Practice", description: "Reinforce knowledge with quizzes, assignments and coding exercises." },
  { icon: FolderGit2, title: "Build", description: "Create real-world projects that prove your abilities to employers." },
  { icon: MessagesSquare, title: "Prepare", description: "Practice interviews and build a professional resume." },
  { icon: Send, title: "Apply", description: "Discover jobs matched to your skills and apply with one click." },
  { icon: Trophy, title: "Get Hired", description: "Track applications, ace interviews and land your dream role." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="how-it-works">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your journey from student to hired
        </h2>
        <p className="mt-3 text-muted-foreground">
          One clear path. Six powerful steps. Everything you need to go from zero to employed.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="group relative rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <step.icon className="h-5 w-5" />
              </span>
              <span className="text-4xl font-extrabold text-muted-foreground/20 transition-colors group-hover:text-primary/20">
                0{i + 1}
              </span>
            </div>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
