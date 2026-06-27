import { useState, useRef, useCallback, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import BlogPost from '../components/blog/BlogPost.jsx'
import MarkdownToolbar from '../components/markdown-toolbar/MarkdownToolbar.jsx'
import { useGlobalTheme } from '../context/ThemeContext.jsx'

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })))

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
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function extractTitle(markdown) {
  const m = markdown.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : ''
}

// ── GitHub API ────────────────────────────────────────────────────────────────

async function submitPR({ token, content, slug, title }) {
  const base = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`
  const headers = {
    Authorization: `token ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  }

  // 1. Get SHA of main branch tip
  const refRes = await fetch(`${base}/git/ref/heads/main`, { headers })
  if (!refRes.ok) {
    const e = await refRes.json()
    throw new Error(e.message || `GitHub API ${refRes.status}`)
  }
  const { object: { sha: baseSha } } = await refRes.json()

  // 2. Create branch blog/{slug}
  const branch = `blog/${slug}`
  const branchRes = await fetch(`${base}/git/refs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
  })
  if (!branchRes.ok) {
    const e = await branchRes.json()
    throw new Error(e.message || `Could not create branch: ${branchRes.status}`)
  }

  // 3. Create the file
  const filePath = `src/posts/${slug}.md`
  const contentB64 = btoa(unescape(encodeURIComponent(content)))
  const fileRes = await fetch(`${base}/contents/${filePath}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `blog: add "${title}"`,
      content: contentB64,
      branch,
    }),
  })
  if (!fileRes.ok) {
    const e = await fileRes.json()
    throw new Error(e.message || `Could not create file: ${fileRes.status}`)
  }

  // 4. Open the PR
  const prRes = await fetch(`${base}/pulls`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: `Blog: ${title}`,
      head: branch,
      base: 'main',
      body: `New blog post submitted via the Blog Builder.\n\n**File:** \`${filePath}\``,
    }),
  })
  if (!prRes.ok) {
    const e = await prRes.json()
    throw new Error(e.message || `Could not create PR: ${prRes.status}`)
  }
  const pr = await prRes.json()
  return pr.html_url
}

// ── PR Modal ──────────────────────────────────────────────────────────────────

function PRModal({ slug, title, content, onClose }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [saving, setSaving] = useState(false)
  const [prUrl, setPrUrl] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    const t = token.trim()
    if (!t) { setError('Enter a GitHub personal access token.'); return }
    setSaving(true)
    setError(null)
    try {
      localStorage.setItem(TOKEN_KEY, t)
      const url = await submitPR({ token: t, content, slug, title })
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
            Opens a pull request on GitHub adding <code style={{ color: '#f97316' }}>src/posts/{slug}.md</code>
          </p>
        </div>

        {prUrl ? (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: '#0d4429', border: '1px solid #26a641' }}>
              <span className="text-lg">✓</span>
              <span className="text-sm font-semibold" style={{ color: '#3fb950' }}>PR created successfully!</span>
            </div>
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: '#238636', color: '#ffffff' }}
            >
              Open Pull Request on GitHub
              <span className="text-lg">→</span>
            </a>
            <button onClick={onClose} className="w-full text-sm py-2 rounded-xl" style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}>Close</button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#8b949e' }}>
                GitHub Personal Access Token
              </label>
              <input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full text-sm rounded-lg px-3 py-2 font-mono"
                style={{ background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', outline: 'none' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <p className="text-[11px] mt-1.5" style={{ color: '#6e7681' }}>
                Needs <code style={{ color: '#f97316' }}>repo</code> scope. Token is only stored in your browser.{' '}
                <a href="https://github.com/settings/tokens/new?scopes=repo&description=UpSkillOS+Blog+Builder" target="_blank" rel="noopener noreferrer" style={{ color: '#388bfd' }}>
                  Create one →
                </a>
              </p>
            </div>

            <div className="text-xs rounded-lg p-3 space-y-1" style={{ background: '#21262d', border: '1px solid #30363d' }}>
              <div style={{ color: '#8b949e' }}>Branch: <code style={{ color: '#e6edf3' }}>blog/{slug}</code></div>
              <div style={{ color: '#8b949e' }}>File: <code style={{ color: '#e6edf3' }}>src/posts/{slug}.md</code></div>
              <div style={{ color: '#8b949e' }}>Title: <code style={{ color: '#e6edf3' }}>{title}</code></div>
            </div>

            {error && (
              <div className="text-xs rounded-lg p-3" style={{ background: '#3d0a0a', border: '1px solid #f8514933', color: '#f85149' }}>
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 text-sm py-2 rounded-xl" style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 text-sm py-2 rounded-xl font-semibold"
                style={{ background: saving ? '#238636aa' : '#238636', color: '#ffffff', cursor: saving ? 'wait' : 'pointer' }}
              >
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
  const [content, setContent] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) || DEFAULT_CONTENT
  )
  const [showPRModal, setShowPRModal] = useState(false)

  const title = extractTitle(content) || 'Untitled'
  const slug = slugify(title) || 'untitled'

  const monacoTheme = isDarkGlobal ? 'vs-dark' : 'vs'

  // Auto-save draft to sessionStorage
  function handleChange(val) {
    const v = val ?? ''
    setContent(v)
    sessionStorage.setItem(STORAGE_KEY, v)
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
    a.download = `${slug}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => navigate('/blog')}
          className="text-sm px-2.5 py-1 rounded-lg transition-colors hover:opacity-70 text-slate-500 dark:text-slate-400"
        >
          ← Blog
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Blog Builder</span>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-green-700 dark:text-green-400">
          src/posts/<span className="text-slate-800 dark:text-slate-200">{slug}.md</span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">Draft auto-saved</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          >
            Download .md
          </button>
          <button
            onClick={() => setShowPRModal(true)}
            className="text-xs px-4 py-1.5 rounded-lg font-bold bg-[#238636] hover:opacity-90 transition-opacity text-white"
          >
            Submit PR
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <MarkdownToolbar onInsert={insertBtn} />

      {/* Split pane */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Monaco editor */}
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

        {/* Right: live BlogPost preview */}
        <div className="flex flex-col min-h-0 flex-1 bg-white dark:bg-slate-950">
          <div className="px-3 py-1 text-xs shrink-0 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            Preview — exactly as it appears on the blog
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-8">
              <BlogPost key={slug} content={content} />
            </div>
          </div>
        </div>
      </div>

      {showPRModal && (
        <PRModal
          slug={slug}
          title={title}
          content={content}
          onClose={() => setShowPRModal(false)}
        />
      )}
    </div>
  )
}
