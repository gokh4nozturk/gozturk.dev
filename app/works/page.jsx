import AnimatedLink from "@components/AnimatedLink";
import { BrandScroller } from "@components/hextaui/brand-scroller";
import TitleDescription from "@components/TitleDescription";
import { ScrollArea } from "@components/ui/scroll-area";
import { Github } from "@lib/github";
import { cn } from "@lib/utils";
import { GitFork, Star } from "lucide-react";

const REPOS = [
  "gokh4nozturk/rocket",
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

export default async function Works() {
  const github = new Github();
  const works = await Promise.all(
    REPOS.map(async (repo) => {
      const repoData = await github.getRepo(repo);
      return repoData;
    }),
  );

  return (
    <div className="relative w-full">
      <TitleDescription
        description="A collection of works that I have contributed to."
        title="Works"
      />
      <BrandScroller className="absolute inset-0 top-18 z-30 md:top-20" />
      <ScrollArea className="mb-24 max-h-[calc(100dvh-15rem)]">
        <div className="grid divide-y py-10">
          {works.map((work, index) => (
            <Work data={work} key={REPOS[index]} />
          ))}
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
