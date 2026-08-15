import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SkillForge — Learn. Build. Prepare. Get Hired.",
    template: "%s | SkillForge",
  },
  description:
    "Master in-demand skills, build real-world projects, prepare for interviews and connect with opportunities—all in one platform.",
  keywords: ["SkillForge", "learn to code", "courses", "jobs", "interview prep", "resume builder"],
  openGraph: {
    title: "SkillForge — Learn. Build. Prepare. Get Hired.",
    description:
      "Master in-demand skills, build real-world projects, prepare for interviews and connect with opportunities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>
              <ToastProvider>{children}</ToastProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
