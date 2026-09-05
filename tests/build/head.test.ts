import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
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

  it('emits hreflang alternates pointing at both locales', () => {
    const doc = html('index.html');
    expect(doc).toContain('hreflang="en"');
    expect(doc).toContain('hreflang="pt-BR"');
    expect(doc).toContain('href="/The-Hunt/pt/"');
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
});
