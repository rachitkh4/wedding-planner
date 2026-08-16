import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ListChecks,
  Wallet,
  Receipt,
  Users,
  Store,
  ShoppingBag,
  CalendarDays,
  StickyNote,
  UserPlus,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/checklist", label: "Checklist", icon: ListChecks },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/vendors", label: "Vendors", icon: Store },
  { href: "/shopping", label: "Shopping", icon: ShoppingBag },
  { href: "/itinerary", label: "Itinerary", icon: CalendarDays },
  { href: "/notes", label: "My Notes", icon: StickyNote },
  { href: "/invite-manage", label: "Invite", icon: UserPlus },
];
