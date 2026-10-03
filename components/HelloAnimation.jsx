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

// Fill a fixed-size box and let each SVG's intrinsic preserveAspectRatio
// center the glyph inside it. Keeping the box constant across every language
// is what prevents layout shift (CLS): the scripts have very different widths,
// so sizing by width would make the centered element jump on every swap.
// Every SVG shares the same viewBox height (279, room for the j/р descenders)
// and baseline, so all languages render at the same scale, stroke weight and
// baseline instead of descender scripts (French/Russian) shrinking to fit.
const helloEffectClass = "h-full w-full";

export default function HelloAnimation() {
  const [onViewHello, setOnViewHello] = useState("english");
  return (
    <div className="flex items-start justify-center">
      {/* Fixed-size, stable box: both width and height stay constant across every
          language, so the glyph never shifts (no CLS). Each SVG fills this exact
          box and its own preserveAspectRatio ("xMidYMid meet") scales + centers
          the glyph inside. Height includes descender room below the baseline.
          max-w caps it on desktop; w-full keeps it responsive and overflow-free
          on narrow viewports. */}
      <div className={cn("relative h-22 w-full max-w-104 overflow-hidden sm:h-28")}>
        <AnimatePresence mode="popLayout">
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="english"
            transition={{ delay: 0.1, duration: 0.2, ease: "easeInOut" }}
          >
            {onViewHello === "english" && (
              <AppleHelloEnglishEffect
                className={helloEffectClass}
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("turkish"), 800);
                }}
              />
            )}
            {onViewHello === "turkish" && (
              <AppleHelloTurkishEffect
                className={helloEffectClass}
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("french"), 800);
                }}
              />
            )}
            {onViewHello === "french" && (
              <AppleHelloFrenchEffect
                className={helloEffectClass}
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("spanish"), 800);
                }}
              />
            )}
            {onViewHello === "spanish" && (
              <AppleHelloSpanishEffect
                className={helloEffectClass}
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("vietnamese"), 800);
                }}
              />
            )}
            {onViewHello === "vietnamese" && (
              <AppleHelloVietnameseEffect
                className={helloEffectClass}
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("russian"), 800);
                }}
              />
            )}
            {onViewHello === "russian" && (
              <AppleHelloRussianEffect
                className={helloEffectClass}
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("japanese"), 800);
                }}
              />
            )}
            {onViewHello === "japanese" && (
              <AppleHelloJapaneseEffect
                className={helloEffectClass}
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("english"), 800);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
