import { useEffect, useState } from 'react'

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// Only show actual images — skip audio/video
const IMAGE_EXTS   = /\.(svg|png|jpe?g|gif|tiff?|webp)$/i
const AV_EXTS      = /\.(ogg|mp3|wav|flac|ogv|webm|mp4|avi|mov|midi?)$/i

function cleanCaption(fileTitle) {
  return fileTitle
    .replace(/^File:/i, '')
    .replace(/\.\w{2,5}$/, '')
    .replace(/_/g, ' ')
    .trim()
}

// Build a specific Commons search query from the lesson title + a few tags.
// Tagging "diagram" or "illustration" tends to surface SVGs over photos.
function buildQuery(title, tags) {
  const hint = (tags ?? []).slice(0, 2).join(' ')
  return hint ? `${title} ${hint}` : title
}

async function fetchCommonsDiagrams(title, tags) {
  const q = buildQuery(title, tags)
  const cacheKey = `commons:${q}`
  try {
    const raw = localStorage.getItem(cacheKey)
    if (raw) {
      const cached = JSON.parse(raw)
      if (Date.now() - cached.ts < CACHE_TTL_MS) return cached.images
    }
  } catch { /* corrupt — ignore */ }

  // Single request: generator=search over File namespace + imageinfo in one call
  const url = [
    'https://commons.wikimedia.org/w/api.php',
    '?action=query',
    '&generator=search',
    '&gsrnamespace=6',         // File: namespace
    `&gsrsearch=${encodeURIComponent(q)}`,
    '&gsrlimit=10',
    '&prop=imageinfo',
    '&iiprop=url|thumburl',
    '&iiurlwidth=300',
    '&format=json',
    '&origin=*',
  ].join('')

  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return []
  const data = await res.json()

  const images = Object.values(data?.query?.pages ?? {})
    .filter(p => {
      const t = p.title ?? ''
      const u = p.imageinfo?.[0]?.url ?? ''
      return IMAGE_EXTS.test(t) && !AV_EXTS.test(u) && p.imageinfo?.[0]?.thumburl
    })
    .slice(0, 4)
    .map(p => ({
      caption: cleanCaption(p.title),
      thumb:   p.imageinfo[0].thumburl,
      pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
    }))

  try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), images })) } catch { /* storage full */ }
  return images
}

export default function WikiDiagrams({ query, tags }) {
  const [images,  setImages]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchCommonsDiagrams(query, tags).then(imgs => {
      if (!cancelled) { setImages(imgs); setLoading(false) }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [query])

  if (loading) return (
    <div className="oc-shell-card mb-10 p-6 animate-pulse">
      <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 w-40 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="aspect-square rounded-lg bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    </div>
  )

  if (!images.length) return null

  return (
    <section className="oc-shell-card mb-10 overflow-hidden">
      <div className="p-6 sm:p-7">
        {/* Badge */}
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            {/* Wikimedia Commons sunflower mark (simplified) */}
            <svg className="h-3.5 w-3.5 opacity-70" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4.5 3.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm9 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-4.5 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm9 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 17a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
            </svg>
            Wikimedia Commons
          </span>
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <a
              key={i}
              href={img.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 transition-colors"
            >
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                <img
                  src={img.thumb}
                  alt={img.caption}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="px-2 py-1.5 bg-white dark:bg-slate-900">
                <p className="text-[11px] leading-tight text-slate-500 dark:text-slate-400 line-clamp-2">
                  {img.caption}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
