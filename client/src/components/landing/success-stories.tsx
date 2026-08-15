import { Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

const STORIES = [
  {
    name: "Sojib Hasan",
    role: "Full Stack Developer @ TechNova",
    initials: "SH",
    quote:
      "SkillForge completely changed my career. I went from learning JavaScript to landing a full-time developer role in 7 months. The projects and interview prep made all the difference.",
  },
  {
    name: "Ayesha Rahman",
    role: "Frontend Engineer @ CodeVerse",
    initials: "AR",
    quote:
      "The resume builder and mock interviews are incredible. I practiced with the interview questions every day and walked into my interview feeling confident. Highly recommended!",
  },
  {
    name: "Michael Chen",
    role: "Backend Developer @ CloudPeak",
    initials: "MC",
    quote:
      "I loved how the platform connects learning to real job opportunities. I applied to 5 jobs through SkillForge and got 3 interview calls within two weeks.",
  },
];

export function SuccessStories() {
  return (
    <section className="border-y bg-muted/30" id="success-stories">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Success stories</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Students who made it</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STORIES.map((story) => (
            <Card key={story.name} className="flex flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <Quote className="mb-4 h-8 w-8 text-primary/30" />
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">&ldquo;{story.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3 border-t pt-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-[11px]">{story.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{story.name}</p>
                  <p className="text-xs text-muted-foreground">{story.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
