# Sudeis Fedlu — Portfolio

Full-stack developer portfolio built with React, Vite, Express, Tailwind CSS, and optional Supabase / Cloudinary integrations.

## Features

- Public portfolio site with hero, about, services, experience, projects, and contact form
- Admin CMS at `#admin` with server-side session authentication
- Optional Supabase persistence for portfolio content and inquiries
- Optional Cloudinary uploads for images and videos
- Gemini-powered resume builder (admin only)

## Prerequisites

- Node.js 20+
- npm

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and set at minimum:

   - `ADMIN_EMAIL` and `ADMIN_PASSCODE` — admin login credentials
   - `ADMIN_SESSION_SECRET` — long random string for signing sessions
   - `GEMINI_API_KEY` — if you want AI resume features
   - `SUPABASE_*` and `CLOUDINARY_*` — optional, for persistent storage and uploads

4. Run locally:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Admin panel: [http://localhost:3000/#admin](http://localhost:3000/#admin).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Vite + Express) |
| `npm run build` | Build frontend and bundle server |
| `npm start` | Run production server |
| `npm run lint` | TypeScript type check |

## Docker

```bash
docker compose up --build
```

Ensure `.env` is present or configure environment variables in `docker-compose.yml`.

## Deployment

### Vercel

1. Connect the repository to Vercel
2. Set environment variables in the Vercel project dashboard (see `.env.example`):
   - **Required:** `ADMIN_EMAIL`, `ADMIN_PASSCODE`, `ADMIN_SESSION_SECRET`
   - **Optional:** `GEMINI_API_KEY`, `SUPABASE_*`, `CLOUDINARY_*`
   - `VITE_APP_URL` — set to `https://sudeisfedlu.et` on Vercel (overrides `VERCEL_URL` for OG/social previews)
3. Build command: `npm run build` (configured in `vercel.json`)
4. `api/index.ts` re-exports the Express app; `vercel.json` routes `/api/*` to it

### VPS / Docker

Use the included `Dockerfile` and `docker-compose.yml` with `NODE_ENV=production`.

## Security notes

- Admin routes require a signed httpOnly session cookie
- Portfolio write APIs, uploads, and inquiry management are admin-only
- Change default `ADMIN_PASSCODE` and `ADMIN_SESSION_SECRET` before going live
- Do not expose Supabase service role keys in the frontend
