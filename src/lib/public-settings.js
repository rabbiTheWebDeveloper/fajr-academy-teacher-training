/**
 * The subset of system settings that may reach a browser (public pages and
 * trainee/instructor panels). Gateway credentials, admin e-mails and internal
 * switches never leave the server.
 */
export const PUBLIC_SETTING_KEYS = [
  "siteTitle",
  "instituteName",
  "tagline",
  "officeAddress",
  "coursePrice",
  "regularCoursePrice",
  "currency",
  "currentBatch",
  "admissionStatus",
  "registrationOpen",
  "maxSeatsPerBatch",
  "orientationDate",
  "orientationTime",
  "bkashMerchantNumber",
  "nagadMerchantNumber",
  "helplinePhone",
  "supportEmail",
  "whatsappSupport",
  "certificatePrefix",
];

export const DEFAULT_PUBLIC_SETTINGS = {
  instituteName: "Fajr Academy",
  coursePrice: 1000,
  regularCoursePrice: 2500,
  currency: "BDT",
  currentBatch: "BATCH 2026",
  admissionStatus: "open",
  registrationOpen: true,
  helplinePhone: "01410764581",
  supportEmail: "support@fajracademy.io",
  whatsappSupport: "https://wa.me/8801410764581",
  bkashMerchantNumber: "01410764581",
  nagadMerchantNumber: "01410764581",
  certificatePrefix: "FJR-TOT-2026",
};

export function publicSettings(settings = {}) {
  const merged = { ...DEFAULT_PUBLIC_SETTINGS, ...(settings || {}) };
  const out = {};
  for (const key of PUBLIC_SETTING_KEYS) if (merged[key] !== undefined) out[key] = merged[key];
  return JSON.parse(JSON.stringify(out));
}
