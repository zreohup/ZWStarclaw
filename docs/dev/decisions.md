# Decisions

> L2 | Parent: `AGENTS.md`

## D001 - True Solar Time Uses Birthplace Matching

Users should not need to know longitude, latitude, or minute-level correction
details. The app accepts a normal birthplace text input and resolves it against a
local coordinate dataset. The UI should keep this approachable for ordinary users.

Consequence: improvements should prefer better matching, aliases, and clear
fallbacks over asking users for raw coordinates.

## D002 - Coordinate Data Is Local

The app uses local coordinate data from `88250/city-geo` instead of relying on a
network geocoding API for every chart calculation.

Reasons:

- Works without a third-party API key.
- Avoids leaking birth location queries to an external service.
- Keeps chart generation deterministic.

Consequence: dataset license and source attribution must remain tracked under
`docs/licenses/`.

## D003 - Deployment Is Direct From ZWStarclaw

`zreohup/ZWStarclaw` is the canonical repository for this commercial build.
Deployment should use this repository directly through static hosting from `app/`
or the root Docker image.

Consequence: do not reintroduce legacy mirror synchronization unless a new
deployment repository is explicitly created.

## D004 - Docker Is The Portable Production Runtime

The app remains a static frontend, but the repository includes a Docker runtime
using an Nginx static server so it can be deployed on ordinary servers without a
Node.js process in production.

Consequence: Docker changes should preserve SPA fallback routing through
`nginx.conf` and should still allow static-hosting platforms to build from
`app/`.

## D005 - Documentation Is Part of the Deliverable

Every meaningful implementation change must update development documentation in
the same change set. This keeps agent context cheap and prevents project memory
from living only inside chat history.

Consequence: do not mark future work complete until the relevant docs are updated.

## D006 - GitHub Templates Enforce Development Discipline

GitHub issue and pull request templates are used to make scope, verification, and
documentation impact explicit before work is accepted.

Consequence: feature, bug, and task issues should identify documentation impact.
Pull requests must treat documentation updates as part of the same deliverable as
code and tests.

## D007 - Commercial Build Fixes AI Access To Nodekey

The commercially authorized local build shows `Nodekey` as a fixed AI provider
instead of offering an `AI 厂商` selector. NodeKey uses the internal
OpenAI-compatible endpoint `https://nodekey.xinghanyun.cn/v1`; users do not edit
this endpoint in the frontend.

Consequence: future AI settings changes should not reintroduce provider choices
unless the product requirement changes.

[PROTOCOL]: Add a new decision when a choice affects future implementation,
deployment, product behavior, or contributor workflow.
