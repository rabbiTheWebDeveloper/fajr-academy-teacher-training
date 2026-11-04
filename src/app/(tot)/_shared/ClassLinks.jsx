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
            stacked ? "w-full justify-center py-3" : "px-5 py-3"
          } flex items-center gap-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500`}
        >
          <Video className="h-4 w-4" /> লাইভ ক্লাসে প্রবেশ করুন
        </a>
      ) : (
        <span
          className={`${
            stacked ? "w-full justify-center py-3" : "px-5 py-3"
          } flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 text-sm text-slate-500`}
        >
          <Link2Off className="h-4 w-4" /> লাইভ ক্লাসের লিংক এখনো যুক্ত করা হয়নি
        </span>
      )}

      <div className={stacked ? "flex items-center gap-2" : "contents"}>
        {meet && (
          <CopyButton
            text={meet}
            label="মিট লিংক কপি"
            copiedLabel="কপি হয়েছে"
            className={`${
              stacked ? "flex-1 py-2.5" : "px-4 py-3"
            } flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:text-white`}
          />
        )}

        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              stacked ? "flex-1 py-2.5" : "px-4 py-3"
            } flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/10`}
          >
            <MessageCircle className="h-4 w-4" /> হোয়াটসঅ্যাপ গ্রুপ
          </a>
        ) : (
          <span
            className={`${
              stacked ? "flex-1 py-2.5" : "px-4 py-3"
            } flex cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-slate-800 text-sm text-slate-500`}
          >
            <MessageCircle className="h-4 w-4" /> হোয়াটসঅ্যাপ গ্রুপ এখনো যুক্ত করা হয়নি
          </span>
        )}
      </div>
    </div>
  );
}
