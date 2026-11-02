# My Note — daily journal

A quiet, Apple-inspired journal. Write the day down. Keep the streak. That's it.

```bash
npm install
npm run dev      # http://localhost:5173
```

| Env var          | Meaning                                                     |
| ---------------- | ----------------------------------------------------------- |
| `VITE_API_URL`   | Backend base URL. Empty = same origin (Vite proxies `/journal` to `127.0.0.1:8000`) |
| `VITE_USE_LOCAL` | `true` = run without a backend, entries live in localStorage |

Stack: Vite 8 · React 19 · Tailwind CSS v4 · Framer Motion · React Router.

---

## Live

| | |
|---|---|
| App | **https://daily-journal-magzhan2010.vercel.app** |
| API | `https://my-note-api.vercel.app/journal` |
| API repo | https://github.com/Magzhan2010/my-note-api (private) |

The API URL comes from the `VITE_API_URL` environment variable (a Vercel env
var in production, `.env.local` in development). Without it the app runs in
local mode and keeps entries in `localStorage`.

---

## Deploy

The frontend is a static site, the API is not — they live in different places.

```
frontend (static)  →  GitHub Pages  /  Vercel  /  Netlify
backend  (python)  →  Render  /  Railway  /  Fly.io
```

### GitHub Pages (already wired)

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.

1. **Settings → Pages → Build and deployment → Source: _GitHub Actions_**
2. Push to `main` — or **Actions → Deploy to GitHub Pages → Run workflow**
3. Live at `https://magzhan2010.github.io/DailyJournal/`

The build already handles the sub-folder: `BASE_PATH=/DailyJournal/` for the
assets, `basename` for the router, so deep links such as `/entries` work.

### Vercel instead

No Pages setup, no sub-folder, no CORS:

```bash
npm i -g vercel
vercel login
vercel --prod
```

`vercel.json` already contains the SPA rewrite. Add the API route as well by
pointing `/journal/:path*` at your backend (see `vercel.json`), or set
`VITE_API_URL` to the backend URL.

### Connect the API

1. Add the backend URL as a repository **secret** `VITE_API_URL`
   (Settings → Secrets and variables → Actions). The workflow passes it to the
   build. Without it the app runs in local mode.
2. The backend has to allow the frontend's origin, because Pages and the API
   are on different domains:

   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=['https://magzhan2010.github.io', 'http://localhost:5173'],
       allow_methods=['*'],
       allow_headers=['*'],
   )
   ```

---

## The app

| Route        | What it is                                       |
| ------------ | ------------------------------------------------ |
| `/`          | **Today** — date, one prompt, the editor, recent |
| `/new`       | **New entry** — the blue `+` button opens this    |
| `/entries`   | Every entry, with search                         |
| `/entry/:id` | Read / edit / delete one entry                   |

**Design notes**

- Type: real SF Pro on Apple devices (`-apple-system` first in the stack),
  Inter Variable everywhere else — locally bundled, no network request.
- Blue & white: `#0071e3` on `#ffffff`, Apple's system greys for surfaces.
- Motion, kept small: page fade-in, rows that stagger in, a soft blue wash in
  the corner, a button that presses. All of it collapses under
  `prefers-reduced-motion`.
- The editor autosaves ~1s after you stop typing, and says “Saved” when it does.
- Click the prompt to drop it into the entry as the first line.

### Structure

```
src/
├── App.jsx                 routes + layout
├── index.css               Tailwind theme (colours, type, motion)
├── lib/
│   ├── api.js              backend adapter + localStorage fallback
│   ├── constants.js        prompts, date helpers
│   ├── journal-context.js  context + useJournal hook
│   └── store.jsx           provider (entries, streak, save, delete)
├── components/
│   ├── Header.jsx          top bar + the blue + button
│   ├── Editor.jsx          title + text + save
│   └── EntryRow.jsx        one row in the list
└── pages/
    ├── Today.jsx
    ├── NewEntry.jsx
    ├── Entries.jsx
    └── EntryPage.jsx
```
