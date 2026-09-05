import { getViteConfig } from 'astro/config';
import { resolve } from 'node:path';

// getViteConfig — not plain defineConfig — so that Astro's own Vite plugins load.
// Task 4 imports .jpg files and reads their width/height; only Astro's image
// plugin turns an image import into ImageMetadata. With plain Vitest those
// imports resolve to a bare URL string and every dimension assertion fails.
export default getViteConfig({
  resolve: { alias: { '~': resolve(process.cwd(), 'src') } },
  test: { include: ['tests/**/*.test.ts'] },
});
