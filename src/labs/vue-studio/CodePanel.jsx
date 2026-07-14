import { useRef, useCallback, useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import { registerVueHoverProviders } from './hoverProviders.js'
import { registerVueLanguage, VUE_LANG } from './vueLanguage.js'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { useThemeColors } from '../../hooks/useThemeColors.js'

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
  onDeleteFile, onNewFile, onRun, onResetFiles, onLoadSolution,
  demos = [], onLoadDemo, activeDemo, onClearDemo,
  reactiveHistory,
}) {
  const { themeStyles } = useGlobalTheme()
  const C = useThemeColors()
  const editorRef        = useRef(null)
  const monacoRef        = useRef(null)
  const hoverDisposables = useRef([])
  const decorationsRef   = useRef(null) // IStandaloneCodeEditor decoration collection
  const [naming, setNaming] = useState(false)
  const [newName, setNewName] = useState('')
  const nameInputRef = useRef(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [hoveredTab, setHoveredTab] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmSolution, setConfirmSolution] = useState(false)

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current  = editor
    monacoRef.current  = monaco
    registerVueLanguage(monaco)
    hoverDisposables.current.forEach(d => d.dispose())
    hoverDisposables.current = registerVueHoverProviders(monaco)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onRun)
    // Inject CSS for live value annotations
    if (!document.getElementById('vue-studio-decorations-css')) {
      const style = document.createElement('style')
      style.id = 'vue-studio-decorations-css'
      style.textContent = `.vue-ref-annotation { color: #64748b; font-style: italic; } .vue-ref-annotation-changed { color: #f59e0b; font-style: italic; font-weight: 600; }`
      document.head.appendChild(style)
    }
  }, [onRun])

  // Live value annotations — update Monaco decorations when reactive history changes
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco || !reactiveHistory?.size) {
      decorationsRef.current?.clear()
      return
    }
    const source = files?.[activeFile] ?? ''
    const lines  = source.split('\n')
    const newDecos = []

    lines.forEach((line, idx) => {
      const lineNum = idx + 1
      // Match `const name = ref(...)` and `const name = computed(...)`
      for (const [, name] of line.matchAll(/const\s+(\w+)\s*=\s*(?:ref|computed)\s*\(/g)) {
        const entry = reactiveHistory.get(name)
        if (!entry) continue
        const dv = typeof entry.value === 'object' ? JSON.stringify(entry.value) : String(entry.value)
        const changed = entry.updateCount > 0 && String(entry.value) !== String(entry.prevValue)
        const label = ` // ← ${dv}${entry.updateCount > 0 ? `  ↑${entry.updateCount}` : ''}`
        newDecos.push({
          range: new monaco.Range(lineNum, line.length + 1, lineNum, line.length + 1),
          options: {
            after: {
              content: label,
              inlineClassName: changed ? 'vue-ref-annotation-changed' : 'vue-ref-annotation',
            },
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        })
      }
    })

    if (!decorationsRef.current) {
      decorationsRef.current = editor.createDecorationsCollection(newDecos)
    } else {
      decorationsRef.current.set(newDecos)
    }
  }, [reactiveHistory, activeFile, files])

  useEffect(() => {
    if (!pickerOpen) return
    const close = () => setPickerOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [pickerOpen])

  // Cancel confirm states if user clicks elsewhere / waits
  useEffect(() => {
    if (!confirmReset) return
    const cancel = () => setConfirmReset(false)
    const t = setTimeout(cancel, 4000)
    return () => clearTimeout(t)
  }, [confirmReset])

  useEffect(() => {
    if (!confirmSolution) return
    const cancel = () => setConfirmSolution(false)
    const t = setTimeout(cancel, 4000)
    return () => clearTimeout(t)
  }, [confirmSolution])

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

  const handleSolution = useCallback(() => {
    if (!confirmSolution) { setConfirmSolution(true); return }
    setConfirmSolution(false)
    onLoadSolution?.()
  }, [confirmSolution, onLoadSolution])

  const bg     = C.surface
  const border = C.border
  const tab    = C.surface2
  const tabAct = C.surface
  const text   = C.text
  const muted  = C.muted
  const accent = C.blue
  const danger = C.red

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
                  onMouseEnter={e => { e.currentTarget.style.color = danger; e.currentTarget.style.background = C.redBg }}
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
                background: C.surface, color: text,
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
                background: C.greenBg,
                border: `1px solid ${C.greenBd}`,
                fontSize: 11, color: C.green,
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
                onClick={(e) => { e.stopPropagation() }}
                title="Load example"
                style={{ padding: '3px 8px', fontSize: 11, border: `1px solid ${border}`, borderRadius: 4, background: 'none', color: muted, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                📦 Examples
              </button>
            )}

            {pickerOpen && !activeDemo && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                background: C.surface,
                border: `1px solid ${border}`, borderRadius: 6,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                zIndex: 9999, minWidth: 200, overflow: 'hidden',
              }}>
                {demos.map(d => (
                  <button
                    key={d.id}
                    onMouseDown={() => { onLoadDemo(d); setPickerOpen(false) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'none', color: text, fontSize: 12, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.surface2}
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderTop: `1px solid ${border}`, flexShrink: 0, background: C.surface2, gap: 8 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 11, color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeFile}
          </span>
          {/* Reset button — click once to arm, again to confirm */}
          <button
            onClick={handleReset}
            title="Clear your code and start from scratch"
            style={{
              padding: '2px 8px', fontSize: 10, borderRadius: 4, cursor: 'pointer', flexShrink: 0,
              border: `1px solid ${confirmReset ? danger : border}`,
              background: confirmReset ? C.redBg : 'none',
              color: confirmReset ? danger : muted,
              transition: 'all 0.15s',
            }}
          >
            {confirmReset ? 'Confirm reset?' : '↺ Reset'}
          </button>
          {/* Solution button — peek at the reference implementation */}
          {onLoadSolution && (
            <button
              onClick={handleSolution}
              title="Load the reference solution for this lesson"
              style={{
                padding: '2px 8px', fontSize: 10, borderRadius: 4, cursor: 'pointer', flexShrink: 0,
                border: `1px solid ${confirmSolution ? C.amber : border}`,
                background: confirmSolution ? C.amberBg : 'none',
                color: confirmSolution ? C.amber : muted,
                transition: 'all 0.15s',
              }}
            >
              {confirmSolution ? 'Show solution?' : '◎ Solution'}
            </button>
          )}
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
