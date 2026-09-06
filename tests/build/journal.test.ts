import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = (p: string) => resolve(process.cwd(), 'dist', p);
const html = (p: string) => readFileSync(dist(p), 'utf8');

describe('journal', () => {
  it('has an index in both locales', () => {
    expect(existsSync(dist('journal/index.html'))).toBe(true);
    expect(existsSync(dist('pt/journal/index.html'))).toBe(true);
  });

  it('lists the first entry and links to it', () => {
    expect(html('journal/index.html')).toContain('href="/The-Hunt/journal/2026-09-05-the-site-is-live/"');
  });

  it('builds the entry page in both locales', () => {
    expect(existsSync(dist('journal/2026-09-05-the-site-is-live/index.html'))).toBe(true);
    expect(existsSync(dist('pt/journal/2026-09-05-the-site-is-live/index.html'))).toBe(true);
  });

  it('shows the date on the index', () => {
    expect(html('journal/index.html')).toMatch(/2026/);
  });

  // The whole point of building both locales: the toggle must never 404.
  it('gives every entry a working language toggle', () => {
    const en = html('journal/2026-09-05-the-site-is-live/index.html');
    expect(en).toContain('<a class="lang" href="/The-Hunt/pt/journal/2026-09-05-the-site-is-live/"');
    const pt = html('pt/journal/2026-09-05-the-site-is-live/index.html');
    expect(pt).toContain('<a class="lang" href="/The-Hunt/journal/2026-09-05-the-site-is-live/"');
  });
});
