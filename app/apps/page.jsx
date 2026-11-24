import AnimatedLink from "@components/AnimatedLink";
import TitleDescription from "@components/TitleDescription";
import { ScrollArea } from "@components/ui/scroll-area";
import { apps } from "@lib/apps-data";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

export const metadata = {
  description: "iOS apps and games I've built, and how they work under the hood.",
  title: "Apps & games",
};

export default function Apps() {
  return (
    <div className="w-full">
      <TitleDescription
        description="iOS apps and games I've built, and how they work under the hood."
        title="Apps & games"
      />
      <ScrollArea className="mb-24 max-h-[calc(100dvh-15rem)]">
        <div className="grid divide-y divide-p3-border dark:divide-p3-border-dark">
          {apps.map((app) => (
            <AppEntry app={app} key={app.slug} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function AppEntry({ app }) {
  return (
    <article className="scroll-mt-4 py-8 first:pt-2" id={app.slug}>
      <header className="flex items-start gap-4">
        <Image
          alt={`${app.name} app icon`}
          className="size-14 shrink-0 rounded-[14px] border border-p3-border dark:border-p3-border-dark"
          height={56}
          src={app.icon}
          width={56}
        />
        <div className="min-w-0">
          <h2 className="font-semibold text-lg sm:text-xl">{app.name}</h2>
          <p className="text-p3-text-light text-xs sm:text-sm">
            {app.kind} · {app.platforms}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <ExternalLink href={app.appStore} name={`${app.name} on the App Store`}>
              App Store
            </ExternalLink>
            <ExternalLink href={app.website} name={`${app.name} website`}>
              {new URL(app.website).hostname}
            </ExternalLink>
          </div>
        </div>
      </header>

      <p className="mt-4 text-sm sm:text-base">{app.summary}</p>

      <h3 className="mt-5 mb-2 text-p3-text-light text-xs uppercase tracking-wide">
        Under the hood
      </h3>
      <ul className="grid list-disc gap-1.5 pl-5 text-sm marker:text-p3-text-light">
        {app.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <ul className="mt-5 flex flex-wrap gap-1.5">
        {app.stack.map((tech) => (
          <li
            className="rounded-full border border-p3-border px-2.5 py-0.5 text-xs dark:border-p3-border-dark"
            key={tech}
          >
            {tech}
          </li>
        ))}
      </ul>
    </article>
  );
}

function ExternalLink({ href, name, children }) {
  return (
    <AnimatedLink href={href} name={name}>
      {children}
      <ArrowUpRight className="ml-0.5 inline size-3.5 align-[-2px] opacity-60" />
    </AnimatedLink>
  );
}
