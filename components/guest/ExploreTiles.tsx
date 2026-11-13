import Link from "next/link";
import { BookHeart, HandHeart, Users } from "lucide-react";
import type { Dict } from "@/lib/i18n";

export function ExploreTiles({ t }: { t: Dict }) {
  const tiles = [
    { href: "/g/story", label: t.explore.story, icon: BookHeart },
    { href: "/g/families", label: t.explore.families, icon: Users },
    { href: "/g/blessings", label: t.explore.blessings, icon: HandHeart },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-2 rounded-3xl border border-marigold/40 bg-white/85 px-2 py-4 text-center text-base font-semibold leading-tight text-maroon shadow-sm active:scale-95"
        >
          <Icon size={30} className="text-marigold" />
          {label}
        </Link>
      ))}
    </div>
  );
}
