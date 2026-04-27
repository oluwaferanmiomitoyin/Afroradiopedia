import { cn } from "@/lib/utils";

interface MedicalDisclaimerProps {
  className?: string;
}

export function MedicalDisclaimer({ className }: MedicalDisclaimerProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300/80",
        className
      )}
    >
      <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <p>
        <strong className="font-semibold text-amber-300">Clinical decision support only.</strong>{" "}
        AfroRadiopedia assists — it does not replace — professional medical judgment.
        Always verify findings with a qualified clinician before acting on results.
      </p>
    </div>
  );
}
