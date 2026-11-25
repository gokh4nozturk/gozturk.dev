import Section from "@components/Section";
import Raindrop from "@lib/raindrop";
import { timeAgo } from "@lib/utils";

export default async function RecentBookmarks() {
  const bookmarks = await new Raindrop().getRecent(5).catch(() => null);
  if (!bookmarks?.length) return null;

  return (
    <Section more={{ href: "/bookmarks", label: "all bookmarks" }} title="Recently saved">
      <ul className="grid gap-2.5">
        {bookmarks.map((bookmark) => (
          <li className="flex items-baseline gap-4 text-sm" key={bookmark._id}>
            <a
              className="min-w-0 truncate underline-offset-4 hover:underline"
              href={bookmark.link}
              rel="noreferrer"
              target="_blank"
            >
              {bookmark.title}
              <span className="text-p3-text-light"> · {bookmark.domain}</span>
            </a>
            <span className="ml-auto shrink-0 whitespace-nowrap text-p3-text-light text-xs">
              {timeAgo(bookmark.created)}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
