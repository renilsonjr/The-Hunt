export const LOCALES = ['en', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** BCP-47 codes used in hreflang and the html lang attribute. */
export const HREFLANG: Record<Locale, string> = {
  en: 'en',
  pt: 'pt-BR',
};

/**
 * Open Graph locale codes. Deliberately NOT derived from HREFLANG: og:locale
 * requires language_TERRITORY, so bare 'en' is invalid there even though it is
 * the correct hreflang value.
 */
export const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  pt: 'pt_BR',
};

/** Every route on the site, without locale prefix or slashes. '' is home. */
export const ROUTES = [
  '',
  'worlds',
  'gods',
  'hybrids',
  'sphere',
  'codex',
  'gallery',
  'journal',
  'dream',
] as const;
export type Route = (typeof ROUTES)[number];
