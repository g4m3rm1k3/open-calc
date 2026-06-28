import { useState, useEffect, lazy, Suspense } from 'react'
import { useContributorMode } from '../hooks/useContributorMode.js'

const SvgSourceEditor = lazy(() => import('../components/lesson-builder/blocks/SvgSourceEditor.jsx'))

// Glob all SVGs from both geometry and calculus diagram folders
const GEO_SVGS   = import.meta.glob('../courses/geometry/diagrams/*.svg',  { query: '?url', import: 'default', eager: true })
const CALC_SVGS  = import.meta.glob('../courses/calculus/diagrams/*.svg',   { query: '?url', import: 'default', eager: true })
const GEO_QUIZ   = import.meta.glob('../courses/geometry/diagrams/quiz-*.svg', { query: '?url', import: 'default', eager: true })

function repoPath(globKey) {
  // '../courses/calculus/diagrams/foo.svg' → 'src/courses/calculus/diagrams/foo.svg'
  return globKey.replace(/^\.\.\//, 'src/')
}

function fileName(globKey) {
  return globKey.split('/').pop()
}

function SvgCard({ name, url, filePath, onEdit }) {
  const [html, setHtml] = useState(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    fetch(url)
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(text => setHtml(text))
      .catch(() => setErr(true))
  }, [url])

  return (
    <div
      className="group relative flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onEdit(filePath)}
      title={name}
    >
      <div className="flex-1 p-2 min-h-[120px] flex items-center justify-center bg-slate-50 dark:bg-slate-800">
        {html ? (
          <div
            className="w-full"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : err ? (
          <span className="text-xs text-red-400">load error</span>
        ) : (
          <span className="text-xs text-slate-400">loading…</span>
        )}
      </div>
      <div className="px-2 py-1.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-1">
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">{name}</span>
        <span
          className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: '#1f6feb', color: '#fff' }}
        >✎ Edit</span>
      </div>
    </div>
  )
}

export default function SvgGalleryPage() {
  const { available: canEdit } = useContributorMode()
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('')
  const [section, setSection] = useState('calc')

  const sources = section === 'calc'
    ? CALC_SVGS
    : section === 'geo'
      ? { ...GEO_SVGS, ...GEO_QUIZ }
      : { ...CALC_SVGS, ...GEO_SVGS, ...GEO_QUIZ }

  const entries = Object.entries(sources)
    .map(([key, url]) => ({ key, url, name: fileName(key), filePath: repoPath(key) }))
    .filter(({ name }) => !filter || name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      {editing && (
        <Suspense fallback={null}>
          <SvgSourceEditor
            filePath={editing}
            onClose={() => setEditing(null)}
          />
        </Suspense>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">SVG Gallery</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {entries.length} diagrams — {canEdit ? 'click any to edit' : 'run locally to enable editing'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 text-xs font-bold">
              {[['calc', 'Calculus'], ['geo', 'Geometry'], ['all', 'All']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSection(key)}
                  className="px-3 py-1.5 transition-colors"
                  style={{
                    background: section === key ? '#1f6feb' : 'transparent',
                    color: section === key ? '#fff' : undefined,
                  }}
                >{label}</button>
              ))}
            </div>
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter by name…"
              className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48"
            />
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {entries.map(({ key, url, name, filePath }) => (
            <SvgCard
              key={key}
              name={name}
              url={url}
              filePath={filePath}
              onEdit={canEdit ? (p) => setEditing(p) : () => {}}
            />
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-24 text-slate-400">No diagrams match "{filter}"</div>
        )}
      </div>
    </>
  )
}
