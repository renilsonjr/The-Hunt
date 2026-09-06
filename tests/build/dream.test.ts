import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('dream log', () => {
  it('exists in both locales', () => {
    expect(html('dream/index.html')).toContain('goose');
    expect(html('pt/dream/index.html')).toContain('goose');
  });

  it('keeps the original English text on the Portuguese route', () => {
    // The artifact is one person's own words; the PT page frames it, it does
    // not replace it.
    const pt = html('pt/dream/index.html');
    expect(pt).toContain('Hans');
    expect(pt).toMatch(/documento original|texto original/i);
  });

  it('frames the log as a recovered document rather than as fiction', () => {
    expect(html('dream/index.html')).toMatch(/08\/26\/26|2026-08-26/);
  });

  it('is reachable from the footer', () => {
    expect(html('index.html')).toContain('href="/The-Hunt/dream/"');
  });
});
