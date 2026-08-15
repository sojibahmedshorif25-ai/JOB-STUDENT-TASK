import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "success" | "warning" | "info" | "destructive"> = {
  Applied: "info",
  Shortlisted: "warning",
  Interview: "warning",
  Offer: "success",
  Rejected: "destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] || "secondary"} className="capitalize">
      {status}
    </Badge>
  );
}
