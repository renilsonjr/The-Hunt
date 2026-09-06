import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('dream log', () => {
  it('exists in both locales', () => {
    expect(html('dream/index.html')).toContain('goose');
    expect(html('pt/dream/index.html')).toContain('goose');
  });

  it('keeps the original English text on the Portuguese route', () => {
    // The artifact is one person's own words; the PT page frames it, it does
    // not replace it.
    const pt = html('pt/dream/index.html');
    expect(pt).toContain('Hans');
    expect(pt).toMatch(/documento original|texto original/i);
  });

  it('frames the log as a recovered document rather than as fiction', () => {
    expect(html('dream/index.html')).toMatch(/08\/26\/26|2026-08-26/);
  });

  it('is reachable from the footer', () => {
    expect(html('index.html')).toContain('href="/The-Hunt/dream/"');
  });

  // The note is a factual claim about a primary source document — it tells
  // the reader exactly how much of what follows was edited. A regression that
  // dropped it would leave the log looking like fiction, and every other
  // assertion here would still pass.
  it('states on the record what was changed and what was not', () => {
    expect(html('dream/index.html')).toContain(
      'Typos have been fixed and nothing else has been touched.',
    );
    expect(html('pt/dream/index.html')).toContain(
      'Apenas erros de digitação foram corrigidos.',
    );
  });

  // The frame is the site's voice; the log is the artifact. That distinction
  // is the page's whole editorial argument, so the frame is marked up as one
  // unit — however many paragraphs it runs to — rather than relying on a CSS
  // rule that sets apart only the first.
  it('sets the whole editorial frame apart from the log, not just its first paragraph', () => {
    const pt = html('pt/dream/index.html');
    const frame = pt.match(/<div class="frame"[^>]*>([\s\S]*?)<\/div>/);
    expect(frame, 'the PT page has no marked-up editorial frame').not.toBeNull();
    expect(frame![1].match(/<p[^>]*>/g)?.length).toBeGreaterThan(1);
    expect(frame![1]).toContain('Apenas erros de digitação foram corrigidos.');
    // The log itself stays outside it.
    expect(frame![1]).not.toContain('REM');
  });
});
