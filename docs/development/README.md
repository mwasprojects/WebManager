# Development guide

## Prerequisites

- Node.js 20.9 or newer
- pnpm
- Git

## Start the project

From the repository root:

```bash
pnpm install
pnpm dev
```

## Verify changes

```bash
pnpm typecheck
pnpm build
```

## Current milestone

The first milestone is the sign-in/sign-up interface and workspace foundation. Authentication is not connected yet. Before implementing it, choose a maintained authentication/session library and an email delivery provider, then write tests for code expiry, replay, throttling, session handling, portal-link ownership, and authorization.

Do not put real credentials in source control. Use a local untracked `.env.local` file for development secrets and configure deployment secrets through the hosting provider.


## UI testing with Docker

Docker is an alternative to installing Node.js and pnpm on the host for running the web UI. Install Docker Desktop on Windows/macOS, or Docker Engine plus the Compose plugin on Linux.

From the repository root:

```bash
docker compose up --build
```

Open `http://localhost:3000`. Source files are bind-mounted for development reloads. The port is bound to `127.0.0.1` so the development server is not intentionally exposed to the local network.

Useful commands:

```bash
docker compose logs --follow web
docker compose down
docker compose up --build
```

The last command rebuilds the image and refreshes installed dependencies after package-manifest changes. The current setup is intended for UI development/testing only; authentication, email, and database services are not configured. No production-readiness claim is implied.


## UI testing with a Vercel Preview

Use a Vercel Preview when you need to test the UI on another device or share a build without running your computer as a server.

1. Commit and push your feature branch to GitHub.
2. Import `mwasprojects/WebManager` into [Vercel](https://vercel.com/) and connect the repository.
3. Configure the project Root Directory as `apps/web` and confirm Next.js is detected.
4. Ensure the root pnpm lockfile is committed, then deploy the branch.
5. Open the Preview URL from Vercel and test responsive layouts, navigation, and browser-console errors.
6. Review Vercel's build logs for failures. Keep testing on Preview; production deployment is a separate release decision.

Do not configure fake or production credentials for this UI-only stage. For detailed monorepo, environment-variable, and release guidance, see [the deployment guide](../deployment/README.md). Vercel's official [monorepo guide](https://vercel.com/docs/monorepos) explains project root configuration.
