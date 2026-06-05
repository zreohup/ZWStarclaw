# Ziwei Project Agent Guide

> L1 | Project constitution and startup map for agentic development.

## Startup Protocol

Read these files before changing code:

1. `AGENTS.md` - project rules, commands, current development contract.
2. `docs/dev/progress.md` - current state, recent work, next risks.
3. `docs/dev/project-map.md` - architecture, module ownership, data flow.
4. `docs/dev/decisions.md` - decisions that must not be rediscovered.
5. `app/AGENTS.md` - app-specific boundaries before touching `app/`.

If the task touches deployment, also read `docs/dev/workflow.md`.

## Project Position

ZWStarclaw is a React + TypeScript + Vite Zi Wei Dou Shu charting application. It
combines chart generation, true solar time correction, birthplace coordinate
matching, structured knowledge retrieval, AI interpretation, and deployment
as a static web app or Docker container.

## Repository Map

<directory>
app/ - Web application source, tests, build config, and frontend assets.
docs/ - User-facing docs, deployment notes, plans, and development memory.
scripts/ - Local setup and environment automation.
.github/ - Issue and pull request templates.
</directory>

<config>
app/package.json - npm scripts and frontend dependencies.
app/vite.config.ts - Vite build and test configuration.
Dockerfile - Production container build.
docker-compose.yml - Local Docker runtime.
nginx.conf - Static SPA runtime configuration.
</config>

## Commands

Run from `app/` unless noted:

```powershell
npm run dev
npm run lint
npm run test
npm run build
```

Useful repository checks from root:

```powershell
git status --short --branch
git log --oneline -n 8
git ls-remote origin refs/heads/main
```

## Documentation Is Code

Any meaningful code change must update documentation in the same work unit.
This is a project rule, not optional cleanup.

Update the nearest matching document:

- Behavior, product state, or development progress changes: `docs/dev/progress.md`
- Architecture, module ownership, or data flow changes: `docs/dev/project-map.md`
- Long-lived technical or product decision changes: `docs/dev/decisions.md`
- Build, test, release, GitHub, or Vercel flow changes: `docs/dev/workflow.md`
- App module boundaries or important app files change: `app/AGENTS.md`
- Top-level structure or project contract changes: this `AGENTS.md`

A change is not complete until code, tests, and documentation agree.

## Engineering Rules

- Inspect before editing.
- Keep changes scoped to the user request.
- Preserve existing behavior unless the user explicitly accepts a breaking change.
- Prefer simple data structures over special-case branching.
- Do not revert user changes unless explicitly asked.
- For frontend changes, verify visual behavior in a browser when practical.
- For business logic changes, add or update focused tests.
- For deployment automation changes, test the workflow file or the command path that
  exercises it.

## Current Deployment Model

`zreohup/ZWStarclaw` is the canonical repository. Deployment is direct from this
repository, either by static hosting from `app/` or by the production Docker
image defined at the repository root. There is no deployment mirror workflow.

[PROTOCOL]: Update this file when the top-level architecture, commands, deployment
model, or documentation contract changes.
