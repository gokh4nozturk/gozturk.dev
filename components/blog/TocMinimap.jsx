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

    const updateActive = () => {
      // Active section = the last heading that has scrolled above a "reading
      // line" ~30% down the viewport. Picking the last one (not the topmost
      // visible) is what keeps the highlight on the section you're actually in,
      // rather than on whatever heading happens to sit at the very top.
      const line = window.innerHeight * 0.3;
      let current = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) {
          current = id;
        } else {
          break;
        }
      }
      // Before the first heading reaches the line, keep the first one active.
      setActiveId(current ?? ids.find((id) => document.getElementById(id)) ?? null);
    };

    updateActive();

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActive);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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
                style={{ width: Math.max(8, 24 - level * 8) }}
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
