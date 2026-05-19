import "dotenv/config";
import { initDb, getPool } from "./db-config";

async function main() {
  console.log("Conectando a MySQL...");
  await initDb();
  const pool = getPool();

  const [tables] = await pool.execute("SHOW TABLES");
  console.log("Tablas creadas:", tables);

  const [cols] = await pool.execute("DESCRIBE invitados");
  console.log("Estructura invitados:", cols);

  const [cols2] = await pool.execute("DESCRIBE photos");
  console.log("Estructura photos:", cols2);

  console.log("✓ Listo");
  await pool.end();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
