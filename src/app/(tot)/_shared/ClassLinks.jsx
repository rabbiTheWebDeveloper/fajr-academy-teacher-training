"use client";

import { Video, MessageCircle, Link2Off } from "lucide-react";
import CopyButton from "./CopyButton";
import { usableLink } from "./format";

/**
 * Live-class (Meet/Zoom) and WhatsApp buttons for ONE enrolled course. Links come from
 * the course record (empty for unpaid users); missing/placeholder links show
 * "এখনো যুক্ত করা হয়নি" instead of a dead button.
 */
export default function ClassLinks({ meetLink, whatsappLink, layout = "row" }) {
  const meet = usableLink(meetLink);
  const whatsapp = usableLink(whatsappLink);
  const stacked = layout === "stack";

  return (
    <div className={stacked ? "space-y-2.5" : "flex flex-wrap items-center gap-3"}>
      {meet ? (
        <a
          href={meet}
          target="_blank"
          rel="noopener noreferrer"
          className={`${
            stacked ? "w-full justify-center py-3" : "px-6 py-3.5"
          } rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#C59B27]/30 transition-all border border-[#FDFBF7]/30`}
        >
          <Video className="w-4 h-4" /> লাইভ ক্লাসরুমে প্রবেশ করুন
        </a>
      ) : (
        <span
          className={`${
            stacked ? "w-full justify-center py-3" : "px-5 py-3.5"
          } rounded-xl bg-slate-800/60 text-slate-400 font-semibold text-xs flex items-center gap-2 border border-slate-700/60 cursor-not-allowed`}
        >
          <Link2Off className="w-4 h-4" /> লাইভ ক্লাসের লিংক এখনো যুক্ত করা হয়নি
        </span>
      )}

      <div className={stacked ? "flex items-center gap-2" : "contents"}>
        {meet && (
          <CopyButton
            text={meet}
            label="মিট লিংক কপি"
            copiedLabel="লিংক কপি হয়েছে!"
            className={`${
              stacked ? "flex-1 py-2.5" : "px-4 py-3.5"
            } rounded-xl bg-[#051329] hover:bg-[#081A3A] text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#C59B27]/25`}
          />
        )}

        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              stacked ? "flex-1 py-2.5" : "px-5 py-3.5"
            } rounded-xl bg-[#081A3A] hover:bg-[#0B2545] text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30 transition-all`}
          >
            <MessageCircle className="w-4 h-4" /> অফিসিয়াল হোয়াটসঅ্যাপ গ্রুপ
          </a>
        ) : (
          <span
            className={`${
              stacked ? "flex-1 py-2.5" : "px-4 py-3.5"
            } rounded-xl bg-slate-800/60 text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-not-allowed`}
          >
            <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপ গ্রুপ এখনো যুক্ত করা হয়নি
          </span>
        )}
      </div>
    </div>
  );
}
