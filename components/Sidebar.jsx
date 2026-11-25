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
        <Avatar />
        <NameTransition />
        <div className="ml-auto lg:hidden">
          <ThemeToggle mounted={mounted} />
        </div>
      </div>

      {/* A byline: facts only. What I do and care about lives in the home intro. */}
      <p className="text-p3-text-light text-sm lg:mt-5">
        Software engineer <span aria-hidden="true">·</span> İstanbul
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

// Pop-out mask: everything above the disc's center line (within its width)
// plus the disc itself, so the head rises out of the glass while the
// shoulders stay inside. --r is the disc radius.
const popOutMask = [
  "linear-gradient(#000, #000) top / 100% calc(100% - var(--r)) no-repeat",
  "radial-gradient(circle at 50% calc(100% - var(--r)), #000 calc(var(--r) - 0.5px), transparent var(--r)) center / 100% 100% no-repeat",
].join(", ");

const PUPIL_RANGE = { down: 7, side: 11, up: 3 }; // SVG units inside the eye
const PUPIL_REACH = 320; // px from the avatar where the pupils reach full range

// Glass disc (same .liquid-glass as the nav pill) with the illustration's
// head popping out above it. The pupils follow the pointer.
function Avatar() {
  const ref = React.useRef(null);
  usePupilsFollowPointer(ref);

  return (
    <div className="relative size-16 shrink-0 [--r:2rem] md:size-20 md:[--r:2.5rem]" ref={ref}>
      <div className="liquid-glass absolute inset-0 rounded-full" />
      {/* SVG placement in disc radii, from the illustration's own geometry
          (1080 box; face circle at (502, 649) r=270; hair top y=351): 3.5r
          wide, face 0.3r above the disc center, hair ~0.27r above the rim. */}
      <div
        className="absolute inset-x-0 top-[calc(var(--r)*-1.5)] bottom-0"
        style={{ mask: popOutMask, WebkitMask: popOutMask }}
      >
        <Profile className="absolute top-[calc(var(--r)*0.09)] left-1/2 w-[calc(var(--r)*3.5)] max-w-none -translate-x-[46.5%]" />
      </div>
    </div>
  );
}

function usePupilsFollowPointer(ref) {
  React.useEffect(() => {
    const el = ref.current;
    const still =
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || still) return;

    let frame = 0;
    const onPointerMove = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, distance / PUPIL_REACH);
        const x = (dx / distance) * reach * PUPIL_RANGE.side;
        const y = (dy / distance) * reach * (dy < 0 ? PUPIL_RANGE.up : PUPIL_RANGE.down);
        el.style.setProperty("--pupil-x", `${x.toFixed(2)}px`);
        el.style.setProperty("--pupil-y", `${y.toFixed(2)}px`);
      });
    };
    const onPointerLeave = () => {
      cancelAnimationFrame(frame);
      el.style.removeProperty("--pupil-x");
      el.style.removeProperty("--pupil-y");
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [ref]);
}

function ThemeToggle({ mounted }) {
  return mounted ? (
    <DarkModeToggle />
  ) : (
    <div className="h-8 w-22 animate-pulse rounded-md bg-p3-background-dark dark:bg-p3-background-light" />
  );
}
