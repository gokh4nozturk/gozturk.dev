import { summary } from "@lib/resume-data";
import { User } from "lucide-react";

export function Summary() {
  return (
    <section id="summary">
      <h2 className="mb-4 flex items-center gap-2 border-gray-500 border-b pb-1 font-semibold text-gray-900 text-xl dark:border-gray-800 dark:text-white">
        <User size={20} />
        Summary
      </h2>
      <p className="text-gray-600 dark:text-gray-300">{summary.text}</p>
    </section>
  );
}
