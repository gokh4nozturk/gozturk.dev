import Section from "@components/Section";
import { experience } from "@lib/resume-data";

export default function Experience() {
  return (
    <Section title="Experience">
      <ol className="grid grid-cols-1 gap-4">
        {experience.map((job) => (
          <li className="flex items-baseline gap-4" key={job.company}>
            <div className="min-w-0">
              <p className="font-medium">{job.company}</p>
              <p className="text-p3-text-light text-sm">{job.title}</p>
            </div>
            <span className="meta ml-auto shrink-0 whitespace-nowrap text-p3-text-light">
              {job.period.replace("Present", "now")}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
