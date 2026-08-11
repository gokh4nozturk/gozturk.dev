import AnimatedLink from "@components/AnimatedLink";

export default function About() {
  return (
    <div className="text-sm sm:text-base">
      <p>
        Hi 👋 my name is Gökhan, a product engineer at{" "}
        <AnimatedLink color="rockads" href="https://rockads.com/?ref=gozturk.dev" name="Rockads">
          Rockads
        </AnimatedLink>
        , part of{" "}
        <AnimatedLink
          color="teknasyon"
          href="https://teknasyon.com/en/?ref=gozturk.dev"
          name="Teknasyon"
        >
          Teknasyon
        </AnimatedLink>
        .
      </p>
      <p>
        I am an enthusiast for well-designed products, free & open source software contributor &
        maintainer, and automator of anything that I can.
      </p>
      <div className="mt-6">
        <p className="mb-2 text-p3-text-light">Selected work</p>
        <ul className="grid gap-1">
          <li>
            <AnimatedLink href="https://linguolink.dev" name="Linguolink">
              Linguolink
            </AnimatedLink>
            <span className="text-p3-text-light">
              {" "}
              — localization platform, dashboard + REST API
            </span>
          </li>
          <li>
            <AnimatedLink href="https://rocket.gozturk.dev" name="rocket">
              rocket
            </AnimatedLink>
            <span className="text-p3-text-light"> — my own shadcn component registry</span>
          </li>
          <li>
            <AnimatedLink href="https://gokh4nozturk.github.io/orbit-absorb/" name="orbit-absorb">
              orbit-absorb
            </AnimatedLink>
            <span className="text-p3-text-light">
              {" "}
              — dependency-free orbiting-icons web component
            </span>
          </li>
          <li>
            <AnimatedLink href="https://gauge.gozturk.dev" name="gauge">
              gauge
            </AnimatedLink>
            <span className="text-p3-text-light">
              {" "}
              — customizable circular gauge component for Vue
            </span>
          </li>
        </ul>
      </div>
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
