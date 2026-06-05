# Development Progress

> L2 | Parent: `AGENTS.md`

## Current State

- Branch: `main`
- Source repository: `zreohup/ZWStarclaw`
- Deployment model: direct static hosting from `app/` or Docker from the
  repository root.
- Working tree contains the commercial branding, NodeKey BaseURL, cleanup, and
  deployment changes for the first ZWStarclaw push.

## Recently Completed

- Restored the original model provider settings layout and set the custom
  OpenAI-compatible provider BaseURL to NodeKey.
- Renamed the visible product brand to 紫薇Claw across the app shell, generated
  share card watermark, and public docs assets.
- Added Docker, Docker Compose, Nginx SPA routing, and an environment detection
  setup script for local deployment.
- Removed legacy mirror workflow, stale `.claude` project memory, template app
  README, and visible repository/license promotional docs.
- Removed visible repository and license links from the app shell and docs for
  the commercially authorized local build.
- Added true solar time correction support.
- Added free-text birthplace matching.
- Added local city and region coordinate dataset from `88250/city-geo`.
- Added Vercel Analytics.

## Current Documentation Task

Build a durable development documentation system so new sessions can understand
the project quickly without rediscovering context. Documentation must be updated
with each meaningful code change. GitHub issue and pull request templates now
extend this rule to incoming work and review.

## Known Verification Baseline

Previously passed:

```powershell
cd app
npm run lint
npm run test
npm run build
```

Known build note: Vite may report a large chunk warning. That warning was already
known and is not by itself a failure.

## Open Risks

- The birthplace matching experience depends on the quality and coverage of the
  local coordinate dataset.
- Docker Desktop must be started manually on macOS and Windows after installation.

## Next Useful Work

- Confirm GitHub push access to `zreohup/ZWStarclaw`.
- Confirm Vercel or Cloudflare deployment status after the first real `main` push.
- Add feature-level tests whenever true solar time or birthplace matching behavior
  changes.
- Use GitHub issue templates for new feature, bug, and internal development work.

[PROTOCOL]: Update this file after each feature, fix, release, deployment change,
or notable verification run.
