import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://renilsonjr.github.io',
  base: '/The-Hunt',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
