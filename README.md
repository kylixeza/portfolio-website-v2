# Kylix Portfolio

Personal portfolio and resume site for **Kylix Eza Saputra** (Mobile Developer), built as an [Astro](https://astro.build) static site and served in production with a zero-dependency Node static server.

Live URL configured in `astro.config.mjs`: `https://kylixeza.my.id`

## Stack

- **Framework:** Astro `^7.4.7` (`output: 'static'`)
- **Styling & Interactivity:** Plain CSS (`src/styles/portfolio.css`) and inline vanilla JS
- **Production Server:** `server.mjs` using only Node built-ins (`node:http`, `node:fs`, `node:path`, `node:url`)

## Requirements

- **Node.js:** `24.x` (`package.json` `engines`) — minimum `22.23.4` for Astro 7.4.7
- **npm:** `9.6.5` or newer

## Getting Started

```bash
npm ci
npm run dev
```

Open `http://localhost:4321` in your browser.

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Astro dev server |
| `npm run build` | Build static output into `dist/` |
| `npm run preview` | Preview built site via Astro CLI |
| `npm start` | Serve `dist/` with `node server.mjs` (default port `8080`, override via `PORT`) |
| `node server.selfcheck.mjs` | Verify `server.mjs` routing and path-traversal guards |

## Project Structure

```text
.
├── astro.config.mjs      # Astro config (site URL, static output)
├── server.mjs            # Minimal static HTTP server for dist/
├── server.selfcheck.mjs  # Standalone self-check for server.mjs
├── src/
│   ├── pages/
│   │   ├── index.astro   # Main split-stage portfolio page
│   │   ├── cv.astro      # Printable CV route (/cv)
│   │   └── 404.astro     # Static 404 page
│   └── styles/
│       └── portfolio.css # Design tokens, layout, responsive rules
├── public/
│   ├── docs/cv.pdf       # Downloadable CV PDF
│   ├── images/           # Project screenshots and assets
│   └── favicon.svg
├── DESIGN.md             # Visual direction and layout notes
└── DEPLOYMENT.md         # Production server and Koyeb deployment guide
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production server behavior, environment variables, and Koyeb deployment steps.
