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


## UI testing with Docker

From the repository root, run:

```bash
docker compose up --build
```

Then open `http://localhost:3000`. The Compose service mounts the repository into the container and uses named volumes for dependencies and Next.js build output. This avoids mixing Linux container dependencies with host-installed dependencies.

Use `docker compose logs --follow web` to inspect server output and `docker compose down` to stop/remove the container. After changing package manifests or dependencies, rebuild using `docker compose up --build`.

This is a development container only. It does not provide a production image or implement the authentication prototype's backend.
