export const LOCALES = ['en', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** BCP-47 codes used in hreflang and the html lang attribute. */
export const HREFLANG: Record<Locale, string> = {
  en: 'en',
  pt: 'pt-BR',
};

export const LOCALE_NAME: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
};

/** Every route on the site, without locale prefix or slashes. '' is home. */
export const ROUTES = ['', 'worlds', 'gods', 'hybrids', 'sphere', 'gallery'] as const;
export type Route = (typeof ROUTES)[number];
