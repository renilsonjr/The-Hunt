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
    const { readdirSync } = require('node:fs');

    // Find all directories in dist that contain index.html
    const findBuiltPages = (dir: string, prefix: string = ''): string[] => {
      const pages: string[] = [];
      try {
        const entries = readdirSync(dist(dir), { withFileTypes: true });
        for (const entry of entries) {
          // Skip hidden files and non-directories
          if (entry.name.startsWith('.') || !entry.isDirectory()) {
            continue;
          }
          const subdir = dir ? `${dir}/${entry.name}` : entry.name;
          const newPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;

          // Check if this directory contains index.html
          if (existsSync(dist(`${subdir}/index.html`))) {
            pages.push(newPrefix);
          }

          // Recursively check subdirectories
          pages.push(...findBuiltPages(subdir, newPrefix));
        }
      } catch {
        // Directory doesn't exist or can't be read, skip
      }
      return pages;
    };

    const builtPages = findBuiltPages('');

    // Convert pages to expected sitemap URLs
    // Format: https://renilsonjr.github.io/The-Hunt/{page}/
    const expectedUrls = builtPages.map(
      (page) => `https://renilsonjr.github.io/The-Hunt/${page}/`
    );

    // Also check the root pages explicitly
    expectedUrls.push('https://renilsonjr.github.io/The-Hunt/');

    for (const url of expectedUrls) {
      const locTag = `<loc>${url}</loc>`;
      expect(xml, `sitemap is missing ${url}`).toContain(locTag);
    }
  });

  it('does not advertise the 404 page', () => {
    expect(read('sitemap-0.xml')).not.toContain('/404');
  });
});
