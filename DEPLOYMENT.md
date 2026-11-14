# Deployment

This project is an **Astro static site**. `astro build` writes a static bundle to `dist/`, and a tiny Node server (`server.mjs`, using only Node built-ins) serves it in production.

## Requirements

- **Node.js** 22.23.4 or newer and **npm** 9.6.5 or newer (Astro 7.4.7 package engines). Check the installed Astro version's engines if upgrading.
- Use a supported Node LTS release satisfying these requirements.

No extra runtime dependencies — `server.mjs` uses only `node:http`, `node:fs`, `node:path`, `node:url`.

## Install & build

```bash
npm ci        # reproducible install from package-lock.json
npm run build # astro build -> writes dist/
```

## Run (production)

```bash
npm start     # node server.mjs
```

The server:

- Binds to `0.0.0.0` and listens on `PORT` (**default `8080`**).
- Serves files from `dist/`.
- Supports `GET` and `HEAD` only (other methods → `405`).
- Resolves clean URLs to `dist/<route>/index.html` (Astro `build.format: "directory"`).
- Serves a static `404` page (`dist/404.html`) when present, otherwise plain-text 404.
- Rejects resolved files outside `dist/`, including symlink targets. Keep the build directory trusted and immutable while the server runs.

Set the port via environment variable if the platform injects one:

```bash
PORT=3000 npm start
```

## Local check

```bash
npm run build
PORT=8080 npm start
# open http://localhost:8080
```

## Koyeb (GitHub deploy)

Choose a buildpack or supply your own Dockerfile. Platform details below require verification on first deploy.

### Option A: Koyeb buildpack (Node) — recommended

1. Push this repo to GitHub.
2. In Koyeb: **Create Service → GitHub**, select the repo and branch.
3. **Builder**: Buildpack. **Run command**: `npm start`.
4. **Port**: set the service port to **8080** (matches the server's default). If Koyeb injects a `PORT` env var, `server.mjs` honors it automatically — set the service port to whatever that value is.
5. **Health check**: HTTP, path `/`, expecting `200`. (The site root always exists after a successful build.)
6. Deploy. Confirm build logs show dependency installation and `npm run build`, and confirm a Node version meeting the requirements. Configure explicit commands or use a Dockerfile if the buildpack does not do this.

### Option B: Dockerfile

If you prefer a container, add a `Dockerfile` that runs `npm ci && npm run build`, then `CMD ["npm", "start"]`, and set the Koyeb service port to `8080` (or the injected `PORT`).

### Commands the deployment must run (buildpack behavior unverified)

- Install: `npm ci`
- Build: `npm run build`
- Start: `npm start` (= `node server.mjs`)

## Publishing config

`astro.config.mjs` sets `site: 'https://kylixeza.my.id'` with `output: 'static'`. Deploying behind Koyeb's default `*.koyeb.app` domain works, but canonical/absolute URLs will reference `kylixeza.my.id`. Point your custom domain at Koyeb, or update `site` if the domain changes.

## Unverified platform assumptions (verify on first deploy)

These are implementation-time assumptions that were **not** confirmed against live Koyeb behavior:

- **That Koyeb's Node buildpack runs `npm run build` automatically.** Some platforms only run an install step. If `dist/` is missing at runtime, add an explicit build step or use the Dockerfile path (Option B).
- **Which port Koyeb exposes for a Node service.** Default here is `8080`; confirm the service's target port matches either `8080` or the injected `PORT` value.
- **Health-check path and timing.** Assumed `GET /` returns `200`; adjust if the platform probes a different path or expects a dedicated endpoint.
- **Static asset caching / CDN.** No cache headers are set by `server.mjs` (`dist/404` responses use `no-store`; everything else uses defaults). A platform edge cache in front of Koyeb is assumed to be safe for immutable `_astro/*` hashed assets but was not verified.
