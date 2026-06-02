import AnimatedLink from "@components/AnimatedLink";
import { experience } from "@lib/resume-data";
import { Briefcase } from "lucide-react";

function ExperienceItem({ item, isFirst }) {
  const titleClass = isFirst
    ? "mb-0 font-medium text-gray-900 text-lg dark:text-white"
    : "mt-6 mb-0 font-medium text-gray-900 text-lg dark:text-white";

  return (
    <div>
      <h3 className={titleClass}>
        {item.title} | {item.company}
      </h3>
      <p className="mb-2 text-gray-600 text-sm dark:text-gray-400">
        {item.period} | {item.location}
      </p>
      <ul className="list-disc pl-4 text-gray-600 dark:text-gray-300">
        {item.achievements.map((achievement, index) => (
          <li key={`${item.company}-achievement-${index}`}>
            {achievement ===
            "Developed and maintained Rocket UI, a modern UI component library." ? (
              <>
                Developed and maintained{" "}
                <AnimatedLink className="no-underline" href={item.rocketUiLink}>
                  Rocket UI
                </AnimatedLink>
                , a modern UI component library.
              </>
            ) : (
              achievement
            )}
          </li>
        ))}
        <li>
          <strong>Tech stack:</strong> {item.techStack}
        </li>
      </ul>
    </div>
  );
}

export function Experience() {
  return (
    <section id="experience">
      <h2 className="mt-8 mb-4 flex items-center gap-2 border-gray-500 border-b pb-1 font-semibold text-gray-900 text-xl dark:border-gray-800 dark:text-white">
        <Briefcase size={20} />
        Professional Experience
      </h2>
      {experience.map((item, index) => (
        <ExperienceItem isFirst={index === 0} item={item} key={`${item.company}-${item.period}`} />
      ))}
    </section>
  );
}
