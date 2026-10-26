# Dependency Management Guide

This folder documents how WebManager dependencies are selected, installed, updated, reviewed, and removed. It is a **management and learning folder**, not a place to manually download or copy JavaScript packages.

## The important distinction

WebManager uses pnpm workspaces. Keep dependency declarations in the `package.json` file for the app or package that actually uses them, and keep the generated `pnpm-lock.yaml` at the repository root.

- `package.json` — declares which packages a workspace needs and the allowed version ranges.
- `pnpm-lock.yaml` — records the exact dependency resolution so installs are reproducible. Commit it to Git.
- `node_modules/` — installed files created by pnpm. Do not edit these files manually or commit them.
- `docs/dependencies/` — this folder: human-readable policies, inventory, and learning notes about dependencies.
- `pnpm-workspace.yaml` — tells pnpm which folders are workspace members.
- Root `package.json` — declares the package manager and shared project scripts; app-specific dependencies generally belong in each app's manifest.

**Do not create a second hand-maintained folder of downloaded library code.** That duplicates pnpm's job and makes versions, security updates, and clean installation harder to manage.

## Current workspace layout

```text
WebManager/
├── package.json                  # Root scripts and pnpm version.
├── pnpm-workspace.yaml           # Workspace membership.
├── pnpm-lock.yaml                # Resolved dependency versions (commit this file).
├── apps/
│   ├── web/package.json          # Next.js, React, and web-specific tooling.
│   └── api/package.json          # Fastify, PostgreSQL client, email, and API tooling.
├── packages/
│   └── database/                 # Database assets; add a manifest only if this becomes a workspace package.
└── docs/
    └── dependencies/
        ├── README.md             # This guide: dependency workflow and rules.
        └── DEPENDENCY-REGISTER.md # Human-readable list, purpose, and review status.
```

Confirm the actual files in your clone before relying on a path. Do not add a package manifest to a folder unless it needs to be a workspace package.

## Learn the dependency types

- **Runtime dependency** (`dependencies`): needed when the app runs. Examples include React in the web app or Fastify in the API.
- **Development dependency** (`devDependencies`): tooling used to develop, type-check, test, or build, but not normally required as an application runtime dependency. Examples include TypeScript and `tsx`.
- **Peer dependency** (`peerDependencies`): used when a package is designed to integrate with a dependency supplied by its consumer. Do not add these by default.
- **Optional dependency** (`optionalDependencies`): can be omitted in supported situations. Use only when the app genuinely handles its absence.

Put a dependency in the narrowest workspace that uses it. For example, if only the API imports `fastify`, declare it in `apps/api/package.json`, not in the root manifest or web app.

## Safe workflow: adding a dependency

### 1. Check whether it is already available

Search the code and manifests first. Avoid adding a second library that performs the same job without a clear reason.

From the repository root:

```bash
pnpm list -r --depth -1
pnpm --filter @webmanager/web list --depth 0
pnpm --filter @webmanager/api list --depth 0
```

### 2. Research before choosing

Before adding a library, answer these questions in your notes:

1. What exact problem does it solve?
2. Can the platform or an existing dependency already solve this?
3. Is it maintained and compatible with our Node.js, TypeScript, Next.js or Fastify versions?
4. Does it introduce security, licensing, bundle-size, performance, or operational risks?
5. Is it a runtime dependency or development tool?
6. How will we test it, and how can we remove it if it is unsuitable?

Prefer official documentation and package metadata. Avoid copying install commands from old tutorials without checking current compatibility.

### 3. Install it in the correct workspace

From the repository root, use pnpm's workspace filter so the package is declared in the correct manifest:

```bash
# Runtime package used by the web app:
pnpm --filter @webmanager/web add <package-name>

# Development tool used by the web app:
pnpm --filter @webmanager/web add -D <package-name>

# Runtime package used by the API:
pnpm --filter @webmanager/api add <package-name>

# Development tool used by the API:
pnpm --filter @webmanager/api add -D <package-name>
```

Replace `<package-name>` with the actual package name; the angle-bracket examples are placeholders and must not be run literally. Do not add a dependency just to try it casually—research it first and keep the change focused.

### 4. Review what changed

After installation, inspect:

```bash
git status --short
git diff -- package.json apps/web/package.json apps/api/package.json pnpm-lock.yaml
```

Check that the dependency was added to the intended manifest and that the lockfile changed as expected. Read the package's official docs and use it in a small, focused way.

### 5. Verify

Run relevant checks from the repository root:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Some dependencies need a targeted test or local service as well. If a check fails, determine whether the failure is caused by your change before continuing. Record the exact command and result; do not claim a check passed if you did not run it.

### 6. Commit the complete change

Commit the manifest **and** lockfile changes together with the code and tests that use the package. Example:

```bash
git diff --check
git diff
git add package.json apps/web/package.json apps/api/package.json pnpm-lock.yaml docs/dependencies
git commit -m "chore: add and document dependency"
```

Only stage the files that actually changed for your task; the command above is an example, not a requirement to stage every listed file on every dependency change. This project’s learning workflow uses the existing default branch and does not require creating a branch. Never force-push or rewrite shared history.

## Safe workflow: updating a dependency

1. Read the package's changelog and migration notes.
2. Decide whether the update is a patch, minor, or major change. Semantic version numbers help, but do not guarantee that an update is risk-free.
3. Update one related dependency or a small, coherent group at a time.
4. Use pnpm to update the dependency in the correct workspace; avoid manually editing `node_modules` or guessing lockfile edits.
5. Inspect the manifest and lockfile diff.
6. Run typecheck, relevant tests, and production builds.
7. Test the behavior affected by the update.
8. Record the version change, reason, checks, and any follow-up in [the dependency register](DEPENDENCY-REGISTER.md).
9. Commit the update only after reviewing the diff and results.

For a package already declared in a workspace, pnpm's `update` command can be used with the workspace filter. Consult `pnpm help update` for supported options in the installed pnpm version before running it. Do not blindly update every dependency to the latest major version.

## Safe workflow: removing a dependency

1. Search the repository for imports and usage.
2. Check scripts, configuration, tests, build files, and indirect usage.
3. Remove it from the workspace that declared it using pnpm.
4. Remove or replace the code that depended on it.
5. Run typecheck, tests, and build.
6. Review the manifest and lockfile changes.
7. Update the dependency register and commit the focused change.

Never delete packages directly from `node_modules` as a way of removing them from the project.

## Clean install and lockfile

When the lockfile is present and current, use:

```bash
pnpm install --frozen-lockfile
```

This asks pnpm to install from the committed lockfile without silently changing it. If the command reports that the lockfile and manifests disagree, do not delete the lockfile as a quick fix. Investigate the manifest changes, run a normal `pnpm install` only when intentionally updating dependency resolution, inspect the new lockfile, and commit the matching changes.

The root package currently specifies `pnpm@10.12.1`. Use that project-pinned version unless the team deliberately updates it and verifies the change. Check `pnpm --version` when investigating install differences.

## Security and maintenance rules

- Commit `package.json` files and the root lockfile.
- Never commit `.env`, credentials, access tokens, or private registry credentials.
- Do not commit `node_modules/`.
- Review package health, maintenance, licensing, and advisories before adoption.
- Keep dependencies minimal; fewer packages generally mean less update and security work.
- Do not run arbitrary install scripts or unfamiliar packages without understanding the trust implications.
- Do not use `pnpm audit` output as the only security review; investigate each finding and its reachability/impact.
- Avoid broad, unrelated dependency upgrades in a feature change.
- Document major dependency choices in an Architecture Decision Record when they materially affect architecture or security.
- A successful install does not prove that the application is correct or secure.

## Learn this process manually

For your first dependency task, do not install anything new. Inspect the current root, web, and API manifests and fill in the [dependency register](DEPENDENCY-REGISTER.md) in your own words. Then identify one existing dependency, find the official documentation, and explain where it is used before making any update.

See also: [manual coding workflow](../development/MANUAL-CODING.md), [progress tracker](../development/PROGRESS.md), and [directory map](../DIRECTORY-MAP.md).
