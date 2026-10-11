"use client";

import { cn } from "@lib/utils";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import * as React from "react";
import { flushSync } from "react-dom";

const THEME_META = {
  dark: { Icon: MoonIcon, label: "Dark theme" },
  light: { Icon: SunIcon, label: "Light theme" },
  system: { Icon: MonitorIcon, label: "Match system theme" },
};

const BUTTON_PX = 24;
const GAP_PX = 4;
const STEP_PX = BUTTON_PX + GAP_PX;

// The expanding edge leads with a snappy spring while the contracting edge trails softly,
// which gives the indicator its liquid stretch-and-settle feel.
const LEAD_SPRING = { damping: 32, stiffness: 520, type: "spring" };
const TRAIL_SPRING = { damping: 26, stiffness: 240, type: "spring" };

export function DarkModeToggle() {
  const { setTheme, theme, themes } = useTheme();
  const groupId = React.useId();
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  const orderedThemes = React.useMemo(() => themes.filter((t) => t in THEME_META), [themes]);
  const activeIndex = Math.max(0, orderedThemes.indexOf(theme));

  const targetIndex = hoveredIndex ?? activeIndex;
  const minIndex = Math.min(activeIndex, targetIndex);
  const maxIndex = Math.max(activeIndex, targetIndex);
  const targetLeft = minIndex * STEP_PX;
  const targetRight = maxIndex * STEP_PX + BUTTON_PX;

  const reduceMotion = useReducedMotion();
  const isReady = theme !== undefined;
  const hasPositioned = React.useRef(false);
  const left = useMotionValue(targetLeft);
  const right = useMotionValue(targetRight);
  const width = useTransform(() => right.get() - left.get());

  React.useEffect(() => {
    if (!isReady) return;
    // Snap into place on first render after hydration instead of sliding from index 0.
    if (!hasPositioned.current || reduceMotion) {
      hasPositioned.current = true;
      left.jump(targetLeft);
      right.jump(targetRight);
      return;
    }
    const leftControls = animate(
      left,
      targetLeft,
      targetLeft < left.get() ? LEAD_SPRING : TRAIL_SPRING,
    );
    const rightControls = animate(
      right,
      targetRight,
      targetRight > right.get() ? LEAD_SPRING : TRAIL_SPRING,
    );
    return () => {
      leftControls.stop();
      rightControls.stop();
    };
  }, [isReady, left, reduceMotion, right, targetLeft, targetRight]);

  const applyTheme = (next) => {
    if (!next || next === theme) return;
    // The DOM must update synchronously inside the view transition callback, otherwise
    // Safari snapshots the old theme as the "new" state and the reveal animation breaks.
    const run = () => flushSync(() => setTheme(next));
    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(run);
    } else {
      run();
    }
  };

  return (
    <fieldset
      aria-label="Theme"
      className="relative z-0 m-0 flex gap-1 rounded-md border border-p3-border p-1 backdrop-blur-sm dark:border-p3-border-dark"
      onPointerLeave={() => setHoveredIndex(null)}
    >
      {orderedThemes.map((t, index) => {
        const { Icon, label } = THEME_META[t];
        const id = `${groupId}-${t}`;
        return (
          <React.Fragment key={t}>
            <input
              checked={theme === t}
              className="peer sr-only"
              id={id}
              name={groupId}
              onChange={() => applyTheme(t)}
              type="radio"
              value={t}
            />
            <label
              aria-label={label}
              className={cn(
                "z-[1] grid size-6 cursor-pointer place-items-center rounded-sm text-p3-text-light transition-colors",
                "hover:text-p3-text peer-checked:text-p3-text dark:peer-checked:text-p3-text-dark dark:hover:text-p3-text-dark",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-p3-primary peer-focus-visible:ring-offset-1",
                "peer-focus-visible:ring-offset-p3-light dark:peer-focus-visible:ring-offset-p3-dark",
              )}
              htmlFor={id}
              onPointerEnter={() => setHoveredIndex(index)}
              title={label}
            >
              <Icon className="pointer-events-none size-4 stroke-2" />
            </label>
          </React.Fragment>
        );
      })}
      <motion.span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1 left-1 z-0 h-6 overflow-hidden rounded-sm",
          "border border-white/50 bg-gradient-to-b from-white/40 to-white/10 backdrop-blur-md backdrop-saturate-150",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.7),inset_0_-1px_2px_rgb(0_0_0/0.06),0_2px_6px_rgb(0_0_0/0.12)]",
          "dark:border-white/15 dark:from-white/20 dark:to-white/5",
          "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),inset_0_-1px_2px_rgb(0_0_0/0.3),0_2px_8px_rgb(0_0_0/0.4)]",
          "transition-opacity duration-200",
          isReady ? "opacity-100" : "opacity-0",
        )}
        style={{ width, x: left }}
      />
    </fieldset>
  );
}

export function useDarkMode() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark";
}

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
