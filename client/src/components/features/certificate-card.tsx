import Link from "next/link";
import { Award, CalendarCheck, Download, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Certificate, Course } from "@/types";

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const course = certificate.course as Course | undefined;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="relative space-y-3 p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
        <div className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Award className="h-5 w-5" />
          </span>
          <span className="font-mono text-xs text-muted-foreground">{certificate.certificateId}</span>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Certificate of Completion</p>
          <h3 className="mt-1 font-semibold">{course?.title || "Course"}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarCheck className="h-3.5 w-3.5" />
            Issued {formatDate(certificate.issueDate)}
          </p>
        </div>

        <div className="flex gap-2 border-t pt-3">
          <Button size="sm" variant="outline" asChild className="flex-1">
            <Link href={`/dashboard/certificates/${certificate.certificateId}`}>
              <Download className="h-4 w-4" />
              View
            </Link>
          </Button>
          <Button size="sm" variant="ghost" aria-label="Share certificate">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
