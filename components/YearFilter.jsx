"use client";
import { useRouter } from "next/navigation";

export default function YearFilter({ year = "all" }) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  const handleChange = (e) => {
    const selectedYear = e.target.value;

    if (selectedYear === "all") {
      router.push("/bookmarks");
      return;
    }

    router.push(`/bookmarks?year=${selectedYear}`);
  };

  return (
    <div className="relative">
      <select
        className="mt-2 block w-full min-w-24 rounded-md border border-p3-border bg-p3-background-light py-0.5 pl-2 text-sm outline-none transition-colors hover:border-p3-border focus:border-p3-border dark:border-p3-border-dark dark:bg-p3-background-dark dark:focus:border-p3-border-dark dark:hover:border-p3-border-dark"
        defaultValue={year.split("-")[0] || "all"}
        id="year"
        name="year"
        onChange={handleChange}
      >
        <option value="all">All Years</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
