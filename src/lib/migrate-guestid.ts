import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "wedding_photos",
  });

  try {
    await pool.execute("ALTER TABLE photos ADD COLUMN guestId INT NOT NULL AFTER id, ADD INDEX idx_guestId (guestId)");
    console.log("✓ guestId agregado");
  } catch {
    console.log("guestId ya existe o error (puede ignorar)");
  }

  const [cols] = await pool.execute("DESCRIBE photos");
  console.table(cols);

  await pool.end();
}

main().catch(console.error);
