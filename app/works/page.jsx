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
