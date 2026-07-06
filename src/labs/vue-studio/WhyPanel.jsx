import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// The WHY panel — shown for the currently active file.
// Answers: "Why does this file exist?" before the student opens the code.
export default function WhyPanel({ milestone, activeFile, isDark }) {
  const bg      = isDark ? '#0c1426' : '#f0fdf4'
  const border  = isDark ? '#1e293b' : '#bbf7d0'
  const text    = isDark ? '#e2e8f0' : '#1e293b'
  const muted   = isDark ? '#64748b' : '#6b7280'
  const accent  = '#10b981'
  const codeBg  = isDark ? '#1e293b' : '#ecfdf5'

  const whyContent = milestone.why?.[activeFile]
  const filename = activeFile.split('/').pop() ?? activeFile

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg }}>

      {/* Header */}
      <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent, marginBottom: 2 }}>Why this file</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: text, fontFamily: 'monospace' }}>{filename}</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {whyContent ? (
          <div style={{ fontSize: 12, lineHeight: 1.7, color: text }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 style={{ fontSize: 12, fontWeight: 700, color: accent, marginTop: 0, marginBottom: 6 }}>{children}</h2>
                ),
                p: ({ children }) => (
                  <p style={{ margin: '0 0 8px', color: text }}>{children}</p>
                ),
                code: ({ inline, children }) => inline
                  ? <code style={{ background: codeBg, padding: '1px 5px', borderRadius: 3, fontSize: 11, fontFamily: 'monospace', color: isDark ? '#34d399' : '#059669' }}>{children}</code>
                  : <code>{children}</code>,
                pre: ({ children }) => (
                  <pre style={{ background: isDark ? '#0f172a' : '#d1fae5', border: `1px solid ${border}`, borderRadius: 6, padding: '8px 10px', overflowX: 'auto', fontSize: 11, fontFamily: 'monospace', margin: '6px 0', lineHeight: 1.5 }}>{children}</pre>
                ),
                strong: ({ children }) => <strong style={{ color: isDark ? '#a7f3d0' : '#065f46', fontWeight: 700 }}>{children}</strong>,
                ul: ({ children }) => <ul style={{ paddingLeft: 16, margin: '4px 0 8px' }}>{children}</ul>,
                li: ({ children }) => <li style={{ marginBottom: 2, color: text }}>{children}</li>,
                hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${border}`, margin: '10px 0' }} />,
              }}
            >
              {whyContent}
            </ReactMarkdown>
          </div>
        ) : (
          <div style={{ color: muted, fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: 40 }}>
            Select a file to see why it exists.
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div style={{ padding: '8px 14px', borderTop: `1px solid ${border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: muted, lineHeight: 1.4 }}>
          Hover over <code style={{ fontFamily: 'monospace', fontSize: 10, color: accent }}>ref</code>, <code style={{ fontFamily: 'monospace', fontSize: 10, color: accent }}>computed</code>, and other Vue APIs in the editor for concept explanations.
        </div>
      </div>
    </div>
  )
}
