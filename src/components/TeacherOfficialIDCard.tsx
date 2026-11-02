"use client";

import React from "react";
import { UserCircle } from "lucide-react";

export interface TeacherIDCardProfile {
  fullName?: string;
  designation?: string;
  teacherId?: string;
  employeeId?: string;
  adminId?: string;
  staffId?: string;
  department?: string;
  bloodGroup?: string;
  avatar?: string;
  gender?: string;
  role?: string;
  track?: string;
  validity?: string;
  _id?: string;
}

export type OfficialIDCardProfile = TeacherIDCardProfile;

export interface IDCardRow {
  label: string;
  value?: string;
}

/** Only https (or same-origin) photos — anything else falls back to the placeholder icon. */
function safeAvatar(url?: string): string {
  const u = String(url || "").trim();
  return /^https:\/\//i.test(u) || /^\/[^/]/.test(u) ? u : "";
}

const CARD_CLASS =
  "relative w-[320px] h-[520px] rounded-3xl shadow-2xl overflow-hidden shrink-0 select-none bg-gradient-to-b from-[#051329] via-[#081A3A] to-[#0B2545] border-2 border-[#C59B27]/60 text-white";
const CARD_STYLE: React.CSSProperties = { fontFamily: "'Inter', system-ui, -apple-system, sans-serif" };

/**
 * Shared front-side layout for staff/teacher/student cards. Pure CSS + the existing
 * /fajr-logo.png — no background template images that may be missing from /public.
 */
export function IDCardShell({
  idRef,
  cardId,
  title = "OFFICIAL ID CARD",
  name,
  subtitle,
  avatar,
  rows,
}: {
  idRef?: React.RefObject<HTMLDivElement | null>;
  cardId: string;
  title?: string;
  name: string;
  subtitle: string;
  avatar?: string;
  rows: IDCardRow[];
}) {
  const photo = safeAvatar(avatar);
  return (
    <div ref={idRef} id={cardId} className={CARD_CLASS} style={CARD_STYLE}>
      {/* Decorative glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#C59B27]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#134074]/40 blur-3xl pointer-events-none" />

      {/* Header band */}
      <div className="relative z-10 flex items-center gap-3 px-5 pt-5 pb-4 border-b border-[#C59B27]/40 bg-[#030C19]/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fajr-logo.png" alt="Fajr Academy" crossOrigin="anonymous" className="w-11 h-11 rounded-xl object-cover bg-white border border-[#C59B27]/60" />
        <div className="leading-tight">
          <div className="text-[15px] font-black tracking-wider text-white">FAJR ACADEMY</div>
          <div className="text-[9px] font-bold tracking-[0.18em] text-[#D4AF37] uppercase">Teacher Training Division</div>
          <div className="text-[8px] font-semibold tracking-[0.2em] text-slate-400 uppercase mt-0.5">{title}</div>
        </div>
      </div>

      {/* Photo */}
      <div className="relative z-10 flex justify-center pt-5">
        <div className="w-[124px] h-[144px] rounded-2xl p-[3px] bg-gradient-to-br from-[#E5B842] via-[#C59B27] to-[#8B6A12] shadow-xl">
          <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-100 flex items-center justify-center">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={name} crossOrigin="anonymous" className="w-full h-full object-cover object-top" />
            ) : (
              <UserCircle className="w-24 h-24 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* Name & designation */}
      <div className="relative z-10 px-5 pt-4 text-center">
        <h2 className="text-[19px] font-black tracking-wide leading-tight uppercase line-clamp-2">{name}</h2>
        <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#D4AF37] mt-1.5 line-clamp-2">{subtitle}</p>
      </div>

      {/* Details */}
      <div className="relative z-10 mx-5 mt-4 rounded-2xl bg-[#030C19]/70 border border-[#C59B27]/30 px-4 py-2.5 space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3 text-[11px]">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">{r.label}</span>
            <span className="font-bold text-white text-right truncate max-w-[170px]">{r.value || "—"}</span>
          </div>
        ))}
      </div>

      {/* Footer strip */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#051329] text-center py-2">
        <div className="text-[10px] font-black tracking-[0.12em] uppercase">Better Teachers, Brighter Generations</div>
        <div className="text-[9px] font-semibold">www.fajracademy.io</div>
      </div>
    </div>
  );
}

/** Shared back-side layout. */
export function IDCardBackShell({
  idRef,
  cardId,
  holder,
  validity,
  helpline,
}: {
  idRef?: React.RefObject<HTMLDivElement | null>;
  cardId: string;
  holder?: string;
  validity?: string;
  helpline?: string;
}) {
  return (
    <div ref={idRef} id={cardId} className={CARD_CLASS} style={CARD_STYLE}>
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#C59B27]/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center pt-8 px-6 text-center h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fajr-logo.png" alt="Fajr Academy" crossOrigin="anonymous" className="w-16 h-16 rounded-2xl object-cover bg-white border border-[#C59B27]/60 shadow-lg" />
        <div className="mt-3 text-base font-black tracking-wider">FAJR ACADEMY</div>
        <div className="text-[9px] font-bold tracking-[0.18em] text-[#D4AF37] uppercase">Training of Trainers (TOT)</div>

        <div className="mt-6 w-full rounded-2xl bg-[#030C19]/70 border border-[#C59B27]/30 p-4 text-left space-y-2 text-[11px] leading-relaxed text-slate-300">
          {holder && (
            <p>
              <span className="text-slate-400">Card holder: </span>
              <strong className="text-white">{holder}</strong>
            </p>
          )}
          <p>This card is the property of Fajr Academy and is valid only for the named holder.</p>
          <p>এই কার্ডটি ফজর একাডেমির সম্পত্তি। কার্ডটি পাওয়া গেলে অনুগ্রহ করে নিচের ঠিকানায় যোগাযোগ করুন।</p>
          {validity && (
            <p>
              <span className="text-slate-400">Valid for: </span>
              <strong className="text-[#D4AF37]">{validity}</strong>
            </p>
          )}
        </div>

        <div className="mt-auto mb-16 w-full">
          <div className="border-t border-slate-500/60 w-40 mx-auto" />
          <div className="text-[10px] text-slate-400 mt-1">Authorized Signature</div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#051329] text-center py-2">
        <div className="text-[10px] font-black">www.fajracademy.io</div>
        {helpline && <div className="text-[9px] font-semibold">Helpline: {helpline}</div>}
      </div>
    </div>
  );
}

/**
 * Official Teacher & Staff/Admin Digital ID Card — Front Side
 */
export function OfficialIDCard({
  profile,
  idRef,
  cardId = "teacher-official-id-card",
}: {
  profile: TeacherIDCardProfile;
  idRef?: React.RefObject<HTMLDivElement | null>;
  cardId?: string;
}) {
  const fullName = (profile?.fullName || "—").toUpperCase();
  const designation = (profile?.designation || (profile?.role ? profile.role.replace("-", " ") : "") || "—").toUpperCase();
  const teacherId =
    profile?.employeeId ||
    profile?.teacherId ||
    profile?.staffId ||
    profile?.adminId ||
    (profile?._id ? `FJRA-${String(profile._id).slice(-4).toUpperCase()}` : "—");

  const rows: IDCardRow[] = [
    { label: "ID", value: teacherId },
    { label: "Blood Group", value: profile?.bloodGroup || "—" },
  ];
  if (profile?.track) rows.push({ label: "Track", value: profile.track });
  if (profile?.department) rows.push({ label: "Dept.", value: profile.department });

  return (
    <IDCardShell
      idRef={idRef}
      cardId={cardId}
      name={fullName}
      subtitle={designation}
      avatar={profile?.avatar}
      rows={rows.slice(0, 4)}
    />
  );
}

/**
 * Official Teacher Digital ID Card — Back Side
 */
export function OfficialIDCardBack({
  idRef,
  cardId = "teacher-official-id-card-back",
  profile,
  helpline,
}: {
  idRef?: React.RefObject<HTMLDivElement | null>;
  cardId?: string;
  profile?: TeacherIDCardProfile;
  helpline?: string;
}) {
  return (
    <IDCardBackShell
      idRef={idRef}
      cardId={cardId}
      holder={profile?.fullName}
      validity={profile?.validity}
      helpline={helpline}
    />
  );
}

/**
 * Universal ID Card Export / Download Helper
 */
export async function downloadIDCardElement(
  elementId: string,
  teacherId: string = "Teacher",
  side: "front" | "back" = "front"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("ID card element not found");

  try {
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio: 2,
      cacheBust: true,
    });
    const link = document.createElement("a");
    link.download = `ID-Card-${teacherId}-${side.toUpperCase()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.warn("html-to-image failed, trying fallback html2canvas:", err);
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });
    const image = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = `ID-Card-${teacherId}-${side.toUpperCase()}.png`;
    link.href = image;
    link.click();
  }
}
