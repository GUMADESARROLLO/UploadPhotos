import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

const META_PATH = path.resolve(process.cwd(), "uploads", "meta.json");

export const GET: APIRoute = async () => {
  try {
    const raw = await fs.readFile(META_PATH, "utf-8");
    const meta: Record<string, unknown>[] = JSON.parse(raw);

    const userMap = new Map<string, { userName: string; email: string; photoCount: number }>();
    for (const entry of meta) {
      const name = entry.userName as string;
      const email = (entry.email as string) || "";
      if (!userMap.has(name)) {
        userMap.set(name, { userName: name, email, photoCount: 0 });
      }
      userMap.get(name)!.photoCount += 1;
    }

    const users = [...userMap.values()];
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
