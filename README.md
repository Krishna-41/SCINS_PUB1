# SCINS MEDIA — scientific publishing platform

React + TypeScript + Vite + Tailwind, backed by Supabase (Postgres, Auth, Storage).

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-hqkxbwy7)

## Features
- Public site: journals, articles, issues, categories, books, conferences (registration + abstract submission), news, CMS pages, search, contact, newsletter
- Auth with role-based access (`super_admin`, `admin`, `editor`, `reviewer`, `author`, `reader`)
- Admin panel at `/admin`: dashboard, journals (+ editorial boards), articles (+ authors), issues, categories, books, conferences (+ speakers), news, CMS pages, media library, contact messages, newsletter (CSV export), users & roles, site settings

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and add your Supabase URL + anon key.
3. In the Supabase SQL editor (or `supabase db push`) run the files in `supabase/migrations/` **in order** (001 → 005).
4. Create the storage buckets `public-assets` (public) and `private-files` (private) — policies are in migration 004.
5. Sign up on the site, then promote yourself to the first super admin in the SQL editor:
   ```sql
   UPDATE profiles SET role = 'super_admin' WHERE email = 'you@example.com';
   ```
6. `npm run dev` → http://localhost:5173 — admin panel at `/admin`.

## Scripts
`npm run dev` · `npm run build` · `npm run typecheck` · `npm run lint`

## Security note
Migration 005 closes a privilege-escalation hole in 001 (users could previously set their own `role`). Apply it before going live.
