const EN_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(n: number | string): string {
  return String(n)
    .split("")
    .map((c) => (EN_DIGITS.includes(c) ? FA_DIGITS[EN_DIGITS.indexOf(c)] : c))
    .join("");
}
