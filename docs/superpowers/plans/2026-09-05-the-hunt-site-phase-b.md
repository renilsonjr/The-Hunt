# The Hunt Website — Phase B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the site's depth layer — a spoiler-gated codex, the original dream log, and a journal — on top of Astro content collections, so that publishing new writing becomes a content commit rather than a code change.

**Architecture:** Two locale-keyed content collections (`prose` for long-form pages, `journal` for dated entries) replace hand-authored prose for all *new* content. The six Phase A teaser pages stay as they are — their prose is fixed and their layouts are bespoke, so migrating them would be churn without benefit. The spoiler boundary is a native `<details>` element enhanced by a small script, so it works without JavaScript and keeps the content in the DOM and crawlable, exactly as the spec requires.

**Tech Stack:** Astro 5 content collections with zod schemas, TypeScript, Vitest. Everything else is inherited from Phase A.

## Global Constraints

Every task's requirements implicitly include this section. These are unchanged from Phase A unless noted.

- **Base path is `/The-Hunt`.** Never hand-write an absolute path — route every URL through `localizePath()`.
- **Locales:** `en` at `/`, `pt` at `/pt/`. No automatic redirection. The language toggle switches to the *same* page in the other locale.
- **Dark theme only.** Palette via CSS custom properties, never literals: void `#0a0b12`, panel `#151726`, Zalian gold `#e8c873`, Balian violet `#9b6bf0`, Virden teal `#2dd4bf`, ink `#f2f0ea`, dim `#9491a6`, hairline `rgba(242,240,234,0.12)`. Partial alpha comes from `color-mix(in srgb, var(--token) N%, transparent)`.
- **Typefaces:** Cinzel (display), Literata (body), IBM Plex Mono (labels), Rubik Glitch — still reserved for the single word "Hunt" in the wordmark and nowhere else.
- **Gold is Earth 1, violet is Earth 2.** They mix only on the two hybrids. The seam always means the Barrier.
- **Locale page pairs must not duplicate CSS.** Shared markup and styling live in one component; locale files carry only content. This is why the collections exist.
- **`npm test` runs `astro check` first.** Type errors fail the suite. Every new type must actually check.
- **The spoiler boundary is a courtesy, not access control.** Content stays in the HTML and remains crawlable. Never describe it as protection, and never gate it behind JavaScript that could hide it from a reader who has JS disabled.
- **Motion** stays behind `@media (prefers-reduced-motion: no-preference)`. Nothing loops.
- Commit messages use conventional prefixes (`feat:`, `test:`, `chore:`, `fix:`).

## File Structure

| Path | Responsibility |
|---|---|
| `src/content.config.ts` | Collection definitions and zod schemas |
| `src/content/prose/en/*.md`, `src/content/prose/pt/*.md` | Long-form pages: codex, dream |
| `src/content/journal/en/*.md`, `src/content/journal/pt/*.md` | Dated journal entries |
| `src/lib/content.ts` | Typed helpers: fetch an entry by slug+locale, list journal entries, detect a missing translation |
| `src/components/SpoilerGate.astro` | The `<details>`-based boundary plus its localStorage enhancement |
| `src/components/TranslationNotice.astro` | The strip shown when a page falls back to English |
| `src/components/JournalList.astro` | Shared markup and styling for the journal index |
| `src/pages/codex.astro`, `src/pages/pt/codex.astro` | Codex routes |
| `src/pages/dream.astro`, `src/pages/pt/dream.astro` | Dream log routes |
| `src/pages/journal/index.astro`, `src/pages/pt/journal/index.astro` | Journal index |
| `src/pages/journal/[slug].astro`, `src/pages/pt/journal/[slug].astro` | Journal entry pages |
| `tests/unit/content.test.ts` | Helper behaviour, including fallback |
| `tests/build/codex.test.ts`, `dream.test.ts`, `journal.test.ts` | Built-output assertions |

---

## Task 1: Content collections foundation

**Files:**
- Create: `src/content.config.ts`, `src/lib/content.ts`
- Create: `src/content/prose/en/.gitkeep` (content arrives in later tasks)
- Create: `tests/unit/content.test.ts`
- Modify: `src/i18n/config.ts`

**Interfaces:**
- Consumes: `Locale`, `LOCALES`, `DEFAULT_LOCALE` from `~/i18n/config`.
- Produces:
  - `ROUTES` extended with `'codex' | 'dream' | 'journal'`
  - `Localized<T> = { entry: T; isFallback: boolean }`
  - `pickLocalized<T extends { id: string }>(entries: readonly T[], slug: string, locale: Locale): Localized<T> | undefined` — pure, the fallback rule
  - `getProse(slug: string, locale: Locale): Promise<Localized<CollectionEntry<'prose'>> | undefined>`
  - `listJournal(locale: Locale): Promise<JournalItem[]>`, newest first, where `JournalItem = Localized<CollectionEntry<'journal'>> & { slug: string }`
  - `getJournalEntry(slug: string, locale: Locale): Promise<JournalItem | undefined>`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/content.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `expected [ '', 'worlds', … ] to contain 'codex'`.

- [ ] **Step 3: Write minimal implementation**

Modify `src/i18n/config.ts` — extend the routes tuple:

```ts
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
```

Create `src/content.config.ts`:

```ts
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
```

Create `src/lib/content.ts`:

```ts
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

export interface JournalItem extends Localized<CollectionEntry<'journal'>> {
  slug: string;
}

/** Every journal slug that exists in any locale, newest first. */
export async function listJournal(locale: Locale): Promise<JournalItem[]> {
  const all = await getCollection('journal');

  const slugs = new Set(
    all.map((e) => parseId(e.id)).filter((p) => isLocale(p.locale)).map((p) => p.slug),
  );

  const items: JournalItem[] = [];
  for (const slug of slugs) {
    const picked = pickLocalized(all, slug, locale);
    if (!picked) continue;
    items.push({ slug, ...picked });
  }

  return items.sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());
}

export async function getJournalEntry(
  slug: string,
  locale: Locale,
): Promise<JournalItem | undefined> {
  const items = await listJournal(locale);
  return items.find((i) => i.slug === slug);
}
```

Create the content directories so the glob has somewhere to look:

```bash
mkdir -p src/content/prose/en src/content/prose/pt src/content/journal/en src/content/journal/pt
touch src/content/prose/en/.gitkeep src/content/prose/pt/.gitkeep
touch src/content/journal/en/.gitkeep src/content/journal/pt/.gitkeep
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 2 new route tests plus the 14 existing.

Then run `npm run test:build` and confirm the build still succeeds with empty collections. If Astro errors on an empty collection, that is a real finding: report it rather than adding placeholder content to work around it.

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/lib/content.ts src/content src/i18n/config.ts tests/unit/content.test.ts
git commit -m "feat: add locale-keyed content collections and their helpers"
```

---

## Task 2: The codex, behind its spoiler boundary

**Files:**
- Create: `src/components/SpoilerGate.astro`
- Create: `src/content/prose/en/codex.md`, `src/content/prose/pt/codex.md`
- Create: `src/pages/codex.astro`, `src/pages/pt/codex.astro`
- Create: `tests/build/codex.test.ts`
- Modify: `src/components/Header.astro`, `src/i18n/ui.ts`

**Interfaces:**
- Consumes: `getProse` from `~/lib/content`, `StoryPage` layout, `Seam`.
- Produces: `<SpoilerGate summary={string} storageKey={string}>` wrapping its default slot.

- [ ] **Step 1: Write the failing test**

Create `tests/build/codex.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('codex page', () => {
  it('exists in both locales', () => {
    expect(html('codex/index.html')).toContain('Zalian');
    expect(html('pt/codex/index.html')).toContain('Zalian');
  });

  it('states the speech constraint, which the whole plot turns on', () => {
    expect(html('codex/index.html')).toContain('aloud');
  });

  // The boundary is a courtesy, not access control. The words must be present
  // in the HTML for crawlers and for readers without JavaScript.
  it('ships the ending inside the document, not behind a fetch', () => {
    expect(html('codex/index.html')).toContain('seals');
    expect(html('pt/codex/index.html')).toContain('sela');
  });

  it('collapses the ending behind a details element that needs no JavaScript', () => {
    const doc = html('codex/index.html');
    expect(doc).toMatch(/<details[^>]*class="[^"]*gate/);
    expect(doc).toContain('<summary');
    // Closed by default: no `open` attribute in the emitted markup.
    expect(doc).not.toMatch(/<details[^>]+open/);
  });

  it('names what is behind the boundary rather than being coy', () => {
    expect(html('codex/index.html')).toMatch(/<summary[^>]*>[\s\S]{0,200}ending/i);
  });

  it('is reachable from the navigation', () => {
    expect(html('index.html')).toContain('href="/The-Hunt/codex/"');
    expect(html('pt/index.html')).toContain('href="/The-Hunt/pt/codex/"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build`
Expected: FAIL — `dist/codex/index.html` does not exist.

- [ ] **Step 3: Write minimal implementation**

Add to `src/i18n/ui.ts`'s `STRINGS` table:

```ts
  'nav.codex':      { en: 'Codex',       pt: 'Códex' },
  'nav.journal':    { en: 'Journal',     pt: 'Diário' },
  'nav.dream':      { en: 'The dream',   pt: 'O sonho' },
  'gate.summary':   {
    en: 'Everything past this point is the ending. Open it when you want it.',
    pt: 'Tudo daqui em diante é o final. Abra quando quiser.',
  },
```

Modify `src/components/Header.astro` — add codex and journal to the `links` array, keeping the existing order and style:

```ts
const links = [
  { route: 'worlds', label: t('nav.worlds', locale) },
  { route: 'gods', label: t('nav.gods', locale) },
  { route: 'hybrids', label: t('nav.hybrids', locale) },
  { route: 'sphere', label: t('nav.sphere', locale) },
  { route: 'codex', label: t('nav.codex', locale) },
  { route: 'gallery', label: t('nav.gallery', locale) },
  { route: 'journal', label: t('nav.journal', locale) },
] as const;
```

Create `src/components/SpoilerGate.astro`:

```astro
---
/**
 * The spoiler boundary. A native <details> element, deliberately:
 *  - the content sits in the DOM, so it is crawlable and readable without JS,
 *    which the spec requires ("a courtesy, not access control")
 *  - it is closed by default in the HTML, so there is no flash of the ending
 *    before any script runs
 *  - <summary> is focusable and operable by keyboard with no work from us
 *
 * The only enhancement is memory: once a reader opens it, we record that and
 * open it automatically next time, so they are not asked again on every page.
 */
interface Props {
  summary: string;
  storageKey: string;
}
const { summary, storageKey } = Astro.props;
---
<details class="gate" data-gate={storageKey}>
  <summary>{summary}</summary>
  <div class="gate-body">
    <slot />
  </div>
</details>

<style>
  .gate {
    border: 1px solid var(--hair);
    border-left: 2px solid var(--balian);
    border-radius: 10px;
    padding: 1rem 1.2rem;
    margin: 2rem 0;
    background: color-mix(in srgb, var(--panel) 70%, transparent);
  }
  summary {
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--dim);
  }
  summary:hover { color: var(--ink); }
  .gate[open] summary {
    margin-bottom: 1.2rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid var(--hair);
  }
  .gate-body :global(h2) { margin-top: 1.6rem; }
</style>

<script>
  // Remember the reader's choice across pages. Wrapped because storage throws
  // in some privacy modes, and a thrown error here must not break the page —
  // the <details> still works perfectly without this.
  document.querySelectorAll<HTMLDetailsElement>('details[data-gate]').forEach((gate) => {
    const key = `the-hunt:gate:${gate.dataset.gate}`;
    try {
      if (localStorage.getItem(key) === 'open') gate.open = true;
    } catch {}
    gate.addEventListener('toggle', () => {
      try {
        localStorage.setItem(key, gate.open ? 'open' : 'closed');
      } catch {}
    });
  });
</script>
```

Create `src/content/prose/en/codex.md`:

```markdown
---
title: "Codex — The Hunt"
description: "The complete mythology: the schism, the pact, the Barrier, the Hunt, and how it ends."
eyebrow: "The complete record"
heading: "Codex"
---

## Before there were worlds

Zalian is the original creator. Balian is what she made next — a peer, not a servant, and the only other being of her order.

They disagreed about one question, and it was not a small one: whether a creator should stand at a distance from what she has made, or live inside it. Zalian held that a world is only free if its author stays out of it. Balian wanted presence — to walk among his people, argue with them, be answerable to them.

Neither could convince the other, and neither would destroy the other. So they divided everything.

## The pact, and the Barrier

Two galaxies were seeded. **Earth 1** took Zalian's pure humans, unmixed with anything else. **Earth 2** took Balian and the followers who left with him, whose mixing with humanity produced the **Virden**.

Between them Zalian set a lock that no technology can pick, because it is not technological. The atmospheres of the two worlds are lethal to each other's species. A human breathing Virden air dies. A Virden breathing human air dies. There is no fleet, no treaty, no weapon that solves this.

And Zalian bound herself, too. She wrote a law she cannot break: she does not read a conscious mind. She hears only what is spoken aloud — and what is dreamed, because in REM the boundary between thinking and speaking dissolves and the mind says everything without knowing it.

That law was made out of respect for free will. It is also the flaw the entire story runs through.

## What Earth 2 built

Chaos made the Virden fast. War, scarcity and upheaval drove their science millennia past Earth 1's sheltered peace — but there was one thing all that progress could not reach. Zalian does not recognise them. They cannot hear her, cannot be guided by her, and want it desperately.

So they built a machine to steal what they could not be given.

It works because of an accident of deep time. A vanishingly small number of Earth 1 humans carry a dormant fragment of Balian's own lineage. To Zalian's dream channel, such a person reads as hers. To Earth 2's instruments, they are a door.

The machine scans for that fragment, models a candidate's whole life to predict how they will behave inside a constructed dream, builds the dream, and lets the sleeper walk through it while Zalian — believing she is guiding one of her own — pours out exactly the knowledge Earth 2 wants. The sleeper wakes remembering nothing.

They have been running this a long time. The Hunt is not the first.

## Fridan

An ordinary man in Nor Yesey, carrying that fragment and no idea of it. The probability engine picked him — not for who he is, but for where he could be plugged in.

Inside the dream he competes with aloof, wealthy strangers for a prize nobody names. A voice guides him: warm, patient, oddly scripted. A transit rail turns red beneath the city to show him the way. In a quiet room at the end of it, he finds a small blue object, unremarkable as a laundry ball, marked with two dots and one: `(: .)`

Closing his hand around it opens his mind to the scale of the universe. It also completes an exchange. The Sphere gives knowledge and takes everything — every word Zalian spoke, transmitted intact across the Barrier — and it leaves foreign biology behind in a body that never consented.

He was meant to wake with nothing. Interference from a third party broke the memory suppression. He woke remembering all of it.

## Severed

Zalian scans him afterwards, as she scans everyone. She finds something that is no longer entirely her own.

By her own law, she closes the connection. No warning, no explanation — the presence that has been in his head since childhood simply is not there any more. It is just, and it is unbearable, and it is exactly what Earth 2 needed to happen.

Then the **Second Faction** arrives: sympathetic, well-informed, explaining that Earth 2 is peaceful and only wants to be heard. Fridan's cognition is already changing from what the Sphere put in him, and he can see the seams in their story. They are not liberators. They are opportunists who want the creation codes for themselves — and their first instruction to him is to say nothing, because she can only hear what is spoken.

He works out the shape of it alone. Earth 2 reached a god through a human carrying the wrong DNA. Therefore the mirror must exist: somewhere on Earth 2, a Virden carrying a fragment of Zalian.

In their stolen data he finds her name.
```

Then, still in the same file, the gated portion — the route wraps everything from the marker onward. Add this at the end:

```markdown

<!--gate-->

## Uxies

She lives in the noise of Earth 2 and has never had a word for the stillness she feels, or for why it sets her apart from everyone she knows. She does not know she is half of a circuit. She does not know anyone is looking for her.

To reach Zalian, Fridan has to enter her sleep uninvited — do to her precisely what was done to him. He knows what it costs, because he is what it costs.

He refuses to do it their way. Rather than command her or take her mind, he uses his own Virden frequency to slip past Earth 2's surveillance, matches her natural REM rhythm, and plants a single harmonised resonance inside the dormant fragment she carries. Nothing taken. Nothing said in her name.

## The signal that could not be ignored

The fragment ignites — and because it is a piece of Zalian's own template, calling from the far side of a barrier she built herself, **she hears it.**

Everything arrives at once: Balian's ancient betrayal, the machine, the harvest running through human sleep for longer than any of her people have been alive, and one man who lost her and tried to warn her anyway.

She does not destroy Earth 2. She shifts the harmonic frequency of the Barrier itself, and the backdoor in human REM closes. Every extraction engine on Earth 2 goes dark in the same instant. It is the most violent thing she has ever done and it kills no one.

## After

Fridan stands on a rooftop in Nor Yesey at dawn. The voice is still gone. It is not coming back, and he will never be an ordinary man again — but the thing he was used to break, he closed.

Light-years away Uxies wakes above a city that has never once been quiet, and sits up into a silence she has no name for. Warm. Golden. Steady.

Someone was there. She is certain of it, and she cannot say how.

She looks up at a sky full of stars she has never been able to read, puts her hand against her chest, and begins to look for him.
```

Create `src/content/prose/pt/codex.md`:

```markdown
---
title: "Códex — The Hunt"
description: "A mitologia completa: a cisão, o pacto, a Barreira, a Caçada e como tudo termina."
eyebrow: "O registro completo"
heading: "Códex"
---

## Antes de existirem mundos

Zalian é a criadora original. Balian é o que ela criou em seguida — um par, não um servo, e o único outro ser da sua ordem.

Discordaram sobre uma única questão, e não era pequena: se um criador deve permanecer à distância daquilo que fez, ou viver dentro disso. Zalian sustentava que um mundo só é livre se sua autora ficar de fora. Balian queria presença — caminhar entre seu povo, discutir com ele, prestar contas a ele.

Nenhum dos dois convenceu o outro, e nenhum destruiria o outro. Então dividiram tudo.

## O pacto e a Barreira

Duas galáxias foram semeadas. A **Terra 1** ficou com os humanos puros de Zalian, sem mistura com nada. A **Terra 2** ficou com Balian e os seguidores que partiram com ele, cuja mistura com a humanidade produziu os **Virden**.

Entre elas, Zalian instalou uma tranca que nenhuma tecnologia arromba, porque não é tecnológica. As atmosferas dos dois mundos são letais para a espécie do outro. Um humano que respira o ar Virden morre. Um Virden que respira o ar humano morre. Não há frota, tratado ou arma que resolva isso.

E Zalian também se prendeu. Escreveu uma lei que não pode quebrar: ela não lê uma mente consciente. Ouve apenas o que é dito em voz alta — e o que é sonhado, porque no sono REM a fronteira entre pensar e falar se dissolve e a mente diz tudo sem saber que está dizendo.

Essa lei nasceu do respeito ao livre-arbítrio. É também a fresta por onde a história inteira passa.

## O que a Terra 2 construiu

O caos tornou os Virden rápidos. Guerra, escassez e convulsão empurraram sua ciência milênios além da paz protegida da Terra 1 — mas havia uma coisa que todo esse avanço não alcançava. Zalian não os reconhece. Não conseguem ouvi-la, não podem ser guiados por ela, e desejam isso desesperadamente.

Então construíram uma máquina para roubar o que não lhes era dado.

Ela funciona por um acidente do tempo profundo. Um número ínfimo de humanos da Terra 1 carrega um fragmento adormecido da própria linhagem de Balian. Para o canal de sonhos de Zalian, essa pessoa se apresenta como dela. Para os instrumentos da Terra 2, é uma porta.

A máquina varre em busca desse fragmento, modela a vida inteira de um candidato para prever como ele agirá dentro de um sonho construído, constrói o sonho e deixa o adormecido atravessá-lo enquanto Zalian — acreditando guiar um dos seus — derrama exatamente o conhecimento que a Terra 2 quer. O adormecido acorda sem lembrar de nada.

Fazem isso há muito tempo. A Caçada não é a primeira.

## Fridan

Um homem comum em Nor Yesey, carregando esse fragmento sem ideia alguma disso. A máquina de probabilidades o escolheu — não por quem ele é, mas por onde podia ser conectado.

Dentro do sonho, ele compete com estranhos ricos e distantes por um prêmio que ninguém nomeia. Uma voz o guia: calorosa, paciente, estranhamente ensaiada. Um trilho de trem fica vermelho sob a cidade para lhe mostrar o caminho. Numa sala silenciosa ao fim dele, encontra um pequeno objeto azul, banal como um tira-fiapos, marcado com dois pontos e um: `(: .)`

Fechar a mão em torno dele abre sua mente à escala do universo. Também completa uma troca. A Esfera dá conhecimento e leva tudo — cada palavra que Zalian disse, transmitida intacta através da Barreira — e deixa para trás biologia estrangeira num corpo que nunca consentiu.

Ele deveria acordar sem nada. A interferência de um terceiro quebrou a supressão da memória. Ele acordou lembrando de tudo.

## Cortado

Zalian o examina depois, como examina todos. Encontra algo que já não é inteiramente dela.

Pela própria lei, encerra a conexão. Sem aviso, sem explicação — a presença que esteve na cabeça dele desde a infância simplesmente não está mais ali. É justo, e é insuportável, e é exatamente o que a Terra 2 precisava que acontecesse.

Então chega a **Segunda Facção**: solidária, bem informada, explicando que a Terra 2 é pacífica e só quer ser ouvida. A cognição de Fridan já está mudando por causa do que a Esfera pôs nele, e ele enxerga as costuras da história. Não são libertadores. São oportunistas que querem os códigos da criação para si — e a primeira instrução que lhe dão é não dizer nada, porque ela só ouve o que é falado.

Ele deduz o formato disso sozinho. A Terra 2 alcançou uma deusa através de um humano que carregava o DNA errado. Portanto o espelho existe: em algum lugar da Terra 2, uma Virden carregando um fragmento de Zalian.

Nos dados roubados deles, ele encontra o nome dela.

<!--gate-->

## Uxies

Ela vive no ruído da Terra 2 e nunca teve uma palavra para a quietude que sente, nem para o motivo de isso a manter à parte de todos que conhece. Não sabe que é metade de um circuito. Não sabe que alguém a procura.

Para alcançar Zalian, Fridan precisa entrar no sono dela sem convite — fazer com ela exatamente o que fizeram com ele. Ele sabe o preço, porque ele é o preço.

Recusa-se a fazer do jeito deles. Em vez de comandá-la ou tomar sua mente, usa a própria frequência Virden para escapar da vigilância da Terra 2, sintoniza o ritmo natural do REM dela e planta uma única ressonância harmonizada dentro do fragmento adormecido que ela carrega. Nada tomado. Nada dito em nome dela.

## O sinal que não podia ser ignorado

O fragmento se acende — e porque é um pedaço do próprio molde de Zalian, chamando do outro lado de uma barreira que ela mesma ergueu, **ela ouve.**

Tudo chega de uma vez: a antiga traição de Balian, a máquina, a colheita correndo pelo sono humano há mais tempo do que qualquer um do seu povo está vivo, e um homem que a perdeu e ainda assim tentou avisá-la.

Ela não destrói a Terra 2. Desloca a frequência harmônica da própria Barreira, e a porta dos fundos no REM humano **se sela**. Todos os motores de extração da Terra 2 apagam no mesmo instante. É a coisa mais violenta que ela já fez e não mata ninguém.

## Depois

Fridan está num telhado em Nor Yesey ao amanhecer. A voz continua ausente. Não vai voltar, e ele nunca mais será um homem comum — mas aquilo que usaram para arrombar, ele fechou.

A anos-luz dali, Uxies acorda acima de uma cidade que nunca esteve quieta um só instante, e se senta dentro de um silêncio para o qual não tem nome. Morno. Dourado. Firme.

Alguém esteve ali. Ela tem certeza, e não sabe dizer como.

Olha para um céu cheio de estrelas que nunca conseguiu ler, põe a mão sobre o peito e começa a procurá-lo.
```

Create `src/pages/codex.astro`:

```astro
---
import StoryPage from '~/layouts/StoryPage.astro';
import SpoilerGate from '~/components/SpoilerGate.astro';
import { getProse } from '~/lib/content';
import { t } from '~/i18n/ui';
import { render } from 'astro:content';

const locale = 'en' as const;
const result = await getProse('codex', locale);
if (!result) throw new Error('codex content missing for ' + locale);

// The body is split on an HTML comment rather than kept in two files: the
// codex reads as one continuous document, and the boundary is a presentation
// decision about where the ending starts, not a content decision.
const [open, gated] = result.entry.body!.split('<!--gate-->');

const { Content: OpenPart } = await render({ ...result.entry, body: open });
const { Content: GatedPart } = await render({ ...result.entry, body: gated });
const { data } = result.entry;
---
<StoryPage
  locale={locale}
  route="codex"
  title={data.title}
  description={data.description}
  eyebrow={data.eyebrow}
  heading={data.heading}
>
  <div class="prose-body">
    <OpenPart />
  </div>

  <SpoilerGate summary={t('gate.summary', locale)} storageKey="codex">
    <div class="prose-body">
      <GatedPart />
    </div>
  </SpoilerGate>
</StoryPage>

<style>
  .prose-body { max-width: var(--measure); }
  .prose-body :global(h2) {
    font-size: 1.3rem;
    margin-top: 2.4rem;
    color: var(--zalian);
  }
  .prose-body :global(p) { color: var(--dim); }
  .prose-body :global(strong) { color: var(--ink); font-weight: 500; }
  .prose-body :global(code) {
    font-family: var(--font-mono);
    color: var(--zalian);
    font-size: 0.95em;
  }
</style>
```

Create `src/pages/pt/codex.astro` identically with `const locale = 'pt' as const;` and no other change — all copy comes from the collection.

**If `render()` cannot be called on a modified entry in this Astro version**, do not fight it: instead store the two halves as separate collection entries (`codex.md` and `codex-ending.md`) and render each normally. Say in your report which route you took and why.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — 6 codex tests green, plus the existing suite.

- [ ] **Step 5: Commit**

```bash
git add src/components/SpoilerGate.astro src/content/prose src/pages/codex.astro src/pages/pt/codex.astro src/components/Header.astro src/i18n/ui.ts tests/build/codex.test.ts
git commit -m "feat: publish the codex behind a no-JavaScript spoiler boundary"
```

---

## Task 3: The dream log

**Files:**
- Create: `src/content/prose/en/dream.md`, `src/content/prose/pt/dream.md`
- Create: `src/pages/dream.astro`, `src/pages/pt/dream.astro`
- Create: `tests/build/dream.test.ts`
- Modify: `src/components/Footer.astro`, `src/i18n/ui.ts`

**Interfaces:**
- Consumes: `getProse`, `StoryPage`.
- Produces: `/dream/` and `/pt/dream/`, linked from the footer rather than the nav.

**A decision this task must honour.** The dream log is a primary document — one person's account of one night, in their own words, in English. It is not translated on the Portuguese route. `/pt/dream/` carries a Portuguese introduction and then the original English text, labelled as the original. Translating it would quietly replace the artifact with a paraphrase of the artifact; presenting the original with a Portuguese frame keeps what makes it worth publishing.

**A privacy note carried from the spec.** The log names New Jersey. The author chose to publish it lightly cleaned — typo fixes only — and has been told twice that the location is in it. Keep it. Do not silently strip it, and do not silently expand the edit beyond typos.

- [ ] **Step 1: Write the failing test**

Create `tests/build/dream.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('dream log', () => {
  it('exists in both locales', () => {
    expect(html('dream/index.html')).toContain('goose');
    expect(html('pt/dream/index.html')).toContain('goose');
  });

  it('keeps the original English text on the Portuguese route', () => {
    // The artifact is one person's own words; the PT page frames it, it does
    // not replace it.
    const pt = html('pt/dream/index.html');
    expect(pt).toContain('Hans');
    expect(pt).toMatch(/documento original|texto original/i);
  });

  it('frames the log as a recovered document rather than as fiction', () => {
    expect(html('dream/index.html')).toMatch(/08\/26\/26|2026-08-26/);
  });

  it('is reachable from the footer', () => {
    expect(html('index.html')).toContain('href="/The-Hunt/dream/"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build`
Expected: FAIL — `dist/dream/index.html` does not exist.

- [ ] **Step 3: Write minimal implementation**

Add to `src/i18n/ui.ts`:

```ts
  'footer.dream':   { en: 'The original dream', pt: 'O sonho original' },
```

Create `src/content/prose/en/dream.md`. Frontmatter, then a short editorial note in the author's voice (the one place the spec allows it outside the journal), then the log itself copied **verbatim** from `dream-log-2026-08-26.md` at the repo root, with typo corrections only — no restructuring, no rewriting, no smoothing of grammar. Preserve the original's section headings ("Intro", "Development of the dream", and so on).

```markdown
---
title: "Dream 1 — The Hunt"
description: "The original dream log of 08/26/26, unedited: the document every other page on this site grew out of."
eyebrow: "The seed · 08/26/26"
heading: "Dream 1"
---

Everything on this site — the two worlds, the gods, the Barrier, the Sphere — grew out of the notes below. They were written the morning after the dream, before any of it was a story. Typos have been fixed and nothing else has been touched.
```

Then the log body.

Create `src/content/prose/pt/dream.md` — Portuguese frame, original English body:

```markdown
---
title: "Sonho 1 — The Hunt"
description: "O registro original do sonho de 26/08/26, sem edição: o documento de onde nasceu tudo o mais neste site."
eyebrow: "A semente · 26/08/26"
heading: "Sonho 1"
---

Tudo neste site — os dois mundos, os deuses, a Barreira, a Esfera — nasceu das anotações abaixo, escritas na manhã seguinte ao sonho, antes de qualquer disso ser uma história.

Este é o **documento original** e permanece em inglês, deliberadamente. É o relato de uma pessoa sobre uma noite, nas palavras dela; traduzi-lo trocaria o registro por uma paráfrase do registro. Apenas erros de digitação foram corrigidos.
```

Then the same English log body, unchanged.

Create `src/pages/dream.astro` — same shape as the codex route but with no gate:

```astro
---
import StoryPage from '~/layouts/StoryPage.astro';
import { getProse } from '~/lib/content';
import { render } from 'astro:content';

const locale = 'en' as const;
const result = await getProse('dream', locale);
if (!result) throw new Error('dream content missing for ' + locale);
const { Content } = await render(result.entry);
const { data } = result.entry;
---
<StoryPage
  locale={locale}
  route="dream"
  title={data.title}
  description={data.description}
  eyebrow={data.eyebrow}
  heading={data.heading}
>
  <div class="log">
    <Content />
  </div>
</StoryPage>

<style>
  .log { max-width: var(--measure); }
  .log :global(h2) {
    font-family: var(--font-mono);
    font-size: 0.74rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--dim);
    margin-top: 2.4rem;
  }
  .log :global(p) { color: var(--ink); }
  .log :global(p:first-of-type) {
    color: var(--dim);
    font-style: italic;
    border-left: 2px solid var(--hair);
    padding-left: 1rem;
  }
</style>
```

Create `src/pages/pt/dream.astro` identically with `locale = 'pt'`.

Modify `src/components/Footer.astro`. It currently renders a status span and a repo link inside `.site-footer`. Add the dream link between them, and import `localizePath`:

```astro
---
import { t } from '~/i18n/ui';
import { localizePath } from '~/i18n/utils';
import type { Locale } from '~/i18n/config';

interface Props { locale: Locale }
const { locale } = Astro.props;
---
<footer class="site-footer">
  <span>{t('footer.status', locale)}</span>
  <a href={localizePath('dream', locale)}>{t('footer.dream', locale)}</a>
  <a href="https://github.com/renilsonjr/The-Hunt">{t('footer.repo', locale)}</a>
</footer>
```

Leave the existing `<style>` block untouched — it already lays the footer out with `justify-content: space-between` and `flex-wrap`, so a third item needs no CSS change.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — 4 dream tests green.

- [ ] **Step 5: Commit**

```bash
git add src/content/prose src/pages/dream.astro src/pages/pt/dream.astro src/components/Footer.astro src/i18n/ui.ts tests/build/dream.test.ts
git commit -m "feat: publish the original dream log"
```

---

## Task 4: The journal

**Files:**
- Create: `src/components/JournalList.astro`, `src/components/TranslationNotice.astro`
- Create: `src/content/journal/en/2026-09-05-the-site-is-live.md`, `src/content/journal/pt/2026-09-05-the-site-is-live.md`
- Create: `src/pages/journal/index.astro`, `src/pages/pt/journal/index.astro`
- Create: `src/pages/journal/[slug].astro`, `src/pages/pt/journal/[slug].astro`
- Create: `tests/build/journal.test.ts`
- Modify: `src/i18n/ui.ts`

**Interfaces:**
- Consumes: `listJournal`, `getJournalEntry` from `~/lib/content`.
- Produces: `/journal/`, `/journal/<slug>/` and their `/pt/` counterparts.

**The fallback rule this task establishes.** Every journal slug builds in both locales. When a translation is missing, the page renders the English body with a visible `TranslationNotice` at the top saying so in the reader's language. This is what keeps the language toggle from ever 404ing — the counterpart route always exists — and it satisfies the spec's requirement that a missing translation degrade visibly rather than silently.

- [ ] **Step 1: Write the failing test**

Create `tests/build/journal.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = (p: string) => resolve(process.cwd(), 'dist', p);
const html = (p: string) => readFileSync(dist(p), 'utf8');

describe('journal', () => {
  it('has an index in both locales', () => {
    expect(existsSync(dist('journal/index.html'))).toBe(true);
    expect(existsSync(dist('pt/journal/index.html'))).toBe(true);
  });

  it('lists the first entry and links to it', () => {
    expect(html('journal/index.html')).toContain('href="/The-Hunt/journal/2026-09-05-the-site-is-live/"');
  });

  it('builds the entry page in both locales', () => {
    expect(existsSync(dist('journal/2026-09-05-the-site-is-live/index.html'))).toBe(true);
    expect(existsSync(dist('pt/journal/2026-09-05-the-site-is-live/index.html'))).toBe(true);
  });

  it('shows the date on the index', () => {
    expect(html('journal/index.html')).toMatch(/2026/);
  });

  // The whole point of building both locales: the toggle must never 404.
  it('gives every entry a working language toggle', () => {
    const en = html('journal/2026-09-05-the-site-is-live/index.html');
    expect(en).toContain('<a class="lang" href="/The-Hunt/pt/journal/2026-09-05-the-site-is-live/"');
    const pt = html('pt/journal/2026-09-05-the-site-is-live/index.html');
    expect(pt).toContain('<a class="lang" href="/The-Hunt/journal/2026-09-05-the-site-is-live/"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build`
Expected: FAIL — no journal routes exist.

- [ ] **Step 3: Write minimal implementation**

Add to `src/i18n/ui.ts`:

```ts
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
```

Create `src/components/TranslationNotice.astro`:

```astro
---
import { t } from '~/i18n/ui';
import type { Locale } from '~/i18n/config';
interface Props { locale: Locale }
const { locale } = Astro.props;
---
<p class="notice">{t('notice.fallback', locale)}</p>

<style>
  .notice {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    color: var(--dim);
    border: 1px solid var(--hair);
    border-left: 2px solid var(--virden);
    border-radius: 6px;
    padding: 0.7rem 0.9rem;
    margin-bottom: 1.6rem;
  }
</style>
```

Create `src/components/JournalList.astro`:

```astro
---
// Shared markup and styling for the journal index. Follows the house pattern
// set by GalleryGrid: one `locale` prop, the component does its own data
// access, and every rule lives here so the two locale pages carry no CSS.
import { listJournal } from '~/lib/content';
import { localizePath } from '~/i18n/utils';
import { HREFLANG, type Locale } from '~/i18n/config';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const items = await listJournal(locale);

const formatter = new Intl.DateTimeFormat(HREFLANG[locale], {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---
<ol class="entries">
  {items.map((item) => (
    <li class="entry">
      <a href={localizePath(`journal/${item.slug}`, locale)}>
        <time datetime={item.entry.data.date.toISOString().slice(0, 10)}>
          {formatter.format(item.entry.data.date)}
        </time>
        <h2>{item.entry.data.title}</h2>
        <p>{item.entry.data.summary}</p>
      </a>
    </li>
  ))}
</ol>

<style>
  .entries {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: var(--measure);
  }
  .entry a {
    display: block;
    text-decoration: none;
    color: inherit;
    background: var(--panel);
    border: 1px solid var(--hair);
    border-left: 2px solid var(--zalian);
    border-radius: 10px;
    padding: 1.2rem 1.3rem;
    transition: border-color 0.2s ease;
  }
  .entry a:hover { border-color: color-mix(in srgb, var(--zalian) 55%, transparent); }
  time {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
  }
  h2 {
    font-size: 1.2rem;
    margin: 0.5rem 0 0.4rem;
  }
  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.92rem;
  }
</style>
```

Create `src/content/journal/en/2026-09-05-the-site-is-live.md`:

```markdown
---
title: "The site is live"
description: "Phase 1 is done: the world is locked, the site is up, and the actual writing starts now."
date: 2026-09-05
summary: "The world is locked and the site is up. Now comes the part nobody can automate."
---

The world is finished. Not the book — the world.

Zalian and Balian, the pact that split them, the Barrier made of air rather than steel, the Sphere and the glyph nobody has explained yet, the two people carrying the wrong god's DNA in the wrong galaxy. All of it is written down, consistent with itself, and now it is up here where it can be read.

That is a real milestone and also a slightly dangerous one, because building a world is fun and writing a book is not. It is very easy to keep polishing a mythology forever and call it progress.

So: the next entry in this journal will not be about the site. It will be about Chapter 1 — the dream log downstairs, turned into prose. That is the only thing left that matters.

If you are reading this, you are extremely early. There is no book yet. There is a world, some pictures, and one man on a rooftop who cannot hear anyone any more.
```

Create `src/content/journal/pt/2026-09-05-the-site-is-live.md` — same `date`, same slug:

```markdown
---
title: "O site está no ar"
description: "A Fase 1 terminou: o mundo está fechado, o site está de pé, e agora começa a escrita de verdade."
date: 2026-09-05
summary: "O mundo está fechado e o site está no ar. Agora vem a parte que ninguém automatiza."
---

O mundo está pronto. Não o livro — o mundo.

Zalian e Balian, o pacto que os separou, a Barreira feita de ar e não de aço, a Esfera e o glifo que ninguém explicou ainda, as duas pessoas carregando o DNA do deus errado na galáxia errada. Está tudo escrito, coerente consigo mesmo, e agora está aqui em cima, onde pode ser lido.

É um marco real e também um pouco perigoso, porque construir um mundo é divertido e escrever um livro não é. É muito fácil ficar polindo uma mitologia para sempre e chamar isso de progresso.

Então: a próxima entrada deste diário não será sobre o site. Será sobre o Capítulo 1 — o registro do sonho, aqui embaixo, transformado em prosa. É a única coisa que ainda importa.

Se você está lendo isto, chegou muito cedo. Ainda não há livro. Há um mundo, algumas imagens, e um homem num telhado que não consegue mais ouvir ninguém.
```

Create `src/pages/journal/index.astro`:

```astro
---
import StoryPage from '~/layouts/StoryPage.astro';
import JournalList from '~/components/JournalList.astro';
import { t } from '~/i18n/ui';

const locale = 'en' as const;
---
<StoryPage
  locale={locale}
  route="journal"
  title="Journal — The Hunt"
  description="Notes from building this site, and from writing the book it is about."
  eyebrow={t('journal.title', locale)}
  heading={t('journal.title', locale)}
>
  <p class="intro">{t('journal.intro', locale)}</p>
  <JournalList locale={locale} />
</StoryPage>

<style>
  .intro {
    color: var(--dim);
    max-width: var(--measure);
    margin-bottom: 2.4rem;
  }
</style>
```

Mirror it at `src/pages/pt/journal/index.astro` with `const locale = 'pt' as const;`, `title="Diário — The Hunt"` and `description="Notas sobre a construção deste site e sobre a escrita do livro de que trata."`. Everything else is identical, since the visible strings come from the UI table.

Create `src/pages/journal/[slug].astro`:

```astro
---
import StoryPage from '~/layouts/StoryPage.astro';
import TranslationNotice from '~/components/TranslationNotice.astro';
import { listJournal } from '~/lib/content';
import { localizePath } from '~/i18n/utils';
import { t } from '~/i18n/ui';
import { render } from 'astro:content';

const locale = 'en' as const;

export async function getStaticPaths() {
  const items = await listJournal('en');
  return items.map((item) => ({ params: { slug: item.slug }, props: { item } }));
}

const { item } = Astro.props;
const { Content } = await render(item.entry);
const { data } = item.entry;
---
<StoryPage
  locale={locale}
  route="journal"
  title={`${data.title} — The Hunt`}
  description={data.description}
  eyebrow={data.date.toISOString().slice(0, 10)}
  heading={data.title}
>
  {item.isFallback && <TranslationNotice locale={locale} />}
  <div class="entry"><Content /></div>
  <p class="back"><a href={localizePath('journal', locale)}>← {t('journal.back', locale)}</a></p>
</StoryPage>

<style>
  .entry { max-width: var(--measure); }
  .entry :global(p) { color: var(--dim); }
  .back {
    margin-top: 2.4rem;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .back a { text-decoration: none; }
  .back a:hover { text-decoration: underline; }
</style>
```

Mirror it at `src/pages/pt/journal/[slug].astro` with `locale = 'pt'` and `listJournal('pt')` in `getStaticPaths`.

Note the `route="journal"` on entry pages: it makes the nav highlight Journal and, critically, makes the language toggle point at the *index* rather than a non-existent counterpart. **If you can make the toggle point at the entry's own counterpart instead — which is better, and safe because both locales always build — do that and say how in your report.**

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — 5 journal tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/JournalList.astro src/components/TranslationNotice.astro src/content/journal src/pages/journal src/pages/pt/journal src/i18n/ui.ts tests/build/journal.test.ts
git commit -m "feat: add the journal with a visible missing-translation fallback"
```

---

## Task 5: i18n polish and phase verification

**Files:**
- Modify: `src/components/Head.astro`
- Modify: `tests/build/head.test.ts`, `tests/build/furniture.test.ts`

**Interfaces:**
- Consumes: everything above.
- Produces: no new exports.

- [ ] **Step 1: Write the failing test**

Add to `tests/build/head.test.ts`, inside the `document head` describe:

```ts
  it('emits an x-default alternate for readers whose language matches neither', () => {
    // Without it, a crawler has no instruction for, say, a French reader.
    // x-default points at the default locale.
    const doc = html('index.html');
    expect(doc).toMatch(/<link rel="alternate" hreflang="x-default" href="\/The-Hunt\/"/);
  });
```

Add to `tests/build/furniture.test.ts`, inside the `sitemap` describe:

```ts
  it('lists the Phase B routes', () => {
    const xml = read('sitemap-0.xml');
    for (const route of ['codex', 'dream', 'journal']) {
      expect(xml, `sitemap is missing /${route}/`).toContain(
        `https://renilsonjr.github.io/The-Hunt/${route}/`,
      );
      expect(xml, `sitemap is missing /pt/${route}/`).toContain(
        `https://renilsonjr.github.io/The-Hunt/pt/${route}/`,
      );
    }
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build`
Expected: FAIL on the x-default assertion. The sitemap assertion should already pass, because the sitemap integration picks up every built route automatically — if it fails, that is a real finding worth reporting.

- [ ] **Step 3: Write minimal implementation**

In `src/components/Head.astro`, after the existing alternates map, add:

```astro
{/*
  x-default tells a crawler which version to serve a reader whose language
  matches neither alternate. It points at the default locale.
*/}
<link rel="alternate" hreflang="x-default" href={localizePath(route, DEFAULT_LOCALE)} />
```

Import `localizePath` from `~/i18n/utils` and `DEFAULT_LOCALE` from `~/i18n/config` at the top of the frontmatter.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — whole suite green.

- [ ] **Step 5: Commit**

```bash
git add src/components/Head.astro tests/build/head.test.ts tests/build/furniture.test.ts
git commit -m "feat: emit an x-default alternate"
```

- [ ] **Step 6: Phase verification**

Run these and record the results in your report:

1. `npm test && npm run test:build` — full suite green, output pristine.
2. `rm -rf dist node_modules/.astro && npm run test:build` — green from a cold cache.
3. Count built pages: `find dist -name "*.html" | wc -l`. Expect 20 — 9 routes × 2 locales, plus the 404 and the legacy concept page.
4. Confirm no unreferenced derivatives crept in: every file in `dist/_astro` should be referenced by some built `.html` or `.css`.
5. Confirm the codex ending is present in the HTML of both locales while the `<details>` has no `open` attribute — the crawlable-but-collapsed property the spec requires.

---

## Known gaps carried past Phase B

- **The six Phase A teaser pages remain hand-authored `.astro` files**, not collection entries. This is deliberate: their prose is fixed and their layouts are bespoke, so migrating them buys nothing today. Revisit only if their copy starts changing often.
- **The JPEG fallback weight** (~9.5 MB of `dist/_astro` that no modern browser fetches) is untouched. `<Picture>`'s `fallbackFormat` is the knob.
- **Phase C — `/read/`** and the chapter system remain blocked on the novel's first draft, not on this codebase.
- **Every Portuguese string on the site, including everything this phase adds, is a non-native draft** and still needs the author's review before the site is promoted anywhere.
