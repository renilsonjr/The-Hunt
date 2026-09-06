import { describe, it, expect } from 'vitest';
import { ROUTES } from '~/i18n/config';
import { pickLocalized } from '~/lib/content';

describe('routes', () => {
  it('includes the Phase B routes', () => {
    expect(ROUTES).toContain('codex');
    expect(ROUTES).toContain('dream');
    expect(ROUTES).toContain('journal');
  });

  it('keeps the Phase A routes', () => {
    for (const route of ['', 'worlds', 'gods', 'hybrids', 'sphere', 'gallery']) {
      expect(ROUTES).toContain(route);
    }
  });
});

// This is the rule that stops the language toggle from ever 404ing: a route
// exists in both locales even when only one translation does. Tested as a pure
// function over fixtures rather than against real content, so it cannot quietly
// start passing because the site happens to have full parity today.
describe('pickLocalized', () => {
  const entries = [
    { id: 'en/alpha' },
    { id: 'pt/alpha' },
    { id: 'en/beta' },
  ];

  it('returns the requested locale when it exists', () => {
    const got = pickLocalized(entries, 'alpha', 'pt');
    expect(got?.entry.id).toBe('pt/alpha');
    expect(got?.isFallback).toBe(false);
  });

  it('falls back to the default locale and says so', () => {
    const got = pickLocalized(entries, 'beta', 'pt');
    expect(got?.entry.id).toBe('en/beta');
    expect(got?.isFallback).toBe(true);
  });

  it('never reports a fallback when serving the default locale itself', () => {
    expect(pickLocalized(entries, 'beta', 'en')?.isFallback).toBe(false);
  });

  it('returns undefined when the slug exists in no locale', () => {
    expect(pickLocalized(entries, 'gamma', 'en')).toBeUndefined();
  });
});
