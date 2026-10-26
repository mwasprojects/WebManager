# WebManager Security Guide

> **Status:** Design baseline for implementation. The policies in this document are proposed requirements; they are not yet implemented or production-tested.

This guide is the detailed source of truth for WebManager authentication, portal access, authorization, account locks, and security auditing. The root [README](../../README.md) contains a short summary and development quick start.

## 1. Security goals

- Passwordless sign-in for ordinary users, developers, and administrators.
- One human account per person, with roles and scoped permissions attached to that account.
- Separate user, developer, and administrator portals backed by shared authentication and authorization services.
- Account-specific portal links that expire after 10 minutes.
- Email one-time verification codes that expire after 5 minutes.
- Audit records for successful and rejected authentication/link attempts without storing authentication secrets.
- Predictable, documented handling for expired links, cross-account link attempts, account locks, and administrator unlocks.
- Least privilege, deny-by-default access, secure sessions, privacy-aware logging, and tested recovery.

## 2. Simple security model

```text
Email address
    |
    v
Passwordless authentication ----> Secure session
                                      |
Portal link --------------------------+
    |                                 |
    v                                 v
Link validation --------------> Authorization checks
                                      |
                          +-----------+-----------+
                          |           |           |
                          v           v           v
                         User      Developer     Admin
                         portal     portal       portal
                          |           |           |
                          +-----------+-----------+
                                      |
                                      v
                              Security audit log
```

**Authentication** answers “Who is signed in?” **Authorization** answers “What may this account do, and where?” A valid email code or portal link never grants roles by itself.

## 3. Passwordless authentication

### Standard flow for all human accounts

1. The user opens the appropriate portal sign-in page and enters their registered email address.
2. WebManager responds with a generic message that does not reveal whether an account exists.
3. For an eligible account, the system sends a one-time verification code to its registered email address.
4. The user enters the code on the same WebManager sign-in flow.
5. The server verifies the code, expiry, attempt count, account status, and authentication request binding.
6. On success, the code is consumed and a secure session is created.
7. The server checks the account's current permissions before allowing portal access.

No permanent password is required for ordinary users, developers, or administrators. Machine/service accounts are a separate case and must use dedicated machine credentials rather than a human email-code flow.

### Initial code policy

| Control | Initial requirement |
|---|---|
| Code lifetime | 5 minutes |
| Code use | Single-use; consume atomically after successful verification |
| Failed verification | Maximum 5 attempts per issued code, then invalidate it |
| Resend | Rate-limited; issuing a new code invalidates the previous code |
| Request throttling | Apply limits per account/email, IP, and appropriate abuse signals |
| Responses | Do not disclose whether an email is registered or eligible |
| Storage | Never store or log the raw code; use a suitable keyed hash or secure verification design |
| Delivery | Use a trusted email provider over TLS; never expose provider credentials to the browser |
| Sessions | Secure, HttpOnly cookies; appropriate SameSite policy; HTTPS; rotate session ID after authentication |
| Recovery | Verified, audited process; recovery must not bypass roles or portal permissions |

These are initial application policy values and must be validated with tests and operational monitoring. Email OTP verifies access to an email inbox; it is not phishing-resistant and does not guarantee that the mailbox owner is the rightful account owner.

### Privileged accounts

Developers and administrators also use passwordless sign-in. Because their permissions are more sensitive, add stronger protections for privileged accounts and actions. Prefer passkeys/security keys for administrator access and critical actions where practical. Require reauthentication for high-impact changes, protect role changes, and never let an email code alone grant privileged roles.

## 4. Portal links

Portal entry routes are not secrets. The security comes from account binding, authentication, token validation, and server-side authorization.

### Required policy

- Each issued portal link is bound server-side to one account and one portal.
- Link lifetime is **10 minutes** from issuance; the server clock is authoritative.
- Links are single-use where the flow permits it.
- A link is rejected if expired, revoked, consumed, malformed, or bound to a different authenticated account.
- A link never grants roles or bypasses normal sign-in.
- After authentication, the server compares the authenticated account ID with the account bound to the link and checks current permissions.
- Store only a cryptographic hash of a high-entropy secret token; never store or log the raw token.
- Do not put account IDs, roles, email addresses, or other sensitive details in the token itself.
- Use HTTPS, avoid third-party assets on token-bearing pages, apply a restrictive referrer policy, and prevent token values from being sent to analytics.
- Consume single-use tokens atomically to prevent concurrent replay.
- Provide a safe way to revoke outstanding links and invalidate them when access is removed.

### Expiration and link events

| Event | Result | Account lock? | Audit record? |
|---|---|---|---|
| Correct account uses valid link and has permission | Continue the sign-in/access flow | No | Yes |
| Different authenticated account attempts a still-valid account-bound link | Reject | Apply the defined 24-hour lock to the authenticated account making the attempt, subject to verified account binding | Yes |
| Expired link is opened | Reject; offer a way to request a new link | **No** | Yes, when detectable |
| Revoked link is opened | Reject | No, by default | Yes, when detectable |
| Consumed single-use link is replayed | Reject | No, by default | Yes |
| Malformed or unrecognized token | Reject safely | No automatic lock | Record a security event without claiming the token is a known expired link |
| Account lacks the required portal permission | Deny access | No automatic lock unless a separately defined security rule applies | Yes |

**Important identity condition:** do not lock an account based only on an anonymous request. A cross-account lock is considered only when the system has established the authenticated account making the attempt and verified that the presented token is a known, still-valid account-bound link for a different account. The account whose link was copied must not be locked merely because someone else attempted to use it.

For a link that has expired, the system records the attempt when it can identify the event, but it must not lock, suspend, or otherwise penalize any account.

## 5. Account lock policy

The product policy for a qualifying cross-account attempt is a **24-hour lock on the authenticated account making the attempt**, unless an authorized administrator unlocks it earlier.

- Reject the attempted access immediately.
- Record the event and reason.
- Revoke relevant active sessions when appropriate to the risk and lock policy.
- Notify security administrators through an approved alerting channel.
- Store the lock start, scheduled expiry, reason code, and any override audit entry.
- Automatically remove the timed lock after 24 hours, provided no separate suspension remains.
- An administrator may unlock earlier only through an authenticated, authorized, audited action.
- Unlocking must not restore revoked roles or bypass other restrictions.

Do not apply this lock to expired, revoked, malformed, or merely replayed links by default. Incorrect codes should be handled through code-attempt limits and throttling. Account locking can be abused to deny service, so test the conditions carefully and monitor unusual patterns.

## 6. Roles and authorization

Use centralized role-based access control (RBAC) combined with scopes and explicit permissions. A role name is not a substitute for authorization checks.

### Initial role catalog

| Role | Purpose |
|---|---|
| `SUPER_ADMIN` | Exceptional platform-wide control and emergency recovery; tightly restricted |
| `PLATFORM_ADMIN` | Routine platform configuration and platform operations |
| `SECURITY_ADMIN` | Security events, lock policy, incident response, and security controls |
| `USER_ADMIN` | Approved user-account administration |
| `ROLE_ADMIN` | Assign/revoke roles within explicit limits; cannot grant powers beyond its own scope |
| `AUDIT_ADMIN` | Read authorized audit records; normally read-only |
| `SUPPORT_ADMIN` | Support and approved account recovery, without unrestricted access to private user data |
| `DEVELOPER` | Development functions for assigned projects/apps |
| `APP_ADMIN` | Administration of assigned applications only |
| `CODE_REVIEWER` | Review code changes within assigned repositories/projects |
| `QA_TESTER` | Test assigned apps and environments |
| `PUBLISHER` | Publish approved releases within assigned scope |
| `ORG_ADMIN` | Manage a specific organization/tenant |
| `ORG_MEMBER` | Participate in an assigned organization |
| `USER` | Standard registered account |
| `GUEST_COLLABORATOR` | Limited access to explicitly shared resources |
| `SERVICE_ACCOUNT` | Non-human process using machine credentials and limited scopes |

Specialized roles such as database administrator, billing administrator, content editor, and infrastructure administrator may be added when a real requirement exists. Do not implement dozens of overlapping roles prematurely.

### Permission examples

- `portal.user.access`
- `portal.developer.access`
- `portal.admin.access`
- `app.view`, `app.create`, `app.update`, `app.publish`
- `user.view`, `user.suspend`, `user.unlock`
- `role.assign`, `role.revoke`
- `security.audit.read`, `security.sessions.revoke`
- `platform.settings.read`, `platform.settings.update`

Permissions must be checked on the server for every protected page, API route, server action, and data operation. Check resource ownership and organization/tenant scope as well as the role. Hiding a button or URL is not authorization.

### Separation of duties

- A developer role must not automatically permit production-secret or customer-data access.
- An app administrator is scoped to assigned apps.
- An organization administrator is scoped to their organization.
- Role assignment and privilege escalation must be tightly restricted and audited.
- Do not use the everyday account for emergency super-administrator work.
- Where feasible, require approval or reauthentication for high-impact role changes.

## 7. Audit logging

Record security-relevant events, including:

- Sign-in/code requests and outcomes.
- Code verification failures, expiration, and throttling.
- Valid, expired, revoked, consumed, and cross-account link attempts.
- Account locks, unlocks, suspensions, and recovery.
- Email-address changes.
- Session creation and revocation.
- Role/permission changes.
- Privileged configuration changes and publication events.

A log entry should contain, where available and appropriate: event type, UTC timestamp, outcome/reason code, portal, internal account ID, non-secret link/request identifier, and limited request metadata.

**Never log:** raw OTPs, raw portal tokens, session cookies, authorization headers, passwords, private keys, or provider credentials. Do not place secret tokens in analytics, error messages, URLs sent to third parties, or client logs.

Protect audit logs from unauthorized reading and modification. Set a documented retention period, restrict access, minimize personal data, and monitor for unusual activity. For an unrecognized token, log an invalid-token event rather than asserting it was a specific expired link.

## 8. Email changes and account recovery

- Verify an email address before using it as an account's authentication destination.
- Require additional verification for changing the registered email.
- Notify the old and new addresses of a change where feasible.
- Rate-limit recovery requests and use generic responses.
- Do not allow support staff to bypass identity checks.
- Record recovery, email changes, and administrative overrides.
- Revoke outstanding links and relevant sessions when an account is compromised or its email changes.
- Provide a documented process for loss of mailbox access; recovery must not rely only on possession of a session that may be compromised.

## 9. Session, application, and data security

- Use HTTPS in all deployed environments.
- Use secure, HttpOnly session cookies with appropriate SameSite settings.
- Rotate sessions after authentication and sensitive privilege changes.
- Support logout, session expiry, and session revocation.
- Apply CSRF protections appropriate to the selected framework and authentication design.
- Validate all untrusted input server-side.
- Use parameterized database operations and least-privilege database credentials.
- Keep development, preview, test, and production credentials/data separate.
- Never silently fall back to production services when a development connection fails.
- Keep secrets server-side and out of Git, browser bundles, and logs.
- Minimize stored data; enforce personal-data and tenant isolation at query and authorization boundaries.
- Use reviewed, repeatable database migrations and test backup restoration.
- Apply dependency updates, security scanning, rate limits, and abuse monitoring.
- Use synthetic or sanitized data outside production.

## 10. Initial project setup

Prerequisites: a supported Node.js LTS release (Node.js 20.9 or newer for the initial Next.js setup), Git, and pnpm.

From the repository root:

```bash
pnpm install
pnpm dev
```

Open the local address printed by Next.js, normally `http://localhost:3000`.

Useful commands:

```bash
pnpm dev        # Start the web app in development mode
pnpm build      # Build the web app
pnpm typecheck  # Run TypeScript checks
```

The sign-in/sign-up screen is initially a **UI prototype**. It does not send emails, create accounts, verify codes, establish sessions, or enforce portal authorization yet. Do not deploy it as a functioning login system until the server-side authentication work and tests are complete.

## 11. Implementation sequence and acceptance checklist

1. [ ] Create the responsive sign-in/sign-up UI.
2. [ ] Select and configure a maintained authentication/session approach.
3. [ ] Configure email delivery using server-side secrets.
4. [ ] Implement account lookup with non-enumerating responses.
5. [ ] Implement one-time code creation, secure storage, expiry, atomic consumption, attempt limits, and resend throttling.
6. [ ] Implement secure session creation, rotation, logout, expiry, and revocation.
7. [ ] Implement account-bound 10-minute portal links, revocation, and replay protection.
8. [ ] Implement centralized RBAC and resource/tenant scope checks.
9. [ ] Implement audit events without secrets.
10. [ ] Implement and test the 24-hour cross-account lock and administrator unlock.
11. [ ] Add stronger authentication for privileged accounts and high-risk actions.
12. [ ] Test boundary conditions, parallel token use, replay, account mismatch, expiry, revoked permissions, session revocation, and recovery.
13. [ ] Review privacy, accessibility, rate limits, operational alerts, and production configuration.

### Minimum security acceptance tests

- [ ] A code cannot be used after five minutes or after successful use.
- [ ] A portal link cannot be used at or after its ten-minute expiry.
- [ ] An expired link produces an audit event when detectable and never locks an account.
- [ ] A valid link bound to Account A is rejected when used by a different authenticated Account B.
- [ ] A qualifying cross-account attempt locks Account B, not Account A.
- [ ] A malformed or unknown token does not trigger an account lock.
- [ ] Revoked permissions block access even if a link/session remains otherwise valid.
- [ ] UI route hiding cannot bypass server-side authorization.
- [ ] No test, log, or error response exposes raw codes, tokens, or session secrets.
- [ ] An unauthorized person cannot unlock an account or assign privileged roles.
- [ ] User data cannot be read across account, workspace, or tenant boundaries.
- [ ] All critical security actions have audit records.

## 12. References

- [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Multifactor Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html)
