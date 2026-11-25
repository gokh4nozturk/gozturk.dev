export default function About() {
  return (
    <section className="grid gap-5">
      {/* The hand waves while the line is hovered (or tapped on touch screens). */}
      <p className="group font-semibold text-2xl sm:text-4xl">
        Hi
        <span
          aria-hidden="true"
          className="mx-[0.22em] inline-block origin-[70%_70%] group-hover:animate-wave group-active:animate-wave motion-reduce:animate-none"
        >
          👋
        </span>
        my name is Gökhan, a software engineer.
      </p>
      <p className="max-w-[62ch] text-base text-p3-text-light sm:text-lg">
        I am an enthusiast for well-designed products, free & open source software contributor &
        maintainer, and automator of anything that I can. By day I build product features end to
        end; on the side I ship my own iOS apps and SaaS tools.
      </p>
    </section>
  );
}
