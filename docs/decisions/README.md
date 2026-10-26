# Architecture Decision Records (ADRs)

Use this folder to record decisions that materially affect architecture, security, dependencies, data, deployment, or developer workflow. ADRs prevent proposals from being mistaken for approved choices and preserve the reasoning behind trade-offs.

## When to write an ADR

Create a record when a decision changes a core boundary, selects a database/ORM/authentication library/email provider/queue/cache/hosting pattern, changes security or retention policy, adds meaningful cost/operational complexity, or is difficult to reverse.

## Naming

Use an increasing number and short kebab-case title, for example:
- 0001-modular-monolith.md
- 0002-authentication-library.md
- 0003-database-client.md

## Template

Copy this structure into a new numbered file:

    # ADR-NNNN: Decision title

    - Status: Proposed | Accepted | Superseded | Rejected
    - Date: YYYY-MM-DD
    - Owners: project/team

    ## Context
    What problem or constraint requires a decision?

    ## Decision
    What are we choosing?

    ## Alternatives considered
    What realistic alternatives were considered and why were they not selected?

    ## Consequences
    What benefits, costs, risks, and follow-up work result?

    ## Verification
    How will we confirm the decision works in practice?

    ## Related issues and documents
    Link relevant issues, PRs, and documentation.

## Decision rules

- Mark a decision Proposed until approved.
- Explain alternatives and trade-offs.
- Prefer reversible decisions early when evidence is limited.
- Do not record credentials or private data.
- When superseded, retain the old record and link to the replacement.
- Update relevant guides when an accepted decision changes requirements.
