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

export const collections = { prose, journal };
