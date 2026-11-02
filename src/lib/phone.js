/** Bengali digits (০-৯) → ASCII digits. */
export function convertBengaliToEnglishNumbers(str) {
  if (!str) return "";
  const bnToEnMap = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };
  return String(str).replace(/[০-৯]/g, (w) => bnToEnMap[w] || w);
}

/** Every stored phone spelling for a Bangladeshi number: 01XXXXXXXXX, 8801…, +8801… */
export function phoneVariants(input) {
  const digits = convertBengaliToEnglishNumbers(String(input || "")).replace(/[^0-9]/g, "");
  if (digits.length < 10) return [];
  const local = `0${digits.replace(/^(88)?0?/, "")}`; // 01XXXXXXXXX
  return [...new Set([local, `88${local}`, `+88${local}`, local.slice(1)])];
}

export const BD_MOBILE_RX = /^01[3-9]\d{8}$/;
