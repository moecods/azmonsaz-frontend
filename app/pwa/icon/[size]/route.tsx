import { readFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_SIZES = new Set([192, 512]);
const ICON_BY_SIZE: Record<number, string> = {
  192: "pwa-192.png",
  512: "pwa-512.png",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await context.params;
  const px = Number.parseInt(sizeParam, 10);

  if (!ALLOWED_SIZES.has(px)) {
    return new Response("Not found", { status: 404 });
  }

  const iconName = ICON_BY_SIZE[px];
  const iconPath = path.join(process.cwd(), "public", "brand", "icons", iconName);
  const icon = await readFile(iconPath);

  return new Response(icon, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
