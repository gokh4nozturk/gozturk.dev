import AnimatedLink from "@components/AnimatedLink";

export default function About() {
  return (
    <div className="text-sm sm:text-base">
      <p>
        Hi 👋 my name is Gökhan, a software engineer at{" "}
        <AnimatedLink
          color="teknasyon"
          href="https://teknasyon.com/en/?ref=gozturk.dev"
          name="Teknasyon"
        >
          Teknasyon
        </AnimatedLink>
        . I am working on{" "}
        <AnimatedLink
          color="rockads"
          href="https://rockads.com/?ref=gozturk.dev"
          name="rockads.com"
        >
          rockads.com
        </AnimatedLink>{" "}
        and in-house solutions.
      </p>
      <p>
        I am an enthusiast for well-designed products, free & open source software contributor &
        maintainer, and automator of anything that I can.
      </p>
      {/* <br />
      <br />
      <AnimatedLink href="https://cal.com/gokhanozturk/15min" name="Cal.com">
        <span className="inline-flex items-center gap-2">
          {" "}
          meet me at:
          <Calcom className="w-20 pb-1" />
        </span>
      </AnimatedLink> */}
    </div>
  );
}
