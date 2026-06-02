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

// Shrink the SVG height on mobile (and cap its width) so the wider scripts
// (e.g. Turkish/Spanish/Vietnamese) never overflow narrow viewports.
const helloEffectClass = "h-16 sm:h-20";

export default function HelloAnimation() {
  const [onViewHello, setOnViewHello] = useState("english");
  return (
    <div className="flex items-start justify-center">
      <div className={cn("max-w-full overflow-hidden", "grid place-items-center")}>
        <AnimatePresence mode="popLayout">
          <motion.div
            animate={{ opacity: 1 }}
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
