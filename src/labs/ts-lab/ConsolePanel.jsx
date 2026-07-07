import { useRef, useEffect, useState } from 'react'

const EVENT_ICONS = {
  'fetch-start': { icon: '⬆', color: '#3b82f6', label: 'fetch' },
  'fetch-done':  { icon: '⬇', color: '#10b981', label: 'response' },
  'fetch-error': { icon: '✕', color: '#ef4444', label: 'fetch error' },
  'click':       { icon: '⊙', color: '#8b5cf6', label: 'click' },
  'dom-update':  { icon: '⬡', color: '#f59e0b', label: 'DOM' },
}

const CONSOLE_COLORS = {
  log:   { text: null,      bg: null },
  warn:  { text: '#92400e', bg: '#fffbeb' },
  error: { text: '#991b1b', bg: '#fff1f2' },
}
const CONSOLE_COLORS_DARK = {
  log:   { text: null,      bg: null },
  warn:  { text: '#fcd34d', bg: 'rgba(234,179,8,0.08)' },
  error: { text: '#fca5a5', bg: 'rgba(239,68,68,0.08)' },
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}.${String(d.getMilliseconds()).padStart(3,'0')}`
}

function shortUrl(url) {
  try {
    const u = new URL(url)
    const path = u.pathname.length > 30 ? '...' + u.pathname.slice(-28) : u.pathname
    return u.hostname + path
  } catch { return url.slice(0, 50) }
}

export default function ConsolePanel({ entries, onClear, isDark }) {
  const [tab, setTab] = useState('all')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  const bg      = isDark ? '#0b1120' : '#f8fafc'
  const border  = isDark ? '#1e293b' : '#e2e8f0'
  const text    = isDark ? '#cbd5e1' : '#334155'
  const muted   = isDark ? '#475569' : '#94a3b8'
  const tabBg   = isDark ? '#0f172a' : '#fff'
  const rowHov  = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'

  const consoleColors = isDark ? CONSOLE_COLORS_DARK : CONSOLE_COLORS

  const filtered = tab === 'all' ? entries
    : tab === 'console' ? entries.filter(e => e.source === 'console' || e.source === 'error')
    : entries.filter(e => e.source === 'event')

  const consoleCount = entries.filter(e => e.source === 'console' || e.source === 'error').length
  const eventCount = entries.filter(e => e.source === 'event').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12 }}>

      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${border}`, flexShrink: 0, gap: 2, padding: '0 8px', background: tabBg }}>
        {[
          { id: 'all', label: 'All', count: entries.length },
          { id: 'console', label: 'Console', count: consoleCount },
          { id: 'events', label: 'Events', count: eventCount },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '6px 10px', fontSize: 11, border: 'none', background: 'none', cursor: 'pointer',
              color: tab === t.id ? (isDark ? '#e2e8f0' : '#0f172a') : muted,
              borderBottom: tab === t.id ? '2px solid #3b82f6' : '2px solid transparent',
              fontFamily: 'system-ui, sans-serif', fontWeight: tab === t.id ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 999,
                background: tab === t.id ? '#3b82f6' : (isDark ? '#1e293b' : '#e2e8f0'),
                color: tab === t.id ? '#fff' : muted,
              }}>{t.count}</span>
            )}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={onClear}
          style={{ background: 'none', border: 'none', color: muted, cursor: 'pointer', fontSize: 11, padding: '4px 8px', fontFamily: 'system-ui', borderRadius: 4 }}
          title="Clear"
        >
          ⌫ Clear
        </button>
      </div>

      {/* Entries */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2px 0' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '20px 16px', color: muted, fontSize: 11, fontFamily: 'system-ui', textAlign: 'center' }}>
            {entries.length === 0
              ? 'Run your code to see output here'
              : 'No entries for this filter'}
          </div>
        )}

        {filtered.map((entry, i) => {
          if (entry.source === 'console') {
            const colors = consoleColors[entry.level] ?? consoleColors.log
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, padding: '3px 12px',
                background: colors.bg ?? 'transparent',
                borderLeft: entry.level === 'error' ? '2px solid #ef4444'
                  : entry.level === 'warn' ? '2px solid #f59e0b' : 'none',
              }}>
                <span style={{ color: muted, fontSize: 10, flexShrink: 0, marginTop: 1 }}>
                  {formatTime(entry.ts)}
                </span>
                <span style={{
                  color: colors.text ?? text,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all', flex: 1, lineHeight: 1.6,
                }}>
                  {entry.args?.join(' ') ?? ''}
                </span>
              </div>
            )
          }

          if (entry.source === 'error') {
            const colors = isDark ? { text: '#fca5a5', bg: 'rgba(239,68,68,0.08)' } : { text: '#991b1b', bg: '#fff1f2' }
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, padding: '3px 12px',
                background: colors.bg, borderLeft: '2px solid #ef4444',
              }}>
                <span style={{ color: muted, fontSize: 10, flexShrink: 0, marginTop: 1 }}>
                  {formatTime(entry.ts)}
                </span>
                <span style={{ color: colors.text, whiteSpace: 'pre-wrap', wordBreak: 'break-all', flex: 1, lineHeight: 1.6 }}>
                  ✕ {entry.message}
                </span>
              </div>
            )
          }

          if (entry.source === 'event') {
            const meta = EVENT_ICONS[entry.kind] ?? { icon: '·', color: muted, label: entry.kind }
            let detail = ''
            if (entry.kind === 'fetch-start') detail = `${entry.method} ${shortUrl(entry.url)}`
            else if (entry.kind === 'fetch-done') detail = `${entry.status} ${shortUrl(entry.url)} (${entry.ms}ms)`
            else if (entry.kind === 'fetch-error') detail = `${shortUrl(entry.url)} — ${entry.error}`
            else if (entry.kind === 'click') detail = `<${entry.tag}>${entry.text ? ` "${entry.text}"` : ''}`
            else if (entry.kind === 'dom-update') detail = `+${entry.added} node${entry.added !== 1 ? 's' : ''}${entry.removed ? `, -${entry.removed}` : ''}`

            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '3px 12px',
              }}>
                <span style={{ color: muted, fontSize: 10, flexShrink: 0 }}>
                  {formatTime(entry.ts)}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: meta.color,
                  background: meta.color + '1a', padding: '1px 6px', borderRadius: 999,
                  fontFamily: 'system-ui', flexShrink: 0,
                }}>
                  {meta.icon} {meta.label}
                </span>
                <span style={{ color: text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {detail}
                </span>
              </div>
            )
          }

          return null
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
