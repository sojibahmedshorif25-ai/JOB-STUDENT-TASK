"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Download,
  GraduationCap,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { StudentDashboard } from "@/components/layout/student-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { get, put } from "@/lib/api";
import { generateId } from "@/lib/utils";
import type { Resume, ResumeSection } from "@/types";

const SECTION_TEMPLATES: Array<{ type: string; title: string }> = [
  { type: "experience", title: "Experience" },
  { type: "education", title: "Education" },
  { type: "skills", title: "Skills" },
  { type: "projects", title: "Projects" },
  { type: "certificates", title: "Certificates" },
  { type: "languages", title: "Languages" },
];

interface SectionItem {
  id: string;
  title?: string;
  subtitle?: string;
  date?: string;
  location?: string;
  description?: string;
  bullets?: string[];
  name?: string;
  level?: string;
}

function emptyItem(type: string): SectionItem {
  switch (type) {
    case "skills":
      return { id: generateId(), name: "", level: "Intermediate" };
    case "languages":
      return { id: generateId(), name: "", level: "Fluent" };
    default:
      return { id: generateId(), title: "", subtitle: "", date: "", location: "", description: "" };
  }
}

function ItemFields({
  item,
  type,
  onChange,
}: {
  item: SectionItem;
  type: string;
  onChange: (item: SectionItem) => void;
}) {
  const set = (patch: Partial<SectionItem>) => onChange({ ...item, ...patch });

  if (type === "skills" || type === "languages") {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">{type === "skills" ? "Skill" : "Language"}</Label>
          <Input
            value={item.name || ""}
            onChange={(e) => set({ name: e.target.value })}
            placeholder={type === "skills" ? "e.g. React" : "e.g. English"}
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Level</Label>
          <Input
            value={item.level || ""}
            onChange={(e) => set({ level: e.target.value })}
            placeholder={type === "skills" ? "e.g. Advanced" : "e.g. Fluent"}
            className="h-9"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">{type === "education" ? "Degree" : type === "experience" ? "Role" : "Title"}</Label>
          <Input value={item.title || ""} onChange={(e) => set({ title: e.target.value })} placeholder="Title" className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{type === "education" ? "School" : type === "experience" ? "Company" : "Organization"}</Label>
          <Input value={item.subtitle || ""} onChange={(e) => set({ subtitle: e.target.value })} placeholder="Organization" className="h-9" />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Date</Label>
          <Input value={item.date || ""} onChange={(e) => set({ date: e.target.value })} placeholder="2023 – Present" className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Location</Label>
          <Input value={item.location || ""} onChange={(e) => set({ location: e.target.value })} placeholder="Dhaka, BD" className="h-9" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Description</Label>
        <Textarea value={item.description || ""} onChange={(e) => set({ description: e.target.value })} rows={3} placeholder="What did you do or achieve?" />
      </div>
    </div>
  );
}

function ResumeBuilder() {
  const { toast } = useToast();
  const [personal, setPersonal] = React.useState<NonNullable<Resume["personal"]>>({});
  const [sections, setSections] = React.useState<ResumeSection[]>([]);
  const [template, setTemplate] = React.useState("modern");
  const [primaryColor, setPrimaryColor] = React.useState("#4f46e5");

  const { data, isLoading } = useQuery({
    queryKey: ["resume"],
    queryFn: () => get<Resume>("/resume"),
  });

  const resume = data?.data;
  const [prevData, setPrevData] = React.useState<Resume | undefined>(resume);
  if (resume && resume !== prevData) {
    setPrevData(resume);
    setPersonal(resume.personal || {});
    setSections(resume.sections || []);
    setTemplate(resume.template || "modern");
    setPrimaryColor(resume.primaryColor || "#4f46e5");
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      put("/resume", {
        personal,
        sections: sections.map((s) => ({
          ...s,
          items: s.items.map(({ id, ...rest }) => {
            void id;
            return rest;
          }),
        })),
        template,
        primaryColor,
      }),
    onSuccess: () => toast("Resume saved successfully!", { variant: "success" }),
    onError: (error) =>
      toast("Failed to save resume", {
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      }),
  });

  const addSection = (type: string, title: string) => {
    setSections((prev) => [...prev, { type, title, order: prev.length, items: [emptyItem(type)] }]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const updateItem = (sectionIndex: number, itemIndex: number, item: SectionItem) => {
    setSections((prev) =>
      prev.map((s, si) =>
        si === sectionIndex
          ? { ...s, items: s.items.map((it, ii) => (ii === itemIndex ? (item as never) : it)) }
          : s,
      ),
    );
  };

  const addItem = (sectionIndex: number) => {
    setSections((prev) =>
      prev.map((s, si) =>
        si === sectionIndex ? { ...s, items: [...s.items, emptyItem(s.type) as never] } : s,
      ),
    );
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    setSections((prev) =>
      prev.map((s, si) =>
        si === sectionIndex ? { ...s, items: s.items.filter((_, ii) => ii !== itemIndex) } : s,
      ),
    );
  };

  const field = (key: keyof NonNullable<Resume["personal"]>) =>
    personal[key] || "";

  const setField = (key: keyof NonNullable<Resume["personal"]>, value: string) =>
    setPersonal((prev) => ({ ...prev, [key]: value }));

  const handleDownload = () => {
    toast("PDF export requires a PDF library", {
      variant: "info",
      description: "Use your browser's Print → Save as PDF from the preview.",
    });
  };

  if (isLoading && !resume) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Editor */}
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                Personal Information
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <Input value={field("fullName")} onChange={(e) => setField("fullName", e.target.value)} placeholder="Sojib Hasan" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Professional Title</Label>
                <Input value={field("title")} onChange={(e) => setField("title", e.target.value)} placeholder="Full Stack Developer" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input value={field("email")} onChange={(e) => setField("email", e.target.value)} placeholder="you@example.com" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input value={field("phone")} onChange={(e) => setField("phone", e.target.value)} placeholder="+880 1234 567890" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Location</Label>
                <Input value={field("location")} onChange={(e) => setField("location", e.target.value)} placeholder="Dhaka, Bangladesh" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">GitHub</Label>
                <Input value={field("github")} onChange={(e) => setField("github", e.target.value)} placeholder="https://github.com/you" className="h-9" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">LinkedIn</Label>
                <Input value={field("linkedin")} onChange={(e) => setField("linkedin", e.target.value)} placeholder="https://linkedin.com/in/you" className="h-9" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Professional Summary</Label>
                <Textarea
                  value={field("summary")}
                  onChange={(e) => setField("summary", e.target.value)}
                  rows={4}
                  placeholder="Passionate developer with experience building full-stack applications…"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {sections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{section.title}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="iconSm" onClick={() => moveSection(sectionIndex, -1)} disabled={sectionIndex === 0} aria-label="Move up">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="iconSm" onClick={() => moveSection(sectionIndex, 1)} disabled={sectionIndex === sections.length - 1} aria-label="Move down">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="iconSm" onClick={() => removeSection(sectionIndex)} aria-label="Delete section">
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div key={(item as SectionItem).id || itemIndex} className="relative rounded-lg border p-3">
                    <Button
                      variant="ghost"
                      size="iconSm"
                      className="absolute right-2 top-2"
                      onClick={() => removeItem(sectionIndex, itemIndex)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <ItemFields
                      item={item as SectionItem}
                      type={section.type}
                      onChange={(updated) => updateItem(sectionIndex, itemIndex, updated)}
                    />
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => addItem(sectionIndex)}>
                <Plus className="h-4 w-4" />
                Add entry
              </Button>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="space-y-3 p-5">
            <h3 className="flex items-center gap-2 font-semibold">
              <GraduationCap className="h-4 w-4 text-primary" />
              Add Section
            </h3>
            <div className="flex flex-wrap gap-2">
              {SECTION_TEMPLATES.filter(
                (t) => !sections.some((s) => s.type === t.type),
              ).map((t) => (
                <Button key={t.type} variant="outline" size="sm" onClick={() => addSection(t.type, t.title)}>
                  <Plus className="h-4 w-4" />
                  {t.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => saveMutation.mutate()} className="flex-1" size="lg" loading={saveMutation.isPending}>
            <Save className="h-4 w-4" />
            Save Resume
          </Button>
          <Button variant="outline" size="lg" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Live Preview</h3>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              aria-label="Accent color"
              className="h-7 w-7 cursor-pointer rounded border"
            />
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="h-9 rounded-lg border bg-background px-2 text-sm"
              aria-label="Template"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border bg-white shadow-lg" id="resume-preview">
          <div className="mx-auto max-w-[794px] p-4 text-neutral-900 sm:p-8" style={{ color: "#1a1a1a" }}>
            <div style={{ borderBottom: `3px solid ${primaryColor}`, paddingBottom: 16, marginBottom: 16 }}>
              <h1 className="text-3xl font-bold" style={{ color: "#111" }}>
                {field("fullName") || "Your Name"}
              </h1>
              <p className="mt-1 text-base font-medium" style={{ color: primaryColor }}>
                {field("title") || "Professional Title"}
              </p>
              <p className="mt-1.5 text-xs text-neutral-600">
                {[field("email"), field("phone"), field("location"), field("github"), field("linkedin")]
                  .filter(Boolean)
                  .join("  ·  ")}
              </p>
            </div>

            {field("summary") && (
              <div className="mb-4">
                <SectionTitle color={primaryColor} title="Summary" />
                <p className="text-sm leading-relaxed text-neutral-700">{field("summary")}</p>
              </div>
            )}

            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-4">
                <SectionTitle color={primaryColor} title={section.title || ""} />
                {section.type === "skills" || section.type === "languages" ? (
                  <div className="flex flex-wrap gap-1.5">
                    {section.items.map((item, ii) => {
                      const it = item as SectionItem;
                      return (
                        <span key={ii} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                          {it.name}
                          {it.level ? ` (${it.level})` : ""}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {section.items.map((item, ii) => {
                      const it = item as SectionItem;
                      return (
                        <div key={ii}>
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="text-sm font-semibold text-neutral-900">{it.title}</p>
                            <p className="shrink-0 text-xs text-neutral-500">{it.date}</p>
                          </div>
                          {(it.subtitle || it.location) && (
                            <p className="text-xs font-medium text-neutral-600">
                              {[it.subtitle, it.location].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          {it.description && (
                            <p className="mt-1 text-sm leading-relaxed text-neutral-700">{it.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {!field("summary") && sections.length === 0 && (
              <p className="text-center text-sm text-neutral-400">
                Start editing to build your resume preview
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ color, title }: { color: string; title: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color }}>
        {title}
      </h2>
      <div className="h-px flex-1" style={{ backgroundColor: "#e5e5e5" }} />
    </div>
  );
}

export default function ResumePage() {
  return (
    <StudentDashboard headerTitle="Resume Builder">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Resume Builder</h2>
        <p className="text-sm text-muted-foreground">
          Build a professional resume with a live preview. Edit on the left, see results instantly.
        </p>
      </div>
      <ResumeBuilder />
    </StudentDashboard>
  );
}
