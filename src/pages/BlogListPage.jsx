import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BLOG_MANIFEST } from '../posts/manifest.ts'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import {ChevronDown, ChevronRight} from 'lucide-react'


// Metadata for all posts comes from the build-time manifest (see
// scripts/build-blog-manifest.mjs) instead of eager-loading every post's
// full body — that used to inline the entire blog (2.6MB+ and growing) into
// this page's JS chunk just to show a list of titles/excerpts.
const ALL_POSTS = [...BLOG_MANIFEST].sort((a, b) => {
  // Series posts sort by slug within each folder; standalone by title
  if (a.folderName && b.folderName && a.folderName === b.folderName) {
    return a.slug.localeCompare(b.slug)
  }
  return 0
})

function SeriesFolder({ folderName, posts, readSet, navigate }) {
  // Private state for this specific folder instance
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      
      {/* 1. We added cursor-pointer and an onClick handler to the header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          {/* 2. We render a Chevron icon based on the state */}
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          
          <span className="text-base">📚</span>
          <span className="font-semibold text-slate-900 dark:text-white text-sm">{folderName}</span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
      </div>
      
      {/* 3. We conditionally render the list, and wrap it in a scrollable div */}
      {isOpen && (
        <div className="max-h-[300px] overflow-y-auto">
          {posts.map((post, i) => (
            
            <button
              key={post.slug}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="w-full text-left flex items-center gap-4 px-5 py-3.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <span className="text-xs text-slate-400 dark:text-slate-500 w-5 text-right shrink-0">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-normal break-words leading-snug">
                  {post.title}
                </p>
                {post.excerpt && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{post.excerpt}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {readSet.has(post.slug) && (
                  <span title="Read" className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                )}
                <span className="text-xs text-slate-400 dark:text-slate-500">{post.readMin} min</span>
              </div>
            </button>
            
          ))}
        </div>
      )}
    </div>
  )
}

export default function BlogListPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [readSlugs] = useLocalStorage('oc-blog-read', [])
  const readSet = useMemo(() => new Set(readSlugs), [readSlugs])

  const { series, standalone, filtered } = useMemo(() => {
    if (query.trim()) {
      const q = query.toLowerCase()
      const filtered = ALL_POSTS.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.topics.some(t => t.toLowerCase().includes(q)) ||
          (p.folderName || '').toLowerCase().includes(q)
      )
      return { series: null, standalone: null, filtered }
    }

    const seriesMap = {}
    const standalone = []
    for (const post of ALL_POSTS) {
      if (post.folderName) {
        if (!seriesMap[post.folderName]) seriesMap[post.folderName] = []
        seriesMap[post.folderName].push(post)
      } else {
        standalone.push(post)
      }
    }
    // Sort each series' posts by slug
    for (const posts of Object.values(seriesMap)) {
      posts.sort((a, b) => a.slug.localeCompare(b.slug))
    }
    return { series: seriesMap, standalone, filtered: null }
  }, [query])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Blog</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Deep-dives on computer science, math, and programming — with runnable code.
          </p>
        </div>
        <button
          onClick={() => navigate('/blog/new')}
          className="shrink-0 mt-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          + New Post
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search posts…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
        />
      </div>

      {/* Search results — flat list */}
      {filtered !== null && (
        filtered.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 text-center py-16 text-sm">
            No posts match "{query}"
          </p>
        ) : (
          <div className="space-y-4">
            {filtered.map(post => <PostCard key={post.slug} post={post} navigate={navigate} isRead={readSet.has(post.slug)} />)}
          </div>
        )
      )}

      {/* Grouped view */}
      {filtered === null && (
        <div className="space-y-8">
          {/* Series groups */}
          {/* Series groups */}
          {Object.entries(series).map(([folderName, posts]) => (
            <SeriesFolder 
              key={folderName} 
              folderName={folderName} 
              posts={posts} 
              readSet={readSet} 
              navigate={navigate} 
            />
          ))}

          {/* Standalone posts */}
          {standalone.length > 0 && (
            <div className="space-y-4">
              {Object.keys(series).length > 0 && (
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">Standalone Posts</h2>
              )}
              {standalone.map(post => <PostCard key={post.slug} post={post} navigate={navigate} isRead={readSet.has(post.slug)} />)}
            </div>
          )}

          {ALL_POSTS.length === 0 && (
            <p className="text-slate-400 dark:text-slate-500 text-center py-16 text-sm">No posts yet.</p>
          )}
        </div>
      )}

      {/* Drop-in hint */}
      <div className="mt-12 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center">
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Drop a{' '}
          <code className="text-slate-600 dark:text-slate-300 text-xs bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">.md</code>{' '}
          file into{' '}
          <code className="text-slate-600 dark:text-slate-300 text-xs bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">src/posts/</code>{' '}
          or a subfolder for a series — it appears here automatically.
        </p>
      </div>
    </div>
  )
}

function PostCard({ post, navigate, isRead }) {
  return (
    <button
      onClick={() => navigate(`/blog/${post.slug}`)}
      className="w-full text-left group block rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-2 flex items-center gap-2">
            {post.title}
            {isRead && <span title="Read" className="text-emerald-600 dark:text-emerald-400 text-sm shrink-0">✓</span>}
          </h2>
          {post.excerpt && (
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
              {post.excerpt}
            </p>
          )}
          {post.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.topics.map(t => (
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
        <div className="shrink-0 text-right">
          <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{post.readMin} min read</span>
        </div>
      </div>
    </button>
  )
}
