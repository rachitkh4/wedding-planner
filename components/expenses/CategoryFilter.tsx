"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function CategoryFilter({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      defaultValue={searchParams.get("category") ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-sm text-ink/70 outline-none focus:border-maroon"
    >
      <option value="">All categories</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
