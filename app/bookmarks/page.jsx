import HoverPreview from "@components/HoverPreview";
import TitleDescription from "@components/TitleDescription";
import Raindrop from "@lib/raindrop";
import { cn } from "@lib/utils";
import Link from "next/link";

export const revalidate = 3600; // 60 * 60 seconds

const YEAR_COUNT = 4;
const TIME_ZONE = "Europe/Istanbul";

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: TIME_ZONE,
  year: "numeric",
});
const dayFormat = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: TIME_ZONE });

export default async function Bookmarks({ searchParams }) {
  const raindrop = new Raindrop();
  const year = (await searchParams).year || "all";
  const bookmarks =
    (await raindrop
      .getBookmark({
        page: 0,
        perPage: 50, // Raindrop caps a page at 50; getBookmark keeps paging while pages are full
        sort: "-created",
        year,
      })
      .catch(() => null)) ?? [];
  const months = groupByMonth(bookmarks);

  return (
    <div className="w-full">
      <TitleDescription
        description="Links I found worth keeping: tools, articles and things to come back to."
        title="Bookmarks"
      />

      <div className="mt-2 mb-10 flex flex-wrap items-center gap-x-4 gap-y-3">
        <YearPills year={year} />
        <span className="ml-auto text-p3-text-light text-xs tabular-nums">
          {bookmarks.length} {bookmarks.length === 1 ? "link" : "links"}
        </span>
      </div>

      {months.length === 0 ? (
        <p className="text-p3-text-light text-sm">Nothing saved for this year yet.</p>
      ) : (
        <div className="grid gap-10">
          {months.map(({ label, items }) => (
            <section className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6" key={label}>
              <h2 className="text-p3-text-light text-xs uppercase tracking-wide sm:sticky sm:top-14 sm:self-start sm:pt-2.5">
                {label}
              </h2>
              <ul className="grid gap-1">
                {items.map((bookmark) => (
                  <BookmarkRow bookmark={bookmark} key={bookmark._id} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function YearPills({ year }) {
  const currentYear = new Date().getFullYear();
  const options = [
    { href: "/bookmarks", label: "All", value: "all" },
    ...Array.from({ length: YEAR_COUNT }, (_, i) => {
      const value = String(currentYear - i);
      return { href: `/bookmarks?year=${value}`, label: value, value };
    }),
  ];
  const active = year.split("-")[0];

  return (
    <nav aria-label="Filter by year" className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isActive = option.value === active;
        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1 text-xs tabular-nums transition-colors",
              isActive
                ? "border-p3-text bg-p3-text text-p3-background-light dark:border-p3-text-dark dark:bg-p3-text-dark dark:text-p3-background"
                : "border-p3-border text-p3-text-light hover:text-p3-text dark:border-p3-border-dark dark:hover:text-p3-text-dark",
            )}
            href={option.href}
            key={option.value}
            scroll={false}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}

function BookmarkRow({ bookmark }) {
  const { title, link, tags, created, domain, cover } = bookmark;

  return (
    <li>
      <HoverPreview alt="" className="w-full" src={cover} unoptimized>
        <a
          className={cn(
            "group -mx-3 flex w-full items-baseline gap-4 rounded-xl px-3 py-2.5 transition-colors",
            "hover:bg-p3-background-dark/5 dark:hover:bg-p3-background-light/5",
          )}
          href={link}
          rel="noreferrer"
          target="_blank"
        >
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 font-medium text-sm sm:text-base">{title}</span>
            <span className="mt-0.5 flex flex-wrap gap-x-2 text-p3-text-light text-xs">
              {domain && <span>{domain}</span>}
              {tags?.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </span>
          </span>
          <span className="shrink-0 text-p3-text-light text-xs tabular-nums">
            {dayFormat.format(new Date(created))}
          </span>
        </a>
      </HoverPreview>
    </li>
  );
}

function groupByMonth(bookmarks) {
  const groups = new Map();
  for (const bookmark of bookmarks) {
    const label = monthFormat.format(new Date(bookmark.created));
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(bookmark);
  }
  return Array.from(groups, ([label, items]) => ({ items, label }));
}

export async function generateMetadata() {
  const siteUrl = "/bookmarks";

  return {
    alternates: {
      canonical: siteUrl,
    },
    description: "A collection of bookmarks",
    openGraph: {
      description: "A collection of bookmarks",
      title: "Bookmarks",
      url: siteUrl,
    },
    title: "Bookmarks",
  };
}
