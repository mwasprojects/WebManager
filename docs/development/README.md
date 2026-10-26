# Development Guide

This repository already contains an early implementation: a Next.js web portal, Fastify API, PostgreSQL migration, email-code authentication flow, server-side sessions, and portal role checks. It is not yet independently verified or production-ready. Learn the existing implementation before adding new packages or replacing files.

## Read first

1. Root `README.md` — overview, setup, commands, and current limitations.
2. [Manual coding workflow](MANUAL-CODING.md) — hands-on VS Code process.
3. [Progress tracker](PROGRESS.md) — staged learning checklist.
4. [Directory map](../DIRECTORY-MAP.md) — purpose of the current folders and key files.
5. [Security guide](../security/README.md) — security requirements and limitations.
6. [Testing guide](../testing/README.md) — what needs verification.
7. [Dependency management](../dependencies/README.md) — how to add, update, review, and remove dependencies safely.
8. [Dependency register](../dependencies/DEPENDENCY-REGISTER.md) — current direct dependency inventory and change log.
9. [Deployment guide](../deployment/README.md) — local stack and hosted deployment notes.

## Requirements

- Git.
- Docker Desktop (Windows/macOS) or Docker Engine with the Compose plugin (Linux).
- Node.js and pnpm if you prefer running workspace commands on the host instead of relying on the development container.

Check the root README and `.env.example` before starting services.

## Local development

Create a local environment file and set a fresh development-only secret:

```bash
cp .env.example .env
openssl rand -base64 48
```

Paste the generated value into `AUTH_SECRET` in `.env`. Never commit `.env`, credentials, verification codes, session tokens, or production secrets.

Start the stack:

```bash
docker compose up --build
```

Open:
- Web portal: `http://localhost:3000`
- API health endpoint: `http://localhost:4000/health`
- Mailpit local email capture: `http://localhost:8025`

Mailpit captures development emails; it does not deliver them to real inboxes. For the developer/admin portal profile and local role provisioning, follow [the deployment guide](../deployment/README.md). Separate ports are not an authorization boundary.

Stop the services with `docker compose down`.

## Host commands

From the repository root, the current root scripts include:

```bash
pnpm install
pnpm dev
pnpm api:dev
pnpm db:migrate
pnpm typecheck
pnpm build
pnpm test
```

Use the commands in the root `package.json` as the source of truth. If a command fails, capture the exact error and inspect the relevant package manifest before changing configuration. Before adding, updating, or removing a package, follow the [dependency management guide](../dependencies/README.md) and update the dependency register.

## Manual coding rules

- Use the existing repository and preserve working code.
- Make one small change at a time; do not recreate the scaffold.
- Explain non-obvious code with comments; use documentation files for folder purpose and workflow.
- Inspect `git diff --check` and `git diff` before committing.
- This learning workflow uses the existing default branch and does not require creating branches. Make small commits and never force-push or rewrite shared history.
- Run relevant tests and checks; record the actual result in [the progress tracker](PROGRESS.md).
- A successful start or build is not a security audit. Do not use this early implementation with real users or production credentials.

## Preview deployments

Use [the deployment guide](../deployment/README.md) for current hosting notes. Treat hosted previews as a separate environment, use non-production credentials and data, and do not deploy changes merely because they compile.
