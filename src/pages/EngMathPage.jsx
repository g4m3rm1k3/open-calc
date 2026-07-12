import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EngMathReader from '../components/eng-math/EngMathReader.jsx'

// Load interactive lessons from src/eng-math/ (separate from blog posts, never modified)
const POST_MODULES = import.meta.glob(
  '../eng-math/*.md',
  { query: '?raw', import: 'default', eager: true }
)

function pathToSlug(path) {
  return path
    .replace(/^.*\/eng-math\//, '')
    .replace(/\.md$/, '')
}

function extractTitle(raw) {
  const m = raw.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : null
}

// Build ordered list of all eng-math posts (sorted by filename = lesson order)
const ALL_POSTS = Object.entries(POST_MODULES)
  .map(([path, raw]) => ({ slug: pathToSlug(path), title: extractTitle(raw), raw }))
  .filter((p) => p.slug && !p.slug.startsWith('_'))
  .sort((a, b) => {
    // Extract the numeric lesson number from slug like "lesson-0-12-capstone" → 12
    const num = (s) => {
      const m = s.slug.match(/lesson-\d+-(\d+)/)
      return m ? parseInt(m[1], 10) : 0
    }
    return num(a) - num(b)
  })

export default function EngMathPage({ onClose }) {
  const { slug } = useParams()
  const navigate = useNavigate()

  const post = useMemo(
    () => ALL_POSTS.find((p) => p.slug === slug) ?? ALL_POSTS[0],
    [slug]
  )

  const seriesNav = useMemo(() => {
    const idx = ALL_POSTS.findIndex((p) => p.slug === post?.slug)
    return {
      current: `${idx + 1} / ${ALL_POSTS.length}`,
      prev: idx > 0 ? { slug: ALL_POSTS[idx - 1].slug, label: 'Previous' } : null,
      next: idx < ALL_POSTS.length - 1 ? { slug: ALL_POSTS[idx + 1].slug, label: 'Next' } : null,
    }
  }, [post])

  if (!post) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <p className="text-5xl mb-4">📐</p>
        <p className="text-lg font-semibold text-slate-200 mb-2">No lesson found</p>
        <button
          onClick={() => (onClose ? onClose() : navigate('/'))}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors"
        >
          ← Home
        </button>
      </div>
    )
  }

  return (
    <EngMathReader
      key={post.slug}
      content={post.raw}
      title={post.title}
      slug={post.slug}
      seriesNav={seriesNav}
      lessons={ALL_POSTS.map((p) => ({ slug: p.slug, title: p.title }))}
      onClose={onClose}
    />
  )
}
