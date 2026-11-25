"use client";

import { AnimatedTabs } from "@components/luxe/animated-tabs";
import ThankYou from "@components/ThankYou";
import { cn } from "@lib/utils";
import { Bookmark, Home, LayoutGrid } from "lucide-react";

const navItems = [
  {
    icon: Home,
    name: "Home",
    path: "/",
  },
  {
    icon: LayoutGrid,
    name: "Apps",
    path: "/apps",
  },
  {
    icon: Bookmark,
    name: "Bookmarks",
    path: "/bookmarks",
  },
];

export default function Navigation() {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 flex h-13 w-full -translate-x-1/2 items-center gap-1 border border-p3-border sm:bottom-12",
        "max-w-fit rounded-full px-4 py-2 backdrop-blur-sm dark:border-p3-border-dark",
      )}
    >
      <AnimatedTabs tabs={navItems} />
      <span className="h-5 w-px bg-p3-border dark:bg-p3-border-dark" />
      <ThankYou />
    </div>
  );
}
