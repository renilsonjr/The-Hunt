import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('codex page', () => {
  it('exists in both locales', () => {
    expect(html('codex/index.html')).toContain('Zalian');
    expect(html('pt/codex/index.html')).toContain('Zalian');
  });

  it('states the speech constraint, which the whole plot turns on', () => {
    expect(html('codex/index.html')).toContain('aloud');
  });

  // The boundary is a courtesy, not access control. The words must be present
  // in the HTML for crawlers and for readers without JavaScript.
  it('ships the ending inside the document, not behind a fetch', () => {
    expect(html('codex/index.html')).toContain('seals');
    expect(html('pt/codex/index.html')).toContain('sela');
  });

  it('collapses the ending behind a details element that needs no JavaScript', () => {
    const doc = html('codex/index.html');
    expect(doc).toMatch(/<details[^>]*class="[^"]*gate/);
    expect(doc).toContain('<summary');
    // Closed by default: no `open` attribute in the emitted markup.
    expect(doc).not.toMatch(/<details[^>]+open/);
  });

  it('names what is behind the boundary rather than being coy', () => {
    expect(html('codex/index.html')).toMatch(/<summary[^>]*>[\s\S]{0,200}ending/i);
  });

  it('is reachable from the navigation', () => {
    expect(html('index.html')).toContain('href="/The-Hunt/codex/"');
    expect(html('pt/index.html')).toContain('href="/The-Hunt/pt/codex/"');
  });
});
