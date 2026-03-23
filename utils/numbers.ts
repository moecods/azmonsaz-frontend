/**
 * تبدیل اعداد فارسی و عربی به انگلیسی
 * @param {string|number} value
 * @returns {string}
 */
export const toEnglishNumbers = (value: string): string => {
  if (!value) return value;

  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // تبدیل به رشته اگر عدد باشد
  let str = String(value);

  // جایگزینی اعداد عربی
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
  }

  // جایگزینی اعداد فارسی
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
  }

  return str;
};