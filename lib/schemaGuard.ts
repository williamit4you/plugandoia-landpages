import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";

let schemaPromise: Promise<void> | null = null;

export function ensureAnalyticsSchema(): Promise<void> {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    try {
      const migrationDir = path.join(process.cwd(), "db");
      const files = (await fs.readdir(migrationDir)).filter((f) => f.endsWith(".sql")).sort();
      await db.query(
        "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())",
      );
      for (const file of files) {
        const sql = await fs.readFile(path.join(migrationDir, file), "utf8");
        await db.query(sql);
        await db.query("INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING", [file]);
      }
    } catch (error) {
      schemaPromise = null;
      console.error("[schemaGuard] Falha ao verificar schema:", error);
    }
  })();
  return schemaPromise;
}
