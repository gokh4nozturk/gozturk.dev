# Blog TOC Minimap — Design

**Date:** 2026-06-02
**Status:** Approved
**Author:** Gökhan Öztürk (with Claude)

## Summary

Add a chanhdai.com-style **table-of-contents minimap** to blog post pages
(`app/blog/[slug]/page.jsx`). By default it renders as a compact minimap fixed
to the right edge of the viewport (in the empty margin outside the centered
`max-w-3xl` content column). On hover it expands into a full, clickable table of
contents. It tracks scroll position and highlights the active section.

## Context & Constraints

- The whole site is centered with `sm:max-w-3xl` (root layout, `app/layout.jsx`).
  Blog content is `w-170` (680px). There is little room *inside* the content
  column, so the TOC is positioned `fixed` to the viewport's right margin rather
  than inline beside the content.
- Blog posts are MDX in `posts/*.mdx`, read at request time by `lib/mdx.js`
  (`getPostData`) and rendered with `next-mdx-remote/rsc` `MDXRemote`. Custom
  element styling lives in `mdx-components.jsx`.
- Rendered headings currently have **no `id` attributes**, so anchor links and
  scroll tracking are not possible yet.
- Available deps: `remark-gfm`, `motion` (`motion/react`). No slug plugins.
- Styling uses the `p3-*` semantic tokens and class-based dark mode.

## Behavior

1. **Collapsed (default):** vertical stack of short horizontal bars, one per
   heading. Bar indent/width reflects heading depth (H2 vs H3). The bar for the
   currently-visible section is highlighted (color + width).
2. **Hover:** the minimap expands (animated via `motion/react`) into a scrollable
   list of heading titles, indented by depth, active item highlighted.
3. **Scroll tracking:** an `IntersectionObserver` watches all `h2,h3[id]` inside
   the article and sets the active heading as the user scrolls.
4. **Click:** smooth-scrolls to the target heading and updates the URL hash.
5. **Responsive:** only visible at `lg`/`xl` and up (needs side margin). Hidden on
   smaller screens — content remains fully accessible without it.

## Architecture

### 1. `lib/toc.js` — TOC extraction (server-safe)

```
getTableOfContents(markdown: string) -> Array<{ title, url, depth }>
```

- Parses the **raw MDX source** line by line for ATX headings (`##`, `###`).
- Skips H1 (the post title is already rendered in the page header) and depths
  deeper than H3 (keeps the minimap legible).
- Skips heading-like lines inside fenced code blocks (track ``` ``` `` toggles).
- Computes slugs with `github-slugger` so a `new GithubSlugger()` instance
  produces the same `-1`/`-2` disambiguation that `rehype-slug` produces on the
  rendered headings — guaranteeing TOC `url` matches heading `id`.
- Returns `{ title, url: "#slug", depth }`. `depth` is the heading level (2, 3).

### 2. Heading IDs via `rehype-slug`

- In `app/blog/[slug]/page.jsx`, add `rehype-slug` to `MDXRemote`
  `options.mdxOptions.rehypePlugins`. This adds matching `id`s to rendered
  headings. The existing `mdx-components.jsx` h2/h3 already spread `{...props}`,
  so the injected `id` flows through.

### 3. `components/blog/TocMinimap.jsx` (`"use client"`)

- Props: `items` (the TOC array), optional `className`.
- Returns `null` when `items.length === 0`.
- State: `activeId` (current section). Set up an `IntersectionObserver` in a
  `useEffect` over `document.querySelectorAll(...)` for the heading ids in
  `items`; clean up on unmount.
- Layout: `fixed`, vertically centered on the right side, hidden below `lg`.
- Renders collapsed bars; on `group-hover` reveals the expanded list with
  `motion/react`.
- Click handler: `preventDefault`, `scrollIntoView({ behavior: "smooth" })`,
  `history.pushState` (or `replaceState`) to update the hash.
- Styling: `p3-*` tokens, `cn(...)` from `@lib/utils`, Tailwind classes kept
  sorted (Biome will enforce).

### 4. Wire-up in `app/blog/[slug]/page.jsx`

- After loading `post`, compute `const toc = getTableOfContents(post.content)`.
- Add `rehypePlugins: [rehypeSlug]` to the MDX options.
- Render `<TocMinimap items={toc} />` as a sibling of the `<article>` (it is
  `fixed`, so DOM position is flexible).

## Data Flow

```
posts/*.mdx ──getPostData──▶ post.content (raw markdown)
                                  │
                                  ├─ getTableOfContents() ─▶ toc items ─▶ <TocMinimap items> (client)
                                  │                                              │
                                  └─ MDXRemote + rehype-slug ─▶ headings w/ id ◀──IntersectionObserver
```

The TOC `url` slugs and the rendered heading `id`s are produced by the same
slug algorithm (github-slugger / rehype-slug), so anchors line up exactly.

## New Dependencies

- `rehype-slug` — injects `id`s onto rendered MDX headings.
- `github-slugger` — used in `lib/toc.js` to generate matching slugs.

Both are small, standard, and mirror chanhdai's fumadocs-based approach.
Installed with `pnpm`.

## Error / Edge Handling

- No headings → `getTableOfContents` returns `[]`, `TocMinimap` renders `null`.
- Headings inside code fences are ignored.
- Duplicate heading text → github-slugger disambiguation keeps ids unique and
  matched on both sides.
- SSR safety: all DOM/observer work is inside `useEffect` in the client
  component; `lib/toc.js` is pure string parsing (server-safe).

## Out of Scope (YAGNI)

- TOC on the blog index, resume, or other pages — post pages only.
- Deep nesting beyond H3.
- Persisting expanded/collapsed state.
- Reading-progress bar.

## Testing / Verification

No test runner is configured in this repo. Verification is manual:

- `pnpm dev`, open a post with multiple H2/H3 headings.
- Confirm: minimap appears on `lg+`, bars match heading count/depth, active bar
  updates on scroll, hover expands to titles, clicking scrolls + updates hash,
  minimap hidden below `lg`, works in light and dark mode.
- `pnpm lint:fix` passes (sorted classes/imports).
```
