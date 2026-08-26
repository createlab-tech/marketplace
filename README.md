# Marketplace

## Cloudflare Pages

Create a Pages project from this repository with the following settings:

- Framework preset: `Vite`
- Build command: `pnpm build`
- Build output directory: `dist`
- Node.js version: `20` or newer
- Deploy command: leave blank when using Pages Git integration

If using a custom deploy command, use `pnpm run deploy:pages` after the build. The script includes the Pages project name. Do not use `npx wrangler deploy`, which deploys a Workers application and requires a newer Vite integration.

For a custom deploy command, add a `CLOUDFLARE_API_TOKEN` secret to the build environment. The token must belong to the account that owns the project and have **Account > Cloudflare Pages > Edit** permission. The token is separate from the public `VITE_*` variables below.

Add these variables in the Pages project under **Settings > Environment variables** for both Preview and Production:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The `public/_redirects` file keeps direct visits and refreshes on client-side routes working on Pages.

## Local development

```bash
pnpm install
pnpm dev
```

To deploy manually with Wrangler:

```bash
pnpm build
pnpm run deploy:pages
```