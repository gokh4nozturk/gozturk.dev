/* eslint-disable @next/next/no-img-element */
import Raindrop from "@lib/raindrop";
import AnimatedLink from "components/AnimatedLink";
import TitleDescription from "components/TitleDescription";
import { ScrollArea } from "components/ui/scroll-area";
import YearFilter from "components/YearFilter";

export const revalidate = 3600; // 60 * 60 seconds

export default async function Bookmarks({ searchParams }) {
  const raindrop = new Raindrop();
  const year = (await searchParams).year || "all";
  const bookmarks = await raindrop.getBookmark({
    page: 0,
    perPage: 100,
    sort: "-created",
    year,
  });

  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        <TitleDescription
          description="A collection of bookmarks that I have saved."
          title="Bookmarks"
        />
        <YearFilter year={year} />
      </div>
      <ScrollArea className="mb-24 max-h-[calc(100dvh-15rem)]">
        <div className="grid divide-y">
          {bookmarks?.map((bookmark) => (
            <Bookmark data={bookmark} key={bookmark._id} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function Bookmark({ data: bookmark }) {
  const { title, link, tags, created } = bookmark;
  const date = new Date(created);
  return (
    <div className="flex justify-between gap-10 py-2">
      <div className="flex flex-col items-start gap-1 text-sm">
        <span className="text-xs dark:text-gray-300">
          {date.toLocaleDateString().replaceAll("/", ".")}
        </span>
        <AnimatedLink className="font-medium text-sm sm:text-base dark:text-gray-400" href={link}>
          {title}
        </AnimatedLink>
        <div className="flex gap-2">
          {tags.map((tag) => (
            <span className="text-xs dark:text-gray-400" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <img
        alt={bookmark.title}
        className="order-1 hidden aspect-960/576 w-32 shrink-0 rounded-sm object-cover text-xs sm:block"
        src={bookmark.cover}
      />
    </div>
  );
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
