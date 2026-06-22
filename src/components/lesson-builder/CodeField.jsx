import Editor from '@monaco-editor/react'

// Thin Monaco wrapper for the small embedded code fields scattered across
// the Lesson Builder's block editors (Python cells, JS/coding/challenge/
// walkthrough startCode, examples/quiz snippets) — these used to be plain
// <textarea mono> with no syntax highlighting at all. Same MOPTS pattern as
// VizCellEditor.jsx's full-screen editor, just sized for an inline field
// instead of a modal.
const MOPTS = { fontSize: 13, minimap: { enabled: false }, wordWrap: 'on', scrollBeyondLastLine: false, automaticLayout: true }

export default function CodeField({ value, onChange, language = 'javascript', height = 220, placeholder }) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative" style={{ height }}>
      {!value && placeholder && (
        <span className="absolute top-1.5 left-3 text-xs text-slate-400 pointer-events-none z-10 font-mono">{placeholder}</span>
      )}
      <Editor
        value={value ?? ''}
        onChange={v => onChange(v ?? '')}
        language={language}
        theme="vs-dark"
        height={height}
        options={MOPTS}
      />
    </div>
  )
}
