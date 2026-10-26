# Authentication Implementation Plan

The detailed policy and acceptance tests live in the [Security Guide](../security/README.md). This page summarizes the implementation sequence.

## Intended experience

Three portal experiences are planned: ordinary user at /login, developer at /developer/login, and administrator at /admin/login. These are different entry experiences, not separate authentication systems. A shared backend establishes identity and creates sessions; server-side authorization decides which portals and resources the account may access.

Ordinary users may self-register. Developer and administrator access should be invitation-only or provisioned by an authorized process. An email code must never grant a role.

## Passwordless flow

1. Accept an email address and portal intent.
2. Apply abuse controls and return a generic response that avoids revealing account existence.
3. For eligible accounts, send a one-time code through a trusted email provider.
4. Store a suitable hash/verification representation, not the raw code.
5. Verify code, expiry, attempt count, account status, and request binding on the server.
6. Atomically consume the code on success.
7. Create or rotate the secure session.
8. Check current role, permissions, and resource scope before granting access.

Proposed initial policy: code lifetime five minutes; maximum five attempts per challenge; resend invalidates the previous code; rate limits apply across relevant account/email, IP, and abuse signals. Responses and logs must not expose secrets.

## Account-bound portal links

Links are bound server-side to one account and one portal, expire after ten minutes, and should be single-use. Store only a cryptographic hash of the high-entropy token. Check the authenticated account against the link owner and re-check current permissions.

A qualifying cross-account attempt is rejected and applies the defined 24-hour lock to the authenticated account making the attempt, not the account that owns the link. Expired links are rejected and may be logged when detectable, but never cause account lockout. Malformed/unknown tokens and replays do not automatically lock an account. See the Security Guide for exact conditions and tests.

## Sessions and time

Use UTC and PostgreSQL TIMESTAMPTZ; compare expiry against server time. Use shared time/duration utilities and an injectable clock for tests. Sessions should use random opaque identifiers, secure HttpOnly cookies, server-side validation, idle and absolute expiry, rotation, and revocation.

Proposed defaults for review: 30-minute idle timeout and seven-day absolute lifetime. Privileged accounts should have stronger controls and potentially shorter limits. These are proposed values, not implemented guarantees.

## Authorization

Use centralized permission checks with resource ownership and tenant/workspace scope. Check permissions in server-side route handlers, server actions, and data operations. Role names alone do not authorize access. Revoked permissions and disabled/locked accounts must be respected even if a browser page remains open.

## Implementation order

1. Evaluate a maintained authentication/session solution.
2. Finalize account and permission models.
3. Implement shared time utilities and deterministic expiry tests.
4. Implement email delivery and code verification.
5. Implement portal links and account-binding rules.
6. Implement persistent sessions, rotation, expiry, logout, and revocation.
7. Implement role/scope enforcement and account recovery.
8. Add safe audit events and alerts.
9. Test expiry boundaries, concurrency, replay, lockouts, session revocation, enumeration, and privilege escalation.
10. Integrate portal UIs after shared backend contracts are clear.

The current UI prototype is not functional authentication. Production readiness requires implementation, tests, configuration review, and verified deployment behavior.
