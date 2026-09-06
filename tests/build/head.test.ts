import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

/** Astro emits global.css as a hashed asset; read whichever CSS file holds the tokens. */
const allCss = (): string => {
  const dir = resolve(process.cwd(), 'dist', '_astro');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(resolve(dir, f), 'utf8'))
    .join('\n');
};

describe('document head', () => {
  it('sets the html lang attribute per locale', () => {
    expect(html('index.html')).toMatch(/<html[^>]+lang="en"/);
    expect(html('pt/index.html')).toMatch(/<html[^>]+lang="pt-BR"/);
  });

  // hreflang hrefs must be fully qualified: Google's spec requires absolute
  // URLs and silently discards relative ones, so a relative alternate is not
  // a weaker annotation, it is no annotation at all.
  it('emits absolute hreflang alternates pointing at both locales', () => {
    const doc = html('index.html');
    expect(doc).toContain(
      '<link rel="alternate" hreflang="en" href="https://renilsonjr.github.io/The-Hunt/">'
    );
    expect(doc).toContain(
      '<link rel="alternate" hreflang="pt-BR" href="https://renilsonjr.github.io/The-Hunt/pt/">'
    );
  });

  it('leaves no relative hreflang href on any page', () => {
    for (const page of ['index.html', 'pt/index.html', 'codex/index.html', 'pt/codex/index.html']) {
      const relative = html(page).match(/<link rel="alternate"[^>]*href="\/[^"]*"/g);
      expect(relative, `${page} has relative hreflang hrefs: ${relative}`).toBeNull();
    }
  });

  it('emits a canonical url', () => {
    expect(html('index.html')).toContain(
      '<link rel="canonical" href="https://renilsonjr.github.io/The-Hunt/"'
    );
  });

  it('has a non-empty title and description', () => {
    const doc = html('index.html');
    expect(doc).toMatch(/<title>.+<\/title>/);
    expect(doc).toMatch(/<meta name="description" content=".{20,}"/);
  });

  it('defines the palette tokens in the emitted stylesheet', () => {
    const css = allCss();
    expect(css).toMatch(/--void:\s*#0a0b12/);
    expect(css).toMatch(/--zalian:\s*#e8c873/);
    expect(css).toMatch(/--balian:\s*#9b6bf0/);
  });

  it('paints an explicit background on body rather than inheriting one', () => {
    expect(allCss()).toMatch(/body\{[^}]*background:var\(--void\)/);
  });

  it('links a favicon so no page 404s on /favicon.ico', () => {
    expect(html('index.html')).toContain('<link rel="icon" type="image/svg+xml" href="/The-Hunt/favicon.svg"');
  });

  it('emits an x-default alternate for readers whose language matches neither', () => {
    // Without it, a crawler has no instruction for, say, a French reader.
    // x-default points at the default locale.
    const doc = html('index.html');
    expect(doc).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://renilsonjr.github.io/The-Hunt/">'
    );
  });

  it('points x-default at the journal entry itself, not the journal index', () => {
    // Journal entries live at journal/<slug> while their nav route is
    // "journal" — x-default must follow the entry's own pagePath like
    // canonical and the other alternates do, not fall back to the index.
    const doc = html('journal/2026-09-05-the-site-is-live/index.html');
    expect(doc).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://renilsonjr.github.io/The-Hunt/journal/2026-09-05-the-site-is-live/">',
    );
  });
});

describe('social sharing metadata', () => {
  // A link pasted into WhatsApp, Discord or Twitter should render as a card
  // with the key art, not as bare text. Crawlers do not resolve relative URLs,
  // so og:image must be absolute.
  it('emits an absolute og:image pointing at a real built file', () => {
    const doc = html('index.html');
    const match = doc.match(/<meta property="og:image" content="([^"]+)"/);
    expect(match, 'og:image is missing').not.toBeNull();

    const url = match![1];
    expect(url).toMatch(/^https:\/\/renilsonjr\.github\.io\/The-Hunt\//);

    // The URL must correspond to a file the build actually emitted.
    const path = url.replace('https://renilsonjr.github.io/The-Hunt/', '');
    expect(
      existsSync(resolve(process.cwd(), 'dist', path)),
      `og:image points at ${path}, which the build did not emit`,
    ).toBe(true);
  });

  it('describes the og:image for people who cannot see it', () => {
    expect(html('index.html')).toMatch(/<meta property="og:image:alt" content=".{20,}"/);
  });

  it('localizes the og:image alt text', () => {
    const en = html('index.html').match(/<meta property="og:image:alt" content="([^"]+)"/)![1];
    const pt = html('pt/index.html').match(/<meta property="og:image:alt" content="([^"]+)"/)![1];
    expect(pt).not.toBe(en);
  });

  it('emits og:image dimensions so cards render without a reflow', () => {
    const doc = html('index.html');
    expect(doc).toMatch(/<meta property="og:image:width" content="\d+"/);
    expect(doc).toMatch(/<meta property="og:image:height" content="\d+"/);
  });

  it('requests a large Twitter card', () => {
    expect(html('index.html')).toContain('<meta name="twitter:card" content="summary_large_image"');
  });

  it('emits valid OG locale codes, which are not the hreflang codes', () => {
    // og:locale wants language_TERRITORY. 'en' alone is not valid there,
    // even though it is the correct hreflang value.
    expect(html('index.html')).toContain('<meta property="og:locale" content="en_US"');
    expect(html('pt/index.html')).toContain('<meta property="og:locale" content="pt_BR"');
  });
});
