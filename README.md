# Marketplace

## Render deployment

This project is ready to deploy as a Render static site.

Create a new Render Static Site from this repository with these settings:

- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Publish directory: `dist`
- Node version: `20` or newer

Set these environment variables in the Render dashboard under **Environment**:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The repo also includes a `render.yaml` file with a rewrite rule so direct visits to client-side routes like `/shop` or `/pricing` resolve to `index.html`.

## Local development

```bash
pnpm install
pnpm dev
```

## Production build

```bash
pnpm build
```