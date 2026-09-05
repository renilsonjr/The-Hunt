import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('site chrome', () => {
  it('renders navigation links with the base path', () => {
    const doc = html('index.html');
    expect(doc).toContain('href="/The-Hunt/worlds/"');
    expect(doc).toContain('href="/The-Hunt/gallery/"');
  });

  it('language toggle on an English page points at the same page in Portuguese', () => {
    const doc = html('index.html');
    expect(doc).toContain('href="/The-Hunt/pt/"');
    expect(doc).toContain('Ler em português');
  });

  it('language toggle on a Portuguese page points back to English', () => {
    const doc = html('pt/index.html');
    expect(doc).toContain('href="/The-Hunt/"');
    expect(doc).toContain('Read in English');
  });

  it('navigation is inside a labelled nav landmark', () => {
    expect(html('index.html')).toMatch(/<nav[^>]+aria-label=/);
  });

  it('renders the wordmark with Hunt in the glitch face only', () => {
    const doc = html('index.html');
    // Astro appends a scope class (class="wordmark astro-xxxx"), so match a prefix.
    expect(doc).toMatch(/class="wordmark[^"]*"/);
    expect(doc).toMatch(/class="glitch[^"]*">Hunt</);
  });
});
