# Phase A — follow-ups carried into Phase B

**Date:** 2026-09-05
**Status:** Phase A complete and reviewed. Nothing here blocks the site shipping; every item was raised in review, judged non-blocking, and deliberately deferred.

Phase A built the bilingual site — landing, worlds, gods, hybrids, sphere and gallery in English and Portuguese — with an image pipeline, site chrome and CI deployment. This is what review found and left for later.

---

## 1. The site has no type-check step

`@astrojs/check` is not a dependency, so `npm test`, `npm run test:build` and the CI job never type-check. Every type in `src/` — `Route`, `Locale`, `ArtId` — is enforced only by an editor.

This matters most for `route`, which was deliberately typed as `Route` rather than `string` during the final fix wave precisely so a typo like `route="wolrds"` would be caught. Today it still would not be: it compiles clean and silently breaks that page's canonical URL, both hreflang alternates, the language toggle and `aria-current`.

**Fix:** add `@astrojs/check` and `astro check` to the test script and the workflow. This is the single largest gap in the suite's authority.

## 2. The lightbox has no WebP rung

The gallery lightbox loads a full-size AVIF via `data-full`, falling back to the tile's own resolved image if AVIF cannot be decoded. That fallback works — no broken image — but the tile is the 300w derivative, so a browser without AVIF support silently gets a 300px image rendered at ~870px. That is the exact upscale the `data-full` mechanism was added to remove, now invisible instead of visible.

**Fix:** emit `data-full-webp` alongside `data-full` in `GalleryGrid.astro`'s frontmatter loop and chain AVIF → WebP@1152 → tile. The 1152w WebP derivative already exists on disk and is already referenced by the tile's srcset, so this costs zero additional bytes.

## 3. `dist/_astro` ships ~9.5 MB of JPEG nothing will fetch

The `<picture>` JPEG fallback is only reached by a browser supporting neither AVIF nor WebP — effectively none since 2020. It is repository and artifact weight, not transferred weight, so no visitor pays for it, but it is the largest remaining lever on build size. `<Picture>`'s `fallbackFormat` is the knob.

## 4. Missing page-level furniture

None of these were in the Phase A plan; all are cheap and worth doing before the site is promoted anywhere:

- **`og:image` and `twitter:card`** — a link pasted into WhatsApp, Discord or Twitter currently renders as a bare text card, despite the project having 22 illustrations and dedicated key art. Also `og:locale` emits `en` for English where the spec wants `en_US` (the Portuguese side correctly emits `pt_BR`).
- **A `404.astro`** — a mistyped URL gets GitHub's unstyled generic page.
- **A sitemap** and **`x-default` hreflang**.
- **A test guarding the favicon** — `head.test.ts` covers lang, hreflang, canonical, title, description and the palette tokens, but the favicon link could be dropped without failing anything.

## 5. The language toggle will 404 when translation parity breaks

`localizePath` builds the other locale's URL unconditionally; nothing checks the target exists. With 6 of 6 pages translated this is invisible. The design spec (§6) requires that a missing translation fall back to English with a visible notice rather than a broken route — so the first English-only journal post in Phase B turns the toggle into a 404.

Cheap to guard now (a route-existence set the toggle consults), expensive to retrofit once the pattern is copied across a content collection.

## 6. Content collections, before the journal multiplies the pattern

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
