# LavaBMS Drug Expiry Manager

An admin console and Chrome extension that tracks medicine expiry dates and shows matching expiry alerts inside LavaBMS POS.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/drug-expiry-manager` — the admin console and downloadable extension package
- `artifacts/api-server/src/routes/drugs.ts` — drug CRUD, matching, and dashboard endpoints
- `artifacts/api-server/src/lib/drug-utils.ts` — shared match and expiry-status rules
- `lib/db/src/schema/drugs.ts` — PostgreSQL source-of-truth for drug records
- `lib/api-spec/openapi.yaml` — source-of-truth for the typed API contract
- `artifacts/drug-expiry-manager/public/extension` — unpacked Chrome extension source

## Architecture decisions

- Expiry status is derived from the calendar date on every read: expired is before today, expiring is today through 90 days, and good is beyond 90 days.
- LavaBMS matching is case-insensitive substring matching across the generic name, alternative names, and brand names.
- The extension uses a configurable API URL stored in Chrome sync storage so the same package can point to a development or published console.
- The extension fails quietly when the API is unavailable so it never blocks medicine entry in the POS.

## Product

- Dashboard with good, close-to-expiry, and expired counts
- Searchable drug records with create, edit, delete, batch, notes, alternative names, and brand names
- LavaBMS setup page with health status, copyable API URL, and downloadable Chrome extension
- Extension alert colors: light green for good dates, light yellow for close to expiry, and light red for expired drugs

## User preferences

The user wants drug names to match against generic, alternative, and brand names in LavaBMS.

## Gotchas

- The Chrome extension must be configured from its options page with the admin console URL ending in `/api`.
- The extension content script currently targets `http://lava-server:62/*`, matching the local LavaBMS URL supplied by the user.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
