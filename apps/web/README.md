# Web application

This is the primary Next.js App Router application for WebManager.

## Local development

From the repository root:

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Next.js.

## Current state

The root route contains the initial sign-in/sign-up UI prototype. It is not connected to an authentication provider, email delivery, database, or session service yet. Do not use it as a production login system.

The `/api/health` route is a minimal liveness check and intentionally reveals no configuration or infrastructure details.

## Next implementation steps

1. Confirm the authentication library and session strategy.
2. Configure a server-side email provider.
3. Implement code issuance, expiry, one-time consumption, and rate limiting.
4. Add database schema and migrations.
5. Add session and authorization tests before protecting portals.
