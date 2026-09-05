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
    const files = readdirSync(assetsDir).filter((f) => /\.(jpe?g)$/.test(f));
    for (const f of files) {
      const bytes = statSync(resolve(assetsDir, f)).size;
      expect(bytes, `${f} is too large`).toBeLessThan(400_000);
    }
  });
});
