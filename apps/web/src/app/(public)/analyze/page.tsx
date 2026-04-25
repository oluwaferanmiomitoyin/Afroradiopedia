"use client";
import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { SCAN_TYPES, type ScanType } from "@/lib/utils";
import { compressImage, validateScanFile } from "@/lib/image";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

type AnalysisResult = {
  findings: string;
  confidence: number;
  recommendedSpecialist: string;
  matchedNotes: { condition: string; notes: string; doctor: string }[];
};

export default function AnalyzePage() {
  const [scanType, setScanType] = useState<ScanType>("chest_xray");
  const [symptoms, setSymptoms] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "analysing" | "done" | "error">("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createAnalysis = useMutation(api.analyses.create);
  const updateAnalysis = useMutation(api.analyses.updateWithResults);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateScanFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setStatus("idle");
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) return;
    setError(null);
    setStatus("uploading");

    try {
      // 1. Compress image
      const compressed = await compressImage(imageFile);

      // 2. Get Cloudinary signature
      const sigRes = await fetch("/api/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "afroradiopedia/analyses" }),
      });
      const { timestamp, signature, cloudName, apiKey, folder } = await sigRes.json();

      // 3. Upload to Cloudinary
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
      const imageUrl: string = uploadData.secure_url;
      const imagePublicId: string = uploadData.public_id;

      // 4. Save analysis to Convex
      const analysisId = await createAnalysis({
        scanType,
        symptoms,
        imageUrl,
        imagePublicId,
      });

      // 5. Call AI service
      setStatus("analysing");
      const aiRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, scanType, symptoms }),
      });

      if (!aiRes.ok) throw new Error("Analysis failed");
      const aiData = await aiRes.json();

      // 6. Save results to Convex
      await updateAnalysis({
        analysisId,
        aiFindings: aiData.findings,
        aiConfidence: aiData.confidence,
        recommendedSpecialist: aiData.recommendedSpecialist,
        matchedCaseIds: [],
      });

      setResult(aiData);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function handleReset() {
    setImageFile(null);
    setPreview(null);
    setSymptoms("");
    setResult(null);
    setError(null);
    setStatus("idle");
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Scan Analysis Tool</h1>
          <p className="mt-2 text-slate-400">
            Upload a scan, describe symptoms, and get AI-powered findings backed
            by real doctor notes.
          </p>
        </div>

        <MedicalDisclaimer className="mb-8" />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Upload */}
          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-sky-400 mb-2">
                  Scan Type
                </label>
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value as ScanType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {SCAN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sky-400 mb-2">
                  Upload Image
                </label>
                {preview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Scan preview"
                      className="w-full rounded-lg object-contain max-h-64 bg-black"
                    />
                    <button
                      type="button"
                      onClick={handleReset}
                      className="absolute top-2 right-2 bg-slate-800/80 text-slate-300 rounded-full p-1 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-sky-500 transition-colors">
                    <svg className="w-10 h-10 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-slate-400">Click to upload</span>
                    <span className="text-xs text-slate-500 mt-1">JPEG, PNG, WEBP — auto-compressed</span>
                    <input type="file" accept="image/*,.dcm" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-sky-400 mb-2">
                  Symptoms / Clinical Notes
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={4}
                  placeholder="e.g. 42-year-old male with persistent cough for 3 weeks..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!imageFile || status === "uploading" || status === "analysing"}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {status === "uploading"
                  ? "Uploading..."
                  : status === "analysing"
                  ? "Analysing..."
                  : "Analyze Scan"}
              </button>
            </form>
          </GlassCard>

          {/* Right: Results */}
          <GlassCard>
            <h2 className="text-xl font-bold mb-4">Results</h2>
            {status === "idle" && (
              <p className="text-slate-400 text-sm">Upload a scan and submit to see results.</p>
            )}
            {(status === "uploading" || status === "analysing") && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-10 h-10 border-4 border-slate-700 border-t-sky-400 rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">
                  {status === "uploading" ? "Uploading image..." : "Running AI analysis..."}
                </p>
              </div>
            )}
            {status === "error" && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            {status === "done" && result && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Primary Findings</p>
                  <p className="mt-1 text-slate-100">{result.findings}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">Confidence</p>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-sky-500 transition-all"
                      style={{ width: `${(result.confidence * 100).toFixed(0)}%` }}
                    />
                  </div>
                  <p className="text-right text-xs text-slate-400 mt-1">
                    {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Recommended Specialist</p>
                  <p className="mt-1 text-teal-300 font-medium">{result.recommendedSpecialist}</p>
                </div>
                {result.matchedNotes?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                      What Doctors Say About Similar Cases
                    </p>
                    <div className="space-y-3">
                      {result.matchedNotes.map((note, i) => (
                        <div key={i} className="bg-slate-800/60 rounded-lg p-3 text-sm">
                          <p className="font-semibold text-slate-200">{note.condition}</p>
                          <p className="text-slate-400 mt-1">{note.notes}</p>
                          <p className="text-slate-500 text-xs mt-1">— {note.doctor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={handleReset}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg transition-colors text-sm"
                >
                  Analyze Another Scan
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
