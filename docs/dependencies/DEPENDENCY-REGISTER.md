# WebManager Dependency Register

This is a human-readable learning and review index. The authoritative dependency declarations are the `package.json` files, and the authoritative resolved versions are in the root `pnpm-lock.yaml` when that lockfile is present. If this register and a manifest disagree, trust the manifest/lockfile and update this document.

Update this file when dependencies are added, removed, materially upgraded, or adopted for a new purpose. It is not necessary to duplicate every transitive dependency: record direct dependencies that matter to understanding the application.

## Web app — `apps/web/package.json`

| Package | Declared range | Type | Purpose | Review notes |
|---|---|---|---|---|
| `next` | `^15.5.0` | Runtime | Next.js app framework, routing, rendering and build system. | Review Next.js release/security notes during upgrades. |
| `react` | `^19.1.0` | Runtime | UI components and rendering model. | Keep compatible with the selected Next.js version. |
| `react-dom` | `^19.1.0` | Runtime | React rendering integration for the web platform. | Keep aligned with React. |
| `@types/node` | `^22.15.30` | Development | TypeScript declarations for Node.js APIs used by tooling/server-side code. | Check Node.js target/runtime assumptions. |
| `@types/react` | `^19.1.8` | Development | TypeScript declarations for React. | Keep compatible with React. |
| `@types/react-dom` | `^19.1.7` | Development | TypeScript declarations for React DOM. | Keep compatible with React DOM. |
| `typescript` | `^5.8.3` | Development | Type checking and TypeScript compilation. | Run typecheck and build after updates. |

## API — `apps/api/package.json`

| Package | Declared range | Type | Purpose | Review notes |
|---|---|---|---|---|
| `@fastify/cookie` | `^11.0.2` | Runtime | Fastify cookie parsing and response cookie support. | Review cookie/session security behavior after updates. |
| `@fastify/cors` | `^10.0.2` | Runtime | Configures cross-origin request handling. | Recheck allowed origins and credential behavior. |
| `fastify` | `^5.3.3` | Runtime | HTTP API server and route framework. | Review plugin compatibility and server behavior. |
| `nodemailer` | `^7.0.3` | Runtime | Sends email messages such as verification codes. | Keep SMTP credentials server-side; test delivery adapter. |
| `pg` | `^8.16.0` | Runtime | PostgreSQL client/pool for server-side database access. | Review TLS, pool limits, query behavior and migrations. |
| `@types/node` | `^22.15.30` | Development | TypeScript declarations for Node.js APIs. | Keep aligned with the supported runtime. |
| `@types/nodemailer` | `^6.4.17` | Development | TypeScript declarations for Nodemailer. | Check compatibility when updating Nodemailer. |
| `@types/pg` | `^8.15.4` | Development | TypeScript declarations for the PostgreSQL client. | Run typecheck after updates. |
| `tsx` | `^4.19.4` | Development | Runs TypeScript source files in development and migration/test scripts. | Check scripts still run after updates. |

## Root workspace

| Item | Current declaration | Purpose |
|---|---|---|
| Package manager | `pnpm@10.12.1` in root `package.json` | Pins the intended package manager version. |
| Workspace members | `apps/*`, `packages/*` in `pnpm-workspace.yaml` | Makes app/package manifests part of the pnpm workspace. |
| Lockfile | `pnpm-lock.yaml` is currently absent from the repository root. | First setup must run `pnpm install`, review the generated lockfile, and commit it; use frozen installs after that. |

## Change log

Add new entries at the top. Keep each entry factual and include the relevant commit or pull request when available.

### Initial register

- Created as a learning inventory from the current web and API manifests.
- Repository review found no root `pnpm-lock.yaml`; generating and committing the initial lockfile is an outstanding setup task.
- No dependency was added, removed, or upgraded by creating this register.
- The declared ranges above are taken from the manifests; they are not a statement that these are the newest versions or that the code has been verified against every compatible version.

## Entry template for future changes

```text
Date:
Package:
Workspace:
Change: added / updated / removed
Previous declaration:
New declaration:
Reason:
Official documentation/changelog reviewed:
Files changed:
Checks run and results:
Follow-up or known risk:
Commit:
```
