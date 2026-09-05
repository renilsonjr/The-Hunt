import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

/**
 * The visible copy of a page: the text inside its <p class="prose"> blocks,
 * with markup stripped. An assertion about what the page *says* must not be
 * able to pass on an attribute value — "small" appears in the sphere-pedestal
 * alt text and in the meta description no matter what the prose says.
 */
const prose = (p: string) =>
  [...html(p).matchAll(/<p class="prose[^"]*"[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => m[1].replace(/<[^>]*>/g, ' '))
    .join(' ');

describe('sphere page', () => {
  it('shows the glyph in both locales', () => {
    expect(html('sphere/index.html')).toContain('(: .)');
    expect(html('pt/sphere/index.html')).toContain('(: .)');
  });

  it('describes the object as unremarkable rather than grand', () => {
    expect(prose('sphere/index.html')).toMatch(/humble|unremarkable|small/i);
  });

  it('renders the sphere plates', () => {
    const doc = html('sphere/index.html');
    expect(doc).toMatch(/alt="[^"]*pedestal[^"]*"/i);
  });
});
