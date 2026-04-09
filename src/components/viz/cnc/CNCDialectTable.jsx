import React, { useState, useEffect } from 'react'

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

const MARKET = [
  { name: 'Fanuc',        badge: 'fanuc',   share: '~50–60%', note: 'Worldwide — this course' },
  { name: 'Haas',         badge: 'haas',    share: '~15%',    note: 'North America dominant' },
  { name: 'Siemens 840D', badge: 'siemens', share: '~15–20%', note: 'Europe / automotive' },
  { name: 'Okuma OSP',    badge: 'okuma',   share: '~5–8%',   note: 'Turning-heavy shops' },
]

const ROWS = [
  {
    concept: 'Variable assignment',
    fanuc:   '#100 = 25.0',
    siemens: 'R10 = 25.0',
    haas:    '#100 = 25.0',
    okuma:   'VCALL V100 = 25.0',
    note: 'Haas is nearly identical to Fanuc for variable syntax. Siemens uses R-variables (R0–R249 for user vars). Okuma uses VCALL syntax.',
  },
  {
    concept: 'WHILE loop',
    fanuc:   'WHILE [#1 LT 10] DO1\n  …\nEND1',
    siemens: 'WHILE R1 < 10\n  …\nENDWHILE',
    haas:    'WHILE [#1 LT 10] DO1\n  …\nEND1',
    okuma:   'WHILE V1 < 10\n  …\nEWHILE',
    note: 'Siemens syntax reads like a modern language. Fanuc/Haas use bracket conditions with DO/END nesting numbers (DO1…END1, DO2…END2). Nesting levels must match exactly.',
  },
  {
    concept: 'IF statement',
    fanuc:   'IF [#1 GT 0] GOTO 100',
    siemens: 'IF R1 > 0 GOTOF LABEL1',
    haas:    'IF [#1 GT 0] GOTO 100',
    okuma:   'IF V1 > 0 GOTO LABEL1',
    note: 'Fanuc/Haas GOTO jumps to a block number (N100). Siemens GOTOF/GOTOB jumps to a named label — more readable and refactor-friendly.',
  },
  {
    concept: 'Subroutine call',
    fanuc:   'M98 P1001 L3',
    siemens: 'L1001  or\nCYCLE1001(args)',
    haas:    'M98 P1001',
    okuma:   'CALL O1001',
    note: 'Siemens uses function-call syntax with parameters passed inline. Fanuc passes data only via shared variables (#1–#33 as local vars inside subroutines).',
  },
  {
    concept: 'Math functions',
    fanuc:   'SIN[#1]\nSQRT[#2]\nABS[#3]',
    siemens: 'SIN(R1)\nSQRT(R2)\nABS(R3)',
    haas:    'SIN[#1]\nSQRT[#2]\nABS[#3]',
    okuma:   'SIN[V1]\nSQRT[V2]\nABS[V3]',
    note: 'Fanuc uses square brackets [ ] for all function calls. This is a common gotcha — parentheses ( ) are for comments in Fanuc G-code. Never mix them.',
  },
  {
    concept: 'Work offsets',
    fanuc:   'G54–G59\nG54.1 P1–P48',
    siemens: 'G54–G599\n(native large table)',
    haas:    'G54–G59\nG154 P1–P99',
    okuma:   'G54–G59\n(extended via params)',
    note: 'Siemens has a much larger native offset table. Fanuc G54.1 P1–P48 extended work offsets require parameter unlock on some controllers. Haas G154 is the Haas equivalent.',
  },
  {
    concept: 'Comments',
    fanuc:   '(THIS IS A COMMENT)',
    siemens: '; This is a comment',
    haas:    '(THIS IS A COMMENT)',
    okuma:   '(THIS IS A COMMENT)',
    note: 'Critical: Fanuc uses parentheses for comments. Siemens uses semicolons. If you run Siemens code on a Fanuc machine, semicolon lines become alarmed blocks. This is a very common post-processor mistake.',
  },
  {
    concept: 'Program end',
    fanuc:   'M30',
    siemens: 'M30 or M02',
    haas:    'M30',
    okuma:   'M30',
    note: 'M30 is universal. On Fanuc, M30 rewinds the program pointer and resets modal codes. Always prefer M30 over M02 — M02 behavior varies across controllers.',
  },
]

const BADGE_COLORS = {
  fanuc:   { light: ['#E6F1FB', '#185FA5'], dark: ['#042C53', '#85B7EB'] },
  haas:    { light: ['#FAEEDA', '#854F0B'], dark: ['#412402', '#EF9F27'] },
  siemens: { light: ['#EAF3DE', '#3B6D11'], dark: ['#173404', '#97C459'] },
  okuma:   { light: ['#FAECE7', '#993C1D'], dark: ['#4A1B0C', '#F0997B'] },
}

export default function CNCDialectTable({ params = {} }) {
  const dark = useIsDark()
  const [activeRow, setActiveRow] = useState(null)

  const C = {
    bg:      dark ? '#0f172a' : '#ffffff',
    surface: dark ? '#1e293b' : '#f8fafc',
    border:  dark ? '#334155' : '#e2e8f0',
    text:    dark ? '#f1f5f9' : '#0f172a',
    muted:   dark ? '#94a3b8' : '#475569',
    hint:    dark ? '#475569' : '#94a3b8',
    codeBg:  dark ? '#0f172a' : '#f1f5f9',
    rowHover:dark ? '#1e293b' : '#f8fafc',
    noteBg:  dark ? '#1e3a5f' : '#eff6ff',
    noteBorder:dark ? '#1d4ed8' : '#bfdbfe',
    noteText:  dark ? '#bfdbfe' : '#1e40af',
    th:      dark ? '#94a3b8' : '#64748b',
  }

  const badge = (key) => {
    const col = dark ? BADGE_COLORS[key].dark : BADGE_COLORS[key].light
    return { background: col[0], color: col[1] }
  }

  return (
    <div style={{ background: C.bg, borderRadius: 12, padding: '16px 20px', border: `1px solid ${C.border}`, fontFamily: 'system-ui, sans-serif' }}>
      {/* Market share row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, marginBottom: 16 }}>
        {MARKET.map(m => {
          const col = badge(m.badge)
          return (
            <div key={m.name} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: col.background, color: col.color }}>{m.name}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: col.color, lineHeight: 1 }}>{m.share}</div>
              <div style={{ fontSize: 11, color: C.hint, marginTop: 3 }}>{m.note}</div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {['Concept', 'Fanuc', 'Siemens 840D', 'Haas'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, fontWeight: 600, color: C.th, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                  {h === 'Fanuc' && <span style={{ ...badge('fanuc'), fontSize: 10, padding: '1px 6px', borderRadius: 3, marginRight: 4 }}>●</span>}
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => {
              const isActive = activeRow === i
              return (
                <React.Fragment key={i}>
                  <tr
                    onClick={() => setActiveRow(isActive ? null : i)}
                    style={{ cursor: 'pointer', background: isActive ? C.rowHover : 'transparent', borderBottom: isActive ? 'none' : `1px solid ${C.border}` }}
                  >
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: C.text, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                      {row.concept}
                      <span style={{ marginLeft: 6, fontSize: 10, color: C.hint }}>{isActive ? '▲' : '▼'}</span>
                    </td>
                    {['fanuc', 'siemens', 'haas'].map(d => (
                      <td key={d} style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <code style={{
                          display: 'block',
                          fontFamily: 'monospace', fontSize: 11,
                          background: C.codeBg,
                          border: `1px solid ${C.border}`,
                          borderRadius: 4, padding: '4px 7px',
                          color: badge(d).color,
                          whiteSpace: 'pre',
                          lineHeight: 1.6,
                        }}>{row[d]}</code>
                      </td>
                    ))}
                  </tr>
                  {isActive && (
                    <tr key={`${i}-note`} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td colSpan={4} style={{ padding: '0 10px 10px' }}>
                        <div style={{ background: C.noteBg, border: `1px solid ${C.noteBorder}`, borderRadius: 6, padding: '8px 12px', fontSize: 12, color: C.noteText, lineHeight: 1.65 }}>
                          {row.note}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12, color: C.muted, marginTop: 12, lineHeight: 1.65 }}>
        <strong style={{ color: C.text }}>Bottom line:</strong> If you know Fanuc Macro B, you can read Siemens code with ~15 minutes of syntax reference work. The logic is identical — variables, conditionals, loops, math. Only the punctuation and keywords change. This course teaches Fanuc because it is the majority dialect, but the patterns transfer directly to every other controller.
      </p>
    </div>
  )
}
