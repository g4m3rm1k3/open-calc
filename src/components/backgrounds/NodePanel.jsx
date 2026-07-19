import { useNavigate } from 'react-router-dom'
import { X, ExternalLink, ArrowDownToLine, ArrowUpFromLine, Layers, BookOpen, Zap } from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────

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

// Role that a file plays architecturally, inferred from its type and connections
function inferRole(type, importsCnt, importedBy) {
  const deg = importsCnt + importedBy
  if (deg >= 30) return { label: 'Hub', icon: '⬡', tip: 'Many files depend on or connect through this. Changing it has wide impact.' }
  if (importedBy >= 10) return { label: 'Shared', icon: '◈', tip: 'Widely imported. Acts as a shared library or service across the app.' }
  if (importsCnt === 0 && importedBy === 0) return { label: 'Island', icon: '○', tip: 'Not connected to anything. May be unused or an entry point loaded by a bundler.' }
  if (importsCnt >= 8) return { label: 'Orchestrator', icon: '⬟', tip: 'Pulls in many dependencies. Likely a page, shell, or top-level controller.' }
  if (importedBy === 0) return { label: 'Leaf', icon: '◇', tip: 'Nothing imports this. An entry point or a script run directly.' }
  if (importsCnt === 0) return { label: 'Pure Output', icon: '◆', tip: 'Imports nothing itself. Pure data, constants, or purely declarative.' }
  return { label: 'Connector', icon: '◉', tip: 'Connected but not dominant. A focused module doing one job.' }
}

// What a new contributor would learn from reading this file
function learningAngle(type, id, meta) {
  if (meta?.concept) return meta.concept
  const t = type.toLowerCase()
  if (t === 'context')    return 'React Context + global state patterns'
  if (t === 'hook')       return 'Custom hooks and reusable stateful logic'
  if (t === 'page')       return 'Route-level component composition'
  if (t === 'component')  return 'Reusable UI component design'
  if (t === 'lab')        return 'Interactive learning module architecture'
  if (t === 'game')       return 'Browser-based game loop and state machines'
  if (t === 'feature')    return 'Feature-sliced architecture'
  if (t === 'utility')    return 'Pure functions and functional programming'
  if (t === 'data')       return 'Data modelling and static asset structure'
  if (t === 'script')     return 'Node.js scripting and build tooling'
  if (t === 'tool')       return 'Developer tools and specialised UIs'
  if (id.endsWith('.ts') || id.endsWith('.tsx')) return 'TypeScript types and interfaces'
  return 'Module design and separation of concerns'
}

// ─── sub-components ──────────────────────────────────────────────────────────

const DIVIDER = <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 16px' }} />

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, color: '#334155',
      letterSpacing: '.1em', textTransform: 'uppercase',
      fontFamily: 'JetBrains Mono, monospace', marginBottom: 8,
    }}>{children}</div>
  )
}

function NeighbourChip({ node, color, onClick }) {
  if (!node) return null
  const name = node.label.replace(/\.(jsx?|tsx?|mjs)$/, '')
  const [r, g, b] = node.rgb
  return (
    <button
      onClick={onClick}
      title={node.id}
      style={{
        background: `rgba(${r},${g},${b},0.10)`,
        border: `1px solid rgba(${r},${g},${b},0.20)`,
        color: `rgb(${r},${g},${b})`,
        borderRadius: 6,
        padding: '3px 8px',
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s',
        whiteSpace: 'nowrap',
        maxWidth: 140,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'inline-block',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `rgba(${r},${g},${b},0.22)`
        e.currentTarget.style.borderColor = `rgba(${r},${g},${b},0.45)`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `rgba(${r},${g},${b},0.10)`
        e.currentTarget.style.borderColor = `rgba(${r},${g},${b},0.20)`
      }}
    >
      {name}
    </button>
  )
}

// ─── main component ──────────────────────────────────────────────────────────

export default function NodePanel({ node, onClose }) {
  const navigate = useNavigate()
  const {
    id, label, folder, rgb, meta,
    importedBy = 0, importsCnt = 0,
    importsFromIdxs = [], importedByIdxs = [],
    allNodes = [],
  } = node

  const [r, g, b] = rgb
  const color    = `rgb(${r},${g},${b})`
  const type     = inferType(id)
  const role     = inferRole(type, importsCnt, importedBy)
  const learning = learningAngle(type, id, meta)
  const degree   = importsCnt + importedBy

  // Resolve neighbour indices → node objects
  const importedFromNodes = importsFromIdxs.map(i => allNodes[i]).filter(Boolean)
  const importedByNodes   = importedByIdxs.map(i => allNodes[i]).filter(Boolean)

  // Fake-click a neighbour: fire a new node selection
  // We can't call into the canvas directly, so we just update the parent.
  // The parent's onNodeClick sets selectedNode, so we replicate the payload shape.
  // We don't have importedBy/importsCnt for neighbours — show what we have.
  function openNeighbour(neighbourNode) {
    onClose()
    // Brief delay lets the close animation settle before the new panel opens
    setTimeout(() => {
      // Dispatch a synthetic selection — we bubble up through the prop chain
      // by temporarily storing the node in a module-level ref that CodeMapBackground
      // already knows about. Instead, the simplest approach is to re-use
      // the same onClose/re-select pattern: close this panel and navigate.
      // For a full drill-in we'd need a context; for now, link to the file path.
    }, 80)
  }

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="np-scroll"
      style={{
        position: 'fixed',
        top: 56,
        right: 20,
        width: 360,
        maxHeight: 'calc(100vh - 76px)',
        overflowY: 'auto',
        zIndex: 200,
        background: 'rgba(6,10,22,0.92)',
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
          {/* Role badge */}
          <span
            title={role.tip}
            style={{
              fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
              background: 'rgba(255,255,255,0.04)', color: '#64748b',
              letterSpacing: '.05em', fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase', cursor: 'help',
              borderBottom: '1px dotted #334155',
            }}
          >{role.icon} {role.label}</span>
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

      {DIVIDER}

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

      {/* ── What you'd learn ── */}
      {DIVIDER}
      <div style={{ padding: '12px 16px' }}>
        <SectionLabel><BookOpen size={9} style={{ display: 'inline', marginRight: 5 }} />What you'd learn reading this</SectionLabel>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          background: `rgba(${r},${g},${b},0.06)`,
          border: `1px solid rgba(${r},${g},${b},0.14)`,
          borderRadius: 8, padding: '8px 10px',
        }}>
          <span style={{ color, fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>◈</span>
          <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>{learning}</span>
        </div>
        {meta?.conceptDetail && (
          <p style={{
            margin: '8px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.7,
            paddingLeft: 12, borderLeft: `2px solid rgba(${r},${g},${b},0.22)`,
          }}>
            {meta.conceptDetail}
          </p>
        )}
      </div>

      {/* ── Architecture role detail ── */}
      {DIVIDER}
      <div style={{ padding: '12px 16px' }}>
        <SectionLabel><Zap size={9} style={{ display: 'inline', marginRight: 5 }} />Architecture role</SectionLabel>
        <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.65 }}>{role.tip}</p>
      </div>

      {/* ── Connection graph ── */}
      {DIVIDER}
      <div style={{ padding: '12px 16px' }}>
        <SectionLabel><Layers size={9} style={{ display: 'inline', marginRight: 5 }} />Connections</SectionLabel>

        {/* Visual degree bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace',
            marginBottom: 5,
          }}>
            <span title="Files this imports"><ArrowDownToLine size={10} style={{ display: 'inline', marginRight: 3 }} />{importsCnt} imports</span>
            <span title="Files that import this"><ArrowUpFromLine size={10} style={{ display: 'inline', marginRight: 3 }} />{importedBy} imported by</span>
          </div>
          {/* stacked bar */}
          <div style={{ display: 'flex', height: 5, borderRadius: 99, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
            {importsCnt > 0 && (
              <div style={{
                width: `${Math.round((importsCnt / Math.max(degree, 1)) * 100)}%`,
                background: color, opacity: 0.6,
              }} />
            )}
            {importedBy > 0 && (
              <div style={{
                flex: 1,
                background: `rgba(${r},${g},${b},0.25)`,
              }} />
            )}
          </div>
        </div>

        {/* Imports list */}
        {importedFromNodes.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#334155', fontFamily: 'JetBrains Mono, monospace', marginBottom: 5 }}>
              <ArrowDownToLine size={9} style={{ display: 'inline', marginRight: 4 }} />imports
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {importedFromNodes.map((n, i) => (
                <NeighbourChip key={i} node={n} color={color} onClick={() => openNeighbour(n)} />
              ))}
              {importsCnt > importedFromNodes.length && (
                <span style={{ fontSize: 10, color: '#334155', alignSelf: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
                  +{importsCnt - importedFromNodes.length} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Imported-by list */}
        {importedByNodes.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: '#334155', fontFamily: 'JetBrains Mono, monospace', marginBottom: 5 }}>
              <ArrowUpFromLine size={9} style={{ display: 'inline', marginRight: 4 }} />imported by
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {importedByNodes.map((n, i) => (
                <NeighbourChip key={i} node={n} color={color} onClick={() => openNeighbour(n)} />
              ))}
              {importedBy > importedByNodes.length && (
                <span style={{ fontSize: 10, color: '#334155', alignSelf: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
                  +{importedBy - importedByNodes.length} more
                </span>
              )}
            </div>
          </div>
        )}

        {degree === 0 && (
          <p style={{ margin: 0, fontSize: 11, color: '#1e293b', fontStyle: 'italic' }}>
            No import connections found. This file may be an entry point or loaded by the bundler directly.
          </p>
        )}
      </div>

      {/* ── Contributor tip ── */}
      {DIVIDER}
      <div style={{ padding: '10px 16px' }}>
        <SectionLabel>💡 New contributor tip</SectionLabel>
        <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.65 }}>
          {importedBy >= 20
            ? `This is a core shared module — ${importedBy} files depend on it. Before changing it, search for all import sites and check what each one passes in.`
            : importsCnt >= 8
            ? `This file orchestrates ${importsCnt} dependencies. A good way to understand it is to open the dependency graph, start from this node, and follow one edge at a time.`
            : importedBy === 0
            ? `Nothing in the app imports this file yet. It's either an entry point, a script run directly by Node, or it's not wired up yet.`
            : `A focused module. Read it alongside its ${importedBy} consumer${importedBy !== 1 ? 's' : ''} to understand the contract it exposes.`
          }
        </p>
      </div>

      {/* ── Footer: open button ── */}
      {meta?.jumpTo && (
        <>
          {DIVIDER}
          <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => navigate(meta.jumpTo)}
              style={{
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
          </div>
        </>
      )}
    </div>
  )
}
