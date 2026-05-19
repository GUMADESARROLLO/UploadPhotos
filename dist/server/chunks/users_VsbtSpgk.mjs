import fs from 'node:fs/promises';
import path from 'node:path';

const META_PATH = path.resolve(process.cwd(), "uploads", "meta.json");
const GET = async () => {
  try {
    const raw = await fs.readFile(META_PATH, "utf-8");
    const meta = JSON.parse(raw);
    const userMap = /* @__PURE__ */ new Map();
    for (const entry of meta) {
      const name = entry.userName;
      const email = entry.email || "";
      if (!userMap.has(name)) {
        userMap.set(name, { userName: name, email, photoCount: 0 });
      }
      userMap.get(name).photoCount += 1;
    }
    const users = [...userMap.values()];
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
