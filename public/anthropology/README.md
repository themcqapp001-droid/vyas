# Anthropology With DJ Sir — Anthropology Optional site + content admin

## What's here
- `index.html` — the public site. Loads its copy from `content.json` at startup;
  if that file is unreachable it falls back to the text already written in the HTML.
- `content.json` — every editable piece of text on the site: hero copy, the evolution
  timeline, Paper I units, Paper II entries, test series phases, and testimonials.
- `admin.html` — the backend channel: a password-protected page where you add/edit
  all of the above without touching code.
- `server.js` — a small Express server that serves the site and exposes:
  - `GET /api/content` — public, returns the current content
  - `POST /api/content` — protected, overwrites content.json (used by admin.html)

## Run it locally
```
npm install
ADMIN_PASSWORD=pick-a-real-password npm start
```
Then open:
- `http://localhost:3000` — the live site
- `http://localhost:3000/admin.html` — the content editor

## Put it online
Any Node host works (Render, Railway, Fly.io, a basic VPS). Steps are the same everywhere:
1. Push this folder to a git repo.
2. Deploy it as a Node service with start command `npm start`.
3. Set an environment variable `ADMIN_PASSWORD` to a real password in the host's dashboard —
   don't leave the default `change-me-now`.
4. Visit `yourdomain.com/admin.html` any time you want to add notes or edit copy.

## How editing works
1. Open `/admin.html` and enter the admin password.
2. Edit any section — hero text, evolution layers, Paper I/II content, test series
   phases, or testimonials. Use "+ Add" to add a new card to any list, "×" to remove one.
3. Click **Save All Changes**. This writes straight to `content.json` on the server
   (a backup of the previous version is kept automatically as `content.backup.json`).
4. Refresh the public site to see the update — no redeploy needed.

## Notes on this setup
- Auth is a single shared password, which is enough for one or two people managing
  content. If more people need separate logins later, that's a bigger change (real
  user accounts + a database) — worth doing once you have a team, not before.
- Content lives in a flat JSON file, not a database. That's intentional: it's simple,
  fully readable, and easy to back up — fine for a site this size. If it later grows
  into hundreds of notes/articles, migrating to a real database (Postgres, etc.)
  is a natural next step.
