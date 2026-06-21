import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'

function buildPreviewDoc(html, css, js, dark) {
  const escaped = (js || '').replace(/<\/script>/gi, '<\\/script>')
  const bg = dark ? '#0f1923' : '#ffffff'
  const fg = dark ? '#e2e8f0' : '#1e293b'
  return `<!DOCTYPE html>
<html class="${dark ? 'dark' : ''}">
<head>
<meta charset="utf-8">
<style>
*,*::before,*::after{box-sizing:border-box}
body{margin:0;padding:14px;font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;background:${bg};color:${fg}}
canvas{display:block}
${css || ''}
</style>
</head>
<body>
${html || ''}
<script>
var isDark=${dark ? 'true' : 'false'};
var BG=isDark?'#1e293b':'#fafaf8';var TEXT=isDark?'#e2e8f0':'#1e293b';var MUTED=isDark?'#94a3b8':'#64748b';
var GRID=isDark?'#334155':'#e2e8f0';var NAVY=isDark?'#93c5fd':'#1e3a5f';var GREEN=isDark?'#4ade80':'#1a3a2a';
var AMBER=isDark?'#fb923c':'#92400e';var PURPLE=isDark?'#a78bfa':'#7c3aed';var RED=isDark?'#f87171':'#dc2626';
var BORDER=isDark?'#475569':'#d1d5db';
try{(function(){
${escaped}
})()}catch(e){
  var d=document.createElement('pre');
  d.style.cssText='color:#f87171;background:#1f0707;padding:10px;border-radius:6px;margin:8px 0;font-size:12px;white-space:pre-wrap';
  d.textContent='Error: '+e.message+'\\n'+e.stack;
  document.body.appendChild(d);
}
<\/script>
</body>
</html>`
}

const MOPTS = { fontSize: 13, minimap: { enabled: false }, wordWrap: 'on', scrollBeyondLastLine: false, automaticLayout: true }

export default function VizCellEditor({ cell, dark: appDark, onSave, onClose }) {
  const [js, setJs] = useState(cell.startCode ?? '')
  const [html, setHtml] = useState(cell.html ?? '')
  const [css, setCss] = useState(cell.css ?? '')
  const [dark, setDark] = useState(appDark ?? false)
  const [tab, setTab] = useState('js')
  const [outputHeight, setOutputHeight] = useState(cell.outputHeight ?? 320)
  const iframeRef = useRef(null)

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = buildPreviewDoc(html, css, js, dark)
    }
  }, [js, html, css, dark])

  const handleSave = () => {
    onSave({ ...cell, startCode: js, html, css, outputHeight })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[600] flex flex-col" style={{ background: '#0d1117' }}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0 border-b" style={{ background: '#161b22', borderColor: '#30363d' }}>
        <button
          onClick={onClose}
          className="text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: '#8b949e' }}
        >
          ← Close
        </button>
        <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>⚡ Live JS Editor</span>
        {cell.instruction && (
          <span className="text-xs truncate max-w-xs" style={{ color: '#8b949e' }}>
            {cell.instruction.replace(/^#+\s*/, '').slice(0, 60)}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none" style={{ color: '#8b949e' }}>
            <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} className="accent-indigo-500" />
            Dark preview
          </label>
          <label className="flex items-center gap-1.5 text-xs" style={{ color: '#8b949e' }}>
            H:
            <input
              type="number"
              value={outputHeight}
              onChange={e => setOutputHeight(Number(e.target.value))}
              className="w-16 text-xs rounded px-1.5 py-0.5"
              style={{ background: '#21262d', border: '1px solid #30363d', color: '#e6edf3' }}
            />
          </label>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm font-bold rounded-lg transition-colors"
            style={{ background: '#238636', color: '#ffffff' }}
          >
            Save to cell
          </button>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 min-h-0">
        {/* Left: editor */}
        <div className="flex flex-col min-h-0" style={{ width: '50%', borderRight: '1px solid #30363d' }}>
          {/* Code tabs */}
          <div className="flex items-center gap-1 px-3 py-1.5 shrink-0" style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
            {['js', 'html', 'css'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-3 py-1 text-xs font-mono rounded transition-colors"
                style={tab === t
                  ? { background: '#21262d', color: '#e6edf3', border: '1px solid #30363d' }
                  : { color: '#8b949e', border: '1px solid transparent' }}
              >
                {t.toUpperCase()}
              </button>
            ))}
            <span className="ml-auto text-xs" style={{ color: '#8b949e' }}>
              {tab === 'js' ? 'startCode — canvas/DOM drawing' : tab === 'html' ? 'HTML markup (body)' : 'CSS styles'}
            </span>
          </div>
          <div className="flex-1 min-h-0">
            {tab === 'js' && <Editor value={js} onChange={v => setJs(v ?? '')} language="javascript" theme="vs-dark" options={MOPTS} />}
            {tab === 'html' && <Editor value={html} onChange={v => setHtml(v ?? '')} language="html" theme="vs-dark" options={MOPTS} />}
            {tab === 'css' && <Editor value={css} onChange={v => setCss(v ?? '')} language="css" theme="vs-dark" options={MOPTS} />}
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex flex-col min-h-0" style={{ width: '50%', background: dark ? '#0f1923' : '#f8fafc' }}>
          <div className="flex items-center gap-2 px-3 py-1.5 shrink-0 text-xs" style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}>
            <span>Live preview</span>
            <span className="ml-auto">{dark ? '🌙 dark' : '☀️ light'} · {outputHeight}px</span>
          </div>
          <div className="flex-1 overflow-auto">
            <iframe
              ref={iframeRef}
              className="border-0"
              sandbox="allow-scripts"
              title="viz-preview"
              style={{ width: '100%', height: outputHeight > 0 ? `${outputHeight}px` : '100%', display: 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
