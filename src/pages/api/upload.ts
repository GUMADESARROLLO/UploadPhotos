import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const META_PATH = path.join(UPLOADS_DIR, "meta.json");

async function readMeta(): Promise<Record<string, unknown>[]> {
  try {
    const raw = await fs.readFile(META_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeMeta(data: Record<string, unknown>[]): Promise<void> {
  await fs.writeFile(META_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const userName = form.get("userName")?.toString();
    const email = form.get("email")?.toString();

    if (!file || !userName) {
      return new Response(JSON.stringify({ error: "file and userName required" }), { status: 400 });
    }

    const userDir = path.join(UPLOADS_DIR, encodeURIComponent(userName));
    await fs.mkdir(userDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(userDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const meta = await readMeta();
    const entry = {
      id: Date.now(),
      fileName: file.name,
      storedName: safeName,
      size: file.size,
      type: file.type,
      userName,
      email: email || "",
      uploadedAt: new Date().toISOString(),
    };
    meta.push(entry);
    await writeMeta(meta);

    return new Response(JSON.stringify(entry), { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
};
