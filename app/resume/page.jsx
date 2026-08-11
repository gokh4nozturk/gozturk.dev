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
  { depth: 3, title: "Rockads", url: "#rockads" },
  { depth: 3, title: "Phanka Group", url: "#phanka-group" },
  { depth: 2, title: "Projects", url: "#projects" },
  { depth: 3, title: "Rocket UI", url: "#rocket-ui" },
  { depth: 3, title: "Linguolink", url: "#linguolink" },
  { depth: 3, title: "Chop-URL", url: "#chop-url" },
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
