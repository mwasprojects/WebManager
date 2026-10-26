# Deployment Guide

Vercel and Neon PostgreSQL are planned targets. This guide is not evidence that a production deployment exists or is configured.

## Environments

| Environment | Purpose | Data and secrets |
|---|---|---|
| Local development | Developer feedback | Local or dedicated non-production services |
| Automated tests | Repeatable checks | Isolated resources and synthetic data |
| Preview | Review proposed changes | Non-production credentials/data |
| Production | Real users and business data | Production-only credentials and approved access |

Never fall back silently from a failed local or preview connection to production.

## Vercel preparation

- Confirm monorepo root and build settings.
- Confirm Node.js and pnpm versions.
- Commit the lockfile and use deterministic installation.
- Configure environment variables separately for preview and production.
- Keep server secrets out of client bundles.
- Verify preview deployment and smoke tests.
- Confirm route execution/time limits fit the work.
- Do not treat serverless request handlers as persistent workers.

## Neon preparation

- Separate non-production and production databases/branches with controlled access.
- Use different credentials for each environment.
- Configure connection handling for the runtime.
- Budget connections across app instances, workers, and migrations.
- Run reviewed, repeatable migrations.
- Use synthetic or sanitized preview/test data.
- Document and test backup restoration.

## Secrets

Store real secrets in Vercel environment settings or an approved secret manager. The repository example environment file must contain safe placeholders only. Review environment changes in PRs. Rotate any secret accidentally committed or exposed.

## Release flow

1. Merge a reviewed change to the agreed release branch.
2. Inspect CI results and the exact commit.
3. Deploy to preview/staging where applicable.
4. Verify critical journeys, configuration, and logs.
5. Review migrations and compatibility with deployed code.
6. Deploy to production only after explicit approval.
7. Run smoke tests and inspect error/latency metrics.
8. Roll back the app or follow documented forward-recovery steps if critical behavior fails.

Database rollback is not always equivalent to application rollback. Prefer reviewed, forward-compatible migrations.

## Production checklist

- [ ] CI, tests, typecheck, and build pass.
- [ ] Environment variables and secrets reviewed.
- [ ] Preview/staging behavior verified.
- [ ] Authentication and authorization tests pass.
- [ ] Migration and recovery procedures documented.
- [ ] Domain and HTTPS configured where required.
- [ ] Email delivery and sender configuration verified.
- [ ] Health checks, logs, metrics, and alerts configured.
- [ ] Backup restoration tested.
- [ ] Post-deployment smoke checks ready.
- [ ] Known risks and rollback/recovery procedures documented.
