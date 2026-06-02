import { technicalSkills } from "@lib/resume-data";
import { Settings } from "lucide-react";

export function TechnicalSkills() {
  return (
    <section id="technical-skills">
      <h2 className="mt-8 mb-4 flex items-center gap-2 border-gray-500 border-b pb-1 font-semibold text-gray-900 text-xl dark:border-gray-800 dark:text-white">
        <Settings size={20} />
        Technical Skills
      </h2>

      <ul className="list-disc pl-4 text-gray-600 dark:text-gray-300">
        {technicalSkills.map((skill) => (
          <li key={skill.category}>
            <strong className="text-gray-900 dark:text-white">{skill.category}:</strong>{" "}
            {skill.skills}
          </li>
        ))}
      </ul>
    </section>
  );
}
