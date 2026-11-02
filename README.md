# my-note · frontend

The React app lives here — see [`../README.md`](../README.md) for the full setup
(backend, API contract, design notes).

```bash
npm install
npm run dev      # http://localhost:5173
```

| Env var          | Meaning                                                    |
| ---------------- | ---------------------------------------------------------- |
| `VITE_API_URL`   | Backend base URL. Empty = same origin (Vite proxies `/journal` to `127.0.0.1:8000`) |
| `VITE_USE_LOCAL` | `true` = run without a backend, entries live in localStorage |

Stack: Vite 8 · React 19 · Tailwind CSS v4 · Framer Motion · React Router.
