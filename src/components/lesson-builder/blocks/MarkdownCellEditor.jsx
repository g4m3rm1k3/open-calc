import { useRef, useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import Toolbar from '../../markdown-toolbar/MarkdownToolbar.jsx'
import { CodeBlockPre, CodeBlockCode } from '../../math/CodeBlock.jsx'
import { preprocess } from '../../math/latexPreprocess.js'
import { useGlobalTheme } from '../../../context/ThemeContext.jsx'

// ── Main component ────────────────────────────────────────────────────────────

export default function MarkdownCellEditor({ value, onChange, onClose, title = '📝 Markdown Editor' }) {
  const { isDarkGlobal } = useGlobalTheme()
  const monacoTheme = isDarkGlobal ? 'vs-dark' : 'vs'
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
    <div className="fixed inset-0 z-[600] flex flex-col bg-white dark:bg-slate-950">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="text-sm px-2 py-1 rounded transition-colors hover:opacity-70 text-slate-500 dark:text-slate-400"
        >
          ← Close
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Live preview · KaTeX · GFM tables · Click toolbar buttons to insert at cursor
        </span>
        <div className="ml-auto">
          <button
            onClick={handleSave}
            className="px-5 py-1.5 text-sm font-bold rounded-lg bg-[#238636] text-white"
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
        <div className="flex flex-col min-h-0 border-r border-slate-200 dark:border-slate-700" style={{ width: '52%' }}>
          <div className="px-3 py-1 text-xs shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            Markdown source
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              defaultValue={value ?? ''}
              language="markdown"
              theme={monacoTheme}
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
        <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="px-3 py-1 text-xs shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            Rendered preview
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={{
                h1: ({children}) => <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">{children}</h1>,
                h2: ({children}) => <h2 className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-slate-100">{children}</h2>,
                h3: ({children}) => <h3 className="text-lg font-bold mt-5 mb-2 text-slate-800 dark:text-slate-200">{children}</h3>,
                h4: ({children}) => <h4 className="text-base font-semibold mt-4 mb-2 text-slate-700 dark:text-slate-300">{children}</h4>,
                p: ({children}) => <p className="mb-4 leading-7 text-slate-600 dark:text-slate-300">{children}</p>,
                strong: ({children}) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
                em: ({children}) => <em className="text-slate-600 dark:text-slate-300">{children}</em>,
                pre: CodeBlockPre,
                code: ({ className, children }) => (
                  <CodeBlockCode
                    className={className}
                    inlineClassName="px-1.5 py-0.5 rounded text-sm font-mono bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-orange-400 border border-slate-200 dark:border-slate-700"
                  >
                    {children}
                  </CodeBlockCode>
                ),
                blockquote: ({children}) => <blockquote className="pl-4 my-4 italic border-l-4 border-indigo-400 text-slate-500 dark:text-slate-400">{children}</blockquote>,
                ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1 text-slate-600 dark:text-slate-300">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-slate-600 dark:text-slate-300">{children}</ol>,
                li: ({children}) => <li className="leading-6">{children}</li>,
                table: ({children}) => <div className="overflow-x-auto mb-4"><table className="w-full text-sm border-collapse">{children}</table></div>,
                thead: ({children}) => <thead className="bg-slate-50 dark:bg-slate-900">{children}</thead>,
                th: ({children}) => <th className="px-3 py-2 text-left font-semibold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">{children}</th>,
                td: ({children}) => <td className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">{children}</td>,
                hr: () => <hr className="my-6 border-slate-200 dark:border-slate-700" />,
                a: ({href, children}) => <a href={href} className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2">{children}</a>,
              }}
            >
              {preview ? preprocess(preview) : '*Start typing to see preview…*'}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
