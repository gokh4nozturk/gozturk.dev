import { cn } from "@lib/utils";
import Link from "next/link";
import { ViewTransition } from "react";

// Shared wrapper for home page sections: a small label, optional "more" link, content.
// more.morph names a view transition shared with the target page's title.
export default function Section({ title, icon, more, children, className }) {
  return (
    <section className={cn("w-full", className)}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="eyebrow flex items-center gap-2 text-p3-text-light">
          {icon}
          {title}
        </h2>
        {more && (
          <ViewTransition name={more.morph} share="morph">
            <Link
              className="meta inline-block text-p3-text-light underline-offset-4 hover:text-p3-text hover:underline dark:hover:text-p3-text-dark"
              href={more.href}
              transitionTypes={["nav-forward"]}
            >
              {more.label} →
            </Link>
          </ViewTransition>
        )}
      </div>
      {children}
    </section>
  );
}
