import { useRef, useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import Toolbar from '../../markdown-toolbar/MarkdownToolbar.jsx'

// ── Main component ────────────────────────────────────────────────────────────

export default function MarkdownCellEditor({ value, onChange, onClose, title = '📝 Markdown Editor' }) {
  const editorRef = useRef(null)
  const [preview, setPreview] = useState(value ?? '')

  const insertBtn = useCallback((btn) => {
    const ed = editorRef.current
    if (!ed) return
    if (btn.plain != null) {
      ed.trigger('keyboard', 'type', { text: btn.plain })
    } else if (btn.snippet) {
      ed.trigger('keyboard', 'editor.action.insertSnippet', { snippet: btn.snippet })
    }
    ed.focus()
  }, [])

  const handleSave = () => {
    onChange(preview)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[600] flex flex-col" style={{ background: '#0d1117' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 shrink-0 border-b"
        style={{ background: '#161b22', borderColor: '#30363d' }}
      >
        <button
          onClick={onClose}
          className="text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: '#8b949e' }}
        >
          ← Close
        </button>
        <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>{title}</span>
        <span className="text-xs" style={{ color: '#8b949e' }}>
          Live preview · KaTeX · GFM tables · Click toolbar buttons to insert at cursor
        </span>
        <div className="ml-auto">
          <button
            onClick={handleSave}
            className="px-5 py-1.5 text-sm font-bold rounded-lg"
            style={{ background: '#238636', color: '#ffffff' }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Symbol / snippet toolbar */}
      <Toolbar onInsert={insertBtn} />

      {/* Split: editor | preview */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Monaco */}
        <div className="flex flex-col min-h-0" style={{ width: '52%', borderRight: '1px solid #30363d' }}>
          <div
            className="px-3 py-1 text-xs shrink-0"
            style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}
          >
            Markdown source
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              defaultValue={value ?? ''}
              language="markdown"
              theme="vs-dark"
              options={{
                fontSize: 14,
                lineHeight: 22,
                minimap: { enabled: false },
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
              onChange={v => setPreview(v ?? '')}
              onMount={editor => { editorRef.current = editor }}
            />
          </div>
        </div>

        {/* Right: live preview */}
        <div
          className="flex flex-col min-h-0 flex-1 overflow-hidden"
        >
          <div
            className="px-3 py-1 text-xs shrink-0"
            style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}
          >
            Rendered preview
          </div>
          <div
            className="flex-1 overflow-y-auto p-6"
            style={{ background: '#0d1117', color: '#e6edf3' }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({children}) => <h1 className="text-2xl font-bold mb-4 pb-2" style={{ borderBottom: '1px solid #30363d', color: '#e6edf3' }}>{children}</h1>,
                h2: ({children}) => <h2 className="text-xl font-bold mt-6 mb-3" style={{ color: '#e6edf3' }}>{children}</h2>,
                h3: ({children}) => <h3 className="text-lg font-bold mt-5 mb-2" style={{ color: '#c9d1d9' }}>{children}</h3>,
                h4: ({children}) => <h4 className="text-base font-semibold mt-4 mb-2" style={{ color: '#c9d1d9' }}>{children}</h4>,
                p: ({children}) => <p className="mb-4 leading-7" style={{ color: '#c9d1d9' }}>{children}</p>,
                strong: ({children}) => <strong style={{ color: '#e6edf3', fontWeight: 700 }}>{children}</strong>,
                em: ({children}) => <em style={{ color: '#c9d1d9' }}>{children}</em>,
                code: ({inline, children}) => inline
                  ? <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: '#21262d', color: '#f97316', border: '1px solid #30363d' }}>{children}</code>
                  : <pre className="p-4 rounded-lg overflow-x-auto mb-4" style={{ background: '#161b22', border: '1px solid #30363d' }}><code className="text-sm font-mono" style={{ color: '#e6edf3' }}>{children}</code></pre>,
                blockquote: ({children}) => <blockquote className="pl-4 my-4 italic" style={{ borderLeft: '4px solid #388bfd', color: '#8b949e' }}>{children}</blockquote>,
                ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: '#c9d1d9' }}>{children}</ul>,
                ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1" style={{ color: '#c9d1d9' }}>{children}</ol>,
                li: ({children}) => <li className="leading-6">{children}</li>,
                table: ({children}) => <div className="overflow-x-auto mb-4"><table className="w-full text-sm border-collapse">{children}</table></div>,
                thead: ({children}) => <thead style={{ background: '#161b22' }}>{children}</thead>,
                th: ({children}) => <th className="px-3 py-2 text-left font-semibold" style={{ border: '1px solid #30363d', color: '#e6edf3' }}>{children}</th>,
                td: ({children}) => <td className="px-3 py-2" style={{ border: '1px solid #30363d', color: '#c9d1d9' }}>{children}</td>,
                hr: () => <hr className="my-6" style={{ borderColor: '#30363d' }} />,
                a: ({href, children}) => <a href={href} style={{ color: '#388bfd' }} className="underline underline-offset-2">{children}</a>,
              }}
            >
              {preview || '*Start typing to see preview…*'}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
