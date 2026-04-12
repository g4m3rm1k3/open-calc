/**
 * ScienceNotebook.jsx
 * Clean lesson viewer for science / graphics courses.
 *
 * Cell types:
 *   type:'js'          — auto-run canvas / animation preview (read-only)
 *   type:'markdown'    — rich markdown prose
 *   type:'challenge'   — multiple-choice question with A/B/C/D buttons
 *   type:'coding'      — Monaco editor + Run + solutionCode reveal + check(code)→bool
 *   type:'walkthrough' — numbered steps with a live preview the learner follows
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ── Theme ──────────────────────────────────────────────────────────────────────
function useIsDark() {
  const isDark = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

function makeT(dark) {
  return {
    bg:       dark ? '#0f172a'  : '#f8fafc',
    panel:    dark ? '#1e293b'  : '#ffffff',
    panel2:   dark ? '#0f172a'  : '#f1f5f9',
    border:   dark ? '#334155'  : '#e2e8f0',
    text:     dark ? '#e2e8f0'  : '#1e293b',
    muted:    dark ? '#94a3b8'  : '#64748b',
    accent:   dark ? '#38bdf8'  : '#0284c7',
    green:    dark ? '#34d399'  : '#16a34a',
    greenBg:  dark ? '#052e16'  : '#d1fae5',
    greenBd:  dark ? '#10b981'  : '#10b981',
    red:      dark ? '#f87171'  : '#dc2626',
    redBg:    dark ? '#450a0a'  : '#fee2e2',
    redBd:    dark ? '#ef4444'  : '#ef4444',
    yellow:   dark ? '#fbbf24'  : '#d97706',
    yellowBg: dark ? '#451a03'  : '#fef3c7',
    iframeBg: dark ? '#0f1923'  : '#ffffff',
  }
}

function iframeThemeVars(dark) {
  return dark ? `
    --color-background-primary:#0f172a;--color-background-secondary:#1e293b;
    --color-background-tertiary:#0f172a;--color-background-info:#172554;
    --color-border-primary:#334155;--color-border-secondary:#475569;
    --color-border-tertiary:#334155;
    --color-text-primary:#e2e8f0;--color-text-secondary:#94a3b8;
    --color-text-tertiary:#64748b;--color-text-info:#93c5fd;
  ` : `
    --color-background-primary:#ffffff;--color-background-secondary:#f8fafc;
    --color-background-tertiary:#f1f5f9;--color-background-info:#eff6ff;
    --color-border-primary:#e2e8f0;--color-border-secondary:#cbd5e1;
    --color-border-tertiary:#e2e8f0;
    --color-text-primary:#1e293b;--color-text-secondary:#475569;
    --color-text-tertiary:#64748b;--color-text-info:#1d4ed8;
  `
}

// ── Build iframe srcdoc ────────────────────────────────────────────────────────
function buildDoc(html = '', css = '', js = '', dark) {
  const escapedJs = js.replace(/<\/script>/gi, '<\\/script>')
  const iframeBg   = dark ? '#0f1923' : '#ffffff'
  const iframeText = dark ? '#e2e8f0' : '#1e293b'

  return `<!DOCTYPE html>
<html class="${dark ? 'dark' : ''}">
<head>
<meta charset="utf-8">
<style>
:root { ${iframeThemeVars(dark)} }
*,*::before,*::after{box-sizing:border-box}
body{margin:0;padding:14px;font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;background:${iframeBg};color:${iframeText}}
html.dark .burns{background:#451a03!important;color:#fbbf24!important}
html.dark .stable{background:#052e16!important;color:#4ade80!important}
html.dark .dissolves{background:#052e16!important;color:#4ade80!important}
html.dark .separates{background:#450a0a!important;color:#f87171!important}
html.dark .atom-card,.fact-card,.result-box,.comp-item,.demo{background:#1e293b!important;border-color:#334155!important}
html.dark .ch1{background:#052e16!important;border-color:#166534!important}
html.dark .ch2{background:#172554!important;border-color:#1e40af!important}
html.dark .ch3{background:#2e1065!important;border-color:#7c3aed!important}
html.dark .ch4{background:#431407!important;border-color:#c2410c!important}
${css}
</style>
</head>
<body>
${html}
<script>
(function(){try{window.localStorage}catch(_){var _s={};var _m={getItem:function(k){return Object.prototype.hasOwnProperty.call(_s,k)?_s[k]:null},setItem:function(k,v){_s[String(k)]=String(v)},removeItem:function(k){delete _s[k]},clear:function(){_s={}},key:function(i){return Object.keys(_s)[i]||null},get length(){return Object.keys(_s).length}};try{Object.defineProperty(window,'localStorage',{value:_m,writable:true,configurable:true})}catch(__){}}})();
try{(function(){
${escapedJs}
})()}catch(e){console.error(e.message)}
;(function(){
  function report(){window.parent.postMessage({type:'sn_resize',h:document.body.scrollHeight},'*')}
  report();
  if(window.ResizeObserver){new ResizeObserver(report).observe(document.body)}
  else{window.addEventListener('load',report)}
})();
<\/script>
</body>
</html>`
}

// ── Challenge iframe — question + answer buttons injected into preview ─────────
function buildChallengeDoc(html = '', css = '', js = '', options = [], dark) {
  const iframeBg   = dark ? '#0f1923' : '#ffffff'
  const iframeText = dark ? '#e2e8f0' : '#1e293b'
  const btnBase    = dark ? '#1e293b' : '#f8fafc'
  const btnBorder  = dark ? '#334155' : '#e2e8f0'
  const escapedJs  = js.replace(/<\/script>/gi, '<\\/script>')

  const optionsHtml = options.map(o => `
    <button class="opt-btn" data-label="${o.label}" onclick="pick(this)">
      <span class="opt-label">${o.label}</span>
      <span class="opt-text">${o.text}</span>
    </button>`).join('')

  return `<!DOCTYPE html>
<html class="${dark ? 'dark' : ''}">
<head>
<meta charset="utf-8">
<style>
:root{${iframeThemeVars(dark)}}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;padding:14px;font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;background:${iframeBg};color:${iframeText}}
${css}
.sn-options{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.opt-btn{display:flex;align-items:flex-start;gap:12px;width:100%;padding:11px 14px;border-radius:9px;border:1.5px solid ${btnBorder};background:${btnBase};color:${iframeText};cursor:pointer;text-align:left;font-size:13px;line-height:1.5;transition:border-color .15s,background .15s}
.opt-btn:hover{border-color:var(--color-text-info,#3b82f6);background:var(--color-background-info,#eff6ff)}
.opt-btn.selected{border-color:var(--color-text-info,#3b82f6);background:var(--color-background-info,#eff6ff)}
.opt-btn.correct{border-color:#10b981;background:${dark ? '#052e16' : '#d1fae5'};color:${dark ? '#4ade80' : '#065f46'}}
.opt-btn.wrong{border-color:#ef4444;background:${dark ? '#450a0a' : '#fee2e2'};color:${dark ? '#f87171' : '#991b1b'}}
.opt-label{font-size:12px;font-weight:700;min-width:22px;height:22px;border-radius:50%;background:var(--color-background-tertiary,#f1f5f9);color:var(--color-text-secondary,#64748b);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.opt-btn.selected .opt-label,.opt-btn.correct .opt-label,.opt-btn.wrong .opt-label{background:currentColor;color:${iframeBg}}
.sn-feedback{margin-top:10px;padding:10px 14px;border-radius:8px;font-size:13px;line-height:1.6;display:none}
.sn-feedback.show{display:block}
.sn-feedback.pass{background:${dark ? '#052e16' : '#d1fae5'};color:${dark ? '#4ade80' : '#065f46'};border:1px solid #10b981}
.sn-feedback.fail{background:${dark ? '#450a0a' : '#fee2e2'};color:${dark ? '#f87171' : '#991b1b'};border:1px solid #ef4444}
</style>
</head>
<body>
${html}
<div class="sn-options">${optionsHtml}</div>
<div class="sn-feedback" id="sn-fb"></div>
<script>
var __answered = false;
var __correctLabel = null;
function __initChallenge(correctLabel, successMsg, failMsg) {
  __correctLabel = correctLabel;
  window.__successMsg = successMsg;
  window.__failMsg = failMsg;
}
function pick(btn) {
  if (__answered) return;
  __answered = true;
  var label = btn.getAttribute('data-label');
  var isCorrect = (label === __correctLabel);
  document.querySelectorAll('.opt-btn').forEach(function(b) {
    var bl = b.getAttribute('data-label');
    if (bl === __correctLabel) b.classList.add('correct');
    else if (bl === label && !isCorrect) b.classList.add('wrong');
  });
  var fb = document.getElementById('sn-fb');
  fb.textContent = isCorrect ? (window.__successMsg || 'Correct!') : (window.__failMsg || 'Not quite — try again.');
  fb.className = 'sn-feedback show ' + (isCorrect ? 'pass' : 'fail');
  window.parent.postMessage({type:'sn_answer',label:label,correct:isCorrect},'*');
}
(function(){try{window.localStorage}catch(_){var _s={};var _m={getItem:function(k){return Object.prototype.hasOwnProperty.call(_s,k)?_s[k]:null},setItem:function(k,v){_s[String(k)]=String(v)},removeItem:function(k){delete _s[k]},clear:function(){_s={}},key:function(i){return Object.keys(_s)[i]||null},get length(){return Object.keys(_s).length}};try{Object.defineProperty(window,'localStorage',{value:_m,writable:true,configurable:true})}catch(__){}}})();
try{(function(){
${escapedJs}
})()}catch(e){}
;(function(){
  function report(){window.parent.postMessage({type:'sn_resize',h:document.body.scrollHeight},'*')}
  report();
  if(window.ResizeObserver){new ResizeObserver(report).observe(document.body)}
  else{window.addEventListener('load',report)}
})();
<\/script>
</body>
</html>`
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function MDText({ text, T }) {
  if (!text) return null
  return (
    <div style={{ fontSize: 14, lineHeight: 1.8, color: T.text }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        h3: ({...p}) => <h3 style={{fontSize:'1.05rem',fontWeight:600,marginBottom:'0.5rem',color:T.accent}} {...p}/>,
        p:  ({...p}) => <p  style={{marginBottom:'1rem'}} {...p}/>,
        ul: ({...p}) => <ul style={{listStyleType:'disc',paddingLeft:'1.5rem',marginBottom:'1rem'}} {...p}/>,
        ol: ({...p}) => <ol style={{listStyleType:'decimal',paddingLeft:'1.5rem',marginBottom:'1rem'}} {...p}/>,
        li: ({...p}) => <li style={{marginBottom:'0.25rem'}} {...p}/>,
        strong: ({...p}) => <strong style={{color:T.text,fontWeight:600}} {...p}/>,
        code: ({inline,...p}) => inline
          ? <code style={{fontFamily:'monospace',background:T.panel2,color:T.accent,padding:'2px 6px',borderRadius:4,fontSize:12}} {...p}/>
          : <code style={{display:'block',padding:'12px',background:T.panel2,borderRadius:8,margin:'10px 0',fontSize:12,fontFamily:'monospace'}} {...p}/>,
        blockquote: ({...p}) => <blockquote style={{borderLeft:`3px solid ${T.accent}`,paddingLeft:14,color:T.muted,margin:'10px 0'}} {...p}/>,
        table: ({...p}) => <table style={{borderCollapse:'collapse',width:'100%',margin:'12px 0',fontSize:13}} {...p}/>,
        th: ({...p}) => <th style={{padding:'6px 12px',borderBottom:`2px solid ${T.accent}`,textAlign:'left',color:T.accent,fontWeight:600}} {...p}/>,
        td: ({...p}) => <td style={{padding:'6px 12px',borderBottom:`1px solid ${T.border||'rgba(255,255,255,0.08)'}`,color:T.text}} {...p}/>,
        tr: ({...p}) => <tr {...p}/>
      }}>
        {text}
      </ReactMarkdown>
    </div>
  )
}

// ── Visual cell (type:'js') — auto-runs, no editor shown ──────────────────────
function VisualCell({ cell, cellIndex, T, dark }) {
  const iframeRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [height, setHeight] = useState(cell.outputHeight || 160)
  const manualRef = useRef(false)

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = buildDoc(
        cell.html || '', cell.css || '', cell.startCode || '', dark
      )
      setLoaded(true)
      manualRef.current = false
    }
  }, [cell.html, cell.css, cell.startCode, dark])

  useEffect(() => {
    const handler = (e) => {
      if (!e.data || e.data.type !== 'sn_resize') return
      if (e.source !== iframeRef.current?.contentWindow) return
      if (!manualRef.current) setHeight(Math.max(80, e.data.h + 4))
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  function startResize(e) {
    e.preventDefault()
    manualRef.current = true
    const startY = e.clientY, startH = height
    const onMove = (ev) => setHeight(Math.max(80, startH + ev.clientY - startY))
    const onUp   = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div style={{
      marginBottom: 20, borderRadius: 12,
      border: `1px solid ${T.border}`, background: T.panel,
    }}>
      {/* Instruction prose */}
      {cell.instruction && (
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border}` }}>
          <MDText text={cell.instruction} T={T} />
        </div>
      )}
      {/* Preview — auto-sized to content */}
      <div style={{ background: T.iframeBg, borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts"
          style={{ width: '100%', height, border: 'none', display: 'block' }}
          title={`cell-${cellIndex}`}
        />
      </div>
      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        title="Drag to resize"
        style={{
          height: 8, cursor: 'ns-resize', background: T.border,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '0 0 12px 12px',
        }}
      >
        <div style={{ width: 32, height: 3, borderRadius: 2, background: T.muted, opacity: 0.5 }} />
      </div>
    </div>
  )
}

// ── Challenge cell — options rendered as buttons in iframe ─────────────────────
function ChallengeCell({ cell, cellIndex, T, dark, onPass }) {
  const iframeRef  = useRef(null)
  const [state, setState] = useState(null) // null | 'pass' | 'fail'

  // Derive the correct label from the check function
  // check(label) => true means that label is correct
  // We pre-compute it so we can pass it into the iframe JS
  const correctLabel = (() => {
    if (!cell.check || !cell.options) return null
    const found = cell.options.find(o => {
      try { return cell.check(o.label) } catch { return false }
    })
    return found ? found.label : null
  })()

  useEffect(() => {
    if (!iframeRef.current || !cell.options) return
    const escapedSuccess = (cell.successMessage || 'Correct!').replace(/'/g, "\\'")
    const escapedFail    = (cell.failMessage    || 'Not quite — try again.').replace(/'/g, "\\'")
    const initCall = `\n__initChallenge('${correctLabel}','${escapedSuccess}','${escapedFail}');`
    iframeRef.current.srcdoc = buildChallengeDoc(
      cell.html || '', cell.css || '',
      (cell.startCode || '') + initCall,
      cell.options, dark
    )
  }, [cell.html, cell.css, cell.startCode, cell.options, correctLabel, dark])

  // Listen for answer postMessage from iframe
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || e.data.type !== 'sn_answer') return
      const passed = e.data.correct
      setState(passed ? 'pass' : 'fail')
      if (passed && onPass) onPass(cellIndex)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [cellIndex, onPass])

  const [height, setHeight] = useState(cell.outputHeight || 160)
  const manualRef = useRef(false)

  useEffect(() => {
    const handler = (e) => {
      if (!e.data || e.data.type !== 'sn_resize') return
      if (e.source !== iframeRef.current?.contentWindow) return
      if (!manualRef.current) setHeight(Math.max(80, e.data.h + 4))
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  function startResize(e) {
    e.preventDefault()
    manualRef.current = true
    const startY = e.clientY, startH = height
    const onMove = (ev) => setHeight(Math.max(80, startH + ev.clientY - startY))
    const onUp   = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div style={{
      marginBottom: 20, borderRadius: 12,
      border: `1.5px solid ${state === 'pass' ? T.greenBd : state === 'fail' ? T.redBd : T.yellow}`,
      overflow: 'hidden', background: T.panel,
    }}>
      {/* Challenge header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 20px', borderBottom: `1px solid ${T.border}`,
        background: T.yellowBg,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: T.yellow + '33', border: `1.5px solid ${T.yellow}`,
          color: T.yellow, fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>?</div>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: T.yellow }}>
          Challenge
        </span>
        {state === 'pass' && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: T.green, fontWeight: 600 }}>✓ Correct</span>
        )}
        {state === 'fail' && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: T.red }}>Try again</span>
        )}
      </div>

      {/* Question instruction */}
      {cell.instruction && (
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
          <MDText text={cell.instruction} T={T} />
        </div>
      )}

      {/* Options + feedback rendered inside iframe */}
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        style={{ width: '100%', height, border: 'none', display: 'block' }}
        title={`challenge-${cellIndex}`}
      />
      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        title="Drag to resize"
        style={{
          height: 8, cursor: 'ns-resize', background: T.border,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{ width: 32, height: 3, borderRadius: 2, background: T.muted, opacity: 0.5 }} />
      </div>
    </div>
  )
}

// ── Markdown cell ─────────────────────────────────────────────────────────────
function MarkdownCell({ cell, T }) {
  return (
    <div style={{
      background: T.panel, borderRadius: 12,
      border: `1px solid ${T.border}`, padding: '20px 24px', marginBottom: 20,
    }}>
      <MDText text={cell.instruction} T={T} />
    </div>
  )
}

// ── Coding cell — Monaco editor + Run + check() ───────────────────────────────
function CodingCell({ cell, cellIndex, T, dark, onPass }) {
  const iframeRef = useRef(null)
  const [code, setCode]         = useState(cell.startCode || '')
  const [logs, setLogs]         = useState([])
  const [hasRun, setHasRun]     = useState(false)
  const [result, setResult]     = useState(null) // null | 'pass' | 'fail'
  const [showSolution, setShowSolution] = useState(false)
  const [showConsole, setShowConsole]   = useState(false)
  const [height, setHeight]     = useState(cell.outputHeight || 220)
  const manualRef = useRef(false)

  // Console messages from iframe
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || e.data.type !== 'jsnb_console') return
      if (e.data.cellIndex !== cellIndex) return
      setLogs(prev => [...prev, { level: e.data.level, msg: e.data.msg }])
      setShowConsole(true)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [cellIndex])

  // Auto-resize from iframe
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || e.data.type !== 'sn_resize') return
      if (e.source !== iframeRef.current?.contentWindow) return
      if (!manualRef.current) setHeight(Math.max(80, e.data.h + 4))
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  function startResize(e) {
    e.preventDefault()
    manualRef.current = true
    const startY = e.clientY, startH = height
    const onMove = (ev) => setHeight(Math.max(80, startH + ev.clientY - startY))
    const onUp   = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const activeCode = showSolution ? (cell.solutionCode || code) : code

  // Build an iframe doc that also pipes console to parent
  function buildCodingDoc(html, css, js) {
    const escaped = js.replace(/<\/script>/gi, '<\\/script>')
    const iframeBg   = dark ? '#0f1923' : '#ffffff'
    const iframeText = dark ? '#e2e8f0' : '#1e293b'
    return `<!DOCTYPE html><html class="${dark?'dark':''}"><head><meta charset="utf-8">
<style>:root{${iframeThemeVars(dark)}}*,*::before,*::after{box-sizing:border-box}
body{margin:0;padding:14px;font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;background:${iframeBg};color:${iframeText}}
${css || ''}</style></head><body>${html || ''}
<script>
window.__cellId='coding-${cellIndex}';
(function(){
  var _l=console.log.bind(console),_e=console.error.bind(console),_w=console.warn.bind(console);
  function post(lv,args){var msg=args.map(function(a){try{return typeof a==='object'?JSON.stringify(a,null,2):String(a);}catch(_){return String(a);}}).join(' ');
    window.parent.postMessage({type:'jsnb_console',level:lv,msg:msg,cellIndex:${cellIndex}},'*');}
  console.log=function(){_l.apply(console,arguments);post('log',[].slice.call(arguments));};
  console.error=function(){_e.apply(console,arguments);post('error',[].slice.call(arguments));};
  console.warn=function(){_w.apply(console,arguments);post('warn',[].slice.call(arguments));};
  window.addEventListener('error',function(ev){if(ev.error)post('error',[ev.message]);ev.preventDefault();},true);
})();
try{(function(){\n${escaped}\n})();}catch(e){console.error('Error: '+e.message);}
;(function(){function r(){window.parent.postMessage({type:'sn_resize',h:document.body.scrollHeight},'*')}r();
if(window.ResizeObserver){new ResizeObserver(r).observe(document.body)}else{window.addEventListener('load',r);
}})();<\/script></body></html>`
  }

  const run = useCallback(() => {
    setLogs([])
    setHasRun(true)
    setShowConsole(true)
    if (iframeRef.current) {
      iframeRef.current.srcdoc = buildCodingDoc(cell.html || '', cell.css || '', activeCode)
    }
    if (cell.check) {
      try {
        const passed = cell.check(activeCode)
        setResult(passed ? 'pass' : 'fail')
        if (passed && onPass) onPass(cellIndex)
      } catch (_) { setResult('fail') }
    }
  }, [activeCode, cell, cellIndex, dark, onPass])

  const reset = () => {
    setCode(cell.startCode || '')
    setLogs([])
    setHasRun(false)
    setResult(null)
    setShowSolution(false)
    if (iframeRef.current) iframeRef.current.srcdoc = ''
  }

  const lineCount = activeCode.split('\n').length
  const editorH   = Math.min(400, Math.max(120, lineCount * 20 + 28))
  const logColor  = { log: T.text, error: T.red, warn: T.yellow }
  const logIcon   = { log: '>', error: '✗', warn: '⚠' }

  const accentBorder = result === 'pass' ? T.greenBd : result === 'fail' ? T.redBd : T.accent

  return (
    <div style={{ marginBottom: 24, borderRadius: 12, border: `1.5px solid ${accentBorder}`, overflow: 'hidden', background: T.panel }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 18px', borderBottom:`1px solid ${T.border}`, background: T.panel2 }}>
        <div style={{ width:26, height:26, borderRadius:'50%', background:T.accent+'22', border:`1.5px solid ${T.accent}`, color:T.accent, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✎</div>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:T.accent }}>Coding Challenge</span>
        {result==='pass' && <span style={{ marginLeft:'auto', fontSize:11, color:T.green, fontWeight:600 }}>✓ Passed</span>}
        {result==='fail' && <span style={{ marginLeft:'auto', fontSize:11, color:T.red }}>✗ Try again</span>}
      </div>

      {/* Instruction */}
      {cell.instruction && (
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}` }}>
          <MDText text={cell.instruction} T={T} />
        </div>
      )}

      {/* Preview pane */}
      {hasRun && (
        <div style={{ background: T.iframeBg, borderBottom:`1px solid ${T.border}` }}>
          <div style={{ fontSize:9, fontWeight:700, color:T.muted, letterSpacing:'.08em', textTransform:'uppercase', padding:'6px 14px 0' }}>Output</div>
          <iframe ref={iframeRef} sandbox="allow-scripts"
            style={{ width:'100%', height, border:'none', display:'block' }}
            title={`coding-${cellIndex}`}
          />
          <div onMouseDown={startResize} title="Drag to resize"
            style={{ height:8, cursor:'ns-resize', background:T.border, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:32, height:3, borderRadius:2, background:T.muted, opacity:.5 }} />
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:T.panel2, borderBottom:`1px solid ${T.border}`, padding:'0 10px' }}>
        <span style={{ fontSize:11, color:T.muted, fontFamily:'monospace' }}>JavaScript</span>
        <div style={{ display:'flex', gap:6, padding:'6px 0' }}>
          {cell.solutionCode && (
            <button onClick={() => setShowSolution(s => !s)} style={{ padding:'4px 11px', borderRadius:6, border:`0.5px solid ${T.muted}`, background:'transparent', color:T.muted, fontSize:11, cursor:'pointer' }}>
              {showSolution ? 'Hide solution' : 'Show solution'}
            </button>
          )}
          <button onClick={reset} style={{ padding:'4px 11px', borderRadius:6, border:`0.5px solid ${T.border}`, background:'transparent', color:T.muted, fontSize:11, cursor:'pointer' }}>Reset</button>
          <button onClick={run} style={{ padding:'5px 16px', borderRadius:6, border:'none', background:'#0ea5e9', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>▶ Run</button>
        </div>
      </div>

      {/* Monaco editor */}
      <div style={{ background: dark ? '#0c1222' : '#f8fafc' }}>
        <Editor
          key={`coding-${cellIndex}-${dark}`}
          height={editorH}
          language={cell.language || 'javascript'}
          value={showSolution ? (cell.solutionCode || code) : code}
          onChange={(val='') => { if (!showSolution) setCode(val) }}
          theme={dark ? 'vs-dark' : 'light'}
          options={{ fontSize:13, lineHeight:20, minimap:{enabled:false}, scrollBeyondLastLine:false, wordWrap:'on', tabSize:2, readOnly:showSolution, renderLineHighlight:'none', overviewRulerLanes:0, folding:false, lineDecorationsWidth:6, lineNumbersMinChars:3, padding:{top:10,bottom:10} }}
        />
      </div>

      {/* Console */}
      {showConsole && (
        <div style={{ background:T.panel2, borderTop:`1px solid ${T.border}`, padding:'8px 14px', maxHeight:150, overflowY:'auto' }}>
          <div style={{ fontSize:10, fontWeight:600, color:T.muted, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:5 }}>Console</div>
          {logs.length === 0
            ? <div style={{ fontFamily:'monospace', fontSize:12, color:T.muted }}>Run the cell to see output.</div>
            : logs.map((l,i) => <div key={i} style={{ fontFamily:'monospace', fontSize:12, color:logColor[l.level]||T.text, display:'flex', gap:8 }}><span style={{color:T.muted}}>{logIcon[l.level]}</span><span style={{wordBreak:'break-all'}}>{l.msg}</span></div>)
          }
        </div>
      )}

      {/* Feedback */}
      {hasRun && result && (
        <div style={{ padding:'10px 18px', borderTop:`1px solid ${T.border}`, fontSize:13, fontWeight:500,
          background: result==='pass' ? T.greenBg : T.redBg,
          color: result==='pass' ? T.green : T.red }}>
          {result === 'pass' ? (cell.successMessage || '✓ Challenge complete!') : (cell.failMessage || '✗ Not quite — try again.')}
        </div>
      )}
    </div>
  )
}

// ── Walkthrough cell — numbered steps + read-only preview ─────────────────────
function WalkthroughCell({ cell, cellIndex, T, dark }) {
  const [step, setStep] = useState(0)
  const iframeRef = useRef(null)
  const [height, setHeight] = useState(cell.outputHeight || 280)
  const manualRef = useRef(false)
  const steps = cell.steps || []
  const currentStep = steps[step] || {}

  // Build cumulative code up to current step
  const cumulativeCode = steps.slice(0, step + 1).map(s => s.code || '').join('\n')

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = buildDoc(cell.html || '', cell.css || '', cumulativeCode, dark)
    }
  }, [step, dark])

  useEffect(() => {
    const handler = (e) => {
      if (!e.data || e.data.type !== 'sn_resize') return
      if (e.source !== iframeRef.current?.contentWindow) return
      if (!manualRef.current) setHeight(Math.max(80, e.data.h + 4))
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  function startResize(e) {
    e.preventDefault()
    manualRef.current = true
    const startY = e.clientY, startH = height
    const onMove = (ev) => setHeight(Math.max(80, startH + ev.clientY - startY))
    const onUp   = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div style={{ marginBottom: 24, borderRadius: 12, border:`1.5px solid ${T.accent}`, overflow:'hidden', background:T.panel }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 18px', borderBottom:`1px solid ${T.border}`, background:T.panel2 }}>
        <div style={{ width:26, height:26, borderRadius:'50%', background:T.accent+'22', border:`1.5px solid ${T.accent}`, color:T.accent, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>⟳</div>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:T.accent }}>Walkthrough</span>
        <span style={{ marginLeft:'auto', fontSize:11, color:T.muted }}>Step {step+1} of {steps.length}</span>
      </div>

      {/* Top prose instruction */}
      {cell.instruction && (
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}` }}>
          <MDText text={cell.instruction} T={T} />
        </div>
      )}

      <div style={{ display:'flex', gap:0, minHeight:400 }}>
        {/* Step list sidebar */}
        <div style={{ width:220, borderRight:`1px solid ${T.border}`, background:T.panel2, padding:'10px 0', flexShrink:0 }}>
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              display:'flex', alignItems:'flex-start', gap:10, width:'100%', padding:'10px 14px',
              background: i===step ? T.accent+'18' : 'transparent',
              borderLeft: i===step ? `3px solid ${T.accent}` : '3px solid transparent',
              border:'none', borderRight:'none', borderTop:'none', borderBottom:'none',
              cursor:'pointer', textAlign:'left',
            }}>
              <span style={{ width:20, height:20, borderRadius:'50%', background:i<=step?T.accent:T.border, color:i<=step?'#fff':T.muted, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                {i < step ? '✓' : i+1}
              </span>
              <span style={{ fontSize:11, color:i===step?T.accent:T.muted, fontWeight:i===step?600:400, lineHeight:1.4 }}>{s.title || `Step ${i+1}`}</span>
            </button>
          ))}
        </div>

        {/* Right panel: explanation + code snippet + preview */}
        <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
          {/* Step explanation */}
          <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}` }}>
            {currentStep.title && <div style={{ fontSize:13, fontWeight:700, color:T.accent, marginBottom:8 }}>{currentStep.title}</div>}
            {currentStep.explanation && <MDText text={currentStep.explanation} T={T} />}
          </div>

          {/* Code snippet (read-only, syntax highlighted) */}
          {currentStep.code && (
            <div style={{ background:dark?'#0c1222':'#f8fafc', borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontSize:9, fontWeight:700, color:T.muted, letterSpacing:'.08em', textTransform:'uppercase', padding:'6px 14px 0' }}>New code this step</div>
              <Editor
                key={`wt-${cellIndex}-${step}-${dark}`}
                height={Math.min(300, Math.max(60, (currentStep.code.split('\n').length)*20+20))}
                language={cell.language || 'javascript'}
                value={currentStep.code}
                theme={dark ? 'vs-dark' : 'light'}
                options={{ readOnly:true, fontSize:12, lineHeight:19, minimap:{enabled:false}, scrollBeyondLastLine:false, wordWrap:'on', renderLineHighlight:'none', overviewRulerLanes:0, folding:false, lineDecorationsWidth:6, lineNumbersMinChars:3, padding:{top:8,bottom:8}, domReadOnly:true }}
              />
            </div>
          )}

          {/* Live preview of cumulative code */}
          <div style={{ background:T.iframeBg, flex:1 }}>
            <div style={{ fontSize:9, fontWeight:700, color:T.muted, letterSpacing:'.08em', textTransform:'uppercase', padding:'6px 14px 2px' }}>Live result (cumulative)</div>
            <iframe ref={iframeRef} sandbox="allow-scripts"
              style={{ width:'100%', height, border:'none', display:'block' }}
              title={`walkthrough-${cellIndex}`}
            />
            <div onMouseDown={startResize} title="Drag to resize"
              style={{ height:8, cursor:'ns-resize', background:T.border, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:32, height:3, borderRadius:2, background:T.muted, opacity:.5 }} />
            </div>
          </div>

          {/* Prev / Next */}
          <div style={{ display:'flex', gap:8, padding:'10px 16px', borderTop:`1px solid ${T.border}`, background:T.panel2 }}>
            <button onClick={() => setStep(s => Math.max(0,s-1))} disabled={step===0}
              style={{ padding:'5px 16px', borderRadius:6, border:`1px solid ${T.border}`, background:'transparent', color:step===0?T.muted:T.text, cursor:step===0?'default':'pointer', fontSize:12 }}>← Prev</button>
            <button onClick={() => setStep(s => Math.min(steps.length-1,s+1))} disabled={step===steps.length-1}
              style={{ padding:'5px 16px', borderRadius:6, border:'none', background:step===steps.length-1?T.border:'#0ea5e9', color:step===steps.length-1?T.muted:'#fff', cursor:step===steps.length-1?'default':'pointer', fontSize:12, fontWeight:600 }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ cells, passedSet, T }) {
  const visualCells    = cells.filter(c => c.type !== 'markdown').length
  const challengeCells = cells.filter(c => c.type === 'challenge').length
  const passed         = passedSet.size
  if (challengeCells === 0) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0 16px', marginBottom: 4,
    }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: T.border, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          width: `${challengeCells > 0 ? (passed / challengeCells) * 100 : 0}%`,
          background: passed === challengeCells ? T.green : T.accent,
          transition: 'width .4s ease',
        }} />
      </div>
      <span style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap' }}>
        {passed} / {challengeCells} challenges
      </span>
    </div>
  )
}

// ── Main ScienceNotebook ──────────────────────────────────────────────────────
export default function ScienceNotebook({ lesson: lessonProp, params = {} }) {
  const lesson = lessonProp ?? params?.lesson
  const dark   = useIsDark()
  const T      = makeT(dark)
  const [passedChallenges, setPassedChallenges] = useState(new Set())

  const handlePass = useCallback((idx) => {
    setPassedChallenges(prev => new Set([...prev, idx]))
  }, [])

  if (!lesson) return null

  const { title, subtitle, cells = [] } = lesson

  return (
    <div style={{ fontFamily: 'var(--font-sans, system-ui)', color: T.text, padding: '4px 0' }}>
      {/* Lesson header */}
      {title && (
        <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.accent, marginBottom: 5 }}>
            Chemistry
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: T.text, marginBottom: subtitle ? 6 : 0 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>{subtitle}</div>}
        </div>
      )}

      {/* Progress */}
      <ProgressBar cells={cells} passedSet={passedChallenges} T={T} />

      {/* Cells */}
      {cells.map((cell, i) => {
        if (cell.type === 'markdown')    return <MarkdownCell key={i} cell={cell} T={T} />
        if (cell.type === 'challenge')   return <ChallengeCell key={i} cell={cell} cellIndex={i} T={T} dark={dark} onPass={handlePass} />
        if (cell.type === 'coding')      return <CodingCell key={i} cell={cell} cellIndex={i} T={T} dark={dark} onPass={handlePass} />
        if (cell.type === 'walkthrough') return <WalkthroughCell key={i} cell={cell} cellIndex={i} T={T} dark={dark} />
        // type:'js' and anything else = auto-run visual preview
        return <VisualCell key={i} cell={cell} cellIndex={i} T={T} dark={dark} />
      })}
    </div>
  )
}
