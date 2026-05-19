import type { APIRoute } from "astro";
import mysql from "mysql2/promise";
import { getPool, initDb } from "../../../lib/db-config";

export const GET: APIRoute = async ({ params }) => {
  const guestId = params.id ? parseInt(params.id, 10) : 0;

  if (!guestId) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  try {
    await initDb();
    const pool = getPool();
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      "SELECT id, folderName, fileName, storedName, size, type, userName, uploadedAt FROM photos WHERE guestId = ? ORDER BY uploadedAt DESC",
      [guestId]
    );

    const list = (rows as { id: number; folderName: string; fileName: string; storedName: string; size: number; type: string; userName: string; uploadedAt: string }[]).map((p) => ({
      id: p.id,
      fileName: p.fileName,
      size: p.size,
      type: p.type,
      userName: p.userName,
      uploadedAt: p.uploadedAt,
      url: `/api/file/${encodeURIComponent(p.folderName)}/${p.storedName}`,
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
