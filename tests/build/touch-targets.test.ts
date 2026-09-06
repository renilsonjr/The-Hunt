import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const dist = resolve(process.cwd(), 'dist');

/**
 * Every stylesheet the build produced — emitted files AND the `<style>` blocks
 * Astro inlines into the HTML when a component's CSS is small enough.
 *
 * Reading only `dist/_astro/*.css` misses the inlined ones, which is exactly
 * where a per-component rule like the spoiler gate's ends up. That blind spot
 * made this suite report a missing rule that was in fact shipping.
 */
function allFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? allFiles(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const files = allFiles(dist);
const emitted = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(f, 'utf8'));
const inlined = files
  .filter((f) => f.endsWith('.html'))
  .flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]));
const css = [...emitted, ...inlined].join('\n');

/** Every `@media (pointer: coarse)` block in the built CSS, concatenated. */
const coarse = [...css.matchAll(/@media\s*\(pointer:\s*coarse\)\{((?:[^{}]|\{[^{}]*\})*)\}/g)]
  .map((m) => m[1])
  .join('\n');

describe('touch targets', () => {
  it('defines the minimum target size once, as a token', () => {
    expect(css).toMatch(/--tap:\s*44px/);
    // The value is a token precisely so it is not repeated as a literal.
    expect(coarse).not.toMatch(/min-height:\s*44px/);
  });

  // Four surfaces were measured under 44px at 375x812 before this existed:
  // the eight nav links (19-20px), the language toggle (33px), the two footer
  // links (18px) and the codex spoiler gate (38px).
  it('grows every one of the four undersized surfaces', () => {
    expect(coarse.match(/min-height:var\(--tap\)/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it('reclaims the height it costs, rather than only adding', () => {
    expect(coarse).toMatch(/row-gap:0/);
    expect(coarse).toMatch(/padding-block:\.5rem/);
  });

  // The whole point of keying on pointer type rather than viewport width: a
  // desktop cursor should see none of this, so the design is untouched there.
  it('costs the cursor nothing', () => {
    expect(coarse.length).toBeGreaterThan(0);
    const outside = css.replace(/@media\s*\(pointer:\s*coarse\)\{(?:[^{}]|\{[^{}]*\})*\}/g, '');
    expect(outside).not.toMatch(/min-height:var\(--tap\)/);
  });

  // `display: flex` on a <summary> removes the disclosure marker in WebKit.
  // The gate must stay a list-item and gain its height from padding.
  it('does not flex the spoiler gate summary away from list-item', () => {
    expect(coarse).not.toMatch(/summary[^{]*\{[^}]*display:(inline-)?flex/);
  });
});
