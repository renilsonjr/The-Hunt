import { describe, it, expect } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = (p: string) => resolve(process.cwd(), 'dist', p);
const html = (p: string) => readFileSync(dist(p), 'utf8');

describe('landing page', () => {
  it('carries the logline in English', () => {
    expect(html('index.html')).toContain('gods only hear what is spoken');
  });

  it('carries the logline in Portuguese', () => {
    expect(html('pt/index.html')).toContain('deuses só ouvem o que é dito');
  });

  it('links onward to the worlds page in the right locale', () => {
    expect(html('index.html')).toContain('href="/The-Hunt/worlds/"');
    expect(html('pt/index.html')).toContain('href="/The-Hunt/pt/worlds/"');
  });

  it('loads the single hero plate eagerly, via a picture element', () => {
    const doc = html('index.html');
    expect(doc).toContain('<picture');
    expect(doc).toMatch(/loading="eager"/);
    expect(doc).not.toMatch(/loading="lazy"/); // the hero is the only image on this page
  });

  it('offers avif and webp sources for the hero', () => {
    const doc = html('index.html');
    expect(doc).toContain('type="image/avif"');
    expect(doc).toContain('type="image/webp"');
  });

  it('keeps the HTML document itself small', () => {
    // The document must not inline artwork as data URIs.
    expect(statSync(dist('index.html')).size).toBeLessThan(60_000);
    expect(html('index.html')).not.toContain('data:image/jpeg;base64');
  });
});
