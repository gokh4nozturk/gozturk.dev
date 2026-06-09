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
    liveUrl: "https://linguolink.dev",
    name: "LinguLink",
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
    name: "chop-url",
    repo: "gokh4nozturk/chop-url",
    role: "Creator",
    story:
      "A modern URL shortener powered by Cloudflare Workers & Next.js — fast, serverless, and user-friendly. Custom slugs, analytics, the works.",
    tags: ["Next.js", "Cloudflare Workers", "serverless"],
  },
];

export const FEATURED_REPOS = FEATURED_WORKS.map((work) => work.repo).filter(Boolean);
