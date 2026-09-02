"use client";
import { useEffect, useState } from "react";

const MESSAGES = [
  "Counting ribs, twice — accuracy matters.",
  "Comparing against cases doctors across Africa have shared.",
  "Untangling shadow from bone…",
  "Running it through our own model. No shortcuts on a real scan.",
  "Cross-checking against the knowledge base.",
  "Almost there — thorough takes a moment.",
];

export function DiagnosticLoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 gap-5 text-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-teal-400 rounded-full animate-spin" />
        <div className="absolute inset-2 border-2 border-transparent border-t-sky-400 rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.4s]" />
      </div>
      <p key={index} className="text-slate-300 text-sm max-w-xs">
        {MESSAGES[index]}
      </p>
      <p className="text-slate-600 text-xs">Deep scan in progress — this runs on our own model.</p>
    </div>
  );
}
