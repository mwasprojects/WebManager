# Development guide

## Prerequisites

- Node.js 20.9 or newer
- pnpm
- Git

## Start the project

From the repository root:

```bash
pnpm install
pnpm dev
```

## Verify changes

```bash
pnpm typecheck
pnpm build
```

## Current milestone

The first milestone is the sign-in/sign-up interface and workspace foundation. Authentication is not connected yet. Before implementing it, choose a maintained authentication/session library and an email delivery provider, then write tests for code expiry, replay, throttling, session handling, portal-link ownership, and authorization.

Do not put real credentials in source control. Use a local untracked `.env.local` file for development secrets and configure deployment secrets through the hosting provider.
