import Link from "next/link";
import type { Case } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ShieldCheck, Clock, AlertTriangle, HeartPulse, Users } from "lucide-react";

const statusColor: Record<string, "green" | "yellow" | "red" | "gray"> = {
  verified: "green",
  pending: "yellow",
  rejected: "red",
};

const urgencyIcon: Record<string, React.ReactNode> = {
  critical: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
  high: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
  medium: <Clock className="h-3.5 w-3.5 text-blue-500" />,
  low: <Clock className="h-3.5 w-3.5 text-gray-400" />,
};

const categoryIcon: Record<string, React.ReactNode> = {
  medical: <HeartPulse className="h-4 w-4 text-rose-500" />,
  death: <Users className="h-4 w-4 text-purple-500" />,
};

export function CaseCard({ c }: { c: Case }) {
  const pct = c.target_amount > 0 ? (c.raised_amount / c.target_amount) * 100 : 0;

  return (
    <Link href={`/cases/${c.id}`}>
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardContent className="py-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {categoryIcon[c.category]}
              <h3 className="font-semibold text-gray-900 line-clamp-1">{c.title}</h3>
            </div>
            {c.status === "verified" && (
              <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            )}
          </div>

          <p className="text-sm text-gray-500 line-clamp-2">{c.description}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge color={statusColor[c.status] || "gray"}>{c.status}</Badge>
            <Badge color="blue">
              <span className="flex items-center gap-1">
                {urgencyIcon[c.urgency]} {c.urgency}
              </span>
            </Badge>
            <Badge color="purple">{c.category}</Badge>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {formatCurrency(c.raised_amount)} raised
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(c.target_amount)}
              </span>
            </div>
            <Progress value={pct} />
            <p className="text-xs text-gray-400 text-right">{pct.toFixed(0)}% funded</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
