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

      {/* The hello canvas overhangs its box by 24px for the glass shadow; on
          narrow screens that would widen the page, so clip it sideways there. */}
      <div
        className={cn(
          "flex items-center py-4 max-lg:overflow-x-clip lg:flex-1 lg:py-0",
          !isHome && "max-lg:hidden",
        )}
      >
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

// Avatar geometry, in half the box size (--r). The illustration is a head
// only (1080 box: face circle centered at (502, 649) with radius 270; with
// its white outline the drawing spans x 212–810, y 331–939). It's drawn
// 3.68r wide so the head fills the box, centered on the drawing's middle.
const LOOK_REACH = 360; // px from the avatar where the look reaches full strength
const PUPIL_RANGE = { down: 10, side: 14, up: 4 }; // SVG units inside the eye
const HEAD_TILT = 5; // deg at full strength
const HEAD_SHIFT = { x: 2, y: 1.5 }; // px at full strength

// The head turns a little toward the pointer and the pupils follow it.
const headStyle = {
  left: "calc(var(--r) * -0.74)",
  top: "calc(var(--r) * -1.16)",
  width: "calc(var(--r) * 3.68)",
};

// Applied to the wrapper that also carries the drop shadow: the filter is
// drawn before the transform, so the shadow turns with the head. The origin
// is the face's center within the box.
const lookStyle = {
  transform: `translate(calc(var(--look-x, 0) * ${HEAD_SHIFT.x}px), calc(var(--look-y, 0) * ${HEAD_SHIFT.y}px)) rotate(calc(var(--look-x, 0) * ${HEAD_TILT}deg))`,
  transformOrigin: "48% 55%",
  transition: "transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)",
};

function Avatar() {
  const ref = React.useRef(null);
  useLookAtPointer(ref);

  return (
    <div className="relative size-16 shrink-0 [--r:2rem] md:size-20 md:[--r:2.5rem]" ref={ref}>
      <div className="avatar-shadow absolute inset-0" style={lookStyle}>
        <Profile className="absolute max-w-none" style={headStyle} />
      </div>
    </div>
  );
}

// Sets --look-x/--look-y (-1..1) for the head and --pupil-x/--pupil-y (SVG
// units) for the eyes. Off on touch screens and with reduced motion.
function useLookAtPointer(ref) {
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
        const reach = Math.min(1, distance / LOOK_REACH);
        const lx = (dx / distance) * reach;
        const ly = (dy / distance) * reach;
        el.style.setProperty("--look-x", lx.toFixed(3));
        el.style.setProperty("--look-y", ly.toFixed(3));
        el.style.setProperty("--pupil-x", `${(lx * PUPIL_RANGE.side).toFixed(2)}px`);
        el.style.setProperty(
          "--pupil-y",
          `${(ly * (ly < 0 ? PUPIL_RANGE.up : PUPIL_RANGE.down)).toFixed(2)}px`,
        );
      });
    };
    const onPointerLeave = () => {
      cancelAnimationFrame(frame);
      for (const name of ["--look-x", "--look-y", "--pupil-x", "--pupil-y"]) {
        el.style.removeProperty(name);
      }
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
