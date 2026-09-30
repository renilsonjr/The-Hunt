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

  // The whole point of the page: it is the pre-novel document, unedited. These
  // three lines were changed by the canon reconciliation and must read the way
  // they read before it, or the page is not what it says it is.
  it('preserves the text as it stood before the novel diverged from it', () => {
    const en = html('lore/index.html');
    expect(en).toContain('she shifts the harmonic frequency of the cosmic Barrier');
    expect(en).toContain('he plants a symbolic, harmonized resonance');
    expect(en).not.toContain('salted her world');
    expect(en).not.toContain('closes the dream channel');
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
