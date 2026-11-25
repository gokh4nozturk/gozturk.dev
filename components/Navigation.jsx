"use client";

import ThankYou from "@components/ThankYou";
import { createLensMap } from "@lib/glass-lens-map";
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

const FILTER_ID = "liquid-glass-refraction";
const REFRACTION = 22; // px, max sample offset at the rim (green channel)
const DISPERSION = 0.04; // red bends less, blue bends more, by this fraction
const DEFAULT_LIGHT_ANGLE = -45; // deg, conic angle (0 = top): light from the top-left
const LENS_SPRING = { bounce: 0.28, duration: 0.55, type: "spring" };

// Bottom navigation as a liquid glass pill (styles: .liquid-glass in globals.css).
export default function Navigation() {
  const pathname = usePathname();
  const navRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const lens = useLensMap(navRef);
  const hasNavigated = useHasNavigated(pathname);
  usePointerLight(navRef);

  return (
    <nav
      aria-label="Main"
      // Centered with inset + auto margins, not translate: Chromium misplaces
      // an SVG backdrop-filter on a transformed element.
      className="liquid-glass fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit items-center gap-1 rounded-full p-1.5 sm:bottom-12"
      data-refract={lens ? "" : undefined}
      ref={navRef}
    >
      {lens && <RefractionFilter {...lens} />}
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
                    className="absolute inset-0"
                    layoutId="nav-lens"
                    transition={reduceMotion ? { duration: 0 } : LENS_SPRING}
                  >
                    {/* Inner layer squashes and stretches like a droplet while the
                        outer one slides, so the two transforms don't fight. */}
                    <motion.span
                      animate={
                        hasNavigated && !reduceMotion
                          ? { scaleX: [1, 1.22, 0.96, 1], scaleY: [1, 0.84, 1.04, 1] }
                          : undefined
                      }
                      className="glass-lens absolute inset-0 rounded-full"
                      transition={{ duration: 0.55, ease: "easeOut", times: [0, 0.35, 0.7, 1] }}
                    />
                  </motion.span>
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

// True once the route has changed at least once, so the droplet doesn't
// wobble on the first page load.
function useHasNavigated(pathname) {
  const first = useRef(pathname);
  const [navigated, setNavigated] = useState(false);
  useEffect(() => {
    if (pathname !== first.current) setNavigated(true);
  }, [pathname]);
  return navigated || pathname !== first.current;
}

// Builds a lens displacement map matching the pill's size. Returns null where
// SVG backdrop filters don't render (non-Chromium) or the user asked for less
// transparency; the CSS then falls back to frosted glass.
function useLensMap(ref) {
  const [lens, setLens] = useState(null);

  useEffect(() => {
    const nav = ref.current;
    const brands = navigator.userAgentData?.brands ?? [];
    const isChromium = brands.some((b) => b.brand === "Chromium");
    const reduceTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
    if (!nav || !isChromium || reduceTransparency) return;

    let size = "";
    const update = () => {
      const width = Math.round(nav.offsetWidth);
      const height = Math.round(nav.offsetHeight);
      const next = `${width}x${height}`;
      if (!width || !height || next === size) return;
      size = next;
      setLens({ height, map: createLensMap(width, height), width });
    };

    const observer = new ResizeObserver(update);
    observer.observe(nav);
    update();
    return () => observer.disconnect();
  }, [ref]);

  return lens;
}

// Turns the rim's specular highlight toward the pointer.
function usePointerLight(ref) {
  useEffect(() => {
    const nav = ref.current;
    if (!nav || window.matchMedia("(hover: none)").matches) return;

    let frame = 0;
    const onPointerMove = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = nav.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        // Squash the vertical distance so the pill's aspect ratio doesn't
        // pin the highlight to the long edges.
        const dy = (event.clientY - (rect.top + rect.height / 2)) * (rect.width / rect.height);
        // atan2 is 0 at +x and clockwise on screen; the conic gradient is 0 at the top.
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        nav.style.setProperty("--glass-angle", `${angle}deg`);
      });
    };
    const onPointerLeave = () => {
      cancelAnimationFrame(frame);
      nav.style.setProperty("--glass-angle", `${DEFAULT_LIGHT_ANGLE}deg`);
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

// Displaces the backdrop through the lens map once per color channel, each a
// little stronger than the last, then screens them back together. That gives
// the rim its bend plus a faint chromatic fringe.
function RefractionFilter({ width, height, map }) {
  const channels = [
    { matrix: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0", name: "r", scale: 1 - DISPERSION },
    { matrix: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0", name: "g", scale: 1 },
    { matrix: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0", name: "b", scale: 1 + DISPERSION },
  ];

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0">
      <filter
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
        height={height}
        id={FILTER_ID}
        width={width}
        x="0"
        y="0"
      >
        <feImage
          height={height}
          href={map}
          preserveAspectRatio="none"
          result="lens"
          width={width}
          x="0"
          y="0"
        />
        {channels.map(({ name, scale, matrix }) => [
          <feDisplacementMap
            in="SourceGraphic"
            in2="lens"
            key={`${name}-displace`}
            result={`${name}-displaced`}
            scale={REFRACTION * scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />,
          <feColorMatrix
            in={`${name}-displaced`}
            key={`${name}-isolate`}
            result={name}
            type="matrix"
            values={matrix}
          />,
        ])}
        <feBlend in="r" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b" mode="screen" />
      </filter>
    </svg>
  );
}
