import { useMemo, useState } from 'react'
import { serializeLesson, buildLessonObject, getFilePath } from './lessonSerializer.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { ensureFork, resolveLessonFilePath, submitContribution } from '../../services/githubContribution.js'
import { checkLessonLatex } from '../math/checkLessonLatex.js'

export default function ExportPanel({ state, onClose }) {
  const { signInWithGithubForContribution } = useAuth()
  const [copied, setCopied] = useState(false)
  const [agreedToLicense, setAgreedToLicense] = useState(false)
  const [submitState, setSubmitState] = useState({ status: 'idle' }) // idle | submitting | done | error
  const code = serializeLesson(state)
  const filePath = getFilePath(state)
  const latexErrors = useMemo(() => checkLessonLatex(buildLessonObject(state), state.meta.slug || 'lesson'), [state])

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const submitAsContribution = async () => {
    setSubmitState({ status: 'submitting' })
    try {
      const { token } = await signInWithGithubForContribution()
      if (!token) throw new Error('GitHub did not return an access token — try signing in again.')

      const forkOwner = await ensureFork(token)
      const courseId = (state._chapterId || '').replace(/-\d+$/, '')
      const chapterNumber = (state._chapterId || '').match(/-(\d+)$/)?.[1] ?? '1'
      const realPath = await resolveLessonFilePath(
        token,
        forkOwner,
        courseId,
        chapterNumber,
        state.meta.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        filePath
      )

      const pr = await submitContribution({
        token,
        forkOwner,
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-stretch justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Export Lesson</h2>
            <p className="text-xs text-slate-400 mt-0.5">Copy and replace the file at the path below</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl leading-none">✕</button>
        </div>

        {/* File path */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">File path</p>
          <code className="text-xs text-brand-600 dark:text-brand-400 font-mono break-all">{filePath}</code>
          <p className="text-[10px] text-slate-400 mt-1">
            Find the chapter folder (N-chapter-slug) in your file explorer, then replace or create the lesson file.
          </p>
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <pre className="text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre leading-relaxed">
            {code}
          </pre>
        </div>

        {/* Contribute */}
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
          {submitState.status === 'error' && (
            <p className="text-xs text-red-500">Couldn't submit: {submitState.message}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={copy}
              className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy to clipboard'}
            </button>
            <button
              onClick={submitAsContribution}
              disabled={!agreedToLicense || latexErrors.length > 0 || submitState.status === 'submitting'}
              className="px-5 py-2 text-sm font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-white dark:text-slate-900"
            >
              {submitState.status === 'submitting' ? 'Submitting…' : 'Submit as contribution'}
            </button>
            <p className="text-xs text-slate-400">
              {latexErrors.length > 0 ? 'Fix the LaTeX errors above first' : 'Opens a real pull request on GitHub'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
