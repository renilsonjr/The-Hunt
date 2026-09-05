import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://renilsonjr.github.io',
  base: '/The-Hunt',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // 'class' appends the scope hash into the class attribute (class="glitch astro-xxxx")
  // instead of Astro 5's default separate data-astro-cid-* attribute. Task 5's chrome
  // test asserts on `class="glitch[^"]*">Hunt` immediately followed by '>', which only
  // holds under 'class' scoping.
  scopedStyleStrategy: 'class',
});
