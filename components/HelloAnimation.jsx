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
// its bevel, rim and specular highlight.
const GLASS_STROKE_WIDTH = 22;

// Fill a fixed-size box and let each SVG's intrinsic preserveAspectRatio
// center the glyph inside it. Keeping the box constant across every language
// is what prevents layout shift (CLS): the scripts have very different widths,
// so sizing by width would make the centered element jump on every swap.
// Every SVG shares the same viewBox height (279, room for the j/р descenders)
// and baseline, so all languages render at the same scale, stroke weight and
// baseline instead of descender scripts (French/Russian) shrinking to fit.
const helloEffectClass = "h-full w-full";

// Liquid Glass material built from the stroke's own alpha, in CSS pixels
// (the filter is applied to the HTML box, not inside the SVG viewBox):
// a translucent tinted body, a bevel lit from the top-left (specular),
// a bright inner rim, a faint refraction tint and a soft contact shadow.
function LiquidGlassFilter() {
  return (
    <svg aria-hidden="true" className="absolute h-0 w-0" focusable="false">
      <filter
        colorInterpolationFilters="sRGB"
        height="160%"
        id={GLASS_FILTER_ID}
        width="140%"
        x="-20%"
        y="-30%"
      >
        {/* Translucent body tinted by the current text color */}
        <feColorMatrix
          in="SourceGraphic"
          result="body"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.16 0"
        />

        {/* Refraction tint: light bends to the edges, so tint only the rim zone */}
        <feMorphology in="SourceAlpha" operator="erode" radius="1.6" result="core" />
        <feComposite in="SourceAlpha" in2="core" operator="out" result="edge" />
        <feGaussianBlur in="edge" result="edgeSoft" stdDeviation="0.6" />
        <feFlood floodColor="currentColor" floodOpacity="0.35" />
        <feComposite in2="edgeSoft" operator="in" result="edgeTint" />

        {/* Bevel height map + specular highlight */}
        <feGaussianBlur in="SourceAlpha" result="height" stdDeviation="1.8" />
        <feSpecularLighting
          in="height"
          lightingColor="#ffffff"
          result="specular"
          specularConstant="1.2"
          specularExponent="22"
          surfaceScale="4"
        >
          <feDistantLight azimuth="225" elevation="50" />
        </feSpecularLighting>
        <feComposite in="specular" in2="SourceAlpha" operator="in" result="specularIn" />

        {/* Thin bright inner rim on the lit side (top-left) */}
        <feOffset dx="0.8" dy="1" in="core" result="coreLit" />
        <feComposite in="SourceAlpha" in2="coreLit" operator="out" result="rim" />
        <feFlood floodColor="#ffffff" floodOpacity="0.9" />
        <feComposite in2="rim" operator="in" result="rimLight" />

        {/* Darker inner edge on the far side (bottom-right) for depth */}
        <feOffset dx="-0.8" dy="-1" in="core" result="coreShade" />
        <feComposite in="SourceAlpha" in2="coreShade" operator="out" result="shadeEdge" />
        <feFlood floodColor="#000000" floodOpacity="0.22" />
        <feComposite in2="shadeEdge" operator="in" result="rimShade" />

        {/* Soft contact shadow */}
        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
        <feOffset dy="3" />
        <feComponentTransfer result="shadow">
          <feFuncA slope="0.18" type="linear" />
        </feComponentTransfer>

        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="body" />
          <feMergeNode in="edgeTint" />
          <feMergeNode in="rimShade" />
          <feMergeNode in="specularIn" />
          <feMergeNode in="rimLight" />
        </feMerge>
      </filter>
    </svg>
  );
}

export default function HelloAnimation() {
  const [index, setIndex] = useState(0);
  const { Effect, key } = HELLOS[index];

  return (
    <div className="flex items-start justify-center">
      <LiquidGlassFilter />
      {/* Fixed-size, stable box: both width and height stay constant across every
          language, so the glyph never shifts (no CLS). Each SVG fills this exact
          box and its own preserveAspectRatio ("xMidYMid meet") scales + centers
          the glyph inside. Height includes descender room below the baseline.
          max-w caps it on desktop; w-full keeps it responsive and overflow-free
          on narrow viewports. */}
      <div
        className={cn("relative h-22 w-full max-w-104 overflow-hidden sm:h-28")}
        style={{ filter: `url(#${GLASS_FILTER_ID})` }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key={key}
            transition={{ delay: 0.1, duration: 0.2, ease: "easeInOut" }}
          >
            <Effect
              className={helloEffectClass}
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
