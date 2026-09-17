'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

export default function VideoShortsCard({
  videoId,
  title,
  subtitle,
  badgeText,
  badgeBg = 'bg-[#0B1120]',
  thumbnailUrl,
}) {
  const [isPlaying, setIsPlaying] = useState(false)

  const defaultThumbnail =
    thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div className="flex flex-col items-center">
      {/* Badge */}
      <div className={`${badgeBg} text-white text-xs font-bold px-4 py-2 rounded-full mb-4 inline-flex items-center gap-2 shadow-md border border-white/10`}>
        <span>{badgeText}</span>
      </div>

      {/* 9:16 Shorts Card */}
      <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer card-3d border border-gray-700/50 bg-black">
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
              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/50" />

            {/* Shorts Badge Top Left */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold border border-white/10">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-600 flex items-center justify-center text-[8px]">▶</span>
              <span>Shorts</span>
            </div>

            {/* Play Button Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-115 group-hover:bg-red-600 transition-all duration-300">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
            </div>

            {/* Bottom Overlay Title & Channel */}
            <div className="absolute bottom-4 left-4 right-4 text-left pointer-events-none">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-[#1E293B] border border-fajr-gold/50 flex items-center justify-center text-[11px] font-bold text-fajr-gold">
                  F
                </div>
                <span className="text-white text-xs font-bold tracking-wide">Fajr Academy</span>
              </div>
              <p className="text-white text-sm font-bold leading-snug drop-shadow-md">{title}</p>
            </div>
          </div>
        )}
      </div>

      {/* Subtitle below card */}
      <div className="mt-4 text-center">
        <h3 className="text-base md:text-lg font-bold text-gray-900">{subtitle}</h3>
      </div>
    </div>
  )
}
