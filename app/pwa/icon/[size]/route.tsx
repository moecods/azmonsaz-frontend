import { ImageResponse } from "next/og";
import { PwaIconMark } from "@/lib/pwa-icon-mark";

const ALLOWED_SIZES = new Set([192, 512]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await context.params;
  const px = Number.parseInt(sizeParam, 10);

  if (!ALLOWED_SIZES.has(px)) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(<PwaIconMark size={px} />, {
    width: px,
    height: px,
  });
}
