import Link from "next/link";
import { BadgeCheck, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials, truncate } from "@/lib/utils";
import type { Company } from "@/types";

export function CompanyCard({ company, index = 0 }: { company: Company; index?: number }) {
  const GRADIENTS = [
    "from-indigo-500 to-purple-500",
    "from-blue-500 to-cyan-500",
    "from-violet-500 to-fuchsia-500",
    "from-emerald-500 to-teal-500",
  ];
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <Card className="group flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="flex flex-1 flex-col items-center gap-3 p-6 text-center">
        <div className="relative">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-xl font-bold text-white`}>
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={company.name} className="h-full w-full rounded-2xl object-cover" />
            ) : (
              getInitials(company.name)
            )}
          </div>
          {company.verified && (
            <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background text-primary" />
          )}
        </div>

        <div>
          <h3 className="flex items-center justify-center gap-1.5 font-semibold">
            {company.name}
          </h3>
          {company.industry && <p className="text-sm text-muted-foreground">{company.industry}</p>}
        </div>

        {company.description && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{truncate(company.description, 120)}</p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          {company.headquarters && (
            <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{company.headquarters}</span>
          )}
          {company.size && <Badge variant="secondary" className="font-normal">{company.size}</Badge>}
        </div>

        <Button variant="outline" size="sm" asChild className="mt-auto w-full">
          <Link href={`/companies/${company.slug}`}>View Company</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
