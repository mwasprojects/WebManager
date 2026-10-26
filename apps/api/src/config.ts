import { createHmac, randomBytes } from "node:crypto";

export type Portal = "user" | "developer" | "admin";

export function parsePortal(value: unknown): Portal | null {
  return value === "user" || value === "developer" || value === "admin" ? value : null;
}

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function secretDigest(value: string): string {
  return createHmac("sha256", requiredEnv("AUTH_SECRET")).update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function cookieName(portal: Portal): string {
  return `wm_${portal}_session`;
}

export function allowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000,http://localhost:3001,http://localhost:3002")
    .split(",").map((origin) => origin.trim()).filter(Boolean);
}
