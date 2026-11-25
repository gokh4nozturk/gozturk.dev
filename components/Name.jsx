import { cn } from "@lib/utils";

export function NameTransition() {
  return (
    <h1 className="font-medium text-xl transition-element sm:text-2xl">
      <span className="sr-only">Gökhan Öztürk</span>
      <span aria-hidden="true" className="group relative block overflow-hidden">
        <span
          className={cn(
            "inline-block transition-all duration-300 ease-in-out group-hover:-translate-y-full",
          )}
        >
          {/* these '123' suffix for second word, because they are not same length */}
          {"Gökhan Öztürk123".split("").map((letter) => (
            <span
              className={cn("inline-block", `group-hover:delay-[${letter.charCodeAt(0) * 25}ms]`)}
              key={`name-${Math.random().toString(36).substr(2, 9)}`}
            >
              {letter === " " || ["1", "2", "3"].includes(letter) ? "\u00A0" : letter}
            </span>
          ))}
        </span>
        <span
          className={cn(
            "absolute top-0 left-0 inline-block translate-y-full transition-all duration-300 ease-in-out group-hover:translate-y-0",
          )}
        >
          {Array.from("👻 Witchcraft 🕸️").map((letter) => (
            <span
              className="inline-block"
              key={`witch-${Math.random().toString(36).substr(2, 9)}`}
              style={{ transitionDelay: `${letter.charCodeAt(0) * 25}ms` }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </span>
      </span>
    </h1>
  );
}
