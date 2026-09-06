import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { t } from '~/i18n/ui';

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

  // Frontmatter dates are bare calendar days parsed as UTC midnight. Rendered
  // without an explicit zone they shift a day on any build machine west of
  // Greenwich, so the visible date contradicts the same element's `datetime`
  // and the entry page's eyebrow. Asserting the exact day in both locales is
  // the only version of this test that can catch that.
  it('shows the entry\'s actual date on the index, in each locale', () => {
    expect(html('journal/index.html')).toContain('September 5, 2026');
    expect(html('pt/journal/index.html')).toContain('5 de setembro de 2026');
  });

  it('agrees with its own datetime attribute', () => {
    const en = html('journal/index.html');
    expect(en).toMatch(/<time datetime="2026-09-05"[^>]*>\s*September 5, 2026\s*<\/time>/);
    const pt = html('pt/journal/index.html');
    expect(pt).toMatch(/<time datetime="2026-09-05"[^>]*>\s*5 de setembro de 2026\s*<\/time>/);
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

  it('gives the entry absolute hreflang alternates pointing at the two entry pages, not the two indexes', () => {
    const site = 'https://renilsonjr.github.io/The-Hunt';
    const entry = '2026-09-05-the-site-is-live';
    for (const page of [`journal/${entry}/index.html`, `pt/journal/${entry}/index.html`]) {
      const doc = html(page);
      expect(doc).toContain(`<link rel="alternate" hreflang="en" href="${site}/journal/${entry}/">`);
      expect(doc).toContain(`<link rel="alternate" hreflang="pt-BR" href="${site}/pt/journal/${entry}/">`);
    }
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

/**
 * The phase's headline promise, verified end to end in built output rather
 * than only as a pure function over fixtures.
 *
 * The fixture is honest: src/content/journal/en/2026-09-06-three-more-rooms.md
 * ships with no Portuguese counterpart, deliberately, because the site will
 * genuinely have English-only posts. Do not "fix" that by translating it —
 * its absence is what these tests measure. If it is ever translated, replace
 * it here with whatever untranslated entry has taken its place.
 */
describe('missing translation', () => {
  const untranslated = '2026-09-06-three-more-rooms';
  const translated = '2026-09-05-the-site-is-live';
  const notice = t('notice.fallback', 'pt');

  it('builds a Portuguese page for an entry that exists only in English', () => {
    // Otherwise the language toggle on the English entry is a 404.
    expect(existsSync(dist(`pt/journal/${untranslated}/index.html`))).toBe(true);
  });

  it('says so, in Portuguese, rather than serving English in silence', () => {
    const pt = html(`pt/journal/${untranslated}/index.html`);
    expect(pt).toContain(notice);
    // And it really is serving the English original underneath.
    expect(pt).toContain('scaffolding');
  });

  it('does not cry fallback on the English original itself', () => {
    expect(html(`journal/${untranslated}/index.html`)).not.toContain(
      t('notice.fallback', 'en'),
    );
  });

  it('does not cry fallback on an entry that is fully translated', () => {
    expect(html(`pt/journal/${translated}/index.html`)).not.toContain(notice);
  });

  it('leaves the notice off pages whose prose is translated', () => {
    // ProsePage carries the same wiring; with full prose parity today it must
    // stay silent, so an always-on notice cannot pass as a fix.
    expect(html('pt/codex/index.html')).not.toContain(notice);
    expect(html('pt/dream/index.html')).not.toContain(notice);
  });
});
