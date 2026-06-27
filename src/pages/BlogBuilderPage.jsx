import { useState, useRef, useCallback, lazy, Suspense, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BlogPost from '../components/blog/BlogPost.jsx'
import MarkdownToolbar from '../components/markdown-toolbar/MarkdownToolbar.jsx'
import { useGlobalTheme } from '../context/ThemeContext.jsx'

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })))

// ── Existing posts (for Load menu) ────────────────────────────────────────────

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
  // '../posts/foo/bar.md' → 'src/posts/foo/bar.md'
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
// targetPath: 'src/posts/foo/bar.md' — if the file already exists in main,
// its SHA is fetched and included in the PUT so GitHub accepts the update.

async function submitPR({ token, content, slug, title, targetPath }) {
  const base = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`
  const headers = {
    Authorization: `token ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  }

  // 1. Get SHA of main branch tip
  const refRes = await fetch(`${base}/git/ref/heads/main`, { headers })
  if (!refRes.ok) { const e = await refRes.json(); throw new Error(e.message || `GitHub API ${refRes.status}`) }
  const { object: { sha: baseSha } } = await refRes.json()

  // 2. Create branch — replace / in slug so it's a flat branch name
  const branch = `blog/${slug.replace(/\//g, '-')}`
  const branchRes = await fetch(`${base}/git/refs`, {
    method: 'POST', headers,
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
  })
  if (!branchRes.ok) { const e = await branchRes.json(); throw new Error(e.message || `Branch: ${branchRes.status}`) }

  // 3. Check if file already exists in main to get its SHA (required for updates)
  const encodedPath = targetPath.split('/').map(encodeURIComponent).join('/')
  const checkRes = await fetch(`${base}/contents/${encodedPath}`, { headers })
  const existingSha = checkRes.ok ? (await checkRes.json()).sha : null

  // 4. Create or update the file
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

  // 5. Open PR
  const prRes = await fetch(`${base}/pulls`, {
    method: 'POST', headers,
    body: JSON.stringify({
      title: existingSha ? `Blog: update "${title}"` : `Blog: ${title}`,
      head: branch,
      base: 'main',
      body: existingSha
        ? `Updates blog post via the Blog Builder.\n\n**File:** \`${targetPath}\``
        : `New blog post submitted via the Blog Builder.\n\n**File:** \`${targetPath}\``,
    }),
  })
  if (!prRes.ok) { const e = await prRes.json(); throw new Error(e.message || `PR: ${prRes.status}`) }
  return (await prRes.json()).html_url
}

// ── Load menu ─────────────────────────────────────────────────────────────────

function LoadMenu({ onLoad, onClose }) {
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const seriesMap = {}
  const standalone = []
  for (const post of ALL_POSTS) {
    if (post.folderName) {
      ;(seriesMap[post.folderName] ??= []).push(post)
    } else {
      standalone.push(post)
    }
  }
  for (const posts of Object.values(seriesMap)) {
    posts.sort((a, b) => a.slug.localeCompare(b.slug))
  }

  const rowClass = 'w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors truncate'
  const headerClass = 'px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/50'

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-50 overflow-hidden"
    >
      <div className="max-h-72 overflow-y-auto">
        {Object.entries(seriesMap).map(([folder, posts]) => (
          <div key={folder}>
            <div className={headerClass}>📚 {folder}</div>
            {posts.map((post, i) => (
              <button key={post.slug} onClick={() => onLoad(post)} className={rowClass}>
                <span className="shrink-0 text-slate-400 dark:text-slate-500 w-4 text-right">{i + 1}.</span>
                <span className="truncate">{post.title}</span>
              </button>
            ))}
          </div>
        ))}
        {standalone.length > 0 && (
          <div>
            {Object.keys(seriesMap).length > 0 && (
              <div className={headerClass}>Standalone</div>
            )}
            {standalone.map(post => (
              <button key={post.slug} onClick={() => onLoad(post)} className={rowClass}>
                <span className="truncate">{post.title}</span>
              </button>
            ))}
          </div>
        )}
        {ALL_POSTS.length === 0 && (
          <p className="px-4 py-6 text-xs text-center text-slate-400">No posts found in src/posts/</p>
        )}
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
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)

  const [content, setContent] = useState(() => sessionStorage.getItem(STORAGE_KEY) || DEFAULT_CONTENT)
  // sourcePost: { slug, repoPath } when editing an existing post, null for new/uploaded
  const [sourcePost, setSourcePost] = useState(null)
  const [showPRModal, setShowPRModal] = useState(false)
  const [showLoadMenu, setShowLoadMenu] = useState(false)

  const monacoTheme = isDarkGlobal ? 'vs-dark' : 'vs'

  // Effective slug and path — use sourcePost's slug when editing, otherwise derive from H1
  const derivedTitle = extractTitle(content) || 'Untitled'
  const derivedSlug = slugify(derivedTitle) || 'untitled'
  const effectiveSlug = sourcePost?.slug ?? derivedSlug
  const effectivePath = sourcePost?.repoPath ?? `src/posts/${derivedSlug}.md`
  // Filename for download
  const downloadName = (sourcePost?.repoPath?.split('/').pop()) ?? `${derivedSlug}.md`

  function handleChange(val) {
    const v = val ?? ''
    setContent(v)
    sessionStorage.setItem(STORAGE_KEY, v)
  }

  function handleNew() {
    if (content.trim() !== DEFAULT_CONTENT.trim() &&
      !window.confirm('Start a new post? Any unsaved edits will be lost.')) return
    setContent(DEFAULT_CONTENT)
    setSourcePost(null)
    sessionStorage.setItem(STORAGE_KEY, DEFAULT_CONTENT)
  }

  function handleLoadPost(post) {
    setContent(post.raw)
    setSourcePost({ slug: post.slug, repoPath: post.repoPath })
    setShowLoadMenu(false)
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

        {/* Current file path */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-green-700 dark:text-green-400 min-w-0 max-w-[260px] overflow-hidden">
          <span className="truncate">{effectivePath}</span>
        </div>

        {/* Status badge */}
        {sourcePost ? (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 shrink-0">
            Editing existing
          </span>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">Draft auto-saved</span>
        )}

        <div className="ml-auto flex items-center gap-1.5 flex-wrap">
          {/* Source actions */}
          <button
            onClick={handleNew}
            className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          >
            New
          </button>

          {/* Load existing dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLoadMenu(v => !v)}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1"
            >
              Load ▾
            </button>
            {showLoadMenu && (
              <LoadMenu
                onLoad={handleLoadPost}
                onClose={() => setShowLoadMenu(false)}
              />
            )}
          </div>

          {/* Upload .md from disk */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          >
            ↑ Upload .md
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown"
            className="hidden"
            onChange={handleFileUpload}
          />

          <span className="w-px h-4 bg-slate-200 dark:bg-slate-700" />

          {/* Export actions */}
          <button
            onClick={handleDownload}
            className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          >
            ↓ Download
          </button>
          <button
            onClick={() => setShowPRModal(true)}
            className="text-xs px-3.5 py-1.5 rounded-lg font-bold bg-[#238636] hover:opacity-90 transition-opacity text-white shrink-0"
          >
            Submit PR
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <MarkdownToolbar onInsert={insertBtn} />

      {/* Split pane */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Monaco */}
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
                  fontSize: 14,
                  lineHeight: 22,
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

        {/* Right: live preview */}
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
