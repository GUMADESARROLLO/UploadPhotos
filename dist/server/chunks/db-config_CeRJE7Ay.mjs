import mysql from 'mysql2/promise';

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true};
let pool = null;
function getEnv(key, fallback) {
  const meta = typeof import.meta !== "undefined" ? Object.assign(__vite_import_meta_env__, { MYSQL_HOST: "192.168.1.25", MYSQL_PORT: "3307", MYSQL_USER: "root", MYSQL_PASSWORD: "a7m1425.", MYSQL_DATABASE: "db_boda_goldo", OS: "Windows_NT" }) : void 0;
  return meta?.[key] ?? process.env[key] ?? fallback;
}
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: getEnv("MYSQL_HOST", "localhost"),
      port: parseInt(getEnv("MYSQL_PORT", "3306"), 10),
      user: getEnv("MYSQL_USER", "root"),
      password: getEnv("MYSQL_PASSWORD", ""),
      database: getEnv("MYSQL_DATABASE", "wedding_photos"),
      waitForConnections: true,
      connectionLimit: 5
    });
  }
  return pool;
}
async function initDb() {
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

export { getPool as g, initDb as i };
