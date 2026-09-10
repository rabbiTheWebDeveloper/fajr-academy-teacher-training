'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  Receipt,
  X,
} from 'lucide-react';

export default function PaymentsClient({ user, payments = [] }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const isMen = user.track === 'TOT-MEN' || user.track?.toLowerCase().includes('men');
  const trackName = isMen
    ? 'Training of Trainers (TOT) – Men (Batch 013)'
    : 'TOT For Women (First Batch)';

  const primaryPayment = payments[0] || {
    tranId: user.tranId || 'TOT-PAID-' + (user._id?.slice(-6) || '2026'),
    amount: user.paidAmount || 1000,
    currency: 'BDT',
    status: user.paymentStatus === 'paid' ? 'VALID' : 'PENDING',
    paymentMethod: 'SSLCOMMERZ',
    cardType: 'SSLCommerz Gateway',
    createdAt: user.enrolledAt || new Date().toISOString(),
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '১০ সেপ্টেম্বর ২০২৬';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) + ` (${d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })})`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/40 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> SSLCOMMERZ 256-BIT VERIFIED
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/35 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#C59B27]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#134074]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/40 text-xs font-bold shadow-sm">
              <Receipt className="w-3.5 h-3.5" /> পেমেন্ট ও ইনভয়েস পোর্টাল
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              পেমেন্ট হিস্টোরি ও অফিসিয়াল ইনভয়েস
            </h1>
            <p className="text-xs sm:text-sm text-[#FDFBF7]/80">
              আপনার কোর্স রেজিস্ট্রেশন ফি, ট্রানজেকশন হিস্টোরি ও ডাউনলোডযোগ্য মানি রিসিপ্ট
            </p>
          </div>

          <button
            onClick={() => setSelectedInvoice(primaryPayment)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#C59B27]/25 transition-all transform hover:-translate-y-0.5 border border-[#FDFBF7]/30"
          >
            <FileText className="w-4 h-4" /> লেটেস্ট ইনভয়েস দেখুন
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#051329]/90 border border-[#C59B27]/25 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-300 text-xs">
            <span>মোট পরিশোধিত ফি</span>
            <div className="p-2 rounded-xl bg-[#C59B27]/20 text-[#D4AF37]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#D4AF37]">
            ৳ {user.paidAmount || 1000} <span className="text-xs text-slate-400 font-normal">BDT</span>
          </div>
          <p className="text-[11px] text-emerald-400">কোর্স ফি ১০০% পরিশোধিত ✓</p>
        </div>

        <div className="bg-[#051329]/90 border border-[#C59B27]/25 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-300 text-xs">
            <span>পেমেন্ট স্ট্যাটাস</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            {user.paymentStatus === 'paid' ? 'সক্রিয় ও ভেরিফাইড' : 'পেন্ডিং'}
          </div>
          <p className="text-[11px] text-[#D4AF37]">কোর্স ও সার্টিফিকেট এলিজিবল</p>
        </div>

        <div className="bg-[#051329]/90 border border-[#C59B27]/25 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-300 text-xs">
            <span>এনরোল্ড ট্র্যাক</span>
            <div className="p-2 rounded-xl bg-[#134074]/40 text-[#D4AF37]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-white truncate">
            {isMen ? 'TOT MEN (Batch 013)' : 'TOT WOMEN (First Batch)'}
          </div>
          <p className="text-[11px] text-slate-400">ট্রেইনার সার্টিফিকেট প্রোগ্রাম</p>
        </div>

        <div className="bg-[#051329]/90 border border-[#C59B27]/25 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-300 text-xs">
            <span>মোট ট্রানজেকশন</span>
            <div className="p-2 rounded-xl bg-[#C59B27]/20 text-[#D4AF37]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {payments.length || 1} <span className="text-xs text-slate-400 font-normal">টি</span>
          </div>
          <p className="text-[11px] text-slate-400">গেটওয়ে: SSLCommerz Direct</p>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-[#051329] border border-[#C59B27]/25 rounded-3xl overflow-hidden shadow-2xl space-y-4">
        <div className="p-6 border-b border-[#C59B27]/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#D4AF37]" /> ট্রানজেকশন হিস্টোরি
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              SSLCommerz এর মাধ্যমে সম্পন্ন হওয়া আপনার সকল ট্রানজেকশনের তালিকা
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#081A3A] text-[11px] uppercase tracking-wider text-[#D4AF37] border-b border-[#C59B27]/20">
              <tr>
                <th className="py-3.5 px-6">ট্রানজেকশন আইডি (TranID)</th>
                <th className="py-3.5 px-6">তারিখ ও সময়</th>
                <th className="py-3.5 px-6">পেমেন্ট মেথড / গেটওয়ে</th>
                <th className="py-3.5 px-6">পরিমাণ</th>
                <th className="py-3.5 px-6">স্ট্যাটাস</th>
                <th className="py-3.5 px-6 text-right">ইনভয়েস অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C59B27]/15">
              {(payments.length > 0 ? payments : [primaryPayment]).map((p, idx) => {
                const isValid = p.status === 'VALID' || user.paymentStatus === 'paid';
                return (
                  <tr key={p._id || idx} className="hover:bg-[#0B2545]/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#D4AF37]">
                      <div className="flex items-center gap-2">
                        <span>{p.tranId}</span>
                        <button
                          onClick={() => handleCopy(p.tranId, `tr-${idx}`)}
                          title="Copy Transaction ID"
                          className="text-slate-500 hover:text-[#D4AF37] transition-colors"
                        >
                          {copiedId === `tr-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          🔒 SSLCommerz Direct
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          {p.cardType || 'Cards / Mobile Banking / MFS'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#D4AF37] text-sm">
                      ৳ {p.amount || 1000} BDT
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          isValid
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {isValid ? 'VALID (পরিশোধিত)' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedInvoice(p)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#081A3A] hover:bg-[#0B2545] text-[#D4AF37] font-bold text-xs border border-[#C59B27]/40 hover:border-[#D4AF37] transition-all shadow-sm"
                      >
                        <Receipt className="w-3.5 h-3.5" /> ইনভয়েস প্রিন্ট
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVOICE MODAL (Printable & Downloadable in Official Fajr Academy Theme) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-[#081A3A] border border-[#C59B27]/40 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Top Bar */}
            <div className="bg-[#051329] px-6 py-4 border-b border-[#C59B27]/30 flex items-center justify-between no-print">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Receipt className="w-4 h-4 text-[#D4AF37]" />
                <span>অফিসিয়াল ইনভয়েস ভিউ</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs flex items-center gap-1.5 shadow transition-all border border-[#FDFBF7]/30"
                >
                  <Printer className="w-3.5 h-3.5" /> প্রিন্ট / সেভ PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-xl bg-[#0B2545] hover:bg-[#134074] text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet Body */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-[#081A3A] text-[#FDFBF7] print:bg-white print:text-black">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-[#C59B27]/30 print:border-gray-300 pb-6">
                <div className="flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/fajr-logo.png"
                    alt="Fajr Academy"
                    className="w-12 h-12 rounded-2xl object-cover shadow-lg border border-[#C59B27]/40 print:border-gray-400"
                  />
                  <div>
                    <h3 className="font-black text-xl tracking-tight text-white print:text-black">
                      FAJR ACADEMY
                    </h3>
                    <p className="text-xs text-[#D4AF37] font-bold">
                      Training of Trainers (TOT) Division
                    </p>
                    <p className="text-[10px] text-slate-300 print:text-gray-600 mt-0.5">
                      Website: www.fajracademy.io • Helpline: +880 1857-381244
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold print:border-emerald-600 print:text-emerald-700">
                    ✓ পরিশোধিত (PAID)
                  </div>
                  <div className="text-xs text-slate-300 print:text-gray-600 mt-2">
                    ইনভয়েস নং: <span className="font-mono font-bold text-[#D4AF37] print:text-black">{selectedInvoice.tranId}</span>
                  </div>
                  <div className="text-xs text-slate-300 print:text-gray-600">
                    তারিখ: <span className="font-semibold text-white print:text-black">{formatDate(selectedInvoice.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Bill To & Payment Gateway Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#051329]/90 print:bg-gray-50 p-5 rounded-2xl border border-[#C59B27]/30 print:border-gray-200 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-[#D4AF37] uppercase tracking-wider text-[10px]">
                    ট্রেইনি বিবরণ (Billed To):
                  </p>
                  <p className="text-sm font-bold text-white print:text-black">{user.fullName}</p>
                  <p className="text-slate-300 print:text-gray-700">মোবাইল: {user.phone}</p>
                  <p className="text-slate-300 print:text-gray-700">ইমেইল: {user.email}</p>
                  <p className="text-slate-300 print:text-gray-700 font-bold text-[#D4AF37] print:text-black">
                    কোর্স: {trackName}
                  </p>
                </div>

                <div className="space-y-1 sm:text-right flex flex-col sm:items-end">
                  <p className="font-bold text-[#D4AF37] uppercase tracking-wider text-[10px]">
                    পেমেন্ট ভেরিফিকেশন (Payment Info):
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://securepay.sslcommerz.com/public/image/sslcommerz.png"
                    alt="SSLCommerz Official"
                    style={{
                      height: '24px',
                      width: 'auto',
                      objectFit: 'contain',
                      background: '#FFFFFF',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginTop: '4px',
                      marginBottom: '4px'
                    }}
                  />
                  <p className="font-bold text-white print:text-black">SSLCommerz 256-Bit Gateway</p>
                  <p className="text-slate-300 print:text-gray-700">মেথড: {selectedInvoice.cardType || 'Direct Online Payment'}</p>
                  <p className="text-slate-300 print:text-gray-700 font-mono">
                    Trx ID: {selectedInvoice.tranId}
                  </p>
                  <p className="text-emerald-400 print:text-emerald-700 font-bold">
                    স্ট্যাটাস: সফলভাবে গৃহীত (SUCCESS)
                  </p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-[#C59B27]/30 print:border-gray-300 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#051329] text-[#D4AF37] print:bg-gray-100 print:text-gray-700 border-b border-[#C59B27]/30 print:border-gray-300 text-[11px] uppercase">
                    <tr>
                      <th className="p-3.5">বিবরণ (Item Description)</th>
                      <th className="p-3.5 text-center">পরিমাণ</th>
                      <th className="p-3.5 text-right">মূল্য (BDT)</th>
                      <th className="p-3.5 text-right">মোট (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C59B27]/15 print:divide-gray-200">
                    <tr>
                      <td className="p-3.5">
                        <p className="font-bold text-white print:text-black">
                          {trackName} – সম্পূর্ণ রেজিস্ট্রেশন ফি
                        </p>
                        <p className="text-[11px] text-slate-300 print:text-gray-600 mt-0.5">
                          লাইভ ক্লাস এক্সেস, ১০টি মডিউল শিট, ডিজিটাল টিচার আইডি কার্ড ও ফাইনাল সার্টিফিকেশন
                        </p>
                      </td>
                      <td className="p-3.5 text-center text-slate-300 print:text-black">১</td>
                      <td className="p-3.5 text-right text-slate-300 print:text-black">১,০০০ ৳</td>
                      <td className="p-3.5 text-right font-bold text-[#D4AF37] print:text-black">১,০০০ ৳</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-[#051329]/95 print:bg-gray-50 border-t border-[#C59B27]/30 print:border-gray-300 text-xs font-bold">
                    <tr>
                      <td colSpan="3" className="p-3 text-right text-slate-300 print:text-gray-600">সাবটোটাল:</td>
                      <td className="p-3 text-right text-white print:text-black">১,০০০ ৳</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="p-3 text-right text-slate-300 print:text-gray-600">ভ্যাট / সার্ভিস চার্জ:</td>
                      <td className="p-3 text-right text-emerald-400 print:text-emerald-700">০ ৳ (মওকুফ)</td>
                    </tr>
                    <tr className="border-t border-[#C59B27]/30 print:border-gray-300 text-sm">
                      <td colSpan="3" className="p-3.5 text-right text-[#D4AF37] print:text-black font-black">মোট পরিশোধিত:</td>
                      <td className="p-3.5 text-right text-[#D4AF37] print:text-emerald-700 font-black">১,০০০ ৳ BDT</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Stamp & Verification Seal */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-[#C59B27]/30 print:border-gray-300 text-xs">
                <div className="space-y-1 text-center sm:text-left text-slate-300 print:text-gray-600">
                  <p className="font-bold text-[#D4AF37] print:text-black">বিশেষ দ্রষ্টব্য:</p>
                  <p>এটি একটি কম্পিউটার জেনারেটেড ডিজিটাল ইনভয়েস, কোনো ম্যানুয়াল স্বাক্ষরের প্রয়োজন নেই।</p>
                  <p>SSLCommerz সিকিউর পেমেন্ট ভেরিফিকেশন সিস্টেম দ্বারা অনুমোদিত।</p>
                </div>

                {/* Digital Paid Stamp */}
                <div className="border-2 border-dashed border-[#C59B27] print:border-emerald-700 p-3 rounded-2xl text-center rotate-[-4deg] shadow-lg bg-[#051329] print:bg-transparent">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37] print:text-emerald-700">
                    FAJR ACADEMY TOT
                  </div>
                  <div className="text-base font-black text-[#D4AF37] print:text-emerald-700">
                    ★ PAID &amp; VERIFIED ★
                  </div>
                  <div className="text-[9px] text-[#E5B842] print:text-emerald-800 font-mono">
                    REF: {selectedInvoice.tranId?.slice(-10)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
