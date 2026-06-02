import { TocMinimap } from "@components/blog/TocMinimap";
import {
  Education,
  Experience,
  Header,
  OpenSourceContributions,
  Projects,
  ResumeFooter,
  Summary,
  TechnicalSkills,
} from "@components/resume";

const resumeToc = [
  { depth: 2, title: "Summary", url: "#summary" },
  { depth: 2, title: "Experience", url: "#experience" },
  { depth: 2, title: "Projects", url: "#projects" },
  { depth: 2, title: "Open Source", url: "#open-source-contributions" },
  { depth: 2, title: "Education", url: "#education" },
  { depth: 2, title: "Technical Skills", url: "#technical-skills" },
];

export default function ResumePage() {
  return (
    <div className="relative mx-auto max-w-2xl">
      <TocMinimap items={resumeToc} />
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <Header />
        <Summary />
        <Experience />
        <Projects />
        <OpenSourceContributions />
        <Education />
        <TechnicalSkills />
        <ResumeFooter />
      </article>
    </div>
  );
}
