# WebManager

**A modular business management platform built around one shared Core and independent business modules.**

WebManager is being designed as a secure, maintainable platform that can support multiple business workflows without duplicating common infrastructure. The project will be developed in small, verifiable stages, with GitHub as the source of truth, Vercel as the planned web deployment platform, and Neon PostgreSQL as the planned hosted database.

> **Project status:** Initial planning and repository foundation. The application, Core, business modules, and deployment pipeline are not yet implemented. Roadmap items are plans, not claims of completed functionality.

---

## Contents

- [Vision and goals](#vision-and-goals)
- [Architecture principles](#architecture-principles)
- [Planned business modules](#planned-business-modules)
- [Environments and deployment](#environments-and-deployment)
- [Security principles](#security-principles)
- [Development roadmap](#development-roadmap)
- [Definition of done](#definition-of-done)
- [Repository conventions](#repository-conventions)
- [Project status](#project-status)

## Vision and goals

Build a modular business platform that:

- Shares common services through a single Core instead of repeating them in every module.
- Keeps business modules independently understandable and testable.
- Enforces authentication, authorization, and tenant/business data isolation on the server.
- Supports a reliable development-to-preview-to-production release process.
- Uses automated checks to detect errors before changes reach production.
- Keeps secrets and production data out of source control.
- Can be developed locally, including in WSL Ubuntu, while keeping deployment management centred on GitHub.

## Architecture principles

1. **Core before features:** establish configuration, errors, data access, validation, security, and module contracts before implementing business features.
2. **Modular boundaries:** modules own their business rules and communicate through documented interfaces. Avoid circular dependencies.
3. **Single source of truth:** do not duplicate shared logic when a well-defined Core service can provide it.
4. **Secure by default:** deny access unless permission is established; validate input at trust boundaries.
5. **Testable increments:** every stage must have clear acceptance criteria and appropriate automated checks.
6. **Environment separation:** development, tests, preview, and production must use explicitly configured resources.
7. **No silent fallback:** a failed local or preview database connection must never silently switch to production.
8. **Deployment compatibility:** design server-side work for the chosen hosting runtime. Vercel functions are not persistent, always-running workers; background jobs must use a compatible service or execution model.
9. **Document decisions:** record meaningful architecture and deployment decisions as the project evolves.

## Planned architecture

The final directory layout will be agreed before application files are generated. The intended logical areas are:

- **Website/application:** user-facing pages, layouts, reusable UI, and application entry points.
- **Core:** shared platform services and module contracts.
- **Business modules:** isolated business capabilities built on the Core.
- **Database:** schema definitions, migrations, and safe development/test data tooling.
- **Tests:** unit, integration, and end-to-end tests where appropriate.
- **Infrastructure:** CI workflows, deployment configuration, and operational documentation.
- **Documentation:** architecture decisions, setup instructions, security notes, and release procedures.

The physical folder structure may change when the framework and runtime are selected, but these boundaries should remain clear.

## Planned business modules

| # | Module | Planned responsibility |
|---|---|---|
| 1 | Business Manager | Business profile, settings, and business-level configuration |
| 2 | Inventory | Products, stock levels, stock movements, and inventory controls |
| 3 | Sales & Billing | Sales records, invoices, billing workflows, and payment status |
| 4 | Customers & CRM | Customer records, relationships, and customer activity |
| 5 | Finance | Financial records, expenses, and finance-related workflows |
| 6 | Projects | Projects, tasks, milestones, and progress |
| 7 | Documents | Document metadata, access rules, and file-management workflows |
| 8 | Reports | Reports and summaries derived from authorized data |
| 9 | Staff | Staff records, team organization, and staff-related permissions |
| 10 | Communication & Notifications | In-app notifications and communication workflows |

These are planned capabilities, not implemented features. Each module will receive a written scope, data model, permission rules, tests, and acceptance criteria before implementation.

## Shared Core responsibilities

The Core is expected to provide or coordinate:

- Configuration loading and validation
- Structured logging and consistent error handling
- Database access and transaction conventions
- Database migrations and schema versioning
- Input validation and shared domain utilities
- Authentication and session handling
- Authorization and role-based access control (RBAC)
- Module registration, dependency checks, and lifecycle management
- Shared events and notification interfaces
- Storage interfaces where needed
- Health checks and operational monitoring
- Audit events for security-sensitive and business-critical actions

Core services will be added in stages. Do not create placeholder implementations that appear secure or production-ready but do not enforce their stated guarantees.

## Environments and deployment

### Planned environment flow

1. **Development:** work on a feature branch and use local or dedicated development resources.
2. **Automated checks:** run formatting, linting, type checks, tests, and a production build as appropriate.
3. **Preview:** deploy changes for review and use a separate Neon preview database/branch.
4. **Production:** deploy only approved changes and use the production database with production-only credentials.

### GitHub

GitHub will hold source code, documentation, issues, pull requests, and CI workflows. Use issues to track work and pull requests to review changes before merging.

### Vercel

Vercel is the planned hosting and deployment platform for the website and compatible server-side functions. The repository must have an explicit framework, root directory, build command, and output/runtime configuration before the first meaningful deployment.

### Neon PostgreSQL

Neon is the planned hosted PostgreSQL provider. Development/preview and production data must remain separated. Use migrations to make schema changes repeatable and reviewable. Confirm connection pooling and connection limits for the selected runtime before production use.

### Local development

Local development may use WSL Ubuntu and a local PostgreSQL instance. Docker/Compose is optional and should be added only if it makes the workflow more reproducible. Local setup must not require production credentials.

### Environment variable policy

- Commit a documented `.env.example` containing variable names and safe placeholders only.
- Keep actual local environment files (for example, `.env.local`) out of Git.
- Configure Vercel environment variables through its project settings or an approved secret-management workflow.
- Never put database URLs, passwords, API tokens, session secrets, or private keys in source code, issues, logs, or screenshots.
- Use separate credentials and databases for preview and production.
- Do not run destructive migrations against production without an explicit reviewed release procedure.

## Security principles

The application is expected to follow these principles from the beginning:

- **Least privilege:** each user and service receives only the permissions it needs.
- **Server-side authorization:** hiding a button in the UI is not access control.
- **Tenant isolation:** every tenant-scoped read and write must be checked on the server and enforced at the data-access boundary.
- **Protected system roles:** platform-level roles must not be editable by ordinary business administrators.
- **Auditing:** record important permission changes, authentication/security events, and sensitive business actions without logging secrets.
- **Safe sessions:** use an established authentication approach and secure cookie/session settings appropriate to the deployment.
- **Validation:** validate inputs on the server, and use database constraints as an additional safeguard.
- **Dependency hygiene:** review dependencies and address known vulnerabilities.
- **Recovery:** document and test backup restoration before relying on production data.

Potential roles include Super Admin, Security Admin, Developer, Platform Admin, Business Owner, Manager, Accountant, Staff, Customer, and Auditor. The actual role model and permission matrix must be reviewed before implementation; role names alone do not grant access.

## Development roadmap

Track each item as a GitHub Issue. Close an issue only after its acceptance criteria are met and relevant checks pass.

### Phase 1 — Repository foundation

- [ ] Create and maintain this project README and roadmap.
- [ ] Agree on the framework, runtime, package manager, and supported Node.js version.
- [ ] Define the repository directory structure and module boundaries.
- [ ] Add a suitable `.gitignore` and safe `.env.example`.
- [ ] Add contribution and development conventions.
- [ ] Establish branch and pull-request conventions.
- [ ] Add initial CI checks when the project has a runnable application.
- [ ] Record important architecture decisions.

**Exit criteria:** the repository structure and technology choices are documented, secrets are protected, and the first build/test workflow is defined.

### Phase 2 — Minimal application and deployment pipeline

- [ ] Create the smallest working website/application.
- [ ] Add the agreed package scripts and deterministic dependency installation.
- [ ] Add formatting, linting, type-checking, and test commands.
- [ ] Connect the repository to Vercel.
- [ ] Configure the correct project root and build settings.
- [ ] Produce a successful preview deployment.
- [ ] Document how to diagnose failed builds.

**Exit criteria:** a minimal application builds locally/within CI and can be deployed to a non-production preview environment.

### Phase 3 — Database foundation

- [ ] Select and configure the PostgreSQL client/ORM or query layer.
- [ ] Connect a dedicated development/preview Neon database.
- [ ] Establish a repeatable migration workflow.
- [ ] Add database connectivity and migration tests.
- [ ] Separate test, preview, and production database configuration.
- [ ] Document connection pooling, migration, and recovery procedures.

**Exit criteria:** migrations can be applied and tested safely against a non-production database without access to production credentials.

### Phase 4 — Core foundation

- [ ] Implement configuration validation.
- [ ] Implement structured logging and error handling.
- [ ] Implement shared database access and transaction conventions.
- [ ] Implement input validation.
- [ ] Define module contracts and dependency rules.
- [ ] Implement authentication.
- [ ] Implement server-side authorization and RBAC.
- [ ] Add audit events for important security actions.
- [ ] Add health checks and monitoring interfaces.
- [ ] Test failure handling and security boundaries.

**Exit criteria:** Core services have documented contracts and automated tests. Authentication and authorization must be tested, not merely represented by UI screens.

### Phase 5 — Website and application shell

- [ ] Establish layouts, navigation, and reusable UI components.
- [ ] Add sign-in/sign-out and appropriate session handling.
- [ ] Build the initial dashboard.
- [ ] Add loading, empty, success, and error states.
- [ ] Connect UI flows to authorized server-side operations.
- [ ] Test responsive behavior and accessibility basics.

**Exit criteria:** users can navigate the application shell and complete the implemented authentication flow without bypassing server-side checks.

### Phase 6 — Business modules

Implement each module as a separate, reviewable milestone:

- [ ] Business Manager
- [ ] Inventory
- [ ] Sales & Billing
- [ ] Customers & CRM
- [ ] Finance
- [ ] Projects
- [ ] Documents
- [ ] Reports
- [ ] Staff
- [ ] Communication & Notifications

For each module:

- [ ] Document scope and exclusions.
- [ ] Define data ownership and schema/migrations.
- [ ] Define permissions and tenant-isolation rules.
- [ ] Define interfaces and dependencies on other modules.
- [ ] Implement business logic and UI/API workflows.
- [ ] Add unit and integration tests.
- [ ] Verify failure cases and audit requirements.
- [ ] Review and merge the completed change.

**Exit criteria:** a module meets its own acceptance criteria and does not duplicate shared Core responsibilities.

### Phase 7 — Security, quality, and reliability

- [ ] Test authentication and authorization boundaries.
- [ ] Test tenant isolation across reads, writes, and reports.
- [ ] Add dependency and secret scanning where available.
- [ ] Verify database constraints and migration safety.
- [ ] Test error handling and sensitive-data redaction in logs.
- [ ] Review rate limiting and abuse protection for exposed endpoints.
- [ ] Test critical user journeys.
- [ ] Verify preview and production environment separation.
- [ ] Document unresolved risks.

**Exit criteria:** critical security and reliability checks pass; known limitations are documented and accepted before release.

### Phase 8 — Production readiness and operations

- [ ] Review Vercel production settings and environment variables.
- [ ] Review Neon production access and connection settings.
- [ ] Verify backups and perform a recovery test.
- [ ] Document release, rollback, and migration procedures.
- [ ] Configure monitoring and alerting appropriate to the application.
- [ ] Verify domain and HTTPS configuration when a domain is available.
- [ ] Run a production-readiness checklist.
- [ ] Approve and perform the first production release.
- [ ] Record post-release checks and follow-up issues.

**Exit criteria:** the release has been reviewed, critical checks pass, recovery procedures have been tested, and production access is controlled.

## Definition of done

A task is complete only when all applicable items are satisfied:

- [ ] The change matches the issue's scope and acceptance criteria.
- [ ] The implementation follows the agreed module boundaries.
- [ ] Relevant tests have been added or updated and pass.
- [ ] Formatting, linting, type checks, and build checks pass where configured.
- [ ] Security, authorization, and tenant-isolation implications have been reviewed.
- [ ] No credentials or sensitive data have been committed.
- [ ] Database changes include reviewed, repeatable migrations where needed.
- [ ] Documentation is updated when behavior, setup, or operations change.
- [ ] The change has been reviewed and merged through the agreed workflow.
- [ ] Preview deployment has been checked when relevant.

## Repository conventions

- Use descriptive branch names, such as `feature/inventory-basics`, `fix/login-validation`, and `docs/deployment-guide`.
- Prefer small, focused pull requests.
- Link issues to pull requests and commits where possible.
- Do not commit generated output, dependency folders, local database files, logs, or real environment files.
- Keep secrets out of source code and issue discussions.
- Do not mark planned capabilities as implemented until they are working and tested.
- Update this roadmap when priorities or architecture decisions change.

## Project status

**Current milestone:** repository planning and foundation.

**Next actions:**
1. Confirm the technology stack and directory structure.
2. Add repository safety files and development documentation.
3. Create GitHub Issues for Phase 1 and Phase 2.
4. Build a minimal working application and verify the CI checks.
5. Connect Vercel and Neon using separate preview and production configuration.

This README is the living overview. GitHub Issues should hold the detailed task descriptions, implementation notes, and acceptance criteria for individual pieces of work.
