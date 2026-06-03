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
// is what prevents layout shift (CLS): the scripts have very different widths
// (Spanish ~225px vs Turkish ~414px at this height), so sizing by height alone
// would make the centered element jump horizontally on every swap.
const helloEffectClass = "h-full w-full";

export default function HelloAnimation() {
  const [onViewHello, setOnViewHello] = useState("english");
  return (
    <div className="flex items-start justify-center">
      {/* Fixed-size, stable box: width never changes between languages, so the
          centered glyph never shifts horizontally. max-w caps it on desktop to
          fit the widest script (Turkish ~414px); w-full keeps it responsive and
          overflow-free on narrow viewports. */}
      <div
        className={cn("h-16 w-full max-w-104 overflow-hidden sm:h-20", "grid place-items-center")}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            animate={{ opacity: 1 }}
            className="h-full w-full"
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
