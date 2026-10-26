# WebManager Stages and Roadmap

This is the planned sequence, not a claim that any stage is complete. Track individual tasks in GitHub Issues and record evidence before marking a stage verified.

## Stage 0 — Scope and project direction
- [ ] Confirm first-release scope and the first useful user journey.
- [ ] Agree on monorepo, app, and shared-Core boundaries.
- [ ] Record major technology and security decisions.
- [ ] Define the branch workflow and definition of done.

**Exit:** scope, boundaries, and workflow are documented.

## Stage 1 — Repository foundation
- [ ] Confirm Node.js and pnpm versions.
- [ ] Generate and commit the pnpm lockfile.
- [ ] Verify clean dependency installation.
- [ ] Run typecheck and production build; fix failures.
- [ ] Verify GitHub Actions and use frozen-lockfile installation once the lockfile exists.
- [ ] Check ignore rules and example environment variables for secret safety.
- [ ] Establish documentation and decision records.

**Exit:** clean install, typecheck, build, and CI results are confirmed.

## Stage 2 — Web shell and UI
- [ ] Review the existing sign-in/sign-up UI prototype.
- [ ] Define shared layout, navigation, responsive and accessibility conventions.
- [ ] Add appropriate loading, empty, and error states.
- [ ] Keep the prototype clearly labelled until backend behavior exists.
- [ ] Review preview behavior on common screen sizes.

**Exit:** UI behavior is reviewed and does not imply unimplemented security capabilities.

## Stage 3 — Shared server foundation
- [ ] Define API response/error contracts and request IDs.
- [ ] Add structured, secret-safe logging.
- [ ] Define input validation, payload limits, and timeout conventions.
- [ ] Define rate-limit and concurrency-control interfaces.
- [ ] Add health checks and baseline metrics.
- [ ] Add shared UTC clock and duration utilities.

**Exit:** request handling is consistent, resource limits are documented, and time-dependent logic is testable.

## Stage 4 — Database foundation
- [ ] Select database client/ORM and migration tooling after a proof of concept.
- [ ] Configure a dedicated non-production database.
- [ ] Define schema, timestamp, constraint, and index conventions.
- [ ] Establish connection budgets and query timeouts.
- [ ] Implement repeatable migrations and isolated test data.
- [ ] Document backup and restore requirements.

**Exit:** migrations are repeatable and test data does not rely on production credentials.

## Stage 5 — Authentication and sessions
- [ ] Select a maintained authentication/session approach and email provider.
- [ ] Implement generic responses to reduce account enumeration.
- [ ] Implement hashed one-time codes, five-minute expiry, attempt limits, resend invalidation, and throttling.
- [ ] Implement account-bound, ten-minute portal links and replay prevention.
- [ ] Implement session creation, validation, rotation, expiry, logout, and revocation.
- [ ] Implement server-side role, permission, and resource-scope checks.
- [ ] Implement the specified cross-account link-attempt lock and safe unlock process.
- [ ] Add security audit events without secrets.
- [ ] Test expiry boundaries, concurrency, replay, recovery, and authorization.

**Exit:** required security tests pass; the UI does not determine permissions.

## Stage 6 — First complete app
- [ ] Choose one small, useful app and define its owner, data needs, permissions, and acceptance criteria.
- [ ] Implement its UI and domain logic.
- [ ] Persist data only when needed.
- [ ] Add tests and documentation.
- [ ] Document how to register and build another app.

**Exit:** one app is implemented and reviewed; adding another does not require broad rewrites.

## Stage 7 — Resilience and asynchronous jobs
- [ ] Measure request and database performance.
- [ ] Add shared rate limits where limits must span instances.
- [ ] Bound expensive operations and concurrent work.
- [ ] Identify suitable background tasks.
- [ ] Choose a durable queue and worker runtime only when needed.
- [ ] Add bounded retries, idempotency, timeouts, and failed-job handling.
- [ ] Test spikes, database pressure, dependency failure, and recovery.

**Exit:** agreed performance goals are met under a documented test load.

## Stage 8 — Production readiness
- [ ] Configure Vercel preview and production settings.
- [ ] Separate Neon non-production and production credentials/data.
- [ ] Review secrets and migrations.
- [ ] Configure monitoring and actionable alerts.
- [ ] Test backup restoration and release recovery.
- [ ] Run security, accessibility, and end-to-end checks.
- [ ] Run post-deployment smoke tests.

**Exit:** critical checks pass and deployment/recovery procedures are documented.

## Stage 9 — Expand the platform
For each app, define its purpose, owner, data classification, permissions, dependencies, tests, and acceptance criteria. Implement in a focused branch, review accessibility/security/performance/cost, update catalog metadata, and release only after verification.

## How to track completion
Maintain GitHub Issues for tasks, milestones or project views for stages, PRs that link implementation to issues, CI/test evidence, and ADRs for significant decisions. Do not mark a stage complete merely because files exist.
