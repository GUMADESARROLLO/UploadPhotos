import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const HEIC_EXTS = [".heic", ".heif", ".heics", ".heifs"];
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp", ".svg", ".tiff"];
const ACCEPTED_EXTS = [...HEIC_EXTS, ...IMAGE_EXTS];

function isHeic(filename: string, mimeType: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return HEIC_EXTS.includes(ext) || mimeType === "image/heic" || mimeType === "image/heif";
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No se envió ningún archivo" }), { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ACCEPTED_EXTS.includes(ext)) {
      return new Response(JSON.stringify({ error: "Formato no soportado. Solo imágenes (JPG, PNG, WebP, HEIC)" }), { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: "El archivo excede el tamaño máximo de 50 MB" }), { status: 400 });
    }

    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    let buffer = Buffer.from(await file.arrayBuffer());
    let finalName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    if (isHeic(file.name, file.type) && finalName.match(/\.(heic|heif|heics|heifs)$/i)) {
      try {
        buffer = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
        finalName = finalName.replace(/\.(heic|heif|heics|heifs)$/i, ".jpg");
      } catch (convErr) {
        console.warn("sharp HEIC conversion failed, saving original:", convErr.message);
      }
    }

    const filePath = path.join(UPLOADS_DIR, finalName);
    await fs.writeFile(filePath, buffer);

    return new Response(JSON.stringify({
      url: `/api/uploaded/${finalName}`,
      fileName: finalName,
      size: buffer.length,
      format: path.extname(finalName).slice(1),
    }), { status: 201 });

  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};
