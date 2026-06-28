/**
 * SVGImage — fetches an SVG file and inlines it into the DOM so that the
 * page's `.dark` class propagates inside the SVG via CSS selectors.
 *
 * In dev mode (devFsAvailable), hovering the SVG shows an "Edit SVG" button
 * that opens the full SVG source + visual editor overlay.
 */
import { useState, useEffect, lazy, Suspense } from 'react'
import { useIsDark } from '../../hooks/useIsDark.js'
import { useContributorMode } from '../../hooks/useContributorMode.js'

const SvgSourceEditor = lazy(() => import('../lesson-builder/blocks/SvgSourceEditor.jsx'))

const cache = {}

function srcToFilePath(src) {
  if (!src) return null
  const noQuery = src.split('?')[0]
  // /@fs/absolute/path/src/courses/... → src/courses/...
  if (noQuery.includes('/src/courses/') || noQuery.includes('/src/posts/')) {
    const idx = noQuery.indexOf('/src/')
    if (idx !== -1) return noQuery.slice(idx + 1)
  }
  // /src/... direct Vite URL
  if (noQuery.startsWith('/src/')) return noQuery.slice(1)
  return null
}

export default function SVGImage({ src, alt, caption, className }) {
  const [html, setHtml] = useState(cache[src] ?? null)
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const isDark = useIsDark()
  const { available: canEdit } = useContributorMode()
  const filePath = canEdit ? srcToFilePath(src) : null

  useEffect(() => {
    if (!src) return
    if (cache[src]) { setHtml(cache[src]); return }
    fetch(src)
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(text => { cache[src] = text; setHtml(text) })
      .catch(() => setHtml(null))
  }, [src])

  // When SVG file is saved via the editor, bust the cache and reload
  useEffect(() => {
    const handler = (e) => {
      const saved = e.detail?.path
      if (!saved || !src) return
      // Match by filename: saved path ends with same filename as src
      const savedFile = saved.split('/').pop()
      const srcFile = src.split('/').pop()?.split('?')[0]
      if (savedFile && srcFile && savedFile === srcFile) {
        delete cache[src]
        fetch(src + '?t=' + Date.now())
          .then(r => r.ok ? r.text() : Promise.reject())
          .then(text => { cache[src] = text; setHtml(text) })
          .catch(() => {})
      }
    }
    window.addEventListener('oc-svg-file-saved', handler)
    return () => window.removeEventListener('oc-svg-file-saved', handler)
  }, [src])

  const wrapClass = `w-full max-w-2xl mx-auto rounded-xl border shadow-sm overflow-hidden ${
    isDark ? 'dark border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
  }`

  return (
    <>
      {editing && filePath && (
        <Suspense fallback={null}>
          <SvgSourceEditor filePath={filePath} onClose={() => setEditing(false)} />
        </Suspense>
      )}
      <figure
        className={`my-4 relative ${className ?? ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {html ? (
          <div
            className={wrapClass}
            aria-label={alt ?? caption ?? ''}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className={wrapClass} aria-label={alt ?? caption ?? ''}>
            <img src={src} alt={alt ?? caption ?? ''} className="w-full" />
          </div>
        )}
        {caption && (
          <figcaption className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400 italic">
            {caption}
          </figcaption>
        )}
        {filePath && hovered && (
          <button
            onClick={() => setEditing(true)}
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg shadow-lg transition-opacity"
            style={{ background: '#1f6feb', color: '#fff', opacity: 0.92, zIndex: 10 }}
            title={`Edit ${filePath}`}
          >
            ✎ Edit SVG
          </button>
        )}
      </figure>
    </>
  )
}
