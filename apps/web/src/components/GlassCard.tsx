import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
