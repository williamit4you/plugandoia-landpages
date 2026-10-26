import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const migrationDir = path.join(process.cwd(), "db");
const migrations = (await fs.readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();
const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();
  await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  for (const migration of migrations) {
    const applied = await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [migration]);
    if (applied.rowCount) continue;
    await client.query("BEGIN");
    try {
      await client.query(await fs.readFile(path.join(migrationDir, migration), "utf8"));
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [migration]);
      await client.query("COMMIT");
      console.log(`Applied ${migration}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
  console.log("Landpages database is ready.");
} finally {
  await client.end();
}
