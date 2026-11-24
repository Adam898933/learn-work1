# Project memory

## Product intent & audience

- Web application built with Vite + React.
- Intended for public web deployment via Bolt hosting (live website), not GitHub.
- Chosen subdomain `learn-work1` suggests a learning/work-related product, though exact domain not yet confirmed.

## Brand personality & voice

- Not yet inferred from available context.

## Visual design & UX direction

- Not yet inferred from available context.

## Decisions, constraints & rationale

- **Framework:** Vite + React, configured via `vite.config.ts`.
- **Config dependency:** `vite.config.ts` imports `defineConfig` from `@lovable.dev/vite-tanstack-config` (declared in `package.json`); this package must be installed before build runs.
- **Deployment target:** Bolt hosting at `*.bolt.host` — user explicitly does not want GitHub publishing.
- **Desired subdomain:** `learn-work1` (site URL: `learn-work1.bolt.host`).
- **Deployment environment:** Node 21; Rolldown used as bundler (downloads `@rolldown/binding-wasm32-wasi`).
- **Known warning (non-blocking):** Experimental WASI warnings appear under Node 21; these do not halt the build.
- **Resolved issue:** Deployment failed with `ERR_MODULE_NOT_FOUND` for `@lovable.dev/vite-tanstack-config` because `node_modules` was absent; installing dependencies fixed the build.

## Open questions & assumptions

- Exact product purpose and target audience still unknown — subdomain hints at learning/work theme but is unconfirmed.
- Visual/UX direction not yet provided.
- Assumed: dependencies are installed via standard `pnpm install` / `npm install` prior to build in the deployment pipeline.
- Assumed: `@lovable.dev/vite-tanstack-config` remains the intended config helper (not a stale/erroneous import).