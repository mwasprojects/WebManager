# WebManager Architecture

## Starting architecture

Start with a modular monolith: one main Next.js application, clear internal domain boundaries, and shared packages for capabilities that genuinely need reuse. Avoid microservices, Kubernetes, and multiple databases until there is a demonstrated need.

## Logical layers

1. Presentation: pages, components, and route handlers.
2. Request boundary: request IDs, validation, rate limits, timeouts, and error mapping.
3. Application services: use cases and business-operation coordination.
4. Domain rules: feature-owned business invariants.
5. Infrastructure adapters: database, email, cache, queue, storage, and external APIs.
6. Observability: safe logs, metrics, traces, and health checks.

These are logical responsibilities, not a requirement to create a package for every layer immediately.

## Proposed package boundaries

- server-core: request context, error contracts, validation conventions, timeout helpers, and resource limits.
- security: authentication integration, sessions, permissions, and time-sensitive security policies.
- database: connection/client configuration, transactions, migrations, and shared data-access helpers.
- jobs: job contracts and worker integration when background processing is introduced.
- observability: metrics, tracing, and health-check integration.
- ui: shared accessible UI components and design tokens.
- App modules: feature-owned domain logic and data access.

Reconcile these proposals with the current repository before creating packages. Avoid empty packages and circular dependencies.

## Request path

A typical protected request establishes context, applies payload and abuse limits, authenticates, validates input, authorizes the action and resource scope, executes business logic with bounded time/concurrency, uses controlled data access, then returns a standard response and safe metrics. The exact order may vary by endpoint, but no protected operation may rely on UI visibility or a client-provided role.

## Scaling principles

- Keep application instances stateless.
- Store durable sessions, security state, and business records in suitable shared storage.
- Bound request sizes, concurrency, query duration, connections, and queue growth.
- Optimize queries before introducing caching.
- Use shared rate limits when traffic can reach multiple instances.
- Move suitable long-running work to durable background jobs.
- Use backpressure and predictable errors during overload.
- Scale web app, database, and workers independently according to metrics.
- Prove capacity with controlled load tests rather than unsupported user-count claims.

## Data and trust boundaries

The server is authoritative for identity, permissions, ownership, and tenant scope. Validate untrusted input, use parameterized database access, apply least privilege, keep environments separate, and never expose secrets in browser bundles or logs. Minimize data collection.

## External dependencies and decisions

Wrap providers behind small interfaces when that improves testability or isolation. Define timeout, retry, error, observability, and configuration behavior. Record significant trade-offs in [Architecture Decision Records](../decisions/README.md).
