import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return <div className={cn("px-6 py-4 border-b border-gray-100", className)} {...props}>{children}</div>;
}

export function CardContent({ children, className, ...props }: CardProps) {
  return <div className={cn("px-6 py-4", className)} {...props}>{children}</div>;
}
