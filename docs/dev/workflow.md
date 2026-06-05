# Workflow

> L2 | Parent: `AGENTS.md`

## Local Development

From `app/`:

```powershell
npm run dev
```

Use the local URL printed by Vite. If a frontend behavior changes, verify it in a
browser when practical.

## Verification

From `app/`:

```powershell
npm run lint
npm run test
npm run build
```

For deployment script changes:

```powershell
bash scripts/setup-env.sh --check-only --skip-npm
docker compose config
# or: docker-compose config
```

## Documentation Gate

Before finishing any meaningful change, update the matching development document:

- `docs/dev/progress.md` for current status, shipped work, risks, and verification.
- `docs/dev/project-map.md` for structure, module ownership, or data flow.
- `docs/dev/decisions.md` for durable product or technical choices.
- `docs/dev/workflow.md` for commands, release, GitHub, or Vercel process.
- `app/AGENTS.md` for app-level module and testing guidance.

Then check:

```powershell
git diff --stat
git status --short --branch
```

## GitHub Issue Rules

Use GitHub issue templates for incoming work:

- Bug reports must include symptom, reproduction steps, expected behavior, area,
  and documentation impact.
- Feature requests must include problem, smallest useful solution, acceptance
  criteria, area, and documentation impact.
- Development tasks must include scope, likely files or modules, verification
  plan, and documentation-as-code checklist.

Issues may start as rough notes, but implementation work should not begin until
scope, verification, and documentation impact are clear enough to execute.

## Pull Request Rules

Every PR must fill out `.github/PULL_REQUEST_TEMPLATE.md`.

The documentation-as-code checklist is part of review. A PR that changes behavior,
architecture, workflow, deployment, data sources, or development process without
matching documentation is incomplete.

For code changes, include fresh verification evidence. If a command is not run,
state the reason in the PR.

## Deployment

Canonical repository: `zreohup/ZWStarclaw`

Local development:

```powershell
bash scripts/setup-env.sh
cd app
npm run dev
```

Docker production runtime:

```powershell
docker compose up --build -d
# or: docker-compose up --build -d
```

Static hosting platforms:

- Root directory: `app`
- Build command: `npm run build`
- Output directory: `dist`

See `docs/deployment.md` for user-facing deployment steps.

[PROTOCOL]: Update this file when commands, CI, GitHub, Vercel, or release flow
changes.
