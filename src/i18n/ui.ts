import type { Locale } from './config';

const STRINGS = {
  'nav.worlds':     { en: 'Worlds',      pt: 'Mundos' },
  'nav.gods':       { en: 'Gods',        pt: 'Deuses' },
  'nav.hybrids':    { en: 'Hybrids',     pt: 'Híbridos' },
  'nav.sphere':     { en: 'The Sphere',  pt: 'A Esfera' },
  'nav.gallery':    { en: 'Gallery',     pt: 'Galeria' },
  'nav.skip':       { en: 'Skip to content', pt: 'Pular para o conteúdo' },
  'nav.aria':       { en: 'Main',        pt: 'Principal' },
  'lang.switch':    { en: 'Ler em português', pt: 'Read in English' },
  'lightbox.title': { en: 'Artwork viewer', pt: 'Visualizador de arte' },
  'lightbox.close': { en: 'Close',       pt: 'Fechar' },
  'footer.status':  { en: 'A novel in development', pt: 'Um romance em desenvolvimento' },
  'footer.repo':    { en: 'Source on GitHub', pt: 'Código no GitHub' },
} as const;

export type UIKey = keyof typeof STRINGS;

export function t(key: UIKey, locale: Locale): string {
  return STRINGS[key][locale];
}
