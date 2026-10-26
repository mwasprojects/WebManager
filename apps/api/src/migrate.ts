import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

const migrationPath = fileURLToPath(new URL("../../../packages/database/migrations/001_init.sql", import.meta.url));
try {
  const sql = await readFile(migrationPath, "utf8");
  await pool.query(sql);
  console.log("Database migration 001 applied.");
} catch (error) {
  console.error("Database migration failed:", error instanceof Error ? error.message : "unknown error");
  process.exitCode = 1;
} finally {
  await pool.end();
}
