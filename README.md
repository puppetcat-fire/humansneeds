# INeedThis

An anonymous demand atlas for the AI era.

Users submit two things:

- `Who am I?`
- `What do I need?`

The app clusters repeated needs into public signals, then updates the ranking, detail pages, and vote counts.

## Current Mode

The current default build is:

- anonymous submission
- no login
- local SQLite persistence
- seeded starter data on first boot

That means the app can already do real local writes without any third-party service:

- submit a new anonymous need
- merge it into a cluster
- show it on the ranking page
- open the detail page
- vote
- mark/report a raw submission
- enforce per-IP write cooldowns

Local database file:

- `data/ineedthis-local.sqlite`

## Stack

- Next.js App Router
- Tailwind CSS
- better-sqlite3 for local persistence
- optional Supabase + OpenAI path for cloud clustering later

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Health And Runtime Endpoints

- `GET /api/health`
- `GET /robots.txt`
- `GET /sitemap.xml`

## Smoke Tests

The smoke script verifies:

- home / ranking / manifesto return `200`
- health endpoint returns `ok`
- `robots.txt` and `sitemap.xml` are present
- language cookie switch works
- anonymous submit succeeds
- immediate repeat submit is rate-limited
- global write cooldown blocks mixed actions from the same IP
- vote cooldown works
- duplicate vote is detected after cooldown
- mark/report cooldown works
- duplicate mark/report is detected after cooldown

Run it against a running local server:

```bash
npm run smoke
```

Or against another base URL:

```bash
SMOKE_BASE_URL=http://127.0.0.1:3000 npm run smoke
```

## Optional Cloud Backend

If you later want to switch to the Supabase + OpenAI path, create `.env.local` with:

```bash
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_ENABLE_AUTH_UI=false
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

Then run the SQL in:

- `supabase/schema.sql`

Notes:

- `NEXT_PUBLIC_ENABLE_AUTH_UI=false` keeps the current anonymous no-login version.
- `SUPABASE_SERVICE_ROLE_KEY` is only for server-side writes.
- `OPENAI_API_KEY` is only needed for the cloud embedding path.

## Linux / Docker

### Linux VM / VPS

```bash
npm ci
npm run build
npm run start
```

The server must be able to write to:

- `data/`

### Docker

Build:

```bash
docker build -t ineedthis .
```

Run:

```bash
docker run --rm -p 3000:3000 -v %cd%/data:/app/data ineedthis
```

On Linux/macOS replace `%cd%` with `$(pwd)`.

## Deployment (humansneeds.com/needs/)

The app is served at <https://humansneeds.com/needs/> from the same host as the personal site, with `basePath: "/needs"` and `distDir: ".next-needs"` (see `next.config.ts`).

- Live checkout: `/opt/humansneeds` is a symlink to one release directory under `/opt/humansneeds-releases/`
- Data: `/var/lib/humansneeds-needs/data`; every release gets a `data` symlink to it, so redeploying never touches the SQLite database
- Service: `ineedthis-needs.service`, `next start -p 3200 -H 127.0.0.1`, reverse-proxied by nginx under `/needs`

Merging into `main` deploys automatically. `humansneeds-needs-deploy.timer` checks `origin/main` every two minutes, installs a fresh release directory, builds it, and only then moves the symlink and restarts the service, so the running build keeps serving during the build. If `/needs` does not answer after the restart, the symlink goes back to the previous release.

```bash
systemctl start humansneeds-needs-deploy.service   # deploy now
journalctl -u humansneeds-needs-deploy -n 50       # what happened
```

To roll back, revert the pull request on GitHub; the next poll redeploys the reverted tree.

## Verification

```bash
npm run lint
npm run build
npm run smoke
```
