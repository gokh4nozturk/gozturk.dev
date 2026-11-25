"use client";

import ThankYou from "@components/ThankYou";
import { cn } from "@lib/utils";
import { Bookmark, Home, LayoutGrid } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

const LENS_SPRING = { bounce: 0.3, duration: 0.5, type: "spring" };

// Bottom navigation as a liquid glass pill (styles: .liquid-glass in globals.css).
export default function Navigation() {
  const pathname = usePathname();
  const navRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const refract = useRefraction();
  useSpecularGlint(navRef);

  return (
    <nav
      aria-label="Main"
      className="liquid-glass fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5 sm:bottom-12"
      data-refract={refract ? "" : undefined}
      ref={navRef}
    >
      {refract && <RefractionFilter />}
      <ul className="flex items-center">
        {navItems.map(({ name, path, icon: Icon }) => {
          const isActive = pathname === path;
          return (
            <li key={path}>
              <Link
                aria-current={isActive ? "page" : undefined}
                aria-label={name}
                className={cn(
                  "relative grid h-10 w-12 place-items-center rounded-full transition-colors sm:w-14",
                  isActive
                    ? "text-p3-text dark:text-p3-text-dark"
                    : "text-p3-text-light hover:text-p3-text dark:hover:text-p3-text-dark",
                )}
                href={path}
                title={name}
              >
                {isActive && (
                  <motion.span
                    className="glass-lens absolute inset-0 rounded-full"
                    layoutId="nav-lens"
                    transition={reduceMotion ? { duration: 0 } : LENS_SPRING}
                  />
                )}
                <motion.span
                  className="relative"
                  whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.88 }}
                >
                  <Icon className="size-5" strokeWidth={isActive ? 2.2 : 1.8} />
                </motion.span>
              </Link>
            </li>
          );
        })}
      </ul>
      <span className="mx-1 h-6 w-px bg-p3-text/10 dark:bg-p3-text-dark/15" />
      <ThankYou className="mr-0 ml-0" />
    </nav>
  );
}

// SVG backdrop refraction only renders in Chromium; elsewhere the url() filter
// would drop the whole backdrop-filter, so it's opt-in.
function useRefraction() {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    const brands = navigator.userAgentData?.brands ?? [];
    const reduceTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
    setSupported(!reduceTransparency && brands.some((b) => b.brand === "Chromium"));
  }, []);
  return supported;
}

// Moves the glint (::after) toward the pointer while it is over the pill.
function useSpecularGlint(ref) {
  useEffect(() => {
    const nav = ref.current;
    if (!nav || window.matchMedia("(hover: none)").matches) return;

    let frame = 0;
    const onPointerMove = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = nav.getBoundingClientRect();
        nav.style.setProperty("--glass-x", `${event.clientX - rect.left}px`);
        nav.style.setProperty("--glass-y", `${event.clientY - rect.top}px`);
        nav.style.setProperty("--glass-glint-opacity", "1");
      });
    };
    const onPointerLeave = () => {
      cancelAnimationFrame(frame);
      nav.style.removeProperty("--glass-x");
      nav.style.removeProperty("--glass-y");
      nav.style.removeProperty("--glass-glint-opacity");
    };

    nav.addEventListener("pointermove", onPointerMove);
    nav.addEventListener("pointerleave", onPointerLeave);
    return () => {
      cancelAnimationFrame(frame);
      nav.removeEventListener("pointermove", onPointerMove);
      nav.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [ref]);
}

function RefractionFilter() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0">
      <filter
        colorInterpolationFilters="sRGB"
        height="140%"
        id="liquid-glass-refraction"
        width="140%"
        x="-20%"
        y="-20%"
      >
        <feTurbulence
          baseFrequency="0.012 0.02"
          numOctaves="2"
          result="noise"
          seed="7"
          type="fractalNoise"
        />
        <feGaussianBlur in="noise" result="soft" stdDeviation="2" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="soft"
          scale="28"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
