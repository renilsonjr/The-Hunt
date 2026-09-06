import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = (p: string) => resolve(process.cwd(), 'dist', p);
const read = (p: string) => readFileSync(dist(p), 'utf8');

// Find all directories in dist that contain index.html
const findBuiltPages = (dir: string, prefix: string = ''): string[] => {
  const { readdirSync } = require('node:fs');
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

  it('lists the Phase B routes', () => {
    const xml = read('sitemap-0.xml');
    for (const route of ['codex', 'dream', 'journal']) {
      expect(xml, `sitemap is missing /${route}/`).toContain(
        `https://renilsonjr.github.io/The-Hunt/${route}/`,
      );
      expect(xml, `sitemap is missing /pt/${route}/`).toContain(
        `https://renilsonjr.github.io/The-Hunt/pt/${route}/`,
      );
    }
  });
});

describe('locale parity', () => {
  it('maintains parity between English and Portuguese pages', () => {
    const builtPages = findBuiltPages('');

    // Add root pages if they exist (findBuiltPages only finds subdirectories)
    const allPages = [...builtPages];
    if (existsSync(dist('index.html'))) {
      allPages.push('');
    }
    if (existsSync(dist('pt/index.html'))) {
      allPages.push('pt');
    }

    // Split pages into English and Portuguese sets
    // "pt" is the Portuguese home, not an English page; exclude it from English pages
    const englishPages = allPages.filter((page) => !page.startsWith('pt/') && page !== 'pt');
    const portuguesePages = allPages.filter((page) => page === 'pt' || page.startsWith('pt/'));

    // Normalize Portuguese pages to their English equivalents for comparison
    // pt/ → (empty string for home), pt/sphere → sphere
    const portugueseNormalized = portuguesePages.map((page) =>
      page === 'pt' ? '' : page.slice(3) // Remove 'pt/' prefix
    );

    // Normalize English pages
    const englishNormalized = englishPages;

    // Check English → Portuguese parity
    for (const enPage of englishNormalized) {
      const ptPagePath = enPage === '' ? 'pt' : `pt/${enPage}`;
      expect(
        portuguesePages,
        `Portuguese counterpart missing for English page "${enPage === '' ? '/' : enPage}": expected to find built page at "${ptPagePath}"`
      ).toContain(ptPagePath);
    }

    // Check Portuguese → English parity
    for (const ptNormalized of portugueseNormalized) {
      const enPagePath = ptNormalized;
      expect(
        englishNormalized,
        `English counterpart missing for Portuguese page "${ptNormalized === '' ? '/' : ptNormalized}": expected to find built page at "${enPagePath === '' ? '/' : enPagePath}"`
      ).toContain(enPagePath);
    }
  });
});
