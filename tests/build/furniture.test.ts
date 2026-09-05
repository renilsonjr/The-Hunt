import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROUTES, LOCALES } from '~/i18n/config';

const dist = (p: string) => resolve(process.cwd(), 'dist', p);
const read = (p: string) => readFileSync(dist(p), 'utf8');

describe('404 page', () => {
  // GitHub Pages serves 404.html from the published root for any unmatched
  // path. Without it a mistyped URL gets GitHub's unstyled generic page.
  it('is emitted at the site root', () => {
    expect(existsSync(dist('404.html'))).toBe(true);
  });

  it('offers a way back in both languages', () => {
    const doc = read('404.html');
    expect(doc).toContain('href="/The-Hunt/"');
    expect(doc).toContain('href="/The-Hunt/pt/"');
  });

  it('carries the site chrome rather than being a bare page', () => {
    expect(read('404.html')).toMatch(/class="wordmark[^"]*"/);
  });

  it('tells crawlers not to index it', () => {
    expect(read('404.html')).toMatch(/<meta name="robots" content="noindex"/);
  });
});

describe('sitemap', () => {
  it('is emitted', () => {
    expect(existsSync(dist('sitemap-index.xml'))).toBe(true);
    expect(existsSync(dist('sitemap-0.xml'))).toBe(true);
  });

  it('lists every route in every locale', () => {
    const xml = read('sitemap-0.xml');
    for (const locale of LOCALES) {
      for (const route of ROUTES) {
        const prefix = locale === 'en' ? '' : `${locale}/`;
        const url = `https://renilsonjr.github.io/The-Hunt/${prefix}${route}${route ? '/' : ''}`;
        expect(xml, `sitemap is missing ${url}`).toContain(url);
      }
    }
  });

  it('does not advertise the 404 page', () => {
    expect(read('sitemap-0.xml')).not.toContain('/404');
  });
});
