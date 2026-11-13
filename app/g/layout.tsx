import type { Metadata, Viewport } from "next";
import { Mukta, Cormorant_Garamond } from "next/font/google";
import { prisma } from "@/lib/prisma";

// Mukta covers Devanagari and Latin and stays readable at large sizes;
// Cormorant gives the invitation its classic serif look.
const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
});
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#7a1930",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const meta = await prisma.weddingMeta.findFirst();
  const couple = meta ? `${meta.partner1Name} & ${meta.partner2Name}` : "Our Wedding";
  const date = meta
    ? new Intl.DateTimeFormat("en-IN", {
        timeZone: "UTC",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(meta.weddingDate)
    : "";
  return {
    title: `${couple} · Wedding`,
    description: `You're invited to the wedding of ${couple}${date ? ` · ${date}` : ""}${meta?.city ? ` · ${meta.city}` : ""}`,
    appleWebApp: { capable: true, title: "Wedding", statusBarStyle: "default" },
    icons: { apple: "/icons/apple-touch-icon.png", icon: "/icons/icon-192.png" },
  };
}

export default function GuestRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${mukta.variable} ${cormorant.variable} min-h-screen bg-ivory text-[18px] leading-relaxed text-ink [font-family:var(--font-mukta),system-ui,sans-serif]`}
    >
      {children}
    </div>
  );
}
