"use client";

import { cn } from "@lib/utils";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
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

export function DarkModeToggle() {
  const { setTheme, theme, themes } = useTheme();
  const groupId = React.useId();
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  const orderedThemes = React.useMemo(() => themes.filter((t) => t in THEME_META), [themes]);
  const activeIndex = Math.max(0, orderedThemes.indexOf(theme));

  const targetIndex = hoveredIndex ?? activeIndex;
  const minIndex = Math.min(activeIndex, targetIndex);
  const maxIndex = Math.max(activeIndex, targetIndex);
  const indicatorX = minIndex * STEP_PX;
  const indicatorWidth = (maxIndex - minIndex) * STEP_PX + BUTTON_PX;

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
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1 left-1 z-0 h-6 rounded-sm bg-p3-primary/20 ring-1 ring-p3-primary/40 dark:bg-p3-primary/30 dark:ring-p3-primary/50",
          "motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
        )}
        style={{
          transform: `translateX(${indicatorX}px)`,
          width: `${indicatorWidth}px`,
        }}
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
