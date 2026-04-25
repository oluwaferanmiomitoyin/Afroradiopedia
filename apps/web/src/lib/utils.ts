import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SCAN_TYPES = [
  { value: "chest_xray", label: "Chest X-Ray" },
  { value: "mammogram", label: "Mammogram" },
  { value: "bone_xray", label: "Bone X-Ray" },
  { value: "mri", label: "MRI Scan" },
  { value: "ct_scan", label: "CT Scan" },
  { value: "ultrasound", label: "Ultrasound" },
  { value: "other", label: "Other" },
] as const;

export type ScanType = (typeof SCAN_TYPES)[number]["value"];

export const SPECIALIST_MAP: Record<ScanType, string> = {
  chest_xray: "Pulmonologist / Radiologist",
  mammogram: "Oncologist / Breast Surgeon",
  bone_xray: "Orthopedic Surgeon",
  mri: "Neurologist / Radiologist",
  ct_scan: "Radiologist",
  ultrasound: "Radiologist / Obstetrician",
  other: "General Specialist",
};
