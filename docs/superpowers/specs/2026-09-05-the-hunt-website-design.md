# The Hunt — Website Design

**Date:** 2026-09-05
**Status:** Approved design, ready for implementation planning
**Repo:** [renilsonjr/The-Hunt](https://github.com/renilsonjr/The-Hunt)

---

## 1. What this is

A bilingual static site for *The Hunt*, a science-fiction novel in development. It launches as a **world teaser** — cosmology, characters and art — and is architected so serialized chapters slot in later without a rebuild.

The site is not blocked on design or art. The visual language exists (established in `concepts/worlds-of-the-hunt.html`) and 22 illustration plates exist. It is blocked on **content**: the novel has no drafted chapters, and the material that exists is authorial reference, not reader-facing prose.

### Goals

1. Give the story a real home a reader can be sent to.
2. Present the mythology as an experience, not a wiki dump.
3. Establish the serial infrastructure now, so publishing Chapter 1 later is a content commit, not a project.
4. Serve both English and Brazilian Portuguese readers.

### Non-goals

- Email capture, newsletters, subscriber management. Explicitly deferred.
- A custom domain. Stays on `renilsonjr.github.io/The-Hunt` for now.
- Any CMS, database, or server. The site is static.
- Publishing drafted chapters — none exist yet.

---

## 2. Decisions taken

| Decision | Choice | Consequence |
|---|---|---|
| Purpose | Teaser now, serial later | Chapter routing and templates designed in Phase A, built in Phase C |
| Spoilers | Everything public | Full plot including the ending ships, behind a labelled boundary |
| Language | Bilingual EN + PT-BR | Every page, and every future chapter, needs two versions |
| Chapter 1 | Recovered dream log, not prose | Site publishes the log as an artifact; Chapter 1 remains unwritten |
| Dream log | Publish, lightly cleaned | Typo fixes only; content and voice preserved |
| Domain | `github.io` for now | No DNS work; site must read as a book's home despite the URL |
| Email list | Skipped | No form, no third-party embed, no privacy policy needed in v1 |

---

## 3. Audience

Someone who followed a link from social media or the repo, knows nothing about *The Hunt*, and gives the page about fifteen seconds. The site must land the premise in one screen and make the mythology explorable for the minority who want more.

Secondary: the author, using the public codex as a reference while drafting.

---

## 4. Information architecture

Each route exists twice: `/` (English) and `/pt/` (Portuguese).

| Route | Purpose | Primary source |
|---|---|---|
| `/` | Hero, logline, premise, entry points | New copy |
| `/worlds/` | Earth 1, Earth 2, the Barrier | Concept mock, `story_bible.md` |
| `/gods/` | Zalian and Balian, the schism, the pact | `story_bible.md` |
| `/hybrids/` | Fridan and Uxies as mirrored anomalies | `story_bible.md`, `second_lore_uxies.md` |
| `/sphere/` | The Sphere, the Hunt, the speech constraint | `story_bible.md` |
| `/codex/` | Complete plot including the ending | `the_hunt_synopsis_and_lore.md` |
| `/dream/` | The original dream log of 08/26/26 | `dream-log-2026-08-26.md` |
| `/gallery/` | All 22 plates, captioned | `grok-assets/` |
| `/journal/` | Progress posts as the draft advances | New, ongoing |
| `/read/` | Chapter index — Phase C | Future chapters |

`/concepts/worlds-of-the-hunt.html` stays live at its current URL, served as a static passthrough. It is already linked publicly and must not 404.

### Navigation

Persistent header: wordmark, four links (Worlds, Characters, Codex, Gallery), language toggle. `/journal/` and `/read/` join the nav when they have content. Characters is a single entry covering gods and hybrids; the two pages cross-link.

---

## 5. Content plan

### The core problem

`story_bible.md` is written to the author, in author's voice, with open questions and craft notes inline ("*a mystery to develop*", "*Estimated time for Phase 1*"). None of it can be pasted onto a public page. Every page needs a rewrite pass into reader-facing prose.

### Voice

In-world, present tense, declarative. The site states the mythology as fact rather than describing a book that will describe it. Author's-voice framing appears only on `/journal/` and in the note atop `/dream/`.

### Per-page word budget

| Page | English words | Notes |
|---|---|---|
| `/` | 150 | Logline plus two short paragraphs |
| `/worlds/` | 400 | Two panels plus the Barrier explained |
| `/gods/` | 500 | 250 each, mirrored structure |
| `/hybrids/` | 500 | 250 each, mirrored structure |
| `/sphere/` | 350 | Object, glyph, mechanic |
| `/codex/` | 1,200 | Adapted from the existing synopsis |
| `/dream/` | 900 | Existing text, typo pass only |
| `/gallery/` | 22 captions | ~15 words each |

Roughly 4,000 words of English, of which about 2,000 is adaptation of existing text and 2,000 is new writing. Then the same again in Portuguese.

### Spoiler boundary

`/codex/` and the Act 3 section of any page open behind an interstitial: a short line naming what is past it, and a continue control. The choice persists in `localStorage`. Content stays in the HTML and remains crawlable — this is a courtesy, not access control, and must not be described as protection.

### Content prerequisites

Two documents live outside the repo and must be brought in before writing starts:

- `second_lore_uxies.md` — the Uxies pillar, referenced by `story_bible.md` but absent
- `the_hunt_sinopse_e_lore_pt_br.md` — the Portuguese synopsis, the seed of the PT-BR content

### Known content gaps

Balian's fallen angels are unnamed in all source material. `/gods/` must be written so the gap does not show, or the name must be decided first. Flagged, not blocking.

---

## 6. Bilingual strategy

- English is the source language. Portuguese is a translation, not an independent edition.
- Route prefix: `/` for `en`, `/pt/` for `pt-BR`. No automatic redirection by browser locale — the visitor chooses, and the choice persists.
- Every page carries `hreflang` links to its counterpart.
- The language toggle switches to the *same page* in the other language, never to the homepage.
- Content collections are keyed by locale; a missing translation falls back to English with a visible notice rather than a broken route.
- Claude drafts the Portuguese; the author reviews and corrects as native speaker. This review is a required step, not optional polish.

**Standing cost:** every future journal post and chapter needs both languages. This is the largest ongoing commitment in the plan and the most likely thing to be abandoned. If Portuguese lags in practice, the fallback notice keeps the site coherent.

---

## 7. Design system

Inherited from the concept page, which is the reference implementation.

**Color.** Void `#0a0b12`; panel `#151726`; Zalian gold `#e8c873`; Balian violet `#9b6bf0`; Virden teal `#2dd4bf`; ink `#f2f0ea`; dim `#9491a6`. Gold belongs to Earth 1, violet to Earth 2, and the two never mix except on the hybrids, where a gradient crossing both marks the mirror.

**Type.** Cinzel for display and headings; Literata for body and quotations; IBM Plex Mono for labels, eyebrows and metadata; Rubik Glitch reserved exclusively for the word "Hunt" in the wordmark. All from Google Fonts, subset and self-hosted at build time.

**Motion.** Scroll-triggered reveals on section entry, nothing looping, nothing autoplaying. Everything behind `prefers-reduced-motion`.

**The seam.** The jagged gold-to-violet divider is the site's signature device. It appears on `/worlds/` as the hero split and recurs as a section rule elsewhere. It always means the Barrier — never decoration.

**Dark only.** The subject is a night sky and the art is dark. A light theme would fight both. This is a deliberate single-theme commitment: every color is declared explicitly, nothing inherits from the host.

---

## 8. Technical architecture

**Framework:** Astro. Chosen for Markdown content collections (the bible stays the source of truth), first-class image optimization, built-in i18n routing, and zero JavaScript shipped by default — correct for an art-heavy, largely static, text-driven site.

**Interactive surface** is deliberately tiny: language toggle, spoiler gate, gallery lightbox. Each is a small island; no framework runtime.

### Image pipeline — the real engineering

The 22 plates are 1152×1728 JPEGs, 0.5–1.2MB each, ~19MB total. The concept page inlines eleven of them as base64 into a single 1.95MB file. That is correct for a self-contained mock and wrong for a site: nothing caches, nothing lazy-loads, and every visitor pays for every image before first paint.

Requirements:

- Source art moves to `src/assets/art/` with descriptive filenames, replacing the `grok-<uuid>.jpg` names
- AVIF and WebP derivatives at widths 400 / 800 / 1200 / 1600, JPEG fallback
- `srcset` and `sizes` on every image; `loading="lazy"` and `decoding="async"` below the fold
- Explicit `width`/`height` on every image so nothing shifts during load
- LQIP blur placeholder for hero plates
- An art manifest (`src/data/art.json`) holding id, title, alt text in both languages, and usage — the single place art metadata lives

**Budget:** ≤ 400KB transferred for the landing page above the fold; ≤ 1.2MB for the gallery's first screen. If a page cannot meet this, it loses images, not the budget.

### Build and deploy

GitHub Actions builds Astro and deploys to Pages, replacing the current legacy branch-based build. Same URL throughout. `public/concepts/` preserves the existing concept page byte-for-byte.

### Accessibility

Alt text for all 22 plates in both languages — decorative art gets empty alt, meaningful art gets a real description. Visible focus states. Keyboard-operable lightbox and language toggle. Contrast checked against the dark ground, particularly gold on void. Lang attributes correct per locale.

---

## 9. Phasing

**Phase A — the teaser.** Astro scaffold, design system, image pipeline, deploy workflow. Routes: `/`, `/worlds/`, `/gods/`, `/hybrids/`, `/sphere/`, `/gallery/`. Both languages. Ships a complete, coherent site.

**Phase B — the depth.** `/codex/` with the spoiler boundary, `/dream/`, `/journal/` with its first post. Both languages.

**Phase C — the serial.** `/read/` index, chapter template with spot illustrations, per-chapter navigation, RSS. Triggered by the existence of a drafted chapter, not by a date.

Each phase ends deployable. Phase A alone is a site worth sending someone to.

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Portuguese falls behind English | Visible fallback notice; site stays coherent with partial translation |
| The novel stalls and the site goes stale | `/journal/` makes progress visible; a stale journal is honest, an empty site is not |
| The ending is public before anyone is invested | Spoiler boundary; accepted trade-off of the "everything public" decision |
| Art is AI-generated | Out of scope for this spec, but relevant at publication — several storefronts require disclosure. Worth deciding before Phase 6 of the book roadmap |
| Scope creep into a full CMS | Non-goals section is binding; content is Markdown in git |

---

## 11. Open questions

- Balian's fallen angels remain unnamed.
- Does `/dream/` keep the New Jersey reference, or is the location stripped? Currently kept.
- Does the concept page stay linked from the site, or only from the repo?
