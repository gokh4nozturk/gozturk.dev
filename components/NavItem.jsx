"use client";
import { cn } from "@lib/utils";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

function NavItem({ href, name }) {
  const pathname = usePathname() || "/";
  const isActive = pathname === href;

  return (
    <NextLink
      className={cn(
        isActive
          ? "font-medium text-p3-text dark:text-p3-text-dark"
          : "group font-normal text-p3-text-light dark:text-p3-text-light",
        "mr-4 text-sm transition-all duration-300 ease-in-out sm:text-base",
      )}
      href={href}
      key={name}
    >
      <span
        className={cn(
          isActive && "bg-[length:100%_1px] dark:from-p3-text-dark dark:to-p3-text-dark",
          "bg-[length:0%_1px] bg-gradient-to-r bg-left-bottom from-p3-text to-p3-text bg-no-repeat pb-0.5",
          "transition-all duration-500 ease-out",
          "sm:group-hover:bg-[length:100%_1px] dark:from-p3-text-light dark:to-p3-text-light",
        )}
      >
        {name}
      </span>
    </NextLink>
  );
}

export default NavItem;
