import AnimatedLink from "@components/AnimatedLink";
import { Star } from "lucide-react";
import Image from "next/image";

export default function FeaturedWork({ work, stars }) {
  const primaryUrl = work.liveUrl || work.codeUrl;

  return (
    <div className="flex flex-col gap-4 py-6 sm:flex-row sm:gap-6">
      {work.image ? (
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-p3-border sm:w-48">
          <Image
            alt={`${work.name} preview`}
            className="object-cover"
            fill
            sizes="(max-width: 640px) 100vw, 12rem"
            src={work.image}
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full shrink-0 items-center justify-center rounded-lg border border-p3-border bg-p3-background-light sm:w-48">
          <span className="font-medium text-p3-text-light text-sm">{work.name}</span>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <AnimatedLink className="font-medium text-base" href={primaryUrl} name={work.name}>
            {work.name}
          </AnimatedLink>
          <span className="rounded-full border border-p3-border px-2 py-0.5 text-p3-text-light text-xs">
            {work.role}
          </span>
          {typeof stars === "number" && (
            <span className="flex items-center gap-1 text-neutral-400 text-xs">
              <Star size={12} />
              {stars}
            </span>
          )}
        </div>
        <p className="text-p3-text-light text-sm">{work.story}</p>
        <div className="flex flex-wrap gap-2 text-neutral-400 text-xs">
          {work.tags.map((tag) => (
            <span className="rounded bg-p3-background-light px-1.5 py-0.5" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-3 text-sm">
          {work.liveUrl && (
            <AnimatedLink color="blue" href={work.liveUrl} name={`${work.name} live`}>
              live →
            </AnimatedLink>
          )}
          <AnimatedLink href={work.codeUrl} name={`${work.name} code`}>
            code →
          </AnimatedLink>
        </div>
      </div>
    </div>
  );
}
