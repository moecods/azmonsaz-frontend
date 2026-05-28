import type { MetadataRoute } from "next";
import { paletteTokens } from "@/theme/tokens";

export const PWA_THEME_COLOR = paletteTokens.primary.main;
export const PWA_BACKGROUND_COLOR = paletteTokens.light.background.default;

export function getPwaAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME_FA || "آزمون‌ساز";
}

export function getPwaShortName(): string {
  const full = getPwaAppName();
  return full.length > 12 ? full.slice(0, 12) : full;
}

export function getPwaManifest(): MetadataRoute.Manifest {
  return {
    name: getPwaAppName(),
    short_name: getPwaShortName(),
    description: "ساخت و مدیریت آزمون آنلاین",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    dir: "rtl",
    lang: "fa",
    theme_color: PWA_THEME_COLOR,
    background_color: PWA_BACKGROUND_COLOR,
    icons: [
      {
        src: "/brand/icons/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icons/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icons/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
