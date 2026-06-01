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

export default function HelloAnimation() {
  const [onViewHello, setOnViewHello] = useState("english");
  return (
    <div className="flex items-start justify-center">
      <div
        className={cn(
          "w-min overflow-hidden sm:h-20",
          "grid place-items-center",
        )}
      >
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
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("turkish"), 800);
                }}
              />
            )}
            {onViewHello === "turkish" && (
              <AppleHelloTurkishEffect
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("french"), 800);
                }}
              />
            )}
            {onViewHello === "french" && (
              <AppleHelloFrenchEffect
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("spanish"), 800);
                }}
              />
            )}
            {onViewHello === "spanish" && (
              <AppleHelloSpanishEffect
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("vietnamese"), 800);
                }}
              />
            )}
            {onViewHello === "vietnamese" && (
              <AppleHelloVietnameseEffect
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("russian"), 800);
                }}
              />
            )}
            {onViewHello === "russian" && (
              <AppleHelloRussianEffect
                onAnimationComplete={() => {
                  setTimeout(() => setOnViewHello("japanese"), 800);
                }}
              />
            )}
            {onViewHello === "japanese" && (
              <AppleHelloJapaneseEffect
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
