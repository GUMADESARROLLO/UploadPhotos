import 'mysql2/promise';
import { i as initDb, g as getPool } from './db-config_CeRJE7Ay.mjs';

const GET = async () => {
  try {
    await initDb();
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT userName, email, COUNT(*) AS photoCount FROM photos GROUP BY userName, email ORDER BY userName"
    );
    const users = rows.map((r) => ({
      userName: r.userName,
      email: r.email || "",
      photoCount: r.photoCount
    }));
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
