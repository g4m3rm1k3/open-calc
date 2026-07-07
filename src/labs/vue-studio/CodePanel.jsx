import { useRef, useCallback, useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import { registerVueHoverProviders } from './hoverProviders.js'
import { registerVueLanguage, VUE_LANG } from './vueLanguage.js'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'

function extToLang(filename) {
  if (filename.endsWith('.vue'))  return VUE_LANG
  if (filename.endsWith('.ts'))   return 'typescript'
  if (filename.endsWith('.js'))   return 'javascript'
  if (filename.endsWith('.css'))  return 'css'
  if (filename.endsWith('.html')) return 'html'
  if (filename.endsWith('.json')) return 'json'
  return 'plaintext'
}

export default function CodePanel({
  files, activeFile, onActiveFileChange, onFileChange,
  onDeleteFile, onNewFile, onRun, onResetFiles,
  demos = [], onLoadDemo, activeDemo, onClearDemo, isDark,
}) {
  const { themeStyles } = useGlobalTheme()
  const editorRef   = useRef(null)
  const monacoRef   = useRef(null)
  const hoverDisposables = useRef([])
  const [naming, setNaming] = useState(false)
  const [newName, setNewName] = useState('')
  const nameInputRef = useRef(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [hoveredTab, setHoveredTab] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current  = editor
    monacoRef.current  = monaco
    registerVueLanguage(monaco)
    hoverDisposables.current.forEach(d => d.dispose())
    hoverDisposables.current = registerVueHoverProviders(monaco)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onRun)
  }, [onRun])

  useEffect(() => {
    if (!pickerOpen) return
    const close = () => setPickerOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [pickerOpen])

  // Cancel reset confirm if user clicks elsewhere
  useEffect(() => {
    if (!confirmReset) return
    const cancel = () => setConfirmReset(false)
    const t = setTimeout(cancel, 4000)
    return () => clearTimeout(t)
  }, [confirmReset])

  const commitNewFile = useCallback(() => {
    const raw = newName.trim()
    const name = raw.includes('.') ? raw : raw + '.vue'
    const full = name.startsWith('src/') ? name : 'src/components/' + name
    if (raw) onNewFile(full)
    setNaming(false)
    setNewName('')
  }, [newName, onNewFile])

  const handleDeleteTab = useCallback((e, filename) => {
    e.stopPropagation()
    onDeleteFile(filename)
  }, [onDeleteFile])

  const handleReset = useCallback(() => {
    if (!confirmReset) { setConfirmReset(true); return }
    setConfirmReset(false)
    onResetFiles()
  }, [confirmReset, onResetFiles])

  const bg     = isDark ? '#0f172a' : '#ffffff'
  const border = isDark ? '#1e293b' : '#e2e8f0'
  const tab    = isDark ? '#1e293b' : '#f1f5f9'
  const tabAct = isDark ? '#0f172a' : '#ffffff'
  const text   = isDark ? '#e2e8f0' : '#1e293b'
  const muted  = isDark ? '#475569' : '#94a3b8'
  const accent = '#10b981'
  const danger = '#ef4444'

  const fileNames  = Object.keys(files)
  const canDelete  = fileNames.length > 1
  const content    = files[activeFile] ?? ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg }}>

      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: `1px solid ${border}`, flexShrink: 0, background: tab }}>

        {/* Scrollable file tabs */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, overflowX: 'auto', overflowY: 'visible' }}>
          {fileNames.map(name => {
            const isActive  = name === activeFile
            const isHovered = hoveredTab === name
            const label     = name.split('/').pop()
            // Show ✕ when: this tab is active OR hovered (and there are 2+ files)
            const showClose = canDelete && (isActive || isHovered)

            return (
              <div
                key={name}
                onMouseEnter={() => setHoveredTab(name)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '0 4px 0 12px',
                  borderBottom: isActive ? `2px solid ${accent}` : '2px solid transparent',
                  borderTop: isActive ? `1px solid ${border}` : '1px solid transparent',
                  background: isActive ? tabAct : 'none',
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => onActiveFileChange(name)}
                  title={name}
                  style={{
                    padding: '5px 0',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: isActive ? 600 : 400,
                    border: 'none',
                    background: 'none',
                    color: isActive ? text : muted,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </button>
                {/* ✕ delete button — visible on active/hover, only when 2+ files exist */}
                <button
                  onClick={(e) => handleDeleteTab(e, name)}
                  title={`Delete ${label}`}
                  style={{
                    width: 16, height: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, lineHeight: 1,
                    border: 'none', background: 'none',
                    color: muted,
                    cursor: 'pointer',
                    borderRadius: 3,
                    opacity: showClose ? 1 : 0,
                    pointerEvents: showClose ? 'auto' : 'none',
                    transition: 'opacity 0.1s, color 0.1s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = danger; e.currentTarget.style.background = isDark ? '#2d1414' : '#fee2e2' }}
                  onMouseLeave={e => { e.currentTarget.style.color = muted;  e.currentTarget.style.background = 'none' }}
                >
                  ✕
                </button>
              </div>
            )
          })}

          {/* New file */}
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
              style={{ padding: '5px 10px', fontSize: 14, border: 'none', background: 'none', color: muted, cursor: 'pointer', flexShrink: 0, marginLeft: 2 }}
            >
              +
            </button>
          )}
        </div>

        {/* Examples button — outside overflow:auto so its dropdown isn't clipped */}
        {demos.length > 0 && (
          <div style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 8px', borderLeft: `1px solid ${border}` }}>
            {activeDemo ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '3px 8px', borderRadius: 4,
                background: isDark ? '#1e3a1e' : '#dcfce7',
                border: `1px solid ${isDark ? '#2d6a2d' : '#86efac'}`,
                fontSize: 11, color: isDark ? '#86efac' : '#166534',
                whiteSpace: 'nowrap',
              }}>
                <span>📦 {activeDemo.label}</span>
                <button
                  onClick={onClearDemo}
                  title="Close example"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 12, padding: '0 1px', lineHeight: 1, opacity: 0.8 }}
                >✕</button>
              </div>
            ) : (
              <button
                onMouseDown={(e) => { e.stopPropagation(); setPickerOpen(p => !p) }}
                title="Load example"
                style={{ padding: '3px 8px', fontSize: 11, border: `1px solid ${border}`, borderRadius: 4, background: 'none', color: muted, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                📦 Examples
              </button>
            )}

            {pickerOpen && !activeDemo && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                background: isDark ? '#1e293b' : '#fff',
                border: `1px solid ${border}`, borderRadius: 6,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                zIndex: 9999, minWidth: 200, overflow: 'hidden',
              }}>
                {demos.map(d => (
                  <button
                    key={d.id}
                    onMouseDown={() => { onLoadDemo(d); setPickerOpen(false) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'none', color: text, fontSize: 12, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? '#334155' : '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.label}</div>
                    <div style={{ fontSize: 10, color: muted }}>{d.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Monaco editor */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Editor
          key={activeFile}
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

      {/* Bottom bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderTop: `1px solid ${border}`, flexShrink: 0, background: isDark ? '#0c1426' : '#f8fafc', gap: 8 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 11, color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeFile}
          </span>
          {/* Reset button — click once to arm, again to confirm */}
          <button
            onClick={handleReset}
            title="Reset all files to lesson defaults"
            style={{
              padding: '2px 8px', fontSize: 10, borderRadius: 4, cursor: 'pointer', flexShrink: 0,
              border: `1px solid ${confirmReset ? danger : border}`,
              background: confirmReset ? (isDark ? '#2d1414' : '#fee2e2') : 'none',
              color: confirmReset ? danger : muted,
              transition: 'all 0.15s',
            }}
          >
            {confirmReset ? 'Confirm reset?' : '↺ Reset'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: muted }}>⌘↵</span>
          <button
            onClick={onRun}
            style={{ padding: '5px 16px', borderRadius: 6, border: 'none', background: accent, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.03em' }}
          >
            ▶ Run
          </button>
        </div>
      </div>
    </div>
  )
}
