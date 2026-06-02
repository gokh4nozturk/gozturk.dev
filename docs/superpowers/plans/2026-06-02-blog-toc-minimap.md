# Blog TOC Minimap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a chanhdai.com-style table-of-contents minimap to blog post pages — fixed to the right viewport margin, hover-expandable, with scroll-based active-section tracking.

**Architecture:** Pure server-side string parsing (`lib/toc.js` + `github-slugger`) extracts H2/H3 headings from raw MDX into TOC items. `rehype-slug` injects matching `id`s onto rendered headings. A `"use client"` component (`components/blog/TocMinimap.jsx`) renders the fixed minimap, uses `IntersectionObserver` for active tracking, and `motion/react` for the hover-expand. `app/blog/[slug]/page.jsx` wires the two together.

**Tech Stack:** Next.js 13 App Router (JSX), `next-mdx-remote/rsc`, `rehype-slug`, `github-slugger`, `motion/react`, Tailwind with `p3-*` tokens, Biome.

> **Note on tests & commits:** This repo has **no test runner** (per `CLAUDE.md`), so verification is manual (`pnpm dev` + browser) plus `pnpm lint:fix`. **Do not run `git commit` without the user's explicit go-ahead** (standing project rule) — treat the "Commit" steps as checkpoints to propose, not auto-run.

---

## File Structure

- **Create** `lib/toc.js` — `getTableOfContents(markdown)` heading extractor (server-safe, pure).
- **Create** `components/blog/TocMinimap.jsx` — `"use client"` fixed minimap + hover-expand + active tracking.
- **Modify** `app/blog/[slug]/page.jsx` — add `rehype-slug`, compute TOC, render `<TocMinimap />`.
- **Modify** `package.json` / lockfile — add `rehype-slug`, `github-slugger`.

---

## Task 1: Add dependencies

**Files:**
- Modify: `package.json` (+ `pnpm-lock.yaml`)

- [ ] **Step 1: Install the two packages**

Run:
```bash
pnpm add rehype-slug github-slugger
```
Expected: both added to `dependencies`, lockfile updated, no peer-dep errors.

- [ ] **Step 2: Verify they resolve**

Run:
```bash
node -e "require('github-slugger'); console.log('github-slugger ok')"
```
Expected: prints `github-slugger ok`. (`rehype-slug` is ESM-only; it is verified at build time in Task 4.)

- [ ] **Step 3: Commit (propose to user)**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add rehype-slug and github-slugger for blog TOC"
```

---

## Task 2: TOC extractor (`lib/toc.js`)

**Files:**
- Create: `lib/toc.js`

- [ ] **Step 1: Write the extractor**

Create `lib/toc.js`:
```js
import GithubSlugger from "github-slugger";

/**
 * Extract H2/H3 headings from raw MDX/markdown into TOC items.
 * Slugs are produced with github-slugger so they match rehype-slug's
 * ids on the rendered headings (including -1/-2 disambiguation).
 *
 * @param {string} markdown - raw markdown/MDX source
 * @returns {Array<{ title: string, url: string, depth: number }>}
 */
export function getTableOfContents(markdown) {
  if (!markdown) return [];

  const slugger = new GithubSlugger();
  const lines = markdown.split("\n");
  const items = [];
  let inFence = false;

  for (const line of lines) {
    // Toggle fenced code blocks (``` or ~~~) so headings inside code are ignored.
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // Match ATX headings of depth 2 or 3 only (skip H1 = post title).
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const depth = match[1].length;
    // Strip inline markdown emphasis/code/link syntax for the visible title.
    const title = match[2]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .trim();

    items.push({ depth, title, url: `#${slugger.slug(title)}` });
  }

  return items;
}
```

- [ ] **Step 2: Verify behavior with an ad-hoc run**

Run:
```bash
node --input-type=module -e "
import { getTableOfContents } from './lib/toc.js';
const md = [
  '# Title',
  '## Symptoms',
  'text',
  '\`\`\`',
  '## NotAHeading',
  '\`\`\`',
  '### Solution: Repair and Fix',
  '## Symptoms'
].join('\n');
console.log(JSON.stringify(getTableOfContents(md), null, 2));
"
```
Expected output:
```json
[
  { "depth": 2, "title": "Symptoms", "url": "#symptoms" },
  { "depth": 3, "title": "Solution: Repair and Fix", "url": "#solution-repair-and-fix" },
  { "depth": 2, "title": "Symptoms", "url": "#symptoms-1" }
]
```
Confirms: H1 skipped, code-fence heading skipped, H3 slug correct, duplicate gets `-1`.

- [ ] **Step 3: Run lint**

Run: `pnpm lint:fix`
Expected: no errors on `lib/toc.js` (imports/format may auto-sort).

- [ ] **Step 4: Commit (propose to user)**

```bash
git add lib/toc.js
git commit -m "feat: add getTableOfContents MDX heading extractor"
```

---

## Task 3: TocMinimap component

**Files:**
- Create: `components/blog/TocMinimap.jsx`

- [ ] **Step 1: Write the component**

Create `components/blog/TocMinimap.jsx`:
```jsx
"use client";

import { cn } from "@lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Fixed table-of-contents minimap for blog posts.
 * - Collapsed: stacked bars (indent/width by heading depth), active bar highlighted.
 * - Hover: expands into a clickable list of heading titles.
 * - Tracks the active section via IntersectionObserver.
 * Visible on lg+ only.
 *
 * @param {{ items: Array<{ title: string, url: string, depth: number }>, className?: string }} props
 */
export function TocMinimap({ items, className }) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!items?.length) return;

    const ids = items.map((item) => item.url.slice(1));
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  if (!items?.length) return null;

  const handleClick = (event, url) => {
    event.preventDefault();
    const id = url.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth" });
    history.pushState(null, "", url);
    setActiveId(id);
  };

  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        "-translate-y-1/2 group fixed top-1/2 right-4 z-30 hidden lg:block",
        className,
      )}
    >
      {/* Collapsed minimap */}
      <ul className="flex flex-col items-end gap-2 py-2 group-hover:opacity-0">
        {items.map((item) => {
          const isActive = item.url.slice(1) === activeId;
          return (
            <li key={item.url}>
              <span
                className={cn(
                  "block h-0.5 rounded-full transition-all",
                  item.depth === 2 ? "w-6" : "ml-2 w-4",
                  isActive
                    ? "bg-p3-text dark:bg-p3-text-dark"
                    : "bg-p3-text/30 dark:bg-p3-text-dark/30",
                )}
              />
            </li>
          );
        })}
      </ul>

      {/* Expanded list on hover */}
      <AnimatePresence>
        <motion.ul
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "pointer-events-none absolute top-1/2 right-0 hidden max-h-[60vh] w-56 -translate-y-1/2",
            "overflow-y-auto rounded-lg border border-p3-text/10 bg-p3-background-light p-3 shadow-lg",
            "group-hover:pointer-events-auto group-hover:block",
            "dark:border-p3-text-dark/10 dark:bg-p3-background",
          )}
          exit={{ opacity: 0, x: 8 }}
          initial={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.15 }}
        >
          {items.map((item) => {
            const isActive = item.url.slice(1) === activeId;
            return (
              <li key={item.url}>
                <a
                  className={cn(
                    "block rounded px-2 py-1 text-sm transition-colors",
                    item.depth === 3 && "pl-4",
                    isActive
                      ? "font-medium text-p3-text dark:text-p3-text-dark"
                      : "text-p3-text/60 hover:text-p3-text dark:text-p3-text-dark/60 dark:hover:text-p3-text-dark",
                  )}
                  href={item.url}
                  onClick={(event) => handleClick(event, item.url)}
                >
                  {item.title}
                </a>
              </li>
            );
          })}
        </motion.ul>
      </AnimatePresence>
    </nav>
  );
}

export default TocMinimap;
```

- [ ] **Step 2: Run lint (sorts classes/imports, verifies syntax)**

Run: `pnpm lint:fix`
Expected: file passes; Biome may re-sort Tailwind classes inside `cn(...)` — that is expected. No remaining errors.

- [ ] **Step 3: Commit (propose to user)**

```bash
git add components/blog/TocMinimap.jsx
git commit -m "feat: add TocMinimap blog component"
```

---

## Task 4: Wire into the blog post page

**Files:**
- Modify: `app/blog/[slug]/page.jsx`

- [ ] **Step 1: Add imports**

At the top of `app/blog/[slug]/page.jsx`, add alongside existing imports:
```jsx
import { TocMinimap } from "@components/blog/TocMinimap";
import { getTableOfContents } from "@lib/toc";
import rehypeSlug from "rehype-slug";
```

- [ ] **Step 2: Compute the TOC in the component body**

Inside `BlogPost`, after the `post` null-check (around the existing `const components = useMDXComponents({});` line), add:
```jsx
const toc = getTableOfContents(post.content);
```

- [ ] **Step 3: Add rehype-slug to MDX options**

In the `<MDXRemote ... />` call, change the `options.mdxOptions` block to include `rehypePlugins`:
```jsx
        <MDXRemote
          components={components}
          options={{
            mdxOptions: {
              rehypePlugins: [rehypeSlug],
              remarkPlugins: [remarkGfm],
            },
          }}
          source={post.content}
        />
```

- [ ] **Step 4: Render the minimap**

Wrap the returned JSX so the minimap is a sibling of `<article>`. Change the top-level `return (` to render a fragment:
```jsx
  return (
    <>
      <TocMinimap items={toc} />
      <article className="w-170 pb-40">
        {/* ...existing article contents unchanged... */}
      </article>
    </>
  );
```
(Keep everything inside `<article>` exactly as-is; only add the fragment wrapper and the `<TocMinimap />` line.)

- [ ] **Step 5: Build to verify rehype-slug (ESM) + wiring compile**

Run: `pnpm build`
Expected: build succeeds; `app/blog/[slug]` is generated via `generateStaticParams` with no errors.

- [ ] **Step 6: Run lint**

Run: `pnpm lint:fix`
Expected: imports auto-sorted (note: `@components`/`@lib` aliases), no errors.

- [ ] **Step 7: Commit (propose to user)**

```bash
git add app/blog/[slug]/page.jsx
git commit -m "feat: render TocMinimap on blog posts with slugged headings"
```

---

## Task 5: Manual verification

**Files:** none (verification only)

- [ ] **Step 1: Start dev server**

Run: `pnpm dev`, open `http://localhost:3000/blog/post-1`.

- [ ] **Step 2: Check the checklist**

Confirm on a `lg+` viewport:
- Minimap bars appear on the right edge; count + indent match the post's H2/H3 headings.
- Scrolling updates the highlighted (active) bar.
- Hovering the minimap expands the clickable title list.
- Clicking a title smooth-scrolls to that heading and updates the URL hash.
- Resize below `lg`: minimap is hidden, content unaffected.
- Toggle dark mode: colors use `p3-*` tokens correctly in both themes.

- [ ] **Step 3: Note any issues**

If any check fails, debug with `superpowers:systematic-debugging` before marking complete.

---

## Self-Review Notes

- **Spec coverage:** collapsed minimap (Task 3), hover-expand (Task 3), IntersectionObserver tracking (Task 3), click→smooth-scroll+hash (Task 3), responsive `lg+` (Task 3), `lib/toc.js` extractor with code-fence skipping + H1 skip + dedup (Task 2), `rehype-slug` ids (Task 4), wire-up (Task 4), new deps (Task 1), manual verification (Task 5). All spec sections mapped.
- **Slug consistency:** `getTableOfContents` (github-slugger) and rendered headings (`rehype-slug`, which also uses github-slugger) produce matching ids — relied on in Task 3's `IntersectionObserver` and `handleClick`.
- **No automated tests** by design (repo has none); manual verification + `pnpm build` + `pnpm lint:fix` are the gates.
```
