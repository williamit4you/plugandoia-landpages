import { Pool } from "pg";

const globalForDb = globalThis as unknown as { landpagesPool?: Pool };

export const db =
  globalForDb.landpagesPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 8,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 8_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.landpagesPool = db;
}
