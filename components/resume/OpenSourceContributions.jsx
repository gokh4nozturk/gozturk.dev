import { openSourceContributions } from "@lib/resume-data";
import { GitBranch } from "lucide-react";

function ContributionItem({ contribution, isFirst, isLast }) {
  const titleClass = isLast
    ? "my-1 mb-1 font-medium text-base text-gray-900 dark:text-white"
    : "my-1 font-medium text-base text-gray-900 dark:text-white";

  return (
    <div>
      <h4 className={titleClass}>
        {contribution.title} | {contribution.role}
      </h4>
      <a
        aria-label={`Visit ${contribution.title} project`}
        className="mb-1 inline-block text-blue-600 text-sm hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        href={contribution.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <i>{contribution.displayUrl}</i>
      </a>
      <ul className="list-disc pl-4 text-gray-600 dark:text-gray-300">
        {contribution.achievements.map((achievement, index) => (
          <li key={`${contribution.title}-achievement-${index}`}>{achievement}</li>
        ))}
        <li>
          <strong>Tech stack:</strong> {contribution.techStack}
        </li>
      </ul>
    </div>
  );
}

export function OpenSourceContributions() {
  return (
    <section id="open-source-contributions">
      <h3 className="mt-6 mb-0 flex items-center gap-2 border-gray-500 border-b font-medium text-gray-900 text-lg dark:border-gray-800 dark:text-white">
        <GitBranch size={18} />
        Open Source Contributions
      </h3>
      {openSourceContributions.map((contribution, index) => (
        <ContributionItem
          contribution={contribution}
          isFirst={index === 0}
          isLast={index === openSourceContributions.length - 1}
          key={contribution.title}
        />
      ))}
    </section>
  );
}
