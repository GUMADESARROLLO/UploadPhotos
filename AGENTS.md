# Wedding Photos (Álbum Compartido de Boda)

Astro 6 SSR app (`@astrojs/node` standalone adapter) + Tailwind CSS 4. Dual-storage photo sharing: IndexedDB (offline-first) + server file store.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build

## Architecture

- **Server output**: all routes are SSR (no static generation). At runtime the Node adapter serves everything.
- **Dual-store sync**: `public/js/db.js` (v2) is the client-side IndexedDB wrapper used by all page scripts. The server stores files in `uploads/` and metadata in `uploads/meta.json`. After saving to IndexedDB, pages opportunistically sync to the server via fetch (no blocking on failure).
- **Offline**: Service Worker (`public/sw.js`) caches app shell (`/`, `/upload`, `/albums`, `/album`, `/js/db.js`). No stale-while-revalidate — network-first for navigations, cache-first for assets.
- **Auth**: email + name stored in `localStorage` as `wedding_user` / `wedding_email`. No passwords, no server auth.
- **API routes**: `src/pages/api/upload.ts` (POST multipart), `users.ts` (GET), `photos/[user].ts` (GET), `file/[user]/[name].ts` (GET file serve).
- **Tailwind theme**: custom colors `wedding-gold`, `wedding-rose`, `wedding-cream`, `wedding-dark` defined in `src/styles/global.css` via `@theme` directive.
- **Locale**: all UI in Spanish (`lang="es"`).

## Key quirks

- There are two separate `db.js` files: `src/lib/db.js` (server-side, unused — looks like a stale copy) and `public/js/db.js` (the real client-side module imported by page scripts). Only edit `public/js/db.js` for client DB logic.
- Uploads directory `uploads/` is git-ignored (no `.gitignore` file exists but shouldn't commit user photos). `dist/` and `node_modules/` should also be ignored.
- No tests, no linting, no typecheck scripts configured.
