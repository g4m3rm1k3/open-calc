import { useState, useRef, useCallback, lazy, Suspense, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BlogPost from '../components/blog/BlogPost.jsx'
import MarkdownToolbar from '../components/markdown-toolbar/MarkdownToolbar.jsx'
import { useGlobalTheme } from '../context/ThemeContext.jsx'

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })))

// ── Existing posts ────────────────────────────────────────────────────────────

const POST_MODULES = import.meta.glob('../posts/**/*.md', { query: '?raw', import: 'default', eager: true })

function pathToSlug(path) {
  return path
    .replace(/^.*\/posts\//, '')
    .replace(/\.md$/, '')
    .split('/')
    .map(s => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''))
    .join('/')
}

function pathToFolderName(path) {
  const rel = path.replace(/^.*\/posts\//, '')
  const parts = rel.split('/')
  return parts.length > 1 ? parts.slice(0, -1).join('/') : null
}

function globToRepoPath(path) {
  return 'src/' + path.replace(/^\.\.\//, '')
}

const ALL_POSTS = Object.entries(POST_MODULES).map(([path, raw]) => {
  const slug = pathToSlug(path)
  const h1 = raw.match(/^#\s+(.+)$/m)
  const title = h1 ? h1[1].trim() : slug.split('/').pop().replace(/-/g, ' ')
  return { slug, title, folderName: pathToFolderName(path), repoPath: globToRepoPath(path), raw }
})

// ── Constants ─────────────────────────────────────────────────────────────────

const GITHUB_OWNER = 'upskillos'
const GITHUB_REPO = 'open-calc'
const STORAGE_KEY = 'blog_builder_draft'
const TOKEN_KEY = 'github_pat'

const DEFAULT_CONTENT = `# My Blog Post

Write your intro paragraph here. Explain what this post covers and why it matters.

## Section One

Add your first section here. Use the toolbar to insert code blocks, math, tables, and more.

\`\`\`javascript
console.log("Hello, world!")
\`\`\`

## Section Two

Continue here...
`

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function extractTitle(markdown) {
  const m = markdown.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : ''
}

// ── GitHub API ────────────────────────────────────────────────────────────────

async function submitPR({ token, content, slug, title, targetPath }) {
  const base = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`
  const headers = {
    Authorization: `token ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  }

  const refRes = await fetch(`${base}/git/ref/heads/main`, { headers })
  if (!refRes.ok) { const e = await refRes.json(); throw new Error(e.message || `GitHub API ${refRes.status}`) }
  const { object: { sha: baseSha } } = await refRes.json()

  const branch = `blog/${slug.replace(/\//g, '-')}`
  const branchRes = await fetch(`${base}/git/refs`, {
    method: 'POST', headers,
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
  })
  if (!branchRes.ok) { const e = await branchRes.json(); throw new Error(e.message || `Branch: ${branchRes.status}`) }

  const encodedPath = targetPath.split('/').map(encodeURIComponent).join('/')
  const checkRes = await fetch(`${base}/contents/${encodedPath}`, { headers })
  const existingSha = checkRes.ok ? (await checkRes.json()).sha : null

  const contentB64 = btoa(unescape(encodeURIComponent(content)))
  const fileBody = {
    message: existingSha ? `blog: update "${title}"` : `blog: add "${title}"`,
    content: contentB64,
    branch,
  }
  if (existingSha) fileBody.sha = existingSha

  const fileRes = await fetch(`${base}/contents/${encodedPath}`, {
    method: 'PUT', headers,
    body: JSON.stringify(fileBody),
  })
  if (!fileRes.ok) { const e = await fileRes.json(); throw new Error(e.message || `File: ${fileRes.status}`) }

  const prRes = await fetch(`${base}/pulls`, {
    method: 'POST', headers,
    body: JSON.stringify({
      title: existingSha ? `Blog: update "${title}"` : `Blog: ${title}`,
      head: branch, base: 'main',
      body: existingSha
        ? `Updates blog post via the Blog Builder.\n\n**File:** \`${targetPath}\``
        : `New blog post submitted via the Blog Builder.\n\n**File:** \`${targetPath}\``,
    }),
  })
  if (!prRes.ok) { const e = await prRes.json(); throw new Error(e.message || `PR: ${prRes.status}`) }
  return (await prRes.json()).html_url
}

// ── Load modal ────────────────────────────────────────────────────────────────

function LoadModal({ onLoad, onClose }) {
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    searchRef.current?.focus()
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const { seriesMap, standalone } = useMemo(() => {
    const q = query.toLowerCase().trim()
    const source = q
      ? ALL_POSTS.filter(p =>
          p.title.toLowerCase().includes(q) ||
          (p.folderName || '').toLowerCase().includes(q)
        )
      : ALL_POSTS
    const seriesMap = {}
    const standalone = []
    for (const post of source) {
      if (post.folderName) {
        ;(seriesMap[post.folderName] ??= []).push(post)
      } else {
        standalone.push(post)
      }
    }
    for (const posts of Object.values(seriesMap)) {
      posts.sort((a, b) => a.slug.localeCompare(b.slug))
    }
    return { seriesMap, standalone }
  }, [query])

  const rowClass = 'w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors'
  const sectionLabel = 'px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'
  const isEmpty = Object.keys(seriesMap).length === 0 && standalone.length === 0

  return (
    <div
      className="fixed inset-0 z-[800] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg mx-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col" style={{ maxHeight: '78vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Load Post</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by title or series…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1 p-2">
          {isEmpty && (
            <p className="text-sm text-center text-slate-400 dark:text-slate-500 py-10">
              {query ? `No posts matching "${query}"` : 'No posts found in src/posts/'}
            </p>
          )}

          {/* Series groups */}
          {Object.entries(seriesMap).map(([folder, posts]) => (
            <div key={folder} className="mb-1">
              <div className={sectionLabel}>📚 {folder}</div>
              {posts.map((post, i) => (
                <button key={post.slug} onClick={() => onLoad(post)} className={rowClass}>
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-5 text-right shrink-0">{i + 1}.</span>
                  <span className="truncate">{post.title}</span>
                  <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500 shrink-0 font-mono">.md</span>
                </button>
              ))}
            </div>
          ))}

          {/* Standalone posts */}
          {standalone.length > 0 && (
            <div className="mb-1">
              {Object.keys(seriesMap).length > 0 && (
                <div className={sectionLabel}>Standalone</div>
              )}
              {standalone.map(post => (
                <button key={post.slug} onClick={() => onLoad(post)} className={rowClass}>
                  <span className="text-slate-400 dark:text-slate-500 shrink-0 text-xs">•</span>
                  <span className="truncate">{post.title}</span>
                  <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500 shrink-0 font-mono">.md</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer count */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-700 shrink-0">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {ALL_POSTS.length} post{ALL_POSTS.length !== 1 ? 's' : ''} in src/posts/
            {query && ` · ${Object.values(seriesMap).flat().length + standalone.length} matching`}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── PR Modal ──────────────────────────────────────────────────────────────────

function PRModal({ slug, title, targetPath, content, onClose }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [saving, setSaving] = useState(false)
  const [prUrl, setPrUrl] = useState(null)
  const [error, setError] = useState(null)

  const branch = `blog/${slug.replace(/\//g, '-')}`

  async function handleSubmit() {
    const t = token.trim()
    if (!t) { setError('Enter a GitHub personal access token.'); return }
    setSaving(true); setError(null)
    try {
      localStorage.setItem(TOKEN_KEY, t)
      const url = await submitPR({ token: t, content, slug, title, targetPath })
      setPrUrl(url)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl shadow-2xl" style={{ background: '#161b22', border: '1px solid #30363d' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: '#30363d' }}>
          <h2 className="text-base font-bold" style={{ color: '#e6edf3' }}>Submit Blog Post PR</h2>
          <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>
            Opens a pull request on <code style={{ color: '#f97316' }}>{GITHUB_OWNER}/{GITHUB_REPO}</code>
          </p>
        </div>

        {prUrl ? (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: '#0d4429', border: '1px solid #26a641' }}>
              <span>✓</span>
              <span className="text-sm font-semibold" style={{ color: '#3fb950' }}>PR created successfully!</span>
            </div>
            <a href={prUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#238636', color: '#ffffff' }}>
              Open Pull Request on GitHub <span>→</span>
            </a>
            <button onClick={onClose} className="w-full text-sm py-2 rounded-xl"
              style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}>Close</button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#8b949e' }}>
                GitHub Personal Access Token
              </label>
              <input
                type="password" value={token} onChange={e => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full text-sm rounded-lg px-3 py-2 font-mono"
                style={{ background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', outline: 'none' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <p className="text-[11px] mt-1.5" style={{ color: '#6e7681' }}>
                Needs <code style={{ color: '#f97316' }}>repo</code> scope. Stored only in your browser.{' '}
                <a href="https://github.com/settings/tokens/new?scopes=repo&description=UpSkillOS+Blog+Builder"
                  target="_blank" rel="noopener noreferrer" style={{ color: '#388bfd' }}>Create one →</a>
              </p>
            </div>

            <div className="text-xs rounded-lg p-3 space-y-1" style={{ background: '#21262d', border: '1px solid #30363d' }}>
              <div style={{ color: '#8b949e' }}>Branch: <code style={{ color: '#e6edf3' }}>{branch}</code></div>
              <div style={{ color: '#8b949e' }}>File: <code style={{ color: '#e6edf3' }}>{targetPath}</code></div>
              <div style={{ color: '#8b949e' }}>Title: <code style={{ color: '#e6edf3' }}>{title}</code></div>
            </div>

            {error && (
              <div className="text-xs rounded-lg p-3" style={{ background: '#3d0a0a', border: '1px solid #f8514933', color: '#f85149' }}>
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 text-sm py-2 rounded-xl"
                style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 text-sm py-2 rounded-xl font-semibold"
                style={{ background: saving ? '#238636aa' : '#238636', color: '#ffffff', cursor: saving ? 'wait' : 'pointer' }}>
                {saving ? 'Submitting…' : 'Submit PR'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BlogBuilderPage() {
  const { isDarkGlobal } = useGlobalTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)

  const [content, setContent] = useState(() => sessionStorage.getItem(STORAGE_KEY) || DEFAULT_CONTENT)
  const [sourcePost, setSourcePost] = useState(null)
  const [showPRModal, setShowPRModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)

  // If navigated here from "Edit Post" button, load that post immediately
  useEffect(() => {
    const editSlug = location.state?.editSlug
    if (!editSlug) return
    const post = ALL_POSTS.find(p => p.slug === editSlug)
    if (post) {
      setContent(post.raw)
      setSourcePost({ slug: post.slug, repoPath: post.repoPath })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const monacoTheme = isDarkGlobal ? 'vs-dark' : 'vs'

  const derivedTitle = extractTitle(content) || 'Untitled'
  const derivedSlug = slugify(derivedTitle) || 'untitled'
  const effectiveSlug = sourcePost?.slug ?? derivedSlug
  const effectivePath = sourcePost?.repoPath ?? `src/posts/${derivedSlug}.md`
  const downloadName = sourcePost?.repoPath?.split('/').pop() ?? `${derivedSlug}.md`

  function handleChange(val) {
    const v = val ?? ''
    setContent(v)
    sessionStorage.setItem(STORAGE_KEY, v)
  }

  function handleNew() {
    if (content.trim() !== DEFAULT_CONTENT.trim() &&
      !window.confirm('Start a new post? Unsaved edits will be lost.')) return
    setContent(DEFAULT_CONTENT)
    setSourcePost(null)
    sessionStorage.setItem(STORAGE_KEY, DEFAULT_CONTENT)
  }

  function handleLoadPost(post) {
    setContent(post.raw)
    setSourcePost({ slug: post.slug, repoPath: post.repoPath })
    setShowLoadModal(false)
    sessionStorage.setItem(STORAGE_KEY, post.raw)
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target.result
      setContent(text)
      setSourcePost(null)
      sessionStorage.setItem(STORAGE_KEY, text)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const insertBtn = useCallback((btn) => {
    const ed = editorRef.current
    if (!ed) return
    if (btn.plain != null) ed.trigger('keyboard', 'type', { text: btn.plain })
    else if (btn.snippet) ed.trigger('keyboard', 'editor.action.insertSnippet', { snippet: btn.snippet })
    ed.focus()
  }, [])

  function handleDownload() {
    const blob = new Blob([content], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = downloadName
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex-wrap">
        <button
          onClick={() => navigate('/blog')}
          className="text-sm px-2 py-1 rounded-lg transition-colors hover:opacity-70 text-slate-500 dark:text-slate-400"
        >
          ← Blog
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Blog Builder</span>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-green-700 dark:text-green-400 max-w-[240px] overflow-hidden">
          <span className="truncate">{effectivePath}</span>
        </div>

        {sourcePost ? (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 shrink-0">
            Editing existing
          </span>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">Draft auto-saved</span>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={handleNew}
            className="text-xs px-2.5 py-1.5 rounded-lg font-medium hover:opacity-80 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
            New
          </button>

          <button onClick={() => setShowLoadModal(true)}
            className="text-xs px-2.5 py-1.5 rounded-lg font-medium hover:opacity-80 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
            Load…
          </button>

          <button onClick={() => fileInputRef.current?.click()}
            className="text-xs px-2.5 py-1.5 rounded-lg font-medium hover:opacity-80 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
            ↑ Upload
          </button>
          <input ref={fileInputRef} type="file" accept=".md,text/markdown" className="hidden" onChange={handleFileUpload} />

          <span className="w-px h-4 bg-slate-200 dark:bg-slate-700" />

          <button onClick={handleDownload}
            className="text-xs px-2.5 py-1.5 rounded-lg font-medium hover:opacity-80 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
            ↓ Download
          </button>
          <button onClick={() => setShowPRModal(true)}
            className="text-xs px-3.5 py-1.5 rounded-lg font-bold bg-[#238636] hover:opacity-90 text-white shrink-0">
            Submit PR
          </button>
        </div>
      </div>

      <MarkdownToolbar onInsert={insertBtn} />

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col min-h-0 border-r border-slate-200 dark:border-slate-700" style={{ width: '50%' }}>
          <div className="px-3 py-1 text-xs shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            Markdown source
          </div>
          <div className="flex-1 min-h-0">
            <Suspense fallback={<div className="p-4 text-sm font-mono text-slate-400 dark:text-slate-500">Loading editor…</div>}>
              <MonacoEditor
                value={content}
                language="markdown"
                theme={monacoTheme}
                options={{
                  fontSize: 14, lineHeight: 22,
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                }}
                onChange={handleChange}
                onMount={editor => { editorRef.current = editor }}
              />
            </Suspense>
          </div>
        </div>

        <div className="flex flex-col min-h-0 flex-1 bg-white dark:bg-slate-950">
          <div className="px-3 py-1 text-xs shrink-0 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            Preview — exactly as it appears on the blog
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-8">
              <BlogPost key={effectiveSlug} content={content} />
            </div>
          </div>
        </div>
      </div>

      {showLoadModal && (
        <LoadModal onLoad={handleLoadPost} onClose={() => setShowLoadModal(false)} />
      )}

      {showPRModal && (
        <PRModal
          slug={effectiveSlug}
          title={derivedTitle}
          targetPath={effectivePath}
          content={content}
          onClose={() => setShowPRModal(false)}
        />
      )}
    </div>
  )
}
