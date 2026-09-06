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

  // An entry's canonical/hreflang must point at itself, not the journal
  // index — otherwise every entry tells crawlers it's a duplicate of the
  // index rather than a page in its own right.
  it('gives the entry its own canonical URL, not the index\'s', () => {
    const en = html('journal/2026-09-05-the-site-is-live/index.html');
    expect(en).toContain(
      '<link rel="canonical" href="https://renilsonjr.github.io/The-Hunt/journal/2026-09-05-the-site-is-live/">'
    );
    const pt = html('pt/journal/2026-09-05-the-site-is-live/index.html');
    expect(pt).toContain(
      '<link rel="canonical" href="https://renilsonjr.github.io/The-Hunt/pt/journal/2026-09-05-the-site-is-live/">'
    );
  });

  it('gives the entry hreflang alternates that point at the two entry pages, not the two indexes', () => {
    const en = html('journal/2026-09-05-the-site-is-live/index.html');
    expect(en).toContain('<link rel="alternate" hreflang="en" href="/The-Hunt/journal/2026-09-05-the-site-is-live/">');
    expect(en).toContain('<link rel="alternate" hreflang="pt-BR" href="/The-Hunt/pt/journal/2026-09-05-the-site-is-live/">');

    const pt = html('pt/journal/2026-09-05-the-site-is-live/index.html');
    expect(pt).toContain('<link rel="alternate" hreflang="en" href="/The-Hunt/journal/2026-09-05-the-site-is-live/">');
    expect(pt).toContain('<link rel="alternate" hreflang="pt-BR" href="/The-Hunt/pt/journal/2026-09-05-the-site-is-live/">');
  });

  // Proves the default-to-`route` behaviour still holds for every ordinary
  // static page: its canonical must remain its own URL, unaffected by the
  // pagePath plumbing added for dynamic routes like the journal.
  it('leaves a static page\'s canonical URL unaffected', () => {
    const gods = html('gods/index.html');
    expect(gods).toContain('<link rel="canonical" href="https://renilsonjr.github.io/The-Hunt/gods/">');
  });

  // Reading an entry should still highlight "Journal" in the nav, not
  // nothing and not some other link — that's keyed on `route`, not the
  // entry's own pagePath.
  it('still marks Journal as the current nav item on an entry page', () => {
    const en = html('journal/2026-09-05-the-site-is-live/index.html');
    expect(en).toMatch(/<a href="\/The-Hunt\/journal\/"[^>]*aria-current="page"/);
  });
});
