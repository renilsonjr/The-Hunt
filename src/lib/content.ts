import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '~/i18n/config';

/** Ids are '<locale>/<slug>'. Split rather than trusting frontmatter. */
const parseId = (id: string): { locale: Locale; slug: string } => {
  const [locale, ...rest] = id.split('/');
  return { locale: locale as Locale, slug: rest.join('/') };
};

const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

export interface Localized<T> {
  entry: T;
  /**
   * True when the requested locale had no translation and the default locale
   * was served instead. Pages must show a TranslationNotice when this is set —
   * silently serving the wrong language is worse than saying so.
   */
  isFallback: boolean;
}

/**
 * Choose the entry for a slug in a locale, falling back to the default locale.
 *
 * Pure and generic over anything with an `id`, so the rule that keeps the
 * language toggle from 404ing can be unit-tested against fixtures instead of
 * against whatever content the site happens to have today.
 */
export function pickLocalized<T extends { id: string }>(
  entries: readonly T[],
  slug: string,
  locale: Locale,
): Localized<T> | undefined {
  const wanted = entries.find((e) => e.id === `${locale}/${slug}`);
  if (wanted) return { entry: wanted, isFallback: false };

  const fallback = entries.find((e) => e.id === `${DEFAULT_LOCALE}/${slug}`);
  return fallback ? { entry: fallback, isFallback: true } : undefined;
}

export async function getProse(
  slug: string,
  locale: Locale,
): Promise<Localized<CollectionEntry<'prose'>> | undefined> {
  return pickLocalized(await getCollection('prose'), slug, locale);
}

/**
 * Every slug present in any locale, resolved for the requested one.
 *
 * This is what makes the language toggle structurally incapable of 404ing on
 * a per-slug route: the set of slugs is the union across locales, so a page
 * exists in both languages even when only one has a translation — and the
 * `isFallback` it carries is what obliges the page to say so.
 *
 * Shared by the journal and the chapters, which differ only in how they sort.
 */
function listLocalized<T extends { id: string }>(
  all: readonly T[],
  locale: Locale,
): (Localized<T> & { slug: string })[] {
  const slugs = new Set(
    all.map((e) => parseId(e.id)).filter((p) => isLocale(p.locale)).map((p) => p.slug),
  );

  const items: (Localized<T> & { slug: string })[] = [];
  for (const slug of slugs) {
    const picked = pickLocalized(all, slug, locale);
    if (!picked) continue;
    items.push({ slug, ...picked });
  }
  return items;
}

export interface JournalItem extends Localized<CollectionEntry<'journal'>> {
  slug: string;
}

/** Every journal slug that exists in any locale, newest first. */
export async function listJournal(locale: Locale): Promise<JournalItem[]> {
  const items = listLocalized(await getCollection('journal'), locale);
  return items.sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());
}

export interface ChapterItem extends Localized<CollectionEntry<'chapters'>> {
  slug: string;
}

/**
 * Every chapter slug that exists in any locale, in reading order.
 *
 * Sorted on `number`, not on the slug: slugs are permanent URLs, so inserting
 * a chapter must not require renaming the ones after it.
 */
export async function listChapters(locale: Locale): Promise<ChapterItem[]> {
  const items = listLocalized(await getCollection('chapters'), locale);
  return items.sort((a, b) => a.entry.data.number - b.entry.data.number);
}

export interface ChapterNeighbours {
  prev?: ChapterItem;
  next?: ChapterItem;
}

/** The chapters either side of `slug` in reading order. */
export function neighbours(items: readonly ChapterItem[], slug: string): ChapterNeighbours {
  const i = items.findIndex((item) => item.slug === slug);
  if (i === -1) return {};
  return { prev: items[i - 1], next: items[i + 1] };
}
