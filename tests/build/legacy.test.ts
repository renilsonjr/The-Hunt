import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const dist = (p: string) => resolve(process.cwd(), 'dist', p);
const CONCEPT_PAGE = 'concepts/worlds-of-the-hunt.html';
const source = resolve(process.cwd(), 'public', CONCEPT_PAGE);
const sha256 = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');

describe('legacy urls', () => {
  it('still serves the concept page at its published path', () => {
    expect(existsSync(dist(CONCEPT_PAGE))).toBe(true);
  });

  it('serves the concept page byte-for-byte', () => {
    // The Global Constraint is "byte-for-byte", so compare content, not size:
    // a corrupting re-encode of ~1.95MB of self-contained HTML with inlined art
    // would sail past any size floor. This is the one already-published URL
    // that must not break.
    expect(statSync(dist(CONCEPT_PAGE)).size).toBe(statSync(source).size);
    expect(sha256(dist(CONCEPT_PAGE))).toBe(sha256(source));
  });
});
