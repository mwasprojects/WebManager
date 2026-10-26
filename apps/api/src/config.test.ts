import assert from "node:assert/strict";
import test from "node:test";
import { allowedOrigins, cookieName, parsePortal } from "./config.js";

test("only known portal names are accepted", () => {
  assert.equal(parsePortal("user"), "user");
  assert.equal(parsePortal("developer"), "developer");
  assert.equal(parsePortal("admin"), "admin");
  assert.equal(parsePortal("root"), null);
  assert.equal(parsePortal(undefined), null);
});

test("session cookie names are isolated by portal", () => {
  assert.equal(cookieName("user"), "wm_user_session");
  assert.equal(cookieName("developer"), "wm_developer_session");
  assert.equal(cookieName("admin"), "wm_admin_session");
});

test("local browser origins have a safe explicit default", () => {
  const previous = process.env.ALLOWED_ORIGINS;
  delete process.env.ALLOWED_ORIGINS;
  assert.deepEqual(allowedOrigins(), [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002"
  ]);
  if (previous !== undefined) process.env.ALLOWED_ORIGINS = previous;
});
