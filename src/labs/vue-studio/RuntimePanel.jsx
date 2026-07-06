import { useState } from 'react'
import { SANDBOX_HTML } from './sandbox.js'

function TreeNode({ node, isDark, depth = 0 }) {
  const [open, setOpen] = useState(true)
  const text   = isDark ? '#e2e8f0' : '#1e293b'
  const muted  = isDark ? '#64748b' : '#94a3b8'
  const accent = '#10b981'
  const dataBg = isDark ? '#0f172a' : '#ecfdf5'
  const hasChildren = node.children?.length > 0
  const hasData     = Object.keys(node.data ?? {}).length > 0

  return (
    <div style={{ marginLeft: depth * 12 }}>
      <div
        onClick={() => (hasChildren || hasData) && setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0', cursor: (hasChildren || hasData) ? 'pointer' : 'default' }}
      >
        <span style={{ fontSize: 10, color: muted, width: 10 }}>
          {(hasChildren || hasData) ? (open ? '▾' : '▸') : '·'}
        </span>
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: accent, fontWeight: 600 }}>
          &lt;{node.name}&gt;
        </span>
      </div>
      {open && (hasData || hasChildren) && (
        <div style={{ marginLeft: 14 }}>
          {hasData && Object.entries(node.data).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 6, fontSize: 11, fontFamily: 'monospace', padding: '1px 0', marginLeft: 6 }}>
              <span style={{ color: muted }}>{k}:</span>
              <span style={{ color: text, background: dataBg, padding: '0 4px', borderRadius: 3 }}>
                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </span>
            </div>
          ))}
          {hasChildren && node.children.map((child, i) => (
            <TreeNode key={i} node={child} isDark={isDark} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

const LOG_COLORS = {
  log:   { dark: '#94a3b8', light: '#475569' },
  warn:  { dark: '#fbbf24', light: '#d97706' },
  error: { dark: '#f87171', light: '#dc2626' },
  info:  { dark: '#60a5fa', light: '#2563eb' },
}

export default function RuntimePanel({ iframeRef, logs, componentTree, onClearLogs, isDark }) {
  const [activeTab, setActiveTab] = useState('preview')

  const bg      = isDark ? '#0f172a' : '#ffffff'
  const surface = isDark ? '#0c1426' : '#f8fafc'
  const border  = isDark ? '#1e293b' : '#e2e8f0'
  const text    = isDark ? '#e2e8f0' : '#1e293b'
  const muted   = isDark ? '#64748b' : '#94a3b8'
  const accent  = '#10b981'
  const tabBg   = isDark ? '#1e293b' : '#f1f5f9'

  const tabs = [
    { id: 'preview', label: 'Preview' },
    { id: 'tree',    label: `Tree${componentTree ? '' : ''}` },
    { id: 'console', label: `Console${logs.length ? ` (${logs.length})` : ''}` },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg }}>

      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${border}`, flexShrink: 0, background: tabBg }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '7px 14px',
              fontSize: 11,
              fontWeight: activeTab === t.id ? 700 : 400,
              border: 'none',
              borderBottom: activeTab === t.id ? `2px solid ${accent}` : '2px solid transparent',
              background: 'none',
              color: activeTab === t.id ? accent : muted,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
        {activeTab === 'console' && logs.length > 0 && (
          <button
            onClick={onClearLogs}
            style={{ marginLeft: 'auto', marginRight: 8, padding: '3px 8px', fontSize: 10, color: muted, background: 'none', border: `1px solid ${border}`, borderRadius: 4, cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Preview iframe — always mounted, shown/hidden via CSS so it keeps state */}
      <div style={{ flex: activeTab === 'preview' ? 1 : 0, minHeight: 0, overflow: 'hidden', display: activeTab === 'preview' ? 'block' : 'none' }}>
        <iframe
          ref={iframeRef}
          srcDoc={SANDBOX_HTML}
          sandbox="allow-scripts allow-same-origin"
          title="Vue Studio Preview"
          style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
        />
      </div>

      {/* Component tree tab */}
      {activeTab === 'tree' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {componentTree ? (
            <TreeNode node={componentTree} isDark={isDark} />
          ) : (
            <div style={{ fontSize: 12, color: muted, fontStyle: 'italic', textAlign: 'center', marginTop: 40 }}>
              Click ▶ Run to see the component tree.
            </div>
          )}
        </div>
      )}

      {/* Console tab */}
      {activeTab === 'console' && (
        <div style={{ flex: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11 }}>
          {logs.length === 0 ? (
            <div style={{ padding: '12px 14px', color: muted, fontStyle: 'italic' }}>No console output.</div>
          ) : (
            logs.map((entry, i) => {
              const col = LOG_COLORS[entry.level]?.[isDark ? 'dark' : 'light'] ?? text
              const prefix = entry.level === 'warn' ? '⚠ ' : entry.level === 'error' ? '✕ ' : '› '
              return (
                <div
                  key={i}
                  style={{
                    padding: '4px 14px',
                    borderBottom: `1px solid ${border}`,
                    color: col,
                    background: entry.level === 'error' ? (isDark ? '#1c0a0a' : '#fff5f5') : entry.level === 'warn' ? (isDark ? '#1c1400' : '#fffbeb') : 'none',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  <span style={{ opacity: 0.5, marginRight: 6, fontSize: 10 }}>{prefix}</span>
                  {entry.args.join(' ')}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Status bar */}
      <div style={{ padding: '5px 12px', borderTop: `1px solid ${border}`, flexShrink: 0, background: surface }}>
        <span style={{ fontSize: 10, color: muted }}>
          {logs.some(l => l.level === 'error')
            ? <span style={{ color: LOG_COLORS.error[isDark ? 'dark' : 'light'] }}>✕ {logs.filter(l => l.level === 'error').length} error(s)</span>
            : componentTree
              ? <span style={{ color: accent }}>● Live</span>
              : <span>Run to preview</span>
          }
        </span>
      </div>
    </div>
  )
}
