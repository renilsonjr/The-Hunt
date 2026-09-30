import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { t } from '~/i18n/ui';

const dist = resolve(process.cwd(), 'dist');
const html = (p: string) => readFileSync(resolve(dist, p), 'utf8');

describe('lore', () => {
  it('builds in both locales', () => {
    expect(existsSync(resolve(dist, 'lore/index.html'))).toBe(true);
    expect(existsSync(resolve(dist, 'pt/lore/index.html'))).toBe(true);
  });

  it('is linked from the nav in both locales', () => {
    expect(html('index.html')).toContain('href="/The-Hunt/lore/"');
    expect(html('pt/index.html')).toContain('href="/The-Hunt/pt/lore/"');
    expect(html('index.html')).toContain(t('nav.lore', 'en'));
  });

  // This is the one page on the site whose Portuguese is a real translation
  // rather than a fallback, so the notice must NOT appear on it.
  it('is genuinely translated, not falling back', () => {
    expect(html('pt/lore/index.html')).not.toContain(t('notice.fallback', 'pt'));
  });

  // The page is the pre-novel document with exactly one correction. The three
  // *divergences* are left standing on purpose — they are a story changing its
  // mind, not mistakes — so they must still read the way they read then.
  it('preserves the three divergences rather than tidying them away', () => {
    const en = html('lore/index.html');
    expect(en).toContain('she shifts the harmonic frequency of the cosmic Barrier');
    expect(en).toContain('he plants a symbolic, harmonized resonance');
    expect(en).not.toContain('salted her world');
    expect(en).not.toContain('closes the dream channel');
  });

  // The one correction: the original claimed touching the Sphere completed a
  // genetic exchange. That was an error about the story's own mechanism, not a
  // divergence, and it inverted the cause of everything after it.
  it('carries the Sphere correction in both languages', () => {
    const en = html('lore/index.html');
    // The frame quotes the erroneous phrase in order to explain the
    // correction, so the assertion has to target the original *claim* — the
    // full sentence — rather than the words, which legitimately still appear.
    expect(en).not.toContain('it completed a genetic exchange, embedding ancient Virden biology');
    expect(en).not.toContain('alone, and no longer entirely human');
    expect(en).toContain('nothing was put into him and nothing was exchanged');
    expect(en).toContain('woke what had been dormant in his genome since birth');

    const pt = html('pt/lore/index.html');
    expect(pt).not.toContain('Ao tocar na Esfera, ocorreu uma troca genética profunda');
    expect(pt).not.toContain('não mais 100% humano');
    expect(pt).toContain('nada foi implantado nele e não houve troca alguma');
  });

  // A page that says it reproduces a document exactly, and then edits it, is
  // lying. The frame has to declare the correction.
  it('declares the correction instead of claiming to be unedited', () => {
    expect(html('lore/index.html')).toContain('with <strong>one correction</strong>');
    expect(html('lore/index.html')).not.toContain('reproduced here exactly as it stood then');
    expect(html('pt/lore/index.html')).toContain('com <strong>uma correção</strong>');
  });

  it('says on the page that the draft has since diverged', () => {
    expect(html('lore/index.html')).toContain('before a single chapter of the');
    expect(html('pt/lore/index.html')).toContain('antes de existir um único');
  });

  // Lore is the widest Markdown surface on the site and the only one carrying
  // tables and a fenced ASCII diagram. Before this variant existed they would
  // have rendered with browser defaults on a dark background.
  it('styles the constructs the other variants never had to', () => {
    const en = html('lore/index.html');
    expect(en).toContain('data-variant="lore"');
    expect(en).toMatch(/<table/);
    expect(en).toMatch(/<pre/);
    expect(en).toMatch(/<blockquote/);
  });
});
