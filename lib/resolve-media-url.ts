/**
 * Rewrite media URLs from the API to the host the browser can reach.
 * Backend may emit APP_URL (e.g. :8030) while NEXT_PUBLIC_API_URL uses :8000.
 */
export function getApiOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

const MEDIA_FILE_PREFIX = "/api/media/file/";

export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url?.trim()) return undefined;

  const apiOrigin = getApiOrigin();
  const marker = MEDIA_FILE_PREFIX;
  const idx = url.indexOf(marker);

  if (idx >= 0) {
    const pathAfter = url.slice(idx + marker.length);
    return `${apiOrigin}${marker}${pathAfter}`;
  }

  if (url.startsWith(marker)) {
    return `${apiOrigin}${url}`;
  }

  return url;
}
