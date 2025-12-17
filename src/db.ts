import {Pool} from "pg"


export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function checkDbConnection() {
  const client = await pool.connect();
  await client.query("SELECT 1");
  client.release();
}

