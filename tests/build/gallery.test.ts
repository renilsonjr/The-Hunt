import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
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

  // The lightbox loads a full-size derivative rather than the tile's own
  // 300w file, which it would otherwise upscale ~2.9x. AVIF is the first
  // choice; a browser that cannot decode it needs a full-size WebP to fall
  // back to, not the 300w tile — falling back to the tile reintroduces the
  // very upscale the full-size URL exists to prevent.
  it('gives every plate both a full-size AVIF and a full-size WebP', () => {
    const doc = html('gallery/index.html');
    const avif = doc.match(/data-full="[^"]+\.avif"/g) ?? [];
    const webp = doc.match(/data-full-webp="[^"]+\.webp"/g) ?? [];
    expect(avif).toHaveLength(ART_IDS.length);
    expect(webp).toHaveLength(ART_IDS.length);
  });

  it('points the full-size fallbacks at files the build actually emitted', () => {
    const doc = html('gallery/index.html');
    const urls = [...doc.matchAll(/data-full(?:-webp)?="([^"]+)"/g)].map((m) => m[1]);
    expect(urls.length).toBe(ART_IDS.length * 2);
    for (const url of urls) {
      const path = url.replace('/The-Hunt/', '');
      expect(existsSync(resolve(process.cwd(), 'dist', path)), `missing ${path}`).toBe(true);
    }
  });
});
