"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarHeart, House, LifeBuoy, Luggage, Menu } from "lucide-react";

export function BottomTabs({
  labels,
}: {
  labels: { home: string; events: string; trip: string; help: string; more: string };
}) {
  const pathname = usePathname();
  const tabs = [
    { href: "/g/home", label: labels.home, icon: House },
    { href: "/g/events", label: labels.events, icon: CalendarHeart },
    { href: "/g/trip", label: labels.trip, icon: Luggage },
    { href: "/g/help", label: labels.help, icon: LifeBuoy },
    { href: "/g/more", label: labels.more, icon: Menu },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-maroon/15 bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[14px] font-medium leading-tight ${
                active ? "text-maroon" : "text-ink/55"
              }`}
            >
              <span
                className={`flex h-9 w-12 items-center justify-center rounded-full transition ${
                  active ? "bg-maroon text-ivory" : ""
                }`}
              >
                <Icon size={24} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
