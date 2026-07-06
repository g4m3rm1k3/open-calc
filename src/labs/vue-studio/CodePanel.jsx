import { useRef, useCallback, useState } from 'react'
import Editor from '@monaco-editor/react'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import { registerVueHoverProviders } from './hoverProviders.js'
import { registerVueLanguage, VUE_LANG } from './vueLanguage.js'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'

// Map file extensions to Monaco language IDs
function extToLang(filename) {
  if (filename.endsWith('.vue'))  return VUE_LANG  // custom tokenizer: no TS squigglies in template/style
  if (filename.endsWith('.ts'))   return 'typescript'
  if (filename.endsWith('.js'))   return 'javascript'
  if (filename.endsWith('.css'))  return 'css'
  if (filename.endsWith('.html')) return 'html'
  if (filename.endsWith('.json')) return 'json'
  return 'plaintext'
}

export default function CodePanel({ files, activeFile, onActiveFileChange, onFileChange, onNewFile, onRun, demos = [], onLoadDemo, isDark }) {
  const { themeStyles } = useGlobalTheme()
  const editorRef   = useRef(null)
  const monacoRef   = useRef(null)
  const hoverDisposables = useRef([])
  const [naming, setNaming] = useState(false)
  const [newName, setNewName] = useState('')
  const nameInputRef = useRef(null)

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current  = editor
    monacoRef.current  = monaco

    // Register Vue SFC language (tokenizer + brackets) — idempotent
    registerVueLanguage(monaco)

    // Register Vue concept hover providers (once per Monaco instance)
    hoverDisposables.current.forEach(d => d.dispose())
    hoverDisposables.current = registerVueHoverProviders(monaco)

    // Cmd/Ctrl+Enter → Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onRun)
  }, [onRun])

  const commitNewFile = useCallback(() => {
    const raw = newName.trim()
    const name = raw.includes('.') ? raw : raw + '.vue'
    const full = name.startsWith('src/') ? name : 'src/components/' + name
    if (raw) onNewFile(full)
    setNaming(false)
    setNewName('')
  }, [newName, onNewFile])

  const bg     = isDark ? '#0f172a' : '#ffffff'
  const border = isDark ? '#1e293b' : '#e2e8f0'
  const tab    = isDark ? '#1e293b' : '#f1f5f9'
  const tabAct = isDark ? '#0f172a' : '#ffffff'
  const text   = isDark ? '#e2e8f0' : '#1e293b'
  const muted  = isDark ? '#475569' : '#94a3b8'
  const accent = '#10b981'

  const fileNames = Object.keys(files)
  const content   = files[activeFile] ?? ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg }}>

      {/* File tabs */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${border}`, overflowX: 'auto', flexShrink: 0, background: tab }}>
        {fileNames.map(name => {
          const isActive = name === activeFile
          const label    = name.split('/').pop()
          return (
            <button
              key={name}
              onClick={() => onActiveFileChange(name)}
              title={name}
              style={{
                padding: '7px 14px',
                fontSize: 12,
                fontFamily: 'monospace',
                fontWeight: isActive ? 600 : 400,
                border: 'none',
                borderBottom: isActive ? `2px solid ${accent}` : '2px solid transparent',
                borderTop: isActive ? `1px solid ${border}` : '1px solid transparent',
                background: isActive ? tabAct : 'none',
                color: isActive ? text : muted,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s',
              }}
            >
              {label}
            </button>
          )
        })}

        {/* New file input / button */}
        {naming ? (
          <input
            ref={nameInputRef}
            autoFocus
            value={newName}
            placeholder="Counter.vue"
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') commitNewFile()
              if (e.key === 'Escape') { setNaming(false); setNewName('') }
            }}
            onBlur={commitNewFile}
            style={{
              width: 140, padding: '4px 8px', fontSize: 12, fontFamily: 'monospace',
              background: isDark ? '#1e293b' : '#fff', color: text,
              border: `1px solid ${accent}`, borderRadius: 4, outline: 'none', marginLeft: 4,
            }}
          />
        ) : (
          <button
            onClick={() => setNaming(true)}
            title="New file"
            style={{
              padding: '5px 10px', fontSize: 14, border: 'none', background: 'none',
              color: muted, cursor: 'pointer', flexShrink: 0, marginLeft: 2,
            }}
          >
            +
          </button>
        )}
      </div>

      {/* Monaco editor */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Editor
          key={activeFile}                  // remount when file changes so Monaco loads new content cleanly
          language={extToLang(activeFile)}
          value={content}
          theme={themeStyles.monaco}
          beforeMount={setupOpenCalcMonaco}
          onMount={handleMount}
          onChange={(value) => onFileChange(activeFile, value ?? '')}
          options={{
            fontSize: 13,
            lineHeight: 21,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 4,
            renderLineHighlight: 'gutter',
          }}
        />
      </div>

      {/* Bottom bar: file path / demos / Run */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderTop: `1px solid ${border}`, flexShrink: 0, background: isDark ? '#0c1426' : '#f8fafc', gap: 8 }}>
        <span style={{ fontSize: 11, color: muted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeFile}
        </span>

        {/* Load Example dropdown */}
        {demos.length > 0 && (
          <select
            onChange={e => {
              const demo = demos.find(d => d.id === e.target.value)
              if (demo) onLoadDemo(demo)
              e.target.value = ''
            }}
            defaultValue=""
            style={{
              fontSize: 11, padding: '3px 6px', borderRadius: 4,
              border: `1px solid ${border}`, background: isDark ? '#1e293b' : '#fff',
              color: muted, cursor: 'pointer', flexShrink: 0,
            }}
          >
            <option value="" disabled>📦 Load example…</option>
            {demos.map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: muted }}>⌘↵</span>
          <button
            onClick={onRun}
            style={{
              padding: '5px 16px',
              borderRadius: 6,
              border: 'none',
              background: accent,
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.03em',
            }}
          >
            ▶ Run
          </button>
        </div>
      </div>
    </div>
  )
}
