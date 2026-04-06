import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export function Progress({ value, max = 100, className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("h-2.5 w-full rounded-full bg-gray-100 overflow-hidden", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          pct >= 100 ? "bg-emerald-500" : "bg-emerald-400",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
