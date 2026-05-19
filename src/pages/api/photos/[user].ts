import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const META_PATH = path.join(UPLOADS_DIR, "meta.json");

export const GET: APIRoute = async ({ params }) => {
  const userName = params.user ? decodeURIComponent(params.user) : "";

  try {
    const raw = await fs.readFile(META_PATH, "utf-8");
    const meta: Record<string, unknown>[] = JSON.parse(raw);
    const photos = meta.filter((p) => p.userName === userName);

    const list = photos.map((p) => ({
      id: p.id,
      fileName: p.fileName,
      size: p.size,
      type: p.type,
      userName: p.userName,
      uploadedAt: p.uploadedAt,
      url: `/api/file/${encodeURIComponent(p.userName as string)}/${p.storedName}`,
    }));

    return new Response(JSON.stringify(list), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
