"use client";

import * as React from "react";
import { Bot, Send, Sparkles, X, Code, Lightbulb, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

const KNOWLEDGE_BASE: Record<string, string> = {
  "react server components":
    "**React Server Components (RSC)** render exclusively on the server, generating zero client-side JavaScript bundle weight. They have direct access to backend resources (databases, filesystem) and stream HTML to the client. Client components (`'use client'`) are only needed when using browser state (`useState`), effects (`useEffect`), or DOM event listeners.",
  "closure":
    "A **Closure** in JavaScript is the combination of a function bundled together with references to its surrounding state (lexical environment). In other words, a closure gives an inner function access to an outer function’s scope even after the outer function has finished executing.",
  "event loop":
    "The **Event Loop** manages asynchronous execution in single-threaded JavaScript. The Call Stack executes synchronous code. Asynchronous callbacks are placed in queues: **Microtask Queue** (Promises, queueMicrotask) has higher priority, followed by the **Macrotask / Callback Queue** (setTimeout, setInterval, I/O events).",
  "mongodb indexing":
    "**MongoDB Indexes** (B-Tree structure) drastically improve query performance from O(N) full-collection scans to O(log N) index lookups. Compound indexes `(e.g., { status: 1, createdAt: -1 })` should follow the **ESR Rule (Equality, Sort, Range)** for optimal latency.",
  "jwt":
    "**JSON Web Token (JWT)** is a stateless, URL-safe standard for exchanging claims between two parties. It consists of three base64url-encoded parts: `Header` (algorithm), `Payload` (user claims/roles), and `Signature` (cryptographic HMAC/RSA hash).",
};

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm **SkillBot**, your SkillForge AI Assistant. Ask me anything about Next.js, React, Node.js, MongoDB, interview questions, or debugging code!",
      time: "Just now",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      role: "user",
      content: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = "";

      // Match knowledge base keywords
      const matchedKey = Object.keys(KNOWLEDGE_BASE).find((k) => lower.includes(k));

      if (matchedKey) {
        reply = KNOWLEDGE_BASE[matchedKey];
      } else if (lower.includes("debug") || lower.includes("error") || lower.includes("fix")) {
        reply = `🔍 **AI Debug Analysis:**\nTo troubleshoot this issue:\n1. Check network/console payloads for status codes (400/401/500).\n2. Verify state variable dependencies in your \`useEffect\` or \`useMemo\` hooks.\n3. Ensure MongoDB schemas match your TypeScript interface definition.\n\nShare the exact snippet if you'd like a refactored fix!`;
      } else if (lower.includes("interview") || lower.includes("tip")) {
        reply = `💡 **Interview Strategy:**\nWhen answering technical questions, follow the **STAR + Tech Method**:\n- **Structure**: High-level concept -> Architecture/mechanism -> Trade-offs -> Production example.\n- Try our [AI Mock Interview](/interview-prep) tool to practice answering with instant AI scoring!`;
      } else {
        reply = `Great question regarding **"${query}"**! In full-stack architecture, always prioritize type-safety (TypeScript), predictable state flow (TanStack Query), secure authentication (JWT/OAuth), and optimized database indexing. Check out our interactive [API Docs](/api-docs) and [Courses](/courses) for deep-dive tutorials!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Open AI Learning Assistant"
        className="fixed bottom-4 right-4 z-50 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-accent p-3 text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-110 ring-4 ring-primary/20 print:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6 animate-pulse" />}
      </button>

      {/* Chat drawer */}
      {isOpen && (
        <aside
          aria-label="AI Learning Assistant"
          className="fixed bottom-20 right-4 z-50 flex h-[480px] w-[90vw] max-w-sm flex-col overflow-hidden rounded-3xl border border-primary/20 bg-card/98 shadow-2xl backdrop-blur-2xl transition-all print:hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-primary/5 p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">SkillBot AI</h4>
                <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex gap-1.5 overflow-x-auto border-b bg-muted/30 p-2 text-[11px]">
            {[
              "Explain RSC",
              "What is Closure?",
              "Event Loop",
              "MongoDB Indexing",
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="shrink-0 rounded-full border bg-background px-2.5 py-1 text-muted-foreground hover:border-primary hover:text-primary transition-all font-medium"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : "bg-secondary/60 text-foreground border border-border/40 rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <span className="mt-1 block text-[10px] opacity-60 text-right">{m.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-1 text-muted-foreground text-xs italic pl-8">
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px]">SkillBot is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t bg-card p-3 flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SkillBot a coding or interview question..."
              className="h-9 text-xs"
            />
            <Button type="submit" size="sm" variant="gradient" className="h-9 w-9 p-0 shrink-0">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </aside>
      )}
    </>
  );
}
