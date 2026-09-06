import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { t } from '~/i18n/ui';

const dist = (p: string) => resolve(process.cwd(), 'dist', p);
const html = (p: string) => readFileSync(dist(p), 'utf8');

const SLUGS = [
  ...Array.from({ length: 14 }, (_, i) => `chapter-${String(i + 1).padStart(2, '0')}`),
  'epilogue-1',
  'epilogue-2',
];

describe('read', () => {
  it('has an index in both locales', () => {
    expect(existsSync(dist('read/index.html'))).toBe(true);
    expect(existsSync(dist('pt/read/index.html'))).toBe(true);
  });

  it('builds every chapter in both locales', () => {
    for (const slug of SLUGS) {
      expect(existsSync(dist(`read/${slug}/index.html`)), `en ${slug}`).toBe(true);
      expect(existsSync(dist(`pt/read/${slug}/index.html`)), `pt ${slug}`).toBe(true);
    }
  });

  // The index is the only place the book's shape is visible, and the shape is
  // the acts. Ordering is driven by frontmatter `number`, not by filename, so
  // this asserts the rendered order rather than trusting the sort.
  it('lists chapters in reading order under their acts', () => {
    const page = html('read/index.html');
    const order = [...page.matchAll(/href="\/The-Hunt\/read\/([a-z0-9-]+)\/"/g)].map((m) => m[1]);
    // The first link is the "start reading" button, which repeats chapter one.
    expect(order[0]).toBe('chapter-01');
    expect(order.slice(1)).toEqual(SLUGS);

    // Astro stamps scoped-style attributes onto the tag, so this cannot anchor on `<h2>`.
    const acts = [...page.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);
    expect(acts).toEqual([
      'Act One — The Dream',
      'Act Two — The Waking World',
      'Act Three — The Messenger',
      'Epilogue',
    ]);
  });

  it('says on the index that this is an unedited first draft', () => {
    expect(html('read/index.html')).toContain(t('read.draft', 'en'));
    expect(html('pt/read/index.html')).toContain(t('read.draft', 'pt'));
  });

  // Chapters are the site's second per-slug dynamic route. The journal's
  // canonical bug — every entry declaring itself a duplicate of the section
  // index — is the exact defect this route could reintroduce.
  it('gives a chapter its own canonical URL, not the index\'s', () => {
    expect(html('read/chapter-04/index.html')).toContain(
      '<link rel="canonical" href="https://renilsonjr.github.io/The-Hunt/read/chapter-04/">'
    );
    expect(html('pt/read/chapter-04/index.html')).toContain(
      '<link rel="canonical" href="https://renilsonjr.github.io/The-Hunt/pt/read/chapter-04/">'
    );
  });

  it('gives every chapter a language toggle that lands on the same chapter', () => {
    expect(html('read/chapter-04/index.html')).toContain(
      '<a class="lang" href="/The-Hunt/pt/read/chapter-04/"'
    );
    expect(html('pt/read/chapter-04/index.html')).toContain(
      '<a class="lang" href="/The-Hunt/read/chapter-04/"'
    );
  });

  // No chapter is translated yet, so every Portuguese chapter page is serving
  // English under lang="pt-BR". `isFallback` exists precisely so that is
  // stated rather than silently done.
  it('admits on every Portuguese chapter that it is the English original', () => {
    for (const slug of SLUGS) {
      expect(html(`pt/read/${slug}/index.html`), slug).toContain(t('notice.fallback', 'pt'));
    }
  });

  it('does not show the fallback notice on English chapters', () => {
    expect(html('read/chapter-01/index.html')).not.toContain(t('notice.fallback', 'en'));
  });

  // Prev/next is how the book is actually read. The ends must terminate.
  it('links each chapter to its neighbours', () => {
    const four = html('read/chapter-04/index.html');
    expect(four).toContain('href="/The-Hunt/read/chapter-03/"');
    expect(four).toContain('href="/The-Hunt/read/chapter-05/"');
  });

  it('has no previous link on the first chapter and no next on the last', () => {
    const first = html('read/chapter-01/index.html');
    expect(first).toContain('href="/The-Hunt/read/chapter-02/"');
    expect(first).not.toMatch(/class="side prev"/);

    const last = html('read/epilogue-2/index.html');
    expect(last).toContain('href="/The-Hunt/read/epilogue-1/"');
    expect(last).not.toMatch(/class="side next"/);
  });

  it('renders the chapter text itself, not just the frame', () => {
    expect(html('read/chapter-01/index.html')).toContain(
      'The room is too warm and nobody has taken off their coat.'
    );
  });

  it('puts Read in the nav on both locales', () => {
    expect(html('index.html')).toContain('href="/The-Hunt/read/"');
    expect(html('pt/index.html')).toContain('href="/The-Hunt/pt/read/"');
  });
});
