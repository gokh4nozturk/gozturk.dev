import AnimatedLink from "@components/AnimatedLink";
import { projects } from "@lib/resume-data";
import { Folder } from "lucide-react";

function ProjectItem({ project, isFirst }) {
  const titleClass = isFirst
    ? "mb-0 font-medium text-gray-900 text-lg dark:text-white"
    : "mt-6 mb-0 font-medium text-gray-900 text-lg dark:text-white";

  return (
    <div>
      <h3 className={titleClass}>
        {project.title} | {project.role}
      </h3>
      <a
        aria-label={`Visit ${project.title} project`}
        className="mb-1 inline-block text-blue-600 text-sm hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        href={project.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <i>{project.displayUrl}</i>
      </a>
      <ul className="list-disc pl-4 text-gray-600 dark:text-gray-300">
        {project.achievements.map((achievement, index) => (
          <li key={`${project.title}-achievement-${index}`}>
            {achievement ===
            "Rocket UI is actively used across all Rockads projects to ensure consistent UI and improve development efficiency" ? (
              <strong>
                Rocket UI is actively used across all{" "}
                <AnimatedLink color="rockads" href={project.rockadsLink} name="Rockads">
                  Rockads
                </AnimatedLink>{" "}
                projects to ensure consistent UI and improve development efficiency
              </strong>
            ) : (
              achievement
            )}
          </li>
        ))}
        <li>
          <strong>Tech stack:</strong> {project.techStack}
        </li>
      </ul>
    </div>
  );
}

export function Projects() {
  return (
    <section id="projects">
      <h2 className="mt-8 mb-4 flex items-center gap-2 border-gray-500 border-b pb-1 font-semibold text-gray-900 text-xl dark:border-gray-800 dark:text-white">
        <Folder size={20} />
        Open Source & Projects
      </h2>
      {projects.map((project) => (
        <ProjectItem isFirst={project === projects[0]} key={project.title} project={project} />
      ))}
    </section>
  );
}
