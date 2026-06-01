import VIDEO_LIBRARY_RAW from '../../../reports/video-library-seed.json'

// Filter out entries without a URL
export const VIDEO_LIBRARY = VIDEO_LIBRARY_RAW.filter((v) => !!v.url)

// O(1) lookup by video id
export const VIDEO_MAP = Object.fromEntries(VIDEO_LIBRARY.map((v) => [v.id, v]))

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function scoreVideo(video, keywords) {
  const hay = new Set([
    ...(video.keywords || []),
    ...(video.tags || []),
    ...normalize(video.title),
    ...normalize(video.source),
  ])
  let score = 0
  for (const kw of keywords) {
    if (hay.has(kw)) score += 3
    else if ([...hay].some((h) => h.includes(kw) || kw.includes(h))) score += 1
  }
  return score
}

export function selectVideosByKeywords({
  keywords = [],
  source = null,
  excludeSources = [],
  limit = 6,
} = {}) {
  const k = normalize(Array.isArray(keywords) ? keywords.join(' ') : keywords)
  if (!k.length) return []

  let pool = VIDEO_LIBRARY

  if (source) {
    pool = pool.filter((v) => v.source === source)
  }

  if (excludeSources.length) {
    const ex = new Set(excludeSources)
    pool = pool.filter((v) => !ex.has(v.source))
  }

  return pool
    .map((v) => ({ v, score: scoreVideo(v, k) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.v)
}
