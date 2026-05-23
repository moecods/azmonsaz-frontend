/** Descriptive grading bands on a numeric scale (e.g. 0–20). */

export interface DescriptiveGradingBand {
  label: string;
  min: number;
  max?: number;
}

export interface DescriptiveGradingConfig {
  scale_max: number;
  pass_min: number;
  bands: DescriptiveGradingBand[];
}

export const DEFAULT_DESCRIPTIVE_BANDS: DescriptiveGradingBand[] = [
  { label: "خیلی خوب", min: 17, max: 20 },
  { label: "خوب", min: 15, max: 17 },
  { label: "قابل قبول", min: 10, max: 15 },
  { label: "نیاز به آموزش و تلاش بیشتر", min: 0, max: 10 },
];

export function getDefaultDescriptiveConfig(): DescriptiveGradingConfig {
  return {
    scale_max: 20,
    pass_min: 10,
    bands: DEFAULT_DESCRIPTIVE_BANDS.map((b) => ({ ...b })),
  };
}

export function normalizeDescriptiveConfig(
  raw: Record<string, unknown> | null | undefined
): DescriptiveGradingConfig {
  const defaults = getDefaultDescriptiveConfig();
  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  const bandsRaw = raw.bands;
  const bands = Array.isArray(bandsRaw) && bandsRaw.length > 0
    ? bandsRaw.map((b, i) => {
        const row = b as Record<string, unknown>;
        const fallback = defaults.bands[i] ?? defaults.bands[defaults.bands.length - 1];
        return {
          label: String(row.label ?? fallback.label),
          min: Number(row.min ?? fallback.min),
          max: row.max != null ? Number(row.max) : fallback.max,
        };
      })
    : defaults.bands;

  return {
    scale_max: Number(raw.scale_max ?? defaults.scale_max),
    pass_min: Number(raw.pass_min ?? defaults.pass_min),
    bands,
  };
}

/** Display line: «نمره ۱۷ تا ۲۰ — خیلی خوب» */
export function formatDescriptiveBandLine(band: DescriptiveGradingBand, scaleMax: number): string {
  const max = band.max ?? scaleMax;
  return `نمره ${band.min} تا ${max} — ${band.label}`;
}

export function isDescriptiveGradingMode(mode: string | null | undefined): boolean {
  return mode === "descriptive";
}
