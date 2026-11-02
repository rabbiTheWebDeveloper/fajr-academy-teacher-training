'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  CheckCircle2,
  Printer,
  ShieldCheck,
  ArrowLeft,
  FileText,
  DollarSign,
  Layers,
  Receipt,
  X,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import CopyButton from '../_shared/CopyButton';
import PaymentRequiredCard, { latestUnpaidAttempt } from '../_shared/PaymentRequiredCard';
import { PaymentStatusBadge } from '../_shared/StatusBadge';
import {
  ACCOUNT_PAYMENT_STATUS,
  checkoutHref,
  formatAmount,
  formatDate,
  paymentMethodText,
  PAYMENT_PURPOSE,
  RETRYABLE_PAYMENT,
  toBn,
  traineeIdOf,
  TONE_BADGE,
} from '../_shared/format';

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #invoice-print-area, #invoice-print-area * { visibility: visible !important; }
  .invoice-print-shell { position: static !important; max-height: none !important; overflow: visible !important; background: none !important; padding: 0 !important; border: 0 !important; box-shadow: none !important; backdrop-filter: none !important; }
  #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; max-height: none !important; overflow: visible !important; background: #fff !important; color: #000 !important; }
}`;

function hasRefund(p) {
  const r = p?.refund;
  return Boolean(r && (r.refId || r.status || Number(r.amount) > 0));
}

/** Sum of VALID payments, per currency ("৳ ২,০০০" or "৳ ১,০০০ + ১০ USD"). */
function totalPaid(payments) {
  const sums = {};
  for (const p of payments) {
    if (p.status !== 'VALID') continue;
    const cur = p.currency || 'BDT';
    sums[cur] = (sums[cur] || 0) + (Number(p.amount) || 0);
  }
  const parts = Object.entries(sums).map(([cur, amt]) => formatAmount(amt, cur));
  return parts.length ? parts.join(' + ') : formatAmount(0);
}

export default function PaymentsClient({
  user,
  paid = false,
  payments = [],
  enrolledCourses = [],
  primaryCourseId = '',
  initialInvoice = '',
  contact = {},
}) {
  const router = useRouter();
  const validPayments = payments.filter((p) => p.status === 'VALID');
  const [selectedInvoice, setSelectedInvoice] = useState(
    () => (initialInvoice && validPayments.find((p) => p.tranId === initialInvoice)) || null
  );
  const invoiceMissing = Boolean(initialInvoice) && !validPayments.some((p) => p.tranId === initialInvoice);
  const enrolledIds = enrolledCourses.map((c) => c.courseId);

  const account = paid
    ? ACCOUNT_PAYMENT_STATUS[user.paymentStatus]?.tone === 'emerald'
      ? ACCOUNT_PAYMENT_STATUS[user.paymentStatus]
      : { label: 'সক্রিয়', tone: 'emerald' }
    : ACCOUNT_PAYMENT_STATUS[user.paymentStatus] || ACCOUNT_PAYMENT_STATUS.pending;

  const closeInvoice = () => {
    setSelectedInvoice(null);
    if (initialInvoice) router.replace('/payments', { scroll: false });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
        </Link>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/40 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> SSLCOMMERZ 256-BIT SECURED
        </span>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/35 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#C59B27]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/40 text-xs font-bold shadow-sm">
              <Receipt className="w-3.5 h-3.5" /> পেমেন্ট ও ইনভয়েস পোর্টাল
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">পেমেন্ট হিস্টোরি ও অফিসিয়াল ইনভয়েস</h1>
            <p className="text-xs sm:text-sm text-[#FDFBF7]/80">আপনার কোর্স ফি, প্রতিটি ট্রানজেকশনের প্রকৃত স্ট্যাটাস ও ডাউনলোডযোগ্য মানি রিসিপ্ট</p>
          </div>

          {validPayments.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedInvoice(validPayments[0])}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#C59B27]/25 transition-all border border-[#FDFBF7]/30"
            >
              <FileText className="w-4 h-4" /> সর্বশেষ ইনভয়েস দেখুন
            </button>
          )}
        </div>
      </div>

      {invoiceMissing && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-100 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
          এই ট্রানজেকশনের জন্য কোনো ইনভয়েস পাওয়া যায়নি। শুধুমাত্র আপনার সফল (VALID) পেমেন্টের ইনভয়েস দেখা যায়।
        </div>
      )}

      {!paid && <PaymentRequiredCard courseId={primaryCourseId} lastAttempt={latestUnpaidAttempt(payments)} compact />}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="মোট পরিশোধিত" icon={DollarSign}>
          <div className="text-2xl font-black text-[#D4AF37]">{totalPaid(payments)}</div>
          <p className="text-[11px] text-slate-400">
            {validPayments.length ? `${toBn(validPayments.length)}টি সফল পেমেন্ট` : 'এখনো কোনো সফল পেমেন্ট নেই'}
          </p>
        </Kpi>

        <Kpi title="অ্যাকাউন্ট পেমেন্ট স্ট্যাটাস" icon={CheckCircle2}>
          <span className={`inline-flex px-3 py-1 rounded-full border text-sm font-black ${TONE_BADGE[account.tone]}`}>{account.label}</span>
          <p className="text-[11px] text-slate-400">{paid ? 'কোর্স এক্সেস সক্রিয়' : 'পেমেন্ট সম্পন্ন হলে এক্সেস সক্রিয় হবে'}</p>
        </Kpi>

        <Kpi title="এনরোল্ড কোর্স" icon={Layers}>
          {enrolledCourses.length ? (
            <div className="text-sm font-bold text-white space-y-0.5">
              {enrolledCourses.map((c) => (
                <div key={c.courseId} className="truncate" title={c.name}>
                  {c.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm font-bold text-slate-400">কোনো কোর্সে এনরোল নেই</div>
          )}
        </Kpi>

        <Kpi title="মোট ট্রানজেকশন" icon={CreditCard}>
          <div className="text-2xl font-black text-white">
            {toBn(payments.length)} <span className="text-xs text-slate-400 font-normal">টি</span>
          </div>
          <p className="text-[11px] text-slate-400">
            সফল {toBn(validPayments.length)} • অন্যান্য {toBn(payments.length - validPayments.length)}
          </p>
        </Kpi>
      </div>

      {/* History */}
      <div className="bg-[#051329] border border-[#C59B27]/25 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#C59B27]/20">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#D4AF37]" /> ট্রানজেকশন হিস্টোরি
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">আপনার অ্যাকাউন্টের সকল পেমেন্ট চেষ্টা — সফল, ব্যর্থ, বাতিল ও ফেরতসহ</p>
        </div>

        {payments.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400 space-y-2">
            <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
            <p>আপনার অ্যাকাউন্টে এখনো কোনো পেমেন্ট রেকর্ড নেই।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#081A3A] text-[11px] uppercase tracking-wider text-[#D4AF37] border-b border-[#C59B27]/20">
                <tr>
                  <th className="py-3.5 px-5">ট্রানজেকশন আইডি</th>
                  <th className="py-3.5 px-5">তারিখ ও সময়</th>
                  <th className="py-3.5 px-5">বিবরণ / কোর্স</th>
                  <th className="py-3.5 px-5">পেমেন্ট মেথড</th>
                  <th className="py-3.5 px-5">পরিমাণ</th>
                  <th className="py-3.5 px-5">স্ট্যাটাস</th>
                  <th className="py-3.5 px-5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C59B27]/15">
                {payments.map((p) => {
                  const retry = RETRYABLE_PAYMENT.includes(p.status) && p.courseId && !enrolledIds.includes(p.courseId);
                  return (
                    <tr key={p._id || p.tranId} className="hover:bg-[#0B2545]/40 transition-colors align-top">
                      <td className="py-4 px-5 font-mono font-bold text-[#D4AF37]">
                        <div className="flex items-center gap-2">
                          <span className="break-all">{p.tranId}</span>
                          <CopyButton
                            text={p.tranId}
                            iconOnly
                            title="ট্রানজেকশন আইডি কপি করুন"
                            className="text-slate-500 hover:text-[#D4AF37] transition-colors"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-300 whitespace-nowrap">{formatDate(p.createdAt, { time: true })}</td>
                      <td className="py-4 px-5">
                        <div className="text-slate-200 font-semibold">{PAYMENT_PURPOSE[p.purpose] || 'কোর্স ফি'}</div>
                        {p.courseName && <div className="text-[10px] text-slate-500">{p.courseName}</div>}
                      </td>
                      <td className="py-4 px-5 text-slate-300">{paymentMethodText(p)}</td>
                      <td className="py-4 px-5 font-bold text-[#D4AF37] text-sm whitespace-nowrap">{formatAmount(p.amount, p.currency)}</td>
                      <td className="py-4 px-5">
                        <PaymentStatusBadge status={p.status} />
                        {hasRefund(p) && (
                          <div className="mt-1.5 text-[10px] text-sky-300 flex items-start gap-1">
                            <RotateCcw className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>
                              রিফান্ড{Number(p.refund.amount) > 0 ? `: ${formatAmount(p.refund.amount, p.currency)}` : ''}
                              {p.refund.status ? ` • ${p.refund.status}` : ''}
                              {p.refund.refId ? ` • Ref: ${p.refund.refId}` : ''}
                              {p.refund.requestedAt ? ` • ${formatDate(p.refund.requestedAt)}` : ''}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {p.status === 'VALID' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(p)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#081A3A] hover:bg-[#0B2545] text-[#D4AF37] font-bold text-xs border border-[#C59B27]/40 hover:border-[#D4AF37] transition-all shadow-sm whitespace-nowrap"
                          >
                            <Receipt className="w-3.5 h-3.5" /> ইনভয়েস
                          </button>
                        ) : retry ? (
                          <Link
                            href={checkoutHref(p.courseId)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs border border-amber-500/40 whitespace-nowrap"
                          >
                            আবার চেষ্টা করুন
                          </Link>
                        ) : (
                          <span className="text-[11px] text-slate-500">{p.status === 'PENDING' ? 'যাচাই চলছে' : '—'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice modal — VALID payments only */}
      {selectedInvoice && (
        <InvoiceModal payment={selectedInvoice} user={user} contact={contact} onClose={closeInvoice} />
      )}
    </div>
  );
}

function Kpi({ title, icon: Icon, children }) {
  return (
    <div className="bg-[#051329]/90 border border-[#C59B27]/25 p-5 rounded-2xl space-y-2 shadow-lg">
      <div className="flex items-center justify-between text-slate-300 text-xs">
        <span>{title}</span>
        <div className="p-2 rounded-xl bg-[#C59B27]/20 text-[#D4AF37]">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {children}
    </div>
  );
}

function InvoiceModal({ payment: p, user, contact, onClose }) {
  const paidAt = p.finalizedAt || p.createdAt;
  const isGateway = /SSLCOMMERZ/i.test(p.paymentMethod || 'SSLCOMMERZ') && p.purpose !== 'manual';
  const amount = formatAmount(p.amount, p.currency);

  return (
    <div className="invoice-print-shell fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" role="dialog" aria-modal="true">
      <style>{PRINT_CSS}</style>
      <div className="invoice-print-shell relative w-full max-w-3xl bg-[#081A3A] border border-[#C59B27]/40 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-[#051329] px-6 py-4 border-b border-[#C59B27]/30 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Receipt className="w-4 h-4 text-[#D4AF37]" />
            <span>অফিসিয়াল ইনভয়েস</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs flex items-center gap-1.5 shadow transition-all border border-[#FDFBF7]/30"
            >
              <Printer className="w-3.5 h-3.5" /> প্রিন্ট / সেভ PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="p-1.5 rounded-xl bg-[#0B2545] hover:bg-[#134074] text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div id="invoice-print-area" className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-[#081A3A] text-[#FDFBF7] print:bg-white print:text-black">
          {/* Invoice header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-[#C59B27]/30 print:border-gray-300 pb-6">
            <div className="flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fajr-logo.png" alt="Fajr Academy" className="w-12 h-12 rounded-2xl object-cover shadow-lg border border-[#C59B27]/40" />
              <div>
                <h3 className="font-black text-xl tracking-tight text-white print:text-black uppercase">{contact.instituteName || 'Fajr Academy'}</h3>
                <p className="text-xs text-[#D4AF37] font-bold">Training of Trainers (TOT) Division</p>
                <p className="text-[10px] text-slate-300 print:text-gray-600 mt-0.5">
                  www.fajracademy.io
                  {contact.helplinePhone ? ` • Helpline: ${contact.helplinePhone}` : ''}
                  {contact.supportEmail ? ` • ${contact.supportEmail}` : ''}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold print:text-emerald-700">
                ✓ পরিশোধিত (PAID)
              </div>
              <div className="text-xs text-slate-300 print:text-gray-600 mt-2">
                ইনভয়েস নং: <span className="font-mono font-bold text-[#D4AF37] print:text-black">{p.tranId}</span>
              </div>
              <div className="text-xs text-slate-300 print:text-gray-600">
                পরিশোধের তারিখ: <span className="font-semibold text-white print:text-black">{formatDate(paidAt, { time: true })}</span>
              </div>
            </div>
          </div>

          {/* Billed to / payment info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#051329]/90 print:bg-gray-50 p-5 rounded-2xl border border-[#C59B27]/30 print:border-gray-200 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-[#D4AF37] uppercase tracking-wider text-[10px]">ট্রেইনি বিবরণ (Billed To):</p>
              <p className="text-sm font-bold text-white print:text-black">{user.fullName}</p>
              <p className="text-slate-300 print:text-gray-700">ট্রেইনি আইডি: {traineeIdOf(user)}</p>
              {user.phone && <p className="text-slate-300 print:text-gray-700">মোবাইল: {user.phone}</p>}
              <p className="text-slate-300 print:text-gray-700">ইমেইল: {user.email}</p>
              {p.courseName && <p className="font-bold text-[#D4AF37] print:text-black">কোর্স: {p.courseName}</p>}
            </div>

            <div className="space-y-1 sm:text-right flex flex-col sm:items-end">
              <p className="font-bold text-[#D4AF37] uppercase tracking-wider text-[10px]">পেমেন্ট তথ্য (Payment Info):</p>
              {isGateway && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="https://securepay.sslcommerz.com/public/image/sslcommerz.png"
                  alt="SSLCommerz"
                  className="h-6 w-auto object-contain bg-white px-1.5 py-0.5 rounded my-1"
                />
              )}
              <p className="text-slate-300 print:text-gray-700">মেথড: {paymentMethodText(p)}</p>
              <p className="text-slate-300 print:text-gray-700 font-mono">Trx ID: {p.tranId}</p>
              {p.bankTranId && <p className="text-slate-300 print:text-gray-700 font-mono">Bank Trx: {p.bankTranId}</p>}
              {p.valId && <p className="text-slate-300 print:text-gray-700 font-mono">Val ID: {p.valId}</p>}
              <p className="text-emerald-400 print:text-emerald-700 font-bold">স্ট্যাটাস: সফলভাবে গৃহীত (VALID)</p>
            </div>
          </div>

          {/* Line items */}
          <div className="border border-[#C59B27]/30 print:border-gray-300 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#051329] text-[#D4AF37] print:bg-gray-100 print:text-gray-700 border-b border-[#C59B27]/30 print:border-gray-300 text-[11px] uppercase">
                <tr>
                  <th className="p-3.5">বিবরণ (Description)</th>
                  <th className="p-3.5 text-center">পরিমাণ</th>
                  <th className="p-3.5 text-right">মূল্য</th>
                  <th className="p-3.5 text-right">মোট</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3.5">
                    <p className="font-bold text-white print:text-black">{PAYMENT_PURPOSE[p.purpose] || 'কোর্স ফি'}</p>
                    {p.courseName && <p className="text-[11px] text-slate-300 print:text-gray-600 mt-0.5">{p.courseName}</p>}
                  </td>
                  <td className="p-3.5 text-center text-slate-300 print:text-black">১</td>
                  <td className="p-3.5 text-right text-slate-300 print:text-black whitespace-nowrap">{amount}</td>
                  <td className="p-3.5 text-right font-bold text-[#D4AF37] print:text-black whitespace-nowrap">{amount}</td>
                </tr>
              </tbody>
              <tfoot className="bg-[#051329]/95 print:bg-gray-50 border-t border-[#C59B27]/30 print:border-gray-300 text-xs font-bold">
                <tr className="text-sm">
                  <td colSpan={3} className="p-3.5 text-right text-[#D4AF37] print:text-black font-black">
                    মোট পরিশোধিত:
                  </td>
                  <td className="p-3.5 text-right text-[#D4AF37] print:text-emerald-700 font-black whitespace-nowrap">{amount}</td>
                </tr>
                {hasRefund(p) && (
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-sky-300 print:text-gray-700">
                      রিফান্ড{p.refund.status ? ` (${p.refund.status})` : ''}:
                    </td>
                    <td className="p-3 text-right text-sky-300 print:text-gray-700 whitespace-nowrap">
                      {Number(p.refund.amount) > 0 ? formatAmount(p.refund.amount, p.currency) : '—'}
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>

          {/* Seal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-[#C59B27]/30 print:border-gray-300 text-xs">
            <div className="space-y-1 text-center sm:text-left text-slate-300 print:text-gray-600">
              <p className="font-bold text-[#D4AF37] print:text-black">বিশেষ দ্রষ্টব্য:</p>
              <p>এটি একটি কম্পিউটার জেনারেটেড ডিজিটাল ইনভয়েস, কোনো স্বাক্ষরের প্রয়োজন নেই।</p>
              <p>{isGateway ? 'পেমেন্টটি SSLCommerz ভ্যালিডেশন সিস্টেমে যাচাইকৃত।' : 'পেমেন্টটি ফজর একাডেমি অফিস কর্তৃক যাচাইকৃত।'}</p>
            </div>
            <div className="border-2 border-dashed border-[#C59B27] print:border-emerald-700 p-3 rounded-2xl text-center rotate-[-4deg] shadow-lg bg-[#051329] print:bg-transparent">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37] print:text-emerald-700">FAJR ACADEMY TOT</div>
              <div className="text-base font-black text-[#D4AF37] print:text-emerald-700">★ PAID &amp; VERIFIED ★</div>
              <div className="text-[9px] text-[#E5B842] print:text-emerald-800 font-mono">REF: {String(p.tranId || '').slice(-10)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
