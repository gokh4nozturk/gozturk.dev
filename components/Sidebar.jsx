"use client";

import HelloAnimation from "@components/HelloAnimation";
import { LinkedIn } from "@components/icons";
import Profile from "@components/icons/profile";
import { NameTransition } from "@components/Name";
import { DarkModeToggle } from "@components/ThemeProvider";
import { SiBluesky, SiGithub, SiInstagram, SiX } from "@icons-pack/react-simple-icons";
import { cn } from "@lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

const links = [
  {
    href: "https://github.com/gokh4nozturk?ref=gozturk.dev",
    icon: <SiGithub color="currentColor" size={18} />,
    name: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/gokhannozturk?ref=gozturk.dev",
    icon: <LinkedIn className="size-[18px] [&_path]:fill-current" />,
    name: "LinkedIn",
  },
  {
    href: "https://x.com/gokh4nozturk?ref=gozturk.dev",
    icon: <SiX color="currentColor" size={18} />,
    name: "X",
  },
  {
    href: "https://www.instagram.com/gokh4nozturk?ref=gozturk.dev",
    icon: <SiInstagram color="currentColor" size={18} />,
    name: "Instagram",
  },
  {
    href: "https://bsky.app/profile/gozturk.dev?ref=gozturk.dev",
    icon: <SiBluesky color="currentColor" size={18} />,
    name: "Bluesky",
  },
];

// Left identity column: sticky on desktop, stacked on top on mobile.
export function Sidebar() {
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="flex flex-col gap-6 pt-6 sm:pt-10 lg:sticky lg:top-0 lg:h-dvh lg:gap-0 lg:py-14">
      <div className="flex items-center gap-4">
        <div className="relative grid size-16 shrink-0 place-items-center rounded-full border md:size-20">
          {mounted ? (
            <Profile className="absolute -top-1.5 size-full" />
          ) : (
            <div className="size-full animate-pulse rounded-full bg-p3-background-dark dark:bg-p3-background-light" />
          )}
        </div>
        <NameTransition />
        <div className="ml-auto lg:hidden">
          <ThemeToggle mounted={mounted} />
        </div>
      </div>

      <p className="text-p3-text-light text-sm lg:mt-6">
        Software engineer in İstanbul. I build iOS apps, web products and open source tools.
      </p>

      <SocialLinks className="lg:hidden" />

      <div className={cn("flex items-center py-4 lg:flex-1 lg:py-0", !isHome && "max-lg:hidden")}>
        <div className="w-full">
          <HelloAnimation />
        </div>
      </div>

      <div className="hidden items-center justify-between gap-4 lg:flex">
        <SocialLinks />
        <ThemeToggle mounted={mounted} />
      </div>
    </aside>
  );
}

function SocialLinks({ className }) {
  return (
    <ul className={cn("flex items-center gap-4 text-p3-text-light", className)}>
      {links.map((link) => (
        <li key={link.name}>
          <a
            aria-label={link.name}
            className="block transition-colors hover:text-p3-text dark:hover:text-p3-text-dark"
            href={link.href}
            rel="noreferrer"
            target="_blank"
            title={link.name}
          >
            {link.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}

function ThemeToggle({ mounted }) {
  return mounted ? (
    <DarkModeToggle />
  ) : (
    <div className="h-8 w-22 animate-pulse rounded-md bg-p3-background-dark dark:bg-p3-background-light" />
  );
}
