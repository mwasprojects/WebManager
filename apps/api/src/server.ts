import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { randomInt, timingSafeEqual } from "node:crypto";
import { pool } from "./db.js";
import { allowedOrigins, cookieName, parsePortal, randomToken, requiredEnv, secretDigest, type Portal } from "./config.js";
import { sendVerificationCode } from "./email.js";

const app = Fastify({
  logger: { redact: ["req.headers.cookie", "req.headers.authorization", "res.headers.set-cookie"] },
  bodyLimit: 16 * 1024,
  requestTimeout: 15000,
  trustProxy: process.env.TRUST_PROXY === "true"
});

await app.register(cors, {
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins().includes(origin)) callback(null, true);
    else callback(new Error("Origin not allowed"), false);
  },
  allowedHeaders: ["content-type", "x-webmanager-portal"],
  methods: ["GET", "POST", "OPTIONS"]
});
await app.register(cookie);

type PortalRequest = FastifyRequest & { portal: Portal };
function getPortal(request: FastifyRequest, reply: FastifyReply): Portal | null {
  const portal = parsePortal(request.headers["x-webmanager-portal"]);
  if (!portal) {
    reply.code(400).send({ error: "Invalid portal." });
    return null;
  }
  return portal;
}
function validOrigin(request: FastifyRequest): boolean {
  const origin = request.headers.origin;
  return typeof origin === "string" && allowedOrigins().includes(origin);
}
function emailAddress(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}
function displayName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return name.length >= 1 && name.length <= 80 ? name : null;
}
function noStore(reply: FastifyReply) {
  reply.header("Cache-Control", "no-store");
  reply.header("Pragma", "no-cache");
}
let lastRateLimitCleanupAt = 0;
async function rateLimit(key: string, limit: number, windowMinutes: number): Promise<boolean> {
  // Bound growth from one-off email/IP keys without running cleanup on every request.
  if (Date.now() - lastRateLimitCleanupAt > 10 * 60 * 1000) {
    lastRateLimitCleanupAt = Date.now();
    await pool.query("DELETE FROM rate_limit_buckets WHERE window_started_at < now() - interval '1 day'");
  }
  const keyHash = secretDigest(key);
  const result = await pool.query<{ hits: number }>(
    `INSERT INTO rate_limit_buckets (key_hash, window_started_at, hits)
     VALUES ($1, now(), 1)
     ON CONFLICT (key_hash) DO UPDATE SET
       hits = CASE WHEN rate_limit_buckets.window_started_at < now() - ($2 * interval '1 minute') THEN 1 ELSE rate_limit_buckets.hits + 1 END,
       window_started_at = CASE WHEN rate_limit_buckets.window_started_at < now() - ($2 * interval '1 minute') THEN now() ELSE rate_limit_buckets.window_started_at END
     RETURNING hits`,
    [keyHash, windowMinutes]
  );
  return result.rows[0].hits <= limit;
}
function clientIp(request: FastifyRequest): string {
  return request.ip || "unknown";
}
function isPrivilegedPortal(portal: Portal): boolean {
  return portal === "developer" || portal === "admin";
}
function setSessionCookie(reply: FastifyReply, portal: Portal, token: string) {
  reply.setCookie(cookieName(portal), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE === "none" ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60
  });
}
async function createSession(userId: string, portal: Portal, request: FastifyRequest, reply: FastifyReply) {
  const token = randomToken(32);
  await pool.query(
    "INSERT INTO sessions (user_id, portal, token_hash, expires_at, idle_expires_at, created_ip_hash, user_agent_hash) VALUES ($1,$2,$3,now() + interval '7 days',now() + interval '30 minutes',$4,$5)",
    [userId, portal, secretDigest(token), secretDigest(clientIp(request)), secretDigest(String(request.headers["user-agent"] ?? "unknown").slice(0, 500))]
  );
  setSessionCookie(reply, portal, token);
}
async function requireSession(request: FastifyRequest, reply: FastifyReply, portal: Portal) {
  const token = request.cookies[cookieName(portal)];
  if (!token) {
    reply.code(401).send({ error: "Sign-in required." });
    return null;
  }
  const result = await pool.query<{
    id: string; email: string; display_name: string; portal: Portal; expires_at: Date; idle_expires_at: Date;
  }>(
    `SELECT s.id, u.email, u.display_name, s.portal, s.expires_at, s.idle_expires_at
     FROM sessions s JOIN users u ON u.id=s.user_id
     WHERE s.token_hash=$1 AND s.portal=$2 AND s.revoked_at IS NULL
       AND s.expires_at > now() AND s.idle_expires_at > now()
       AND u.disabled_at IS NULL AND (u.locked_until IS NULL OR u.locked_until <= now())
       AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id=u.id AND ur.role=$2)`,
    [secretDigest(token), portal]
  );
  const session = result.rows[0];
  if (!session) {
    reply.clearCookie(cookieName(portal), { path: "/" });
    reply.code(401).send({ error: "Sign-in required." });
    return null;
  }
  await pool.query("UPDATE sessions SET last_seen_at=now(), idle_expires_at=LEAST(expires_at, now() + interval '30 minutes') WHERE id=$1", [session.id]);
  return { id: session.id, email: session.email, name: session.display_name, portal };
}

app.get("/health", async (_request, reply) => {
  noStore(reply);
  try {
    await pool.query("SELECT 1");
    return { status: "ok", database: "ok" };
  } catch {
    reply.code(503);
    return { status: "degraded", database: "unavailable" };
  }
});

app.post("/auth/request-code", async (request, reply) => {
  noStore(reply);
  if (!validOrigin(request)) return reply.code(403).send({ error: "Request origin not allowed." });
  const portal = getPortal(request, reply);
  if (!portal) return;
  const body = request.body as { email?: unknown; name?: unknown; intent?: unknown } | null;
  const email = emailAddress(body?.email);
  const intent = body?.intent === "signup" ? "signup" : "signin";
  const name = displayName(body?.name);
  if (!email || (intent === "signup" && portal === "user" && !name)) {
    return reply.code(400).send({ error: "Enter a valid email address and the required details." });
  }
  const ip = clientIp(request);
  const allowed = await rateLimit(`otp:ip:${ip}`, 30, 15) && await rateLimit(`otp:email:${email}`, 5, 15);
  // Always return a generic success response for syntactically valid requests.
  const generic = { message: "If this account can use this portal, a verification code will be emailed shortly." };
  if (!allowed) return reply.code(202).send(generic);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let user = await client.query<{ id: string; disabled_at: Date | null; locked_until: Date | null }>(
      "SELECT id, disabled_at, locked_until FROM users WHERE email=$1 FOR UPDATE", [email]
    );
    let userId = user.rows[0]?.id;
    if (!userId && intent === "signup" && portal === "user" && name) {
      const inserted = await client.query<{ id: string }>(
        "INSERT INTO users (email, display_name) VALUES ($1,$2) ON CONFLICT (email) DO NOTHING RETURNING id",
        [email, name]
      );
      userId = inserted.rows[0]?.id;
      if (userId) await client.query("INSERT INTO user_roles (user_id, role) VALUES ($1,'user') ON CONFLICT DO NOTHING", [userId]);
      if (!userId) {
        user = await client.query("SELECT id, disabled_at, locked_until FROM users WHERE email=$1 FOR UPDATE", [email]);
        userId = user.rows[0]?.id;
      }
    }
    let eligible = Boolean(userId && !user.rows[0]?.disabled_at && (!user.rows[0]?.locked_until || new Date(user.rows[0].locked_until) <= new Date()));
    if (eligible && userId) {
      const role = await client.query("SELECT 1 FROM user_roles WHERE user_id=$1 AND role=$2", [userId, portal]);
      eligible = role.rowCount === 1;
    }
    if (eligible && userId) {
      await client.query("UPDATE verification_challenges SET consumed_at=now() WHERE user_id=$1 AND portal=$2 AND consumed_at IS NULL", [userId, portal]);
      const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
      await client.query(
        "INSERT INTO verification_challenges (user_id, portal, code_hash, expires_at, attempts, requested_ip_hash) VALUES ($1,$2,$3,now() + interval '5 minutes',0,$4)",
        [userId, portal, secretDigest(code), secretDigest(ip)]
      );
      await client.query("COMMIT");
      try {
        await sendVerificationCode(email, code, portal);
      } catch (error) {
        request.log.error({ err: error }, "Verification email delivery failed");
        // Consume the challenge if delivery failed; do not leave a valid code the user never received.
        await pool.query("UPDATE verification_challenges SET consumed_at=now() WHERE user_id=$1 AND portal=$2 AND consumed_at IS NULL", [userId, portal]);
      }
      return reply.code(202).send(generic);
    }
    await client.query("COMMIT");
    return reply.code(202).send(generic);
  } catch (error) {
    await client.query("ROLLBACK");
    request.log.error({ err: error }, "Could not create verification challenge");
    return reply.code(500).send({ error: "Unable to process the request right now." });
  } finally {
    client.release();
  }
});

app.post("/auth/verify-code", async (request, reply) => {
  noStore(reply);
  if (!validOrigin(request)) return reply.code(403).send({ error: "Request origin not allowed." });
  const portal = getPortal(request, reply);
  if (!portal) return;
  const body = request.body as { email?: unknown; code?: unknown } | null;
  const email = emailAddress(body?.email);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!email || !/^\d{6}$/.test(code)) return reply.code(400).send({ error: "Enter the email address and six-digit code." });
  const ip = clientIp(request);
  const allowed = await rateLimit(`verify:ip:${ip}`, 60, 15) && await rateLimit(`verify:email:${email}`, 15, 15);
  if (!allowed) return reply.code(429).send({ error: "Too many attempts. Please wait and try again." });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const challengeResult = await client.query<{
      id: string; user_id: string; code_hash: string; attempts: number; expires_at: Date; is_valid_time: boolean; email: string;
    }>(
      `SELECT vc.id, vc.user_id, vc.code_hash, vc.attempts, vc.expires_at, (vc.expires_at > now()) AS is_valid_time, u.email
       FROM verification_challenges vc JOIN users u ON u.id=vc.user_id
       WHERE u.email=$1 AND vc.portal=$2 AND vc.consumed_at IS NULL
       ORDER BY vc.created_at DESC LIMIT 1 FOR UPDATE OF vc`,
      [email, portal]
    );
    const challenge = challengeResult.rows[0];
    if (!challenge || !challenge.is_valid_time || challenge.attempts >= 5) {
      if (challenge) await client.query("UPDATE verification_challenges SET consumed_at=now() WHERE id=$1", [challenge.id]);
      await client.query("COMMIT");
      return reply.code(400).send({ error: "The code is invalid or expired. Request a new code." });
    }
    const candidateHash = secretDigest(code);
    const storedHash = Buffer.from(challenge.code_hash, "hex");
    const candidateHashBytes = Buffer.from(candidateHash, "hex");
    if (storedHash.length !== candidateHashBytes.length || !timingSafeEqual(storedHash, candidateHashBytes)) {
      const attempts = challenge.attempts + 1;
      await client.query("UPDATE verification_challenges SET attempts=$2, consumed_at=CASE WHEN $2 >= 5 THEN now() ELSE consumed_at END WHERE id=$1", [challenge.id, attempts]);
      await client.query("COMMIT");
      return reply.code(400).send({ error: "The code is invalid or expired. Request a new code." });
    }
    const eligible = await client.query(
      "SELECT 1 FROM users u JOIN user_roles ur ON ur.user_id=u.id WHERE u.id=$1 AND ur.role=$2 AND u.disabled_at IS NULL AND (u.locked_until IS NULL OR u.locked_until <= now())",
      [challenge.user_id, portal]
    );
    if (eligible.rowCount !== 1) {
      await client.query("UPDATE verification_challenges SET consumed_at=now() WHERE id=$1", [challenge.id]);
      await client.query("COMMIT");
      return reply.code(403).send({ error: "This account is not authorized for this portal." });
    }
    await client.query("UPDATE verification_challenges SET consumed_at=now() WHERE id=$1", [challenge.id]);
    await client.query("INSERT INTO security_events (user_id, event_type, portal, ip_hash) VALUES ($1,'auth.success',$2,$3)", [challenge.user_id, portal, secretDigest(ip)]);
    await client.query("COMMIT");
    await createSession(challenge.user_id, portal, request, reply);
    return { message: "Signed in successfully.", user: { email: challenge.email, portal } };
  } catch (error) {
    await client.query("ROLLBACK");
    request.log.error({ err: error }, "Could not verify code");
    return reply.code(500).send({ error: "Unable to verify the code right now." });
  } finally {
    client.release();
  }
});

app.get("/auth/me", async (request, reply) => {
  noStore(reply);
  const portal = getPortal(request, reply);
  if (!portal) return;
  const user = await requireSession(request, reply, portal);
  if (!user) return;
  return { user: { email: user.email, name: user.name, portal: user.portal } };
});

app.post("/auth/logout", async (request, reply) => {
  noStore(reply);
  if (!validOrigin(request)) return reply.code(403).send({ error: "Request origin not allowed." });
  const portal = getPortal(request, reply);
  if (!portal) return;
  const token = request.cookies[cookieName(portal)];
  if (token) await pool.query("UPDATE sessions SET revoked_at=now() WHERE token_hash=$1 AND portal=$2 AND revoked_at IS NULL", [secretDigest(token), portal]);
  reply.clearCookie(cookieName(portal), { path: "/" });
  return { message: "Signed out." };
});

app.get("/portal/protected", async (request, reply) => {
  noStore(reply);
  const portal = getPortal(request, reply);
  if (!portal) return;
  const user = await requireSession(request, reply, portal);
  if (!user) return;
  return { message: `Authorized ${portal} portal access.`, user: { email: user.email, name: user.name, portal } };
});

app.setErrorHandler((error, request, reply) => {
  request.log.error({ err: error }, "Request failed");
  reply.code(500).send({ error: "An unexpected server error occurred." });
});

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";
try {
  requiredEnv("AUTH_SECRET");
  requiredEnv("DATABASE_URL");
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
