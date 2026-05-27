export function formatRelativeTimeFa(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return "همین الان";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60).toLocaleString("fa-IR")} دقیقه پیش`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600).toLocaleString("fa-IR")} ساعت پیش`;
  return new Date(iso).toLocaleString("fa-IR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
