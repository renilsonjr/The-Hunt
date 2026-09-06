import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const dist = resolve(process.cwd(), 'dist');

/**
 * Every built HTML page that is part of the site.
 *
 * `concepts/` is excluded on purpose: it is the preserved standalone concept
 * artifact from before the site existed, carries none of the site chrome, and
 * links its fonts straight from Google. `legacy.test.ts` owns it.
 */
function pages(dir = dist): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? e.name === 'concepts'
        ? []
        : pages(join(dir, e.name))
      : e.name.endsWith('.html')
        ? [join(dir, e.name)]
        : [],
  );
}

const cssFor = (htmlPath: string): string => {
  const html = readFileSync(htmlPath, 'utf8');
  const hrefs = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((href) => href.startsWith('/The-Hunt/'));
  const linked = hrefs.map((href) =>
    readFileSync(resolve(dist, href.replace(/^\/The-Hunt\//, '')), 'utf8'),
  );
  // Astro inlines small stylesheets rather than emitting a file for them, so a
  // page's CSS is its linked sheets plus whatever is in its own <style> tags.
  const inlined = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  return [...linked, ...inlined].join('\n');
};

// esbuild minifies `body::before` to the equivalent legacy `body:before`.
const RULE = /body::?before\{[^}]*\}/;
const allCss = readdirSync(resolve(dist, '_astro'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(resolve(dist, '_astro', f), 'utf8'))
  .join('\n');
const rule = allCss.match(RULE)?.[0] ?? '';

describe('background', () => {
  // Fixed to the viewport, not to the document. `background-attachment: fixed`
  // on the body would repaint the whole viewport on every scroll frame on
  // mobile; a fixed pseudo-element composites instead.
  it('paints the backdrop on a fixed layer behind the content', () => {
    expect(rule).toMatch(/position:fixed/);
    expect(rule).toMatch(/z-index:-1/);
  });

  it('draws both worlds, gold and violet, from opposite corners', () => {
    expect(rule).toContain('var(--zalian)');
    expect(rule).toContain('var(--balian)');
    expect(rule.match(/radial-gradient/g)?.length).toBe(2);
  });

  // The body keeps its flat --void underneath, so the colour the browser
  // paints before the stylesheet lands is already correct and there is no
  // flash of a lighter ground.
  it('leaves the void as the body background underneath', () => {
    expect(allCss).toMatch(/body\{[^}]*background:var\(--void\)/);
  });

  it('does not intercept pointer events', () => {
    expect(rule).toMatch(/pointer-events:none/);
  });

  // The site's only animation is `.reveal`, opt-in behind `no-preference`.
  it('adds nothing that animates', () => {
    expect(rule).not.toMatch(/animation|transition/);
  });

  // The real risk with a global rule in a bundler that code-splits CSS per
  // entry: it reaches some pages and not others, and the background changes
  // as you navigate. Assert it on every page rather than on the bundle.
  it('reaches every built page, not just the ones that happen to chunk with it', () => {
    const all = pages();
    expect(all.length).toBeGreaterThan(50);
    const missing = all.filter((p) => !RULE.test(cssFor(p)));
    expect(missing.map((p) => p.slice(dist.length))).toEqual([]);
  });
});
