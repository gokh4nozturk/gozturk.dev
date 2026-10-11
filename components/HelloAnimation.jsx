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
import { useEffect, useRef, useState } from "react";

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
const GLASS_STROKE_WIDTH = 26;

// Fill a fixed-size box and let each SVG's intrinsic preserveAspectRatio
// center the glyph inside it. Keeping the box constant across every language
// is what prevents layout shift (CLS): the scripts have very different widths,
// so sizing by width would make the centered element jump on every swap.
// Every SVG shares the same viewBox height (279, room for the j/р descenders)
// and baseline, so all languages render at the same scale, stroke weight and
// baseline instead of descender scripts (French/Russian) shrinking to fit.
// overflow-visible: the thick glass stroke (and its shadow) reaches past the
// viewBox edges on glyphs that touch them (e.g. the top of "h"), which the
// SVG's default overflow: hidden would clip.
const helloEffectClass = "h-full w-full overflow-visible";

// Theme-aware glass tints, read by the filter's flood colors through CSS vars.
const glassThemeClass = cn(
  "[--glass-body:rgb(255_255_255/0.25)] [--glass-caustic:rgb(255_255_255/0.9)] [--glass-edge:rgb(20_30_50/0.55)] [--glass-liquid:rgb(0_0_0/0.45)] [--glass-rim:rgb(255_255_255/0.95)] [--glass-shadow:rgb(20_30_50/0.22)]",
  "dark:[--glass-body:rgb(255_255_255/0.05)] dark:[--glass-caustic:rgb(255_255_255/0.12)] dark:[--glass-edge:rgb(255_255_255/0.3)] dark:[--glass-liquid:rgb(0_0_0/0.4)] dark:[--glass-rim:rgb(255_255_255/0.6)] dark:[--glass-shadow:rgb(0_0_0/0.5)]",
);

const KEY_LIGHT_AZIMUTH = 225;

// Pastel blobs the glass refracts as its "liquid", spread over the filter
// region. A pre-drawn image is far cheaper than feTurbulence, which would
// recompute noise every time the filter re-renders.
const LIQUID_COLORS = ["#ff7ad1", "#6fd0ff", "#a98bff", "#7dffc0", "#ffb978"];
const LIQUID_BLOBS = Array.from({ length: 28 }, (_, i) => [
  i * 64 + ((i * 37) % 50),
  ((i * 89) % 300) + 50,
  110 + ((i * 53) % 60),
  LIQUID_COLORS[(i * 3) % LIQUID_COLORS.length],
]);
const LIQUID_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1750" height="400"><defs>${LIQUID_BLOBS.map(
    ([, , , color], i) =>
      `<radialGradient id="b${i}"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`,
  ).join("")}</defs>${LIQUID_BLOBS.map(
    ([cx, cy, r], i) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#b${i})"/>`,
  ).join("")}</svg>`,
)}`;

// Liquid Glass material built from the stroke's own alpha. It is applied to a
// <g> inside each SVG (not as a CSS filter on an HTML box, which Safari renders
// unreliably), so every value below is in viewBox units and scales with the SVG.
// The filter region hugs each glyph's bounding box (plus room for the stroke,
// shadow and caustic): every filter pixel is recomputed on each frame while the
// strokes draw, so a loose region drops frames and makes the pen stutter.
// Layers: contact shadow + light caustic, near-clear body, a colored "liquid"
// refracted through the tube, refraction darkening toward the
// edges, chromatic fringes, an inner rim reflection, a back light and a sharp
// key specular whose direction follows the pointer.
function LiquidGlassFilter({ backLightRef, keyLightRef, liquidRef }) {
  return (
    <svg aria-hidden="true" className="absolute size-0" focusable="false">
      <filter
        colorInterpolationFilters="sRGB"
        height="1.5"
        id={GLASS_FILTER_ID}
        width="1.12"
        x="-0.06"
        y="-0.15"
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

        {/* Rounded height map shared by the refraction and both lights */}
        <feGaussianBlur in="SourceAlpha" result="height" stdDeviation="4" />

        {/* Liquid: pastel color bent by the tube's height map, like light refracted
            through glass; it slides with the pointer (see usePointerLight) */}
        <feImage
          height="400"
          href={LIQUID_IMAGE}
          preserveAspectRatio="none"
          result="noise"
          width="1750"
          x="-350"
          y="-50"
        />
        <feOffset in="noise" ref={liquidRef} result="flow" />
        <feColorMatrix
          in="height"
          result="heightMap"
          type="matrix"
          values="0 0 0 1 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1"
        />
        <feDisplacementMap
          in="flow"
          in2="heightMap"
          result="refracted"
          scale="60"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feFlood style={{ floodColor: "var(--glass-liquid)" }} />
        <feComposite in2="SourceAlpha" operator="in" result="liquidMask" />
        <feComposite in="refracted" in2="liquidMask" operator="in" result="liquid" />

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
        <feFlood floodColor="rgb(110, 200, 255)" floodOpacity="0.45" />
        <feComposite in2="edgeTopLeftSoft" operator="in" result="fringeCool" />
        <feOffset dx="-3" dy="-3" in="SourceAlpha" result="shiftUp" />
        <feComposite in="SourceAlpha" in2="shiftUp" operator="out" result="edgeBottomRight" />
        <feGaussianBlur in="edgeBottomRight" result="edgeBottomRightSoft" stdDeviation="0.8" />
        <feFlood floodColor="rgb(255, 150, 210)" floodOpacity="0.4" />
        <feComposite in2="edgeBottomRightSoft" operator="in" result="fringeWarm" />

        {/* Thin inner rim reflection running all along the outline: a narrow band
            of the blurred height map, picked out with a lookup table (much
            cheaper per frame than eroding the alpha with feMorphology) */}
        <feComponentTransfer in="height" result="rimBand">
          <feFuncA tableValues="0 0 0 0 0 0 0.35 1 0.35 0 0" type="table" />
        </feComponentTransfer>
        <feFlood style={{ floodColor: "var(--glass-rim)" }} />
        <feComposite in2="rimBand" operator="in" result="rim" />

        {/* Back light catching the edge opposite the key light */}
        <feSpecularLighting
          in="height"
          lightingColor="#ffffff"
          result="backLight"
          specularConstant="0.8"
          specularExponent="18"
          surfaceScale="7"
        >
          <feDistantLight azimuth={KEY_LIGHT_AZIMUTH - 180} elevation="30" ref={backLightRef} />
        </feSpecularLighting>
        <feComposite in="backLight" in2="SourceAlpha" operator="in" result="backLightIn" />

        {/* Sharp key specular, steered by the pointer */}
        <feSpecularLighting
          in="height"
          lightingColor="#ffffff"
          result="keyLight"
          specularConstant="1.7"
          specularExponent="45"
          surfaceScale="7"
        >
          <feDistantLight azimuth={KEY_LIGHT_AZIMUTH} elevation="38" ref={keyLightRef} />
        </feSpecularLighting>
        <feComposite in="keyLight" in2="SourceAlpha" operator="in" result="keyLightIn" />

        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="caustic" />
          <feMergeNode in="body" />
          <feMergeNode in="liquid" />
          <feMergeNode in="edgeTint" />
          <feMergeNode in="fringeCool" />
          <feMergeNode in="fringeWarm" />
          <feMergeNode in="rim" />
          <feMergeNode in="backLightIn" />
          <feMergeNode in="keyLightIn" />
        </feMerge>
      </filter>
    </svg>
  );
}

// Points the key light from the pointer toward the hello (and the back light
// opposite to it) and slides the refracted liquid with the pointer, so the glass
// reacts as the pointer moves. Writes the attributes directly to avoid
// re-rendering, and costs nothing while the pointer is idle (unlike a looping
// animation, which would re-run the filter every frame).
function usePointerLight(boxRef, keyLightRef, backLightRef, liquidRef) {
  useEffect(() => {
    let frame = 0;
    const onMove = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = boxRef.current?.getBoundingClientRect();
        if (!box) return;
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        const azimuth = (Math.atan2(dy, dx) * 180) / Math.PI;
        keyLightRef.current?.setAttribute("azimuth", String(azimuth));
        backLightRef.current?.setAttribute("azimuth", String(azimuth + 180));
        liquidRef.current?.setAttribute("dx", String((dx / window.innerWidth) * -300));
        liquidRef.current?.setAttribute("dy", String((dy / window.innerHeight) * -60));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [boxRef, keyLightRef, backLightRef, liquidRef]);
}

export default function HelloAnimation() {
  const [index, setIndex] = useState(0);
  const { Effect, key } = HELLOS[index];
  const boxRef = useRef(null);
  const keyLightRef = useRef(null);
  const backLightRef = useRef(null);
  const liquidRef = useRef(null);
  usePointerLight(boxRef, keyLightRef, backLightRef, liquidRef);

  return (
    <div className={cn("flex items-start justify-center", glassThemeClass)}>
      <LiquidGlassFilter
        backLightRef={backLightRef}
        keyLightRef={keyLightRef}
        liquidRef={liquidRef}
      />
      {/* Fixed-size, stable box: both width and height stay constant across every
          language, so the glyph never shifts (no CLS). Each SVG fills this exact
          box and its own preserveAspectRatio ("xMidYMid meet") scales + centers
          the glyph inside. Height includes descender room below the baseline.
          max-w caps it on desktop; w-full keeps it responsive and overflow-free
          on narrow viewports. */}
      <div className="relative h-22 w-full max-w-104 sm:h-28" ref={boxRef}>
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
