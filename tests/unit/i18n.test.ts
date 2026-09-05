import { describe, it, expect } from 'vitest';
import { localizePath, getLocaleFromPath, alternatesFor } from '~/i18n/utils';
import { t } from '~/i18n/ui';

describe('localizePath', () => {
  it('builds an English path without a locale prefix', () => {
    expect(localizePath('worlds', 'en')).toBe('/The-Hunt/worlds/');
  });

  it('builds a Portuguese path with the pt prefix', () => {
    expect(localizePath('worlds', 'pt')).toBe('/The-Hunt/pt/worlds/');
  });

  it('handles the home route for both locales', () => {
    expect(localizePath('', 'en')).toBe('/The-Hunt/');
    expect(localizePath('', 'pt')).toBe('/The-Hunt/pt/');
  });

  it('tolerates leading and trailing slashes in the input', () => {
    expect(localizePath('/gods/', 'en')).toBe('/The-Hunt/gods/');
  });
});

describe('getLocaleFromPath', () => {
  it('reads pt from the prefix', () => {
    expect(getLocaleFromPath('/The-Hunt/pt/gods/')).toBe('pt');
  });

  it('defaults to en when there is no prefix', () => {
    expect(getLocaleFromPath('/The-Hunt/gods/')).toBe('en');
  });

  it('does not mistake a page named pt-something for the pt locale', () => {
    expect(getLocaleFromPath('/The-Hunt/ptolemy/')).toBe('en');
  });
});

describe('alternatesFor', () => {
  it('returns both locales with correct hreflang codes', () => {
    expect(alternatesFor('gods')).toEqual([
      { locale: 'en', href: '/The-Hunt/gods/', hreflang: 'en' },
      { locale: 'pt', href: '/The-Hunt/pt/gods/', hreflang: 'pt-BR' },
    ]);
  });
});

describe('t', () => {
  it('returns the string for the requested locale', () => {
    expect(t('nav.worlds', 'en')).toBe('Worlds');
    expect(t('nav.worlds', 'pt')).toBe('Mundos');
  });
});
