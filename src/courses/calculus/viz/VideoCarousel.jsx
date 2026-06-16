import { useState } from 'react'

/**
 * VideoCarousel — shows multiple videos covering the same topic with
 * prev/next navigation and tab buttons per instructor/title.
 *
 * props.videos: [{ url, title }]
 */
export default function VideoCarousel({ params }) {
  const videos = params?.videos ?? []
  const [idx, setIdx] = useState(0)

  if (!videos.length) return null

  const current = videos[idx]
  const total = videos.length

  return (
    <div className="flex flex-col w-full gap-2">
      {/* Tab buttons — one per video */}
      {total > 1 && (
        <div className="flex flex-wrap gap-1">
          {videos.map((v, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                i === idx
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {v.title ?? `Video ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Video player */}
      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-black">
        <iframe
          key={current.url}
          className="w-full h-full"
          src={current.url}
          title={current.title ?? 'Video player'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Prev / Next controls */}
      {total > 1 && (
        <div className="flex items-center justify-between mt-1">
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="px-3 py-1 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {idx + 1} / {total}
          </span>
          <button
            onClick={() => setIdx(i => Math.min(total - 1, i + 1))}
            disabled={idx === total - 1}
            className="px-3 py-1 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
