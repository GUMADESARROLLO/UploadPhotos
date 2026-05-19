import 'mysql2/promise';
import { i as initDb, g as getPool } from './db-config_CeRJE7Ay.mjs';

const GET = async ({ params }) => {
  const userName = params.user ? decodeURIComponent(params.user) : "";
  try {
    await initDb();
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT id, folderName, fileName, storedName, size, type, userName, uploadedAt FROM photos WHERE userName = ? ORDER BY uploadedAt DESC",
      [userName]
    );
    const list = rows.map((p) => ({
      id: p.id,
      fileName: p.fileName,
      size: p.size,
      type: p.type,
      userName: p.userName,
      uploadedAt: p.uploadedAt,
      url: `/api/file/${encodeURIComponent(p.folderName)}/${p.storedName}`
    }));
    return new Response(JSON.stringify(list), {
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
