import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { getPool, initDb } from "../../lib/db-config";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export const POST: APIRoute = async ({ request }) => {
  try {
    await initDb();
    const pool = getPool();
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const guestId = form.get("guestId")?.toString();
    const userName = form.get("userName")?.toString();
    const email = form.get("email")?.toString();

    if (!file || !userName || !guestId) {
      return new Response(JSON.stringify({ error: "file, userName and guestId required" }), { status: 400 });
    }

    const folderName = guestId;
    const userDir = path.join(UPLOADS_DIR, folderName);
    await fs.mkdir(userDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(userDir, safeName);
    await fs.writeFile(filePath, buffer);

    const [result] = await pool.execute<mysql.ResultSetHeader>(
      "INSERT INTO photos (guestId, folderName, fileName, storedName, size, type, userName, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [parseInt(guestId), folderName, file.name, safeName, file.size, file.type, userName, email || ""]
    );

    const insertId = (result as mysql.ResultSetHeader).insertId;
    const entry = {
      id: insertId,
      folderName,
      fileName: file.name,
      storedName: safeName,
      size: file.size,
      type: file.type,
      userName,
      email: email || "",
      uploadedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(entry), { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
};
