import { useEffect, useRef, useState } from 'react'

const API = '/api/dev-fs'

// Fetches an SVG file's current content from disk and renders it inline —
// unlike a bundler-resolved <img src>, this re-reads on every path/refresh so
// edits made in Scratchpad show up immediately without a page reload.
export default function LiveSvgPreview({ path }) {
  const [xml, setXml] = useState('')
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const containerRef = useRef(null)

  // Re-fetch when Scratchpad saves this exact file, so the thumbnail updates
  // without needing a manual refresh click.
  useEffect(() => {
    const onSaved = e => { if (e.detail?.path === path) setRefreshKey(k => k + 1) }
    window.addEventListener('oc-svg-file-saved', onSaved)
    return () => window.removeEventListener('oc-svg-file-saved', onSaved)
  }, [path])

  useEffect(() => {
    if (!path) { setXml(''); setError(''); return }
    fetch(`${API}/read?path=${encodeURIComponent(path)}`)
      .then(r => {
        if (!r.ok) throw new Error(`Not found (${r.status})`)
        return r.text()
      })
      .then(text => { setXml(text); setError('') })
      .catch(e => { setXml(''); setError(e.message) })
  }, [path, refreshKey])

  useEffect(() => {
    if (!containerRef.current) return
    if (!xml) { containerRef.current.innerHTML = ''; return }
    const doc = new DOMParser().parseFromString(xml, 'image/svg+xml')
    const svgEl = doc.querySelector('svg')
    if (!svgEl || doc.querySelector('parsererror')) return
    const clone = svgEl.cloneNode(true)
    // Match the app's current theme so the diagram's own .dark CSS rules
    // (most course diagrams define both) kick in instead of always showing
    // the light variant regardless of what theme you're actually in.
    if (document.documentElement.classList.contains('dark')) clone.classList.add('dark')
    clone.style.width = '100%'
    clone.style.height = 'auto'
    clone.style.display = 'block'
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(clone)
  }, [xml])

  if (!path) return null
  if (error) {
    return (
      <p className="text-[10px] text-amber-600 dark:text-amber-400">
        Couldn't load preview for "{path}" — {error}
      </p>
    )
  }
  // Sized generously (diagrams are often text-heavy at small font sizes —
  // squeezing them into a thumbnail-sized box makes labels illegible).
  return <div ref={containerRef} className="max-h-96 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-950" />
}
