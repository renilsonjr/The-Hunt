import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync, statSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ART_IDS } from '~/data/art';

const assetsDir = resolve(process.cwd(), 'dist', '_astro');
const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('image pipeline', () => {
  it('emits optimized derivatives', () => {
    expect(existsSync(assetsDir)).toBe(true);
    const files = readdirSync(assetsDir);
    expect(files.some((f) => f.endsWith('.avif')), 'avif emitted').toBe(true);
    expect(files.some((f) => f.endsWith('.webp')), 'webp emitted').toBe(true);
  });

  it('emits an avif and a webp derivative for every plate, not just for some', () => {
    // `some(...)` above passes if a single plate is optimized. Astro ships a
    // raw copy of any manifest image that no page renders, so a regression
    // here is per-plate: ten plates could silently revert while two keep the
    // suite green. Derivative filenames keep the source basename, which is the
    // manifest id, so each plate can be checked by name.
    const gallery = html('gallery/index.html');
    for (const id of ART_IDS) {
      expect(gallery, `${id}: no avif derivative referenced`).toMatch(
        new RegExp(`/${id}\\.[\\w-]+\\.avif`),
      );
      expect(gallery, `${id}: no webp derivative referenced`).toMatch(
        new RegExp(`/${id}\\.[\\w-]+\\.webp`),
      );
    }
  });

  it('does not ship an original multi-megabyte jpeg', () => {
    // The exact invariant, not a proxy for it. Astro's sharp service always
    // writes optimized output with a `.jpeg` extension; Vite emits an
    // *unprocessed original* under its own extension, and every source in
    // src/assets/art is a `.jpg`. So a `.jpg` in dist/_astro IS a leaked
    // original — there is no other way for one to appear — and this holds no
    // matter how small a future source image is.
    const leakedOriginals = readdirSync(assetsDir).filter((f) => f.endsWith('.jpg'));
    expect(leakedOriginals, 'raw source originals leaked into dist/_astro').toEqual([]);

    // Secondary backstop, in case a future Astro version changes that
    // extension convention: any raw original would be at least as large as the
    // smallest source file, so every shipped jpeg must be strictly smaller.
    const sourceDir = resolve(process.cwd(), 'src', 'assets', 'art');
    const sources = readdirSync(sourceDir)
      .filter((f) => /\.(jpe?g)$/.test(f))
      .map((f) => statSync(resolve(sourceDir, f)).size);
    const smallestSource = Math.min(...sources);

    const files = readdirSync(assetsDir).filter((f) => /\.(jpe?g)$/.test(f));
    for (const f of files) {
      const bytes = statSync(resolve(assetsDir, f)).size;
      expect(
        bytes,
        `${f} (${bytes} bytes) is >= smallest source ${smallestSource} bytes`
      ).toBeLessThan(smallestSource);
    }
  });
});
