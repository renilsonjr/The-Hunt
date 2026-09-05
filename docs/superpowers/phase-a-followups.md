# Phase A — follow-ups carried into Phase B

**Date:** 2026-09-05 · **Updated:** 2026-09-05, after the fix pass
**Status:** Phase A complete and reviewed. The fix pass closed items 1, 2 and 4; what remains below is genuinely Phase B work or a deliberate deferral.

Phase A built the bilingual site — landing, worlds, gods, hybrids, sphere and gallery in English and Portuguese — with an image pipeline, site chrome and CI deployment. This is what review found and what is still outstanding.

---

## ✅ Closed by the fix pass

- **Type-check step.** `@astrojs/check` is installed and `npm test` now runs `astro check` ahead of the unit tests, so types gate both local runs and CI. Running it the first time immediately found 43 errors — every test file imports `node:fs`/`node:path` with no `@types/node` installed. Both fixed. The `Route` typing added during the review is now genuinely load-bearing.
- **Lightbox WebP rung.** The format chain is now full-size AVIF → full-size WebP → the tile's own image, so a browser without AVIF support gets a full-size picture instead of the 300w tile upscaled ~2.9×. Verified to emit no new derivatives: `dist/_astro` still has zero unreferenced files.
- **Social cards.** Every page carries an absolute `og:image` built from the key art at 1200w, with localized `og:image:alt`, explicit dimensions and `twitter:card=summary_large_image`. `og:locale` now emits `en_US`/`pt_BR` from a dedicated map rather than being derived from the hreflang codes, where a bare `en` is correct but invalid as an OG locale.
- **404 page.** Carries the site chrome, speaks both languages (it cannot know the reader's locale, since GitHub Pages serves it for unmatched paths in either), is marked `noindex`, and is excluded from the sitemap.
- **Sitemap.** All 12 routes with `xhtml:link` alternates, so crawlers learn each page's counterpart instead of treating the pair as duplicates.
- **Favicon guard.** `head.test.ts` now asserts the icon link, so it cannot be silently dropped.

Seven new tests cover this; the suite is 58 green.

---

## 1. `dist/_astro` ships ~9.5 MB of JPEG nothing will fetch

The `<picture>` JPEG fallback is only reached by a browser supporting neither AVIF nor WebP — effectively none since 2020. It is repository and artifact weight, not transferred weight, so no visitor pays for it, but it is the largest remaining lever on build size. `<Picture>`'s `fallbackFormat` is the knob.

## 2. No page-level `x-default` hreflang

The sitemap now carries per-page alternates, but the pages themselves emit only `en` and `pt-BR` — no `x-default` telling crawlers which version to serve a reader whose language matches neither. One line in `Head.astro`; left out of the fix pass only because it belongs with the toggle work in item 4.

## 3. The language toggle will 404 when translation parity breaks

`localizePath` builds the other locale's URL unconditionally; nothing checks the target exists. With 6 of 6 pages translated this is invisible. The design spec (§6) requires that a missing translation fall back to English with a visible notice rather than a broken route — so the first English-only journal post in Phase B turns the toggle into a 404.

Cheap to guard now (a route-existence set the toggle consults), expensive to retrofit once the pattern is copied across a content collection.

## 4. Content collections, before the journal multiplies the pattern

Phase A is one `.astro` file per route per locale, with prose inline. That is right for six teaser pages and wrong for a journal and a chapter reader. The design spec chose Astro specifically for Markdown content collections, and requires locale-keyed content with a visible English fallback — none of which exists yet.

Phase A did not need it and the plan did not ask for it, but the spec's Goal 3 — "publishing Chapter 1 later is a content commit, not a project" — is not yet met. **Plan this as Phase B's first task**, before journal posts multiply the current pattern.

---

## Smaller items

| Where | What |
|---|---|
| `src/components/Seam.astro` | A comment claims the seam degrades to its previous appearance without `mask-image` support; it actually degrades to a 16px gradient bar, not the old 2px hairline. Comment only — the code is fine. |
| `src/components/Head.astro` | Non-null assertion on `alternates.find()`. Total by construction today; would throw an opaque build error if the locale sets ever drifted. |
| `src/i18n/utils.ts` | `getLocaleFromPath` has no production caller — every component receives `locale` as a prop. Keep it if Phase B needs client-side locale persistence; otherwise delete it with its three tests. It also does not strip query strings or hash fragments. |
| `src/components/CharacterPair.astro` | The hybrids-only bottom margin applies on `/gods/` too, leaving a little extra trailing space. |
| `src/components/SphereLead.astro` | Reaches slotted content through ambient `:global()` selectors, so those rules would apply to any future `.glyph`/`.prose` nested under those parents. |
| `src/components/Lightbox.astro` | Binds 22 listeners rather than one delegated listener on the grid. Trivial at this scale. |
| `.seam--vertical` | Now unused — all four call sites render the default horizontal orientation. Intentional surface, kept because the seam is specified with both. |

## Plan defects found during execution

Recorded so a future reader does not "fix" the implementation to match a plan that was wrong:

- **The `400/800/1200/1600` widths constraint is unsatisfiable.** Source art is 1152×1728; Astro clamps to `[400, 800, 1152]`. Two of the four mandated widths cannot exist. The implementation is correct; the constraint is not.
- **Per-format image quality is impossible in Astro 5.18.** `Picture.astro` spreads one props object into every `getImage()` call, so `quality` reaches all formats. Hence the single value of 50.
- The plan's `File Structure` table claims `astro.config.mjs` holds i18n locale and image-service config. It holds neither, and the plan's own Task 1 sample omits both.
- The plan listed `Seam` among `/worlds/`'s interfaces but never rendered one in its sample code; it specified a "jagged" divider while its sample drew a flat gradient; and it carried a `.reveal` class, a `DEFAULT_LOCALE` import and a `readdirSync` import that nothing consumed.

## Before announcing the site

From the plan's own post-phase checklist, still unrun:

- [ ] Narrow-viewport pass at 375px, both locales
- [ ] Keyboard-only pass: skip link, nav, lightbox open/close
- [ ] `prefers-reduced-motion: reduce` — confirm nothing animates
- [ ] Transferred-weight check in devtools: landing ≤ 400KB above the fold, gallery first screen ≤ 1.2MB
- [ ] **Native-speaker review of every Portuguese string.** The plan marks this required, not optional — every PT string on the site was drafted by a non-native writer.
