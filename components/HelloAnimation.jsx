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
import { useCallback, useEffect, useRef, useState } from "react";

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
const GLASS_SHADOW_FILTER_ID = "hello-liquid-glass-shadow";
const GLASS_MASK_ID = "hello-liquid-glass-reveal";

// Room around the viewBox in the pre-rendered glass image, for strokes that
// reach past its edges.
const GLASS_IMAGE_MARGIN = 40;

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

// Shared by the full glass filter and the shadow-only one used while revealing.
const glassFilterRegion = {
  colorInterpolationFilters: "sRGB",
  height: "1.5",
  width: "1.12",
  x: "-0.06",
  y: "-0.15",
};

// Soft contact shadow and the light the glass focuses into it.
function GlassShadowPrimitives() {
  return (
    <>
      <feGaussianBlur in="SourceAlpha" result="shadowBlur" stdDeviation="9" />
      <feOffset dy="12" in="shadowBlur" result="shadowOffset" />
      <feFlood style={{ floodColor: "var(--glass-shadow)" }} />
      <feComposite in2="shadowOffset" operator="in" result="shadow" />
      <feGaussianBlur in="SourceAlpha" result="causticBlur" stdDeviation="3" />
      <feOffset dy="9" in="causticBlur" result="causticOffset" />
      <feComposite in="causticOffset" in2="SourceAlpha" operator="out" result="causticOut" />
      <feFlood style={{ floodColor: "var(--glass-caustic)" }} />
      <feComposite in2="causticOut" operator="in" result="caustic" />
    </>
  );
}

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
function LiquidGlassFilter({ backLightRef, filterRef, keyLightRef, liquidRef }) {
  return (
    <svg aria-hidden="true" className="absolute size-0" focusable="false">
      <filter id={GLASS_FILTER_ID} ref={filterRef} {...glassFilterRegion}>
        <GlassShadowPrimitives />

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
      <filter id={GLASS_SHADOW_FILTER_ID} {...glassFilterRegion}>
        <GlassShadowPrimitives />
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="caustic" />
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

// Pre-renders the finished word through the full glass filter (without its
// shadow, which stays live) into a bitmap URL, cached per word until replaced. The full filter is too expensive to
// re-run on every frame while the strokes draw (long words drop frames and the
// pen stutters), so during drawing this image is revealed by a mask of the
// animated strokes instead. Returns null where the canvas can't be exported.
async function renderGlassImage(svg, filter) {
  const box = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  if (!box.width || !viewBox.width) return null;

  const margin = GLASS_IMAGE_MARGIN;
  const x = viewBox.x - margin;
  const y = viewBox.y - margin;
  const width = viewBox.width + margin * 2;
  const height = viewBox.height + margin * 2;
  const scale =
    Math.min(box.width / viewBox.width, box.height / viewBox.height) *
    Math.min(window.devicePixelRatio || 1, 3);
  const pixelWidth = Math.ceil(width * scale);
  const pixelHeight = Math.ceil(height * scale);

  // Bake the theme colors (CSS vars) and the current pointer-driven lights
  // into a standalone copy of the filter; the shadow layers are left out.
  const filterCopy = filter.cloneNode(true);
  filterCopy.id = "glass";
  const floods = filter.querySelectorAll("feFlood");
  filterCopy.querySelectorAll("feFlood").forEach((flood, i) => {
    flood.removeAttribute("style");
    flood.setAttribute("flood-color", getComputedStyle(floods[i]).floodColor);
  });
  filterCopy
    .querySelectorAll('feMergeNode[in="shadow"], feMergeNode[in="caustic"]')
    .forEach((n) => {
      n.remove();
    });

  const paths = [...svg.querySelectorAll("path")]
    .filter((path) => !path.closest("mask"))
    .map((path) => `<path d="${path.getAttribute("d")}"/>`)
    .join("");
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelWidth}" height="${pixelHeight}" viewBox="${x} ${y} ${width} ${height}">${new XMLSerializer().serializeToString(filterCopy)}<g filter="url(#glass)" fill="none" stroke="#000" stroke-linecap="round" stroke-width="${svg.getAttribute("stroke-width")}">${paths}</g></svg>`;

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;
  canvas.getContext("2d").drawImage(image, 0, 0, pixelWidth, pixelHeight);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve));
  // toBlob throws (rejecting this promise) if the browser taints the canvas.
  if (!blob) return null;

  return {
    filter: `url(#${GLASS_SHADOW_FILTER_ID})`,
    height,
    href: URL.createObjectURL(blob),
    width,
    x,
    y,
  };
}

export default function HelloAnimation() {
  const [index, setIndex] = useState(null);
  const [preparingIndex, setPreparingIndex] = useState(0);
  const [drawnKey, setDrawnKey] = useState(null);
  const drawnKeyRef = useRef(null);
  const imagesRef = useRef(new Map());
  const boxRef = useRef(null);
  const keyLightRef = useRef(null);
  const backLightRef = useRef(null);
  const liquidRef = useRef(null);
  const filterRef = useRef(null);
  usePointerLight(boxRef, keyLightRef, backLightRef, liquidRef);

  const current = index === null ? null : HELLOS[index];
  const preparing = preparingIndex === null ? null : HELLOS[preparingIndex];

  // Each word is first mounted invisibly to pre-render its glass image, while
  // nothing on screen moves (on load, or during the pause after the previous
  // word), so the rasterization never stalls a drawing. Then it is shown.
  const prepareRef = useCallback(
    (svg) => {
      if (!svg || preparingIndex === null) return;
      let cancelled = false;
      const startedAt = performance.now();
      const { key } = HELLOS[preparingIndex];
      const show = () => {
        if (cancelled) return;
        const wait = index === null ? 0 : NEXT_HELLO_DELAY - (performance.now() - startedAt);
        setTimeout(
          () => {
            if (cancelled) return;
            setPreparingIndex(null);
            setIndex(preparingIndex);
          },
          Math.max(0, wait),
        );
      };
      renderGlassImage(svg, filterRef.current)
        .then((image) => {
          const previous = imagesRef.current.get(key);
          if (previous) URL.revokeObjectURL(previous.href);
          if (image) imagesRef.current.set(key, image);
          else imagesRef.current.delete(key);
        })
        .catch(() => imagesRef.current.delete(key))
        .finally(show);
      return () => {
        cancelled = true;
      };
    },
    [index, preparingIndex],
  );

  useEffect(() => {
    const images = imagesRef.current;
    return () => {
      for (const image of images.values()) URL.revokeObjectURL(image.href);
    };
  }, []);

  // While a word draws, show its pre-rendered glass image (see renderGlassImage);
  // once drawn, switch back to the live filter so it reacts to the pointer.
  const reveal =
    current && drawnKey !== current.key ? (imagesRef.current.get(current.key) ?? null) : null;

  return (
    <div className={cn("flex items-start justify-center", glassThemeClass)}>
      <LiquidGlassFilter
        backLightRef={backLightRef}
        filterRef={filterRef}
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
        {preparing && (
          <div aria-hidden="true" className="invisible absolute inset-0">
            <preparing.Effect
              className={helloEffectClass}
              key={preparing.key}
              ref={prepareRef}
              strokeWidth={GLASS_STROKE_WIDTH}
            />
          </div>
        )}
        {/* "wait" fades the previous hello out before the next one starts, so two
            translucent glass layers never overlap mid-swap. */}
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              animate={{ opacity: 1 }}
              className="absolute inset-0"
              exit={{ opacity: 0 }}
              initial={{ opacity: 1 }}
              key={current.key}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <current.Effect
                className={helloEffectClass}
                exit={undefined}
                glass={{
                  filter: `url(#${GLASS_FILTER_ID})`,
                  maskId: GLASS_MASK_ID,
                  maskStrokeWidth: GLASS_STROKE_WIDTH + 4,
                  reveal,
                }}
                onAnimationComplete={() => {
                  // Fires once per stroke copy (mask + visible), so only act once.
                  if (drawnKeyRef.current === current.key) return;
                  drawnKeyRef.current = current.key;
                  setDrawnKey(current.key);
                  setPreparingIndex((index + 1) % HELLOS.length);
                }}
                strokeWidth={GLASS_STROKE_WIDTH}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
