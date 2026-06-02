"use client";

import { cn } from "@lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Fixed table-of-contents minimap for blog posts.
 * - Collapsed: stacked bars (indent/width by heading depth), active bar highlighted.
 * - Hover: expands into a clickable list of heading titles.
 * - Tracks the active section via IntersectionObserver.
 * Visible on lg+ only.
 *
 * @param {{ items: Array<{ title: string, url: string, depth: number }>, className?: string, indent?: number }} props
 * @param props.indent - pixels of visual indentation applied per heading-depth level (default 12)
 */
export function TocMinimap({ items, className, indent = 12 }) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!items?.length) return;

    const ids = items.map((item) => item.url.slice(1));
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  if (!items?.length) return null;

  // Indentation is relative to the shallowest heading present so a TOC made of
  // only H3s isn't pushed in for no reason.
  const minDepth = Math.min(...items.map((item) => item.depth));

  const handleClick = (event, url) => {
    event.preventDefault();
    const id = url.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth" });
    history.pushState(null, "", url);
    setActiveId(id);
  };

  return (
    <nav
      aria-label="Table of contents"
      className={cn("group fixed top-1/2 right-4 z-30 hidden -translate-y-1/2 lg:block", className)}
    >
      {/* Collapsed minimap */}
      <ul className="flex flex-col items-end gap-2 py-2 group-hover:opacity-0">
        {items.map((item) => {
          const isActive = item.url.slice(1) === activeId;
          const level = item.depth - minDepth;
          return (
            <li key={item.url}>
              <span
                className={cn(
                  "block h-0.5 rounded-full transition-all",
                  isActive
                    ? "bg-p3-text dark:bg-p3-text-dark"
                    : "bg-p3-text/30 dark:bg-p3-text-dark/30",
                )}
                style={{ marginRight: level * indent, width: Math.max(8, 24 - level * 6) }}
              />
            </li>
          );
        })}
      </ul>

      {/* Expanded list on hover */}
      <AnimatePresence>
        <motion.ul
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "pointer-events-none absolute top-1/2 right-0 hidden max-h-[60vh] w-56 -translate-y-1/2",
            "overflow-y-auto rounded-lg border border-p3-text/10 bg-p3-background-light p-3 shadow-lg",
            "group-hover:pointer-events-auto group-hover:block",
            "dark:border-p3-text-dark/10 dark:bg-p3-background",
          )}
          exit={{ opacity: 0, x: 8 }}
          initial={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.15 }}
        >
          {items.map((item) => {
            const isActive = item.url.slice(1) === activeId;
            const level = item.depth - minDepth;
            return (
              <li key={item.url}>
                <a
                  className={cn(
                    "block rounded px-2 py-1 text-sm transition-colors",
                    isActive
                      ? "font-medium text-p3-text dark:text-p3-text-dark"
                      : "text-p3-text/60 hover:text-p3-text dark:text-p3-text-dark/60 dark:hover:text-p3-text-dark",
                  )}
                  href={item.url}
                  onClick={(event) => handleClick(event, item.url)}
                  style={{ paddingLeft: 8 + level * indent }}
                >
                  {item.title}
                </a>
              </li>
            );
          })}
        </motion.ul>
      </AnimatePresence>
    </nav>
  );
}

export default TocMinimap;
