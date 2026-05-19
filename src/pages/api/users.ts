import type { APIRoute } from "astro";
import mysql from "mysql2/promise";
import { getPool, initDb } from "../../lib/db-config";

export const GET: APIRoute = async () => {
  try {
    await initDb();
    const pool = getPool();
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      "SELECT userName, email, COUNT(*) AS photoCount FROM photos GROUP BY userName, email ORDER BY userName"
    );

    const users = (rows as { userName: string; email: string; photoCount: number }[]).map((r) => ({
      userName: r.userName,
      email: r.email || "",
      photoCount: r.photoCount,
    }));

    return new Response(JSON.stringify(users), {
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
