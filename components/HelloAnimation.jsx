"use client";

import {
  AppleHelloEnglishEffect,
  AppleHelloFrenchEffect,
  AppleHelloJapaneseEffect,
  AppleHelloRussianEffect,
  AppleHelloSpanishEffect,
  AppleHelloTurkishEffect,
  AppleHelloVietnameseEffect,
} from "@components/apple-hello";
import { cn } from "@lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const HELLOS = [
  { Effect: AppleHelloEnglishEffect, key: "english" },
  { Effect: AppleHelloTurkishEffect, key: "turkish" },
  { Effect: AppleHelloFrenchEffect, key: "french" },
  { Effect: AppleHelloSpanishEffect, key: "spanish" },
  { Effect: AppleHelloVietnameseEffect, key: "vietnamese" },
  { Effect: AppleHelloRussianEffect, key: "russian" },
  { Effect: AppleHelloJapaneseEffect, key: "japanese" },
];

const NEXT_HELLO_DELAY = 800;
const GLASS_FILTER_ID = "hello-liquid-glass";

// Thicker than the default 14.9 so the glass "tube" has enough body to show
// its refraction, rim and specular highlights.
const GLASS_STROKE_WIDTH = 24;

// Fill a fixed-size box and let each SVG's intrinsic preserveAspectRatio
// center the glyph inside it. Keeping the box constant across every language
// is what prevents layout shift (CLS): the scripts have very different widths,
// so sizing by width would make the centered element jump on every swap.
// Every SVG shares the same viewBox height (279, room for the j/р descenders)
// and baseline, so all languages render at the same scale, stroke weight and
// baseline instead of descender scripts (French/Russian) shrinking to fit.
const helloEffectClass = "h-full w-full";

// Theme-aware glass tints, read by the filter's flood colors through CSS vars.
const glassThemeClass = cn(
  "[--glass-body:rgb(255_255_255/0.3)] [--glass-caustic:rgb(255_255_255/0.9)] [--glass-edge:rgb(20_30_50/0.6)] [--glass-shadow:rgb(20_30_50/0.22)]",
  "dark:[--glass-body:rgb(255_255_255/0.06)] dark:[--glass-caustic:rgb(255_255_255/0.12)] dark:[--glass-edge:rgb(255_255_255/0.32)] dark:[--glass-shadow:rgb(0_0_0/0.5)]",
);

// Liquid Glass material built from the stroke's own alpha. It is applied to a
// <g> inside each SVG (not as a CSS filter on an HTML box, which Safari renders
// unreliably), so every value below is in viewBox units and scales with the SVG.
// The filter region is in absolute viewBox units (covers the widest, 1050)
// because percentages would resolve against the hidden, zero-size host <svg>.
// Layers: contact shadow + light caustic, near-clear body, refraction darkening
// toward the edges, chromatic fringes, a back light and a sharp key specular.
function LiquidGlassFilter() {
  return (
    <svg aria-hidden="true" className="absolute size-0" focusable="false">
      <filter
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
        height="400"
        id={GLASS_FILTER_ID}
        width="1200"
        x="-50"
        y="-50"
      >
        {/* Soft contact shadow and the light the glass focuses into it */}
        <feGaussianBlur in="SourceAlpha" result="shadowBlur" stdDeviation="9" />
        <feOffset dy="12" in="shadowBlur" result="shadowOffset" />
        <feFlood style={{ floodColor: "var(--glass-shadow)" }} />
        <feComposite in2="shadowOffset" operator="in" result="shadow" />
        <feGaussianBlur in="SourceAlpha" result="causticBlur" stdDeviation="3" />
        <feOffset dy="9" in="causticBlur" result="causticOffset" />
        <feComposite in="causticOffset" in2="SourceAlpha" operator="out" result="causticOut" />
        <feFlood style={{ floodColor: "var(--glass-caustic)" }} />
        <feComposite in2="causticOut" operator="in" result="caustic" />

        {/* Near-clear body */}
        <feFlood style={{ floodColor: "var(--glass-body)" }} />
        <feComposite in2="SourceAlpha" operator="in" result="body" />

        {/* Refraction: the tube bends light away near its edges, so they read darker */}
        <feGaussianBlur in="SourceAlpha" result="soft" stdDeviation="5" />
        <feComposite
          in="SourceAlpha"
          in2="soft"
          k1="-1"
          k2="1"
          operator="arithmetic"
          result="edge"
        />
        <feFlood style={{ floodColor: "var(--glass-edge)" }} />
        <feComposite in2="edge" operator="in" result="edgeTint" />

        {/* Chromatic fringes on opposite edges */}
        <feOffset dx="3" dy="3" in="SourceAlpha" result="shiftDown" />
        <feComposite in="SourceAlpha" in2="shiftDown" operator="out" result="edgeTopLeft" />
        <feGaussianBlur in="edgeTopLeft" result="edgeTopLeftSoft" stdDeviation="0.8" />
        <feFlood floodColor="rgb(110, 200, 255)" floodOpacity="0.35" />
        <feComposite in2="edgeTopLeftSoft" operator="in" result="fringeCool" />
        <feOffset dx="-3" dy="-3" in="SourceAlpha" result="shiftUp" />
        <feComposite in="SourceAlpha" in2="shiftUp" operator="out" result="edgeBottomRight" />
        <feGaussianBlur in="edgeBottomRight" result="edgeBottomRightSoft" stdDeviation="0.8" />
        <feFlood floodColor="rgb(255, 150, 210)" floodOpacity="0.3" />
        <feComposite in2="edgeBottomRightSoft" operator="in" result="fringeWarm" />

        {/* Rounded height map shared by both lights */}
        <feGaussianBlur in="SourceAlpha" result="height" stdDeviation="4" />

        {/* Back light catching the lower-right edge */}
        <feSpecularLighting
          in="height"
          lightingColor="#ffffff"
          result="backLight"
          specularConstant="0.7"
          specularExponent="18"
          surfaceScale="7"
        >
          <feDistantLight azimuth="45" elevation="30" />
        </feSpecularLighting>
        <feComposite in="backLight" in2="SourceAlpha" operator="in" result="backLightIn" />

        {/* Sharp key specular from the top-left */}
        <feSpecularLighting
          in="height"
          lightingColor="#ffffff"
          result="keyLight"
          specularConstant="1.5"
          specularExponent="45"
          surfaceScale="7"
        >
          <feDistantLight azimuth="225" elevation="38" />
        </feSpecularLighting>
        <feComposite in="keyLight" in2="SourceAlpha" operator="in" result="keyLightIn" />

        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="caustic" />
          <feMergeNode in="body" />
          <feMergeNode in="edgeTint" />
          <feMergeNode in="fringeCool" />
          <feMergeNode in="fringeWarm" />
          <feMergeNode in="backLightIn" />
          <feMergeNode in="keyLightIn" />
        </feMerge>
      </filter>
    </svg>
  );
}

export default function HelloAnimation() {
  const [index, setIndex] = useState(0);
  const { Effect, key } = HELLOS[index];

  return (
    <div className={cn("flex items-start justify-center", glassThemeClass)}>
      <LiquidGlassFilter />
      {/* Fixed-size, stable box: both width and height stay constant across every
          language, so the glyph never shifts (no CLS). Each SVG fills this exact
          box and its own preserveAspectRatio ("xMidYMid meet") scales + centers
          the glyph inside. Height includes descender room below the baseline.
          max-w caps it on desktop; w-full keeps it responsive and overflow-free
          on narrow viewports. */}
      <div className="relative h-22 w-full max-w-104 sm:h-28">
        {/* "wait" fades the previous hello out before the next one starts, so two
            translucent glass layers never overlap mid-swap. */}
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            initial={{ opacity: 1 }}
            key={key}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Effect
              className={helloEffectClass}
              contentFilter={`url(#${GLASS_FILTER_ID})`}
              exit={undefined}
              onAnimationComplete={() => {
                setTimeout(() => setIndex((i) => (i + 1) % HELLOS.length), NEXT_HELLO_DELAY);
              }}
              strokeWidth={GLASS_STROKE_WIDTH}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
