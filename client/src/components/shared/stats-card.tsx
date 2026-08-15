import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: string;
  accent?: "primary" | "success" | "warning" | "info" | "destructive";
  className?: string;
}

const ACCENTS: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatsCard({ label, value, icon: Icon, hint, accent = "primary", className }: StatsCardProps) {
  return (
    <Card className={cn("p-5 transition-shadow hover:shadow-md", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", ACCENTS[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
