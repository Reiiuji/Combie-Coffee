import mysql from "mysql2/promise";

// Gunakan nilai dari .env.local jika ada,
// jatuh ke default Laragon (root tanpa password, db_combie_coffee) jika belum di-set.
const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db_combie_coffee",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306, // Default 3306 utk Laragon, Vercel nanti baca 4000
};

let pool;

export function getDb() {
  if (!pool) {
    const poolConfig = {
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    // LOGIKA PENTING:
    // Jika Host-nya BUKAN 'localhost', berarti kita sedang di Vercel (Connect ke TiDB).
    // Maka WAJIB tambahkan settingan SSL ini.
    if (config.host !== 'localhost' && config.host !== '127.0.0.1') {
        poolConfig.ssl = {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        };
    }

    pool = mysql.createPool(poolConfig);
  }
  return pool;
}

export async function query(sql, params = []) {
  const db = getDb();
  const [rows] = await db.execute(sql, params);
  return rows;
}