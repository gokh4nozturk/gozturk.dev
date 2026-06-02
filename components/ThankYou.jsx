"use client";

import { cn } from "@lib/utils";
import Buymeacoffee from "components/icons/buymeacoffee";

export default function ThankYou({ className }) {
  return (
    <a
      className={cn(
        "-mr-2.5 ml-1 flex items-center",
        "rounded-full no-underline transition",
        "bg-p3-accent text-p3-text transition-all",
        "dark:bg-p3-accent/40 dark:text-p3-text-dark",
        className,
        "hover:animate-tada",
      )}
      href="https://www.buymeacoffee.com/gokhanozturk"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/10 sm:size-10">
        <Buymeacoffee />
      </span>
    </a>
  );
}
