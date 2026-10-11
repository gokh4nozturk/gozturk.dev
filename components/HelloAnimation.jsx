"use client";

import {
  AppleHelloEnglishEffect,
  AppleHelloFrenchEffect,
  AppleHelloJapaneseEffect,
  AppleHelloRussianEffect,
  AppleHelloSpanishEffect,
  AppleHelloTurkishEffect,
  AppleHelloVietnameseEffect,
  HELLO_WORDS,
} from "@components/apple-hello";
import { HelloGlassRenderer } from "@components/hello-glass-renderer";
import { cn } from "@lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const NEXT_HELLO_DELAY = 0.8; // seconds a finished word stays before fading
const FADE_OUT_DURATION = 0.3; // seconds
const CANVAS_MARGIN = 24; // CSS px the glass may reach past the box (stroke, shadow)
const KEY_LIGHT_AZIMUTH = 225; // degrees, screen space: light from the top-left

// Theme-aware glass tints, read from these CSS vars when the theme changes.
const glassThemeClass = cn(
  "[--glass-body:rgb(255_255_255/0.25)] [--glass-caustic:rgb(255_255_255/0.9)] [--glass-edge:rgb(20_30_50/0.55)] [--glass-liquid:rgb(0_0_0/0.45)] [--glass-rim:rgb(255_255_255/0.95)] [--glass-shadow:rgb(20_30_50/0.22)]",
  "dark:[--glass-body:rgb(255_255_255/0.05)] dark:[--glass-caustic:rgb(255_255_255/0.12)] dark:[--glass-edge:rgb(255_255_255/0.3)] dark:[--glass-liquid:rgb(0_0_0/0.3)] dark:[--glass-rim:rgb(255_255_255/0.6)] dark:[--glass-shadow:rgb(0_0_0/0.5)]",
);

function readTheme(element) {
  const style = getComputedStyle(element);
  const ctx = document.createElement("canvas").getContext("2d");
  // Let the canvas normalize any CSS color to "#rrggbb" or "rgba(r, g, b, a)".
  const color = (name) => {
    ctx.fillStyle = "transparent";
    ctx.fillStyle = style.getPropertyValue(name).trim() || "transparent";
    const value = ctx.fillStyle;
    if (value.startsWith("#")) {
      return [1, 3, 5].map((i) => Number.parseInt(value.slice(i, i + 2), 16) / 255).concat(1);
    }
    const [r, g, b, a = 1] = value.match(/[\d.]+/g).map(Number);
    return [r / 255, g / 255, b / 255, a];
  };
  return {
    body: color("--glass-body"),
    caustic: color("--glass-caustic"),
    edge: color("--glass-edge"),
    liquid: color("--glass-liquid"),
    rim: color("--glass-rim"),
    shadow: color("--glass-shadow"),
  };
}

// Draws the hellos one after another as Liquid Glass with WebGL (see
// hello-glass-renderer). Calls onWordChange as each word starts, and onError if
// WebGL is unavailable or its context is lost.
function useHelloGlass(boxRef, canvasRef, enabled, onWordChange, onError) {
  useEffect(() => {
    if (!enabled) return;
    const box = boxRef.current;
    const canvas = canvasRef.current;
    let renderer;
    try {
      renderer = new HelloGlassRenderer(canvas);
    } catch {
      onError();
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let theme = readTheme(box);
    let wordIndex = 0;
    let wordStart = 0;
    let doneAt = null;
    let frame = 0;
    let inView = true;
    const light = { azimuth: KEY_LIGHT_AZIMUTH, shift: [0, 0] };
    const target = { azimuth: KEY_LIGHT_AZIMUTH, shift: [0, 0] };

    const startWord = (index) => {
      wordIndex = index;
      wordStart = performance.now();
      doneAt = null;
      renderer.setWord(HELLO_WORDS[index]);
      onWordChange(HELLO_WORDS[index]);
    };

    const tick = (now) => {
      frame = 0;
      const done = renderer.drawStrokes((now - wordStart) / 1000);
      if (done && doneAt === null) doneAt = now;

      let opacity = 1;
      if (doneAt !== null) {
        const fade = ((now - doneAt) / 1000 - NEXT_HELLO_DELAY) / FADE_OUT_DURATION;
        if (fade >= 1) {
          startWord((wordIndex + 1) % HELLO_WORDS.length);
          renderer.drawStrokes(0);
        } else if (fade > 0) {
          opacity = 1 - fade;
        }
      }

      // Ease the lights and the liquid toward the pointer so the glass feels fluid.
      const turn = ((((target.azimuth - light.azimuth + 180) % 360) + 360) % 360) - 180;
      light.azimuth += turn * 0.12;
      light.shift[0] += (target.shift[0] - light.shift[0]) * 0.08;
      light.shift[1] += (target.shift[1] - light.shift[1]) * 0.08;

      renderer.render({
        keyAzimuth: light.azimuth,
        liquidShift: light.shift,
        opacity,
        theme,
        time: reduceMotion ? 0 : now / 1000,
      });
      frame = requestAnimationFrame(tick);
    };

    // Pause while scrolled out of view or in a background tab; restart the
    // current word when it comes back instead of jumping to its end.
    const updatePlayback = () => {
      const playing = inView && document.visibilityState === "visible";
      if (playing && !frame) {
        startWord(wordIndex);
        frame = requestAnimationFrame(tick);
      } else if (!playing && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const resize = () => {
      const { width, height } = box.getBoundingClientRect();
      renderer.resize(width, height, CANVAS_MARGIN, Math.min(window.devicePixelRatio || 1, 3));
    };

    const onPointerMove = (event) => {
      const rect = box.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      target.azimuth = (Math.atan2(dy, dx) * 180) / Math.PI;
      // Liquid shift is in GL space, where y points up.
      target.shift = [(dx / window.innerWidth) * -300, (dy / window.innerHeight) * 60];
    };

    const onContextLost = (event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      frame = 0;
      onError();
    };

    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updatePlayback();
    });
    const resizeObserver = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(() => {
      theme = readTheme(box);
    });

    resize();
    updatePlayback();
    intersection.observe(box);
    resizeObserver.observe(box);
    themeObserver.observe(document.documentElement, { attributeFilter: ["class", "style"] });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", updatePlayback);
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", updatePlayback);
      canvas.removeEventListener("webglcontextlost", onContextLost);
    };
  }, [boxRef, canvasRef, enabled, onWordChange, onError]);
}

const FALLBACK_EFFECTS = [
  AppleHelloEnglishEffect,
  AppleHelloTurkishEffect,
  AppleHelloFrenchEffect,
  AppleHelloSpanishEffect,
  AppleHelloVietnameseEffect,
  AppleHelloRussianEffect,
  AppleHelloJapaneseEffect,
];

// Plain SVG hellos for browsers without WebGL.
function HelloSvgFallback() {
  const [index, setIndex] = useState(0);
  const Effect = FALLBACK_EFFECTS[index];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ opacity: 1 }}
        className="absolute inset-0"
        exit={{ opacity: 0 }}
        initial={{ opacity: 1 }}
        key={index}
        transition={{ duration: FADE_OUT_DURATION, ease: "easeInOut" }}
      >
        <Effect
          className="h-full w-full"
          onAnimationComplete={() => {
            setTimeout(
              () => setIndex((i) => (i + 1) % FALLBACK_EFFECTS.length),
              NEXT_HELLO_DELAY * 1000,
            );
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default function HelloAnimation() {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [title, setTitle] = useState(HELLO_WORDS[0].title);
  const { onError, onWordChange } = useRef({
    onError: () => setFailed(true),
    onWordChange: (word) => setTitle(word.title),
  }).current;
  useHelloGlass(boxRef, canvasRef, !failed, onWordChange, onError);

  return (
    <div className={cn("flex items-start justify-center", glassThemeClass)}>
      {/* Fixed-size, stable box: both width and height stay constant across every
          language, so the glyph never shifts (no CLS). Each word is scaled to fit
          and centered in it; the height includes descender room below the
          baseline. max-w caps it on desktop; w-full keeps it responsive on narrow
          viewports. The canvas overhangs the box so the glass (stroke, shadow)
          isn't clipped. */}
      <div className="relative h-22 w-full max-w-104 sm:h-28" ref={boxRef}>
        {failed ? (
          <HelloSvgFallback />
        ) : (
          <canvas
            aria-label={title}
            className="pointer-events-none absolute"
            ref={canvasRef}
            role="img"
            style={{
              height: `calc(100% + ${CANVAS_MARGIN * 2}px)`,
              left: -CANVAS_MARGIN,
              top: -CANVAS_MARGIN,
              width: `calc(100% + ${CANVAS_MARGIN * 2}px)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
