"use client";

import Profile from "@components/icons/profile";
import { NameTransition } from "@components/Name";
import { DarkModeToggle } from "@components/ThemeProvider";
import React from "react";

export function Header() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="mb-4 border-p3-border border-b pb-6 transition-all sm:pb-0 dark:border-p3-border-dark">
      <div className="flex items-center gap-4">
        <div className="rounded-full">
          {mounted ? (
            <div className="relative grid size-16 place-items-center rounded-full border md:size-20">
              <Profile className="absolute -top-1.5 size-full" />
            </div>
          ) : (
            <div className="size-16 place-items-center rounded-full border md:size-20">
              <div className="size-full animate-pulse rounded-full bg-p3-background-dark dark:bg-p3-background-light" />
            </div>
          )}
        </div>
        <div className="sm:my-10">
          <NameTransition />
        </div>
        <div className="ml-auto">
          {mounted ? (
            <DarkModeToggle />
          ) : (
            <div className="h-8 w-[88px] animate-pulse rounded-md bg-p3-background-dark dark:bg-p3-background-light" />
          )}
        </div>
      </div>
      {/* <nav className="my-3 sm:my-6 flex items-center">
        <NavItem href="/" name="home" />
        <NavItem href="/blog" name="blog" />
        <NavItem href="/photos" name="photos" />
        <NavItem href="/bookmarks" name="bookmarks" />
        <NavItem href="/resume" name="cv" />
      </nav> */}
    </header>
  );
}
