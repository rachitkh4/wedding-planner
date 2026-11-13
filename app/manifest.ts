import type { MetadataRoute } from "next";

// Makes the guest app installable ("Add to Home Screen"). It opens straight
// into the guest home screen, which redirects to login if needed.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wedding Invitation",
    short_name: "Wedding",
    description: "Events, venues and updates for our wedding.",
    start_url: "/g/home",
    scope: "/",
    display: "standalone",
    background_color: "#fbf6ec",
    theme_color: "#7a1930",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
