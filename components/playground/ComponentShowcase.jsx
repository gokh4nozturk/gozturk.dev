"use client";

import { cn } from "@lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      aria-label="Copy import"
      className="shrink-0 text-neutral-400 transition-colors hover:text-p3-text dark:hover:text-p3-text-dark"
      onClick={copy}
      type="button"
    >
      {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
    </button>
  );
}

/**
 * Doc-style showcase card: title, description, copyable import snippet and a
 * live preview area. Mirrors the registry/playground layout.
 */
export function ComponentShowcase({ title, description, code, children, className }) {
  return (
    <section className={cn("w-full", className)}>
      <h2 className="font-semibold text-lg text-p3-text dark:text-p3-text-dark">{title}</h2>
      {description && <p className="mt-1 text-neutral-400 text-sm">{description}</p>}

      {code && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-p3-border bg-p3-background-light px-3 py-2.5 dark:border-p3-border-dark dark:bg-p3-background-dark">
          <code className="overflow-x-auto whitespace-nowrap font-mono text-xs">
            <span className="text-purple-500 dark:text-purple-400">import </span>
            <span className="text-p3-text dark:text-p3-text-dark">{"{ "}</span>
            <span className="text-sky-600 dark:text-sky-400">{title}</span>
            <span className="text-p3-text dark:text-p3-text-dark">{" } "}</span>
            <span className="text-purple-500 dark:text-purple-400">from </span>
            <span className="text-amber-600 dark:text-amber-400">{code}</span>
          </code>
          <CopyButton value={`import { ${title} } from ${code}`} />
        </div>
      )}

      <div className="mt-4 rounded-xl border border-p3-border bg-p3-background-light p-5 dark:border-p3-border-dark dark:bg-p3-background-dark">
        {children}
      </div>
    </section>
  );
}
