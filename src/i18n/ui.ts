import type { Locale } from './config';

const STRINGS = {
  'nav.worlds':     { en: 'Worlds',      pt: 'Mundos' },
  'nav.gods':       { en: 'Gods',        pt: 'Deuses' },
  'nav.hybrids':    { en: 'Hybrids',     pt: 'Híbridos' },
  'nav.sphere':     { en: 'The Sphere',  pt: 'A Esfera' },
  'nav.codex':      { en: 'Codex',       pt: 'Códex' },
  'nav.gallery':    { en: 'Gallery',     pt: 'Galeria' },
  'nav.journal':    { en: 'Journal',     pt: 'Diário' },
  'nav.dream':      { en: 'The dream',   pt: 'O sonho' },
  'nav.skip':       { en: 'Skip to content', pt: 'Pular para o conteúdo' },
  'nav.aria':       { en: 'Main',        pt: 'Principal' },
  'lang.switch':    { en: 'Ler em português', pt: 'Read in English' },
  'lightbox.title': { en: 'Artwork viewer', pt: 'Visualizador de arte' },
  'lightbox.close': { en: 'Close',       pt: 'Fechar' },
  'footer.status':  { en: 'A novel in development', pt: 'Um romance em desenvolvimento' },
  'footer.dream':   { en: 'The original dream', pt: 'O sonho original' },
  'footer.repo':    { en: 'Source on GitHub', pt: 'Código no GitHub' },
  'gate.summary':   {
    en: 'Everything past this point is the ending. Open it when you want it.',
    pt: 'Tudo daqui em diante é o final. Abra quando quiser.',
  },
  'journal.title':    { en: 'Journal', pt: 'Diário' },
  'journal.intro':    {
    en: 'Notes from building this, and from writing the book it is about.',
    pt: 'Notas sobre a construção disto e sobre a escrita do livro de que trata.',
  },
  'journal.back':     { en: 'All entries', pt: 'Todas as entradas' },
  'notice.fallback':  {
    en: 'This entry has not been translated yet — showing the English original.',
    pt: 'Esta entrada ainda não foi traduzida — exibindo o original em inglês.',
  },
} as const;

export type UIKey = keyof typeof STRINGS;

export function t(key: UIKey, locale: Locale): string {
  return STRINGS[key][locale];
}
