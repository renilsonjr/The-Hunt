import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = (p: string) => resolve(process.cwd(), 'dist', p);

describe('legacy urls', () => {
  it('still serves the concept page at its published path', () => {
    expect(existsSync(dist('concepts/worlds-of-the-hunt.html'))).toBe(true);
  });

  it('serves the concept page unmodified', () => {
    // The published concept page is ~1.95MB of self-contained HTML with inlined art.
    const bytes = statSync(dist('concepts/worlds-of-the-hunt.html')).size;
    expect(bytes).toBeGreaterThan(1_500_000);
  });
});
