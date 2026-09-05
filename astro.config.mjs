import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://renilsonjr.github.io',
  base: '/The-Hunt',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // The 404 page exists for GitHub Pages to serve on unmatched paths; it
      // is not a destination and must not be advertised as one.
      filter: (page) => !page.includes('/404'),
      // Emits xhtml:link alternates so crawlers learn each page's counterpart
      // in the other language, rather than treating the two as duplicates.
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', pt: 'pt-BR' },
      },
    }),
  ],
});
