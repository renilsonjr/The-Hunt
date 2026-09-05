import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = (p: string) => resolve(process.cwd(), 'dist', p);

describe('build output', () => {
  it('emits an index.html', () => {
    expect(existsSync(dist('index.html'))).toBe(true);
  });

  it('sets the base path on built asset links', () => {
    const html = readFileSync(dist('index.html'), 'utf8');
    expect(html).toContain('/The-Hunt/');
  });
});
