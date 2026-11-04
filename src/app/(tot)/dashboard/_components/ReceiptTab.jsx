"use client";

import Link from "next/link";
import { Receipt, CreditCard, ExternalLink, Printer, Info } from "lucide-react";
import { PaymentStatusBadge } from "../../_shared/StatusBadge";
import { formatAmount, formatDate, paymentMethodText, PAYMENT_PURPOSE, traineeIdOf } from "../../_shared/format";

/** The trainee's own payments with their real status; a receipt only for a VALID one. */
export default function ReceiptTab({ payments = [], user }) {
  const latestValid = payments.find((p) => p.status === "VALID") || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-300" /> অফিসিয়াল পেমেন্ট রিসিপ্ট ও হিস্টোরি
          </h2>
          <p className="text-xs text-slate-400 mt-1">আপনার কোর্স ফি, ট্রানজেকশনের বিবরণ ও প্রকৃত পেমেন্ট স্ট্যাটাস</p>
        </div>
        <Link
          href="/payments"
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 font-bold text-xs border border-slate-800 flex items-center gap-1.5 transition-all shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" /> ফুল পেমেন্ট পেজ খুলুন
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
          <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
          <p>আপনার অ্যাকাউন্টে এখনো কোনো পেমেন্ট রেকর্ড নেই।</p>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-300" /> ট্রানজেকশন রেকর্ড তালিকা
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-[10px] uppercase text-indigo-300 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">ট্রানজেকশন আইডি</th>
                  <th className="py-2.5 px-4">বিবরণ</th>
                  <th className="py-2.5 px-4">মেথড</th>
                  <th className="py-2.5 px-4">পরিমাণ</th>
                  <th className="py-2.5 px-4">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payments.map((p) => (
                  <tr key={p._id || p.tranId} className="hover:bg-slate-800">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-indigo-300">{p.tranId}</div>
                      <div className="text-[10px] text-slate-500">{formatDate(p.createdAt, { time: true })}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{PAYMENT_PURPOSE[p.purpose] || "কোর্স ফি"}</div>
                      {p.courseName && <div className="text-[10px] text-slate-500">{p.courseName}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{paymentMethodText(p)}</td>
                    <td className="py-3 px-4 font-bold text-indigo-300 whitespace-nowrap">{formatAmount(p.amount, p.currency)}</td>
                    <td className="py-3 px-4">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {latestValid ? (
        <div className="max-w-2xl mx-auto bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 gap-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fajr-logo.png" alt="Fajr Academy" className="w-10 h-10 rounded-xl object-cover border border-slate-800" />
              <div>
                <span className="text-[10px] uppercase font-extrabold text-indigo-300 tracking-wider">FAJR ACADEMY INVOICE</span>
                <h3 className="text-lg font-black text-white mt-0.5">টাকা প্রাপ্তি রসিদ (সর্বশেষ)</h3>
              </div>
            </div>
            <PaymentStatusBadge status="VALID" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400">ট্রেইনির নাম:</p>
              <p className="font-bold text-white mt-0.5">{user.fullName}</p>
            </div>
            <div>
              <p className="text-slate-400">ট্রেইনি আইডি:</p>
              <p className="font-mono font-bold text-white mt-0.5">{traineeIdOf(user)}</p>
            </div>
            <div>
              <p className="text-slate-400">ট্রানজেকশন আইডি:</p>
              <p className="font-mono font-bold text-indigo-300 mt-0.5 break-all">{latestValid.tranId}</p>
            </div>
            <div>
              <p className="text-slate-400">পেমেন্ট মেথড:</p>
              <p className="font-bold text-white mt-0.5">{paymentMethodText(latestValid)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400">পরিশোধের তারিখ:</p>
              <p className="font-bold text-white mt-0.5">{formatDate(latestValid.finalizedAt || latestValid.createdAt, { time: true })}</p>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between gap-3 text-slate-300">
              <span>
                {PAYMENT_PURPOSE[latestValid.purpose] || "কোর্স ফি"}
                {latestValid.courseName ? ` — ${latestValid.courseName}` : ""}
              </span>
              <span className="whitespace-nowrap">{formatAmount(latestValid.amount, latestValid.currency)}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white text-sm">
              <span>মোট পরিশোধিত:</span>
              <span className="text-indigo-300">{formatAmount(latestValid.amount, latestValid.currency)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Link
              href={`/payments?invoice=${encodeURIComponent(latestValid.tranId)}`}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-900/20 transition-all border "
            >
              <Printer className="w-4 h-4" /> পূর্ণ ইনভয়েস দেখুন / প্রিন্ট করুন
            </Link>
          </div>
        </div>
      ) : (
        payments.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-300 shrink-0" />
            কোনো সফল (VALID) পেমেন্ট না থাকায় এখনো টাকা প্রাপ্তির রসিদ তৈরি হয়নি।
          </div>
        )
      )}
    </div>
  );
}
