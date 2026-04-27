"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { SCAN_TYPES, type ScanType } from "@/lib/utils";
import { compressImage, validateScanFile } from "@/lib/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { cn } from "@/lib/utils";

type AnalysisResult = {
  findings: string;
  confidence: number;
  recommendedSpecialist: string;
  matchedNotes: { condition: string; notes: string; doctor: string }[];
};

export default function AnalyzePage() {
  const { data: session } = useSession();
  const convexUser = useQuery(
    api.users.getByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );

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
    if (validationError) { setError(validationError); return; }
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
      const compressed = await compressImage(imageFile);
      const sigRes = await fetch("/api/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "afroradiopedia/analyses" }),
      });
      const { timestamp, signature, cloudName, apiKey, folder } = await sigRes.json();
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("api_key", apiKey);
      formData.append("folder", folder);
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      const analysisId = await createAnalysis({
        scanType,
        symptoms,
        imageUrl: uploadData.secure_url,
        imagePublicId: uploadData.public_id,
        submittedBy: convexUser?._id,
      });

      setStatus("analysing");
      const aiRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadData.secure_url, scanType, symptoms }),
      });
      if (!aiRes.ok) throw new Error("Analysis failed");
      const aiData = await aiRes.json();

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

  const busy = status === "uploading" || status === "analysing";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-2">Analysis Tool</p>
          <h1 className="text-3xl font-bold text-white">Upload a Scan</h1>
          <p className="mt-2 text-slate-400 text-sm">
            No account needed. Upload, describe symptoms, get AI-powered findings.
          </p>
        </div>

        <MedicalDisclaimer className="mb-8" />

        <div className="grid md:grid-cols-2 gap-6">

          {/* Left — Upload form */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-6">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Scan type */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Scan Type
                </label>
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value as ScanType)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {SCAN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Scan Image
                </label>
                {preview ? (
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Scan preview" className="w-full max-h-56 object-contain" />
                    <button type="button" onClick={handleReset}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors">
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-white/10 hover:border-teal-500/50 rounded-lg cursor-pointer transition-colors bg-white/2">
                    <svg className="w-8 h-8 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-slate-400">Click to upload</span>
                    <span className="text-xs text-slate-600 mt-1">JPEG · PNG · WEBP — auto-compressed</span>
                    <input type="file" accept="image/*,.dcm" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Symptoms / Clinical Notes
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                  placeholder="e.g. 42-year-old male, persistent cough 3 weeks, low-grade fever…"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!imageFile || busy}
                className={cn(
                  "w-full py-2.5 font-semibold rounded-lg transition-colors text-sm",
                  imageFile && !busy
                    ? "bg-teal-500 hover:bg-teal-400 text-slate-950"
                    : "bg-white/5 text-slate-500 cursor-not-allowed"
                )}
              >
                {status === "uploading" ? "Uploading…" : status === "analysing" ? "Analysing…" : "Analyze Scan"}
              </button>
            </form>
          </div>

          {/* Right — Results */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-6 flex flex-col">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Results</h2>

            {status === "idle" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="w-12 h-12 rounded-xl border border-white/8 bg-white/3 flex items-center justify-center text-slate-600 mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">Upload a scan to see AI findings here.</p>
              </div>
            )}

            {busy && (
              <div className="flex-1 flex flex-col items-center justify-center py-10 gap-4">
                <div className="w-10 h-10 border-2 border-white/10 border-t-teal-400 rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">
                  {status === "uploading" ? "Uploading scan…" : "Running AI analysis…"}
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {status === "done" && result && (
              <div className="space-y-5 flex-1">
                {/* Findings */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Primary Findings</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{result.findings}</p>
                </div>

                {/* Confidence */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence</p>
                    <span className="text-xs font-mono text-teal-400">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-teal-500 transition-all"
                      style={{ width: `${(result.confidence * 100).toFixed(0)}%` }}
                    />
                  </div>
                </div>

                {/* Specialist */}
                <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recommended Specialist</p>
                  <p className="text-sm font-semibold text-teal-400">{result.recommendedSpecialist}</p>
                </div>

                {/* Matched notes */}
                {result.matchedNotes?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Similar Cases from Doctors</p>
                    <div className="space-y-2">
                      {result.matchedNotes.map((note, i) => (
                        <div key={i} className="rounded-lg border border-white/8 bg-white/3 p-3 text-xs">
                          <p className="font-semibold text-white mb-1">{note.condition}</p>
                          <p className="text-slate-400 leading-relaxed">{note.notes}</p>
                          <p className="text-slate-600 mt-1">— {note.doctor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={handleReset}
                  className="w-full py-2 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-medium rounded-lg transition-colors text-sm">
                  Analyze Another Scan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
