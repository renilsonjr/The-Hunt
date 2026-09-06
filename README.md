# 🌌 The Hunt

> *"In a universe where gods only hear what is spoken, the mind's deepest sleep became an open door."*

A science-fiction novel in development, plus early product concepts for adapting it.

### ▶ [Open the site](https://renilsonjr.github.io/The-Hunt/)

| | |
|---|---|
| 🌗 **[Website concept](https://renilsonjr.github.io/The-Hunt/concepts/worlds-of-the-hunt.html#site)** | The two worlds either side of the Barrier |
| 🎮 **[Game concept](https://renilsonjr.github.io/The-Hunt/concepts/worlds-of-the-hunt.html#game)** | Four playable scenes — pick a chapter, then a line |

**The premise.** An ordinary man in Nor Yesey wakes carrying memories of a dream he was never meant to remember. He was selected — not chosen, *selected*, by a probability algorithm scanning billions of minds for a dormant strand of alien DNA — and used as a biological relay so an advanced sibling civilization could siphon the codes of creation from a god who cannot read thoughts, only words and dreams. The theft leaves him no longer entirely human, and the god he wants to warn has already severed the connection. To reach her, he must find the mirror of himself: a woman in another galaxy who carries a fragment of that same god, and violate her sleep exactly as his own was violated.

---

## Repository contents

| Path | What it is |
|---|---|
| [`story_bible.md`](story_bible.md) | The canonical world: the gods, the two Earths, the Barrier, the Sphere, character files, plot structure, open questions |
| [`the_hunt_synopsis_and_lore.md`](the_hunt_synopsis_and_lore.md) | Resolved lore and the complete three-act synopsis through the epilogue |
| [`the_hunt_analysis.md`](the_hunt_analysis.md) | Story analysis and science-fiction reference points |
| [`dream-log-2026-08-26.md`](dream-log-2026-08-26.md) | The original dream log, the document everything else grew out of |
| [`book_roadmap.md`](book_roadmap.md) | Six-phase development plan from dream log to published illustrated novel |
| [`src/`](src/) | The site (below) |
| [`src/assets/art/`](src/assets/art/) | 22 illustrations — character sheets, world plates, key scenes |
| [`public/concepts/`](public/concepts/) | Interactive product concepts (below) |
| [`docs/superpowers/`](docs/superpowers/) | The site's design spec, phase plans and follow-up list |

---

## The site

An [Astro](https://astro.build) static site, built to `dist/` and published to
GitHub Pages. It is bilingual throughout: English at `/`, Portuguese at
`/pt/`, with a toggle that switches to the *same* page rather than dropping
the reader on the homepage.

### Routes

Every one of these exists in both languages — `/gods/` and `/pt/gods/`, and so on.

| Route | What it is |
|---|---|
| `/` | Landing page |
| `/worlds/` | Earth 1 and Earth 2 either side of the Barrier |
| `/gods/` · `/hybrids/` | Zalian and Balian; Fridan and Uxies |
| `/sphere/` | The Sphere and the glyph |
| `/gallery/` | All 22 illustrations, with a lightbox |
| `/codex/` | The mythology, with the ending behind a spoiler boundary |
| `/dream/` | The original dream log, framed but not translated |
| `/journal/` · `/journal/<slug>/` | Development journal |

Plus a `404.html` that GitHub Pages serves for unmatched paths.

### How it is put together

- **Prose lives in Markdown, not in components.** `src/content/prose/` and
  `src/content/journal/` are Astro content collections, keyed by locale in
  the directory name (`prose/en/codex.md`, `prose/pt/codex.md`), so publishing
  is a content commit rather than a code change. The six Phase A teaser pages
  are the deliberate exception: they are hand-authored `.astro` layouts, not
  documents, and gain nothing from the collections.
- **A missing translation is visible, never silent.** When a page exists only
  in English, the Portuguese route still builds — so the toggle never 404s —
  and says in Portuguese that it is showing the English original.
- **Images** are imported through Astro's pipeline from `src/assets/art/`,
  which emits AVIF/WebP/JPEG at several widths; nothing is hand-optimised.
- **Locale page pairs share one component.** Markup and CSS live in one place;
  the locale route files carry only which locale and which content they are.

### Running it

```sh
npm install
npm run dev          # local dev server
npm run build        # static build into dist/
npm run preview      # serve the built output
npm test             # astro check + unit tests
npm run test:build   # build, then assert against the built HTML
```

Pushing to `main` runs both test commands in CI and, if they pass, publishes
`dist/` to GitHub Pages.

---

## The cosmology, briefly

**Zalian** created **Balian**, then lost him to a philosophical split: order through distant guidance versus immediate immanence. Rather than destroy each other they made a pact and seeded two galaxies — **Earth 1**, her pure humans, and **Earth 2**, his mixed **Virden**. The **Barrier** between them is biological, not technological: each world's atmosphere is lethal to the other's species. Only hybrids survive both.

Zalian bound herself to a law she cannot break: she does not read conscious thought. She hears only what is spoken aloud — and what is dreamed, because in REM the boundary between thought and speech dissolves. That single constraint is the vulnerability the entire story turns on.

Two anomalies mirror each other across the void. **Fridan**, an Earth 1 human carrying a fragment of Balian. **Uxies**, an Earth 2 Virden carrying a fragment of Zalian. Together they form a closed circuit across a barrier neither world can cross.

---

## Concepts

**[Open them live →](https://renilsonjr.github.io/The-Hunt/concepts/worlds-of-the-hunt.html)** ([website](https://renilsonjr.github.io/The-Hunt/concepts/worlds-of-the-hunt.html#site) · [game](https://renilsonjr.github.io/The-Hunt/concepts/worlds-of-the-hunt.html#game))

[`public/concepts/worlds-of-the-hunt.html`](public/concepts/worlds-of-the-hunt.html) — a single self-contained page holding two directions for adapting the story. Every illustration is embedded, so it also opens straight from disk with no server and no network.

**Website concept.** An interactive illustrated story site. The hero splits Earth 1 and Earth 2 either side of the Barrier, rendered as a live lightning seam; below it the four principals are presented as two mirrored pairs — each hybrid cracked open by the other world's color.

**Game concept.** A choice-driven narrative game in the Telltale mold, built on the illustrations in this repo. Four playable scenes — the Hunt, the Sphere, the faction, the reverse dream — each with a dialogue box and tagged decisions.

Its core mechanic comes straight out of the lore. Every option is **Spoken**, **Thought**, **Silence**, or **Act**, and Zalian's constraint decides what reaches her:

- **Awake**, only spoken lines cross. A thought returns *"She heard nothing."*
- **Dreaming**, the boundary dissolves and even a thought returns *"Zalian heard that — even unspoken."*

The same menu obeys two different physics depending on whether the player is asleep — which means dream chapters expose the player precisely when they feel most private. That is also, exactly, how Earth 2 robs her.

Silence is a completable playstyle, not a fail state: a player can go whole chapters saying nothing and reach an ending where Zalian never learns she was robbed.

---

## Status

Phase 1 — foundation. The world, cosmology, characters and three-act structure
are locked, and the site that presents them is up: the teaser pages, the codex,
the dream log and the journal, in both languages. The first draft is not yet
written. Open development questions are tracked at the end of
[`story_bible.md`](story_bible.md); outstanding work on the site is tracked in
[`docs/superpowers/phase-a-followups.md`](docs/superpowers/phase-a-followups.md).
