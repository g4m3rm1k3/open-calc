import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Vite: load all .md files in src/posts/ as raw strings at build time
const POST_MODULES = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default', eager: true })

function fileToSlug(path) {
  return path
    .replace(/^.*\//, '')      // strip directory
    .replace(/\.md$/, '')      // strip extension
    .replace(/\s+/g, '-')      // spaces → hyphens
    .toLowerCase()
}

function extractMeta(raw, path) {
  const slug = fileToSlug(path)
  const lines = raw.split('\n')

  // Title: first H1
  const h1 = lines.find((l) => l.startsWith('# '))
  const title = h1 ? h1.replace(/^# /, '').trim() : slug

  // Excerpt: first non-empty, non-heading paragraph (up to 220 chars)
  let excerpt = ''
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('#') || t.startsWith('---') || t.startsWith('```')) continue
    excerpt = t.length > 220 ? t.slice(0, 220) + '…' : t
    break
  }

  // Tags: scan for ## headings as rough topics
  const topics = lines
    .filter((l) => l.startsWith('## '))
    .map((l) => l.replace(/^## /, '').trim())
    .slice(0, 4)

  // Estimate read time (200 wpm)
  const wordCount = raw.split(/\s+/).length
  const readMin = Math.max(1, Math.round(wordCount / 200))

  return { slug, title, excerpt, topics, readMin }
}

const ALL_POSTS = Object.entries(POST_MODULES).map(([path, raw]) =>
  extractMeta(raw, path)
)

export default function BlogListPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const posts = useMemo(() => {
    if (!query.trim()) return ALL_POSTS
    const q = query.toLowerCase()
    return ALL_POSTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.topics.some((t) => t.toLowerCase().includes(q))
    )
  }, [query])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
          Blog
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Deep-dives on computer science, math, and programming — with runnable code.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search posts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
        />
      </div>

      {/* Post list */}
      {posts.length === 0 ? (
        <p className="text-slate-400 dark:text-slate-500 text-center py-16 text-sm">
          No posts match "{query}"
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <button
              key={post.slug}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="w-full text-left group block rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                  )}
                  {post.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.topics.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {post.readMin} min read
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Drop-in hint */}
      <div className="mt-12 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center">
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Drop a <code className="text-slate-600 dark:text-slate-300 text-xs bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">.md</code> file into{' '}
          <code className="text-slate-600 dark:text-slate-300 text-xs bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">src/posts/</code>{' '}
          and it appears here automatically.
        </p>
      </div>
    </div>
  )
}
