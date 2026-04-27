"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "../../../../../convex/_generated/api";
import { GlassCard } from "@/components/GlassCard";
import { SCAN_TYPES, type ScanType } from "@/lib/utils";
import { compressImage, validateScanFile } from "@/lib/image";

export default function ContributePage() {
  const { data: session } = useSession();
  const convexUser = useQuery(
    api.users.getByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );

  const [scanType, setScanType] = useState<ScanType>("chest_xray");
  const [bodyPart, setBodyPart] = useState("");
  const [condition, setCondition] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [recommendedSpecialist, setRecommendedSpecialist] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "done" | "error">("idle");
  const [fileError, setFileError] = useState<string | null>(null);

  const contribute = useMutation(api.cases.contribute);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateScanFile(file);
    if (err) { setFileError(err); return; }
    setFileError(null);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) return;
    setStatus("uploading");

    try {
      const compressed = await compressImage(imageFile);

      const sigRes = await fetch("/api/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "afroradiopedia/cases" }),
      });
      const { timestamp, signature, cloudName, apiKey, folder } = await sigRes.json();

      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const uploadData = await uploadRes.json();

      setStatus("saving");

      if (!convexUser) throw new Error("User not found");
      await contribute({
        doctorId: convexUser._id,
        scanType,
        bodyPart,
        condition,
        diagnosis,
        clinicalNotes,
        imageUrl: uploadData.secure_url,
        imagePublicId: uploadData.public_id,
        recommendedSpecialist: recommendedSpecialist || undefined,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });

      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold">Case Submitted!</h2>
        <p className="text-slate-400 mt-2 text-sm">
          Thank you for contributing. Your case will help doctors across Africa.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setImageFile(null);
            setPreview(null);
            setCondition(""); setDiagnosis(""); setClinicalNotes(""); setTags("");
          }}
          className="mt-6 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Submit Another Case
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contribute a Case</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Upload a real scan with your clinical notes. Your contribution builds the knowledge base.
        </p>
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Scan Image */}
          <div>
            <label className="block text-sm font-medium text-sky-400 mb-2">Scan Image *</label>
            {preview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="preview" className="w-full max-h-64 object-contain rounded-lg bg-black" />
                <button type="button" onClick={() => { setImageFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-slate-800/80 rounded-full p-1 text-slate-300 hover:text-white">✕</button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-sky-500 transition-colors">
                <span className="text-sm text-slate-400">Click to upload scan</span>
                <input type="file" accept="image/*,.dcm" className="hidden" onChange={handleFileChange} required />
              </label>
            )}
            {fileError && <p className="text-red-400 text-xs mt-1">{fileError}</p>}
          </div>

          {/* Scan Type */}
          <div>
            <label className="block text-sm font-medium text-sky-400 mb-2">Scan Type *</label>
            <select value={scanType} onChange={(e) => setScanType(e.target.value as ScanType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none">
              {SCAN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Body Part */}
          <div>
            <label className="block text-sm font-medium text-sky-400 mb-2">Body Part *</label>
            <input value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} required
              placeholder="e.g. Right Lung, Left Breast, Tibia"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none" />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-sky-400 mb-2">Condition / Finding *</label>
            <input value={condition} onChange={(e) => setCondition(e.target.value)} required
              placeholder="e.g. Pneumonia, Fracture, Opacity"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none" />
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-sky-400 mb-2">Confirmed Diagnosis *</label>
            <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required rows={2}
              placeholder="Final confirmed diagnosis..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none" />
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-sm font-medium text-sky-400 mb-2">Clinical Notes *</label>
            <textarea value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} required rows={5}
              placeholder="Describe what you see, your interpretation, and clinical approach..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none" />
          </div>

          {/* Recommended Specialist */}
          <div>
            <label className="block text-sm font-medium text-sky-400 mb-2">Recommended Specialist</label>
            <input value={recommendedSpecialist} onChange={(e) => setRecommendedSpecialist(e.target.value)}
              placeholder="e.g. Pulmonologist, Orthopedic Surgeon"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none" />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-sky-400 mb-2">Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. pneumonia, bilateral, consolidation"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none" />
          </div>

          {status === "error" && (
            <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
          )}

          <button type="submit"
            disabled={!imageFile || status === "uploading" || status === "saving"}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
            {status === "uploading" ? "Uploading..." : status === "saving" ? "Saving..." : "Submit Case"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
