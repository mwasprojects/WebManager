# Deployment Guide

Vercel and Neon PostgreSQL are planned hosted targets. Local Docker is the first full-stack integration target. A successful local setup does not prove production readiness.

## Local full-stack setup

1. Copy `.env.example` to `.env`.
2. Generate an application secret. For example, in a terminal with OpenSSL: `openssl rand -base64 48`. Put the generated value in `AUTH_SECRET` in your untracked `.env` file.
3. Start the user portal, API, PostgreSQL, and Mailpit: `docker compose up --build`.
4. Open `http://localhost:3000`. Check verification emails at `http://localhost:8025`.
5. To also start developer and administrator portal instances, run `docker compose --profile multi-portal up --build`. Their local URLs are `http://localhost:3001` and `http://localhost:3002`.
6. API health: `http://localhost:4000/health`.

The development SMTP sink is Mailpit; emails are captured locally and not delivered to real inboxes. The Compose database credentials are for local development only. Do not expose these services to the internet.

## Provisioning developer/admin access locally

Only user accounts can self-register. Do not grant a role based on a form field or portal URL. For local testing, create a user through the user portal first, then grant a role explicitly in the database:

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'developer' FROM users WHERE email = 'developer@example.test'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM users WHERE email = 'admin@example.test'
ON CONFLICT DO NOTHING;
```

Replace the example addresses with accounts you own. The user must first complete email verification on the user portal; then they can request codes on a privileged portal. This SQL procedure is for local testing only. Production role grants need an authenticated, audited provisioning workflow.

## Three-port option and security boundary

The three frontends are separate local instances of the same Next.js application, configured as user, developer, and admin portals. They share the API and database. Separate ports make it easier to test different portal experiences but are not access controls. The API checks the session and role for the requested portal on every protected request. The session cookie names are portal-specific.

For hosted deployment, do not expose privileged portals or database ports publicly without a deliberate access policy. Vercel Preview deployments should use non-production credentials and data. Cross-origin production deployment requires explicit API origins and secure cookie settings.

## Vercel and Neon

The frontend can be imported into Vercel with root directory `apps/web`. Configure `NEXT_PUBLIC_API_URL` to point to the deployed API origin, and configure the corresponding allowed origin in the API service. The Fastify API needs a Node.js service host or a deliberate serverless adapter; the Docker API container is not itself a Vercel deployment configuration.

Use a separate Neon database for preview and production, set `DATABASE_URL` and `DATABASE_SSL=true` on the API service, and run `pnpm --filter @webmanager/api db:migrate` against the intended database before releasing code. Use an appropriate pooled Neon connection URL for the runtime and verify TLS settings with the provider's current guidance.

## Release checklist

- [ ] Lockfile committed and frozen installs used in CI.
- [ ] Typecheck, tests, and production build pass.
- [ ] Migrations reviewed and applied to a non-production database first.
- [ ] SMTP delivery verified with the chosen provider.
- [ ] Secrets differ between preview and production and are never committed.
- [ ] API origin allowlist and secure cookie settings reviewed.
- [ ] Role provisioning, lock/disable behavior, session revocation, and authorization tested.
- [ ] Smoke tests and rollback/recovery procedures documented.
