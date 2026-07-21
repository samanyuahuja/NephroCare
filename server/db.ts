import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema.js";

const databaseUrl = process.env.DATABASE_URL?.trim();
const configuredPoolSize = Number.parseInt(
  process.env.DATABASE_POOL_MAX || "5",
  10,
);
const poolSize = Number.isFinite(configuredPoolSize)
  ? Math.min(Math.max(configuredPoolSize, 1), 10)
  : 5;

export const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      max: poolSize,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: true,
    })
  : null;

pool?.on("error", (error) => {
  console.error("[database] Unexpected idle client error", error);
});

export const db = pool ? drizzle(pool, { schema }) : null;

export async function checkDatabaseConnection() {
  if (!pool) {
    return {
      configured: false,
      connected: false,
      storage: "memory" as const,
    };
  }

  try {
    await pool.query("select 1");
    return {
      configured: true,
      connected: true,
      storage: "postgres" as const,
    };
  } catch (error) {
    console.error("[database] Health check failed", error);
    return {
      configured: true,
      connected: false,
      storage: "postgres" as const,
    };
  }
}
