import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import Editor from '@monaco-editor/react'
import { Trash2 } from 'lucide-react'
import MarkdownToolbar from '../markdown-toolbar/MarkdownToolbar.jsx'
import { preprocess } from '../math/latexPreprocess.js'
import { useThemeColors } from '../../hooks/useThemeColors.js'
import { readUserNotes, getNote, saveNote, removeNote } from './notesStore.js'

const COLORS = [
  { id: 'yellow', dot: '#fbbf24', bg: '#fef9c3', bgDark: '#2d2500' },
  { id: 'blue',   dot: '#60a5fa', bg: '#dbeafe', bgDark: '#0c1f3a' },
  { id: 'green',  dot: '#4ade80', bg: '#dcfce7', bgDark: '#052e16' },
  { id: 'pink',   dot: '#f472b6', bg: '#fce7f3', bgDark: '#3b0718' },
  { id: 'orange', dot: '#fb923c', bg: '#ffedd5', bgDark: '#2c1500' },
]

const FONT_SIZES = [12, 18, 24]
const FONT_LABELS = ['1×', '1.5×', '2×']

// One note's editor, meant to run as a FloatingWindow's content — dragging,
// resizing, and staying open on outside click are all the window manager's
// job (see DesktopProvider.jsx/FloatingWindow.jsx), not this component's.
export default function NoteEditorWindow({ noteId, onClose }) {
  const C = useThemeColors()
  const editorRef = useRef(null)
  const loadedRef = useRef(false)

  const stored = getNote(noteId)
  const [title, setTitle] = useState(stored?.title ?? '')
  const [text, setText] = useState(stored?.text ?? '')
  const [color, setColor] = useState(stored?.color ?? 'yellow')
  const [fontIdx, setFontIdx] = useState(stored?.fontIdx ?? 0)
  const [preview, setPreview] = useState(!!stored?.text?.trim())

  useEffect(() => {
    if (!loadedRef.current) { loadedRef.current = true; return }
    if (text.trim()) {
      saveNote(noteId, { text, title, color, fontIdx, manual: readUserNotes()[noteId]?.manual ?? true })
    } else {
      removeNote(noteId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, title, color, fontIdx])

  const insertBtn = (btn) => {
    const ed = editorRef.current
    if (!ed) return
    if (btn.plain != null) ed.trigger('keyboard', 'type', { text: btn.plain })
    else if (btn.snippet) ed.trigger('keyboard', 'editor.action.insertSnippet', { snippet: btn.snippet })
    ed.focus()
  }

  function deleteAndClose() {
    removeNote(noteId)
    onClose?.()
  }

  const activeColor = COLORS.find(c => c.id === color) ?? COLORS[0]
  const cardBg = C.isDark ? activeColor.bgDark : activeColor.bg

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: cardBg }}>
      {/* Title */}
      <div style={{ flexShrink: 0, padding: '8px 10px 0' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note"
          style={{
            width: '100%', border: 'none', background: 'none', outline: 'none',
            fontSize: 14, fontWeight: 700, color: C.text, padding: '2px 0',
          }}
        />
      </div>
      {/* Toolbar */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              style={{
                width: 13, height: 13, borderRadius: '50%', background: c.dot,
                border: color === c.id ? `2px solid ${C.text}` : '1.5px solid transparent',
                cursor: 'pointer', padding: 0,
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => setFontIdx(i => (i + 1) % FONT_SIZES.length)}
            title={`Font size: ${FONT_LABELS[fontIdx]} — click to cycle`}
            style={{ fontSize: 10, background: 'none', cursor: 'pointer', padding: '1px 4px', border: fontIdx > 0 ? `1px solid ${activeColor.dot}88` : '1px solid transparent', borderRadius: 3, color: fontIdx > 0 ? activeColor.dot : C.muted, fontWeight: 600 }}
          >
            A{fontIdx === 0 ? '' : fontIdx === 1 ? '⁺' : '⁺⁺'}
          </button>
          <button onClick={() => setPreview(p => !p)} style={{ fontSize: 10, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px' }}>
            {preview ? 'edit' : 'preview'}
          </button>
          <button onClick={deleteAndClose} title="Delete note" style={{ padding: 4, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {preview ? (
        <div style={{ flex: 1, padding: 14, overflow: 'auto' }}>
          <div style={{ fontSize: FONT_SIZES[fontIdx], lineHeight: 1.7, color: C.text, wordBreak: 'break-word' }}>
            {text.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                  h1: ({ children }) => <h1 style={{ fontSize: '1.3em', fontWeight: 700, margin: '0.4em 0' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: '1.15em', fontWeight: 700, margin: '0.4em 0' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: '1.05em', fontWeight: 700, margin: '0.3em 0' }}>{children}</h3>,
                  p: ({ children }) => <p style={{ margin: '0.3em 0' }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ paddingLeft: '1.4em', margin: '0.3em 0' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ paddingLeft: '1.4em', margin: '0.3em 0' }}>{children}</ol>,
                  li: ({ children }) => <li style={{ margin: '0.1em 0' }}>{children}</li>,
                  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                  em: ({ children }) => <em>{children}</em>,
                  code: ({ inline, children }) => inline
                    ? <code style={{ background: 'rgba(100,116,139,0.15)', borderRadius: 3, padding: '1px 4px', fontFamily: 'monospace' }}>{children}</code>
                    : <pre style={{ background: 'rgba(100,116,139,0.12)', borderRadius: 6, padding: 8, overflowX: 'auto', margin: '0.4em 0' }}><code style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{children}</code></pre>,
                  hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(100,116,139,0.2)', margin: '0.5em 0' }} />,
                  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid rgba(100,116,139,0.4)', paddingLeft: '0.75em', margin: '0.3em 0', color: C.muted, fontStyle: 'italic' }}>{children}</blockquote>,
                  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: C.blue, textDecoration: 'underline' }}>{children}</a>,
                }}
              >
                {preprocess(text)}
              </ReactMarkdown>
            ) : (
              <span style={{ color: C.muted, fontStyle: 'italic' }}>Nothing here yet</span>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <MarkdownToolbar onInsert={insertBtn} />
          <div style={{ flex: 1, minHeight: 0 }}>
            <Editor
              defaultValue={text}
              language="markdown"
              theme={C.isDark ? 'vs-dark' : 'vs'}
              onChange={(v) => setText(v ?? '')}
              onMount={(editor) => { editorRef.current = editor }}
              options={{
                fontSize: FONT_SIZES[fontIdx],
                lineHeight: Math.round(FONT_SIZES[fontIdx] * 1.7),
                minimap: { enabled: false },
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 10, bottom: 10 },
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
