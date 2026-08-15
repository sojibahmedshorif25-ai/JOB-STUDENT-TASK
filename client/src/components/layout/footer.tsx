import Link from "next/link";
import { Code2, AtSign, Mail, Zap, MessageCircle } from "lucide-react";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Courses", href: "/courses" },
      { label: "Jobs", href: "/jobs" },
      { label: "Projects", href: "/projects" },
      { label: "Companies", href: "/companies" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Interview Prep", href: "/interview-prep" },
      { label: "Resume Builder", href: "/dashboard/resume" },
      { label: "Career Paths", href: "/#career-path" },
      { label: "Success Stories", href: "/#success-stories" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Create Account", href: "/register" },
      { label: "Student Dashboard", href: "/dashboard" },
      { label: "Recruiter Dashboard", href: "/recruiter" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Zap className="h-4 w-4 fill-current" />
              </span>
              <span>
                Skill<span className="text-primary">Forge</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Learn. Build. Prepare. Get Hired. The all-in-one platform for students, recruiters
              and careers.
            </p>
            <div className="flex gap-2">
              {[Code2, MessageCircle, AtSign, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  aria-label={`Social link ${i + 1}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SkillForge. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
