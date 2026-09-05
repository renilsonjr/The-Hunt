import { LOCALES, DEFAULT_LOCALE, HREFLANG, type Locale } from './config';

const BASE = '/The-Hunt';

/** Strip surrounding slashes so callers can pass 'gods', '/gods' or '/gods/'. */
const clean = (path: string): string => path.replace(/^\/+|\/+$/g, '');

export function localizePath(path: string, locale: Locale): string {
  const slug = clean(path);
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return slug ? `${BASE}${prefix}/${slug}/` : `${BASE}${prefix}/`;
}

export function getLocaleFromPath(pathname: string): Locale {
  const withoutBase = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const first = clean(withoutBase).split('/')[0];
  return (LOCALES as readonly string[]).includes(first) ? (first as Locale) : DEFAULT_LOCALE;
}

export function alternatesFor(path: string) {
  return LOCALES.map((locale) => ({
    locale,
    href: localizePath(path, locale),
    hreflang: HREFLANG[locale],
  }));
}
