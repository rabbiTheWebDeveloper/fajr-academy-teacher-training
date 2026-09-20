import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function escapeRegex(string: string = ""): string {
  if (!string || typeof string !== "string") return ""
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === "") return ""
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return Number(num)
    .toLocaleString("en-US")
    .replace(/[0-9]/g, (w) => bnDigits[+w])
}

export function formatPriceBn(amount: number | string | undefined | null, currency: string = "৳"): string {
  if (amount === undefined || amount === null || amount === "") return ""
  return `${toBengaliNumber(amount)} ${currency}`.trim()
}

