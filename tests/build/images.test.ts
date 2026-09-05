import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const assetsDir = resolve(process.cwd(), 'dist', '_astro');

describe('image pipeline', () => {
  it('emits optimized derivatives', () => {
    expect(existsSync(assetsDir)).toBe(true);
    const files = readdirSync(assetsDir);
    expect(files.some((f) => f.endsWith('.avif')), 'avif emitted').toBe(true);
    expect(files.some((f) => f.endsWith('.webp')), 'webp emitted').toBe(true);
  });

  it('does not ship an original multi-megabyte jpeg', () => {
    // Read source originals and find the smallest to use as threshold.
    // Any raw original that leaked into the build would be at least as large
    // as the smallest source file, so this detects the real defect without
    // a magic number that drifts with each new plate added.
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
