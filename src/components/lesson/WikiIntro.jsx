import { useEffect, useState } from 'react'

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// Build a search query that's specific enough to avoid disambiguation/vague results.
// Title alone is often ambiguous ("Vector" = math, biology, software…).
// Appending the first few tags narrows it dramatically.
function buildQuery(title, tags) {
  const hint = (tags ?? []).slice(0, 3).join(' ')
  return hint ? `${title} ${hint}` : title
}

async function fetchWikiByQuery(title, tags) {
  const q = buildQuery(title, tags)
  const cacheKey = `wiki:q:${q}`
  try {
    const raw = localStorage.getItem(cacheKey)
    if (raw) {
      const cached = JSON.parse(raw)
      if (Date.now() - cached.ts < CACHE_TTL_MS) return cached
    }
  } catch { /* corrupt cache — ignore */ }

  // Step 1: search for the best matching article title
  const searchRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=1`,
    { headers: { 'Accept': 'application/json' } }
  )
  if (!searchRes.ok) return null
  const searchData = await searchRes.json()
  const articleTitle = searchData?.query?.search?.[0]?.title
  if (!articleTitle) return null

  // Step 2: fetch the clean summary for that article
  const summaryRes = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(articleTitle)}`,
    { headers: { 'Accept': 'application/json' } }
  )
  if (!summaryRes.ok) return null
  const data = await summaryRes.json()

  // Skip disambiguation pages — they have no useful extract
  if (data.type === 'disambiguation' || data.type === 'no-extract') return null

  const entry = {
    ts:      Date.now(),
    title:   data.title,
    extract: data.extract,
    thumb:   data.thumbnail?.source ?? null,
    url:     data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`,
  }
  try { localStorage.setItem(cacheKey, JSON.stringify(entry)) } catch { /* storage full */ }
  return entry
}

export default function WikiIntro({ query, tags }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchWikiByQuery(query, tags).then(result => {
      if (!cancelled) { setData(result); setLoading(false) }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [query])

  // Don't take up space while loading or on failure
  if (loading) return (
    <div className="oc-shell-card mb-10 p-6 sm:p-7 animate-pulse">
      <div className="flex gap-5">
        <div className="hidden sm:block w-[140px] h-[96px] rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-2.5 py-1">
          <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 w-1/4" />
          <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 w-full" />
          <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 w-full" />
          <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 w-3/4" />
        </div>
      </div>
    </div>
  )

  if (!data) return null

  return (
    <section className="oc-shell-card mb-10 overflow-hidden">
      <div className="p-6 sm:p-7">
        {/* Badge */}
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            {/* Wikipedia "W" logo simplified */}
            <svg className="h-3.5 w-3.5 opacity-70" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.931-1.532.029-1.406-3.321-4.293-9.144-5.651-12.409-.251-.601-.441-.987-.619-1.139-.181-.15-.554-.24-1.122-.271C.103 5.033 0 4.982 0 4.898v-.455l.052-.045c.924-.005 5.401 0 5.401 0l.051.045v.434c0 .119-.075.176-.225.176-.564.031-.752.116-.752.317 0 .123.044.434.203.94 1.652 5.125 4.466 11.929 4.466 11.929.439-1.007 1.296-2.945 2.112-4.911.213-.51.323-.783.323-.878 0-.107-.173-.463-.527-1.063-.354-.602-.606-.968-.604-1.024.002-.072.042-.146.122-.198.124-.082.266-.148.423-.155h3.168l.05.045v.434c0 .107-.075.171-.225.171-1.015.079-1.131.174-1.131.359 0 .121.065.346.196.675 1.268 3.12 3.354 8.035 3.354 8.035.641-1.503 3.159-7.612 3.159-7.612.099-.256.151-.484.151-.621 0-.195-.115-.311-.348-.354-.233-.043-.381-.087-.449-.135-.066-.047-.1-.11-.1-.188v-.434l.051-.045h4.049l.05.045v.434c0 .107-.074.171-.222.171-.484.036-.814.118-.986.247-.172.128-.36.42-.56.877-1.845 4.237-4.501 10.544-6.024 14.107-.281.66-.563.895-.83.895-.269 0-.547-.318-.833-.951-2.069-4.677-4.232-9.594-4.232-9.594z"/>
            </svg>
            From Wikipedia
          </span>
        </div>

        {/* Content row */}
        <div className="flex gap-5 items-start">
          {data.thumb && (
            <div className="hidden sm:block shrink-0">
              <img
                src={data.thumb}
                alt={data.title}
                className="w-[140px] rounded-lg object-cover shadow-md border border-slate-200 dark:border-slate-700"
                style={{ maxHeight: '160px' }}
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-base leading-7 text-slate-700 dark:text-slate-300 line-clamp-5">
              {data.extract}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
          >
            Read full article on Wikipedia
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
