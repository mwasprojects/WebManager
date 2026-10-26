# Testing and Verification Strategy

A file existing or a commit succeeding is not evidence that a feature works. Mark work verified only when acceptance criteria have been checked and results are available.

## Test layers

### Static and build checks
- Dependency installation from the committed lockfile.
- TypeScript typecheck.
- Lint/format checks once configured.
- Production build.

### Unit tests
Test time/duration calculations, expiry boundaries with an injectable clock, validation and error mapping, rate-limit decisions, permission evaluation, and retry/backoff calculations.

### Integration tests
Test repositories and migrations, atomic code consumption, session creation/expiry/rotation/revocation, account-bound portal links, email adapter behavior, shared rate limiting, and job retries/idempotency when those components exist.

### End-to-end tests
Test ordinary registration/verification, login/logout/session expiry, developer/admin provisioning and denied access, recovery/unlock, responsive UI, keyboard accessibility, and deployment smoke tests.

## Required security cases

- [ ] Code rejected at or after expiry and after successful use.
- [ ] Maximum failed-attempt policy enforced.
- [ ] Resending invalidates the prior code.
- [ ] Generic responses do not disclose account existence.
- [ ] Portal link rejected at or after its ten-minute expiry.
- [ ] Expired link never locks an account.
- [ ] Qualifying cross-account attempt locks only the authenticated account making the attempt.
- [ ] Unknown, malformed, revoked, or replayed tokens do not trigger unintended lockout.
- [ ] Concurrent requests cannot consume a single-use token twice.
- [ ] Session revocation is enforced on subsequent protected requests.
- [ ] Role removal and account disablement block access.
- [ ] User and tenant data cannot be read across ownership boundaries.
- [ ] Logs and responses never expose raw codes, tokens, cookies, or secrets.
- [ ] Unauthorized users cannot unlock accounts or assign privileged roles.

## Performance and resilience

Run baseline, gradual-load, spike, sustained/soak, database connection, rate-limit, queue-backlog, dependency-failure, timeout, and recovery tests as the relevant components are introduced. Use controlled environments and synthetic data. Define target workload and service goals before claiming throughput or a supported user count.

## Release gates

Before merge, confirm acceptance criteria, relevant automated checks, security/data-boundary review, documentation updates, and actual CI results. Before production, review environment secrets, migrations/recovery, preview behavior, monitoring, and smoke checks.
