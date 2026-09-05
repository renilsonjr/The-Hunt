import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('worlds page', () => {
  it('exists in both locales', () => {
    expect(html('worlds/index.html')).toContain('Earth 1');
    expect(html('pt/worlds/index.html')).toContain('Terra 1');
  });

  it('names both gods and the Barrier', () => {
    const doc = html('worlds/index.html');
    expect(doc).toContain('Zalian');
    expect(doc).toContain('Balian');
    expect(doc).toContain('Barrier');
  });

  it('renders the lore diagram plate', () => {
    expect(html('worlds/index.html')).toMatch(/alt="[^"]*schematic[^"]*"/i);
  });

  it('marks the current page in the navigation', () => {
    expect(html('worlds/index.html')).toContain('aria-current="page"');
  });

  it('language toggle on the worlds page points at the Portuguese worlds page', () => {
    const doc = html('worlds/index.html');
    // Scoped to the toggle link itself (class="lang"), not just any link on the
    // page — the nav also links to worlds, including on the pt page as its own
    // current-page self-link, so a bare substring match would not catch a
    // toggle that regressed to pointing at the homepage.
    expect(doc).toContain('<a class="lang" href="/The-Hunt/pt/worlds/"');
  });

  it('language toggle on the Portuguese worlds page points back to the English worlds page', () => {
    const doc = html('pt/worlds/index.html');
    expect(doc).toContain('<a class="lang" href="/The-Hunt/worlds/"');
  });
});
