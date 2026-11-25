"use client";

import { cn } from "@lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

const PREVIEW_MAX = 240; // px, longest side of the preview
const FALLBACK_RATIO = 10 / 16; // height / width when the image size is unknown

// Wraps a link and floats an image above it while hovered or focused.
// Pass width/height when known so the preview keeps the image's shape.
export default function HoverPreview({
  src,
  alt = "",
  width: naturalWidth,
  height: naturalHeight,
  color,
  unoptimized = false,
  className,
  children,
}) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion();

  if (!src || failed) return children;

  const ratio = naturalWidth && naturalHeight ? naturalHeight / naturalWidth : FALLBACK_RATIO;
  const width = Math.round(ratio > 1 ? PREVIEW_MAX / ratio : PREVIEW_MAX);
  const height = Math.round(width * ratio);
  const hidden = reduceMotion
    ? { opacity: 0 }
    : { filter: "blur(4px)", opacity: 0, rotate: -2, scale: 0.92, y: 8 };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: mirrors hover/focus of the link inside; the preview is decorative
    <span
      className={cn("relative flex min-w-0", className)}
      onBlur={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            animate={{ filter: "blur(0px)", opacity: 1, rotate: 2, scale: 1, y: 0 }}
            className={cn(
              "pointer-events-none absolute bottom-full left-0 z-40 mb-3 block overflow-hidden rounded-xl",
              "border border-p3-border bg-p3-background-light shadow-xl dark:border-p3-border-dark dark:bg-p3-background-dark",
            )}
            exit={hidden}
            initial={hidden}
            style={{ backgroundColor: color, transformOrigin: "bottom left" }}
            transition={{ damping: 24, stiffness: 320, type: "spring" }}
          >
            <Image
              alt={alt}
              className="block object-cover"
              height={height}
              onError={() => setFailed(true)}
              sizes={`${width}px`}
              src={src}
              style={{ height, width }}
              unoptimized={unoptimized}
              width={width}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
