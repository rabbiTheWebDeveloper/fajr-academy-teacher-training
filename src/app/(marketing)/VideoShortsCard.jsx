'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

export default function VideoShortsCard({
  videoId,
  title,
  subtitle,
  badgeText,
  badgeBg = 'bg-[#0B1A45]',
  thumbnailUrl,
}) {
  const [isPlaying, setIsPlaying] = useState(false)

  const defaultThumbnail =
    thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Badge */}
      <div className={`${badgeBg} text-amber-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-3 inline-flex items-center gap-2 shadow-md border border-amber-400/30`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>{badgeText}</span>
      </div>

      {/* 9:16 Shorts Card */}
      <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl group cursor-pointer border border-white/10 hover:border-amber-400/40 bg-slate-950 transition-all duration-300 hover:-translate-y-1 hover:shadow-black/60">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&controls=1&playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div
            className="relative w-full h-full"
            onClick={() => setIsPlaying(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setIsPlaying(true)
            }}
            aria-label={`Play video: ${title}`}
          >
            {/* Thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={defaultThumbnail}
              alt={title}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/50" />

            {/* Shorts Badge Top Left */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold border border-white/15 shadow-sm">
              <span className="w-2 h-2 rounded-sm bg-red-600 flex items-center justify-center text-[7px]">▶</span>
              <span>Shorts</span>
            </div>

            {/* Play Button Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center shadow-xl shadow-red-600/30 group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
            </div>

            {/* Bottom Overlay Title & Channel */}
            <div className="absolute bottom-4 left-4 right-4 text-left pointer-events-none">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-[#0B1A45] border border-amber-400/50 flex items-center justify-center text-[10px] font-bold text-amber-300 shadow-sm">
                  F
                </div>
                <span className="text-white text-xs font-bold tracking-wide">Fajr Academy</span>
              </div>
              <p className="text-white text-sm font-bold leading-snug drop-shadow-md line-clamp-2">{title}</p>
            </div>
          </div>
        )}
      </div>

      {/* Subtitle below card */}
      <div className="mt-3.5 text-center">
        <h3 className="text-sm sm:text-base font-bold text-slate-800">{subtitle}</h3>
      </div>
    </div>
  )
}
