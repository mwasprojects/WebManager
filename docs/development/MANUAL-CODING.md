# Manual Coding Workflow

This guide is for developing WebManager by hand in VS Code. Keep the existing repository and working code; do not scaffold a replacement project or rewrite working files just to match a proposed architecture.

## 1. Start from the existing repository

Clone the existing repository and open its root folder in VS Code:

```bash
git clone https://github.com/mwasprojects/WebManager.git
cd WebManager
code .
```

Before editing, inspect the current state:

```bash
git status
git log -5 --oneline
```

Use the default branch as requested for this learning workflow. Do not create branches as part of these instructions. Commit small, understandable changes so you can review or revert your own work.

## 2. Learn the current code before adding more

Recommended first inspection order:

1. `README.md` — project purpose and safe local start.
2. `package.json` and `pnpm-workspace.yaml` — workspace commands and packages.
3. `docs/dependencies/README.md` and `DEPENDENCY-REGISTER.md` — how dependency declarations, lockfiles, and review notes work.
4. `apps/web/src/app/page.tsx` — existing sign-in/sign-up page and browser-to-API requests.
5. `apps/web/src/app/globals.css` and `layout.tsx` — current styles and document layout.
6. `apps/api/src/server.ts` — HTTP routes and request handling.
7. `apps/api/src/config.ts`, `db.ts`, and `email.ts` — configuration, database, and email boundaries.
8. `packages/database/migrations/001_init.sql` — initial database schema.
9. `compose.yaml` and `.env.example` — local services and configuration names.
10. `docs/security/README.md` and `docs/testing/README.md` — important requirements and missing verification.

Paths above describe the intended/current repository layout; confirm a path exists in your checkout before editing it.

## 3. Repeat this small learning loop

For every task:

1. **Choose one small outcome.** Example: explain one function, improve one validation message, or add one focused test.
2. **Read first.** Read the complete file and any function it calls. Follow the data flow before changing code.
3. **Predict.** Write down what you think the current code does and what your change should do.
4. **Learn the concept.** Use the linked official documentation or a relevant tutorial in `../RESOURCES.md` if available.
5. **Implement manually.** Type the change yourself. Do not replace whole files unless the task truly requires it.
6. **Manage dependencies deliberately.** Before adding or updating a library, follow `docs/dependencies/README.md`; keep package declarations in the correct workspace manifest and commit the lockfile change.
7. **Run a focused check.** Test the smallest relevant behavior, then run broader checks when appropriate.
8. **Inspect the diff.** Use `git diff --check` and `git diff`. Look for unrelated edits, leaked secrets, and accidental deletions.
9. **Explain it back.** Add a short note to `PROGRESS.md) in your own words: what changed, why it works, and what remains unclear.
10. **Commit the completed unit.** Use a clear message, for example `docs: explain web app structure`.

## 4. Setup and run locally

Requirements: Git, Docker Desktop/Engine with Compose, and optionally Node.js plus pnpm if you want to run commands on the host. Check `README.md`, `.env.example`, and `docs/deployment/README.md` before starting services.

Create a local environment file and set a new local-only secret:

```bash
cp .env.example .env
openssl rand -base64 48
```

Paste the generated value into `AUTH_SECRET` in `.env`. Never commit `.env`, real credentials, OTPs, session tokens, or production secrets.

Start the local stack:

```bash
docker compose up --build
```

Local addresses:
- Web portal: http://localhost:3000
- API health endpoint: http://localhost:4000/health
- Mailpit development inbox: http://localhost:8025

Stop services with `docker compose down`. Read the deployment guide before using the optional developer/admin portal profile. The local setup is for development only.

## 5. Checks

From the repository root, use the checks supported by the current manifests:

```bash
pnpm typecheck
pnpm build
pnpm test
```

Run `pnpm install` first if you are using host tools and dependencies are not installed. Docker startup and a successful build do not by themselves prove authentication or authorization is secure. Record which checks you actually ran and their result; never mark a task verified just because the code was saved.

## 6. Coding conventions

- Keep changes small and focused on the current task.
- Preserve the existing folder structure unless a concrete requirement justifies a change.
- Add comments to explain **why** non-obvious code exists; use documentation/README files to explain folder purpose. Avoid comments that merely repeat a line of code.
- Prefer clear names, explicit types, small functions, and consistent error handling.
- Keep server secrets on the server; anything prefixed with `NEXT_PUBLIC_` may be exposed to browser code.
- Validate and authorize requests on the server; hiding a button in the UI is not authorization.
- Do not claim security, test coverage, scalability, or production readiness without evidence.
- Update the relevant guide and `PROGRESS.md` when behavior or status changes.

## 7. Next task

Open [the progress tracker](PROGRESS.md), start at the first unchecked task, and work on one task at a time. If a task is unclear, ask for help with the specific file and function before changing unrelated files.
