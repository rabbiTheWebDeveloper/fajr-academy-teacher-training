"use client";

import React from "react";
import { IDCardShell, IDCardBackShell, type IDCardRow } from "@/components/TeacherOfficialIDCard";

export interface StudentIDCardProfile {
  fullName?: string;
  studentId?: string;
  fatherName?: string;
  motherName?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  course?: string;
  teacherName?: string;
  gender?: string;
  avatar?: string;
  admissionDate?: string | Date;
  status?: string;
  bloodGroup?: string;
  validity?: string;
  _id?: string;
}

/**
 * Official Student Digital ID Card — Front Side (same pure-CSS layout as the teacher card)
 */
export function StudentIDCard({
  profile,
  idRef,
  cardId = "student-official-id-card",
}: {
  profile: StudentIDCardProfile;
  idRef?: React.RefObject<HTMLDivElement | null>;
  cardId?: string;
}) {
  const fullName = (profile?.fullName || "—").toUpperCase();
  const designation = (profile?.course ? `STUDENT • ${profile.course}` : "STUDENT").toUpperCase();
  const studentId =
    profile?.studentId || (profile?._id ? `FJRS-${String(profile._id).slice(-4).toUpperCase()}` : "—");

  const rows: IDCardRow[] = [
    { label: "ID", value: studentId },
    { label: "Blood Group", value: profile?.bloodGroup || "—" },
  ];
  const guardian = profile?.fatherName || profile?.motherName;
  if (guardian) rows.push({ label: "Guardian", value: guardian });
  if (profile?.teacherName) rows.push({ label: "Teacher", value: profile.teacherName });

  return (
    <IDCardShell
      idRef={idRef}
      cardId={cardId}
      title="STUDENT ID CARD"
      name={fullName}
      subtitle={designation}
      avatar={profile?.avatar}
      rows={rows.slice(0, 4)}
    />
  );
}

/**
 * Official Student Digital ID Card — Back Side
 */
export function StudentIDCardBack({
  profile,
  idRef,
  cardId = "student-official-id-card-back",
  helpline,
}: {
  profile?: StudentIDCardProfile;
  idRef?: React.RefObject<HTMLDivElement | null>;
  cardId?: string;
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
 * Universal Student ID Card Export / Download Helper
 */
export async function downloadStudentIDCardElement(
  elementId: string,
  studentId: string = "Student",
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
    link.download = `Student-ID-Card-${studentId}-${side.toUpperCase()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.warn("html-to-image failed, using html2canvas fallback:", err);
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
    link.download = `Student-ID-Card-${studentId}-${side.toUpperCase()}.png`;
    link.href = image;
    link.click();
  }
}
