# Works Narrative Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/works` into a two-tier page — 4 featured projects told with authored stories (image + role + tags + links), above the existing GitHub-driven repo list.

**Architecture:** Featured content lives in a static `lib/works.js` array (authored, never from GitHub). A new `FeaturedWork` server component renders each as a horizontal strip (image left, story right; stacks on mobile). `app/works/page.jsx` renders the featured strips on top, then the existing `Github.getRepo` list below with the 4 featured repos filtered out so nothing appears twice.

**Tech Stack:** Next.js 13 App Router, JSX, Tailwind with `p3-*` tokens, `cn()`, `next/image`, `lucide-react`, existing `AnimatedLink`. Biome for lint/format.

> **Note on commits & tests:** This repo has **no test runner** (per `CLAUDE.md`), so verification is `pnpm lint` + `pnpm build` + a visual check at `localhost:3000/works`, not unit tests. The repo owner's standing rule is **no commits without explicit permission** — perform the commit step only after the user approves.

> **Note on the Linguolink URL:** The live URL is assumed to be `https://app.linguolink.com`. Task 1 includes a step to confirm/correct it before proceeding.

---

### Task 1: Featured works data

**Files:**
- Create: `lib/works.js`

- [ ] **Step 1: Confirm the Linguolink live URL**

The repo list entry is `gokh4nozturk/app.linguolink` and the README title is "Linguolink". Ask the user (or check the deployed domain) whether the live URL is `https://app.linguolink.com`, `.dev`, or other. Use the confirmed value in Step 2's `liveUrl` for Linguolink. If unconfirmable, default to `https://app.linguolink.com`.

- [ ] **Step 2: Create the data file**

Object keys are written alphabetically to match Biome's `useSortedKeys`.

```js
export const FEATURED_WORKS = [
  {
    codeUrl: "https://github.com/gokh4nozturk/orbit-absorb",
    image: "/works/orbit-absorb.png",
    liveUrl: "https://gokh4nozturk.github.io/orbit-absorb/",
    name: "orbit-absorb",
    repo: "gokh4nozturk/orbit-absorb",
    role: "Creator",
    story:
      "A dependency-free <orbit-absorb> web component — icons orbit a center, collapse into it, and re-emerge in a staggered wave. Pure SVG + CSS, ~5 KB, zero dependencies, works in any framework or none. Pass an icon list and it auto-distributes them on the ring and computes each path to the center.",
    tags: ["SVG", "CSS", "Web Components"],
  },
  {
    codeUrl: "https://github.com/gokh4nozturk/app",
    image: "/works/linguolink.png",
    liveUrl: "https://app.linguolink.com",
    name: "Linguolink",
    repo: "gokh4nozturk/app.linguolink",
    role: "Creator",
    story:
      "A localization management platform built with Next.js 15 and React 19 — a web dashboard and a REST API for managing projects, translation keys, and multi-language content. A real monorepo: Drizzle/Postgres, CI/CD, test coverage, and generated API docs.",
    tags: ["Next.js", "React 19", "Drizzle", "REST API"],
  },
  {
    codeUrl: "https://github.com/gokh4nozturk/rocket",
    image: "/works/rocket.png",
    liveUrl: "https://rocket.gozturk.dev",
    name: "rocket",
    repo: "gokh4nozturk/rocket",
    role: "Creator",
    story:
      "My own shadcn component registry. I got tired of re-copying the same primitives between projects, so I built a versioned registry I can `shadcn add` from anywhere — crafted components like a nested collapsible timeline, an activity feed, a threaded comment view, and a visual AND/OR query builder.",
    tags: ["Next.js", "shadcn", "Tailwind", "motion"],
  },
  {
    codeUrl: "https://github.com/gokh4nozturk/chop-url",
    image: "/works/chop-url.png",
    liveUrl: "https://app.chop-url.com",
    name: "chop-url",
    repo: "gokh4nozturk/chop-url",
    role: "Creator",
    story:
      "A modern URL shortener powered by Cloudflare Workers & Next.js — fast, serverless, and user-friendly. Custom slugs, analytics, the works.",
    tags: ["Next.js", "Cloudflare Workers", "serverless"],
  },
];

export const FEATURED_REPOS = FEATURED_WORKS.map((work) => work.repo).filter(Boolean);
```

- [ ] **Step 3: Lint the file**

Run: `pnpm lint:fix`
Expected: no errors; keys/classes stay sorted.

---

### Task 2: FeaturedWork component

**Files:**
- Create: `components/works/FeaturedWork.jsx`

- [ ] **Step 1: Create the component**

```jsx
import AnimatedLink from "@components/AnimatedLink";
import { Star } from "lucide-react";
import Image from "next/image";

export default function FeaturedWork({ work, stars }) {
  return (
    <div className="flex flex-col gap-4 py-6 sm:flex-row sm:gap-6">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-p3-border sm:w-48">
        <Image
          alt={`${work.name} preview`}
          className="object-cover"
          fill
          sizes="(max-width: 640px) 100vw, 12rem"
          src={work.image}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <AnimatedLink className="font-medium text-base" href={work.liveUrl} name={work.name}>
            {work.name}
          </AnimatedLink>
          <span className="rounded-full border border-p3-border px-2 py-0.5 text-p3-text-light text-xs">
            {work.role}
          </span>
          {typeof stars === "number" && (
            <span className="flex items-center gap-1 text-neutral-400 text-xs">
              <Star size={12} />
              {stars}
            </span>
          )}
        </div>
        <p className="text-p3-text-light text-sm">{work.story}</p>
        <div className="flex flex-wrap gap-2 text-neutral-400 text-xs">
          {work.tags.map((tag) => (
            <span className="rounded bg-p3-background-light px-1.5 py-0.5" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-3 text-sm">
          <AnimatedLink color="blue" href={work.liveUrl} name={`${work.name} live`}>
            live →
          </AnimatedLink>
          <AnimatedLink href={work.codeUrl} name={`${work.name} code`}>
            code →
          </AnimatedLink>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `pnpm lint:fix`
Expected: no errors.

---

### Task 3: Capture preview screenshots

**Files:**
- Create: `public/works/orbit-absorb.png`
- Create: `public/works/linguolink.png`
- Create: `public/works/rocket.png`
- Create: `public/works/chop-url.png`

- [ ] **Step 1: Capture each live site at 1280×720**

Use the Playwright MCP browser (or the user-supplied images). For each `liveUrl` in `FEATURED_WORKS`: navigate, set viewport 1280×720, take a screenshot, save to the matching `public/works/<file>.png`. Filenames must exactly match the `image` paths in Task 1 (`orbit-absorb.png`, `linguolink.png`, `rocket.png`, `chop-url.png`).

If a live site is unreachable, leave a placeholder note and continue; the page must still render (Step 2 verifies missing-image behavior is acceptable — `next/image` will 404 the asset but the layout holds).

- [ ] **Step 2: Verify files exist**

Run: `ls -la public/works/`
Expected: four `.png` files present.

---

### Task 4: Rewrite the Works page

**Files:**
- Modify: `app/works/page.jsx`

- [ ] **Step 1: Replace the page implementation**

Replace the entire file with the version below. Changes vs. current: import `FEATURED_WORKS` + `FEATURED_REPOS` and `FeaturedWork`; filter the featured repos out of `REPOS`; render a "Featured" section then a "More on GitHub" section; map each featured repo's star count from the fetched list into `FeaturedWork`.

```jsx
import AnimatedLink from "@components/AnimatedLink";
import { BrandScroller } from "@components/hextaui/brand-scroller";
import TitleDescription from "@components/TitleDescription";
import { ScrollArea } from "@components/ui/scroll-area";
import FeaturedWork from "@components/works/FeaturedWork";
import { Github } from "@lib/github";
import { cn } from "@lib/utils";
import { FEATURED_REPOS, FEATURED_WORKS } from "@lib/works";
import { GitFork, Star } from "lucide-react";

const REPOS = [
  "gokh4nozturk/orbit-absorb",
  "gokh4nozturk/chop-url",
  "gokh4nozturk/gauge",
  "gokh4nozturk/fancy-hn",
  "magicuidesign/magicui",
  "pqoqubbw/icons",
  "Teknasyon/rocket-ui",
  "gokh4nozturk/gozturk.dev",
  "RustDili/Rust-Ogrenmek",
  "gokh4nozturk/app.linguolink",
];

const LANG_COLORS = {
  "C#": "text-blue-500",
  CSS: "text-blue-500",
  Dockerfile: "text-blue-500",
  Go: "text-blue-500",
  HTML: "text-red-500",
  JavaScript: "text-yellow-500",
  Makefile: "text-blue-500",
  MDX: "text-amber-500",
  PowerShell: "text-blue-500",
  Rust: "text-orange-500",
  SCSS: "text-pink-500",
  Shell: "text-gray-500",
  TypeScript: "text-blue-500",
  Vue: "text-emerald-500",
};

export const revalidate = 3600; // 60 * 60 seconds

const listRepos = REPOS.filter((repo) => !FEATURED_REPOS.includes(repo));

export default async function Works() {
  const github = new Github();

  const featuredStars = await Promise.all(
    FEATURED_WORKS.map(async (work) => {
      if (!work.repo) return null;
      const data = await github.getRepo(work.repo);
      return data?.stargazers_count ?? null;
    }),
  );

  const works = await Promise.all(listRepos.map((repo) => github.getRepo(repo)));

  return (
    <div className="relative w-full">
      <TitleDescription
        description="A collection of works that I have contributed to."
        title="Works"
      />
      <BrandScroller className="absolute inset-0 top-18 z-30 md:top-20" />
      <ScrollArea className="mb-24 max-h-[calc(100dvh-15rem)]">
        <div className="py-10">
          <h2 className="font-semibold text-p3-text-light text-xs uppercase tracking-wide">
            Featured
          </h2>
          <div className="divide-y">
            {FEATURED_WORKS.map((work, index) => (
              <FeaturedWork key={work.name} stars={featuredStars[index]} work={work} />
            ))}
          </div>

          <h2 className="mt-10 font-semibold text-p3-text-light text-xs uppercase tracking-wide">
            More on GitHub
          </h2>
          <div className="grid divide-y">
            {works.map((work, index) => (
              <Work data={work} key={listRepos[index]} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function Work({ data: work }) {
  return (
    <div className="grid gap-1 py-3">
      <AnimatedLink
        className="font-medium text-sm sm:text-base"
        href={work.html_url}
        name={work.name}
      >
        {work.full_name}
      </AnimatedLink>
      <p className="my-1 truncate text-neutral-400 text-xs">{work.description}</p>
      <div className="flex gap-3 font-medium text-neutral-400 text-xs">
        <span className={cn(LANG_COLORS[work.language])}>{work.language || "Unknown"}</span>
        <span className="flex items-center gap-1">
          <Star size={12} />
          {work.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <GitFork size={12} />
          {work.forks_count}
        </span>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  const siteUrl = "/works";

  return {
    alternates: {
      canonical: siteUrl,
    },
    description: "A collection of works that I have contributed to.",
    openGraph: {
      description: "A collection of works that I have contributed to.",
      title: "Works",
      url: siteUrl,
    },
    title: "Works",
  };
}
```

- [ ] **Step 2: Lint**

Run: `pnpm lint:fix`
Expected: no errors.

---

### Task 5: Verify and commit

- [ ] **Step 1: Build**

Run: `pnpm build`
Expected: build succeeds, `/works` compiles with no type/import errors.

- [ ] **Step 2: Visual check**

Run: `pnpm dev`, open `http://localhost:3000/works`.
Expected:
- "Featured" section shows 4 strips (orbit-absorb, Linguolink, rocket, chop-url) with image left / story right on desktop, stacked on mobile.
- Each strip has a role badge, tag chips, and `live` / `code` links.
- "More on GitHub" section lists the remaining repos; none of the 4 featured repos appear twice.

- [ ] **Step 3: Commit (ONLY after the user approves)**

```bash
git add lib/works.js components/works/FeaturedWork.jsx app/works/page.jsx public/works/ docs/superpowers/
git commit -m "feat(works): add narrative-led featured showcase

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Two-tier layout (Featured + More on GitHub) → Task 4. ✓
- `lib/works.js` `FEATURED_WORKS` static data with all fields → Task 1. ✓
- Featured repos filtered from the list (no duplicates) → Task 4 `listRepos`. ✓
- `FeaturedWork` horizontal strip, mobile stack, role badge, tags, live/code → Task 2. ✓
- Images under `public/works/*.png`, `next/image` → Tasks 2 & 3. ✓
- Authored stories (approved drafts) → Task 1 data. ✓
- `p3-*` tokens, `cn()`, `AnimatedLink`, Biome sorting → Tasks 2 & 4. ✓
- Untouched: nav, other routes, `lib/github.js` → respected. ✓

**Placeholder scan:** No TBD/TODO in steps. The Linguolink URL is handled by an explicit confirm step (Task 1 Step 1), not left vague.

**Type consistency:** `FEATURED_WORKS` field names (`name`, `role`, `story`, `tags`, `image`, `liveUrl`, `codeUrl`, `repo`) are used identically in `FeaturedWork` (Task 2) and the page (Task 4). `FEATURED_REPOS` exported in Task 1 and consumed in Task 4. `stars` prop passed in Task 4 matches `FeaturedWork({ work, stars })` in Task 2.

**Note:** Spec mentioned `.webp`; plan uses `.png` because Playwright captures PNG and the repo has no image-conversion step (avoids an unjustified dependency). `next/image` serves PNG fine.
```
