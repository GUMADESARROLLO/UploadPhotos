import type { APIRoute } from "astro";
import mysql from "mysql2/promise";
import { getPool, initDb } from "../../lib/db-config";

export const GET: APIRoute = async () => {
  try {
    await initDb();
    const pool = getPool();
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT i.id AS guestId, i.nombre AS userName, i.email, COUNT(p.id) AS photoCount
       FROM invitados i LEFT JOIN photos p ON i.id = p.guestId
       GROUP BY i.id, i.nombre, i.email
       ORDER BY i.nombre`
    );

    const users = (rows as { guestId: number; userName: string; email: string; photoCount: number }[]).map((r) => ({
      guestId: r.guestId,
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
