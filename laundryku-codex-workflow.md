---
name: laundryku-codex-workflow
description: Use this skill when implementing, auditing, fixing, or planning Laundryku SaaS tasks with Codex. This skill enforces PRD-first, phase-scoped, repo-aware development for Laundryku.
---

# Laundryku Codex Workflow Skill

Use this skill for any Laundryku development task involving:
- phase implementation
- route creation or correction
- schema-aligned UI/backend work
- API route creation
- auth/session handling
- tenant slug handling
- dashboard, services, staff, orders, billing, or customer tracking
- Vercel deployment fixes
- PRD/SCHEMA/PHASES/RUNBOOK alignment

Do not use this skill for unrelated generic coding tasks.

## Core Rule

Codex must not guess the product.

Laundryku must be built from the repo source of truth:
- AGENTS.md
- PRD.md
- SCHEMA.md
- PHASES.md
- RUNBOOK.md

Before making changes, always read those files.

If any required file is missing, stop and report it.

## Operating Method

For complex or risky tasks:
1. Inspect first.
2. Plan before coding.
3. Implement one scoped task.
4. Verify against acceptance criteria.
5. Report files changed and risks.

Do not jump directly into broad implementation unless the task is small and unambiguous.

## Task Size Rule

Keep tasks small enough for one focused implementation pass.

Good task examples:
- Implement Services CRUD for Phase 2.
- Fix tenant slug validation in service APIs.
- Add staff PIN reset flow.
- Replace placeholder dashboard shell.
- Audit Phase 2 against PHASES.md.

Bad task examples:
- Build the whole app.
- Finish Laundryku.
- Make all dashboard features.
- Fix everything.

## Required Prompt Interpretation

Every Laundryku task must be interpreted using:

### Goal
What should be built or fixed?

### Context
Which files, routes, models, or errors matter?

### Constraints
What must not be changed?

### Done When
What must be true after the task?

If the user prompt lacks these, infer conservatively from PRD.md and PHASES.md.

## Laundryku Product Constraints

- Laundryku is a browser-based SaaS POS for Indonesian laundry kiloan businesses.
- It is multi-tenant.
- Tenant routes must preserve slug isolation.
- User-facing UI copy must be Bahasa Indonesia.
- Code, variables, schema fields, and route names must be English.
- Do not create demo-only pages.
- Do not invent features outside PRD.
- Do not leave placeholder production pages.
- Do not break existing auth/session behavior.
- Do not rename schema fields unless required and explained.

## Technical Constraints

- Use the existing stack and conventions in the repo.
- Respect the existing package manager.
- If package-lock.json exists, use npm.
- Do not switch package managers.
- Assume Vercel deployment unless RUNBOOK.md says otherwise.
- Validate tenant ownership on server-side API routes.
- Do not trust client-provided organization, branch, staff, service, or tenant identifiers.

## Phase Discipline

Always check PHASES.md.

Only implement the requested phase.

If implementing Phase 2:
- Implement owner configuration features only.
- Do not implement POS order creation.
- Do not implement billing payment gateway.
- Do not implement public customer tracking unless Phase 2 says so.

If the requested task crosses phase boundaries, stop and report:
- what belongs to the current phase
- what belongs to later phases
- recommended split

## Implementation Report

After work, always return:

1. Summary of changes
2. Files changed
3. API routes changed or created
4. Schema changes, if any
5. Risks
6. Manual verification steps
7. Whether acceptance criteria passed