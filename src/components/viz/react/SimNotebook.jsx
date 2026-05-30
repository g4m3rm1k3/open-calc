// SimNotebook — embedded simulation notebook for lessons
// Each cell has prose, editable code, and a live sandboxed Three.js/Canvas preview.
// Challenge cells have a different visual treatment and don't auto-run.

import { useState, useRef, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { setupOpenCalcMonaco } from '../../../utils/monacoThemes.js'
import { buildSandbox } from '../../../utils/simSandbox.js'
import MarkdownProse from '../../math/MarkdownProse.jsx'

// ── Theme hook ────────────────────────────────────────────────────────────────
function useColors() {
  const isDark = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    dark,
    bg:       dark ? '#0f172a' : '#f8fafc',
    surface:  dark ? '#1e293b' : '#ffffff',
    surface2: dark ? '#0f172a' : '#f1f5f9',
    border:   dark ? '#334155' : '#e2e8f0',
    text:     dark ? '#e2e8f0' : '#1e293b',
    muted:    dark ? '#94a3b8' : '#64748b',
    hint:     dark ? '#475569' : '#94a3b8',
    // sky / 3D accent
    sky:      dark ? '#38bdf8' : '#0284c7',
    skyBg:    dark ? 'rgba(56,189,248,0.10)'  : 'rgba(2,132,199,0.07)',
    skyBd:    dark ? '#38bdf8'  : '#0284c7',
    // emerald / 2D accent
    em:       dark ? '#34d399' : '#059669',
    emBg:     dark ? 'rgba(52,211,153,0.10)'  : 'rgba(5,150,105,0.07)',
    emBd:     dark ? '#34d399' : '#059669',
    // amber / challenge accent
    amber:    dark ? '#fbbf24' : '#d97706',
    amberBg:  dark ? 'rgba(251,191,36,0.10)'  : 'rgba(217,119,6,0.07)',
    amberBd:  dark ? '#fbbf24' : '#d97706',
    // green / easy
    green:    dark ? '#4ade80' : '#16a34a',
    greenBg:  dark ? 'rgba(74,222,128,0.10)'  : 'rgba(22,163,74,0.07)',
    greenBd:  dark ? '#4ade80' : '#16a34a',
    // red / hard
    red:      dark ? '#f87171' : '#dc2626',
    redBg:    dark ? 'rgba(248,113,113,0.10)' : 'rgba(220,38,38,0.07)',
    redBd:    dark ? '#f87171' : '#dc2626',
    // violet / html accent
    violet:   dark ? '#a78bfa' : '#7c3aed',
    violetBg: dark ? 'rgba(167,139,250,0.10)' : 'rgba(124,58,237,0.07)',
    violetBd: dark ? '#a78bfa' : '#7c3aed',
  }
}

// ── Difficulty badge colors ───────────────────────────────────────────────────
function diffStyle(difficulty, C) {
  if (difficulty === 'easy') return { bg: C.greenBg, border: C.greenBd, text: C.green }
  if (difficulty === 'hard') return { bg: C.redBg,   border: C.redBd,   text: C.red   }
  return { bg: C.amberBg, border: C.amberBd, text: C.amber }
}

// ── Individual simulation cell ────────────────────────────────────────────────
function SimCell({ cell, cellNumber, isChallenge, C }) {
  const [code, setCode]         = useState(cell.code ?? '')
  const [ready, setReady]       = useState(false)
  const [codeOpen, setCodeOpen] = useState(!isChallenge)
  const [hintOpen, setHintOpen] = useState(false)
  const [logs, setLogs]         = useState([])
  const iframeRef = useRef(null)
  const srcdoc    = useRef(buildSandbox())

  const mode_   = cell.mode ?? '3d'
  const is3d    = mode_ === '3d'
  const isHtml  = mode_ === 'html'
  const accent   = isChallenge ? C.amber : is3d ? C.sky : isHtml ? C.violet : C.em
  const accentBg = isChallenge ? C.amberBg : is3d ? C.skyBg : isHtml ? C.violetBg : C.emBg
  const accentBd = isChallenge ? C.amberBd : is3d ? C.skyBd : isHtml ? C.violetBd : C.emBd

  // Forward messages from sandbox
  useEffect(() => {
    function onMsg({ data, source }) {
      if (!iframeRef.current || source !== iframeRef.current.contentWindow) return
      if (data?.type === 'sim_ready') {
        setReady(true)
        if (!isChallenge) {
          iframeRef.current.contentWindow.postMessage(
            { type: 'run', code, mode: cell.mode || '3d' }, '*'
          )
        }
      }
      if (data?.type === 'log') {
        const color = data.level === 'error' ? C.red : data.level === 'warn' ? C.amber : C.green
        setLogs(prev => [...prev.slice(-49), { text: data.args.join(' '), color }])
      }
      if (data?.type === 'error') {
        setLogs(prev => [...prev.slice(-49), { text: data.message, color: C.red }])
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const run = useCallback(() => {
    setLogs([])
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'run', code, mode: cell.mode || '3d' }, '*'
    )
  }, [code, cell.mode])

  const reset = useCallback(() => {
    setCode(cell.code ?? '')
    setLogs([])
    iframeRef.current?.contentWindow?.postMessage({ type: 'reset' }, '*')
  }, [cell.code])

  const lineCount = (code || '').split('\n').length
  const editorH   = Math.min(Math.max(lineCount + 2, 10), 30) * 20

  const dc = diffStyle(cell.difficulty, C)

  return (
    <div style={{
      background: `${C.surface}ee`,
      border: `1.5px solid ${accentBd}55`,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 20,
      boxShadow: `0 4px 20px ${accentBd}18, 0 1px 4px rgba(0,0,0,0.2)`,
    }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      {isChallenge ? (
        <div style={{
          padding: '12px 16px',
          background: `linear-gradient(135deg, ${C.amberBg} 0%, ${C.skyBg} 100%)`,
          borderBottom: `1px solid ${C.amberBd}44`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: cell.prompt ? 8 : 0 }}>
            {/* Number badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24, borderRadius: '50%',
              background: C.amber, color: '#000', fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>
              {cellNumber}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>
              {cell.challengeTitle || 'Challenge'}
            </span>
            {/* Mode badge */}
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '2px 7px', borderRadius: 5,
              background: is3d ? C.skyBg : isHtml ? C.violetBg : C.emBg,
              border: `1px solid ${is3d ? C.skyBd : isHtml ? C.violetBd : C.emBd}`,
              color: is3d ? C.sky : isHtml ? C.violet : C.em,
            }}>
              {cell.mode ?? '3d'}
            </span>
            {/* Difficulty badge */}
            {cell.difficulty && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5,
                background: dc.bg, border: `1px solid ${dc.border}`, color: dc.text,
              }}>
                {cell.difficulty}
              </span>
            )}
          </div>
          {cell.prompt && (
            <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
              {cell.prompt}
            </p>
          )}
        </div>
      ) : (
        <div style={{
          padding: '7px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          background: `linear-gradient(90deg, ${accentBg} 0%, ${C.surface2} 60%, ${C.surface} 100%)`,
          borderBottom: `1px solid ${accentBd}44`,
          borderLeft: `3px solid ${accent}`,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: '50%',
            background: accent, color: is3d ? '#000' : '#fff', fontSize: 11, fontWeight: 700,
          }}>
            {cellNumber}
          </span>
          <span style={{
            flex: 1, fontSize: 12, fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase', color: accent,
          }}>
            {cell.cellTitle}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '2px 7px', borderRadius: 5,
            background: is3d ? C.skyBg : C.emBg,
            border: `1px solid ${is3d ? C.skyBd : C.emBd}`,
            color: is3d ? C.sky : C.em,
          }}>
            {cell.mode ?? '3d'}
          </span>
        </div>
      )}

      {/* ── Prose ──────────────────────────────────────────────────────────── */}
      {cell.prose?.length > 0 && (
        <div style={{ padding: '10px 16px 12px', borderBottom: `1px solid ${C.border}` }}>
          {cell.prose.map((p, i) => (
            <div key={i} style={{ marginTop: i > 0 ? 8 : 0, fontSize: 13, color: C.text, lineHeight: 1.7 }}>
              <MarkdownProse text={p} />
            </div>
          ))}
        </div>
      )}

      {/* ── Code toggle (regular cells only) ───────────────────────────────── */}
      {!isChallenge && (
        <button
          onClick={() => setCodeOpen(o => !o)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '5px 16px',
            background: C.surface2, border: 'none', borderBottom: `0.5px solid ${C.border}`,
            cursor: 'pointer', color: C.hint, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.07em', textTransform: 'uppercase',
          }}
        >
          <span>Code</span>
          <span style={{ fontSize: 12 }}>{codeOpen ? '▾' : '▸'}</span>
        </button>
      )}

      {/* ── Editor ─────────────────────────────────────────────────────────── */}
      {(codeOpen || isChallenge) && (
        <div style={{ borderBottom: `0.5px solid ${C.border}` }}>
          <Editor
            height={editorH + 'px'}
            language="javascript"
            value={code}
            onChange={v => setCode(v ?? '')}
            theme={C.dark ? 'open-calc-dark' : 'open-calc-light'}
            beforeMount={setupOpenCalcMonaco}
            options={{
              fontSize: 12, lineHeight: 19,
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              minimap: { enabled: false }, scrollBeyondLastLine: false,
              padding: { top: 8, bottom: 8 }, tabSize: 2,
            }}
          />
        </div>
      )}

      {/* ── Run bar ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', background: C.surface2, borderBottom: `0.5px solid ${C.border}`,
      }}>
        <button onClick={run} disabled={!ready} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 12px', borderRadius: 6, border: 'none', cursor: ready ? 'pointer' : 'default',
          background: accent, color: is3d && !isChallenge ? '#000' : '#fff',
          fontSize: 11, fontWeight: 700, opacity: ready ? 1 : 0.4, transition: 'opacity .2s',
        }}>
          ▶ Run
        </button>
        <button onClick={reset} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 6,
          border: `0.5px solid ${C.border}`, background: 'transparent', cursor: 'pointer',
          color: C.muted, fontSize: 11, fontWeight: 600,
        }}>
          ↺ Reset
        </button>
        {logs.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: C.hint }}>
            {logs.length} log{logs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Preview ────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', background: '#02060f' }}>
        {!ready && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: '#02060f', zIndex: 10,
          }}>
            <span style={{ fontSize: 12, color: '#475569' }}>Loading sandbox…</span>
          </div>
        )}
        <iframe
          ref={iframeRef}
          srcDoc={srcdoc.current}
          sandbox="allow-scripts"
          style={{ width: '100%', border: 0, display: 'block', height: isChallenge ? 300 : 340 }}
          title={`sim-cell-${cell.id}`}
        />
      </div>

      {/* ── Logs ───────────────────────────────────────────────────────────── */}
      {logs.length > 0 && (
        <div style={{
          borderTop: `0.5px solid ${C.border}`,
          background: C.bg,
          padding: '6px 14px 8px',
          maxHeight: 96,
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: 11,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {logs.map((l, i) => (
            <div key={i} style={{ color: l.color, lineHeight: 1.5 }}>{l.text}</div>
          ))}
        </div>
      )}

      {/* ── Hint (challenge cells only) ─────────────────────────────────────── */}
      {isChallenge && cell.hint && (
        <div style={{ borderTop: `0.5px solid ${C.border}` }}>
          <button
            onClick={() => setHintOpen(o => !o)}
            style={{
              width: '100%', padding: '8px 16px', background: 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              fontSize: 12, color: C.amber, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span>{hintOpen ? '▾' : '▸'}</span>
            {hintOpen ? 'Hide hint' : 'Show hint'}
          </button>
          {hintOpen && (
            <div style={{
              padding: '8px 16px 12px',
              background: C.amberBg,
              borderTop: `0.5px solid ${C.amberBd}`,
              fontSize: 13, color: C.amber, lineHeight: 1.6,
            }}>
              {cell.hint}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── SimNotebook — renders a sequence of cells ─────────────────────────────────
export default function SimNotebook({ initialCells: cellsProp, params = {} }) {
  const initialCells = cellsProp ?? params.initialCells ?? []
  const C = useColors()

  let regularCount = 0
  let challengeCount = 0

  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif', padding: '4px 0' }}>
      {initialCells.map((cell) => {
        const isChallenge = !!cell.challengeType
        // Key includes code so navigating between lessons (same cell IDs, different
        // code) forces a full remount — otherwise useState keeps stale code.
        const cellKey = `${cell.id}::${(cell.code ?? '').slice(0, 40)}`
        if (isChallenge) {
          challengeCount++
          return (
            <SimCell
              key={cellKey}
              cell={cell}
              cellNumber={challengeCount}
              isChallenge
              C={C}
            />
          )
        } else {
          regularCount++
          return (
            <SimCell
              key={cellKey}
              cell={cell}
              cellNumber={regularCount}
              isChallenge={false}
              C={C}
            />
          )
        }
      })}
    </div>
  )
}
