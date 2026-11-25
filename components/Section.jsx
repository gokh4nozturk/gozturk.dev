import { cn } from "@lib/utils";
import Link from "next/link";

// Shared wrapper for home page sections: a small label, optional "more" link, content.
export default function Section({ title, icon, more, children, className }) {
  return (
    <section className={cn("w-full", className)}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 font-medium text-p3-text-light text-xs uppercase tracking-wide">
          {icon}
          {title}
        </h2>
        {more && (
          <Link
            className="text-p3-text-light text-xs underline-offset-4 hover:text-p3-text hover:underline dark:hover:text-p3-text-dark"
            href={more.href}
          >
            {more.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
