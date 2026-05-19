import type { APIRoute } from "astro";
import mysql from "mysql2/promise";
import { getPool, initDb } from "../../lib/db-config";

export const GET: APIRoute = async ({ url }) => {
  const email = url.searchParams.get("email")?.toLowerCase().trim();

  if (!email) {
    return new Response(JSON.stringify({ error: "email required" }), { status: 400 });
  }

  try {
    await initDb();
    const pool = getPool();
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      "SELECT id, nombre, email, creado FROM invitados WHERE email = ?",
      [email]
    );

    const guest = rows.length > 0 ? rows[0] : null;
    return new Response(JSON.stringify(guest), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error finding guest:", err);
    return new Response(JSON.stringify(null), { status: 200 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const nombre = body.nombre?.trim();
    const email = body.email?.toLowerCase().trim();

    if (!nombre || !email) {
      return new Response(JSON.stringify({ error: "nombre and email required" }), { status: 400 });
    }

    await initDb();
    const pool = getPool();

    const [result] = await pool.execute<mysql.ResultSetHeader>(
      "INSERT INTO invitados (nombre, email) VALUES (?, ?)",
      [nombre, email]
    );

    const guest = {
      id: result.insertId,
      nombre,
      email,
    };

    return new Response(JSON.stringify(guest), { status: 201 });
  } catch (err: unknown) {
    const mysqlErr = err as { code?: string };
    if (mysqlErr.code === "ER_DUP_ENTRY") {
      return new Response(JSON.stringify({ error: "Email already exists" }), { status: 409 });
    }
    console.error("Error creating guest:", err);
    return new Response(JSON.stringify({ error: "Failed to create guest" }), { status: 500 });
  }
};
