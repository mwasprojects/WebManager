# WebManager

**One platform. Many useful apps. A shared foundation built to grow.**

WebManager is an extensible web platform for discovering and using a broad collection of applications: everyday utilities, productivity tools, developer tools, creative tools, business software, learning resources, and future categories we have not defined yet.

Business management is one part of the vision—not the boundary of the product. The goal is to make useful apps feel like parts of one coherent platform while allowing each app to have a clear purpose, scope, and implementation.

The platform is planned around a shared Core, an app catalog, reusable UI and service contracts, and independently organized app modules. Development will proceed in small, tested stages, with GitHub as the source of truth, Vercel as the planned web host, and Neon PostgreSQL as the planned hosted database.

> **Status: Early development baseline.** The repository contains an initial Next.js portal, Fastify API, PostgreSQL migration, and passwordless email-code/session/role-check implementation. The broader app platform is still planned, and the existing authentication slice has not been independently security-audited or verified for production. Documentation describes intent and work in progress; it is not proof that a feature works.

---

## Contents

- [Quick start](#quick-start)
- [Manual development workflow](docs/development/MANUAL-CODING.md)
- [Directory and file map](docs/DIRECTORY-MAP.md)
- [Learning progress tracker](docs/development/PROGRESS.md)
- [Security at a glance](#security-at-a-glance)

- [Vision](#vision)
- [What WebManager can host](#what-webmanager-can-host)
- [Product principles](#product-principles)
- [Architecture](#architecture)
- [Server scalability and request management](#server-scalability-and-request-management)
- [Session and time management](#session-and-time-management)
- [Shared Core](#shared-core)
- [App catalog and lifecycle](#app-catalog-and-lifecycle)
- [Recommended technology](#recommended-technology)
- [Security and privacy](#security-and-privacy)
- [Development and deployment](#development-and-deployment)
- [Roadmap](#roadmap)
- [Definition of done](#definition-of-done)
- [Repository conventions](#repository-conventions)
- [Current priorities](#current-priorities)
- [Reference documentation](#reference-documentation)

## Quick start

WebManager now has an initial full-stack development slice: Next.js frontend, Fastify API, PostgreSQL schema, email verification codes, server-side sessions, and role-gated portal endpoints. This is a development baseline and has **not yet been independently built or security-audited**.

### Prerequisites

Install Git and Docker Desktop (Windows/macOS) or Docker Engine with the Compose plugin (Linux). pnpm is needed if you want to run commands directly on the host.

### 1. Configure local secrets

Copy `.env.example` to `.env`, then generate a local secret:

```bash
cp .env.example .env
openssl rand -base64 48
```

Paste the generated value into `AUTH_SECRET` in `.env`. Keep `.env` untracked. The example database password is for local development only.

### 2. Start the stack

Start the user portal, API, database, and local email inbox:

```bash
docker compose up --build
```

Open:
- User portal: `http://localhost:3000`
- API health: `http://localhost:4000/health`
- Captured development emails: `http://localhost:8025`

To also start the developer and admin portal instances:

```bash
docker compose --profile multi-portal up --build
```

Then open `http://localhost:3001` for developer and `http://localhost:3002` for admin. The portals share one API/database. The API only grants access when the account has the requested role; local roles must be provisioned deliberately. See [deployment and local role setup](docs/deployment/README.md).

### 3. Try email-code sign-in

1. On the user portal, create an account with an email address you control.
2. Open Mailpit at `http://localhost:8025` and copy the six-digit code from the captured message.
3. Return to the portal and enter the code.
4. Test sign-out, reload, and the API health endpoint.

Mailpit captures messages locally; it does not deliver them to a real inbox. For developer/admin portal testing, follow the local role-provisioning instructions in the deployment guide.

### Useful commands

```bash
pnpm install
pnpm dev                 # frontend only; requires the API separately
pnpm api:dev             # API only; requires DATABASE_URL and AUTH_SECRET
pnpm db:migrate           # apply the initial database schema
pnpm typecheck
pnpm build
pnpm test
docker compose logs --follow api
docker compose down
```

The current first slice does not yet implement the full account-bound portal-link workflow, production role-management UI, account recovery/unlock workflow, or complete automated end-to-end/security tests. Do not use it for real users or production authentication before those requirements are completed and verified. See [the documentation index](docs/README.md) and [the deployment guide](docs/deployment/README.md).

## Vision

WebManager should make it straightforward to find and use useful web apps without every app reinventing login, navigation, preferences, permissions, logging, and other shared capabilities.

The platform aims to be:

- **Broad in purpose:** not limited to one industry or type of user.
- **Modular by design:** apps have clear boundaries and can evolve without unnecessarily affecting one another.
- **Consistent to use:** shared navigation, design patterns, accessibility, and predictable interactions.
- **Simple to extend:** adding an app should follow a documented pattern rather than require changes throughout the platform.
- **Secure by default:** authorization is enforced on the server and data access is limited to what a user or app needs.
- **Practical to maintain:** shared capabilities live in shared packages; app-specific behavior stays with the app that owns it.
- **Testable and observable:** changes are checked automatically, and production issues can be investigated without exposing secrets.
- **Cost-conscious:** use the simplest architecture that meets the actual need, and avoid unnecessary services and infrastructure.
- **Honest about readiness:** an app is not described as available until it works, is reviewed, and meets its acceptance criteria.

## What WebManager can host

The catalog is intended to grow over time. The examples below are possible directions, not a promise that every listed app will be built.

### Everyday utilities

Calculators and unit converters; date and time utilities; text formatting and transformation; JSON, CSV, and other data conversion; generators for appropriate non-sensitive content; and lightweight document and data helpers.

Where a tool can safely run entirely in the browser, prefer that over unnecessary server processing or database storage.

### Productivity and organization

Notes and personal knowledge; to-do lists, tasks, and checklists; reminders and planning tools; calendar and scheduling utilities; personal dashboards; and file and information organization.

### Developer and technical tools

JSON and data inspection; API request and response helpers; code and text formatting; encoding and decoding utilities; snippet and technical-reference libraries; and project and database helpers.

Tools must not expose private code, credentials, or other sensitive input to external services without a clear purpose and appropriate user consent.

### Writing and creative tools

Markdown and document editors; writing and editing helpers; templates and content organization; image and media workflow helpers; and structured content creation tools.

### Business applications

Business profile and settings; inventory and stock management; sales, invoices, and billing; customers and customer relationship management; finance and expenses; projects and tasks; documents and file workflows; reports and dashboards; staff and team management; and communication and notifications.

Business apps may need organizations, roles, shared records, audit trails, and tenant isolation. Those requirements should be designed explicitly rather than assumed to apply to every utility.

### Data, learning, and collaboration

Potential areas include data viewers and reporting, study and revision tools, reference libraries, shared workspaces, team activity, and approved external-service integrations.

### Future categories

New categories can be added when there is a clear user need and a sustainable plan for implementation, security, privacy, maintenance, and cost. The category system should not require a redesign whenever a new kind of app is introduced.

## Product principles

1. **Solve real problems first.** Prioritize apps by usefulness, clarity, and achievable quality—not by app count.
2. **Keep simple tools simple.** A calculator should not need an account or database unless a real feature requires one.
3. **Make the platform coherent, not restrictive.** Apps should share navigation and standards without being forced into identical workflows.
4. **Keep responsibilities clear.** The Core provides platform capabilities; each app owns its domain behavior.
5. **Minimize coupling.** Apps should not reach into one another's private implementation details.
6. **Prefer proven components.** Use maintained libraries for security-sensitive functionality rather than inventing custom replacements without a compelling reason.
7. **Design for accessibility and responsive use.** Core flows should work across common screen sizes and support accessible interaction.
8. **Protect data by default.** Collect, store, and share only what is necessary.
9. **Automate repeatable checks.** Builds, tests, migrations, and deployments should be documented and reproducible.
10. **Ship incrementally.** Build a small working foundation, prove the pattern, and expand based on experience.

## Architecture

### Start with a modular monolith

The recommended starting architecture is a **modular monolith**: one primary web application with well-defined internal app modules and shared platform packages.

This avoids the extra deployment, networking, monitoring, and operational burden of microservices before the project needs them. The internal boundaries should still be clear enough that a component can be separated later if a demonstrated need justifies the cost.

Multiple apps in the catalog do **not** mean that every app needs its own deployment, database, or server.

### Planned logical areas

- **Web application shell:** global layout, navigation, app discovery, user workspace, and shared entry points.
- **Core platform:** shared contracts, configuration, identity integration, permissions, and app lifecycle services.
- **App modules:** focused applications organized by responsibility and category.
- **Shared UI:** reusable accessible components and design tokens.
- **Database layer:** schema, migrations, and controlled data access for features that need persistence.
- **Integrations:** approved connections to external services with explicit permissions and safe secret handling.
- **Tests:** unit, integration, security, and end-to-end checks as appropriate.
- **Infrastructure:** CI workflows, deployment configuration, monitoring, and operational procedures.
- **Documentation:** architecture decisions, setup instructions, app-building guidance, and release procedures.

### Proposed starting directory layout

This is a starting proposal to review in the repository-foundation phase. Do not create empty packages solely to match the diagram; add code when it has a clear purpose.

    WebManager/
    ├── apps/
    │   └── web/                    # Main deployable web application
    ├── packages/
    │   ├── core/                   # Shared platform contracts and services
    │   ├── db/                     # Database access and migrations
    │   └── ui/                     # Shared UI components
    ├── docs/
    │   ├── architecture/
    │   ├── development/
    │   └── security/
    ├── tests/
    ├── .github/
    │   └── workflows/
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── pnpm-workspace.yaml
    ├── turbo.json                  # Add when task orchestration is configured
    └── README.md

The first apps may live inside the web application while the app contracts and development pattern are being proven. Extract an app or capability into its own package when it has a stable boundary or genuine reuse value. Final package boundaries will be decided before implementation.

## Server scalability and request management

### Design principles

WebManager should scale by controlling resource usage and removing bottlenecks—not by adding infrastructure without evidence. The initial target is a modular monolith with stateless application code, explicit module boundaries, managed infrastructure, and the option to separate workers or services when measurements justify it.

The platform should follow these principles:

- **Stateless application instances:** request handling must not depend on process-local state for sessions, shared rate limits, or durable jobs.
- **Bounded work:** cap request sizes, concurrency, database connections, query duration, and background queue depth.
- **Database-aware scaling:** application capacity must respect PostgreSQL connection and query capacity.
- **Short request paths:** keep interactive requests focused on work required to return a result.
- **Asynchronous work:** move slow, nonessential work such as report generation and bulk processing to durable background jobs when needed.
- **Graceful overload:** reject excess work predictably instead of allowing unbounded queues, memory growth, or cascading failures.
- **Measure before scaling:** use latency, error rate, database saturation, queue depth, and resource metrics to identify bottlenecks.
- **Keep operations proportional to need:** do not introduce Redis, a message broker, microservices, or Kubernetes before there is a demonstrated requirement.

### Request lifecycle

Protected endpoints should apply the relevant controls in a consistent order:

1. Establish a request ID and tracing context.
2. Enforce HTTP method, request-size, and content-type limits.
3. Apply abuse protection and distributed rate limits where appropriate.
4. Authenticate the caller when required.
5. Validate untrusted input.
6. Authorize the action and enforce workspace/tenant data boundaries.
7. Apply concurrency and timeout budgets to expensive work.
8. Execute business logic and controlled data access.
9. Return a consistent response and record safe metrics.

The exact ordering may vary by endpoint. Public authentication endpoints, for example, should apply rate limits before expensive authentication work. Authorization must be checked on the server for every protected operation; hiding a UI link is not authorization.

API responses should use a documented, consistent success/error format and include a request ID where useful. Rate-limited requests should return HTTP 429 and an appropriate `Retry-After` header when practical. Capacity exhaustion may require HTTP 503. Responses must not expose stack traces, database internals, secrets, or unnecessary personal data.

### Database and connection management

- Choose and document a connection strategy compatible with the deployment runtime and Neon PostgreSQL.
- Avoid creating an uncontrolled connection pool per request or per short-lived invocation.
- Set connection, query, and transaction timeouts appropriate to each operation.
- Keep transactions short and avoid holding database locks while calling external services.
- Paginate large results, enforce maximum page sizes, select only required columns, and avoid N+1 queries.
- Add indexes based on measured access patterns and reviewed query plans.
- Monitor connection usage, pool wait time, slow queries, lock waits, and database saturation.
- Reserve a deliberate connection budget for application instances, background workers, and migrations.

Scaling the web application does not automatically scale the database, email provider, cache, or job workers. Each dependency has independent capacity limits.

### Caching and rate limiting

Begin with query optimization and safe HTTP/CDN caching for public, infrequently changing content. Add a shared cache only when measurement shows a benefit and invalidation rules are understood.

Do not cache authentication challenges, session-revocation state, account-lock status, or authorization decisions without an explicit freshness and invalidation design. Stale security data must not grant access that has been revoked.

Rate limits control request frequency; concurrency limits control the number of operations running at once. Both may be necessary. Limits that must apply across application instances need a shared/distributed mechanism rather than process-local memory alone. Authentication controls must not let an attacker trivially lock another account by sending requests on its behalf.

### Background jobs and backpressure

Slow or nonessential work—such as bulk imports, exports, report generation, notifications, and file processing—may be moved to a durable queue and independent workers. Authentication and authorization decisions should remain in the synchronous request path when needed to safely accept the action.

A production job system should define bounded concurrency, retries with exponential backoff and jitter, maximum attempts, idempotency, job timeouts, failure/dead-letter handling, graceful shutdown, and queue monitoring. For business changes that must reliably trigger a job, evaluate the transactional outbox pattern. Do not assume a serverless request handler is a persistent worker; select a runtime suitable for the job's execution requirements.

Use backpressure when capacity is exhausted: reject or defer excess work, cap queue growth, and slow workers when dependencies are saturated. Retries must be bounded and should not amplify an outage.

### Observability and health

Track request volume, p50/p95/p99 latency, error and timeout rates, rate-limit events, expensive-operation concurrency, database connection/query metrics, and background-job queue depth, age, retries, and failures. Use request IDs and structured logs to correlate work across modules. Logs must never include raw authentication codes, session tokens, or email-link secrets.

Distinguish application liveness, readiness to receive traffic, and dependency health. A temporary dependency failure should not trigger uncontrolled restart loops or add unnecessary load.

### Initial deployment strategy

For the planned Vercel and Neon deployment:

- Use the managed application platform for compatible Next.js routes and server-side functions.
- Configure Neon connection handling and limits for the actual runtime.
- Use shared rate limiting when limits must apply across instances.
- Add a durable queue and independent worker runtime when asynchronous tasks require them.
- Use object storage for large uploads or generated artifacts if those features are introduced.
- Add managed caching only when metrics justify the operational cost.

Before production, test normal load, gradual load increases, traffic spikes, sustained load, database saturation, queue backlog, dependency failure, and recovery. Agree on performance targets and test them; do not claim capacity without evidence.

## Shared Core

The Core exists to prevent duplication of genuinely shared platform behavior. Its planned responsibilities include:

- Configuration loading and validation
- Consistent errors and structured logging
- Authentication and session integration
- Server-side authorization and permission checks
- User profiles and preferences
- Workspace and membership support where required
- App registration, metadata, and lifecycle contracts
- Shared database access conventions
- Input validation and domain-neutral utilities
- Audit events for important security and administrative actions
- Notification and event interfaces where needed
- Approved storage and integration interfaces
- Health checks and operational monitoring

The Core must not become a dumping ground for every feature. An inventory rule belongs in the inventory app; a generic permission-checking contract may belong in the Core.

Apps should communicate through documented interfaces or events when cross-app collaboration is necessary. Avoid circular dependencies and undocumented access to internal data structures.

## App catalog and lifecycle

The app catalog will help users discover and open apps. As the platform matures, it may support categories, search, favorites, recently used apps, user preferences, and app documentation.

Each app should declare metadata equivalent to:

- Unique ID and display name
- Description, category, and icon
- Route or entry point
- Version and compatibility expectations
- Required Core capabilities
- Required permissions and data scope
- Dependencies, if any
- Configuration requirements
- Availability and maintenance status
- Documentation and ownership

Suggested statuses:

- **Planned:** identified but not implemented
- **In development:** being built or tested
- **Available:** implemented, reviewed, and enabled
- **Disabled:** temporarily unavailable
- **Deprecated:** scheduled for retirement

The catalog must distinguish an app being listed from a user being allowed to access it. Hiding a link in the UI is not access control; protected pages and operations must verify permissions on the server.

### Data ownership

An app should declare whether it handles temporary browser-local data, personal user data, shared workspace data, organization/business data, or external-service data. It should request only the access it needs.

### Extensions and marketplace

The initial focus is on first-party apps maintained and reviewed in this repository. A third-party plugin system or public marketplace is a possible future direction, not an initial requirement.

Do not execute arbitrary uploaded code simply because it provides an app manifest. A future extension system would require a threat model, review process, permission approval, isolation, versioning, monitoring, and rollback controls.

## Recommended technology

The following is the recommended starting direction, subject to a small proof of concept and final confirmation before implementation.

| Area | Proposed choice | Reason |
|---|---|---|
| Web framework | Next.js App Router | Integrated routing, layouts, and server-side capabilities |
| Language | TypeScript | Type safety and maintainable interfaces |
| Package manager | pnpm workspaces | Consistent dependency management across packages |
| Task orchestration | Turborepo, when useful | Coordinated builds and checks in a workspace |
| Hosting | Vercel | Planned hosting and preview deployments |
| Database | Neon PostgreSQL | Hosted PostgreSQL with branching options |
| Database access | Evaluate Drizzle ORM and the Neon driver | Typed queries and migration workflow |
| Authentication | Select a maintained library after a proof of concept | Avoid hand-rolling security-sensitive session flows |
| Source control and planning | GitHub | Code review, issues, and automation |
| Local development | WSL Ubuntu is an option; Docker is optional | Flexible development without requiring production access |

Technology choices should be confirmed against current documentation, compatibility, maintenance, security, and cost before installing dependencies. Avoid adding libraries just because they are popular.

### Authentication proof of concept

Before locking in authentication, evaluate a maintained solution against the requirements for session security, sign-in and sign-out, account recovery, email verification, multi-factor authentication, database integration, and future workspace membership. Authentication establishes identity; WebManager must still implement and test its own authorization rules and data scopes.

### Hosting constraints

Vercel is the planned host for the web application and compatible server-side functions. Do not assume ordinary request-handling functions are persistent workers. Scheduled and background work must use an execution model or service suitable for the actual requirement.

## Security at a glance

WebManager is designed for passwordless email-code authentication for human accounts, account-bound portal links, centralized server-side authorization, and auditable security events. The initial policy proposes five-minute email codes and ten-minute portal links. Expired links are rejected and logged when detectable, without locking accounts. A qualifying attempt by a different authenticated account to use a still-valid account-bound link is rejected and applies the defined 24-hour lock to the account making the attempt—not the account that owns the link.

This is a design, not an implemented security guarantee. The sign-in page is currently a frontend prototype. Never deploy it as a working login system until server-side authentication, session handling, authorization, and security tests are complete.

**Detailed policy and implementation checklist:** [Security Guide](docs/security/README.md).

## Session and time management

Session and timestamp handling are shared security infrastructure, not independent logic that each route should reimplement.

### Time conventions

- Use UTC for application-level timestamps and store database instants in PostgreSQL `TIMESTAMPTZ`.
- Use a shared, injectable clock and duration utilities for expiry calculations and deterministic tests.
- Convert timestamps to a user's preferred timezone only for display.
- Treat browser-provided timestamps as untrusted.
- Synchronize production host clocks and compare expiry using server-side time.
- Store explicit expiry timestamps for sessions, verification challenges, account locks, and account-bound links.
- Use consistent expiry-boundary behavior: an item is expired when current server time is greater than or equal to its expiry timestamp.

### Session lifecycle

Sessions should use cryptographically random opaque identifiers, store only an appropriate token hash server-side, and be delivered in Secure, HttpOnly cookies with a deliberate SameSite policy. Production requires HTTPS. Rotate session identifiers after authentication and relevant privilege changes; revoke server-side sessions on logout, account disablement, and security events as defined by policy.

The session system should support validation, idle and absolute expiry, revocation, last-activity tracking, and multiple sessions/devices. Authorization must still be checked server-side for protected operations; possession of a valid session alone does not imply access to every portal or resource.

Proposed initial policy for review—not implemented guarantees:

- Idle timeout: 30 minutes.
- Absolute session lifetime: 7 days.
- Email verification code lifetime: 5 minutes, with at most 5 attempts per challenge.
- Account-bound portal link lifetime: 10 minutes and single-use.
- A qualifying attempt by a different authenticated account to use a still-valid account-bound link is rejected and locks the account making the attempt for 24 hours, not the link owner's account.
- Expired links are rejected and logged when detectable, but do not trigger account lockout.
- Resending a verification code invalidates the previous code.
- Admin sessions should receive stronger controls and shorter limits where appropriate.

The idle and absolute session limits must be reviewed before implementation, particularly for privileged accounts. Session revocation and account-lock rules must be enforced by shared server-side logic and tested at expiry boundaries, under concurrent requests, and after replay attempts.

## Security and privacy

Security applies to the platform shell, Core, individual apps, integrations, and data stores.

- **Least privilege:** grant only the permissions required for a task.
- **Deny by default:** explicitly allow protected operations rather than assuming access.
- **Server-side authorization:** check identity and permission for every protected operation; UI visibility is not a security boundary.
- **App permissions:** limit each app's capabilities and data access to what it needs.
- **Personal data isolation:** private user data must not be visible to others without an explicit sharing rule.
- **Workspace and tenant isolation:** organization or business records must be scoped and checked at server and data-access boundaries.
- **Administrative protection:** limit and audit platform-wide privileges.
- **Auditability:** record important security and administrative changes without logging passwords, tokens, or other secrets.
- **Validation:** validate untrusted input on the server and use database constraints as an additional safeguard.
- **Safe integrations:** store external credentials in secret management and disclose the data an integration accesses.
- **Dependency hygiene:** review dependencies and address known vulnerabilities.
- **Data minimization:** avoid storing data when a browser-only workflow is sufficient.
- **Recovery:** document and test backup restoration before relying on production data.

Potential roles may include Platform Administrator, Security Administrator, App Maintainer, Workspace Owner, Workspace Administrator, and Workspace Member. The actual role and permission model must be designed around explicit capabilities and scopes; a role name alone must never grant unrestricted access.

## Development and deployment

### Workflow

1. **Plan:** create a GitHub Issue with scope, acceptance criteria, and relevant design notes.
2. **Implement:** work in a focused branch with a small change set.
3. **Verify:** run the relevant formatting, lint, type, test, and build checks.
4. **Review:** open a pull request and resolve review feedback.
5. **Preview:** verify the deployed change when relevant.
6. **Release:** merge through the agreed workflow and deploy approved changes.
7. **Learn:** document issues found and update the roadmap or tests.

### Environment separation

Keep development, automated tests, preview, and production explicitly configured and separated.

- Development uses local or dedicated non-production services.
- Tests use isolated resources and safe test data.
- Preview uses non-production credentials and data.
- Production uses production-only credentials and reviewed release procedures.

Never silently fall back from a failed development or preview database connection to production.

### GitHub

GitHub is the source of truth for code, issues, pull requests, documentation, and CI workflows. Required checks should run automatically once the application is runnable. Use branch protection and required reviews when the repository workflow is ready for them.

### Vercel

Use preview deployments to review changes before production. Configure the project root, build settings, and environment variables deliberately. Keep secrets out of source code and client-side bundles.

### Neon PostgreSQL

Use repeatable migrations for schema changes. Separate database configuration and credentials across environments. Neon branches may help create isolated preview and test environments, but production-derived data must be protected; prefer synthetic or appropriately sanitized data for non-production work.

### Secrets and environment variables

- Commit .env.example with variable names and safe placeholder values only.
- Exclude real environment files, such as .env.local, from Git.
- Store deployed secrets in the hosting platform or an approved secret-management system.
- Never commit database URLs, passwords, API tokens, session secrets, or private keys.
- Do not expose server-side secrets to client-side code.
- Review destructive migrations before production execution.
- Keep logs free of credentials and unnecessary personal information.

## Roadmap

Track work as GitHub Issues with explicit scope and acceptance criteria. The checklist below is a project-level roadmap, not a claim that the work is complete.

### Phase 1 — Repository foundation

- [ ] Confirm initial release scope and technology choices.
- [ ] Agree on directory structure and app/Core boundaries.
- [ ] Add .gitignore and .env.example.
- [ ] Establish package-manager and workspace conventions.
- [ ] Document development and contribution practices.
- [ ] Record important architecture decisions.
- [ ] Define branch, pull-request, and review conventions.
- [ ] Plan the initial automated checks.

**Exit criteria:** architecture and development choices are documented, secrets are protected, and the repository workflow is agreed.

### Phase 2 — Minimal web shell and app catalog

- [ ] Create the smallest working web application.
- [ ] Establish a responsive layout and shared navigation.
- [ ] Define the initial app category and metadata model.
- [ ] Show clear planned/in-development/available statuses.
- [ ] Add loading, empty, and error states.
- [ ] Build one small, useful utility app end to end.
- [ ] Configure and verify a Vercel preview deployment.

**Exit criteria:** the application builds and deploys, the catalog is navigable, and unimplemented apps are not presented as working features.

### Phase 3 — Database and configuration foundation

- [ ] Confirm database access and migration tooling.
- [ ] Configure a dedicated development/preview Neon database.
- [ ] Establish repeatable migrations and safe test data.
- [ ] Validate environment-specific configuration.
- [ ] Add database connectivity and migration tests.
- [ ] Document connection, migration, and recovery procedures.

**Exit criteria:** schema changes are repeatable and testable without production credentials.

### Phase 4 — Core and identity

- [ ] Implement configuration validation.
- [ ] Implement structured logging and error handling.
- [ ] Define stable Core and app contracts.
- [ ] Integrate authentication and session handling.
- [ ] Implement server-side authorization.
- [ ] Define user preferences and workspace boundaries where required.
- [ ] Define app registration and capability metadata.
- [ ] Add audit events and health checks.
- [ ] Test security boundaries and failure cases.

**Exit criteria:** Core services have documented contracts and meaningful automated tests; security behavior is verified rather than inferred from the interface.

### Phase 5 — Repeatable app development

- [ ] Document how to create and register an app.
- [ ] Complete the first utility app and its tests.
- [ ] Verify app permissions and status handling.
- [ ] Add app-specific settings only where needed.
- [ ] Persist data only when the app's purpose requires it.
- [ ] Demonstrate that another app can be added without rewriting the platform.

**Exit criteria:** there is a proven, documented pattern for adding first-party apps.

### Phase 6 — Expand app categories

- [ ] Everyday utilities
- [ ] Productivity and organization
- [ ] Developer and technical tools
- [ ] Writing and creative tools
- [ ] Data and information tools
- [ ] Business applications
- [ ] Learning and reference
- [ ] Communication and collaboration
- [ ] Additional categories approved through planning

Build one app or small coherent group at a time. Each app needs a purpose, scope, permissions, tests, documentation, and acceptance criteria.

**Exit criteria:** every released app meets its own requirements and respects platform boundaries.

### Phase 7 — Security, quality, and integrations

- [ ] Test authentication and authorization boundaries.
- [ ] Test personal, workspace, and tenant data isolation.
- [ ] Establish safe external-service integration patterns.
- [ ] Add dependency and secret scanning where available.
- [ ] Verify migration safety and recovery procedures.
- [ ] Review rate limiting and abuse protection for exposed endpoints.
- [ ] Test critical user journeys and accessibility.
- [ ] Verify environment separation.
- [ ] Document unresolved risks.

**Exit criteria:** required security and quality checks pass and known risks are reviewed before release.

### Phase 8 — Production readiness

- [ ] Review Vercel production configuration.
- [ ] Review Neon production access and connection settings.
- [ ] Verify production secrets and permissions.
- [ ] Test database backup restoration.
- [ ] Document release, migration, and rollback procedures.
- [ ] Configure suitable monitoring and alerting.
- [ ] Verify domain and HTTPS configuration when available.
- [ ] Approve the first production release.
- [ ] Perform post-release checks.

**Exit criteria:** the release is reviewed, critical checks pass, and recovery procedures are documented and tested.

## Definition of done

A task is complete only when all applicable conditions are met:

- [ ] It meets the issue's scope and acceptance criteria.
- [ ] It respects the established architecture and module boundaries.
- [ ] Relevant tests are added or updated and pass.
- [ ] Formatting, linting, type checks, and builds pass where configured.
- [ ] Security, permissions, privacy, and data-isolation implications are reviewed.
- [ ] No credentials or sensitive data are committed.
- [ ] Database changes have reviewed, repeatable migrations where needed.
- [ ] Documentation and app metadata are updated when relevant.
- [ ] The change is reviewed through the agreed workflow.
- [ ] Preview behavior is checked when relevant.
- [ ] The feature is not described as available until it is implemented and verified.

## Repository conventions

- Use descriptive branches such as feature/app-catalog, feature/unit-converter, feature/notes-app, and fix/session-validation.
- Keep changes and pull requests focused and reviewable.
- Link issues to related pull requests and commits.
- Keep app-specific logic with the app that owns it.
- Put genuinely shared capabilities in the Core or shared packages.
- Avoid circular dependencies and undocumented cross-app access.
- Do not commit dependency folders, build output, local database files, logs, or real environment files.
- Keep credentials out of source code, issues, and logs.
- Update documentation when architecture, setup, or behavior changes.
- Do not add infrastructure or dependencies without a clear need.
- Update the roadmap when priorities or decisions change.

## Server and request-management priorities

The following work should be implemented incrementally after inspecting the current repository and confirming the existing foundation:

1. Define API response/error contracts, request IDs, and structured logging.
2. Add request validation, payload limits, and explicit timeout conventions.
3. Design the database client and connection budget for the chosen deployment runtime.
4. Implement reusable pagination and transaction conventions.
5. Define distributed rate-limiting and concurrency-control interfaces.
6. Implement session and time utilities with injectable clocks.
7. Add safe health checks and baseline application/database metrics.
8. Introduce a durable job queue and independent workers only when the first suitable background tasks require them.
9. Run controlled load and failure-recovery tests before claiming production capacity.

**Acceptance criteria:** request and resource limits are documented, failure responses are predictable, security-sensitive state remains authoritative, and performance claims are backed by repeatable measurements. These capabilities are planned; this README does not claim they are already implemented.

## Current priorities

**Current milestone:** platform planning and repository foundation.

The next steps are to:

1. Confirm the initial release scope and technology stack.
2. Finalize the directory structure and app/Core boundaries.
3. Add repository safety files and development documentation.
4. Create GitHub Issues for the foundation and minimal web shell.
5. Build a working app catalog and one useful utility.
6. Verify automated checks and preview deployment.
7. Introduce database-backed features and identity when the first apps require them.

This README is the high-level project guide. GitHub Issues should contain the detailed implementation tasks, decisions, and acceptance criteria.

## Reference documentation

These official documentation pages are useful when confirming implementation details:

- [Next.js App Router](https://nextjs.org/docs/app)
- [Vercel monorepos](https://vercel.com/docs/monorepos)
- [Turborepo documentation](https://turborepo.dev/docs)
- [Neon documentation](https://neon.com/docs)
- [Drizzle ORM with Neon](https://orm.drizzle.team/docs/connect-neon)
- [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
