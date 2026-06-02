import GithubSlugger from "github-slugger";

/**
 * Extract H2/H3 headings from raw MDX/markdown into TOC items.
 * Slugs are produced with github-slugger so they match rehype-slug's
 * ids on the rendered headings (including -1/-2 disambiguation).
 *
 * @param {string} markdown - raw markdown/MDX source
 * @returns {Array<{ title: string, url: string, depth: number }>}
 */
export function getTableOfContents(markdown) {
  if (!markdown) return [];

  const slugger = new GithubSlugger();
  const lines = markdown.split("\n");
  const items = [];
  let inFence = false;

  for (const line of lines) {
    // Toggle fenced code blocks (``` or ~~~) so headings inside code are ignored.
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // Match ATX headings of depth 2 or 3 only (skip H1 = post title).
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const depth = match[1].length;
    // Strip inline markdown emphasis/code/link syntax for the visible title.
    const title = match[2]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .trim();

    items.push({ depth, title, url: `#${slugger.slug(title)}` });
  }

  return items;
}
