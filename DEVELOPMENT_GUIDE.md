# LavaBMS Drug Expiry Manager — Development Guide

This guide is written for developers learning how the app is put together. The project combines a React admin console, an Express API, a PostgreSQL database, and a Chrome extension that checks medicine names inside LavaBMS.

## Teaching plan: one-hour walkthrough

By the end of a class, students should be able to explain how a browser UI talks to an API, how a database record becomes an expiry status, and how the Chrome extension uses a matched name to show an alert.

Suggested lesson:

1. **5 minutes — map the app:** trace the diagram below from the admin console to the database, then from LavaBMS through the extension to the API.
2. **10 minutes — inspect a record:** open **Drug records**, compare a drug's generic, alternative, and brand names, and find that record with each term.
3. **10 minutes — inspect the API:** call `/api/drugs/search?q=Panadol`, then compare the result with the matching helper and route listed in the source map.
4. **10 minutes — explain expiry status:** follow the API's date calculation and identify why an expiry date changes the dashboard's status.
5. **10 minutes — try the extension:** load it in Chrome, enter a matching medicine name in LavaBMS, and compare the popup color to its expiry date.
6. **15 minutes — student exercise:** add a record with two aliases and two brands, predict the status from its expiry date, then check both the dashboard and extension.

Optional follow-up exercises: change the close-to-expiry window from 90 days; add a new field to the database and API; or add exact-match-only search and compare its behavior with the existing partial match.

## 1. How the pieces fit together

```text
Admin console (React + Vite) ─┐
                              ├── /api ── Express API ── PostgreSQL
Chrome extension on LavaBMS ──┘
```

- **Admin console:** add, edit, find, and remove drug records.
- **API:** validates requests, saves records, calculates expiry status, and searches names.
- **PostgreSQL:** stores drug names, aliases, brands, expiry dates, batch numbers, and notes.
- **Chrome extension:** reads text entered in the LavaBMS POS page and asks the API for matching records.

The drug name, any alternative name, and any brand name are all valid search terms.

## 2. Start the project in Replit

Open the project in Replit. The web and API workflows are configured separately:

- Web app: `pnpm --filter @workspace/drug-expiry-manager run dev`
- API: `pnpm --filter @workspace/api-server run dev`

The project already has a PostgreSQL connection in its Replit environment. Do not put database credentials in source files or commit them to Git.

Useful checks:

```sh
pnpm run typecheck
pnpm --filter @workspace/drug-expiry-manager run typecheck
pnpm --filter @workspace/api-server run typecheck
```

To update the development database schema after editing `lib/db/src/schema/`:

```sh
pnpm --filter @workspace/db run push
```

## 3. Run locally outside Replit

You need Node.js, pnpm, and a PostgreSQL database. Create a database for development and supply its connection string only through your terminal or a local, untracked environment file.

Install dependencies at the repository root:

```sh
pnpm install
```

Push the database tables:

```sh
DATABASE_URL='your-local-postgres-connection-string' pnpm --filter @workspace/db run push
```

Start the API in one terminal:

```sh
DATABASE_URL='your-local-postgres-connection-string' PORT=8080 pnpm --filter @workspace/api-server run dev
```

Start the web app in another terminal:

```sh
PORT=5173 BASE_PATH=/ VITE_API_BASE_URL=http://localhost:8080 pnpm --filter @workspace/drug-expiry-manager run dev
```

`VITE_API_BASE_URL` is the API server origin, without `/api`. It is optional when the hosting platform routes `/api` to the API server for you.

Never paste a real database password into class material, source control, screenshots, or chat.

## 4. Add a drug and test matching

In the admin console, choose **Drug records → Add medicine**. Enter a generic name and, optionally, comma-separated brand and alternative names. Save an expiry date and batch number if available.

The API also supports these operations:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/healthz` | Check that the API is responding |
| `GET` | `/api/dashboard/summary` | Read counts by expiry status |
| `GET` | `/api/drugs` | List records; supports `search` and `status` query parameters |
| `POST` | `/api/drugs` | Create a drug record |
| `GET` | `/api/drugs/search?q=Panadol` | Find by generic, alternative, or brand name |
| `PATCH` | `/api/drugs/:id` | Update a record |
| `DELETE` | `/api/drugs/:id` | Delete a record |

Example search in a local development setup:

```sh
curl 'http://localhost:8080/api/drugs/search?q=Panadol'
```

Matching is case-insensitive and searches for the typed text within each recorded name. The search endpoint returns the matching drug and the term that matched.

## 5. Expiry status rules

The API calculates status from the expiry calendar date each time it returns a record:

- **Expired:** expiry date is before today.
- **Close to expiry:** today through 90 days from today, inclusive.
- **Good date:** more than 90 days remain.

The extension displays these as light red, light yellow, and light green alerts. Expiry status is calculated by the API, so the dashboard and POS alert use the same rule.

## 6. Load the Chrome extension

The extension source is in `artifacts/drug-expiry-manager/public/extension/`. A ready-to-extract ZIP is served by the admin app.

1. Download the extension ZIP from **LavaBMS bridge**.
2. Extract the ZIP to a folder.
3. In Chrome, open the extensions manager and enable **Developer mode**.
4. Choose **Load unpacked** and select the extracted folder containing `manifest.json`.
5. Open the extension's **Details → Extension options**.
6. Set the API URL to the manager's URL ending in `/api`, then save.
7. Open `http://lava-server:62/pos` in Chrome and type a medicine name into a LavaBMS text field.

The extension waits briefly after typing, searches through the API, and shows a dismissible top-right alert. If the API is temporarily unavailable, it does not interrupt POS entry.

## 7. Deploy the web page on Vercel

The repository includes a root-level `vercel.json` for the React/Vite page. It builds the admin console as static files, sends `/api/*` requests to the current published API, and routes page paths back to the single-page app.

1. Push this repository to a Git provider supported by Vercel.
2. Import the repository as a Vercel project.
3. Set the **Root Directory** to the repository root (leave it at `.`), not `artifacts/drug-expiry-manager`.
4. Keep the build and output settings from `vercel.json`.
5. Deploy, then check the Vercel page and its `/api/healthz` route.

This first Vercel setup moves the **web page** to Vercel. The API and PostgreSQL data remain on the published Replit service, and Vercel forwards `/api` requests there without caching them. The API URL is a public deployment address, not a secret. If the API is later moved or its URL changes, update the destination in `vercel.json` and deploy again. The Chrome extension should be configured with the Vercel page's `/api` URL.

## 8. Source map

| Path | What it contains |
| --- | --- |
| `artifacts/drug-expiry-manager/src/pages/` | Dashboard, drug records, and extension setup screens |
| `artifacts/drug-expiry-manager/src/components/` | Shared console UI and drug form |
| `artifacts/drug-expiry-manager/public/extension/` | Chrome extension files |
| `artifacts/api-server/src/routes/drugs.ts` | Drug API endpoints |
| `artifacts/api-server/src/lib/drug-utils.ts` | Search matching and expiry status calculations |
| `lib/db/src/schema/drugs.ts` | PostgreSQL table definition |
| `lib/api-spec/openapi.yaml` | API contract used to generate the typed client and server validators |
| `vercel.json` | Vercel static build and API forwarding rules |

## 9. Safety and current limitations

- Drug records and API mutation routes do not currently require a signed-in admin. Add authentication and role checks before using this with sensitive business data or exposing admin access broadly.
- This Vercel deployment relies on the published Replit API and its database. It is not yet a full migration of the backend or data storage to Vercel.
- Use sample or non-sensitive records when teaching or demonstrating the app.