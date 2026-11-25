import Section from "@components/Section";
import { apps, webProjects } from "@lib/apps-data";
import { cn } from "@lib/utils";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

const rowClass = cn(
  "group -mx-3 flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors",
  "hover:bg-p3-background-dark/5 dark:hover:bg-p3-background-light/5",
);

// Newest first: apps, then web projects. The home page shows only the latest few.
const LATEST_COUNT = 3;
const works = [
  ...apps.map((app) => ({ ...app, type: "app" })),
  ...webProjects.map((project) => ({ ...project, kind: "Web", type: "web" })),
].slice(0, LATEST_COUNT);

const iconClass =
  "size-11 shrink-0 rounded-[11px] border border-p3-border object-cover dark:border-p3-border-dark";

export default function SelectedWork() {
  return (
    <Section more={{ href: "/apps", label: "all works", morph: "apps-title" }} title="Latest works">
      <ul className="grid grid-cols-1 gap-1">
        {works.map((work) => (
          <li key={work.slug}>
            {work.type === "app" ? (
              <Link
                className={rowClass}
                href={`/apps#${work.slug}`}
                transitionTypes={["nav-forward"]}
              >
                <ViewTransition name={`app-icon-${work.slug}`} share="morph">
                  <Image alt="" className={iconClass} height={44} src={work.icon} width={44} />
                </ViewTransition>
                <WorkText description={work.description} kind={work.kind} name={work.name} />
              </Link>
            ) : (
              <a className={rowClass} href={work.href} rel="noreferrer" target="_blank">
                <Image alt="" className={iconClass} height={44} src={work.icon} width={44} />
                <WorkText description={work.description} kind={work.kind} name={work.name} />
                <ArrowUpRight className="ml-auto size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
              </a>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function WorkText({ name, kind, description }) {
  return (
    <span className="min-w-0">
      <span className="flex items-baseline gap-2">
        <span className="font-medium">{name}</span>
        <span className="meta text-p3-text-light">{kind}</span>
      </span>
      <span className="block truncate text-p3-text-light text-sm">{description}</span>
    </span>
  );
}
