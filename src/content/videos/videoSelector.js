import { VIDEO_LIBRARY } from './videoLibrary.generated.js'

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function scoreVideo(video, keywords) {
  const hay = new Set([...(video.keywords || []), ...normalize(video.title), ...normalize(video.source), ...normalize((video.tags || []).join(' '))])
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

  const ranked = pool
    .map((v) => ({ v, score: scoreVideo(v, k) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.v)

  return ranked
}

export function toVideoEmbedBlock(video, title = null) {
  return {
    type: 'viz',
    id: 'VideoEmbed',
    title: title || video.title || 'Video',
    props: { url: video.url },
  }
}

export function toVideoCarouselBlock(videos, title = 'Related Videos') {
  return {
    type: 'viz',
    id: 'VideoCarousel',
    title,
    props: {
      videos: videos.map((v) => ({
        title: v.title,
        url: v.url,
      })),
    },
  }
}
