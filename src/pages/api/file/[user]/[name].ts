import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const META_PATH = path.join(UPLOADS_DIR, "meta.json");

export const GET: APIRoute = async ({ params }) => {
  const userName = params.user ? decodeURIComponent(params.user) : "";
  const storedName = params.name;

  if (!userName || !storedName) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(UPLOADS_DIR, encodeURIComponent(userName), storedName);

  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(storedName).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".avif": "image/avif",
      ".bmp": "image/bmp",
      ".svg": "image/svg+xml",
    };
    const contentType = mimeMap[ext] || "application/octet-stream";

    return new Response(buffer, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const userName = params.user ? decodeURIComponent(params.user) : "";
  const storedName = params.name;

  if (!userName || !storedName) {
    return new Response(JSON.stringify({ error: "Missing params" }), { status: 400 });
  }

  const filePath = path.join(UPLOADS_DIR, encodeURIComponent(userName), storedName);

  try {
    await fs.unlink(filePath);
  } catch {
    // file may not exist, continue to clean meta
  }

  try {
    const raw = await fs.readFile(META_PATH, "utf-8");
    let meta = JSON.parse(raw);
    meta = meta.filter((p) => !(p.userName === userName && p.storedName === storedName));
    await fs.writeFile(META_PATH, JSON.stringify(meta, null, 2), "utf-8");
  } catch {
    // meta may not exist
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
