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
      //
      // /read/ is excluded for a different reason: the first draft published
      // there is being replaced, so it is unlisted rather than deleted. The
      // pages still build and still resolve; they are not advertised, and they
      // carry noindex. Delete the second clause to re-list them.
      filter: (page) => !page.includes('/404') && !page.includes('/read'),
      // Emits xhtml:link alternates so crawlers learn each page's counterpart
      // in the other language, rather than treating the two as duplicates.
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', pt: 'pt-BR' },
      },
    }),
  ],
});
