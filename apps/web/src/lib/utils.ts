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

// Top-level modality grouping — keeps the granular ScanType values
// while letting the UI display/filter by CT scan / MRI / X-ray / Other.
export const SCAN_CATEGORIES: Record<ScanType, string> = {
  chest_xray: "X-ray",
  mammogram: "X-ray",
  bone_xray: "X-ray",
  ct_scan: "CT scan",
  mri: "MRI",
  ultrasound: "Other",
  other: "Other",
};

export const BODY_REGIONS = [
  { value: "head", label: "Head" },
  { value: "neck", label: "Neck" },
  { value: "chest", label: "Chest" },
  { value: "upper_limb", label: "Upper limb" },
  { value: "lower_limb", label: "Lower limb" },
  { value: "abdomen", label: "Abdomen" },
  { value: "spine", label: "Spine" },
] as const;

export type BodyRegion = (typeof BODY_REGIONS)[number]["value"];

export const REGION_LABELS: Record<BodyRegion, string> = {
  head: "Head",
  neck: "Neck",
  chest: "Chest",
  upper_limb: "Upper limb",
  lower_limb: "Lower limb",
  abdomen: "Abdomen",
  spine: "Spine",
};
