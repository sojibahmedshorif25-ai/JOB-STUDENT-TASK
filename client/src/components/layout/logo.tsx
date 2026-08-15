import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2 font-bold", className)}
      aria-label="SkillForge home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
        <Zap className="h-4 w-4 fill-current" />
      </span>
      {showText && (
        <span className="text-lg tracking-tight">
          Skill<span className="text-primary">Forge</span>
        </span>
      )}
    </Link>
  );
}
