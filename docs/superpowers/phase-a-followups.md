# Site follow-ups — carried from Phase A, updated through Phase B

**Date:** 2026-09-05 · **Updated:** 2026-09-06, after Phase B's whole-branch review and fix pass
**Status:** Phase A and Phase B complete and reviewed. Phase A's items 2, 3 and 4 are now closed; item 1 remains open. What Phase B's own review left open is recorded below rather than fixed.

Phase A built the bilingual site — landing, worlds, gods, hybrids, sphere and gallery in English and Portuguese — with an image pipeline, site chrome and CI deployment. Phase B added content collections and three content-driven sections on top of it: the codex, the dream log and the journal. This is what review found and what is still outstanding.

---

## ✅ Closed by the Phase A fix pass

- **Type-check step.** `@astrojs/check` is installed and `npm test` now runs `astro check` ahead of the unit tests, so types gate both local runs and CI. Running it the first time immediately found 43 errors — every test file imports `node:fs`/`node:path` with no `@types/node` installed. Both fixed. The `Route` typing added during the review is now genuinely load-bearing.
- **Lightbox WebP rung.** The format chain is now full-size AVIF → full-size WebP → the tile's own image, so a browser without AVIF support gets a full-size picture instead of the 300w tile upscaled ~2.9×. Verified to emit no new derivatives: `dist/_astro` still has zero unreferenced files.
- **Social cards.** Every page carries an absolute `og:image` built from the key art at 1200w, with localized `og:image:alt`, explicit dimensions and `twitter:card=summary_large_image`. `og:locale` now emits `en_US`/`pt_BR` from a dedicated map rather than being derived from the hreflang codes, where a bare `en` is correct but invalid as an OG locale.
- **404 page.** Carries the site chrome, speaks both languages (it cannot know the reader's locale, since GitHub Pages serves it for unmatched paths in either), is marked `noindex`, and is excluded from the sitemap.
- **Sitemap.** All routes with `xhtml:link` alternates, so crawlers learn each page's counterpart instead of treating the pair as duplicates.
- **Favicon guard.** `head.test.ts` now asserts the icon link, so it cannot be silently dropped.

---

## ✅ Closed by Phase B

### Item 2 — page-level `x-default` hreflang

Closed, but only properly once the Phase B review's fix pass landed. Phase B's Task 5 added `x-default` to `Head.astro`, derived from the same effective page path as `canonical` — correct in shape, but every page-level alternate href was still **site-relative** (`/The-Hunt/codex/`) while `canonical` was absolute. Google's hreflang spec requires fully-qualified URLs and discards relative ones, and `x-default` appears in no sitemap, so the annotation was a no-op for its primary consumer.

All alternates are now absolutised in `Head.astro` against `Astro.site`, the same step it already took for `canonical` and `og:image`. `alternatesFor()` deliberately still returns site-relative paths: the `~/i18n` helpers know the base path and not the deploy origin, which only `Astro.site` knows.

### Item 3 — the language toggle 404ing when translation parity breaks

Closed — **but not by the mechanism this item proposed.** There is no "route-existence set the toggle consults", so do not go looking for one.

The toggle still builds the other locale's URL unconditionally. What changed is that the URL is now always real: `listJournal()` enumerates every slug that exists in *any* locale, so `pt/journal/[slug].astro`'s `getStaticPaths` builds a Portuguese page for every English-only slug. The counterpart genuinely exists rather than the link being hidden or guarded. `pickLocalized()` serves the English entry behind it and flags `isFallback`, which the page turns into a visible `TranslationNotice` in the reader's language.

The review's fix pass extended that to the prose pages, which had been ignoring `isFallback` entirely, and added the end-to-end coverage it had never had: `src/content/journal/en/2026-09-06-three-more-rooms.md` ships with no Portuguese counterpart on purpose, and the build tests assert that `/pt/journal/2026-09-06-three-more-rooms/` builds, carries the Portuguese notice, and that fully-translated pages do not. **Do not translate that entry** without replacing the fixture — its absence is what the tests measure.

### Item 4 — content collections

Closed, with a deliberate carve-out. `src/content/prose/` and `src/content/journal/` are locale-keyed glob collections (`prose/en/codex.md`, `prose/pt/codex.md`); the codex, the dream log and the journal all render from them, and the spec's Goal 3 — "publishing Chapter 1 later is a content commit, not a project" — is met for those surfaces.

**The six Phase A teaser pages stay hand-authored `.astro`.** That is a decision, not an oversight: they are designed layouts — split hero, character pairs, the seam, the gallery grid — not documents, and pushing them through a prose collection would buy nothing and cost their structure. The collections exist for prose that will keep arriving.

---

## Still open

### 1. `dist/_astro` ships ~9.5 MB of JPEG nothing will fetch

The `<picture>` JPEG fallback is only reached by a browser supporting neither AVIF nor WebP — effectively none since 2020. It is repository and artifact weight, not transferred weight, so no visitor pays for it, but it is the largest remaining lever on build size. `<Picture>`'s `fallbackFormat` is the knob.

---

## Surfaced by Phase B's review and deliberately deferred

Recorded rather than fixed. None is wrong today; each is a place the next phase will press.

| Where | What, and why it was left |
|---|---|
| `src/components/ProseBody.astro` | The three variants style only `h2`, `p`, `strong`, `code` and the log's `.frame`. A journal post using a list, a table or a blockquote would render unstyled and need a **code** change — which qualifies the spec's "publishing is a content commit" goal for anything beyond plain prose. Settle it the first time a post needs a list, not before. |
| `src/components/Header.astro` | The nav is now **seven** links; the design spec asked for four, with Gods and Hybrids behind a "Characters" entry. Seven mono links wrap awkwardly on a narrow viewport. Deferred to the 375px pass below, which is where the decision can actually be seen rather than argued. |
| `journal/${slug}` | Built by string interpolation in three places (`JournalList`, and both `[slug].astro` route files). It wants a `journalPath(slug)` helper in `~/i18n/utils` before Phase C copies the pattern to chapters. Not done in the fix pass because it is a new export with new tests, not a fix. |
| `src/pages/404.astro` | Combines `noindex` with a `canonical` pointing at the homepage — a documented antipattern: the canonical invites consolidation into a page the `noindex` says not to index. Pre-existing from Phase A, harmless in practice on GitHub Pages, but it should emit no canonical at all. |
| `src/content.config.ts` | The `prose` schema requires `eyebrow` and `heading`, so `codex-ending.md` carries placeholder values in both locales that nothing ever reads. The schema should make them optional for gated fragments, or the fragments should be a collection of their own. |
| `src/lib/content.ts` | `parseId` does an unchecked `locale as Locale` cast and relies on callers re-validating with `isLocale`. Total by construction today; a lie the type system is currently believing. |
| `Head` / `StoryPage` / `BaseLayout` | `pagePath` threads through three general-purpose layout components for one call site. Each future dynamic section needs the same thread pulled through again. |
| `src/i18n/ui.ts` | `journal.intro` and the journal index pages' own `description` say nearly the same thing in slightly different words, in both locales. One of them should be derived from the other. |

---

## Smaller items (Phase A, still true)

| Where | What |
|---|---|
| `src/components/Seam.astro` | A comment claims the seam degrades to its previous appearance without `mask-image` support; it actually degrades to a 16px gradient bar, not the old 2px hairline. Comment only — the code is fine. |
| `src/components/Head.astro` | Non-null assertion on `alternates.find()`. Total by construction today; would throw an opaque build error if the locale sets ever drifted. |
| `src/i18n/utils.ts` | `getLocaleFromPath` has no production caller — every component receives `locale` as a prop. Keep it if a later phase needs client-side locale persistence; otherwise delete it with its three tests. It also does not strip query strings or hash fragments. |
| `src/components/CharacterPair.astro` | The hybrids-only bottom margin applies on `/gods/` too, leaving a little extra trailing space. |
| `src/components/SphereLead.astro` | Reaches slotted content through ambient `:global()` selectors, so those rules would apply to any future `.glyph`/`.prose` nested under those parents. |
| `src/components/Lightbox.astro` | Binds 22 listeners rather than one delegated listener on the grid. Trivial at this scale. |
| `.seam--vertical` | Now unused — all four call sites render the default horizontal orientation. Intentional surface, kept because the seam is specified with both. |

## Plan defects found during execution

Recorded so a future reader does not "fix" the implementation to match a plan that was wrong:

- **The `400/800/1200/1600` widths constraint is unsatisfiable.** Source art is 1152×1728; Astro clamps to `[400, 800, 1152]`. Two of the four mandated widths cannot exist. The implementation is correct; the constraint is not.
- **Per-format image quality is impossible in Astro 5.18.** `Picture.astro` spreads one props object into every `getImage()` call, so `quality` reaches all formats. Hence the single value of 50.
- The Phase A plan's `File Structure` table claims `astro.config.mjs` holds i18n locale and image-service config. It holds neither, and the plan's own Task 1 sample omits both.
- The Phase A plan listed `Seam` among `/worlds/`'s interfaces but never rendered one in its sample code; it specified a "jagged" divider while its sample drew a flat gradient; and it carried a `.reveal` class, a `DEFAULT_LOCALE` import and a `readdirSync` import that nothing consumed.
- **The Phase B plan contradicted its own Global Constraints**, putting a `<style>` block in every locale route file while requiring that locale pairs not duplicate CSS. Resolved by `ProseBody.astro`, and extended by the review's `ProsePage.astro`; the route files carry no CSS.
- **The Phase B plan's single-file `<!--gate-->` body split cannot work.** Astro 5.18.2's `render()` builds `Content` from the pre-compiled `entry.rendered.html` and never reads `entry.body`. The gated ending is a second collection entry instead.

---

## Before announcing the site

From the plan's own post-phase checklist, **still unrun** — and now covering three page types that did not exist when it was written.

- [ ] **Narrow-viewport pass at 375px, both locales.** Now includes the codex, the dream log and the journal index and entry pages. Settle the seven-link nav here.
- [ ] **Keyboard-only pass:** skip link, nav, lightbox open/close, and the codex's `<details>` spoiler gate — open, close, and the focus order in and out of it.
- [ ] `prefers-reduced-motion: reduce` — confirm nothing animates
- [ ] Transferred-weight check in devtools: landing ≤ 400KB above the fold, gallery first screen ≤ 1.2MB
- [ ] **Native-speaker review of every Portuguese string.** The plan marks this required, not optional. Phase B added roughly 1,500 words of Portuguese (`wc -w` over `src/content/prose/pt/` and `src/content/journal/pt/`, which counts the frontmatter titles and meta descriptions along with the prose: the codex, its gated ending, the dream log's editorial frame, one journal entry), plus eight new UI strings in `src/i18n/ui.ts` and the Portuguese journal index copy in `src/pages/pt/journal/index.astro`. None of it has been read by a native speaker. This is the largest untested surface on the site.
