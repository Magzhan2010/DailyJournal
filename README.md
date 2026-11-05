# magishoit — daily journal

A LiveJournal-style daily journal. Raw markup, a B/I toolbar, and posts that
land in a journal you can read back.

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

| Route        | What it is                                          |
| ------------ | --------------------------------------------------- |
| `/`          | **Make a post** — the LiveJournal composer + recent entries |
| `/entries`   | **View journal** — every entry, searchable          |
| `/entry/:id` | One entry, read or edit                             |

**Design notes — the 2003 LiveJournal look**

- **"Post to _magishoit_"** in the SixApart steel blue, with the journal name in
  bold italic Georgia, exactly like the old post page.
- **Raw markup.** Posts are stored as HTML the way LiveJournal stored them, and
  the box opens with `<p><i>8:13pm</i>. ` already in it. `</p>` is closed for you
  when you post.
- **The B / I / smiley toolbar** actually wraps your selection in `<b>`, `<i>`
  or drops in a `:)`.
- **The grey Post button** with the blue up-arrow, top right.
- Square corners, 1px `#b8b8b8` frames, `Courier New` in the editor, a serif
  wordmark, and a footer that reads *"magishoit — powered by my note"*.
- Motion is deliberately minimal — it is a 2003 blog, not a dashboard.

The reading view renders the markup safely (only `p`, `i`, `b`, `em`, `br`, `a`
and friends survive; scripts and `on*` handlers do not).

### Structure

```
src/
├── App.jsx                 routes + layout
├── index.css               the LiveJournal theme (colours, type, chrome)
├── lib/
│   ├── api.js              backend adapter + localStorage fallback
│   ├── constants.js        prompts, date helpers
│   ├── journal-markup.js   the <p><i>time</i>. prefix and emptiness check
│   ├── journal-context.js  context + useJournal hook
│   ├── sanitize.js         keeps the raw markup safe to render
│   └── store.jsx           provider (entries, streak, save, delete)
├── components/
│   ├── SiteHeader.jsx      magishoit + "Make a post / View journal"
│   ├── PostComposer.jsx    the post box with the B / I toolbar
│   ├── JournalPost.jsx     one entry in the journal
│   └── Logo.jsx            the mashup mark (Apple, Meta, NVIDIA, Claude, Google, Codex)
└── pages/
    ├── Today.jsx           make a post + recent entries
    ├── Entries.jsx         the whole journal
    └── EntryPage.jsx       one entry
```
