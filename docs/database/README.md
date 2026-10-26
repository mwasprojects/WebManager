# Database and Data Access

Local development now uses PostgreSQL through Docker Compose and the `pg` Node.js client. The initial migration is `packages/database/migrations/001_init.sql`; it creates users, role assignments, verification challenges, sessions, rate-limit buckets, security events, and a migration marker. Neon PostgreSQL remains the planned hosted database. The schema and connection strategy still need integration tests and production review.

## Principles

- Use versioned migrations rather than manual production edits.
- Keep credentials out of source control.
- Separate development, test, preview, and production databases/credentials.
- Use least-privilege database roles and parameterized queries.
- Enforce important invariants with database constraints as well as application checks.
- Keep transactions short and avoid unnecessary data retention.
- Test migrations and backup restoration with non-production data.

## Connection management

Choose a strategy suitable for the actual Next.js/Vercel runtime and Neon connection options. Budget total connections across web instances, workers, migration processes, and administration.

Avoid uncontrolled pools per request. Set connection and query timeouts. Monitor connection errors, pool waits, query latency, locks, and saturation. Do not increase application concurrency without checking database capacity.

## Schema conventions

Agree on primary-key strategy, foreign-key naming, unique constraints for normalized identifiers, UTC-compatible TIMESTAMPTZ timestamps, explicit expiry fields, state constraints, indexes, and retention/deletion behavior before production schema work.

The initial schema includes users, verification challenges, sessions, role assignments, rate-limit buckets, and security events. Account-bound portal-link tables, richer permissions/scopes, tenant entities, and operational cleanup jobs are not implemented yet. Review the normalized schema and indexes before adding further migrations.

## Query performance

- Select only required fields.
- Paginate large collections and enforce a server-side maximum page size.
- Prefer cursor pagination for large or frequently changing collections.
- Avoid N+1 queries and batch safe operations.
- Use transactions for related changes that must succeed or fail together.
- Do not hold transactions open while waiting for email or remote services.
- Inspect query plans before adding indexes indiscriminately.
- Use atomic operations or appropriate locking for one-time token consumption and race-sensitive changes.

## Multi-tenant data

If organizations/workspaces are introduced, every read and write must enforce tenant scope. Do not trust a tenant ID supplied by a browser without verifying membership and authorization. Test cross-tenant access explicitly. Database row-level security may provide defense in depth but does not replace application authorization review.

## Migrations and recovery

Keep migrations versioned and reviewed. Test applying them to a clean database and upgrading a representative prior schema. Prefer forward-compatible changes when releases overlap. Document backup retention, restore steps, and recovery objectives as the product becomes production-critical. Never test destructive migrations against production without an approved procedure.

## Acceptance checklist

- [x] Initial PostgreSQL client (`pg`) and migration SQL are present (integration-tested status not yet verified).
- [ ] Environment-specific credentials separated.
- [ ] Connection strategy and budget documented.
- [ ] Migrations repeatable and tested.
- [ ] Constraints and indexes reviewed.
- [ ] Queries have suitable limits and timeouts.
- [ ] Account and tenant isolation tests exist.
- [ ] Backup and restore procedures are documented and tested.
