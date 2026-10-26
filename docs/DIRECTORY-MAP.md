# WebManager Directory and File Map

This guide explains where code belongs so you can navigate the existing repository in VS Code. It documents the current structure and intended responsibilities; it does not mean every planned feature exists. Check the actual files in your checkout before editing.

## Repository root

```text
WebManager/
├── apps/                    # Runnable applications: web frontend and API service.
│   ├── web/                 # Next.js browser-facing portal.
│   └── api/                 # Fastify HTTP API and server-side logic.
├── packages/
│   └── database/            # Database schema/migrations shared by backend code.
├── docs/                    # Product, architecture, security, setup, and learning guides.
│   └── dependencies/        # Dependency policy and human-readable inventory; not installed libraries.
├── .github/                 # GitHub workflows and repository contribution configuration, if present.
├── package.json             # Root commands, project metadata, and package-manager version.
├── pnpm-workspace.yaml      # Declares apps/* and packages/* as pnpm workspace locations.
├── tsconfig.base.json       # Shared TypeScript compiler defaults.
├── compose.yaml             # Local development services and their network/volumes.
├── Dockerfile.dev           # Development container image for the web app.
├── .env.example             # Safe example configuration; copy locally to .env.
├── .gitignore               # Paths Git should not track, including local secrets/dependencies.
├── README.md                # Project overview, current status, and quick-start instructions.
└── LICENSE                  # Project license terms.
```

Some folders may contain additional files not listed here. This map is intentionally high-level; it is not a generated inventory of every path.

## Application code

### `apps/web/` — browser UI

The Next.js application users interact with. Put browser-facing pages, components, styles, and UI behavior here. Keep database credentials and privileged authorization logic out of this app.

- `apps/web/package.json` — scripts and dependencies for the web app.
- `apps/web/src/app/page.tsx` — current entry/sign-in page, its UI state, form events, and requests to the API.
- `apps/web/src/app/layout.tsx` — shared HTML document layout and page metadata.
- `apps/web/src/app/globals.css` — global styles, design tokens, layout, and responsive behavior.
- `apps/web/tsconfig.json` — TypeScript configuration for this app, if present.
- `apps/web/Dockerfile` — app-specific container setup, if present.

**Learning path:** read `layout.tsx`, then `page.tsx`, then `globals.css`. Change one small UI behavior at a time.

### `apps/api/` — server API

The Fastify service receives browser requests, validates them, interacts with storage and email services, and enforces server-side access rules.

- `apps/api/package.json` — API scripts and dependencies.
- `apps/api/src/server.ts` — server setup, request handling, routes, and response behavior.
- `apps/api/src/config.ts` — environment access, portal parsing, token helpers, and shared configuration functions.
- `apps/api/src/db.ts` — database connection/pool setup.
- `apps/api/src/email.ts` — email delivery adapter.
- `apps/api/src/migrate.ts` — applies the database migration during local setup.
- `apps/api/tsconfig.json` — TypeScript settings for the API, if present.
- `apps/api/Dockerfile` — API container setup, if present.

**Rule:** the API—not a UI label, URL, or client-provided role—is responsible for authorization.

### `packages/database/` — database schema

This package contains shared database artifacts such as SQL migrations.

- `packages/database/migrations/001_init.sql` — initial schema applied by the API migration command (confirm the exact filename in your checkout).

Use migrations for intentional schema changes. Do not edit a schema without considering existing local data, constraints, and how the change will be applied in other environments.

## Configuration and local services

- `package.json` — root scripts such as `dev`, `build`, `typecheck`, `test`, and Docker shortcuts. It does not contain the implementation of those commands.
- `pnpm-workspace.yaml` — tells pnpm which app/package folders belong to the workspace.
- `tsconfig.base.json` — shared TypeScript compiler options inherited by projects where configured.
- `compose.yaml` — local PostgreSQL, Mailpit, API, and web services, ports, networks, volumes, and optional portal profile.
- `Dockerfile.dev` — container image used to run the web app in development.
- `.env.example` — names and safe local defaults for environment variables. It is a template, not a place for real secrets.
- `.env` — your private local environment file; it must remain untracked.
- `pnpm-lock.yaml` — dependency lockfile, if present. It pins resolved package versions and should be committed when generated/maintained.

## Documentation

- `docs/README.md` — index and documentation rules.
- `docs/development/README.md` — existing general development setup guidance.
- `docs/development/MANUAL-CODING.md` — recommended hands-on learning and change workflow.
- `docs/development/PROGRESS.md` — learner-owned checklist and work log.
- `docs/dependencies/README.md` — how to add, update, review, and remove packages using pnpm.
- `docs/dependencies/DEPENDENCY-REGISTER.md` — direct dependency inventory and change log; manifests and lockfile remain authoritative.
- `docs/DIRECTORY-MAP.md` — this file: where files belong.
- `docs/architecture/README.md` — logical system layers and proposed package boundaries.
- `docs/security/README.md` — security requirements and current implementation caveats.
- `docs/testing/README.md` — unit, integration, end-to-end, and security verification strategy.
- `docs/deployment/README.md` — local services and hosted deployment considerations.
- `docs/stages/README.md` — staged roadmap and exit criteria.
- `docs/decisions/README.md` — architecture decision record guidance.

A document may describe a future requirement. Confirm its status in code and tests before assuming it has been implemented.

## Where should a new file go?

| If you are adding… | Start here | Reason |
|---|---|---|
| A page or browser interaction | `apps/web/src/app/` or the existing UI component location | It belongs to the web presentation layer. |
| Global styles or responsive layout | `apps/web/src/app/globals.css` | Shared page styling is already located here. |
| An HTTP route or server-side validation | `apps/api/src/server.ts` or an existing API module | Keep trusted request handling on the server. |
| Environment/configuration helpers | `apps/api/src/config.ts` or existing config modules | Avoid scattering configuration parsing. |
| Database schema changes | `packages/database/migrations/` | Migrations record deliberate schema evolution. |
| A test | Near the code using the existing test conventions, or the configured test directory | Keep tests discoverable and runnable. |
| Learning notes or workflow instructions | `docs/development/` | Separate instructions from runtime code. |
| Security requirements | `docs/security/README.md` | Keep security policy in its source-of-truth guide. |
| A new dependency or major architecture choice | Relevant workspace `package.json`, root `pnpm-lock.yaml`, and `docs/dependencies/DEPENDENCY-REGISTER.md`; add an ADR in `docs/decisions/` when material | Declare it in the workspace that uses it, keep the lockfile in sync, and record why it is needed. |

Do not create a new package or reorganize folders just because a future architecture diagram includes one. First identify a real need, discuss the boundary, and update the map if the structure changes.
