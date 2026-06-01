import About from "@components/About";
import HelloAnimation from "@components/HelloAnimation";
import Now from "@components/Now";

export default function Home() {
  return (
    <div className="flex h-full flex-col justify-between">
      <About />
      <HelloAnimation />
      <Now />
    </div>
  );
}
