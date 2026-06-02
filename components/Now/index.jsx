import { Github as GithubIcon, Raindropio } from "@components/icons";
import { Github } from "@lib/github";
import Raindrop from "@lib/raindrop";
import { Unsplash } from "@lib/unsplash";
import { cn, timeAgo } from "@lib/utils";
import { Image as ImageIcon } from "lucide-react";

function NowItem({ icon: Icon, label, title, href, date }) {
  return (
    <li className="flex items-center gap-2 text-xs sm:text-sm">
      <Icon className="size-3.5 shrink-0 opacity-70" />
      <span className="shrink-0 opacity-60">{label}</span>
      <a
        className={cn(
          "max-w-60 truncate text-p3-text decoration-p3-border underline-offset-4 hover:underline md:max-w-lg",
          "dark:text-p3-text-dark",
        )}
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        {title}
      </a>
      <span className="ml-auto shrink-0 whitespace-nowrap opacity-50">{date}</span>
    </li>
  );
}

export default async function Now() {
  const github = new Github();
  const raindrop = new Raindrop();
  const unsplash = new Unsplash();

  const [activity, bookmark, photo] = await Promise.allSettled([
    github.getLatestActivity("gokh4nozturk"),
    raindrop.getLatest(),
    unsplash.getLatestPhoto(),
  ]);

  const rows = [];

  if (activity.status === "fulfilled" && activity.value) {
    const a = activity.value;
    rows.push(
      <NowItem
        date={timeAgo(a.date)}
        href={a.url}
        icon={GithubIcon}
        key="github"
        label="Pushed to"
        title={a.message ? `${a.repo} · ${a.message}` : a.repo}
      />,
    );
  }

  if (bookmark.status === "fulfilled" && bookmark.value) {
    const b = bookmark.value;
    rows.push(
      <NowItem
        date={timeAgo(b.created)}
        href={b.link}
        icon={Raindropio}
        key="bookmark"
        label="Saved"
        title={b.domain ? `${b.title} · ${b.domain}` : b.title}
      />,
    );
  }

  if (photo.status === "fulfilled" && photo.value) {
    const p = photo.value;
    rows.push(
      <NowItem
        date={timeAgo(p.date)}
        href={p.url}
        icon={ImageIcon}
        key="photo"
        label="Shot"
        title={p.alt}
      />,
    );
  }

  if (rows.length === 0) return null;

  return (
    <section className="mb-24 w-full sm:mb-32">
      <h2 className="mb-2 flex items-center gap-2 font-medium text-sm">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-iteration-count-infinite animate-ping rounded-full bg-p3-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-p3-primary" />
        </span>
        Now
      </h2>
      <ul className="flex flex-col gap-1.5">{rows}</ul>
    </section>
  );
}
