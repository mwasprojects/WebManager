# WebManager Documentation

> This is the documentation home for project planning and engineering. A documented feature is not necessarily implemented. Verify implementation through code, tests, and deployment evidence.

## Read in this order

1. [Overview and documentation map](README.md)
2. [Stages and roadmap](stages/README.md)
3. [Architecture](architecture/README.md)
4. [Security guide](security/README.md)
5. [Server and request management](server/README.md)
6. [Authentication implementation plan](authentication/README.md)
7. [Database and data access](database/README.md)
8. [Testing and verification](testing/README.md)
9. [Development guide](development/README.md)
10. [Manual coding workflow](development/MANUAL-CODING.md)
11. [Manual coding progress tracker](development/PROGRESS.md)
12. [Directory and file map](DIRECTORY-MAP.md)
13. [Dependency management guide](dependencies/README.md)
14. [Dependency register](dependencies/DEPENDENCY-REGISTER.md)
15. [Deployment guide](deployment/README.md)
16. [Architecture Decision Records](decisions/README.md)

The root README is the high-level product summary and quick start. The security guide is the detailed source of truth for authentication policies. If a summary conflicts with a detailed guide, resolve the conflict and update both.

## Current status

The project now contains an initial full-stack development implementation: Next.js portal UI, Fastify API, PostgreSQL schema, email OTP requests, server-side sessions, and role-gated portal endpoints. These files have been committed but have not yet been independently built, integration-tested, or security-audited. Account-bound portal links, privileged role-management UI, recovery/unlock flows, and complete end-to-end/security tests remain outstanding. Do not describe the system as production-ready until those requirements are implemented and verified.

Track tasks in GitHub Issues where useful and connect work to acceptance criteria through commits, checks, and progress notes. The manual learning workflow uses the existing default branch; creating new branches is not required.

## Documentation rules

- Mark proposals and defaults as proposed until approved.
- Do not describe a feature as implemented because a plan or interface exists.
- Give every implementation stage acceptance criteria and evidence.
- Keep detailed requirements in the relevant guide; avoid duplicating entire sections.
- Update the source-of-truth guide and summaries when a policy changes.
- Record significant architectural trade-offs as ADRs.
- Use UTC in technical timestamp examples unless discussing user-facing local time.
- Never include secrets, real credentials, private user data, or production tokens.

## Suggested status labels

- proposed — suggested but not approved
- ready — scope and acceptance criteria are clear
- in-progress — implementation is underway
- blocked — depends on a named unresolved item
- review — ready for review
- verified — acceptance criteria have evidence
- released — merged and deployed through the agreed process
- deferred — intentionally postponed with a reason

A merged change is not automatically verified or released.
