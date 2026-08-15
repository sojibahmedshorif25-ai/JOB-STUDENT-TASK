"use client";

import * as React from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, XCircle, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (title: string, options?: { description?: string; variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VARIANT_STYLES: Record<ToastVariant, { icon: React.ReactNode; className: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-success" />,
    className: "",
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-destructive" />,
    className: "",
  },
  info: {
    icon: <Info className="h-5 w-5 text-info" />,
    className: "",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-warning" />,
    className: "",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (title: string, options?: { description?: string; variant?: ToastVariant }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, title, description: options?.description, variant: options?.variant || "success" }]);
      const timer = setTimeout(() => dismiss(id), 4500);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => {
          const style = VARIANT_STYLES[t.variant];
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg animate-in slide-in-from-bottom-5 fade-in-0",
                style.className,
              )}
              role="status"
            >
              <div className="mt-0.5 shrink-0">{style.icon}</div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
