import mysql from "mysql2/promise";

// Gunakan nilai dari .env.local jika ada,
// jatuh ke default Laragon (root tanpa password, db_combie_coffee) jika belum di-set.
const config = {
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "db_combie_coffee",
};

let pool;

export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const db = getDb();
  const [rows] = await db.execute(sql, params);
  return rows;
}
