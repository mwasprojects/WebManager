# Server and Request Management

> This guide describes the target design. It does not claim the controls have been implemented or load-tested.

## Goals

Handle more requests without unbounded resource use, keep interactive operations responsive, and recover gracefully from slow or unavailable dependencies.

## Request controls

- Generate a request ID and propagate trace context where supported.
- Enforce HTTP methods, content types, payload sizes, and server-side validation.
- Use a consistent response/error contract.
- Return HTTP 429 for rate limiting and Retry-After where appropriate.
- Return HTTP 503 when temporary capacity or dependency failure makes a request unserviceable.
- Never expose stack traces, raw database errors, secrets, or unnecessary personal data.

## Rate limits and concurrency limits

Rate limits cap how frequently requests are accepted. Concurrency limits cap the number of expensive operations running simultaneously. Use both where needed. Limits that span application instances require shared/distributed state; process-local counters are not enough. Authentication throttles must not create a trivial way to lock out a victim account.

## Timeouts and bounded work

Set budgets for requests, database connection acquisition, queries, transactions, external HTTP calls, email provider calls, and jobs. Individual timeouts must fit inside the overall request deadline.

Bound payload sizes, page sizes, concurrent exports, bulk operations, worker concurrency, and queue depth. Avoid unlimited promises, in-memory queues, and retry loops.

## Database pressure

- Choose a connection strategy compatible with the deployment runtime and Neon.
- Budget connections across app instances, workers, and migrations.
- Avoid uncontrolled connection pools per request.
- Keep transactions short and do not hold locks while calling external services.
- Select only needed fields, paginate large results, and avoid N+1 queries.
- Add indexes based on access patterns and query-plan evidence.
- Monitor query latency, pool wait, connection errors, locks, and saturation.

Scaling the web application does not automatically scale the database.

## Caching

Start with query optimization and safe HTTP/CDN caching for public, infrequently changing data. Add a shared cache only when measurement shows a benefit. Do not cache session revocation, account-lock status, authentication challenges, or authorization decisions without explicit freshness and invalidation rules.

## Background jobs

Move suitable slow work such as bulk imports/exports, large reports, file processing, and notifications to durable jobs. Authenticate and authorize requests before accepting work.

A production job system needs durable storage, bounded worker concurrency, queue limits, timeouts, bounded retries with exponential backoff and jitter, idempotent handlers, failed-job handling, graceful shutdown, and queue metrics. Use a runtime suitable for persistent work; do not assume a serverless request function is a long-running worker. Consider a transactional outbox when a database change must reliably trigger a job.

## Overload and dependency failures

Use backpressure: reject or defer work when capacity is exhausted, pause workers when dependencies are saturated, and avoid unbounded queues. Retry only appropriate transient failures, with limits and jitter. Do not retry non-idempotent operations without duplicate protection. Protect latency-sensitive work from expensive operations when measurements justify separate resource budgets.

## Observability

Track request volume, p50/p95/p99 latency, errors, timeouts, rate-limit events, expensive-operation concurrency, database connections/query latency/locks, and job depth/age/retries/failures. Use structured logs and request IDs. Never log raw OTPs, session tokens, cookies, or email-link secrets.

Distinguish liveness, readiness, and dependency health. Health checks should not create restart loops during temporary database outages.

## Rollout order

1. Error contracts, request IDs, and safe logs.
2. Validation, payload limits, and timeout conventions.
3. Database access and connection budgets.
4. Rate/concurrency controls.
5. Baseline metrics and health checks.
6. Measure real workloads.
7. Add caching/jobs when justified.
8. Run controlled load, spike, soak, dependency-failure, and recovery tests.

Set measurable service targets before release. Performance targets are provisional until verified in a controlled environment.
