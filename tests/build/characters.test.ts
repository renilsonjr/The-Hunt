import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('gods page', () => {
  it('presents both gods in both locales', () => {
    expect(html('gods/index.html')).toContain('Zalian');
    expect(html('gods/index.html')).toContain('Balian');
    expect(html('pt/gods/index.html')).toContain('Primogênito');
  });

  it('states the speech constraint, which is the story engine', () => {
    expect(html('gods/index.html')).toContain('aloud');
  });
});

describe('hybrids page', () => {
  it('presents both hybrids in both locales', () => {
    expect(html('hybrids/index.html')).toContain('Fridan');
    expect(html('hybrids/index.html')).toContain('Uxies');
    expect(html('pt/hybrids/index.html')).toContain('Uxies');
  });

  it('gives the hybrids mirrored rings crossing both worlds', () => {
    const doc = html('hybrids/index.html');
    expect(doc).toContain('ring--mirror-gold');
    expect(doc).toContain('ring--mirror-violet');
  });

  it('gives each god a single-world ring', () => {
    const doc = html('gods/index.html');
    expect(doc).toContain('ring--gold');
    expect(doc).toContain('ring--violet');
  });
});
