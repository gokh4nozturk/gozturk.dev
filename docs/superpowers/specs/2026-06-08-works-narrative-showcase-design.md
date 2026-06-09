# Works → Narrative-Led Showcase — Design

**Date:** 2026-06-08
**Status:** Approved (pending implementation plan)

## Problem

The `/works` page renders a flat list of GitHub repos (`full_name`, description,
language, stars, forks) pulled live from the GitHub API. Because it shows GitHub
metadata rather than authored content, it under-represents the work:

- **No context** — why a project exists, the author's role (creator vs.
  contributor), what problem it solves.
- **No impact / narrative** — a repo name plus a star count tells no story.
- **Boilerplate leakage** — the site surfaces GitHub's default metadata. Real
  examples: `rocket` and `orbit-absorb` have *empty* GitHub descriptions;
  `Linguolink` shows description "Test" and repo name "app"; `rocket`'s README is
  the unmodified `create-next-app` template.

Net effect: the author cannot show the site and say "look, this is what I've
built" — the best work appears with its weakest sentence.

## Goal

Turn `/works` into a place where a handful of projects are told with a real
story, while every other repo still appears. The visitor's ~20-second scan
should land on the strongest work first and understand it without clicking.

## Approach (chosen: B — two-tier single page)

Keep `/works` as one page with two layers:

1. **Featured** — 3–4 projects told in depth, each as a horizontal strip
   (image left, story right). Authored content, not GitHub metadata.
2. **More on GitHub** — the remaining repos, kept as the existing lightweight
   list driven by the GitHub API (language, stars, forks).

Rejected alternatives:

- **A — replace Works with stories only:** loses the open-source contribution
  list (magicui, icons, etc.).
- **C — separate `/projects` page:** bloats nav and creates a "projects vs.
  works" ambiguity; splitting the showcase weakens the single "here's my work"
  moment.

## Layout

```
┌──────────────────────────────────────────────────────┐
│  Works                                                 │
│  A collection of works that I have contributed to.    │
│                                                        │
│  FEATURED                                              │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ┌────────┐  orbit-absorb        [Creator] ⭐12    │ │
│  │ │ image  │  A dependency-free web component...    │ │
│  │ └────────┘  SVG · CSS · Web Components            │ │
│  │             → live   → code                       │ │
│  ├──────────────────────────────────────────────────┤ │
│  │  ... Linguolink / rocket / chop-url (same strip)   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  MORE ON GITHUB                                        │
│  · gauge   · fancy-hn   · magicui   · icons   · ...    │
└──────────────────────────────────────────────────────┘
```

Featured strip: image left, story right on desktop; image stacks on top on
mobile (`flex-col sm:flex-row`).

## Data model

### Featured (authored, static)

A static array — `lib/works.js` exporting `FEATURED_WORKS`. Each entry:

| field      | type       | notes                                            |
|------------|------------|--------------------------------------------------|
| `name`     | string     | display title (e.g. "Linguolink", "orbit-absorb") |
| `role`     | enum       | `"Creator"` \| `"Contributor"` \| `"Maintainer"` |
| `story`    | string     | the authored paragraph                           |
| `tags`     | string[]   | tech chips (e.g. `["Next.js", "Drizzle"]`)       |
| `image`    | string     | path under `/works/*.webp`                        |
| `liveUrl`  | string     | live/demo URL                                    |
| `codeUrl`  | string     | GitHub URL                                       |
| `repo`     | string?    | `owner/name` — used to exclude from the list & optionally show stars |

The story is authored content and never comes from GitHub. This is what fixes
the empty/boilerplate-description problem.

### More on GitHub (existing behavior)

Reuse the current `REPOS` + `Github.getRepo` flow (`revalidate = 3600`). The
four featured repos are removed from this list so they don't appear twice.

## Authored content (approved drafts)

1. **orbit-absorb** · Creator · npm
   > A dependency-free `<orbit-absorb>` web component — icons orbit a center,
   > collapse into it, and re-emerge in a staggered wave. Pure SVG + CSS, ~5 KB,
   > zero dependencies, works in any framework or none. Auto-layout: pass an
   > icon list and it distributes them on the ring and computes each path to the
   > center.
   > Tags: SVG · CSS · Web Components
   > live: https://gokh4nozturk.github.io/orbit-absorb/ · code:
   > https://github.com/gokh4nozturk/orbit-absorb

2. **Linguolink** · Creator · full-stack
   > A localization management platform built with Next.js 15 and React 19 — a
   > web dashboard and a REST API for managing projects, translation keys, and
   > multi-language content. A real monorepo: Drizzle/Postgres, CI/CD, test
   > coverage, generated API docs.
   > Tags: Next.js · React 19 · Drizzle · REST API
   > live: https://app.linguolink · code: https://github.com/gokh4nozturk/app

3. **rocket** · Creator · shadcn registry
   > My own shadcn component registry. I got tired of re-copying the same
   > primitives between projects, so I built a versioned registry I can
   > `shadcn add` from anywhere — crafted components like a nested collapsible
   > timeline, an activity feed, a threaded comment view, and a visual AND/OR
   > query builder.
   > Tags: Next.js · shadcn · Tailwind · motion
   > live: https://rocket.gozturk.dev · code:
   > https://github.com/gokh4nozturk/rocket

4. **chop-url** · Creator · finished product
   > A modern URL shortener powered by Cloudflare Workers & Next.js — fast,
   > serverless, user-friendly. Custom slugs, analytics, the works.
   > Tags: Next.js · Cloudflare Workers · serverless
   > live: https://app.chop-url.com · code:
   > https://github.com/gokh4nozturk/chop-url

## Components

- **`FeaturedWork`** — horizontal strip. Props: one `FEATURED_WORKS` entry.
  `flex-col sm:flex-row`. Left: `next/image`. Right: name + role badge (+
  optional stars), story paragraph, tag chips, live/code links via
  `AnimatedLink`.
- **`RepoListItem`** — the slimmed-down current `Work` component for the bottom
  list (name, description, language, stars, forks).
- **Role badge** — small inline label (`Creator` / `Contributor` /
  `Maintainer`) using `p3-*` tokens.

## Images

- Stored at `public/works/{orbit-absorb,linguolink,rocket,chop-url}.webp`.
- Rendered with `next/image`.
- Captured from the live sites during implementation (Playwright) unless the
  user supplies them.

## Styling & conventions

- `p3-*` semantic tokens, `cn()` for class composition, Biome sorted classes
  (run `pnpm lint:fix`).
- Keep `AnimatedLink`.
- Default to Server Components; only add `"use client"` if a motion hover/intro
  animation needs it. Hover-only CSS is preferred first (YAGNI on motion).
- JSX, `@`-prefixed import aliases for new code.

## Scope / non-goals

- **Touched:** `app/works/page.jsx`, new `FeaturedWork` + `RepoListItem`
  components, new `lib/works.js` static data, new images under `public/works/`.
- **Untouched:** navigation, other routes, `lib/github.js`, the About intro
  (a "see my work" hook from About to Works is a possible later follow-up, out
  of scope here).

## Success criteria

- `/works` shows 4 featured projects with authored stories, images, role
  badges, tags, and live/code links.
- The remaining repos still render below from the GitHub API; no repo appears in
  both sections.
- The author can open `/works` and say "look, this is what I've built."
