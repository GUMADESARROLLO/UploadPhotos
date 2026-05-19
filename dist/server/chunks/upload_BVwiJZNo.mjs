import fs from 'node:fs/promises';
import path from 'node:path';
import 'mysql2/promise';
import { i as initDb, g as getPool } from './db-config_CeRJE7Ay.mjs';

function sanitizeFolderName(name) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").toLowerCase();
}

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const POST = async ({ request }) => {
  try {
    await initDb();
    const pool = getPool();
    const form = await request.formData();
    const file = form.get("file");
    const guestId = form.get("guestId")?.toString();
    const userName = form.get("userName")?.toString();
    const email = form.get("email")?.toString();
    if (!file || !userName || !guestId) {
      return new Response(JSON.stringify({ error: "file, userName and guestId required" }), { status: 400 });
    }
    const folderName = sanitizeFolderName(userName);
    const userDir = path.join(UPLOADS_DIR, folderName);
    await fs.mkdir(userDir, { recursive: true });
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(userDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    const [result] = await pool.execute(
      "INSERT INTO photos (guestId, folderName, fileName, storedName, size, type, userName, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [parseInt(guestId), folderName, file.name, safeName, file.size, file.type, userName, email || ""]
    );
    const insertId = result.insertId;
    const entry = {
      id: insertId,
      folderName,
      fileName: file.name,
      storedName: safeName,
      size: file.size,
      type: file.type,
      userName,
      email: email || "",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return new Response(JSON.stringify(entry), { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
