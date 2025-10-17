# nuxt3_FE_Fleava-test

This repository is a small Nuxt 3 frontend used for evaluation. This README explains how a reviewer can run the project locally after cloning.

## Quick overview
- Nuxt config sets `srcDir` to `app` (source files are in the `app/` folder).
- Runtime config expects a TMDB API key (`TMDB_API_KEY`) and provides a public image base URL.
- Dev tools and TypeScript type checking are disabled in the config for a simpler local run.

## Requirements
- Node.js (recommended: Node 18+)
- Or alternatively Bun (a `bun.lock` file is present)
- A TMDB API key (get one from https://www.themoviedb.org/documentation/api)

## Getting started (clone & run)

1. Clone the repo
```bash
git clone https://github.com/naikoo-cmd/nuxt3_FE_Fleava-test.git
cd nuxt3_FE_Fleava-test
```

2. Install dependencies (choose any here im using bun)
```bash
# bun
bun install
```

3. Provide environment variable(s)
Create a `.env` file in the project root or export the variable in your shell. At minimum set:

```
TMDB_API_KEY=your_tmdb_api_key_here
```

Note: the app reads `process.env.TMDB_API_KEY` (configured in `nuxt.config.ts`).

4. Start the dev server
```bash
# bun
bun run dev
```

The app will be available at http://localhost:3000 by default.

## Configuration notes for reviewers
- Source folder: `app/` (not the default `pages` root)
- Runtime config (see `nuxt.config.ts`):
  - `tmdbApiKey` is read from `process.env.TMDB_API_KEY`
  - `tmdbBaseUrl` is set to `https://api.themoviedb.org/3`
  - `public.tmdbImageBase` is `https://image.tmdb.org/t/p`
- TypeScript type checking is disabled to avoid extra CI/tool noise:
```ts
typescript: { typeCheck: false }
```
- Devtools are disabled in config to prevent socket issues:
```ts
devtools: { enabled: false }
```

## Common troubleshooting
- If you see dependency errors, remove `node_modules` and lockfile then reinstall:
```bash
rm -rf node_modules
# remove one of: package-lock.json, pnpm-lock.yaml, yarn.lock, bun.lock (if you want a fresh lock)
npm install
```
- If environment variables are not picked up, ensure `.env` is in the project root or start the process with the variable prefixed:
```bash
TMDB_API_KEY=xxx npm run dev
```
- If port 3000 is in use, run with a different port:
```bash
PORT=4000 npm run dev
```

## Notes
- This project uses Nuxt 3.19.3 and Vue 3.
- ```Sass``` embedded is included as a dev dependency if styles need it.

If you want this README adjusted (more details, screenshots, or specific review checklist items), tell me what to add and I'll update it.


Thankyou so much for your review!