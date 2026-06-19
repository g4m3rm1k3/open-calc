import { useNavigate } from 'react-router-dom'
import { X, ExternalLink } from 'lucide-react'

function inferType(id) {
  if (id.startsWith('pages/'))      return 'Page'
  if (id.startsWith('context/'))    return 'Context'
  if (id.startsWith('hooks/'))      return 'Hook'
  if (id.startsWith('labs/'))       return 'Lab'
  if (id.startsWith('games/'))      return 'Game'
  if (id.startsWith('features/'))   return 'Feature'
  if (id.startsWith('components/')) return 'Component'
  if (id.startsWith('data/'))       return 'Data'
  if (id.startsWith('utils/'))      return 'Utility'
  if (id.startsWith('tools/'))      return 'Tool'
  if (id.startsWith('scripts/'))    return 'Script'
  if (/\/use[A-Z]/.test(id))        return 'Hook'
  if (/Context\.(jsx?|tsx?)$/.test(id))  return 'Context'
  if (/Provider\.(jsx?|tsx?)$/.test(id)) return 'Provider'
  return 'Module'
}

function displayName(label) {
  return label.replace(/\.(jsx?|tsx?|mjs)$/, '')
}

export default function NodePanel({ node, onClose }) {
  const navigate = useNavigate()
  const { id, label, folder, rgb, meta, importedBy = 0, importsCnt = 0 } = node
  const [r, g, b] = rgb
  const color = `rgb(${r},${g},${b})`
  const type  = inferType(id)

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: 56,
        right: 20,
        width: 340,
        maxHeight: 'calc(100vh - 76px)',
        overflowY: 'auto',
        zIndex: 200,
        background: 'rgba(6,10,22,0.88)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 12px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04) inset',
        borderTop: `2px solid ${color}`,
        animation: 'nodepanel-in 0.16s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <style>{`
        @keyframes nodepanel-in {
          from { opacity: 0; transform: translateX(16px) scale(0.98); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        .np-scroll::-webkit-scrollbar { width: 4px; }
        .np-scroll::-webkit-scrollbar-track { background: transparent; }
        .np-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: '14px 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          {/* Folder badge */}
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
            background: `rgba(${r},${g},${b},0.14)`, color,
            letterSpacing: '.06em', fontFamily: 'JetBrains Mono, monospace',
            textTransform: 'uppercase',
          }}>{folder}</span>
          {/* Type badge */}
          <span style={{
            fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
            background: 'rgba(255,255,255,0.05)', color: '#475569',
            letterSpacing: '.05em', fontFamily: 'JetBrains Mono, monospace',
            textTransform: 'uppercase',
          }}>{type}</span>
          {/* Close */}
          <button
            onClick={onClose}
            title="Close (or click away)"
            style={{
              marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
              color: '#334155', padding: 4, borderRadius: 6, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
            onMouseLeave={e => e.currentTarget.style.color = '#334155'}
          >
            <X size={14} />
          </button>
        </div>

        {/* Title */}
        <div style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 5 }}>
          {meta?.title || displayName(label)}
        </div>

        {/* Path */}
        <div style={{
          fontSize: 10, color: '#334155',
          fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all',
        }}>
          {id}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 16px' }} />

      {/* ── Description ── */}
      <div style={{ padding: '12px 16px' }}>
        {meta?.description ? (
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
            {meta.description}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: '#1e293b', fontStyle: 'italic', lineHeight: 1.6 }}>
            No description yet.{' '}
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#334155' }}>
              export const meta = {'{ ... }'}
            </span>
          </p>
        )}
      </div>

      {/* ── Concept block ── */}
      {meta?.concept && (
        <>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 16px' }} />
          <div style={{ padding: '12px 16px' }}>
            <div style={{
              fontSize: 9, fontWeight: 700, color: '#334155',
              letterSpacing: '.1em', textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: 8,
            }}>Concept</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: color, boxShadow: `0 0 6px ${color}`,
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                {meta.concept}
              </span>
            </div>

            {meta.conceptDetail && (
              <p style={{
                margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.7,
                paddingLeft: 14, borderLeft: `2px solid rgba(${r},${g},${b},0.25)`,
              }}>
                {meta.conceptDetail}
              </p>
            )}
          </div>
        </>
      )}

      {/* ── Footer: connections + open button ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 16px' }} />
      <div style={{
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          fontSize: 10, color: '#334155',
          fontFamily: 'JetBrains Mono, monospace',
          display: 'flex', gap: 10,
        }}>
          <span title="Files that import this one">
            <span style={{ color: '#475569' }}>↑</span> {importedBy} imported by
          </span>
          <span title="Files this one imports">
            <span style={{ color: '#475569' }}>↓</span> {importsCnt} imports
          </span>
        </div>

        {meta?.jumpTo && (
          <button
            onClick={() => navigate(meta.jumpTo)}
            style={{
              marginLeft: 'auto',
              background: `rgba(${r},${g},${b},0.12)`,
              border: `1px solid rgba(${r},${g},${b},0.28)`,
              color,
              borderRadius: 8,
              padding: '5px 12px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = `rgba(${r},${g},${b},0.22)`}
            onMouseLeave={e => e.currentTarget.style.background = `rgba(${r},${g},${b},0.12)`}
          >
            Open <ExternalLink size={11} />
          </button>
        )}
      </div>
    </div>
  )
}
