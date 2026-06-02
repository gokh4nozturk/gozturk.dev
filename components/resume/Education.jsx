import { education } from "@lib/resume-data";
import { GraduationCap } from "lucide-react";

export function Education() {
  return (
    <section id="education">
      <h2 className="mt-8 mb-4 flex items-center gap-2 border-gray-500 border-b pb-1 font-semibold text-gray-900 text-xl dark:border-gray-800 dark:text-white">
        <GraduationCap size={20} />
        Education
      </h2>

      {education.map((item) => (
        <div className="mb-6 last:mb-0" key={`${item.institution}-${item.degree}`}>
          <strong className="text-gray-900 dark:text-white">{item.degree}</strong> |{" "}
          {item.institution} |{" "}
          <span className="text-gray-600 dark:text-gray-400">{item.period}</span>
        </div>
      ))}
    </section>
  );
}
