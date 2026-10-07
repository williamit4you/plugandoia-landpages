import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const sql = await fs.readFile(path.join(process.cwd(), "db", "001_initial.sql"), "utf8");
const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();
  await client.query(sql);
  console.log("Landpages database is ready.");
} finally {
  await client.end();
}
