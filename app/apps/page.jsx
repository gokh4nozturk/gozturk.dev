import AnimatedLink from "@components/AnimatedLink";
import TitleDescription from "@components/TitleDescription";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { apps, githubProfile, openSource, webProjects } from "@lib/apps-data";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { ViewTransition } from "react";

export const metadata = {
  description: "iOS apps and games I've built, and how they work under the hood.",
  title: "Apps & games",
};

export default function Apps() {
  return (
    <div className="w-full">
      <TitleDescription
        description="iOS apps and games I've built, and how they work under the hood."
        morph="apps-title"
        title="Apps & games"
      />
      <div>
        <div className="grid divide-y divide-p3-border dark:divide-p3-border-dark">
          {apps.map((app) => (
            <AppEntry app={app} key={app.slug} />
          ))}
        </div>

        <section className="mt-8 border-p3-border border-t pt-8 dark:border-p3-border-dark">
          <h2 className="font-semibold text-lg sm:text-xl">Web & open source</h2>
          <p className="mt-1 text-p3-text-light text-sm">
            Products, component libraries and tools for the web.
          </p>
          <ul className="mt-6 grid gap-6">
            {webProjects.map((project) => (
              <WebProjectEntry key={project.slug} project={project} />
            ))}
          </ul>
        </section>

        <section
          className="mt-8 scroll-mt-4 border-p3-border border-t pt-8 dark:border-p3-border-dark"
          id="open-source"
        >
          <h2 className="font-semibold text-lg sm:text-xl">Open source</h2>
          <p className="mt-1 text-p3-text-light text-sm">Libraries I maintain or contribute to.</p>
          <ul className="mt-6 grid gap-5">
            {openSource.map((item) => (
              <OpenSourceEntry item={item} key={item.repo} />
            ))}
          </ul>
        </section>

        <p className="mt-10 border-p3-border border-t pt-8 text-p3-text-light text-sm dark:border-p3-border-dark">
          You can find more on{" "}
          <ExternalLink href={githubProfile} name="GitHub profile">
            <span className="text-p3-text dark:text-p3-text-dark">my GitHub</span>
          </ExternalLink>
        </p>
      </div>
    </div>
  );
}

function AppEntry({ app }) {
  return (
    <article className="scroll-mt-4 py-8 first:pt-2" id={app.slug}>
      <header className="flex items-start gap-4">
        <ViewTransition name={`app-icon-${app.slug}`} share="morph">
          <Image
            alt={`${app.name} app icon`}
            className="size-14 shrink-0 rounded-[14px] border border-p3-border dark:border-p3-border-dark"
            height={56}
            src={app.icon}
            width={56}
          />
        </ViewTransition>
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

      <p className="mt-4 max-w-[62ch] text-base">{app.summary}</p>

      <h3 className="eyebrow mt-6 mb-3 text-p3-text-light">Under the hood</h3>
      <ul className="grid max-w-[68ch] list-disc gap-2.5 pl-5 text-sm leading-6 marker:text-p3-text-light">
        {app.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <ul className="mt-5 flex flex-wrap gap-1.5">
        {app.stack.map((tech) => (
          <li
            className="meta rounded-full border border-p3-border px-2.5 py-0.5 dark:border-p3-border-dark"
            key={tech}
          >
            {tech}
          </li>
        ))}
      </ul>
    </article>
  );
}

function WebProjectEntry({ project }) {
  return (
    <li className="flex scroll-mt-4 items-start gap-4" id={project.slug}>
      <Image
        alt={`${project.name} logo`}
        className="size-14 shrink-0 rounded-[14px] border border-p3-border object-cover dark:border-p3-border-dark"
        height={56}
        src={project.icon}
        width={56}
      />
      <div className="min-w-0">
        <h3 className="font-semibold text-base sm:text-lg">{project.name}</h3>
        <p className="text-p3-text-light text-sm">{project.description}</p>
        <div className="mt-1.5 text-sm">
          <ExternalLink href={project.href} name={`${project.name} website`}>
            {new URL(project.href).hostname}
          </ExternalLink>
        </div>
      </div>
    </li>
  );
}

function OpenSourceEntry({ item }) {
  return (
    <li className="grid gap-1">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-semibold text-base">{item.name}</h3>
        <span className="meta text-p3-text-light">{item.role}</span>
      </div>
      <p className="text-p3-text-light text-sm">{item.description}</p>
      <div className="meta mt-0.5 flex items-center gap-1.5">
        <SiGithub aria-hidden="true" className="opacity-60" color="currentColor" size={12} />
        <ExternalLink href={item.href} name={`${item.name} on GitHub`}>
          {item.repo}
        </ExternalLink>
      </div>
    </li>
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
