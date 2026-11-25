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

const iconClass =
  "size-11 shrink-0 rounded-[11px] border border-p3-border object-cover dark:border-p3-border-dark";

export default function SelectedWork() {
  return (
    <Section more={{ href: "/apps", label: "all apps", morph: "apps-title" }} title="Latest works">
      <ul className="grid gap-1">
        {apps.map((app) => (
          <li key={app.slug}>
            <Link className={rowClass} href={`/apps#${app.slug}`} transitionTypes={["nav-forward"]}>
              <ViewTransition name={`app-icon-${app.slug}`} share="morph">
                <Image alt="" className={iconClass} height={44} src={app.icon} width={44} />
              </ViewTransition>
              <WorkText description={app.description} kind={app.kind} name={app.name} />
            </Link>
          </li>
        ))}
        {webProjects.map((project) => (
          <li key={project.slug}>
            <a className={rowClass} href={project.href} rel="noreferrer" target="_blank">
              <Image alt="" className={iconClass} height={44} src={project.icon} width={44} />
              <WorkText description={project.description} kind="Web" name={project.name} />
              <ArrowUpRight className="ml-auto size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
            </a>
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
        <span className="text-p3-text-light text-xs">{kind}</span>
      </span>
      <span className="block truncate text-p3-text-light text-sm">{description}</span>
    </span>
  );
}
