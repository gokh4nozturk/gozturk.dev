import { cn } from "@lib/utils";

export default function AnimatedLink({
  children,
  color = "black",
  href = "#",
  name = "Link",
  className,
}) {
  const textColor = {
    black: "sm:hover:text-gray-900 sm:dark:hover:text-gray-200",
    blue: "hover:text-blue-600 dark:hover:text-blue-400",
    rockads: "sm:hover:text-[#007CE1]",
    teknasyon: "sm:hover:text-[#009cfb]",
  }[color];
  const fromColor = {
    black: "from-gray-900 dark:from-gray-200",
    blue: "from-blue-600 dark:from-blue-400",
    rockads: "from-[#007CE1]",
    teknasyon: "from-[#009cfb]",
  }[color];
  const toColor = {
    black: "to-gray-900 dark:to-gray-200",
    blue: "to-blue-600 dark:to-blue-400",
    rockads: "to-[#007CE1]",
    teknasyon: "to-[#009cfb]",
  }[color];

  return (
    <a
      aria-label={`Link to external website of ${name}`}
      className={cn(
        "group no-underline transition-all duration-300 ease-in-out",
        textColor,
        className,
      )}
      href={href}
      name={name}
      rel="noreferrer"
      target="_blank"
      title={name}
    >
      <span
        className={cn(
          "bg-gradient-to-r",
          fromColor,
          toColor,
          "bg-[length:0%_1px] bg-left-bottom bg-no-repeat",
          "transition-all duration-500 ease-out",
          "group-hover:bg-[length:100%_1px] max-sm:bg-[length:100%_1px]",
        )}
      >
        {children}
      </span>
    </a>
  );
}
