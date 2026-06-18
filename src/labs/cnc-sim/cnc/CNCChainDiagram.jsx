import { useState, useEffect, useRef } from 'react'

function useIsDark() {
  const isDark = () => document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

const NODES = [
  {
    id: 'cad',
    label: 'CAD',
    sub: 'Geometry',
    colorLight: { bg: '#EEEDFE', border: '#AFA9EC', text: '#3C3489', sub: '#534AB7' },
    colorDark:  { bg: '#26215C', border: '#534AB7', text: '#EEEDFE', sub: '#AFA9EC' },
    arrow: { label: '.STEP', labelLight: '#534AB7', labelDark: '#AFA9EC' },
  },
  {
    id: 'cam',
    label: 'CAM',
    sub: 'Toolpaths',
    colorLight: { bg: '#E1F5EE', border: '#5DCAA5', text: '#04342C', sub: '#0F6E56' },
    colorDark:  { bg: '#04342C', border: '#1D9E75', text: '#E1F5EE', sub: '#9FE1CB' },
    arrow: { label: 'Post', labelLight: '#0F6E56', labelDark: '#9FE1CB' },
  },
  {
    id: 'gcode',
    label: 'G-code',
    sub: 'Instructions',
    colorLight: { bg: '#FAEEDA', border: '#EF9F27', text: '#412402', sub: '#854F0B' },
    colorDark:  { bg: '#412402', border: '#BA7517', text: '#FAEEDA', sub: '#FAC775' },
    arrow: { label: '.nc file', labelLight: '#854F0B', labelDark: '#FAC775' },
  },
  {
    id: 'ctrl',
    label: 'Controller',
    sub: 'Reads & executes',
    colorLight: { bg: '#E6F1FB', border: '#85B7EB', text: '#042C53', sub: '#185FA5' },
    colorDark:  { bg: '#042C53', border: '#378ADD', text: '#E6F1FB', sub: '#B5D4F4' },
    arrow: { label: 'Signals', labelLight: '#185FA5', labelDark: '#B5D4F4' },
  },
  {
    id: 'mach',
    label: 'Machine',
    sub: 'Motion',
    colorLight: { bg: '#FAECE7', border: '#F0997B', text: '#4A1B0C', sub: '#993C1D' },
    colorDark:  { bg: '#4A1B0C', border: '#D85A30', text: '#FAECE7', sub: '#F5C4B3' },
    arrow: null,
  },
]

const DETAILS = {
  cad: {
    title: 'CAD — Computer-Aided Design',
    sections: [
      { heading: 'What it does', body: 'Creates the geometry the rest of the chain depends on. Common formats: .STEP (universal), .IGES (legacy), .F3D (Fusion 360), .SLDPRT (SolidWorks). CAD defines what to make — it contains zero machining information.' },
      { heading: 'What does NOT live here', body: 'Toolpaths, feeds, speeds, stock material, fixturing. Those decisions belong to CAM. A CAD file sent directly to a machine means nothing.' },
      { heading: 'Failure mode', body: 'Model has gaps, non-manifold geometry, or wrong coordinate origin. CAM either refuses to process it or generates incorrect toolpaths silently — the worst outcome.', warn: true },
    ],
  },
  cam: {
    title: 'CAM — Computer-Aided Manufacturing',
    sections: [
      { heading: 'What it does', body: 'Imports CAD geometry and adds machining intent: which tool, what strategy (adaptive, contour, pocket), feeds, speeds, stepdown, entry moves. Generates an internal generic toolpath, then runs it through the post-processor.' },
      { heading: 'Post-processor', body: 'The translator inside CAM. Converts the generic internal toolpath into the G-code dialect of a specific controller — Fanuc, Siemens, Haas, etc. One toolpath, many possible outputs.' },
      { heading: 'Failure mode', body: 'Wrong post-processor selected. Fanuc code sent to a Siemens machine. Or: feed rates that ignore actual material hardness. Or: missing rest-machining passes leaving unmachined stock that breaks the tool.', warn: true },
    ],
  },
  gcode: {
    title: 'G-code — The instruction file',
    sections: [
      { heading: 'What it is', body: 'A plain text file — open it in any text editor. Each line is a "block." The controller reads blocks top to bottom, one at a time, like a script. No branching in basic G-code (only in Macro B).' },
      { heading: 'Modal codes', body: 'Once you command G01, it stays active until you command something else. A line with only X5.0 still cuts at the last commanded feedrate with the last commanded motion mode. This is powerful and dangerous.' },
      { heading: 'Failure mode', body: 'Assuming a modal code was cancelled when it wasn\'t. A G83 drilling cycle left active will attempt to drill at the next G00 position. A G41 cutter comp left active will apply offset to unintended moves.', warn: true },
    ],
  },
  ctrl: {
    title: 'Controller — The CNC brain',
    sections: [
      { heading: 'What it does', body: 'Reads G-code blocks, interpolates motion paths at 1,000–4,000 cycles/sec, sends velocity commands to servo drives, reads encoder feedback, corrects following error in real time. It is not a general-purpose computer — it is a hard-real-time system.' },
      { heading: 'Major families', body: 'Fanuc (0i, 30i/31i/32i) — most common worldwide. Haas — Fanuc-compatible, dominant in US job shops. Siemens 840D — European automotive. Okuma OSP — turning-heavy shops. Mitsubishi M800 — common in Asia.' },
      { heading: 'Failure mode', body: 'Loading a program written for one dialect onto a different controller. Some G-codes overlap but mean different things across dialects. Fanuc G83 vs Siemens CYCLE83 — same concept, completely different syntax.', warn: true },
    ],
  },
  mach: {
    title: 'Machine — Where metal meets code',
    sections: [
      { heading: 'What it does', body: 'Converts servo signals into physical motion through motors, ballscrews, and linear guides. Repeatability on a modern VMC: ±0.002mm. That is thinner than a human hair.' },
      { heading: 'What the program does not know', body: 'Actual tool length (managed via G43 offsets), actual work position (managed via G54–G59 work offsets), tool wear, thermal expansion of the machine structure, and cutting vibration. All must be set correctly by the operator.' },
      { heading: 'Failure mode', body: 'Work offset not set, or set to wrong value. Machine cuts air — or cuts into the fixture at full rapid speed (30–50 m/min on a VMC). A spindle crash at speed costs $20,000–$80,000 in spindle replacement alone.', warn: true },
    ],
  },
}

export default function CNCChainDiagram({ params = {} }) {
  const dark = useIsDark()
  const [active, setActive] = useState(null)
  const containerRef = useRef(null)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      setNarrow(entries[0].contentRect.width < 480)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const C = {
    bg:      dark ? '#0f172a' : '#ffffff',
    surface: dark ? '#1e293b' : '#f8fafc',
    border:  dark ? '#334155' : '#e2e8f0',
    text:    dark ? '#f1f5f9' : '#0f172a',
    muted:   dark ? '#94a3b8' : '#475569',
    hint:    dark ? '#475569' : '#94a3b8',
    warn:    dark ? '#fca5a5' : '#b91c1c',
    warnBg:  dark ? '#450a0a' : '#fef2f2',
    arrowColor: dark ? '#475569' : '#94a3b8',
  }

  const detail = active ? DETAILS[active] : null

  return (
    <div ref={containerRef} style={{ background: C.bg, borderRadius: 12, padding: '16px 20px', border: `1px solid ${C.border}`, fontFamily: 'system-ui, sans-serif' }}>
      {/* Chain row */}
      <div style={{
        display: 'flex',
        flexDirection: narrow ? 'column' : 'row',
        alignItems: narrow ? 'stretch' : 'center',
        gap: narrow ? 6 : 0,
        marginBottom: 16,
      }}>
        {NODES.map((node, i) => {
          const col = dark ? node.colorDark : node.colorLight
          const isActive = active === node.id
          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: narrow ? 'column' : 'row', alignItems: 'center', flex: node.arrow ? 'none' : 1, minWidth: 0 }}>
              {/* Node box */}
              <div
                onClick={() => setActive(isActive ? null : node.id)}
                style={{
                  background: col.bg,
                  border: `${isActive ? 2 : 1}px solid ${isActive ? col.border : col.border}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  minWidth: narrow ? '100%' : 84,
                  textAlign: 'center',
                  transition: 'box-shadow .15s',
                  boxShadow: isActive ? `0 0 0 3px ${col.border}40` : 'none',
                  flex: narrow ? 1 : 'none',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: col.text, lineHeight: 1.2 }}>{node.label}</div>
                <div style={{ fontSize: 11, color: col.sub, marginTop: 2 }}>{node.sub}</div>
              </div>
              {/* Arrow */}
              {node.arrow && (
                <div style={{
                  display: 'flex',
                  flexDirection: narrow ? 'row' : 'column',
                  alignItems: 'center',
                  padding: narrow ? '2px 8px' : '0 4px',
                  gap: 2,
                  minWidth: narrow ? 'auto' : 52,
                }}>
                  <div style={{ fontSize: 10, color: dark ? node.colorDark.sub : node.colorLight.sub, fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {node.arrow.label}
                  </div>
                  <div style={{ fontSize: narrow ? 14 : 16, color: C.arrowColor, lineHeight: 1 }}>
                    {narrow ? '↓' : '→'}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: 12, color: C.hint, margin: '0 0 12px', textAlign: 'center' }}>
        Click any stage to understand what it does — and where it can fail.
      </p>

      {/* Detail panel */}
      {detail && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 12 }}>{detail.title}</div>
          {detail.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: i < detail.sections.length - 1 ? 12 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.warn ? C.warn : C.muted, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {s.warn ? '⚠ ' : ''}{s.heading}
              </div>
              <div style={{
                fontSize: 13, color: s.warn ? C.warn : C.muted, lineHeight: 1.6,
                background: s.warn ? C.warnBg : 'transparent',
                borderRadius: s.warn ? 6 : 0,
                padding: s.warn ? '6px 10px' : 0,
                border: s.warn ? `1px solid ${C.warn}30` : 'none',
              }}>
                {s.body}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
