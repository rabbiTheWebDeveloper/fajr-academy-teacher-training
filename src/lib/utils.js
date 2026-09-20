import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function escapeRegex(string = "") {
  if (!string || typeof string !== "string") return "";
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function toBengaliNumber(num) {
  if (num === undefined || num === null || num === "") return "";
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toLocaleString("en-US")
    .replace(/[0-9]/g, (w) => bnDigits[+w]);
}

export function formatPriceBn(amount, currency = "৳") {
  if (amount === undefined || amount === null || amount === "") return "";
  return `${toBengaliNumber(amount)} ${currency}`.trim();
}

