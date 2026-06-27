import { useParams, useNavigate } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import BlogPost from '../components/blog/BlogPost.jsx'

const POST_MODULES = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default', eager: true })

function fileToSlug(path) {
  return path
    .replace(/^.*\//, '')
    .replace(/\.md$/, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const content = useMemo(() => {
    for (const [path, raw] of Object.entries(POST_MODULES)) {
      if (fileToSlug(path) === slug) return raw
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
      {/* Back link */}
      <button
        onClick={() => navigate('/blog')}
        className="mb-8 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        ← Blog
      </button>

      <BlogPost key={slug} content={content} />
    </div>
  )
}
