import { PWA_THEME_COLOR } from "@/lib/pwa-config";

/** Shared mark for favicon / manifest icons (ImageResponse JSX). */
export function PwaIconMark({ size }: { size: number }) {
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.42);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PWA_THEME_COLOR,
        borderRadius: radius,
      }}
    >
      <span
        style={{
          color: "#ffffff",
          fontSize,
          fontWeight: 700,
          fontFamily: "Tahoma, sans-serif",
          lineHeight: 1,
          marginTop: -Math.round(size * 0.02),
        }}
      >
        آ
      </span>
    </div>
  );
}
