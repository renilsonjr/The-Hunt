import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ART_IDS } from '~/data/art';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('gallery page', () => {
  it('renders every plate in the manifest', () => {
    const doc = html('gallery/index.html');
    const figures = doc.match(/data-plate=/g) ?? [];
    expect(figures).toHaveLength(ART_IDS.length);
  });

  it('lazy-loads everything except the first two plates', () => {
    const doc = html('gallery/index.html');
    const eager = doc.match(/loading="eager"/g) ?? [];
    // Exactly two, not "at most two": zero eager images is the LCP regression
    // this assertion exists to catch, and <= would pass straight through it.
    expect(eager.length).toBe(2);
  });

  it('uses localized captions', () => {
    expect(html('gallery/index.html')).toContain('The Sphere');
    expect(html('pt/gallery/index.html')).toContain('A Esfera');
  });

  it('exposes an accessible dialog for the lightbox', () => {
    const doc = html('gallery/index.html');
    expect(doc).toMatch(/<dialog[^>]*id="lightbox"/);
  });
});
