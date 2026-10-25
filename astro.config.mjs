import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { createHash } from 'node:crypto';
import { JS_FLAG } from './src/lib/js-flag.mjs';

const sha256 = (text) => `sha256-${createHash('sha256').update(text).digest('base64')}`;

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://abazhur.example',
  // GitHub Pages serves the site from /<repo>/; the deploy workflow passes that prefix.
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  // The dev toolbar sits under the sticky mobile bar and Safari's bottom UI, and is dev-only anyway.
  devToolbar: { enabled: false },
  // Astro 7 defaults to JSX whitespace rules, which glue Russian words around inline links.
  compressHTML: true,
  markdown: { syntaxHighlight: false },
  // Small font subsets would be inlined as data: URLs, which font-src 'self' blocks; keep them as files.
  vite: { build: { assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined) } },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-src 'none'",
        "worker-src 'none'",
        "manifest-src 'self'",
      ],
      scriptDirective: { resources: ["'self'"], hashes: [sha256(JS_FLAG)] },
      styleDirective: { resources: ["'self'"] },
    },
  },
});
