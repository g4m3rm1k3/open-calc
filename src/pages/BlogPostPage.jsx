import { useParams, useNavigate } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import BlogPost from '../components/blog/BlogPost.jsx'

const POST_MODULES = import.meta.glob('../posts/**/*.md', { query: '?raw', import: 'default', eager: true })

function pathToSlug(path) {
  return path
    .replace(/^.*\/posts\//, '')
    .replace(/\.md$/, '')
    .split('/')
    .map(s =>
      s.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    )
    .join('/')
}

function pathToFolderName(path) {
  const rel = path.replace(/^.*\/posts\//, '')
  const parts = rel.split('/')
  return parts.length > 1 ? parts.slice(0, -1).join('/') : null
}

const ALL_POSTS_META = Object.entries(POST_MODULES).map(([path, raw]) => {
  const slug = pathToSlug(path)
  const h1 = raw.match(/^#\s+(.+)$/m)
  const title = h1 ? h1[1].trim() : slug.split('/').pop().replace(/-/g, ' ')
  return { slug, title, folderName: pathToFolderName(path) }
})

function SeriesNav({ currentSlug, navigate }) {
  const folderSlug = currentSlug.includes('/') ? currentSlug.split('/')[0] : null
  if (!folderSlug) return null

  const seriesPosts = ALL_POSTS_META
    .filter(p => p.slug.startsWith(folderSlug + '/'))
    .sort((a, b) => a.slug.localeCompare(b.slug))

  if (seriesPosts.length < 2) return null

  const currentIndex = seriesPosts.findIndex(p => p.slug === currentSlug)
  const prev = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null
  const next = currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null
  const seriesTitle = seriesPosts[0]?.folderName ?? folderSlug.replace(/-/g, ' ')

  return (
    <div className="mt-16 border-t border-slate-200 dark:border-slate-700 pt-8">
      {/* Series header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Series</span>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{seriesTitle}</span>
      </div>

      {/* Prev / Next */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {prev ? (
          <button
            onClick={() => navigate(`/blog/${prev.slug}`)}
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
          >
            ← {prev.title}
          </button>
        ) : <span />}
        {next ? (
          <button
            onClick={() => navigate(`/blog/${next.slug}`)}
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-right ml-auto"
          >
            {next.title} →
          </button>
        ) : <span />}
      </div>

      {/* Full series list */}
      <div className="space-y-0.5">
        {seriesPosts.map((post, i) => (
          <button
            key={post.slug}
            onClick={() => post.slug !== currentSlug && navigate(`/blog/${post.slug}`)}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              post.slug === currentSlug
                ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium cursor-default'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="text-xs text-slate-400 dark:text-slate-500 w-5 shrink-0 text-right">{i + 1}.</span>
            <span className="flex-1 min-w-0 truncate">{post.title}</span>
            {post.slug === currentSlug && (
              <span className="text-[11px] text-indigo-400 dark:text-indigo-500 shrink-0">you are here</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function BlogPostPage() {
  const { '*': slug } = useParams()
  const navigate = useNavigate()

  const content = useMemo(() => {
    for (const [path, raw] of Object.entries(POST_MODULES)) {
      if (pathToSlug(path) === slug) return raw
    }
    return null
  }, [slug])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (content === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-6">📄</p>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Post not found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">No post with slug "{slug}".</p>
        <button
          onClick={() => navigate('/blog')}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          ← Back to Blog
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 pb-24">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          ← Blog
        </button>
        <button
          onClick={() => navigate('/blog/new', { state: { editSlug: slug } })}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
        >
          Edit Post
        </button>
      </div>

      <BlogPost key={slug} content={content} />

      <SeriesNav currentSlug={slug} navigate={navigate} />
    </div>
  )
}
