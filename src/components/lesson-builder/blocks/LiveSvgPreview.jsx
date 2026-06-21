import { useEffect, useRef, useState } from 'react'

const API = '/api/dev-fs'

// Fetches an SVG file's current content from disk and renders it inline —
// unlike a bundler-resolved <img src>, this re-reads on every path/refresh so
// edits made in SvgEditor show up immediately without a page reload.
export default function LiveSvgPreview({ path }) {
  const [xml, setXml] = useState('')
  const [error, setError] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    if (!path) { setXml(''); setError(''); return }
    fetch(`${API}/read?path=${encodeURIComponent(path)}`)
      .then(r => {
        if (!r.ok) throw new Error(`Not found (${r.status})`)
        return r.text()
      })
      .then(text => { setXml(text); setError('') })
      .catch(e => { setXml(''); setError(e.message) })
  }, [path])

  useEffect(() => {
    if (!containerRef.current) return
    if (!xml) { containerRef.current.innerHTML = ''; return }
    const doc = new DOMParser().parseFromString(xml, 'image/svg+xml')
    const svgEl = doc.querySelector('svg')
    if (!svgEl || doc.querySelector('parsererror')) return
    const clone = svgEl.cloneNode(true)
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
  return <div ref={containerRef} className="max-h-40 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 p-2 bg-white dark:bg-slate-950" />
}
