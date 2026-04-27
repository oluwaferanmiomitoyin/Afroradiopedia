/**
 * Compresses an image file before upload.
 * Reduces a 5MB X-ray to ~200-400KB — critical for 2G/3G users.
 */
export async function compressImage(file: File): Promise<File> {
  const imageCompression = (await import("browser-image-compression")).default;

  const options = {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: "image/jpeg",
  };

  const compressed = await imageCompression(file, options);
  return new File([compressed], file.name, { type: "image/jpeg" });
}

/**
 * Validates that a file is an accepted image type for medical scans.
 */
export function validateScanFile(file: File): string | null {
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/dicom"];
  const MAX_SIZE_MB = 20;

  if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith(".dcm")) {
    return "Please upload a valid image file (JPEG, PNG, WEBP, or DICOM).";
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File size must be under ${MAX_SIZE_MB}MB.`;
  }

  return null;
}
