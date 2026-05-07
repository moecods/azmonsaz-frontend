/**
 * Image pipeline used by the rich text editor.
 *
 * All image insertion goes through this module, regardless of the source
 * (toolbar dialog, drag & drop, clipboard paste). Responsibilities:
 *
 *   1. Validation       – MIME allow-list, max size, magic-byte sniff.
 *   2. SVG hardening    – strip scripts/event handlers/javascript: URIs.
 *   3. Compression      – downscale + JPEG/WEBP re-encode for raster images.
 *   4. Cropping         – canvas-based crop with optional max-bound.
 *   5. Encoding         – produce a Blob ready for multipart upload.
 *
 * The pipeline ends with a `Blob` (not a base64 data URL). Callers send the
 * blob to the backend `/media` endpoint via `MediaService.upload(...)` and
 * insert the resulting URL into the editor.
 */

import DOMPurify from 'dompurify';

export const ALLOWED_MIME = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

export type AllowedMime = (typeof ALLOWED_MIME)[number];

/** Magic-byte signatures for the formats we accept (binary heuristics). */
const SIGNATURES: { mime: AllowedMime; check: (b: Uint8Array) => boolean }[] = [
  { mime: 'image/png', check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: 'image/jpeg', check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/gif', check: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 },
  // WEBP: "RIFF....WEBP"
  {
    mime: 'image/webp',
    check: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

export const DEFAULT_LIMITS = {
  /** Hard cap for the *raw* file (before compression). */
  maxBytes: 10 * 1024 * 1024,
  /** Cap for the *encoded* output (post-compression). */
  maxOutputBytes: 1.5 * 1024 * 1024,
  /** Visual cap; oversized images get downscaled to fit inside this box. */
  maxWidth: 1600,
  maxHeight: 1600,
  /** Quality for JPEG/WEBP re-encode. */
  quality: 0.86,
};

export type ImageLimits = typeof DEFAULT_LIMITS;

export interface ProcessedImage {
  /** Encoded image ready to upload. */
  blob: Blob;
  width: number;
  height: number;
  /** Final byte size of the blob. */
  byteSize: number;
  mime: AllowedMime;
  /** A short, sanitised filename derived from the source. */
  filename: string;
}

export interface ProgressEvent {
  stage: 'reading' | 'decoding' | 'cropping' | 'compressing' | 'encoding' | 'done';
  /** 0..1 — undefined for indeterminate stages. */
  progress?: number;
}

export type ProgressCallback = (e: ProgressEvent) => void;

export interface CropRect {
  /** All values are 0..1, relative to the source image. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ImageProcessingError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export function validateImageFile(
  file: File,
  limits: Partial<ImageLimits> = {},
): { ok: true; mime: AllowedMime } | { ok: false; error: string; code: string } {
  const lim = { ...DEFAULT_LIMITS, ...limits };
  if (!file) {
    return { ok: false, error: 'فایلی انتخاب نشده است', code: 'NO_FILE' };
  }
  if (file.size === 0) {
    return { ok: false, error: 'فایل خالی است', code: 'EMPTY' };
  }
  if (file.size > lim.maxBytes) {
    const mb = Math.round(lim.maxBytes / 1024 / 1024);
    return {
      ok: false,
      error: `حجم فایل بیشتر از ${mb} مگابایت است`,
      code: 'TOO_LARGE',
    };
  }
  const mime = (file.type || '').toLowerCase();
  if (!ALLOWED_MIME.includes(mime as AllowedMime)) {
    return {
      ok: false,
      error: 'فرمت تصویر پشتیبانی نمی‌شود (PNG / JPG / WEBP / GIF / SVG)',
      code: 'BAD_MIME',
    };
  }
  return { ok: true, mime: mime as AllowedMime };
}

/**
 * Read the first 16 bytes of a file and verify it matches its claimed MIME.
 * SVG is text — checked separately by `sanitizeSvg`.
 */
export async function sniffMagicBytes(file: File, claimedMime: AllowedMime): Promise<void> {
  if (claimedMime === 'image/svg+xml') return; // not a binary signature
  const head = file.slice(0, 16);
  const buf = new Uint8Array(await head.arrayBuffer());
  const matched = SIGNATURES.find((s) => s.check(buf))?.mime;
  if (!matched) {
    throw new ImageProcessingError('محتوای فایل با فرمت ادعاشده مطابقت ندارد', 'BAD_SIGNATURE');
  }
  if (matched !== claimedMime) {
    throw new ImageProcessingError(
      `فرمت واقعی فایل (${matched}) با فرمت ادعاشده (${claimedMime}) هم‌خوانی ندارد`,
      'MIME_MISMATCH',
    );
  }
}

/* -------------------------------------------------------------------------- */
/* SVG hardening                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Strips <script>, on* event handlers, and javascript: URIs from an SVG
 * payload. Returns null if the result is empty or malformed.
 */
export function sanitizeSvg(svgText: string): string | null {
  if (typeof window === 'undefined') return svgText;
  const cleaned = DOMPurify.sanitize(svgText, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['script', 'foreignObject'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'href'],
  });
  if (!cleaned || !cleaned.trim()) return null;
  return cleaned;
}

/* -------------------------------------------------------------------------- */
/* Decoding / encoding                                                        */
/* -------------------------------------------------------------------------- */

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new ImageProcessingError('خطا در خواندن فایل', 'READ_ERROR'));
    r.readAsDataURL(file);
  });
}

export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new ImageProcessingError('خطا در خواندن فایل', 'READ_ERROR'));
    r.readAsText(file);
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new ImageProcessingError('خطا در رمزگشایی فایل', 'ENCODE_ERROR'));
    r.readAsDataURL(blob);
  });
}

/**
 * Loads a HTMLImageElement from a File, Blob URL, data URL, or remote URL.
 *
 * For remote (cross-origin) sources we must opt into CORS by setting
 * `crossOrigin = 'anonymous'`. Without it, the resulting image *displays*
 * fine but the browser flags it as "tainted", and any subsequent
 * `canvas.toBlob()` / `toDataURL()` call throws "Tainted canvases may not
 * be exported." This is exactly what breaks in-editor cropping when the
 * frontend and the media host live on different origins.
 *
 * The server side must respond with `Access-Control-Allow-Origin` for the
 * fetch to succeed; uploads in this app go through a Laravel-served route
 * (`/api/media/file/...`) that has CORS middleware applied.
 */
export function loadHtmlImage(srcOrFile: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const src = typeof srcOrFile === 'string' ? srcOrFile : URL.createObjectURL(srcOrFile);
    const img = new Image();
    if (typeof srcOrFile === 'string' && needsCorsForImageSrc(src)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      if (typeof srcOrFile !== 'string') URL.revokeObjectURL(src);
      resolve(img);
    };
    img.onerror = () => {
      if (typeof srcOrFile !== 'string') URL.revokeObjectURL(src);
      reject(new ImageProcessingError('تصویر معتبر نیست یا قابل بارگذاری نیست', 'DECODE_ERROR'));
    };
    img.src = src;
  });
}

/**
 * Whether loading this URL in an `<img>` should set `crossOrigin="anonymous"`
 * so the bitmap can be read back from a `<canvas>` without tainting.
 */
export function needsCorsForImageSrc(src: string): boolean {
  if (typeof window === 'undefined') return false;
  if (src.startsWith('data:') || src.startsWith('blob:')) return false;
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    const target = new URL(src, window.location.href);
    return target.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Compression / cropping                                                     */
/* -------------------------------------------------------------------------- */

interface DrawOptions {
  crop?: CropRect;
  maxWidth: number;
  maxHeight: number;
}

function computeOutputSize(
  sourceW: number,
  sourceH: number,
  { maxWidth, maxHeight }: DrawOptions,
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / sourceW, maxHeight / sourceH, 1);
  return {
    width: Math.max(1, Math.round(sourceW * ratio)),
    height: Math.max(1, Math.round(sourceH * ratio)),
  };
}

function pickEncodingMime(originalMime: AllowedMime): AllowedMime {
  // Re-encode lossless inputs to JPEG when they're large; PNG/SVG/GIF stay as-is.
  if (originalMime === 'image/jpeg' || originalMime === 'image/webp') return originalMime;
  return 'image/jpeg';
}

/**
 * Decode → optional crop → downscale → re-encode pipeline.
 *
 * For SVGs the function returns the (sanitized) original text wrapped in a
 * data URL — re-encoding vector content as raster would defeat its purpose.
 */
export async function processImageFile(
  file: File,
  opts: { crop?: CropRect; limits?: Partial<ImageLimits> } = {},
  onProgress?: ProgressCallback,
): Promise<ProcessedImage> {
  const limits = { ...DEFAULT_LIMITS, ...opts.limits };

  onProgress?.({ stage: 'reading' });

  const validation = validateImageFile(file, limits);
  if (!validation.ok) throw new ImageProcessingError(validation.error, validation.code);
  const mime = validation.mime;
  await sniffMagicBytes(file, mime);

  /* SVG path — sanitize, do not raster-encode. */
  if (mime === 'image/svg+xml') {
    const text = await fileToText(file);
    const cleaned = sanitizeSvg(text);
    if (!cleaned) {
      throw new ImageProcessingError('فایل SVG پس از پاک‌سازی خالی شد', 'SVG_EMPTY');
    }
    const blob = new Blob([cleaned], { type: 'image/svg+xml' });
    onProgress?.({ stage: 'done', progress: 1 });
    return {
      blob,
      width: 0, // unknown for vector content without rasterising
      height: 0,
      byteSize: blob.size,
      mime,
      filename: safeFilename(file.name, 'svg'),
    };
  }

  /* Raster path */
  onProgress?.({ stage: 'decoding' });
  const img = await loadHtmlImage(file);

  const sourceW = img.naturalWidth;
  const sourceH = img.naturalHeight;
  if (sourceW === 0 || sourceH === 0) {
    throw new ImageProcessingError('ابعاد تصویر معتبر نیست', 'BAD_DIMENSIONS');
  }

  const crop = opts.crop;
  const cropPx = crop
    ? {
        x: Math.round(crop.x * sourceW),
        y: Math.round(crop.y * sourceH),
        width: Math.round(crop.width * sourceW),
        height: Math.round(crop.height * sourceH),
      }
    : { x: 0, y: 0, width: sourceW, height: sourceH };

  if (cropPx.width <= 0 || cropPx.height <= 0) {
    throw new ImageProcessingError('ناحیه برش انتخاب‌شده معتبر نیست', 'BAD_CROP');
  }

  onProgress?.({ stage: 'cropping' });

  const { width: outW, height: outH } = computeOutputSize(cropPx.width, cropPx.height, {
    maxWidth: limits.maxWidth,
    maxHeight: limits.maxHeight,
  });

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new ImageProcessingError('Canvas در دسترس نیست', 'NO_CANVAS');
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    img,
    cropPx.x, cropPx.y, cropPx.width, cropPx.height,
    0, 0, outW, outH,
  );

  onProgress?.({ stage: 'compressing' });

  const targetMime = pickEncodingMime(mime);

  // Try progressively lower quality until under the byte budget.
  const QUALITIES = [limits.quality, 0.78, 0.7, 0.62, 0.55, 0.5];
  let blob: Blob | null = null;
  for (const q of QUALITIES) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, targetMime, q),
    );
    if (!blob) continue;
    if (blob.size <= limits.maxOutputBytes) break;
  }
  if (!blob) {
    throw new ImageProcessingError('فشرده‌سازی تصویر ناموفق بود', 'ENCODE_FAILED');
  }

  onProgress?.({ stage: 'encoding' });
  onProgress?.({ stage: 'done', progress: 1 });

  return {
    blob,
    width: outW,
    height: outH,
    byteSize: blob.size,
    mime: targetMime,
    filename: safeFilename(file.name, extFromMime(targetMime)),
  };
}

/**
 * Sanitised filename: strips path separators, trims very long names, and
 * normalises the extension. Used for the multipart `filename` field so the
 * server-side validator gets something predictable.
 */
function safeFilename(input: string, fallbackExt: string): string {
  const cleaned = input.replace(/[\\/]/g, '_').slice(0, 80) || `image.${fallbackExt}`;
  if (/\.[a-z0-9]+$/i.test(cleaned)) return cleaned;
  return `${cleaned}.${fallbackExt}`;
}

function extFromMime(mime: AllowedMime): string {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/svg+xml':
      return 'svg';
  }
}

/**
 * Re-encode an existing image source (URL or already-loaded image) with a
 * normalised crop applied. Used by the in-editor crop overlay where we
 * already have the image rendered and want a smaller cropped version that
 * we then upload to the backend.
 *
 * Returns a Blob (ready for multipart upload). Callers that need a temporary
 * preview can do `URL.createObjectURL(blob)`.
 */
export async function cropImageToBlob(
  src: string,
  crop: CropRect,
  options: { mime?: 'image/jpeg' | 'image/webp' | 'image/png'; quality?: number } = {},
): Promise<{ blob: Blob; width: number; height: number; mime: 'image/jpeg' | 'image/webp' | 'image/png' }> {
  const mime = options.mime ?? 'image/webp';
  const quality = options.quality ?? 0.9;

  const img = await loadHtmlImage(src);
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const cw = Math.max(1, Math.round(W * crop.width));
  const ch = Math.max(1, Math.round(H * crop.height));
  const cx = Math.max(0, Math.round(W * crop.x));
  const cy = Math.max(0, Math.round(H * crop.y));

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new ImageProcessingError('Canvas در دسترس نیست', 'NO_CANVAS');
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, quality),
  );
  if (!blob) {
    throw new ImageProcessingError('فشرده‌سازی تصویر ناموفق بود', 'ENCODE_FAILED');
  }
  return { blob, width: cw, height: ch, mime };
}

/** Pulls the first image File out of a clipboard event, if any. */
export function imageFileFromClipboard(items: DataTransferItemList | null | undefined): File | null {
  if (!items) return null;
  for (const item of Array.from(items)) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const f = item.getAsFile();
      if (f) return f;
    }
  }
  return null;
}

/** Pulls the first image File out of a drag transfer, if any. */
export function imageFileFromDataTransfer(dt: DataTransfer | null | undefined): File | null {
  if (!dt) return null;
  for (const f of Array.from(dt.files ?? [])) {
    if (f.type.startsWith('image/')) return f;
  }
  return null;
}
