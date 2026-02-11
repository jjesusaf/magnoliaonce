"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { getImageUrl } from "@/lib/storage";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TopControls } from "@/components/top-controls";
import type { Locale } from "@/lib/i18n";

const BUCKET = "magnolia";

const FOLDERS = [
  { value: "hero", label: "Hero" },
  { value: "gallery", label: "Gallery" },
  { value: "arrangements", label: "Arrangements" },
  { value: "about", label: "About" },
];

export default function UploadPage() {
  const { lang } = useParams<{ lang: string }>();
  const [folder, setFolder] = useState("hero");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<
    { name: string; url: string | null; error?: string }[]
  >([]);

  async function handleUpload() {
    if (files.length === 0) return;

    setUploading(true);
    setResults([]);

    const supabase = getSupabase();
    const uploadResults: typeof results = [];

    for (const file of files) {
      const filePath = `${folder}/${file.name}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { upsert: true });

      if (error) {
        uploadResults.push({ name: file.name, url: null, error: error.message });
      } else {
        const url = getImageUrl(BUCKET, filePath);
        uploadResults.push({ name: file.name, url });
      }
    }

    setResults(uploadResults);
    setFiles([]);
    setUploading(false);

    const input = document.getElementById("file-input") as HTMLInputElement;
    if (input) input.value = "";
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Upload</h1>
          <div className="flex items-center gap-2">
            <TopControls lang={lang as Locale} />
            <Link href={`/${lang}`} className="btn btn-ghost btn-sm">
              Volver
            </Link>
          </div>
        </div>

        {/* Upload card */}
        <div className="card bg-base-100 card-border border-base-300">
          <div className="card-body gap-6">
            {/* Folder select */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Carpeta destino</legend>
              <select
                className="select select-primary w-full"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
              >
                {FOLDERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    /{f.value}
                  </option>
                ))}
              </select>
              <p className="label text-base-content/60">
                Ruta final:{" "}
                <code className="text-primary font-semibold">
                  {BUCKET}/{folder}/
                </code>
              </p>
            </fieldset>

            {/* File input */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Imágenes</legend>
              <input
                id="file-input"
                type="file"
                className="file-input file-input-primary w-full"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
              {files.length > 0 && (
                <p className="label text-base-content/60">
                  {files.length} archivo(s) seleccionado(s)
                </p>
              )}
            </fieldset>

            {/* Upload button */}
            <button
              className="btn btn-primary btn-block"
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {uploading ? "Subiendo..." : `Subir a /${folder}`}
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            {results.map((r) => (
              <div
                key={r.name}
                role="alert"
                className={`alert ${r.error ? "alert-error" : "alert-success"}`}
              >
                <span>
                  <strong>{r.name}</strong>
                  {r.error ? (
                    <> — {r.error}</>
                  ) : (
                    <>
                      {" — Subido. "}
                      <a
                        href={r.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary"
                      >
                        Ver imagen
                      </a>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
