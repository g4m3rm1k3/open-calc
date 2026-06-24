import { useMemo, useState, useEffect } from 'react'
import { serializeLesson, buildLessonObject, getFilePath } from './lessonSerializer.js'
import { resolveLessonFilePath, submitContribution, UPSTREAM_OWNER, UPSTREAM_REPO } from '../../services/githubContribution.js'
import { checkLessonLatex } from '../math/checkLessonLatex.js'

const API = '/api/dev-fs'

// Resolve [N-chapter-folder] placeholder using local dev-fs (no GitHub token needed)
async function resolveLocalFilePath(filePath) {
  const match = filePath.match(/^(src\/courses\/([^/]+))\/\[(\d+)-chapter-folder\]\/(.+)$/)
  if (!match) return filePath
  const [, coursePath, , chNum, filename] = match
  try {
    const entries = await fetch(`${API}/list?dir=${encodeURIComponent(coursePath)}`).then(r => r.json())
    const found = Array.isArray(entries) && entries.find(e => e.type === 'dir' && e.name.startsWith(`${chNum}-`))
    const folder = found?.name ?? `${chNum}-chapter`
    return `${coursePath}/${folder}/${filename}`
  } catch {
    return filePath
  }
}

export default function ExportPanel({ state, onClose }) {
  const [copied, setCopied] = useState(false)
  const [agreedToLicense, setAgreedToLicense] = useState(false)
  const [token, setToken] = useState(() => sessionStorage.getItem('oc-gh-token') || '')
  const [submitState, setSubmitState] = useState({ status: 'idle' }) // idle | submitting | done | error | saved
  const [devMode, setDevMode] = useState(false)
  const [diff, setDiff] = useState({ status: 'idle', original: '', resolvedPath: '', error: '' })
  const [DiffEditorComp, setDiffEditorComp] = useState(null)

  useEffect(() => {
    fetch(`${API}/ping`).then(r => r.ok && setDevMode(true)).catch(() => {})
  }, [])

  const code = serializeLesson(state)
  const filePath = getFilePath(state)
  const latexErrors = useMemo(() => checkLessonLatex(buildLessonObject(state), state.meta.slug || 'lesson'), [state])

  const loadDiff = async () => {
    setDiff({ status: 'loading', original: '', resolvedPath: '', error: '' })
    try {
      // Lazy-load Monaco only when needed
      if (!DiffEditorComp) {
        const mod = await import('@monaco-editor/react')
        setDiffEditorComp(() => mod.DiffEditor)
      }
      const resolvedPath = await resolveLocalFilePath(filePath)
      const r = await fetch(`${API}/read?path=${encodeURIComponent(resolvedPath)}`)
      if (!r.ok) throw new Error(`File not found: ${resolvedPath}`)
      const original = await r.text()
      setDiff({ status: 'ready', original, resolvedPath, error: '' })
    } catch (e) {
      setDiff({ status: 'error', original: '', resolvedPath: '', error: e.message })
    }
  }

  const saveToDisk = async () => {
    const targetPath = diff.resolvedPath || filePath
    setSubmitState({ status: 'submitting' })
    try {
      const r = await fetch(`${API}/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: targetPath, content: code }),
      })
      const data = await r.json()
      if (data.ok) {
        setSubmitState({ status: 'saved', path: targetPath })
        setDiff(d => ({ ...d, original: code })) // reset diff baseline after save
      } else {
        setSubmitState({ status: 'error', message: data.error || 'Write failed' })
      }
    } catch (e) {
      setSubmitState({ status: 'error', message: e.message })
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const submitAsContribution = async () => {
    const t = token.trim()
    if (!t) return setSubmitState({ status: 'error', message: 'Paste your GitHub token first (ghp_…)' })
    sessionStorage.setItem('oc-gh-token', t)
    setSubmitState({ status: 'submitting' })
    try {
      const courseId = (state._chapterId || '').replace(/-\d+$/, '')
      const chapterNumber = (state._chapterId || '').match(/-(\d+)$/)?.[1] ?? '1'

      const upstreamInfo = await fetch(`https://api.github.com/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}`, {
        headers: { Authorization: `Bearer ${t}`, Accept: 'application/vnd.github+json' },
      }).then(r => r.json())
      const realPath = await resolveLessonFilePath(
        t,
        UPSTREAM_OWNER,
        upstreamInfo.default_branch || 'main',
        courseId,
        chapterNumber,
        state.meta.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        filePath
      )

      const pr = await submitContribution({
        token: t,
        files: [{ path: realPath, content: code }],
        title: `Add lesson: ${state.meta.title || state.meta.slug}`,
        body: [
          `Lesson "${state.meta.title || state.meta.slug}" submitted via the in-app Lesson Builder.`,
          '',
          'The contributor confirmed: "I agree this contribution is licensed under GPL-3.0-or-later, this project\'s license."',
        ].join('\n'),
      })
      setSubmitState({ status: 'done', url: pr.html_url })
    } catch (error) {
      setSubmitState({ status: 'error', message: error instanceof Error ? error.message : String(error) })
    }
  }

  const hasDiff = diff.status === 'ready'
  const noChanges = hasDiff && diff.original === code

  return (
    <div className="fixed inset-0 z-[9999] flex items-stretch justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Export Lesson</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasDiff
                ? noChanges
                  ? 'No changes — the file on disk matches the current editor state.'
                  : `Showing changes vs disk`
                : 'Copy and replace the file at the path below'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl leading-none">✕</button>
        </div>

        {/* File path */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">File path</p>
          <code className="text-xs text-brand-600 dark:text-brand-400 font-mono break-all">
            {diff.resolvedPath || filePath}
          </code>
          {!hasDiff && (
            <p className="text-[10px] text-slate-400 mt-1">
              Find the chapter folder (N-chapter-slug) in your file explorer, then replace or create the lesson file.
            </p>
          )}
        </div>

        {/* Code / Diff area */}
        <div className="flex-1 overflow-auto relative">
          {diff.status === 'idle' && (
            <pre className="px-6 py-4 text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre leading-relaxed">
              {code}
            </pre>
          )}

          {diff.status === 'loading' && (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm gap-2">
              <span className="animate-spin">⏳</span> Loading diff…
            </div>
          )}

          {diff.status === 'error' && (
            <div className="px-6 py-4">
              <p className="text-xs text-red-500 mb-2">Could not load original file: {diff.error}</p>
              <p className="text-xs text-slate-400 mb-4">The file may be new. You can still save or copy the generated code below.</p>
              <pre className="text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre leading-relaxed">
                {code}
              </pre>
            </div>
          )}

          {hasDiff && noChanges && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <span className="text-3xl">✓</span>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">No changes</p>
              <p className="text-xs">The file on disk already matches the current editor state.</p>
            </div>
          )}

          {hasDiff && !noChanges && DiffEditorComp && (
            <DiffEditorComp
              height="100%"
              original={diff.original}
              modified={code}
              language="javascript"
              theme="vs-dark"
              options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                fontSize: 11,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 shrink-0 space-y-3">
          {latexErrors.length > 0 && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2 space-y-1">
              <p className="text-xs font-bold text-red-600 dark:text-red-400">
                {latexErrors.length} LaTeX error{latexErrors.length > 1 ? 's' : ''} — fix before submitting
              </p>
              {latexErrors.slice(0, 5).map((err, i) => (
                <p key={i} className="text-xs text-red-500 font-mono break-all">{err.path}: {err.message}</p>
              ))}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              GitHub token
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=OpenCalc+contributor"
                target="_blank" rel="noreferrer"
                className="normal-case tracking-normal font-normal text-brand-500 hover:underline"
              >generate one →</a>
            </label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="ghp_… (saved for this session)"
              className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-brand-400"
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={agreedToLicense}
              onChange={e => setAgreedToLicense(e.target.checked)}
              className="mt-0.5"
            />
            I agree this contribution is licensed under GPL-3.0-or-later, this project's license.
          </label>

          {submitState.status === 'done' && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              ✓ Pull request opened:{' '}
              <a href={submitState.url} target="_blank" rel="noreferrer" className="underline">
                {submitState.url}
              </a>
            </p>
          )}
          {submitState.status === 'saved' && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              ✓ Saved to <code className="font-mono">{submitState.path}</code>
            </p>
          )}
          {submitState.status === 'error' && (
            <p className="text-xs text-red-500">Couldn't submit: {submitState.message}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={copy}
              className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>

            {devMode && diff.status === 'idle' && (
              <button
                onClick={loadDiff}
                className="px-5 py-2 text-sm font-bold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100"
              >
                Preview changes
              </button>
            )}

            {devMode && (diff.status === 'ready' || diff.status === 'error') && (
              <button
                onClick={() => setDiff({ status: 'idle', original: '', resolvedPath: '', error: '' })}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
              >
                ← Code
              </button>
            )}

            {devMode && (
              <button
                onClick={saveToDisk}
                disabled={latexErrors.length > 0 || submitState.status === 'submitting' || noChanges}
                className="px-5 py-2 text-sm font-bold rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitState.status === 'submitting' ? 'Saving…' : '💾 Save to disk'}
              </button>
            )}

            <button
              onClick={submitAsContribution}
              disabled={!agreedToLicense || !token.trim() || latexErrors.length > 0 || submitState.status === 'submitting'}
              className="px-5 py-2 text-sm font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-white dark:text-slate-900"
            >
              {submitState.status === 'submitting' ? 'Submitting…' : 'Submit as contribution'}
            </button>

            <p className="text-xs text-slate-400">
              {noChanges
                ? 'No changes to save'
                : devMode
                ? 'Save to disk skips GitHub entirely'
                : latexErrors.length > 0
                ? 'Fix the LaTeX errors above first'
                : 'Opens a real pull request on GitHub'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
