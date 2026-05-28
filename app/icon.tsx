import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const iconPath = path.join(process.cwd(), "public", "brand", "icons", "icon-32.png");
  const icon = await readFile(iconPath);

  return new Response(icon, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
