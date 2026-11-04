'use client'

import { useState } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { toBengaliNumber } from '@/lib/utils'
import { NO_DATE } from './course-dates'

const TONES = {
  men: {
    chip: 'text-blue-700 bg-blue-50 border-blue-200',
    dot: 'bg-blue-600',
    active: 'text-blue-800',
  },
  women: {
    chip: 'text-rose-700 bg-rose-50 border-rose-200',
    dot: 'bg-rose-600',
    active: 'text-rose-800',
  },
}

/**
 * Date-wise class schedule. Phones get a segmented switch (one batch at a time, like an app tab
 * bar); from the large breakpoint up both batches sit side by side.
 *
 * batches: [{ key: 'men'|'women', label, name, orientation, range, rows: [{ key, no, title, trainer, date, time }] }]
 */
export default function BatchSchedule({ batches = [] }) {
  const [active, setActive] = useState(batches[0]?.key)

  return (
    <div>
      <div
        role="tablist"
        aria-label="ব্যাচ নির্বাচন করুন"
        className="mx-auto mb-5 grid max-w-md grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 lg:hidden"
      >
        {batches.map((b) => {
          const on = active === b.key
          const tone = TONES[b.key] || TONES.men
          return (
            <button
              key={b.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(b.key)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-all ${
                on ? `bg-white shadow ${tone.active}` : 'text-slate-500'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
              {b.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {batches.map((batch) => {
          const tone = TONES[batch.key] || TONES.men
          return (
            <div
              key={batch.key}
              role="tabpanel"
              className={`${active === batch.key ? 'block' : 'hidden'} lg:block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="min-w-0">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${tone.chip}`}>
                    {batch.label}
                  </span>
                  <h3 className="mt-2 text-base font-bold leading-snug text-slate-900 sm:text-lg">{batch.name}</h3>
                </div>
                <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {toBengaliNumber(batch.rows.length)}টি সেশন
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">ওরিয়েন্টেশন</p>
                    <p className="text-sm font-bold text-slate-900">{batch.orientation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">পুরো সেশন সময়কাল</p>
                    <p className="text-sm font-bold text-slate-900">{batch.range}</p>
                  </div>
                </div>
              </div>

              <ol className="mt-4 divide-y divide-slate-100">
                {batch.rows.map((r) => (
                  <li key={r.key} className="flex items-start gap-3 py-3.5 sm:gap-4">
                    <div className="w-12 shrink-0 rounded-xl bg-slate-50 py-1.5 text-center sm:w-14">
                      <div className="text-[10px] font-bold uppercase text-slate-400">সেশন</div>
                      <div className="text-lg font-black text-slate-900">{toBengaliNumber(r.no)}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold ${r.date === NO_DATE ? 'text-slate-400' : 'text-slate-900'}`}>
                        {r.date}
                      </p>
                      {r.time && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" /> {r.time}
                        </p>
                      )}
                      {r.title && <p className="mt-1 text-xs leading-snug text-slate-700">{r.title}</p>}
                      {r.trainer && <p className="mt-0.5 text-[11px] text-slate-500">ট্রেইনার: {r.trainer}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )
        })}
      </div>
    </div>
  )
}
