# The Hunt Website — Phase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a bilingual (EN/PT-BR) static site for *The Hunt* — landing, worlds, gods, hybrids, sphere and gallery — deployed to the existing GitHub Pages URL, with an image pipeline that makes 19MB of artwork usable on mobile data.

**Architecture:** Astro static site at the repo root. Content lives in typed TypeScript data modules and Astro components; the design system is a single global stylesheet of CSS custom properties. Locale is a route prefix (`/` = English, `/pt/` = Portuguese) with every page emitting `hreflang` alternates. Artwork moves into `src/assets/art/` so `astro:assets` can emit AVIF/WebP derivatives at four widths. GitHub Actions builds and deploys, replacing the current legacy branch-based Pages build.

**Tech Stack:** Astro 5, TypeScript, Vitest, `@fontsource` (self-hosted fonts), `astro:assets` (Sharp), GitHub Actions → GitHub Pages. Node 25 / npm 11 are installed.

## Global Constraints

Every task's requirements implicitly include this section.

- **Site base path is `/The-Hunt`.** Astro config sets `site: 'https://renilsonjr.github.io'` and `base: '/The-Hunt'`. Never hand-write an absolute path beginning `/` in an `href` or `src` — always route it through `localizePath()` or `import.meta.env.BASE_URL`.
- **Locales:** `en` (served at `/`) and `pt` (served at `/pt/`). No automatic redirection by browser language. The language toggle must switch to the *same page* in the other locale, never to the homepage.
- **Dark theme only.** No light theme, no `prefers-color-scheme` blocks. Every colour is declared explicitly; nothing inherits from the host.
- **Palette (exact values):** void `#0a0b12`, panel `#151726`, Zalian gold `#e8c873`, Balian violet `#9b6bf0`, Virden teal `#2dd4bf`, ink `#f2f0ea`, dim `#9491a6`, hairline `rgba(242,240,234,0.12)`.
- **Colour meaning is fixed:** gold belongs to Earth 1, violet to Earth 2. They mix only on the two hybrids (Fridan, Uxies), where a gradient crossing both marks the mirror.
- **Typefaces:** Cinzel (display/headings), Literata (body/quotes), IBM Plex Mono (labels, eyebrows, metadata), Rubik Glitch (**only** the word "Hunt" in the wordmark — never anywhere else). Self-hosted via `@fontsource`; no Google Fonts CDN request at runtime.
- **The seam** (jagged gold→violet divider) always means the Barrier. Never use it as decoration.
- **Images:** AVIF and WebP derivatives at widths 400/800/1200/1600 with JPEG fallback; every `<img>` carries explicit `width`/`height`; everything below the fold is `loading="lazy" decoding="async"`.
- **Alt text is required in both locales** for every plate. Decorative use passes `alt=""` explicitly.
- **Weight budgets:** landing page ≤ 400KB transferred above the fold; gallery first screen ≤ 1.2MB. A page that cannot meet its budget loses images, not budget.
- **Motion** is behind `@media (prefers-reduced-motion: no-preference)`. Nothing loops, nothing autoplays.
- **`/The-Hunt/concepts/worlds-of-the-hunt.html` must keep working.** It is already linked publicly and must not 404.
- **Commit after every task.** Conventional commit prefixes (`feat:`, `test:`, `chore:`).

---

## File Structure

| Path | Responsibility |
|---|---|
| `astro.config.mjs` | Site URL, base path, i18n locales, image service config |
| `package.json` | Scripts and dependencies |
| `tsconfig.json` | TypeScript strictness, path alias `~/*` → `src/*` |
| `vitest.config.ts` | Test roots for `tests/unit` and `tests/build` |
| `.github/workflows/deploy.yml` | Build and deploy to Pages |
| `src/i18n/config.ts` | Locale list, default locale, locale display names |
| `src/i18n/ui.ts` | UI string table keyed by locale (nav labels, aria labels) |
| `src/i18n/utils.ts` | `localizePath`, `getLocaleFromPath`, `alternatesFor`, `t` |
| `src/data/art.ts` | The art manifest — one entry per plate, alt text in both locales |
| `src/styles/global.css` | Design tokens, resets, base typography, motion guard |
| `src/components/Head.astro` | `<head>`: meta, title, hreflang alternates, canonical, OG |
| `src/components/Header.astro` | Wordmark, nav, language toggle |
| `src/components/Footer.astro` | Status line, repo link, copyright |
| `src/components/Seam.astro` | The Barrier divider (horizontal and vertical variants) |
| `src/components/Plate.astro` | Optimized artwork with srcset, sizes, dimensions, alt from manifest |
| `src/components/CharacterCard.astro` | One character: portrait, ring, name, epithet, body |
| `src/layouts/BaseLayout.astro` | `<html>` shell: lang attribute, Head, Header, slot, Footer |
| `src/layouts/StoryPage.astro` | Standard content page: eyebrow, title, prose column |
| `src/pages/index.astro` … | English routes |
| `src/pages/pt/index.astro` … | Portuguese routes |
| `src/assets/art/*.jpg` | The 22 plates, descriptively named |
| `public/concepts/worlds-of-the-hunt.html` | Legacy concept page, served byte-for-byte |
| `tests/unit/*.test.ts` | Pure-function and manifest tests |
| `tests/build/*.test.ts` | Assertions against built `dist/` output |

---

## Task 1: Scaffold, tooling, and a build that proves itself

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`
- Create: `src/pages/index.astro`
- Create: `tests/build/smoke.test.ts`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: `npm run build` writes `dist/`; `npm test` runs unit tests; `npm run test:build` builds then asserts on `dist/`. Path alias `~/*` resolves to `src/*`.

- [ ] **Step 1: Write the failing test**

Create `tests/build/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = (p: string) => resolve(process.cwd(), 'dist', p);

describe('build output', () => {
  it('emits an index.html', () => {
    expect(existsSync(dist('index.html'))).toBe(true);
  });

  it('sets the base path on built asset links', () => {
    const html = readFileSync(dist('index.html'), 'utf8');
    expect(html).toContain('/The-Hunt/');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/build/smoke.test.ts`
Expected: FAIL — vitest is not installed yet, or `dist/index.html` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `package.json`:

```json
{
  "name": "the-hunt-site",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run tests/unit",
    "test:build": "astro build && vitest run tests/build"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@fontsource/cinzel": "^5.0.0",
    "@fontsource/literata": "^5.0.0",
    "@fontsource/ibm-plex-mono": "^5.0.0",
    "@fontsource/rubik-glitch": "^5.0.0"
  },
  "devDependencies": {
    "vitest": "^2.0.0",
    "typescript": "^5.6.0"
  }
}
```

Create `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://renilsonjr.github.io',
  base: '/The-Hunt',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
```

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "~/*": ["src/*"] }
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

Create `vitest.config.ts`:

```ts
import { getViteConfig } from 'astro/config';
import { resolve } from 'node:path';

// getViteConfig — not plain defineConfig — so that Astro's own Vite plugins load.
// Task 4 imports .jpg files and reads their width/height; only Astro's image
// plugin turns an image import into ImageMetadata. With plain Vitest those
// imports resolve to a bare URL string and every dimension assertion fails.
export default getViteConfig({
  resolve: { alias: { '~': resolve(process.cwd(), 'src') } },
  test: { include: ['tests/**/*.test.ts'] },
});
```

Create `src/pages/index.astro`:

```astro
---
const base = import.meta.env.BASE_URL;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>The Hunt</title>
  </head>
  <body>
    <a href={base}>The Hunt</a>
  </body>
</html>
```

Append to `.gitignore`:

```
node_modules/
dist/
.astro/
```

Then run `npm install`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — both assertions green.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts src/pages/index.astro tests/build/smoke.test.ts .gitignore
git commit -m "feat: scaffold Astro site with build and test harness"
```

---

## Task 2: Locale routing foundation

**Files:**
- Create: `src/i18n/config.ts`, `src/i18n/ui.ts`, `src/i18n/utils.ts`
- Create: `tests/unit/i18n.test.ts`

**Interfaces:**
- Consumes: Task 1's `~/*` path alias.
- Produces:
  - `LOCALES: readonly ['en','pt']`, `DEFAULT_LOCALE: 'en'`, `type Locale = 'en'|'pt'`
  - `localizePath(path: string, locale: Locale): string` — `('worlds','pt')` → `/The-Hunt/pt/worlds/`
  - `getLocaleFromPath(pathname: string): Locale`
  - `alternatesFor(path: string): { locale: Locale; href: string; hreflang: string }[]`
  - `t(key: UIKey, locale: Locale): string`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/i18n.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { localizePath, getLocaleFromPath, alternatesFor } from '~/i18n/utils';
import { t } from '~/i18n/ui';

describe('localizePath', () => {
  it('builds an English path without a locale prefix', () => {
    expect(localizePath('worlds', 'en')).toBe('/The-Hunt/worlds/');
  });

  it('builds a Portuguese path with the pt prefix', () => {
    expect(localizePath('worlds', 'pt')).toBe('/The-Hunt/pt/worlds/');
  });

  it('handles the home route for both locales', () => {
    expect(localizePath('', 'en')).toBe('/The-Hunt/');
    expect(localizePath('', 'pt')).toBe('/The-Hunt/pt/');
  });

  it('tolerates leading and trailing slashes in the input', () => {
    expect(localizePath('/gods/', 'en')).toBe('/The-Hunt/gods/');
  });
});

describe('getLocaleFromPath', () => {
  it('reads pt from the prefix', () => {
    expect(getLocaleFromPath('/The-Hunt/pt/gods/')).toBe('pt');
  });

  it('defaults to en when there is no prefix', () => {
    expect(getLocaleFromPath('/The-Hunt/gods/')).toBe('en');
  });

  it('does not mistake a page named pt-something for the pt locale', () => {
    expect(getLocaleFromPath('/The-Hunt/ptolemy/')).toBe('en');
  });
});

describe('alternatesFor', () => {
  it('returns both locales with correct hreflang codes', () => {
    expect(alternatesFor('gods')).toEqual([
      { locale: 'en', href: '/The-Hunt/gods/', hreflang: 'en' },
      { locale: 'pt', href: '/The-Hunt/pt/gods/', hreflang: 'pt-BR' },
    ]);
  });
});

describe('t', () => {
  it('returns the string for the requested locale', () => {
    expect(t('nav.worlds', 'en')).toBe('Worlds');
    expect(t('nav.worlds', 'pt')).toBe('Mundos');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '~/i18n/utils'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/i18n/config.ts`:

```ts
export const LOCALES = ['en', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** BCP-47 codes used in hreflang and the html lang attribute. */
export const HREFLANG: Record<Locale, string> = {
  en: 'en',
  pt: 'pt-BR',
};

export const LOCALE_NAME: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
};

/** Every route on the site, without locale prefix or slashes. '' is home. */
export const ROUTES = ['', 'worlds', 'gods', 'hybrids', 'sphere', 'gallery'] as const;
export type Route = (typeof ROUTES)[number];
```

Create `src/i18n/utils.ts`:

```ts
import { LOCALES, DEFAULT_LOCALE, HREFLANG, type Locale } from './config';

const BASE = '/The-Hunt';

/** Strip surrounding slashes so callers can pass 'gods', '/gods' or '/gods/'. */
const clean = (path: string): string => path.replace(/^\/+|\/+$/g, '');

export function localizePath(path: string, locale: Locale): string {
  const slug = clean(path);
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return slug ? `${BASE}${prefix}/${slug}/` : `${BASE}${prefix}/`;
}

export function getLocaleFromPath(pathname: string): Locale {
  const withoutBase = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const first = clean(withoutBase).split('/')[0];
  return (LOCALES as readonly string[]).includes(first) ? (first as Locale) : DEFAULT_LOCALE;
}

export function alternatesFor(path: string) {
  return LOCALES.map((locale) => ({
    locale,
    href: localizePath(path, locale),
    hreflang: HREFLANG[locale],
  }));
}
```

Create `src/i18n/ui.ts`:

```ts
import type { Locale } from './config';

const STRINGS = {
  'nav.worlds':     { en: 'Worlds',      pt: 'Mundos' },
  'nav.gods':       { en: 'Gods',        pt: 'Deuses' },
  'nav.hybrids':    { en: 'Hybrids',     pt: 'Híbridos' },
  'nav.sphere':     { en: 'The Sphere',  pt: 'A Esfera' },
  'nav.gallery':    { en: 'Gallery',     pt: 'Galeria' },
  'nav.skip':       { en: 'Skip to content', pt: 'Pular para o conteúdo' },
  'lang.switch':    { en: 'Ler em português', pt: 'Read in English' },
  'lang.label':     { en: 'Language',    pt: 'Idioma' },
  'footer.status':  { en: 'A novel in development', pt: 'Um romance em desenvolvimento' },
  'footer.repo':    { en: 'Source on GitHub', pt: 'Código no GitHub' },
} as const;

export type UIKey = keyof typeof STRINGS;

export function t(key: UIKey, locale: Locale): string {
  return STRINGS[key][locale];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 9 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/i18n tests/unit/i18n.test.ts
git commit -m "feat: add locale routing helpers and UI string table"
```

---

## Task 3: Design tokens, base layout, and head metadata

**Files:**
- Create: `src/styles/global.css`, `src/components/Head.astro`, `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`
- Create: `tests/build/head.test.ts`

**Interfaces:**
- Consumes: `localizePath`, `alternatesFor`, `t`, `Locale` from Task 2.
- Produces: `BaseLayout.astro` accepting props `{ locale: Locale; route: string; title: string; description: string }` and rendering `<html lang>`, head metadata, header slot region, footer. CSS custom properties listed below are available to every later task.

- [ ] **Step 1: Write the failing test**

Create `tests/build/head.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

/** Astro emits global.css as a hashed asset; read whichever CSS file holds the tokens. */
const allCss = (): string => {
  const dir = resolve(process.cwd(), 'dist', '_astro');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(resolve(dir, f), 'utf8'))
    .join('\n');
};

describe('document head', () => {
  it('sets the html lang attribute per locale', () => {
    expect(html('index.html')).toMatch(/<html[^>]+lang="en"/);
    expect(html('pt/index.html')).toMatch(/<html[^>]+lang="pt-BR"/);
  });

  it('emits hreflang alternates pointing at both locales', () => {
    const doc = html('index.html');
    expect(doc).toContain('hreflang="en"');
    expect(doc).toContain('hreflang="pt-BR"');
    expect(doc).toContain('href="/The-Hunt/pt/"');
  });

  it('emits a canonical url', () => {
    expect(html('index.html')).toContain(
      '<link rel="canonical" href="https://renilsonjr.github.io/The-Hunt/"'
    );
  });

  it('has a non-empty title and description', () => {
    const doc = html('index.html');
    expect(doc).toMatch(/<title>.+<\/title>/);
    expect(doc).toMatch(/<meta name="description" content=".{20,}"/);
  });

  it('defines the palette tokens in the emitted stylesheet', () => {
    const css = allCss();
    expect(css).toMatch(/--void:\s*#0a0b12/);
    expect(css).toMatch(/--zalian:\s*#e8c873/);
    expect(css).toMatch(/--balian:\s*#9b6bf0/);
  });

  it('paints an explicit background on body rather than inheriting one', () => {
    expect(allCss()).toMatch(/body\{[^}]*background:var\(--void\)/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build`
Expected: FAIL — `dist/pt/index.html` does not exist and no hreflang tags are emitted.

- [ ] **Step 3: Write minimal implementation**

Create `src/styles/global.css`:

```css
@import '@fontsource/cinzel/500.css';
@import '@fontsource/cinzel/700.css';
@import '@fontsource/cinzel/900.css';
@import '@fontsource/literata/400.css';
@import '@fontsource/literata/400-italic.css';
@import '@fontsource/literata/500.css';
@import '@fontsource/ibm-plex-mono/400.css';
@import '@fontsource/ibm-plex-mono/500.css';
@import '@fontsource/rubik-glitch/400.css';

:root {
  --void: #0a0b12;
  --panel: #151726;
  --zalian: #e8c873;
  --balian: #9b6bf0;
  --virden: #2dd4bf;
  --ink: #f2f0ea;
  --dim: #9491a6;
  --hair: rgba(242, 240, 234, 0.12);

  --font-display: 'Cinzel', Georgia, serif;
  --font-body: 'Literata', Georgia, serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
  --font-glitch: 'Rubik Glitch', var(--font-display);

  --measure: 62ch;
  --gutter: clamp(1.2rem, 4vw, 2.6rem);
}

*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  background: var(--void);
  color: var(--ink);
  font-family: var(--font-body);
  line-height: 1.65;
}

h1, h2, h3 {
  font-family: var(--font-display);
  line-height: 1.1;
  text-wrap: balance;
  margin: 0 0 0.6rem;
}

p { margin: 0 0 1rem; }

a { color: var(--zalian); }

img { max-width: 100%; height: auto; }

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--dim);
  margin: 0 0 0.9rem;
}

.prose { max-width: var(--measure); }

.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: var(--gutter);
  top: 0.6rem;
  z-index: 10;
  background: var(--panel);
  color: var(--ink);
  padding: 0.6rem 1rem;
  border-radius: 6px;
}

:focus-visible { outline: 2px solid var(--virden); outline-offset: 3px; }

::selection { background: var(--balian); color: var(--void); }

@media (prefers-reduced-motion: no-preference) {
  .reveal { animation: rise 0.6s ease both; }
  @keyframes rise {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: none; }
  }
}
```

Create `src/components/Head.astro`:

```astro
---
import { alternatesFor } from '~/i18n/utils';
import { HREFLANG, type Locale } from '~/i18n/config';

interface Props {
  locale: Locale;
  route: string;
  title: string;
  description: string;
}

const { locale, route, title, description } = Astro.props;
const alternates = alternatesFor(route);
const self = alternates.find((a) => a.locale === locale)!;
const canonical = new URL(self.href, Astro.site).href;
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
{alternates.map((a) => (
  <link rel="alternate" hreflang={a.hreflang} href={a.href} />
))}
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<meta property="og:url" content={canonical} />
<meta property="og:locale" content={HREFLANG[locale].replace('-', '_')} />
```

Create `src/layouts/BaseLayout.astro`:

```astro
---
import Head from '~/components/Head.astro';
import { HREFLANG, type Locale } from '~/i18n/config';
import { t } from '~/i18n/ui';
import '~/styles/global.css';

interface Props {
  locale: Locale;
  route: string;
  title: string;
  description: string;
}

const { locale, route, title, description } = Astro.props;
---
<!doctype html>
<html lang={HREFLANG[locale]}>
  <head>
    <Head locale={locale} route={route} title={title} description={description} />
  </head>
  <body>
    <a class="skip-link" href="#main">{t('nav.skip', locale)}</a>
    <slot name="header" />
    <main id="main">
      <slot />
    </main>
    <slot name="footer" />
  </body>
</html>
```

Replace `src/pages/index.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
---
<BaseLayout
  locale="en"
  route=""
  title="The Hunt"
  description="A man wakes remembering a dream he was never meant to remember — and discovers he was used as a key to rob a god."
>
  <h1>The Hunt</h1>
</BaseLayout>
```

Create `src/pages/pt/index.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
---
<BaseLayout
  locale="pt"
  route=""
  title="The Hunt"
  description="Um homem acorda lembrando de um sonho que jamais deveria lembrar — e descobre que foi usado como chave para roubar uma deusa."
>
  <h1>The Hunt</h1>
</BaseLayout>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — 5 head tests plus the 2 smoke tests green.

- [ ] **Step 5: Commit**

```bash
git add src/styles src/components/Head.astro src/layouts/BaseLayout.astro src/pages tests/build/head.test.ts
git commit -m "feat: add design tokens, base layout, and bilingual head metadata"
```

---

## Task 4: Art manifest and the optimized Plate component

**Files:**
- Create: `src/data/art.ts`, `src/components/Plate.astro`
- Create: `src/assets/art/` (22 renamed images, moved from `grok-assets/`)
- Create: `tests/unit/art.test.ts`, `tests/build/images.test.ts`

**Interfaces:**
- Consumes: `Locale` from Task 2.
- Produces:
  - `type ArtId` — the union of the 22 ids below
  - `ART: Record<ArtId, ArtEntry>` where `ArtEntry = { id, src: ImageMetadata, title: Record<Locale,string>, alt: Record<Locale,string> }`
  - `<Plate id={ArtId} locale={Locale} widths={number[]} sizes={string} loading?: 'lazy'|'eager' class?: string decorative?: boolean />`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/art.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { ART, ART_IDS } from '~/data/art';

describe('art manifest', () => {
  it('contains all 22 plates', () => {
    expect(ART_IDS).toHaveLength(22);
  });

  it('has unique ids', () => {
    expect(new Set(ART_IDS).size).toBe(ART_IDS.length);
  });

  it('has non-empty alt text in both locales for every plate', () => {
    for (const id of ART_IDS) {
      const entry = ART[id];
      expect(entry.alt.en.length, `${id} en alt`).toBeGreaterThan(10);
      expect(entry.alt.pt.length, `${id} pt alt`).toBeGreaterThan(10);
    }
  });

  it('has a title in both locales for every plate', () => {
    for (const id of ART_IDS) {
      expect(ART[id].title.en.length, `${id} en title`).toBeGreaterThan(0);
      expect(ART[id].title.pt.length, `${id} pt title`).toBeGreaterThan(0);
    }
  });

  it('points every entry at a real imported image with dimensions', () => {
    for (const id of ART_IDS) {
      expect(ART[id].src.width, `${id} width`).toBeGreaterThan(0);
      expect(ART[id].src.height, `${id} height`).toBeGreaterThan(0);
    }
  });
});
```

Create `tests/build/images.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const assetsDir = resolve(process.cwd(), 'dist', '_astro');

describe('image pipeline', () => {
  it('emits optimized derivatives', () => {
    expect(existsSync(assetsDir)).toBe(true);
    const files = readdirSync(assetsDir);
    expect(files.some((f) => f.endsWith('.avif')), 'avif emitted').toBe(true);
    expect(files.some((f) => f.endsWith('.webp')), 'webp emitted').toBe(true);
  });

  it('does not ship an original multi-megabyte jpeg', () => {
    const files = readdirSync(assetsDir).filter((f) => /\.(jpe?g)$/.test(f));
    for (const f of files) {
      const bytes = statSync(resolve(assetsDir, f)).size;
      expect(bytes, `${f} is too large`).toBeLessThan(400_000);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '~/data/art'`.

- [ ] **Step 3: Write minimal implementation**

First move and rename the artwork:

```bash
mkdir -p src/assets/art
cd grok-assets
mv grok-16204d40-836e-494a-a59e-0107e969f357.jpg ../src/assets/art/zalian-portrait.jpg
mv grok-a5cf99f1-aa1d-408e-8fc1-bc055f54f9ac.jpg ../src/assets/art/balian-sheet.jpg
mv grok-29e8f1f2-5ad6-4e20-9d2f-77af6153bcfd.jpg ../src/assets/art/gods-diptych.jpg
mv grok-1d014ca2-1e77-4c87-b696-4fc351fb6f15.jpg ../src/assets/art/gods-rift.jpg
mv grok-254c3018-281d-43bb-99c7-fa56c1f0ca8a.jpg ../src/assets/art/fridan-sheet.jpg
mv grok-2adeda41-b008-4019-b291-912bf2d850ce.jpg ../src/assets/art/uxies-sheet.jpg
mv grok-177df7f7-7bcb-49ba-b15c-f65b22503ea9.jpg ../src/assets/art/zalian-and-fridan.jpg
mv grok-37f3d224-6ba1-4cac-b9e5-066aca1320b7.jpg ../src/assets/art/red-rail.jpg
mv grok-858d6186-c496-4413-846c-7f4c0e98bc5f.jpg ../src/assets/art/sphere-touch.jpg
mv grok-b05b5c12-34b7-470b-aaf9-f419baa34c70.jpg ../src/assets/art/sphere-pedestal.jpg
mv grok-d6abfa4f-3827-4c24-8d31-b0e90bf55468.jpg ../src/assets/art/waking.jpg
mv grok-8601213d-d209-4905-adff-723f5509b088.jpg ../src/assets/art/praying.jpg
mv grok-79071952-96bb-402a-a37c-c7a7c6a0e82d.jpg ../src/assets/art/watchers-neon.jpg
mv grok-3b6e9c52-0304-4a3e-8eda-a5e30c228aa2.jpg ../src/assets/art/watchers-mist.jpg
mv grok-8528e9de-97b6-4355-9fe0-a9431854de2e.jpg ../src/assets/art/uxies-dossier.jpg
mv grok-55f7aba7-8204-4d14-80f2-17dace6bc816.jpg ../src/assets/art/uxies-towers.jpg
mv grok-dfce83a1-9991-47cf-8d63-ff20096ae829.jpg ../src/assets/art/reverse-dream.jpg
mv grok-259e484b-0af1-4a27-887c-b679930bdd7a.jpg ../src/assets/art/rooftop-dawn.jpg
mv grok-d2a5addf-759f-465a-a1aa-6ef49de6f2e0.jpg ../src/assets/art/assembly.jpg
mv grok-3d44fed9-e2a8-4255-9ee7-84007a5f9741.jpg ../src/assets/art/two-worlds-spread.jpg
mv grok-caee0faf-691e-4029-8fcf-480a0f488d05.jpg ../src/assets/art/lore-diagram.jpg
mv grok-a28aef85-9494-45e5-a3a2-7b891fd06a71.jpg ../src/assets/art/key-art.jpg
cd ..
rmdir grok-assets
```

Create `src/data/art.ts`:

```ts
import type { ImageMetadata } from 'astro';
import type { Locale } from '~/i18n/config';

import zalianPortrait from '~/assets/art/zalian-portrait.jpg';
import balianSheet from '~/assets/art/balian-sheet.jpg';
import godsDiptych from '~/assets/art/gods-diptych.jpg';
import godsRift from '~/assets/art/gods-rift.jpg';
import fridanSheet from '~/assets/art/fridan-sheet.jpg';
import uxiesSheet from '~/assets/art/uxies-sheet.jpg';
import zalianAndFridan from '~/assets/art/zalian-and-fridan.jpg';
import redRail from '~/assets/art/red-rail.jpg';
import sphereTouch from '~/assets/art/sphere-touch.jpg';
import spherePedestal from '~/assets/art/sphere-pedestal.jpg';
import waking from '~/assets/art/waking.jpg';
import praying from '~/assets/art/praying.jpg';
import watchersNeon from '~/assets/art/watchers-neon.jpg';
import watchersMist from '~/assets/art/watchers-mist.jpg';
import uxiesDossier from '~/assets/art/uxies-dossier.jpg';
import uxiesTowers from '~/assets/art/uxies-towers.jpg';
import reverseDream from '~/assets/art/reverse-dream.jpg';
import rooftopDawn from '~/assets/art/rooftop-dawn.jpg';
import assembly from '~/assets/art/assembly.jpg';
import twoWorldsSpread from '~/assets/art/two-worlds-spread.jpg';
import loreDiagram from '~/assets/art/lore-diagram.jpg';
import keyArt from '~/assets/art/key-art.jpg';

export interface ArtEntry {
  id: string;
  src: ImageMetadata;
  title: Record<Locale, string>;
  alt: Record<Locale, string>;
}

export const ART = {
  'zalian-portrait': {
    id: 'zalian-portrait', src: zalianPortrait,
    title: { en: 'Zalian', pt: 'Zalian' },
    alt: {
      en: 'Zalian, white-haired and crowned in filaments of gold light, blue eyes lifted, a pale spired city behind her.',
      pt: 'Zalian, de cabelos brancos e coroada por filamentos de luz dourada, olhos azuis erguidos, uma cidade pálida de torres atrás dela.',
    },
  },
  'balian-sheet': {
    id: 'balian-sheet', src: balianSheet,
    title: { en: 'Balian, the Firstborn', pt: 'Balian, o Primogênito' },
    alt: {
      en: 'Character sheet for Balian: dark-haired, violet-eyed, robed in purple and gold thread, energy wings trailing behind him.',
      pt: 'Ficha de personagem de Balian: cabelos escuros, olhos violeta, vestes roxas e douradas, asas de energia atrás dele.',
    },
  },
  'gods-diptych': {
    id: 'gods-diptych', src: godsDiptych,
    title: { en: 'The two who split', pt: 'Os dois que se dividiram' },
    alt: {
      en: 'Zalian in gold light beside Balian in violet, standing together and looking away from one another.',
      pt: 'Zalian em luz dourada ao lado de Balian em violeta, juntos mas olhando em direções opostas.',
    },
  },
  'gods-rift': {
    id: 'gods-rift', src: godsRift,
    title: { en: 'Across the rift', pt: 'Através da fenda' },
    alt: {
      en: 'Zalian and Balian reaching toward one another, fingertips almost meeting across a vertical tear of light.',
      pt: 'Zalian e Balian estendendo as mãos, dedos quase se tocando através de uma fenda vertical de luz.',
    },
  },
  'fridan-sheet': {
    id: 'fridan-sheet', src: fridanSheet,
    title: { en: 'Fridan', pt: 'Fridan' },
    alt: {
      en: 'Character sheet for Fridan: a man in his mid-thirties in a dark field jacket, with a second portrait showing his eyes turned gold after the Sphere.',
      pt: 'Ficha de personagem de Fridan: um homem de trinta e poucos anos com jaqueta escura, e um segundo retrato com os olhos dourados após a Esfera.',
    },
  },
  'uxies-sheet': {
    id: 'uxies-sheet', src: uxiesSheet,
    title: { en: 'Uxies', pt: 'Uxies' },
    alt: {
      en: 'Character sheet for Uxies: a Virden woman with black and silver hair, golden freckles, layered scavenged armour threaded with neon.',
      pt: 'Ficha de personagem de Uxies: uma mulher Virden de cabelos pretos e prateados, sardas douradas, armadura de retalhos com fios de neon.',
    },
  },
  'zalian-and-fridan': {
    id: 'zalian-and-fridan', src: zalianAndFridan,
    title: { en: 'The guide and the key', pt: 'A guia e a chave' },
    alt: {
      en: 'Zalian in radiant gold standing beside Fridan, whose face is cracked with faint golden light.',
      pt: 'Zalian em dourado radiante ao lado de Fridan, cujo rosto tem rachaduras de luz dourada.',
    },
  },
  'red-rail': {
    id: 'red-rail', src: redRail,
    title: { en: 'The rail turned red', pt: 'O trilho ficou vermelho' },
    alt: {
      en: 'Fridan standing before a vast night city while a transit rail glows red through the interchanges, marking a path.',
      pt: 'Fridan diante de uma vasta cidade noturna enquanto um trilho brilha em vermelho entre os viadutos, marcando um caminho.',
    },
  },
  'sphere-touch': {
    id: 'sphere-touch', src: sphereTouch,
    title: { en: 'The moment of contact', pt: 'O momento do contato' },
    alt: {
      en: 'Fridan reaching into a detonation of blue and gold light, his eyes gone white, shards of crystal suspended around him.',
      pt: 'Fridan tocando uma detonação de luz azul e dourada, os olhos brancos, cacos de cristal suspensos ao redor.',
    },
  },
  'sphere-pedestal': {
    id: 'sphere-pedestal', src: spherePedestal,
    title: { en: 'The Sphere', pt: 'A Esfera' },
    alt: {
      en: 'A small blue felted sphere marked with two dots and one dot, resting on a stone pedestal ringed with gold light as Fridan reaches for it.',
      pt: 'Uma pequena esfera azul de feltro marcada com dois pontos e um ponto, sobre um pedestal de pedra cercado de luz dourada enquanto Fridan a alcança.',
    },
  },
  'waking': {
    id: 'waking', src: waking,
    title: { en: 'The morning after', pt: 'A manhã seguinte' },
    alt: {
      en: 'Fridan half upright in bed at dawn, eyes gold and afraid, a city skyline pale in the window behind him.',
      pt: 'Fridan semi-erguido na cama ao amanhecer, olhos dourados e assustados, o horizonte da cidade pálido na janela.',
    },
  },
  'praying': {
    id: 'praying', src: praying,
    title: { en: 'Into the silence', pt: 'Para o silêncio' },
    alt: {
      en: 'Fridan on one knee in a dim hall, one hand raised and open, faint light coiling around him and no answer coming.',
      pt: 'Fridan de joelhos num salão escuro, uma das mãos erguida e aberta, luz tênue ao redor e nenhuma resposta.',
    },
  },
  'watchers-neon': {
    id: 'watchers-neon', src: watchersNeon,
    title: { en: 'The Second Faction', pt: 'A Segunda Facção' },
    alt: {
      en: 'Fridan encircled by robed figures whose heads are glowing blue wireframe, hands outstretched toward him in a neon alley.',
      pt: 'Fridan cercado por figuras encapuzadas de cabeças em wireframe azul, mãos estendidas em direção a ele num beco de neon.',
    },
  },
  'watchers-mist': {
    id: 'watchers-mist', src: watchersMist,
    title: { en: 'The watchers', pt: 'Os observadores' },
    alt: {
      en: 'Fridan standing still while translucent figures crowd around him in fog, their faces lit from within.',
      pt: 'Fridan imóvel enquanto figuras translúcidas o cercam na névoa, os rostos iluminados por dentro.',
    },
  },
  'uxies-dossier': {
    id: 'uxies-dossier', src: uxiesDossier,
    title: { en: 'The record of Uxies', pt: 'O registro de Uxies' },
    alt: {
      en: 'Fridan reaching into a blue holographic dossier displaying Uxies, tagged Virden hybrid and Zalian DNA fragment.',
      pt: 'Fridan tocando um dossiê holográfico azul exibindo Uxies, marcado como híbrida Virden e fragmento de DNA de Zalian.',
    },
  },
  'uxies-towers': {
    id: 'uxies-towers', src: uxiesTowers,
    title: { en: 'Above the storm', pt: 'Acima da tempestade' },
    alt: {
      en: 'Uxies seated on a ledge above the neon towers of Earth 2 at dawn, one hand at her chest, looking up.',
      pt: 'Uxies sentada numa saliência acima das torres de neon da Terra 2 ao amanhecer, uma das mãos no peito, olhando para cima.',
    },
  },
  'reverse-dream': {
    id: 'reverse-dream', src: reverseDream,
    title: { en: 'The reverse dream', pt: 'O sonho invertido' },
    alt: {
      en: 'Fridan cradling a sleeping Uxies as golden light ignites at her chest, a ruined skyline behind them.',
      pt: 'Fridan amparando Uxies adormecida enquanto uma luz dourada se acende no peito dela, com um horizonte em ruínas ao fundo.',
    },
  },
  'rooftop-dawn': {
    id: 'rooftop-dawn', src: rooftopDawn,
    title: { en: 'Nor Yesey at dawn', pt: 'Nor Yesey ao amanhecer' },
    alt: {
      en: 'Fridan on a rooftop above a misted city at sunrise, a small spiral galaxy turning above each open hand.',
      pt: 'Fridan num telhado acima de uma cidade enevoada ao nascer do sol, uma pequena galáxia espiral girando sobre cada mão aberta.',
    },
  },
  'assembly': {
    id: 'assembly', src: assembly,
    title: { en: 'The assembly', pt: 'A assembleia' },
    alt: {
      en: 'Fridan standing on a dais among robed figures who look past him toward a radiant female form suspended above the spires.',
      pt: 'Fridan sobre um estrado entre figuras encapuzadas que olham além dele para uma forma feminina radiante suspensa acima das torres.',
    },
  },
  'two-worlds-spread': {
    id: 'two-worlds-spread', src: twoWorldsSpread,
    title: { en: 'Earth 1 and Earth 2', pt: 'Terra 1 e Terra 2' },
    alt: {
      en: 'An illuminated book spread: Earth 1 in gold spires on the left, Earth 2 in violet thorned towers on the right, split by lightning.',
      pt: 'Uma página dupla iluminada: a Terra 1 em torres douradas à esquerda, a Terra 2 em torres violeta e espinhosas à direita, separadas por relâmpagos.',
    },
  },
  'lore-diagram': {
    id: 'lore-diagram', src: loreDiagram,
    title: { en: 'Schematic of the Abstract Universe', pt: 'Esquema do Universo Abstrato' },
    alt: {
      en: 'A gold-on-navy schematic plate mapping Zalian and Balian to their galaxies, the Atmospheric Barrier between them, and the two hybrids below.',
      pt: 'Uma prancha esquemática dourada sobre azul-marinho ligando Zalian e Balian às suas galáxias, a Barreira Atmosférica entre elas e os dois híbridos abaixo.',
    },
  },
  'key-art': {
    id: 'key-art', src: keyArt,
    title: { en: 'The Hunt — key art', pt: 'The Hunt — arte principal' },
    alt: {
      en: 'Cover art: two planets flanking a small blue sphere marked with three dots, beneath the title The Hunt in gold.',
      pt: 'Arte de capa: dois planetas ladeando uma pequena esfera azul marcada com três pontos, sob o título The Hunt em dourado.',
    },
  },
} as const satisfies Record<string, ArtEntry>;

export type ArtId = keyof typeof ART;
export const ART_IDS = Object.keys(ART) as ArtId[];
```

Create `src/components/Plate.astro`:

```astro
---
import { Picture } from 'astro:assets';
import { ART, type ArtId } from '~/data/art';
import type { Locale } from '~/i18n/config';

interface Props {
  id: ArtId;
  locale: Locale;
  sizes: string;
  widths?: number[];
  loading?: 'lazy' | 'eager';
  decorative?: boolean;
  class?: string;
}

const {
  id,
  locale,
  sizes,
  widths = [400, 800, 1200, 1600],
  loading = 'lazy',
  decorative = false,
  class: className,
} = Astro.props;

const entry = ART[id];
---
<!-- Picture, not Image: it emits both AVIF and WebP with a JPEG fallback. -->
<Picture
  src={entry.src}
  alt={decorative ? '' : entry.alt[locale]}
  widths={widths}
  sizes={sizes}
  formats={['avif', 'webp']}
  fallbackFormat="jpeg"
  loading={loading}
  decoding={loading === 'eager' ? 'sync' : 'async'}
  class={className}
/>
```

The build test needs at least one rendered image, and no page renders one yet. Add the hero plate to `src/pages/index.astro` now — Task 6 replaces this page wholesale, so this is the plate's permanent home arriving early:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import Plate from '~/components/Plate.astro';
---
<BaseLayout
  locale="en"
  route=""
  title="The Hunt"
  description="A man wakes remembering a dream he was never meant to remember — and finds he was used as a key to rob a god of the codes of creation."
>
  <h1>The Hunt</h1>
  <Plate id="key-art" locale="en" loading="eager" sizes="(max-width: 720px) 80vw, 380px" />
</BaseLayout>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run test:build`
Expected: PASS — 5 art manifest tests and 2 image pipeline tests green.

- [ ] **Step 5: Commit**

```bash
git add src/data/art.ts src/components/Plate.astro src/assets/art tests/unit/art.test.ts tests/build/images.test.ts src/pages/index.astro
git commit -m "feat: add art manifest with bilingual alt text and optimized Plate component"
```

---

## Task 5: Site chrome — header, language toggle, footer, seam

**Files:**
- Create: `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/Seam.astro`
- Modify: `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/pages/pt/index.astro`
- Create: `tests/build/chrome.test.ts`

**Interfaces:**
- Consumes: `localizePath`, `t`, `Locale`, `ROUTES` from Tasks 2–3.
- Produces: `<Header locale route />`, `<Footer locale />`, `<Seam orientation="horizontal"|"vertical" />`. `BaseLayout` renders Header and Footer itself; pages no longer pass slots.

**Deliberate deviation from the spec.** Spec §4 describes four nav links with "Characters" as a single entry covering gods and hybrids, plus Codex. That contradicts the spec's own route table, which has no `/characters/` page, and `/codex/` does not exist until Phase B — both entries would point nowhere. This task ships five links matching the five routes that actually exist: Worlds, Gods, Hybrids, The Sphere, Gallery. Revisit when Phase B adds Codex and the nav gets crowded.

- [ ] **Step 1: Write the failing test**

Create `tests/build/chrome.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('site chrome', () => {
  it('renders navigation links with the base path', () => {
    const doc = html('index.html');
    expect(doc).toContain('href="/The-Hunt/worlds/"');
    expect(doc).toContain('href="/The-Hunt/gallery/"');
  });

  it('language toggle on an English page points at the same page in Portuguese', () => {
    const doc = html('index.html');
    expect(doc).toContain('href="/The-Hunt/pt/"');
    expect(doc).toContain('Ler em português');
  });

  it('language toggle on a Portuguese page points back to English', () => {
    const doc = html('pt/index.html');
    expect(doc).toContain('href="/The-Hunt/"');
    expect(doc).toContain('Read in English');
  });

  it('navigation is inside a labelled nav landmark', () => {
    expect(html('index.html')).toMatch(/<nav[^>]+aria-label=/);
  });

  it('renders the wordmark with Hunt in the glitch face only', () => {
    const doc = html('index.html');
    // Astro appends a scope class (class="wordmark astro-xxxx"), so match a prefix.
    expect(doc).toMatch(/class="wordmark[^"]*"/);
    expect(doc).toMatch(/class="glitch[^"]*">Hunt</);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build`
Expected: FAIL — no nav links, no wordmark markup.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/Seam.astro`:

```astro
---
interface Props {
  orientation?: 'horizontal' | 'vertical';
}
const { orientation = 'horizontal' } = Astro.props;
---
<div class={`seam seam--${orientation}`} role="presentation" aria-hidden="true"></div>

<style>
  /* The seam is the Barrier. Gold is Earth 1, violet is Earth 2. */
  .seam--horizontal {
    height: 2px;
    width: 100%;
    background: linear-gradient(90deg, var(--zalian), var(--balian));
    opacity: 0.75;
  }
  .seam--vertical {
    width: 2px;
    align-self: stretch;
    background: linear-gradient(180deg, var(--zalian), var(--balian));
    opacity: 0.75;
  }
</style>
```

Create `src/components/Header.astro`:

```astro
---
import { localizePath } from '~/i18n/utils';
import { t } from '~/i18n/ui';
import { DEFAULT_LOCALE, type Locale } from '~/i18n/config';

interface Props {
  locale: Locale;
  route: string;
}
const { locale, route } = Astro.props;
const other: Locale = locale === 'en' ? 'pt' : 'en';

const links = [
  { route: 'worlds', label: t('nav.worlds', locale) },
  { route: 'gods', label: t('nav.gods', locale) },
  { route: 'hybrids', label: t('nav.hybrids', locale) },
  { route: 'sphere', label: t('nav.sphere', locale) },
  { route: 'gallery', label: t('nav.gallery', locale) },
];
---
<header class="site-header">
  <a class="wordmark" href={localizePath('', locale)}>
    <span class="the">The</span> <span class="glitch">Hunt</span>
  </a>

  <nav aria-label={locale === 'en' ? 'Main' : 'Principal'}>
    {links.map((l) => (
      <a href={localizePath(l.route, locale)} aria-current={route === l.route ? 'page' : undefined}>
        {l.label}
      </a>
    ))}
  </nav>

  <a class="lang" href={localizePath(route, other)} lang={other === 'pt' ? 'pt-BR' : 'en'}>
    {t('lang.switch', locale)}
  </a>
</header>

<style>
  .site-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.6rem;
    padding: 1.1rem var(--gutter);
    border-bottom: 1px solid var(--hair);
  }
  .wordmark {
    font-family: var(--font-display);
    font-size: 1.1rem;
    letter-spacing: 0.06em;
    text-decoration: none;
    color: var(--ink);
  }
  .wordmark .the { color: var(--zalian); }
  .wordmark .glitch { font-family: var(--font-glitch); color: var(--balian); }
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
    margin-inline-end: auto;
  }
  nav a {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
    text-decoration: none;
  }
  nav a:hover, nav a[aria-current='page'] { color: var(--ink); }
  nav a[aria-current='page'] { border-bottom: 1px solid var(--zalian); }
  .lang {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    color: var(--virden);
    text-decoration: none;
    border: 1px solid var(--hair);
    border-radius: 999px;
    padding: 0.4rem 0.8rem;
  }
  .lang:hover { border-color: var(--virden); }
</style>
```

Create `src/components/Footer.astro`:

```astro
---
import { t } from '~/i18n/ui';
import type { Locale } from '~/i18n/config';

interface Props { locale: Locale }
const { locale } = Astro.props;
---
<footer class="site-footer">
  <span>{t('footer.status', locale)}</span>
  <a href="https://github.com/renilsonjr/The-Hunt">{t('footer.repo', locale)}</a>
</footer>

<style>
  .site-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
    padding: 2rem var(--gutter);
    margin-top: 4rem;
    border-top: 1px solid var(--hair);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    color: var(--dim);
  }
  .site-footer a { color: var(--zalian); text-decoration: none; }
  .site-footer a:hover { text-decoration: underline; }
</style>
```

Modify `src/layouts/BaseLayout.astro` — replace the two `<slot name=...>` lines so the layout owns the chrome:

```astro
---
import Head from '~/components/Head.astro';
import Header from '~/components/Header.astro';
import Footer from '~/components/Footer.astro';
import { HREFLANG, type Locale } from '~/i18n/config';
import { t } from '~/i18n/ui';
import '~/styles/global.css';

interface Props {
  locale: Locale;
  route: string;
  title: string;
  description: string;
}

const { locale, route, title, description } = Astro.props;
---
<!doctype html>
<html lang={HREFLANG[locale]}>
  <head>
    <Head locale={locale} route={route} title={title} description={description} />
  </head>
  <body>
    <a class="skip-link" href="#main">{t('nav.skip', locale)}</a>
    <Header locale={locale} route={route} />
    <main id="main">
      <slot />
    </main>
    <Footer locale={locale} />
  </body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — 5 chrome tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/components/Seam.astro src/layouts/BaseLayout.astro tests/build/chrome.test.ts
git commit -m "feat: add header, language toggle, footer, and the Barrier seam"
```

---

## Task 6: The landing page

**Files:**
- Modify: `src/pages/index.astro`, `src/pages/pt/index.astro`
- Create: `tests/build/landing.test.ts`

**Interfaces:**
- Consumes: `BaseLayout`, `Plate`, `Seam` from Tasks 3–5.
- Produces: the `/` and `/pt/` routes in final form. No new exports.

- [ ] **Step 1: Write the failing test**

Create `tests/build/landing.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = (p: string) => resolve(process.cwd(), 'dist', p);
const html = (p: string) => readFileSync(dist(p), 'utf8');

describe('landing page', () => {
  it('carries the logline in English', () => {
    expect(html('index.html')).toContain('gods only hear what is spoken');
  });

  it('carries the logline in Portuguese', () => {
    expect(html('pt/index.html')).toContain('deuses só ouvem o que é dito');
  });

  it('links onward to the worlds page in the right locale', () => {
    expect(html('index.html')).toContain('href="/The-Hunt/worlds/"');
    expect(html('pt/index.html')).toContain('href="/The-Hunt/pt/worlds/"');
  });

  it('loads the single hero plate eagerly, via a picture element', () => {
    const doc = html('index.html');
    expect(doc).toContain('<picture');
    expect(doc).toMatch(/loading="eager"/);
    expect(doc).not.toMatch(/loading="lazy"/); // the hero is the only image on this page
  });

  it('offers avif and webp sources for the hero', () => {
    const doc = html('index.html');
    expect(doc).toContain('type="image/avif"');
    expect(doc).toContain('type="image/webp"');
  });

  it('keeps the HTML document itself small', () => {
    // The document must not inline artwork as data URIs.
    expect(statSync(dist('index.html')).size).toBeLessThan(60_000);
    expect(html('index.html')).not.toContain('data:image/jpeg;base64');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build`
Expected: FAIL — logline text absent.

- [ ] **Step 3: Write minimal implementation**

Replace `src/pages/index.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import Plate from '~/components/Plate.astro';
import Seam from '~/components/Seam.astro';
import { localizePath } from '~/i18n/utils';

const locale = 'en' as const;
---
<BaseLayout
  locale={locale}
  route=""
  title="The Hunt"
  description="A man wakes remembering a dream he was never meant to remember — and finds he was used as a key to rob a god of the codes of creation."
>
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">A novel in development</p>
      <h1>The Hunt</h1>
      <p class="logline">
        "In a universe where gods only hear what is spoken, the mind's deepest sleep
        became an open door."
      </p>
      <Seam />
      <p class="prose">
        An ordinary man in Nor Yesey wakes carrying memories of a dream he was never
        meant to remember. He was not chosen. He was <em>selected</em> — by a probability
        engine scanning billions of minds for a dormant strand of foreign DNA — and used
        as a biological relay so another civilization could siphon the codes of creation
        from a god who cannot read thoughts, only words and dreams.
      </p>
      <p class="prose">
        The theft leaves him no longer entirely human. The god he needs to warn has
        already closed the connection. To reach her he must find his own mirror: a woman
        in another galaxy who carries a fragment of that same god — and enter her sleep
        exactly as his own was entered.
      </p>
      <p class="onward">
        <a href={localizePath('worlds', locale)}>Begin with the two worlds →</a>
      </p>
    </div>

    <figure class="hero-art">
      <Plate id="key-art" locale={locale} loading="eager" sizes="(max-width: 720px) 80vw, 380px" />
    </figure>
  </section>
</BaseLayout>

<style>
  .hero {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: clamp(2rem, 6vw, 4rem);
    align-items: center;
    padding: clamp(2.5rem, 7vw, 5rem) var(--gutter);
  }
  h1 {
    font-size: clamp(2.6rem, 8vw, 4.4rem);
    letter-spacing: 0.04em;
    margin-bottom: 1rem;
  }
  .logline {
    font-style: italic;
    color: var(--ink);
    font-size: clamp(1.05rem, 2.4vw, 1.3rem);
    max-width: 44ch;
    margin-bottom: 1.4rem;
  }
  .prose { color: var(--dim); }
  .onward {
    font-family: var(--font-mono);
    font-size: 0.76rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 1.6rem;
  }
  .onward a { text-decoration: none; }
  .onward a:hover { text-decoration: underline; }
  .hero-art { margin: 0; }
  .hero-art :global(img) {
    width: 100%;
    border-radius: 8px;
    border: 1px solid var(--hair);
    box-shadow: 0 30px 60px -26px rgba(0, 0, 0, 0.95);
  }
  @media (max-width: 720px) {
    .hero { grid-template-columns: 1fr; }
    .hero-art { order: -1; max-width: 260px; }
  }
</style>
```

Replace `src/pages/pt/index.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import Plate from '~/components/Plate.astro';
import Seam from '~/components/Seam.astro';
import { localizePath } from '~/i18n/utils';

const locale = 'pt' as const;
---
<BaseLayout
  locale={locale}
  route=""
  title="The Hunt"
  description="Um homem acorda lembrando de um sonho que jamais deveria lembrar — e descobre que foi usado como chave para roubar de uma deusa os códigos da criação."
>
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">Um romance em desenvolvimento</p>
      <h1>The Hunt</h1>
      <p class="logline">
        "Num universo onde os deuses só ouvem o que é dito em voz alta, o sono mais
        profundo da mente virou uma porta aberta."
      </p>
      <Seam />
      <p class="prose">
        Um homem comum em Nor Yesey acorda carregando a memória de um sonho que jamais
        deveria lembrar. Ele não foi escolhido. Ele foi <em>selecionado</em> — por uma
        máquina de probabilidades que varreu bilhões de mentes atrás de um fragmento
        adormecido de DNA estrangeiro — e usado como retransmissor biológico para que
        outra civilização drenasse os códigos da criação de uma deusa que não lê
        pensamentos, apenas palavras e sonhos.
      </p>
      <p class="prose">
        O roubo o deixa não inteiramente humano. A deusa que ele precisa avisar já
        encerrou a conexão. Para alcançá-la, ele precisa encontrar o próprio espelho:
        uma mulher em outra galáxia que carrega um fragmento dessa mesma deusa — e
        entrar no sono dela exatamente como entraram no dele.
      </p>
      <p class="onward">
        <a href={localizePath('worlds', locale)}>Comece pelos dois mundos →</a>
      </p>
    </div>

    <figure class="hero-art">
      <Plate id="key-art" locale={locale} loading="eager" sizes="(max-width: 720px) 80vw, 380px" />
    </figure>
  </section>
</BaseLayout>

<style>
  .hero {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: clamp(2rem, 6vw, 4rem);
    align-items: center;
    padding: clamp(2.5rem, 7vw, 5rem) var(--gutter);
  }
  h1 {
    font-size: clamp(2.6rem, 8vw, 4.4rem);
    letter-spacing: 0.04em;
    margin-bottom: 1rem;
  }
  .logline {
    font-style: italic;
    color: var(--ink);
    font-size: clamp(1.05rem, 2.4vw, 1.3rem);
    max-width: 44ch;
    margin-bottom: 1.4rem;
  }
  .prose { color: var(--dim); }
  .onward {
    font-family: var(--font-mono);
    font-size: 0.76rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 1.6rem;
  }
  .onward a { text-decoration: none; }
  .onward a:hover { text-decoration: underline; }
  .hero-art { margin: 0; }
  .hero-art :global(img) {
    width: 100%;
    border-radius: 8px;
    border: 1px solid var(--hair);
    box-shadow: 0 30px 60px -26px rgba(0, 0, 0, 0.95);
  }
  @media (max-width: 720px) {
    .hero { grid-template-columns: 1fr; }
    .hero-art { order: -1; max-width: 260px; }
  }
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — 5 landing tests green.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/pages/pt/index.astro tests/build/landing.test.ts
git commit -m "feat: build the bilingual landing page"
```

---

## Task 7: The two worlds

**Files:**
- Create: `src/pages/worlds.astro`, `src/pages/pt/worlds.astro`
- Create: `tests/build/worlds.test.ts`

**Interfaces:**
- Consumes: `BaseLayout`, `Plate`, `Seam`.
- Produces: `/worlds/` and `/pt/worlds/`.

- [ ] **Step 1: Write the failing test**

Create `tests/build/worlds.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('worlds page', () => {
  it('exists in both locales', () => {
    expect(html('worlds/index.html')).toContain('Earth 1');
    expect(html('pt/worlds/index.html')).toContain('Terra 1');
  });

  it('names both gods and the Barrier', () => {
    const doc = html('worlds/index.html');
    expect(doc).toContain('Zalian');
    expect(doc).toContain('Balian');
    expect(doc).toContain('Barrier');
  });

  it('renders the lore diagram plate', () => {
    expect(html('worlds/index.html')).toMatch(/alt="[^"]*schematic[^"]*"/i);
  });

  it('marks the current page in the navigation', () => {
    expect(html('worlds/index.html')).toContain('aria-current="page"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build`
Expected: FAIL — `dist/worlds/index.html` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `src/pages/worlds.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import Plate from '~/components/Plate.astro';

const locale = 'en' as const;
---
<BaseLayout
  locale={locale}
  route="worlds"
  title="The Two Worlds — The Hunt"
  description="Earth 1 and Earth 2, the pact that separated them, and the Barrier of air that kills anything trying to cross."
>
  <article class="page">
    <p class="eyebrow">The cosmology</p>
    <h1>Two Earths, one veil</h1>

    <div class="split">
      <section class="world z">
        <p class="label">Earth 1</p>
        <h2>Zalian's realm</h2>
        <p class="creed">Order · Law · Purity</p>
        <p>
          Zalian built Earth 1 and populated it with pure humans, unmixed with anything
          else. She guides them at a distance, through dreams and through what they say
          aloud, and she does not enter a mind uninvited. Her people have never known
          there is another sky.
        </p>
      </section>

      <section class="world b">
        <p class="label">Earth 2</p>
        <h2>Balian's realm</h2>
        <p class="creed">Chaos · Will · Hybridity</p>
        <p>
          Balian walked out and took followers with him. What they built on Earth 2 is
          the Virden — humans and fallen angels mixed together, living in permanent
          upheaval. Balian lives among them physically. Suffering made them fast: they
          outran Earth 1 by millennia.
        </p>
      </section>
    </div>

    <section class="barrier">
      <h2>The Barrier</h2>
      <p class="prose">
        What separates the two worlds is not a wall. It is the air. Zalian set the
        atmospheres of the two Earths against each other, so that a pure human breathing
        Virden air dies, and a pure Virden breathing human air dies. No fleet crosses
        that. No weapon solves it.
      </p>
      <p class="prose">
        It has exactly one flaw. A being carrying DNA from both sides can breathe in
        either world — and across deep time, two of those came into existence by
        accident. That is the entire story.
      </p>
      <figure>
        <Plate id="lore-diagram" locale={locale} sizes="(max-width: 900px) 92vw, 820px" />
        <figcaption>The Abstract Universe, schematised: two authors, two peoples, one veil.</figcaption>
      </figure>
    </section>
  </article>
</BaseLayout>

<style>
  .page { padding: clamp(2rem, 6vw, 4rem) var(--gutter); max-width: 1100px; margin: 0 auto; }
  h1 { font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 2.4rem; }
  .split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 1px solid var(--hair);
    border-radius: 12px;
    overflow: hidden;
  }
  .world { padding: clamp(1.4rem, 3vw, 2.2rem); }
  .world p:last-child { color: var(--dim); margin-bottom: 0; }
  .world.z { border-inline-end: 2px solid var(--zalian); }
  .world.b { border-inline-start: 2px solid var(--balian); }
  .label {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }
  .z .label { color: var(--zalian); }
  .b .label { color: var(--balian); }
  .creed {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
    margin-bottom: 1rem;
  }
  .barrier { margin-top: 3rem; }
  figure { margin: 2rem 0 0; }
  figure :global(img) { width: 100%; border-radius: 10px; border: 1px solid var(--hair); }
  figcaption {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--dim);
    margin-top: 0.7rem;
  }
  @media (max-width: 760px) {
    .split { grid-template-columns: 1fr; }
    .world.z { border-inline-end: none; border-bottom: 2px solid var(--zalian); }
    .world.b { border-inline-start: none; }
  }
</style>
```

Create `src/pages/pt/worlds.astro` — identical structure and styles, Portuguese copy:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import Plate from '~/components/Plate.astro';

const locale = 'pt' as const;
---
<BaseLayout
  locale={locale}
  route="worlds"
  title="Os Dois Mundos — The Hunt"
  description="Terra 1 e Terra 2, o pacto que as separou, e a Barreira de ar que mata qualquer um que tente atravessar."
>
  <article class="page">
    <p class="eyebrow">A cosmologia</p>
    <h1>Duas Terras, um véu</h1>

    <div class="split">
      <section class="world z">
        <p class="label">Terra 1</p>
        <h2>O reino de Zalian</h2>
        <p class="creed">Ordem · Lei · Pureza</p>
        <p>
          Zalian construiu a Terra 1 e a povoou com humanos puros, sem mistura com nada
          mais. Ela os guia à distância, através dos sonhos e do que dizem em voz alta, e
          não entra numa mente sem convite. Seu povo nunca soube que existe outro céu.
        </p>
      </section>

      <section class="world b">
        <p class="label">Terra 2</p>
        <h2>O reino de Balian</h2>
        <p class="creed">Caos · Vontade · Hibridez</p>
        <p>
          Balian foi embora e levou seguidores consigo. O que construíram na Terra 2 são
          os Virden — humanos e anjos caídos misturados, vivendo em convulsão permanente.
          Balian vive fisicamente entre eles. O sofrimento os tornou rápidos: ultrapassaram
          a Terra 1 por milênios.
        </p>
      </section>
    </div>

    <section class="barrier">
      <h2>A Barreira</h2>
      <p class="prose">
        O que separa os dois mundos não é um muro. É o ar. Zalian pôs as atmosferas das
        duas Terras uma contra a outra: um humano puro que respira o ar Virden morre, e um
        Virden puro que respira o ar humano morre. Nenhuma frota atravessa isso. Nenhuma
        arma resolve.
      </p>
      <p class="prose">
        Existe exatamente uma falha. Um ser que carregue DNA dos dois lados consegue
        respirar em qualquer um dos mundos — e, ao longo de um tempo imenso, dois deles
        surgiram por acidente. É disso que a história inteira trata.
      </p>
      <figure>
        <Plate id="lore-diagram" locale={locale} sizes="(max-width: 900px) 92vw, 820px" />
        <figcaption>O Universo Abstrato esquematizado: dois autores, dois povos, um véu.</figcaption>
      </figure>
    </section>
  </article>
</BaseLayout>

<style>
  .page { padding: clamp(2rem, 6vw, 4rem) var(--gutter); max-width: 1100px; margin: 0 auto; }
  h1 { font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 2.4rem; }
  .split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 1px solid var(--hair);
    border-radius: 12px;
    overflow: hidden;
  }
  .world { padding: clamp(1.4rem, 3vw, 2.2rem); }
  .world p:last-child { color: var(--dim); margin-bottom: 0; }
  .world.z { border-inline-end: 2px solid var(--zalian); }
  .world.b { border-inline-start: 2px solid var(--balian); }
  .label {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }
  .z .label { color: var(--zalian); }
  .b .label { color: var(--balian); }
  .creed {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
    margin-bottom: 1rem;
  }
  .barrier { margin-top: 3rem; }
  figure { margin: 2rem 0 0; }
  figure :global(img) { width: 100%; border-radius: 10px; border: 1px solid var(--hair); }
  figcaption {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--dim);
    margin-top: 0.7rem;
  }
  @media (max-width: 760px) {
    .split { grid-template-columns: 1fr; }
    .world.z { border-inline-end: none; border-bottom: 2px solid var(--zalian); }
    .world.b { border-inline-start: none; }
  }
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — 4 worlds tests green.

- [ ] **Step 5: Commit**

```bash
git add src/pages/worlds.astro src/pages/pt/worlds.astro tests/build/worlds.test.ts
git commit -m "feat: build the two worlds page"
```

---

## Task 8: The gods and the hybrids

**Files:**
- Create: `src/components/CharacterCard.astro`
- Create: `src/pages/gods.astro`, `src/pages/pt/gods.astro`, `src/pages/hybrids.astro`, `src/pages/pt/hybrids.astro`
- Create: `tests/build/characters.test.ts`

**Interfaces:**
- Consumes: `Plate`, `ArtId`, `Locale`.
- Produces: `<CharacterCard id={ArtId} locale name epithet ring="gold"|"violet"|"mirror-gold"|"mirror-violet" />` with a default slot for body copy.

- [ ] **Step 1: Write the failing test**

Create `tests/build/characters.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('gods page', () => {
  it('presents both gods in both locales', () => {
    expect(html('gods/index.html')).toContain('Zalian');
    expect(html('gods/index.html')).toContain('Balian');
    expect(html('pt/gods/index.html')).toContain('Primogênito');
  });

  it('states the speech constraint, which is the story engine', () => {
    expect(html('gods/index.html')).toContain('aloud');
  });
});

describe('hybrids page', () => {
  it('presents both hybrids in both locales', () => {
    expect(html('hybrids/index.html')).toContain('Fridan');
    expect(html('hybrids/index.html')).toContain('Uxies');
    expect(html('pt/hybrids/index.html')).toContain('Uxies');
  });

  it('gives the hybrids mirrored rings crossing both worlds', () => {
    const doc = html('hybrids/index.html');
    expect(doc).toContain('ring--mirror-gold');
    expect(doc).toContain('ring--mirror-violet');
  });

  it('gives each god a single-world ring', () => {
    const doc = html('gods/index.html');
    expect(doc).toContain('ring--gold');
    expect(doc).toContain('ring--violet');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build`
Expected: FAIL — `dist/gods/index.html` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/CharacterCard.astro`:

```astro
---
import Plate from '~/components/Plate.astro';
import type { ArtId } from '~/data/art';
import type { Locale } from '~/i18n/config';

interface Props {
  id: ArtId;
  locale: Locale;
  name: string;
  epithet: string;
  ring: 'gold' | 'violet' | 'mirror-gold' | 'mirror-violet';
}
const { id, locale, name, epithet, ring } = Astro.props;
---
<article class="card">
  <div class={`ring ring--${ring}`}>
    <Plate id={id} locale={locale} sizes="120px" widths={[120, 240, 360]} />
  </div>
  <p class="epithet">{epithet}</p>
  <h2>{name}</h2>
  <div class="body"><slot /></div>
</article>

<style>
  .card {
    background: var(--panel);
    border: 1px solid var(--hair);
    border-radius: 12px;
    padding: 1.6rem 1.4rem 1.8rem;
  }
  .ring {
    width: 116px;
    height: 116px;
    border-radius: 50%;
    padding: 3px;
    margin-bottom: 1.1rem;
  }
  .ring :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }
  /* Gold is Earth 1, violet is Earth 2. Only hybrids carry both. */
  .ring--gold { background: linear-gradient(145deg, var(--zalian), rgba(232, 200, 115, 0.2)); }
  .ring--violet { background: linear-gradient(145deg, var(--balian), rgba(155, 107, 240, 0.2)); }
  .ring--mirror-gold { background: linear-gradient(145deg, var(--zalian) 45%, var(--balian)); }
  .ring--mirror-violet { background: linear-gradient(145deg, var(--balian) 45%, var(--zalian)); }
  .epithet {
    font-family: var(--font-mono);
    font-size: 0.64rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--dim);
    margin-bottom: 0.4rem;
  }
  h2 { font-size: 1.5rem; margin-bottom: 0.8rem; }
  .body { color: var(--dim); }
  .body :global(p:last-child) { margin-bottom: 0; }
</style>
```

Create `src/pages/gods.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import CharacterCard from '~/components/CharacterCard.astro';

const locale = 'en' as const;
---
<BaseLayout
  locale={locale}
  route="gods"
  title="The Gods — The Hunt"
  description="Zalian made Balian, and then they disagreed about how to hold a universe. The pact they signed is still holding — and still leaking."
>
  <article class="page">
    <p class="eyebrow">The two who split</p>
    <h1>Gods</h1>
    <p class="prose lede">
      One of them made the other. They disagreed about a single question — whether a
      creator should stand at a distance or live among the created — and rather than
      destroy each other they divided everything.
    </p>

    <div class="pair">
      <CharacterCard
        id="zalian-portrait"
        locale={locale}
        name="Zalian"
        epithet="Supreme Architect · Earth 1"
        ring="gold"
      >
        <p>
          The original creator. She holds to a law she wrote for herself: she does not
          read a conscious mind. She hears only what is said <strong>aloud</strong>, and
          what is dreamed — because in REM the boundary between thinking and speaking
          dissolves.
        </p>
        <p>
          It is a rule made out of respect for free will, and it is the crack the whole
          theft runs through. She has always known there is foreign DNA in one of her
          humans. She let him exist anyway.
        </p>
      </CharacterCard>

      <CharacterCard
        id="balian-sheet"
        locale={locale}
        name="Balian"
        epithet="The Firstborn · Earth 2"
        ring="violet"
      >
        <p>
          Zalian's own creation, grown past what she intended. He wanted presence: to
          stand inside his world rather than above it. He took followers and left, and
          on the far side of the Barrier he walks among the Virden in person.
        </p>
        <p>
          He understands Zalian's architecture better than anyone alive, including the
          exact shape of her blind spot. Whether he engineered the flaw or merely noticed
          it is the question the story keeps asking.
        </p>
      </CharacterCard>
    </div>
  </article>
</BaseLayout>

<style>
  .page { padding: clamp(2rem, 6vw, 4rem) var(--gutter); max-width: 1000px; margin: 0 auto; }
  h1 { font-size: clamp(2rem, 5vw, 3rem); }
  .lede { color: var(--dim); margin-bottom: 2.4rem; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem; }
  @media (max-width: 760px) { .pair { grid-template-columns: 1fr; } }
</style>
```

Create `src/pages/pt/gods.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import CharacterCard from '~/components/CharacterCard.astro';

const locale = 'pt' as const;
---
<BaseLayout
  locale={locale}
  route="gods"
  title="Os Deuses — The Hunt"
  description="Zalian criou Balian, e então discordaram sobre como sustentar um universo. O pacto que assinaram ainda se mantém — e ainda vaza."
>
  <article class="page">
    <p class="eyebrow">Os dois que se dividiram</p>
    <h1>Deuses</h1>
    <p class="prose lede">
      Um deles criou o outro. Discordaram sobre uma única questão — se um criador deve
      permanecer à distância ou viver entre suas criaturas — e, em vez de se destruírem,
      dividiram tudo.
    </p>

    <div class="pair">
      <CharacterCard
        id="zalian-portrait"
        locale={locale}
        name="Zalian"
        epithet="Arquiteta Suprema · Terra 1"
        ring="gold"
      >
        <p>
          A criadora original. Ela obedece a uma lei que escreveu para si mesma: não lê
          uma mente consciente. Ouve apenas o que é dito <strong>em voz alta</strong> e o
          que é sonhado — porque no sono REM a fronteira entre pensar e falar se dissolve.
        </p>
        <p>
          É uma regra feita por respeito ao livre-arbítrio, e é a fresta por onde o roubo
          inteiro passa. Ela sempre soube que havia DNA estrangeiro em um de seus humanos.
          Ainda assim, deixou que ele existisse.
        </p>
      </CharacterCard>

      <CharacterCard
        id="balian-sheet"
        locale={locale}
        name="Balian"
        epithet="O Primogênito · Terra 2"
        ring="violet"
      >
        <p>
          Criação da própria Zalian, crescida além do que ela pretendia. Ele queria
          presença: estar dentro do seu mundo, não acima dele. Levou seguidores e partiu,
          e do outro lado da Barreira caminha em pessoa entre os Virden.
        </p>
        <p>
          Ele entende a arquitetura de Zalian melhor do que qualquer um, inclusive o
          formato exato do ponto cego dela. Se planejou a falha ou apenas a percebeu é a
          pergunta que a história não para de fazer.
        </p>
      </CharacterCard>
    </div>
  </article>
</BaseLayout>

<style>
  .page { padding: clamp(2rem, 6vw, 4rem) var(--gutter); max-width: 1000px; margin: 0 auto; }
  h1 { font-size: clamp(2rem, 5vw, 3rem); }
  .lede { color: var(--dim); margin-bottom: 2.4rem; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem; }
  @media (max-width: 760px) { .pair { grid-template-columns: 1fr; } }
</style>
```

Create `src/pages/hybrids.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import CharacterCard from '~/components/CharacterCard.astro';
import Seam from '~/components/Seam.astro';

const locale = 'en' as const;
---
<BaseLayout
  locale={locale}
  route="hybrids"
  title="The Hybrids — The Hunt"
  description="Two people, one in each world, each carrying a fragment of the other side's god. They are the only way across the Barrier."
>
  <article class="page">
    <p class="eyebrow">Two mirrors, one circuit</p>
    <h1>Hybrids</h1>
    <p class="prose lede">
      Deep time made two mistakes, one in each world, and they match. Each carries a
      fragment of the god who belongs to the other sky. Nobody designed them — which is
      what makes them the only door.
    </p>

    <div class="pair">
      <CharacterCard
        id="fridan-sheet"
        locale={locale}
        name="Fridan"
        epithet="Earth 1 human · Balian fragment"
        ring="mirror-gold"
      >
        <p>
          An ordinary man from Nor Yesey with a strand of Balian's lineage buried in his
          genome. Earth 2's probability engine scanned billions of minds and found him —
          not for who he is, but for what he could be plugged into.
        </p>
        <p>
          He was meant to wake up remembering nothing. Interference broke the memory
          suppression, and he woke remembering everything.
        </p>
      </CharacterCard>

      <CharacterCard
        id="uxies-sheet"
        locale={locale}
        name="Uxies"
        epithet="Earth 2 Virden · Zalian fragment"
        ring="mirror-violet"
      >
        <p>
          A Virden woman living in the noise of Earth 2, carrying a fragment of Zalian
          she has no name for. She feels a stillness nobody around her feels, and it has
          always set her slightly apart.
        </p>
        <p>
          She does not know she is the other half of a circuit. She does not know anyone
          is looking for her.
        </p>
      </CharacterCard>
    </div>

    <Seam />

    <p class="prose closing">
      Fridan is a human carrying Balian. Uxies is a Virden carrying Zalian. Put them at
      either end of the same line and the Barrier has, for the first time, something it
      cannot stop.
    </p>
  </article>
</BaseLayout>

<style>
  .page { padding: clamp(2rem, 6vw, 4rem) var(--gutter); max-width: 1000px; margin: 0 auto; }
  h1 { font-size: clamp(2rem, 5vw, 3rem); }
  .lede { color: var(--dim); margin-bottom: 2.4rem; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem; margin-bottom: 2.4rem; }
  .closing { color: var(--ink); font-style: italic; margin-top: 2rem; }
  @media (max-width: 760px) { .pair { grid-template-columns: 1fr; } }
</style>
```

Create `src/pages/pt/hybrids.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import CharacterCard from '~/components/CharacterCard.astro';
import Seam from '~/components/Seam.astro';

const locale = 'pt' as const;
---
<BaseLayout
  locale={locale}
  route="hybrids"
  title="Os Híbridos — The Hunt"
  description="Duas pessoas, uma em cada mundo, cada uma carregando um fragmento do deus do outro lado. São a única travessia possível da Barreira."
>
  <article class="page">
    <p class="eyebrow">Dois espelhos, um circuito</p>
    <h1>Híbridos</h1>
    <p class="prose lede">
      O tempo profundo cometeu dois erros, um em cada mundo, e eles se encaixam. Cada um
      carrega um fragmento do deus que pertence ao outro céu. Ninguém os projetou — e é
      justamente por isso que são a única porta.
    </p>

    <div class="pair">
      <CharacterCard
        id="fridan-sheet"
        locale={locale}
        name="Fridan"
        epithet="Humano da Terra 1 · fragmento de Balian"
        ring="mirror-gold"
      >
        <p>
          Um homem comum de Nor Yesey com um fio da linhagem de Balian enterrado no
          genoma. A máquina de probabilidades da Terra 2 varreu bilhões de mentes e o
          encontrou — não por quem ele é, mas por onde ele podia ser conectado.
        </p>
        <p>
          Ele deveria acordar sem lembrar de nada. Uma interferência quebrou a supressão
          da memória, e ele acordou lembrando de tudo.
        </p>
      </CharacterCard>

      <CharacterCard
        id="uxies-sheet"
        locale={locale}
        name="Uxies"
        epithet="Virden da Terra 2 · fragmento de Zalian"
        ring="mirror-violet"
      >
        <p>
          Uma mulher Virden vivendo no ruído da Terra 2, carregando um fragmento de
          Zalian para o qual não tem nome. Sente uma quietude que ninguém à sua volta
          sente, e isso sempre a manteve um pouco à parte.
        </p>
        <p>
          Ela não sabe que é a outra metade de um circuito. Não sabe que alguém a procura.
        </p>
      </CharacterCard>
    </div>

    <Seam />

    <p class="prose closing">
      Fridan é um humano carregando Balian. Uxies é uma Virden carregando Zalian. Coloque
      os dois nas pontas da mesma linha e a Barreira terá, pela primeira vez, algo que não
      consegue deter.
    </p>
  </article>
</BaseLayout>

<style>
  .page { padding: clamp(2rem, 6vw, 4rem) var(--gutter); max-width: 1000px; margin: 0 auto; }
  h1 { font-size: clamp(2rem, 5vw, 3rem); }
  .lede { color: var(--dim); margin-bottom: 2.4rem; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem; margin-bottom: 2.4rem; }
  .closing { color: var(--ink); font-style: italic; margin-top: 2rem; }
  @media (max-width: 760px) { .pair { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — 5 character tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/CharacterCard.astro src/pages/gods.astro src/pages/pt/gods.astro src/pages/hybrids.astro src/pages/pt/hybrids.astro tests/build/characters.test.ts
git commit -m "feat: build the gods and hybrids pages"
```

---

## Task 9: The Sphere

**Files:**
- Create: `src/pages/sphere.astro`, `src/pages/pt/sphere.astro`
- Create: `tests/build/sphere.test.ts`

**Interfaces:**
- Consumes: `BaseLayout`, `Plate`, `Seam`.
- Produces: `/sphere/` and `/pt/sphere/`.

- [ ] **Step 1: Write the failing test**

Create `tests/build/sphere.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('sphere page', () => {
  it('shows the glyph in both locales', () => {
    expect(html('sphere/index.html')).toContain('(: .)');
    expect(html('pt/sphere/index.html')).toContain('(: .)');
  });

  it('describes the object as unremarkable rather than grand', () => {
    expect(html('sphere/index.html')).toMatch(/humble|unremarkable|small/i);
  });

  it('renders the sphere plates', () => {
    const doc = html('sphere/index.html');
    expect(doc).toMatch(/alt="[^"]*pedestal[^"]*"/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build`
Expected: FAIL — `dist/sphere/index.html` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `src/pages/sphere.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import Plate from '~/components/Plate.astro';
import Seam from '~/components/Seam.astro';

const locale = 'en' as const;
---
<BaseLayout
  locale={locale}
  route="sphere"
  title="The Sphere — The Hunt"
  description="A small blue object marked with three dots. It is not a gift. It is an interface, and it runs in both directions."
>
  <article class="page">
    <p class="eyebrow">The object</p>
    <h1>The Sphere</h1>

    <div class="lead">
      <div>
        <p class="prose">
          It is small, blue and unremarkable — closer to a felted lint remover than to
          anything holy. Nothing about it announces what it is. That is the point: the
          Hunt is built so the finder believes he found a prize.
        </p>
        <p class="prose">
          On its surface are two marks in front and one behind: <span class="glyph">(: .)</span>
          It has never been explained. It might be a dimensional marker, an activation key
          readable only by someone carrying the right DNA, or a serial number — which
          would mean this is not the first Sphere, and Fridan is not the first finder.
        </p>
      </div>
      <figure>
        <Plate id="sphere-pedestal" locale={locale} sizes="(max-width: 860px) 90vw, 420px" />
      </figure>
    </div>

    <Seam />

    <section class="mechanic">
      <h2>What it actually does</h2>
      <p class="prose">
        Touching it expands the finder's cognition to the scale of the universe: total
        clarity, the sense of finally knowing what one was always supposed to know. That
        part is real, and it lasts seconds.
      </p>
      <p class="prose">
        Underneath, the Sphere is an interface running in both directions. While it gives,
        it takes: everything the god communicated through the dream, everything the finder
        understood, transmitted intact to receivers in another galaxy. And it leaves
        something behind — foreign biology, written into a human body that did not consent
        and will not be asked.
      </p>
      <p class="prose">
        The god scans him afterwards and finds something that is no longer entirely her
        own. By her own law, she closes the connection. The theft is complete, and the man
        it went through is the only one who knows it happened.
      </p>
    </section>
  </article>
</BaseLayout>

<style>
  .page { padding: clamp(2rem, 6vw, 4rem) var(--gutter); max-width: 1000px; margin: 0 auto; }
  h1 { font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 2rem; }
  .lead { display: grid; grid-template-columns: 1fr 420px; gap: 2.4rem; align-items: start; }
  figure { margin: 0; }
  figure :global(img) { width: 100%; border-radius: 10px; border: 1px solid var(--hair); }
  .glyph {
    font-family: var(--font-mono);
    color: var(--zalian);
    font-size: 1.05em;
    letter-spacing: 0.08em;
  }
  .mechanic { margin-top: 2.4rem; }
  .mechanic .prose { color: var(--dim); }
  @media (max-width: 860px) { .lead { grid-template-columns: 1fr; } }
</style>
```

Create `src/pages/pt/sphere.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import Plate from '~/components/Plate.astro';
import Seam from '~/components/Seam.astro';

const locale = 'pt' as const;
---
<BaseLayout
  locale={locale}
  route="sphere"
  title="A Esfera — The Hunt"
  description="Um pequeno objeto azul marcado com três pontos. Não é um presente. É uma interface, e funciona nos dois sentidos."
>
  <article class="page">
    <p class="eyebrow">O objeto</p>
    <h1>A Esfera</h1>

    <div class="lead">
      <div>
        <p class="prose">
          É pequena, azul e banal — mais parecida com um tira-fiapos de feltro do que com
          qualquer coisa sagrada. Nada nela anuncia o que é. E esse é o ponto: a Caçada é
          construída para que quem encontra acredite ter encontrado um prêmio.
        </p>
        <p class="prose">
          Na superfície há duas marcas à frente e uma atrás: <span class="glyph">(: .)</span>
          Nunca foram explicadas. Podem ser um marcador dimensional, uma chave de ativação
          legível apenas por quem carrega o DNA certo, ou um número de série — o que
          significaria que esta não é a primeira Esfera, e Fridan não é o primeiro a
          encontrá-la.
        </p>
      </div>
      <figure>
        <Plate id="sphere-pedestal" locale={locale} sizes="(max-width: 860px) 90vw, 420px" />
      </figure>
    </div>

    <Seam />

    <section class="mechanic">
      <h2>O que ela faz de verdade</h2>
      <p class="prose">
        Tocá-la expande a cognição de quem a encontra à escala do universo: clareza total,
        a sensação de finalmente saber o que sempre se deveria saber. Essa parte é real, e
        dura segundos.
      </p>
      <p class="prose">
        Por baixo, a Esfera é uma interface que corre nos dois sentidos. Enquanto dá, ela
        tira: tudo o que a deusa comunicou pelo sonho, tudo o que o sonhador entendeu,
        transmitido intacto para receptores em outra galáxia. E deixa algo para trás —
        biologia estrangeira, escrita dentro de um corpo humano que não consentiu e não
        será consultado.
      </p>
      <p class="prose">
        Depois, a deusa o examina e encontra algo que já não é inteiramente dela. Pela
        própria lei, encerra a conexão. O roubo está completo, e o homem por quem ele
        passou é o único que sabe que aconteceu.
      </p>
    </section>
  </article>
</BaseLayout>

<style>
  .page { padding: clamp(2rem, 6vw, 4rem) var(--gutter); max-width: 1000px; margin: 0 auto; }
  h1 { font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 2rem; }
  .lead { display: grid; grid-template-columns: 1fr 420px; gap: 2.4rem; align-items: start; }
  figure { margin: 0; }
  figure :global(img) { width: 100%; border-radius: 10px; border: 1px solid var(--hair); }
  .glyph {
    font-family: var(--font-mono);
    color: var(--zalian);
    font-size: 1.05em;
    letter-spacing: 0.08em;
  }
  .mechanic { margin-top: 2.4rem; }
  .mechanic .prose { color: var(--dim); }
  @media (max-width: 860px) { .lead { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — 3 sphere tests green.

- [ ] **Step 5: Commit**

```bash
git add src/pages/sphere.astro src/pages/pt/sphere.astro tests/build/sphere.test.ts
git commit -m "feat: build the Sphere page"
```

---

## Task 10: The gallery

**Files:**
- Create: `src/pages/gallery.astro`, `src/pages/pt/gallery.astro`
- Create: `src/components/Lightbox.astro`
- Create: `tests/build/gallery.test.ts`

**Interfaces:**
- Consumes: `ART`, `ART_IDS`, `Plate`, `Locale`.
- Produces: `/gallery/` and `/pt/gallery/`. `Lightbox.astro` is a self-contained island: it binds click handlers to every `[data-plate]` element already in the DOM and needs no props.

- [ ] **Step 1: Write the failing test**

Create `tests/build/gallery.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ART_IDS } from '~/data/art';

const html = (p: string) => readFileSync(resolve(process.cwd(), 'dist', p), 'utf8');

describe('gallery page', () => {
  it('renders every plate in the manifest', () => {
    const doc = html('gallery/index.html');
    const figures = doc.match(/data-plate=/g) ?? [];
    expect(figures).toHaveLength(ART_IDS.length);
  });

  it('lazy-loads everything except the first two plates', () => {
    const doc = html('gallery/index.html');
    const eager = doc.match(/loading="eager"/g) ?? [];
    expect(eager.length).toBeLessThanOrEqual(2);
  });

  it('uses localized captions', () => {
    expect(html('gallery/index.html')).toContain('The Sphere');
    expect(html('pt/gallery/index.html')).toContain('A Esfera');
  });

  it('exposes an accessible dialog for the lightbox', () => {
    const doc = html('gallery/index.html');
    expect(doc).toMatch(/<dialog[^>]*id="lightbox"/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build`
Expected: FAIL — `dist/gallery/index.html` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/Lightbox.astro`:

```astro
---
import type { Locale } from '~/i18n/config';
interface Props { locale: Locale }
const { locale } = Astro.props;
const closeLabel = locale === 'en' ? 'Close' : 'Fechar';
---
<dialog id="lightbox" aria-label={locale === 'en' ? 'Artwork viewer' : 'Visualizador de arte'}>
  <button id="lightbox-close" type="button">{closeLabel}</button>
  <img id="lightbox-img" alt="" />
  <p id="lightbox-caption"></p>
</dialog>

<style>
  #lightbox {
    border: none;
    background: var(--void);
    color: var(--ink);
    max-width: min(92vw, 900px);
    padding: 1rem;
    border-radius: 12px;
  }
  #lightbox::backdrop { background: rgba(6, 7, 12, 0.92); }
  #lightbox img { width: 100%; height: auto; border-radius: 8px; display: block; }
  #lightbox-caption {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--dim);
    margin: 0.8rem 0 0;
  }
  #lightbox-close {
    float: right;
    background: none;
    border: 1px solid var(--hair);
    border-radius: 999px;
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    margin-bottom: 0.6rem;
  }
</style>

<script>
  const dialog = document.getElementById('lightbox') as HTMLDialogElement | null;
  const img = document.getElementById('lightbox-img') as HTMLImageElement | null;
  const caption = document.getElementById('lightbox-caption');
  const close = document.getElementById('lightbox-close');
  if (dialog && img && caption && close) {
    document.querySelectorAll<HTMLElement>('[data-plate]').forEach((figure) => {
      figure.addEventListener('click', () => {
        const source = figure.querySelector('img');
        if (!source) return;
        img.src = source.currentSrc || source.src;
        img.alt = source.alt;
        caption.textContent = figure.dataset.caption ?? '';
        dialog.showModal();
      });
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }
</script>
```

Create `src/pages/gallery.astro`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import Plate from '~/components/Plate.astro';
import Lightbox from '~/components/Lightbox.astro';
import { ART, ART_IDS } from '~/data/art';

const locale = 'en' as const;
---
<BaseLayout
  locale={locale}
  route="gallery"
  title="Gallery — The Hunt"
  description="Every illustration from The Hunt: the gods, the two worlds, the Sphere, and the two hybrids who bridge them."
>
  <article class="page">
    <p class="eyebrow">The archive</p>
    <h1>Gallery</h1>

    <div class="grid">
      {ART_IDS.map((id, index) => (
        <figure class="tile" data-plate data-caption={ART[id].title[locale]}>
          <Plate
            id={id}
            locale={locale}
            sizes="(max-width: 640px) 46vw, (max-width: 1000px) 30vw, 260px"
            widths={[300, 600, 900]}
            loading={index < 2 ? 'eager' : 'lazy'}
          />
          <figcaption>{ART[id].title[locale]}</figcaption>
        </figure>
      ))}
    </div>
  </article>

  <Lightbox locale={locale} />
</BaseLayout>

<style>
  .page { padding: clamp(2rem, 6vw, 4rem) var(--gutter); max-width: 1200px; margin: 0 auto; }
  h1 { font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 2rem; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }
  .tile { margin: 0; cursor: zoom-in; }
  .tile :global(img) {
    width: 100%;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--hair);
    display: block;
  }
  figcaption {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.06em;
    color: var(--dim);
    margin-top: 0.5rem;
  }
</style>
```

Create `src/pages/pt/gallery.astro` — same structure with `locale = 'pt'`:

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import Plate from '~/components/Plate.astro';
import Lightbox from '~/components/Lightbox.astro';
import { ART, ART_IDS } from '~/data/art';

const locale = 'pt' as const;
---
<BaseLayout
  locale={locale}
  route="gallery"
  title="Galeria — The Hunt"
  description="Todas as ilustrações de The Hunt: os deuses, os dois mundos, a Esfera e os dois híbridos que os ligam."
>
  <article class="page">
    <p class="eyebrow">O arquivo</p>
    <h1>Galeria</h1>

    <div class="grid">
      {ART_IDS.map((id, index) => (
        <figure class="tile" data-plate data-caption={ART[id].title[locale]}>
          <Plate
            id={id}
            locale={locale}
            sizes="(max-width: 640px) 46vw, (max-width: 1000px) 30vw, 260px"
            widths={[300, 600, 900]}
            loading={index < 2 ? 'eager' : 'lazy'}
          />
          <figcaption>{ART[id].title[locale]}</figcaption>
        </figure>
      ))}
    </div>
  </article>

  <Lightbox locale={locale} />
</BaseLayout>

<style>
  .page { padding: clamp(2rem, 6vw, 4rem) var(--gutter); max-width: 1200px; margin: 0 auto; }
  h1 { font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 2rem; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }
  .tile { margin: 0; cursor: zoom-in; }
  .tile :global(img) {
    width: 100%;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--hair);
    display: block;
  }
  figcaption {
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.06em;
    color: var(--dim);
    margin-top: 0.5rem;
  }
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — 4 gallery tests green.

- [ ] **Step 5: Commit**

```bash
git add src/pages/gallery.astro src/pages/pt/gallery.astro src/components/Lightbox.astro tests/build/gallery.test.ts
git commit -m "feat: build the gallery with an accessible lightbox"
```

---

## Task 11: Preserve legacy URLs and deploy from Actions

**Files:**
- Create: `.github/workflows/deploy.yml`
- Move: `concepts/worlds-of-the-hunt.html` → `public/concepts/worlds-of-the-hunt.html`
- Delete: `index.html` (the hand-written landing page Astro now replaces)
- Create: `tests/build/legacy.test.ts`

**Interfaces:**
- Consumes: everything above.
- Produces: a deployed site. No code exports.

- [ ] **Step 1: Write the failing test**

Create `tests/build/legacy.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = (p: string) => resolve(process.cwd(), 'dist', p);

describe('legacy urls', () => {
  it('still serves the concept page at its published path', () => {
    expect(existsSync(dist('concepts/worlds-of-the-hunt.html'))).toBe(true);
  });

  it('serves the concept page unmodified', () => {
    // The published concept page is ~1.95MB of self-contained HTML with inlined art.
    const bytes = statSync(dist('concepts/worlds-of-the-hunt.html')).size;
    expect(bytes).toBeGreaterThan(1_500_000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build`
Expected: FAIL — `dist/concepts/worlds-of-the-hunt.html` does not exist.

- [ ] **Step 3: Write minimal implementation**

Move the concept page into `public/` so Astro copies it verbatim, and drop the superseded landing page:

```bash
mkdir -p public/concepts
git mv concepts/worlds-of-the-hunt.html public/concepts/worlds-of-the-hunt.html
rmdir concepts
git rm index.html
```

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Switch Pages from the legacy branch build to Actions (one-time, requires the repo owner's token):

```bash
gh api -X PUT repos/renilsonjr/The-Hunt/pages -f build_type=workflow
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:build`
Expected: PASS — both legacy tests green, and the full suite across all test files green.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy.yml public/concepts tests/build/legacy.test.ts
git commit -m "feat: deploy from Actions and preserve the published concept URL"
git push origin main
```

- [ ] **Step 6: Verify the deployment**

After the workflow completes:

```bash
gh run list --limit 1
curl -s -o /dev/null -w "%{http_code}\n" https://renilsonjr.github.io/The-Hunt/
curl -s -o /dev/null -w "%{http_code}\n" https://renilsonjr.github.io/The-Hunt/pt/
curl -s -o /dev/null -w "%{http_code}\n" https://renilsonjr.github.io/The-Hunt/worlds/
curl -s -o /dev/null -w "%{http_code}\n" https://renilsonjr.github.io/The-Hunt/concepts/worlds-of-the-hunt.html
```

Expected: `200` on all four.

---

## Post-Phase verification

Run once at the end, before calling Phase A done:

- [ ] `npm test && npm run test:build` — full suite green
- [ ] Landing page transferred weight ≤ 400KB above the fold (browser devtools, Network panel, disable cache)
- [ ] Gallery first screen ≤ 1.2MB
- [ ] Keyboard-only pass: skip link works, nav is reachable, lightbox opens and closes with Enter and Escape
- [ ] `prefers-reduced-motion: reduce` set in the OS — no animation runs
- [ ] Both locales spot-checked on a narrow viewport (375px)
- [ ] Portuguese copy reviewed by the author — **required before announcing the site**, since every PT string in this plan is a draft written by a non-native speaker

## Known gaps carried into Phase B

- **LQIP blur placeholders are deferred.** Spec §8 asks for them on hero plates. Astro has no built-in blur-up, and the honest implementations both have costs: `getImage()` at 24px emits a real file, so it is another request that may not land before the hero it is meant to cover; inlining a true base64 placeholder needs a build-time step generating and embedding one data URI per hero. Neither is worth blocking Phase A, and the hero already ships `loading="eager"` with explicit dimensions, so nothing shifts on load. Revisit in Phase B alongside the average-colour tint field the art manifest would need.
- Balian's fallen angels are still unnamed; `/gods/` is written to avoid needing the name.
- `/codex/`, `/dream/` and `/journal/` are Phase B. Their nav entries do not exist yet.
- `/read/` and the chapter template are Phase C.
