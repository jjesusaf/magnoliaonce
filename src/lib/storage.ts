import { getSupabase } from "./supabase";

type TransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
};

/**
 * Get the public URL for a file in a Supabase Storage bucket.
 * Builds the URL directly without needing the client to be initialized.
 */
export function getImageUrl(
  bucket: string,
  path: string,
  transform?: TransformOptions
): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl || !baseUrl.startsWith("https://")) return null;

  let url = `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;

  if (transform) {
    const params = new URLSearchParams();
    if (transform.width) params.set("width", String(transform.width));
    if (transform.height) params.set("height", String(transform.height));
    if (transform.quality) params.set("quality", String(transform.quality));
    if (transform.resize) params.set("resize", String(transform.resize));
    const qs = params.toString();
    if (qs) url = `${baseUrl}/storage/v1/render/image/public/${bucket}/${path}?${qs}`;
  }

  return url;
}

/**
 * List all files in a folder within a bucket.
 */
export async function listImages(
  bucket: string,
  folder: string = "",
  options?: { limit?: number; sortBy?: { column: string; order: string } }
) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: options?.limit ?? 100,
    offset: 0,
    sortBy: options?.sortBy ?? { column: "name", order: "asc" },
  });

  if (error) throw error;
  return (data ?? []).filter((item) => item.id);
}

/**
 * Get public URLs for all images in a folder.
 */
export async function getGalleryUrls(
  bucket: string,
  folder: string,
  transform?: TransformOptions
) {
  const files = await listImages(bucket, folder);
  return files.map((file) => ({
    name: file.name,
    url: getImageUrl(bucket, `${folder}/${file.name}`, transform),
  }));
}
