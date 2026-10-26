# Manual Coding Progress

This is a learning checklist for the existing codebase, not a claim that all implementation work is complete. Check an item only after doing the work yourself and recording evidence. Keep this file updated in small steps.

## How to record progress

For each task, record:
- **Date**
- **Task**
- **Files inspected or changed**
- **What I learned** (in your own words)
- **Checks run and results**
- **Next question or task**

## Stage 0 — Understand the existing project

- [ ] Read the root `README.md` and explain WebManager's current purpose.
- [ ] Run `git status` and `git log -5 --oneline`; understand what each shows.
- [ ] Read `package.json` and identify the root commands.
- [ ] Read `pnpm-workspace.yaml` and explain which folders are workspace packages.
- [ ] Read `compose.yaml` and identify the web, API, database, and email-capture services.
- [ ] Read `.env.example`; explain why real secrets must stay in `.env`.
- [ ] Read the [directory map](../DIRECTORY-MAP.md) and locate each major area in VS Code.

**Exit check:** I can describe the repository layout without guessing and can explain how the local development services fit together.

## Stage 1 — Run and observe the current baseline

- [ ] Install/enable the required local tools (Git and Docker; Node.js/pnpm if using host commands).
- [ ] Create an untracked `.env` file from `.env.example` and generate a local-only `AUTH_SECRET`.
- [ ] Start the stack using the deployment guide.
- [ ] Open the web portal and inspect the page at desktop and mobile widths.
- [ ] Open the Mailpit development inbox and understand its purpose.
- [ ] Check the API health endpoint.
- [ ] Read service logs and identify one successful startup message for each service.
- [ ] Stop the stack cleanly and confirm you understand what `docker compose down` does.

**Exit check:** The local baseline starts and stops, and I can explain which service handles each part.

## Stage 2 — Understand the web UI

- [ ] Read `apps/web/src/app/layout.tsx`.
- [ ] Read `apps/web/src/app/page.tsx` in small sections; trace the form submission flow.
- [ ] Read `apps/web/src/app/globals.css`; identify design tokens, layout rules, and responsive styles.
- [ ] Explain how the web UI calls the API and why `credentials: "include"` matters.
- [ ] Make one small, visible UI improvement without replacing the page.
- [ ] Test the change in the browser and inspect `git diff`.

**Exit check:** I can explain the page structure, state, event handlers, styling, and API calls.

## Stage 3 — Understand the API and configuration

- [ ] Read `apps/api/src/server.ts` in sections and list the routes.
- [ ] Read `apps/api/src/config.ts` and explain required environment variables and portal types.
- [ ] Read `apps/api/src/db.ts` and explain how database connections are created.
- [ ] Read `apps/api/src/email.ts` and trace where verification messages go in development.
- [ ] Read the database migration and identify the tables and constraints.
- [ ] Trace one request from browser form to API route, database/email action, and response.
- [ ] Add or improve one focused test before changing sensitive behavior.

**Exit check:** I can follow a request through the frontend, API, and database without relying on assumptions.

## Stage 4 — Safe small changes and verification

- [ ] Choose one small issue with a clear expected result.
- [ ] Write down expected behavior before coding.
- [ ] Implement the smallest useful change.
- [ ] Run the relevant test, then `pnpm typecheck` and/or `pnpm build` as appropriate.
- [ ] Run `git diff --check` and inspect `git diff`.
- [ ] Update the relevant documentation and this tracker.
- [ ] Commit the finished task on the existing default branch; do not create a branch for this workflow.

**Exit check:** The change is focused, explained, checked, and committed with an accurate message.

## Stage 5 — Security and production gaps

Read and work through `docs/security/README.md` and `docs/testing/README.md`. Do not mark this stage complete until each requirement has implementation and test evidence.

- [ ] Understand OTP expiry, one-time use, attempt limits, and resend behavior.
- [ ] Understand session creation, cookie settings, expiry, and revocation.
- [ ] Understand server-side role checks and denial of unauthorized access.
- [ ] Review rate limiting, request size/time limits, CORS/origin validation, and safe logs.
- [ ] Identify missing end-to-end tests and recovery/unlock behavior.
- [ ] Review dependency installation/lockfile and CI checks.
- [ ] Review deployment configuration and secrets before any hosted release.

**Exit check:** Do not treat a documented requirement as implemented until you can point to code and passing tests.

## Work log

Add new entries at the top.

### No manual tasks recorded yet

The checklist is prepared for the learner to complete. No task is marked complete by default.
