import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { getPool, initDb } from "../../../../lib/db-config";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export const GET: APIRoute = async ({ params }) => {
  const folderName = params.user ? decodeURIComponent(params.user) : "";
  const storedName = params.name;

  if (!folderName || !storedName) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(UPLOADS_DIR, encodeURIComponent(folderName), storedName);

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
      ".heic": "image/heic",
      ".heif": "image/heif",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mov": "video/quicktime",
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
  const folderName = params.user ? decodeURIComponent(params.user) : "";
  const storedName = params.name;

  if (!folderName || !storedName) {
    return new Response(JSON.stringify({ error: "Missing params" }), { status: 400 });
  }

  // Delete file from disk
  const filePath = path.join(UPLOADS_DIR, encodeURIComponent(folderName), storedName);
  try {
    await fs.unlink(filePath);
  } catch {
    // file may not exist, continue
  }

  // Delete record from MySQL
  try {
    await initDb();
    const pool = getPool();
    await pool.execute(
      "DELETE FROM photos WHERE folderName = ? AND storedName = ?",
      [folderName, storedName]
    );
  } catch (err) {
    console.error("DB delete error:", err);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
