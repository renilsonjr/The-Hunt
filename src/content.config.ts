import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content is locale-keyed by directory: prose/en/codex.md and prose/pt/codex.md
 * are the same page in two languages. The locale is parsed out of the id rather
 * than stored in frontmatter, so a file cannot claim a locale its path
 * contradicts.
 */
const prose = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/prose' }),
  schema: z.object({
    /** <title> and og:title. */
    title: z.string(),
    /** meta description and og:description. */
    description: z.string(),
    /** Small mono label above the heading. */
    eyebrow: z.string(),
    /** The <h1>. */
    heading: z.string(),
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Publication date; the index sorts on this, newest first. */
    date: z.coerce.date(),
    /** One-line summary shown on the index. */
    summary: z.string(),
  }),
});

/**
 * The novel itself. Same locale-keyed shape as the other two collections, so
 * a translated chapter is a file in chapters/pt/ and nothing else changes.
 * `number` rather than the filename drives reading order: slugs are stable
 * identifiers in URLs and must not have to be renumbered if a chapter is ever
 * inserted between two others.
 */
const chapters = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/chapters' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Reading order. Unique within a locale. */
    number: z.number().int().positive(),
    /** Act label, shown as the eyebrow and used to group the index. */
    act: z.string(),
    /** The <h1>, e.g. 'Chapter Four'. */
    heading: z.string(),
    /** Spoiler-free one-liner for the index. */
    summary: z.string(),
  }),
});

export const collections = { prose, journal, chapters };
