import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import sharp from "sharp";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const HEIC_EXTS = [".heic", ".heif", ".heics", ".heifs"];

const dbPool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306", 10),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "wedding_photos",
  waitForConnections: true,
  connectionLimit: 5,
});

async function main() {
  const [rows] = await dbPool.execute<mysql.RowDataPacket[]>(
    `SELECT id, guestId, folderName, storedName, fileName, type FROM photos WHERE type LIKE 'image/heic%' OR type LIKE 'image/heif%' OR storedName LIKE '%.heic' OR storedName LIKE '%.heif' OR storedName LIKE '%.heics' OR storedName LIKE '%.heifs'`
  );

  if (rows.length === 0) {
    console.log("No existing HEIC/HEIF files found.");
    await dbPool.end();
    return;
  }

  console.log(`Found ${rows.length} HEIC/HEIF file(s). Converting...`);

  let converted = 0;
  let errors = 0;

  for (const row of rows) {
    const oldStoredName = row.storedName as string;
    const folderName = row.folderName as string;
    const filePath = path.join(UPLOADS_DIR, folderName, oldStoredName);
    const newStoredName = oldStoredName.replace(/\.(heic|heif|heics|heifs)$/i, ".webp");

    try {
      const buffer = await fs.readFile(filePath);
      const webpBuf = await sharp(buffer).webp({ quality: 95 }).toBuffer();

      const newPath = path.join(UPLOADS_DIR, folderName, newStoredName);
      await fs.writeFile(newPath, webpBuf);

      await dbPool.execute(
        "UPDATE photos SET storedName = ?, type = 'image/webp' WHERE id = ?",
        [newStoredName, row.id]
      );

      await fs.unlink(filePath);

      console.log(`  ✓ ${row.fileName} → ${newStoredName}`);
      converted++;
    } catch (err) {
      console.error(`  ✗ ${row.fileName}:`, err);
      errors++;
    }
  }

  console.log(`\nDone: ${converted} converted, ${errors} errors`);
  await dbPool.end();
}

main();
