/**
 * SVGImage — fetches an SVG file and inlines it into the DOM so that the
 * page's `.dark` class propagates inside the SVG via CSS selectors.
 *
 * SVG files use a shared class convention:
 *   .svg-bg     — main background rect fill
 *   .svg-panel  — card / inner panel fill
 *   .svg-text   — primary label fill
 *   .svg-muted  — secondary / caption fill
 *   .svg-border — divider / border stroke
 *
 * The wrapper div gets class="dark" when the page is in dark mode, so any
 * `.dark .svg-text { fill: #e2e8f0 }` rule inside the SVG <style> block works.
 */
import { useState, useEffect } from 'react'
import { useIsDark } from '../../hooks/useIsDark.js'

const cache = {}

export default function SVGImage({ src, alt, caption, className }) {
  const [html, setHtml] = useState(cache[src] ?? null)
  const isDark = useIsDark()

  useEffect(() => {
    if (!src) return
    if (cache[src]) { setHtml(cache[src]); return }
    fetch(src)
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(text => { cache[src] = text; setHtml(text) })
      .catch(() => setHtml(null))
  }, [src])

  const wrapClass = `w-full max-w-2xl mx-auto rounded-xl border shadow-sm overflow-hidden ${
    isDark ? 'dark border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
  }`

  return (
    <figure className={`my-4 ${className ?? ''}`}>
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
    </figure>
  )
}
