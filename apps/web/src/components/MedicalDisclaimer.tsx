import { cn } from "@/lib/utils";

interface MedicalDisclaimerProps {
  className?: string;
}

export function MedicalDisclaimer({ className }: MedicalDisclaimerProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-yellow-700/50 bg-yellow-900/20 p-4 text-sm text-yellow-300",
        className
      )}
    >
      <strong className="font-semibold">Medical Disclaimer:</strong> AfroRadiopedia
      is an AI-assisted tool intended to support — not replace — clinical judgment.
      Always consult a qualified healthcare professional before making any medical
      decisions. This platform does not provide a definitive diagnosis.
    </div>
  );
}
