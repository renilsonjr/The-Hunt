import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('sphere page', () => {
  it('shows the glyph in both locales', () => {
    expect(html('sphere/index.html')).toContain('(: .)');
    expect(html('pt/sphere/index.html')).toContain('(: .)');
  });

  it('describes the object as unremarkable rather than grand', () => {
    expect(html('sphere/index.html')).toMatch(/humble|unremarkable|small/i);
  });

  it('renders the sphere plates', () => {
    const doc = html('sphere/index.html');
    expect(doc).toMatch(/alt="[^"]*pedestal[^"]*"/i);
  });
});
