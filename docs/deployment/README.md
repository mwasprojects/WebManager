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

## Deploy a preview to Vercel

This is a setup guide, not confirmation that a Vercel project has already been created. Start with a **Preview** deployment; do not make the feature branch the production branch.

### 1. Prepare the repository

1. Install the same pnpm version declared by the root `package.json` (currently `pnpm@10.12.1`).
2. From the repository root, run `pnpm install` and commit the generated `pnpm-lock.yaml`. Keep the lockfile updated whenever dependencies change.
3. Confirm `pnpm typecheck` and `pnpm build` pass locally.
4. Push the branch to GitHub.

A committed lockfile makes dependency installation repeatable. Do not add real credentials to the repository.

### 2. Import the GitHub repository

1. Sign in to [Vercel](https://vercel.com/) using the GitHub account that can access `mwasprojects/WebManager`.
2. In the Vercel dashboard, select **Add New → Project** and import `mwasprojects/WebManager`.
3. In the project configuration, set **Root Directory** to `apps/web`, the location of the Next.js application. Vercel should detect Next.js automatically.
4. Keep the default Next.js build and output settings initially. Ensure Vercel recognises the pnpm workspace and uses the repository's committed lockfile. Do not add a custom build command unless the build logs show it is necessary.
5. Select **Deploy** to create the first deployment.

Because this repository uses a pnpm workspace, check the install and build logs carefully. If Vercel cannot find the workspace or lockfile, stop and correct the root/install configuration rather than adding a second lockfile inside `apps/web`.

Official setup references: [Vercel monorepos](https://vercel.com/docs/monorepos) and [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build).

### 3. Test Preview deployments

After the project is connected to GitHub, pushes to non-production branches can generate Preview deployments automatically.

1. Open the Vercel project and find the deployment for the branch/commit you pushed.
2. Open its generated `.vercel.app` URL.
3. Test the page at desktop and mobile widths, check browser console errors, and verify that navigation and the health endpoint behave as expected.
4. Review the deployment build logs if it fails.
5. Keep the Preview URL for testing; do not treat it as the production domain.

The current login/sign-up page is only a UI prototype. A successful deployment does not mean authentication, email delivery, sessions, or database access are implemented.

Read [Vercel Git deployments](https://vercel.com/docs/git) and [Vercel environments](https://vercel.com/docs/deployments/environments) for current behavior.

### 4. Configure environment variables safely

The current UI prototype does not require a database or email-provider secrets. Do not add dummy secrets just to deploy it.

When a later stage requires configuration:

1. Open **Project Settings → Environment Variables**.
2. Add each variable to the appropriate environment: **Preview**, **Development**, or **Production**.
3. Use non-production database credentials for Preview and production-only credentials for Production.
4. Keep secrets server-side; never prefix private credentials with `NEXT_PUBLIC_`.
5. Redeploy after changing environment variables so the new deployment receives them.

Use [Vercel environment variables](https://vercel.com/docs/environment-variables) for details. Never commit `.env.local`, production credentials, or tokens.

### 5. Promote to production only when ready

Do not change the production branch or deploy a production release merely to test the UI. First require successful CI, a reviewed change, a working Preview deployment, and the applicable security and smoke tests. The authentication prototype is not ready to be used as a real login service.

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
