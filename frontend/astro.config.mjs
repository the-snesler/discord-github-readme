import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

// Output the built site directly into the repo-root `public/` directory
// so the existing Express server (`src/app.ts`) can serve it as static assets.
export default defineConfig({
  outDir: '../public',
  // The repo-root `public/` already contains files we DO NOT want Astro to wipe
  // (favicon.svg, etc.). Astro copies its own `frontend/public/` over the build
  // output, and `outDir` overwrite is controlled by the `build.assets` prefix
  // so JS/CSS go to `_astro/` (default) — safe to coexist.
  build: {
    assets: '_astro',
  },
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // During `astro dev`, proxy /api/* to the Express server on :3000 so the
      // form can hit the real Discord bot endpoints without CORS gymnastics.
      proxy: {
        '/api': 'http://localhost:3000',
      },
    },
  },
});
