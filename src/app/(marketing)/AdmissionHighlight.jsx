import { ArrowRight, BadgePercent, Check, Flame, Lock } from 'lucide-react'
import AdmitLink from './AdmitLink'
import MessengerIcon from './MessengerIcon'
import { FACEBOOK_MESSENGER_URL } from './contact'
import { discountPercent, seatLine } from './admission'
import { toBengaliNumber } from '@/lib/utils'

const PERKS = ['৪টি লাইভ সেশন', 'অফিসিয়াল সার্টিফিকেট', 'আজীবন রেকর্ডিং', 'শিক্ষক নিয়োগের সুযোগ']

const SEAT_TONE = {
  urgent: 'text-rose-300',
  info: 'text-emerald-300',
  plain: 'text-slate-400',
}

/**
 * The admission highlight: fee, saving, what is included and one "ভর্তি হোন" button per batch.
 * Server component — every number comes from the live settings / course records.
 */
export default function AdmissionHighlight({ price, regularPrice, batchLabel, mode, batches }) {
  const closed = mode === 'closed'
  const percent = discountPercent(price, regularPrice)

  return (
    <section id="admission" aria-label="ভর্তি তথ্য" className="relative z-20 -mt-8 px-3 sm:-mt-12 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500/50 to-amber-300 p-[1.5px] shadow-2xl shadow-amber-500/15" data-reveal>
        <div className="relative overflow-hidden rounded-[calc(1.5rem-1.5px)] bg-[#0A1326] p-4 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative grid gap-5 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
            {/* Fee + what you get */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    closed
                      ? 'border border-rose-400/40 bg-rose-500/15 text-rose-200'
                      : 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                  }`}
                >
                  {!closed && <Flame className="h-3.5 w-3.5" />}
                  {closed ? 'ভর্তি সাময়িক বন্ধ' : mode === 'waitlist' ? 'অপেক্ষমাণ তালিকা চলছে' : 'ভর্তি চলছে'}
                </span>
                <span className="text-xs font-semibold tracking-wider text-amber-300/90">{batchLabel}</span>
              </div>

              <h2 className="mt-3 text-xl font-black leading-snug text-white sm:text-3xl">
                {closed ? 'পরবর্তী ব্যাচের জন্য প্রস্তুত থাকুন' : 'আজই আপনার আসনটি নিশ্চিত করুন'}
              </h2>

              {!closed && (
                <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                  <span className="text-4xl font-black leading-none text-amber-300 sm:text-5xl">
                    ৳{toBengaliNumber(price)}
                  </span>
                  {Number(regularPrice) > Number(price) && (
                    <span className="pb-1 text-base text-slate-400 line-through">৳{toBengaliNumber(regularPrice)}</span>
                  )}
                  {percent > 0 && (
                    <span className="mb-0.5 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-black text-slate-950">
                      <BadgePercent className="h-3.5 w-3.5" /> {toBengaliNumber(percent)}% ছাড়
                    </span>
                  )}
                  <span className="basis-full text-xs text-slate-400">এককালীন রেজিস্ট্রেশন ফি</span>
                </div>
              )}

              <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-[13px] leading-snug text-slate-200 sm:text-sm">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>

              <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400 sm:text-xs">
                <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                SSLCommerz-এর মাধ্যমে বিকাশ, নগদ, রকেট ও কার্ডে নিরাপদ পেমেন্ট
              </p>
            </div>

            {/* One button per batch */}
            <div className="flex flex-col gap-3">
              {batches.map((b) => {
                const seat = seatLine(b.course, toBengaliNumber)
                const isMen = b.key === 'men'
                return (
                  <div
                    key={b.key}
                    className={`rounded-2xl border p-3.5 sm:p-4 ${
                      isMen ? 'border-blue-400/30 bg-blue-500/[0.07]' : 'border-rose-400/30 bg-rose-500/[0.07]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-sm font-black ${isMen ? 'text-blue-200' : 'text-rose-200'}`}>{b.label}</p>
                        <p className="mt-0.5 text-xs leading-snug text-slate-300">
                          ওরিয়েন্টেশন: <strong className="text-white">{b.orientation}</strong>
                        </p>
                      </div>
                      <span className={`shrink-0 text-right text-[11px] font-semibold leading-tight ${SEAT_TONE[seat.tone]}`}>
                        {seat.text}
                      </span>
                    </div>

                    {closed ? (
                      <a
                        href={FACEBOOK_MESSENGER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 text-sm font-bold text-white active:scale-[0.98] transition-transform"
                      >
                        <MessengerIcon className="h-5 w-5 text-sky-400" boltColor="#0A1326" /> আপডেট জানতে মেসেজ করুন
                      </a>
                    ) : (
                      <AdmitLink
                        track={b.key}
                        className={`cta-shine mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-black active:scale-[0.98] transition-transform ${
                          isMen
                            ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-slate-950'
                            : 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 text-white'
                        }`}
                      >
                        {b.cta}
                        <ArrowRight className="h-4 w-4 stroke-[3]" />
                      </AdmitLink>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
