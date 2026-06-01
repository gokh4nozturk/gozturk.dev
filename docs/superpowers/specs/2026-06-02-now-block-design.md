# "Now" Block — Design

**Date:** 2026-06-02
**Status:** Approved (pending implementation plan)

## Goal

Add a live "Now" block to the homepage that signals Gökhan is an active,
building-in-public engineer. The block surfaces three **automated** signals —
no manual upkeep required:

1. Latest GitHub activity (most recent push)
2. Latest saved bookmark (Raindrop)
3. Latest published photo (Unsplash)

It serves the site's four goals at once (personal brand, opportunity-attraction,
content signal, experimentation) by proving recency on every visit.

## Placement & Layout

The block lives on the **homepage, below `About`**.

The homepage column uses `flex flex-col justify-between`:

- `About` — top
- `HelloAnimation` — middle (`fixed`, unchanged behavior)
- `Now` — bottom

The `Now` block carries bottom spacing (`mb-*`) so it is never obscured by the
fixed `Navigation` pill (`bottom-6 sm:bottom-12`).

### Visual (3-row compact list)

```
● Now
  ↳ Pushed to chop-url · "fix redirect edge case"      2d ago
  ↳ Saved   "Designing for AI" · smashingmagazine.com   5d ago
  ↳ Shot    ⛰  a photo on Unsplash                       1w ago
```

- Heading `Now` with a small pulsing dot.
- Each row: small icon + label + title (external `AnimatedLink`) + relative time.
- Uses semantic theme tokens (`text-p3-*`, `dark:*`). Tailwind classes sorted
  (`pnpm lint:fix`). New components in JSX, English-only.

## Architecture

`app/page.jsx` is currently `"use client"` because the hello effect uses state.
To fetch data server-side:

- **`app/page.jsx` → async Server Component.** Renders `About`,
  `HelloAnimation`, and `Now`. Does no client-side state itself anymore.
- **`components/HelloAnimation.jsx` (`"use client"`)** — the existing hello
  animation logic moved verbatim (state machine cycling through languages). No
  behavior change.
- **`components/Now/index.jsx`** — async Server Component. Fetches all three
  sources in parallel via `Promise.allSettled`. Renders a row per fulfilled,
  non-empty result. If a source fails or is empty, its row is omitted. If all
  three are empty/failed, the block renders nothing (homepage degrades to its
  prior state, never breaks).

Component boundaries:

- `Now` owns fetching + orchestration + empty/error handling.
- A small `NowItem` (can be inline) owns rendering one row given
  `{ icon, label, title, href, date }`.

## Data Layer

Small additions to existing `lib/` classes. **No new dependencies.**

- **`lib/github.js` → `getLatestActivity(username)`**
  - Fetches `https://api.github.com/users/{username}/events/public`.
  - Finds the first `PushEvent`; extracts repo name, head commit message, and
    `created_at`.
  - Uses the existing auth header and `next: { revalidate: 3600 }`.
  - Username: `gokh4nozturk`.
  - Returns `null` if no push event is found.

- **`lib/raindrop.js` → `getLatest()`**
  - The existing `getBookmark` recurses to fetch all pages and misbehaves with a
    tiny `perPage`, so add a dedicated method: a single request
    (`sort=-created`, small `perPage`), normalize, return the first item (or
    `null`).
  - Reuses `buildUrlWithParams` + `normalizeData`; `next: { revalidate: 3600 }`.

- **`lib/unsplash.js` → `getLatestPhoto()`**
  - `getPhotos()` already returns the user's photos newest-first; return `[0]`.
  - Add `next: { revalidate: 3600 }` to the fetch for server use.
  - Returns `null` if the list is empty.

- **`lib/utils.js` → `timeAgo(date)`**
  - Tiny helper producing compact relative strings (`2d ago`, `5h ago`,
    `1w ago`). No dependency.

## Caching

Freshness is handled at the fetch level (`next: { revalidate: 3600 }`),
consistent with the rest of the site (Raindrop/Works/Photos all use 3600).

## Error & Empty States

- `Promise.allSettled` isolates failures per source.
- A rejected or empty source → that row is skipped.
- All three empty/failed → `Now` returns nothing; homepage is unchanged.

## Out of Scope (YAGNI)

- Manual "currently working on" text.
- Latest blog post row (only one post exists; deferred).
- A dedicated `/now` page.
- Any new third-party dependency.

## Acceptance Criteria

- Homepage renders About + hello (unchanged behavior) + a Now block below About.
- Now shows up to three rows: latest GitHub push, latest bookmark, latest photo,
  each linking to its external source with a relative timestamp.
- A failing/empty individual source hides only its row.
- All sources failing hides the whole block without breaking the page.
- `pnpm lint` passes (sorted classes/imports); `pnpm build` succeeds.
