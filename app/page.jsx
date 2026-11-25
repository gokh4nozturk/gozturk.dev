import About from "@components/About";
import Experience from "@components/Experience";
import Now from "@components/Now";
import RecentBookmarks from "@components/RecentBookmarks";
import SelectedWork from "@components/SelectedWork";

export default function Home() {
  return (
    <div className="flex flex-col gap-14">
      <About />
      <Now />
      <SelectedWork />
      <Experience />
      <RecentBookmarks />
    </div>
  );
}
