import { useState } from 'react'

const PHASE_COLORS = {
  1: { bg: '#dbeafe', text: '#1e40af' },
  2: { bg: '#dcfce7', text: '#166534' },
  3: { bg: '#fef3c7', text: '#92400e' },
  4: { bg: '#ede9fe', text: '#5b21b6' },
}

// Renders inline text with bold (`**text**`) and inline-code (`` `code` ``) support
function InlineText({ text, mono }) {
  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    const codeMatch = remaining.match(/`(.+?)`/)

    let next = null
    if (boldMatch && codeMatch) {
      next = boldMatch.index <= codeMatch.index ? boldMatch : codeMatch
    } else {
      next = boldMatch ?? codeMatch
    }

    if (!next) {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }

    if (next.index > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, next.index)}</span>)
    }

    if (next === boldMatch || remaining[next.index] === '*') {
      parts.push(<strong key={key++}>{next[1]}</strong>)
    } else {
      parts.push(
        <code key={key++} style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.88em',
          background: 'rgba(99,102,241,0.1)',
          color: '#4f46e5',
          padding: '1px 5px',
          borderRadius: 3,
        }}>{next[1]}</code>
      )
    }

    remaining = remaining.slice(next.index + next[0].length)
  }

  return <>{parts}</>
}

function Block({ block, isDark }) {
  const text    = isDark ? '#cbd5e1' : '#1e293b'
  const muted   = isDark ? '#64748b' : '#94a3b8'
  const codeBg  = isDark ? '#0f172a' : '#f8fafc'
  const codeBdr = isDark ? '#334155' : '#e2e8f0'
  const noteText = isDark ? '#7dd3fc' : '#0369a1'
  const noteBg   = isDark ? 'rgba(14,165,233,0.07)' : '#f0f9ff'
  const noteBdr  = isDark ? '#0c4a6e' : '#bae6fd'

  switch (block.type) {
    case 'h2':
      return <h2 style={{ fontSize: 15, fontWeight: 700, margin: '22px 0 8px', color: text, fontFamily: 'system-ui' }}><InlineText text={block.text} /></h2>
    case 'h3':
      return <h3 style={{ fontSize: 13, fontWeight: 700, margin: '16px 0 6px', color: text, fontFamily: 'system-ui' }}><InlineText text={block.text} /></h3>
    case 'p':
      return <p style={{ margin: '0 0 10px', lineHeight: 1.65, color: text, fontFamily: 'system-ui', fontSize: 13 }}><InlineText text={block.text} /></p>
    case 'divider':
      return <hr style={{ border: 'none', borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, margin: '18px 0' }} />

    case 'code':
      return (
        <pre style={{
          background: codeBg, border: `1px solid ${codeBdr}`, borderRadius: 8,
          padding: '10px 14px', margin: '10px 0', overflowX: 'auto',
          fontSize: 12, lineHeight: 1.65, color: isDark ? '#94a3b8' : '#475569',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}>
          {block.text}
        </pre>
      )

    case 'note':
      return (
        <div style={{ background: noteBg, border: `1px solid ${noteBdr}`, borderRadius: 8, padding: '10px 14px', margin: '10px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: noteText, marginBottom: 4, fontFamily: 'system-ui' }}>ⓘ NOTE</div>
          <div style={{ fontSize: 13, color: noteText, lineHeight: 1.55, fontFamily: 'system-ui' }}><InlineText text={block.text} /></div>
        </div>
      )

    case 'tip':
      return (
        <div style={{ background: isDark ? 'rgba(16,185,129,0.07)' : '#f0fdf4', border: `1px solid ${isDark ? '#064e3b' : '#bbf7d0'}`, borderRadius: 8, padding: '10px 14px', margin: '10px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#34d399' : '#059669', marginBottom: 6, fontFamily: 'system-ui' }}>✦ HINT</div>
          <pre style={{ margin: 0, fontSize: 12, color: isDark ? '#6ee7b7' : '#065f46', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{block.text}</pre>
        </div>
      )

    case 'callout':
      return (
        <div style={{ background: isDark ? 'rgba(37,99,235,0.1)' : '#eff6ff', border: `1px solid ${isDark ? '#1e3a5f' : '#bfdbfe'}`, borderRadius: 8, padding: '12px 14px', margin: '14px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#60a5fa' : '#1d4ed8', marginBottom: 4, fontFamily: 'system-ui' }}>✓ CHECKPOINT</div>
          <div style={{ fontSize: 13, color: isDark ? '#93c5fd' : '#1e40af', lineHeight: 1.5, fontFamily: 'system-ui' }}><InlineText text={block.text} /></div>
        </div>
      )

    case 'task':
      return (
        <ol style={{ margin: '10px 0', padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {block.steps.map((step, i) => (
            <li key={i} style={{ fontSize: 13, lineHeight: 1.6, color: text, fontFamily: 'system-ui' }}>
              <InlineText text={step} />
            </li>
          ))}
        </ol>
      )

    default:
      return null
  }
}

// ── Lesson list (picker) view ─────────────────────────────────────────────────

function LessonList({ lessons, currentIdx, onSelect, isDark }) {
  const border = isDark ? '#1e293b' : '#e2e8f0'
  const bg     = isDark ? '#0f172a' : '#fff'
  const text   = isDark ? '#e2e8f0' : '#0f172a'
  const muted  = isDark ? '#64748b' : '#94a3b8'
  const hover  = isDark ? '#1e293b' : '#f8fafc'

  const byPhase = {}
  lessons.forEach((l, i) => {
    const key = l.phaseLabel ?? 'Phase 1'
    if (!byPhase[key]) byPhase[key] = []
    byPhase[key].push({ lesson: l, idx: i })
  })

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
      {Object.entries(byPhase).map(([phase, items]) => (
        <div key={phase}>
          <div style={{ padding: '6px 14px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: muted, fontFamily: 'system-ui' }}>
            {phase}
          </div>
          {items.map(({ lesson, idx }) => {
            const isCurrent = idx === currentIdx
            const phaseColor = PHASE_COLORS[lesson.phase] ?? PHASE_COLORS[1]
            return (
              <button
                key={lesson.id}
                onClick={() => onSelect(idx)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px',
                  border: 'none', borderLeft: isCurrent ? '3px solid #2563eb' : '3px solid transparent',
                  background: isCurrent ? (isDark ? '#0c1a2e' : '#eff6ff') : 'transparent',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3,
                }}
                onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = hover }}
                onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontFamily: 'system-ui', fontWeight: 700, color: isCurrent ? '#2563eb' : muted }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? (isDark ? '#93c5fd' : '#1d4ed8') : (isDark ? '#cbd5e1' : '#334155'), fontFamily: 'system-ui' }}>
                    {lesson.title}
                  </span>
                  {isCurrent && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#2563eb' }}>●</span>}
                </div>
                <div style={{ display: 'flex', gap: 4, paddingLeft: 22 }}>
                  {lesson.tags.slice(0, 3).map(t => (
                    <span key={t} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: isDark ? '#1e293b' : '#f1f5f9', color: muted, fontFamily: 'system-ui' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Root panel ────────────────────────────────────────────────────────────────

export default function MissionPanel({ lesson, lessonIdx, lessons, isDark, onSelectLesson, onBack }) {
  const [view, setView] = useState('lesson')  // 'list' | 'lesson'

  const bg     = isDark ? '#0b1120' : '#ffffff'
  const border = isDark ? '#1e293b' : '#e2e8f0'
  const text   = isDark ? '#e2e8f0' : '#0f172a'
  const muted  = isDark ? '#64748b' : '#94a3b8'
  const accent = '#2563eb'

  const phaseColor = PHASE_COLORS[lesson.phase] ?? PHASE_COLORS[1]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg, color: text }}>

      {/* Top bar */}
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: muted, cursor: 'pointer', fontSize: 11, padding: '2px 4px', fontFamily: 'system-ui' }}>
          ← Labs
        </button>
        <span style={{ color: muted, fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: accent, fontFamily: 'system-ui' }}>OpenSocial</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setView(v => v === 'list' ? 'lesson' : 'list')}
          style={{
            background: view === 'list' ? accent : 'none',
            border: `1px solid ${view === 'list' ? accent : border}`,
            color: view === 'list' ? '#fff' : muted,
            borderRadius: 5, padding: '3px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'system-ui',
          }}
          title="All lessons"
        >
          ☰ Lessons
        </button>
      </div>

      {/* List or lesson content */}
      {view === 'list' ? (
        <LessonList
          lessons={lessons}
          currentIdx={lessonIdx}
          onSelect={(idx) => { onSelectLesson(idx); setView('lesson') }}
          isDark={isDark}
        />
      ) : (
        <>
          {/* Phase badge + lesson title */}
          <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
            <div style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, marginBottom: 8, background: phaseColor.bg, color: phaseColor.text, fontFamily: 'system-ui' }}>
              {lesson.phaseLabel}
            </div>
            <div style={{ fontSize: 11, color: muted, fontFamily: 'system-ui', marginBottom: 2 }}>
              Lesson {lessonIdx + 1} of {lessons.length}
            </div>
            <h1 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, lineHeight: 1.2, fontFamily: 'system-ui' }}>
              {lesson.title}
            </h1>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
            {lesson.content.map((block, i) => (
              <Block key={i} block={block} isDark={isDark} />
            ))}
          </div>

          {/* Prev / Next nav */}
          <div style={{ borderTop: `1px solid ${border}`, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <button
              onClick={() => lessonIdx > 0 && onSelectLesson(lessonIdx - 1)}
              disabled={lessonIdx === 0}
              style={{ background: 'none', border: 'none', color: lessonIdx > 0 ? accent : muted, cursor: lessonIdx > 0 ? 'pointer' : 'default', fontSize: 12, fontWeight: 600, fontFamily: 'system-ui', padding: 0 }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 11, color: muted, fontFamily: 'system-ui' }}>{lessonIdx + 1} / {lessons.length}</span>
            <button
              onClick={() => lessonIdx < lessons.length - 1 && onSelectLesson(lessonIdx + 1)}
              disabled={lessonIdx === lessons.length - 1}
              style={{ background: 'none', border: 'none', color: lessonIdx < lessons.length - 1 ? accent : muted, cursor: lessonIdx < lessons.length - 1 ? 'pointer' : 'default', fontSize: 12, fontWeight: 600, fontFamily: 'system-ui', padding: 0 }}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
