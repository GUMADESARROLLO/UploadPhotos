import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function getEnv(key: string, fallback: string): string {
  const meta = typeof import.meta !== "undefined" ? (import.meta as Record<string, Record<string, string>>).env : undefined;
  return meta?.[key] ?? (process.env as Record<string, string>)[key] ?? fallback;
}

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: getEnv("MYSQL_HOST", "") || getEnv("DB_HOST", "localhost"),
      port: parseInt(getEnv("MYSQL_PORT", "") || getEnv("DB_PORT", "3306"), 10),
      user: getEnv("MYSQL_USER", "") || getEnv("DB_USER", "root"),
      password: getEnv("MYSQL_PASSWORD", "") || getEnv("DB_PASSWORD", ""),
      database: getEnv("MYSQL_DATABASE", "") || getEnv("DB_NAME", "wedding_photos"),
      waitForConnections: true,
      connectionLimit: 5,
    });
  }
  return pool;
}

export async function initDb(): Promise<void> {
  const p = getPool();
  await p.execute(`
    CREATE TABLE IF NOT EXISTS invitados (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      creado DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await p.execute(`
    CREATE TABLE IF NOT EXISTS photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guestId INT NOT NULL,
      folderName VARCHAR(255) NOT NULL,
      fileName VARCHAR(255) NOT NULL,
      storedName VARCHAR(255) NOT NULL,
      size BIGINT NOT NULL,
      type VARCHAR(100) NOT NULL,
      userName VARCHAR(255) NOT NULL,
      email VARCHAR(255) DEFAULT '',
      uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_guestId (guestId),
      INDEX idx_userName (userName)
    )
  `);
}
