import { useState, useCallback, useEffect, useRef } from 'react'
import { MILESTONES } from './milestones/index.js'
import LessonPanel from './LessonPanel.jsx'
import CodePanel from './CodePanel.jsx'
import RuntimePanel from './RuntimePanel.jsx'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { SPACE_INVADERS } from './demos/space-invaders.js'

const DEMOS = [SPACE_INVADERS]

// v2 intentionally busts any v1 cached state that got corrupted (demo files
// accidentally saved to lesson slots). Students start with clean defaults.
const LS_KEY = 'vue-studio-v2'

function loadSavedFiles(milestoneId, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(`${LS_KEY}:${milestoneId}`) ?? 'null')
    return saved ?? fallback
  } catch { return fallback }
}

function saveFiles(milestoneId, files) {
  try { localStorage.setItem(`${LS_KEY}:${milestoneId}`, JSON.stringify(files)) } catch {}
}

function getInitialMilestoneIdx() {
  try {
    const n = parseInt(localStorage.getItem(`${LS_KEY}:milestone-idx`) ?? '0', 10)
    return isNaN(n) ? 0 : Math.max(0, Math.min(MILESTONES.length - 1, n))
  } catch { return 0 }
}

export default function VueStudio({ onBack }) {
  const { isDarkGlobal: isDark } = useGlobalTheme()

  // Persisted across sessions — user resumes the lesson they were on
  const [milestoneIdx, setMilestoneIdx] = useState(getInitialMilestoneIdx)
  const milestone = MILESTONES[milestoneIdx]

  // Virtual file system: { 'src/App.vue': content, ... }
  const [files, setFiles] = useState(() => loadSavedFiles(milestone.id, milestone.files))
  const [activeFile, setActiveFile] = useState(() => Object.keys(milestone.files)[0] ?? '')

  // Runtime panel
  const [logs, setLogs] = useState([])
  const [componentTree, setComponentTree] = useState(null)
  const iframeRef = useRef(null)

  // Divider widths
  const [lessonW, setLessonW] = useState(240)
  const [runtimeW, setRuntimeW] = useState(560)

  // When a demo is active its files must not overwrite the lesson's saved state
  const [demoActive, setDemoActive] = useState(false)
  const [activeDemo, setActiveDemo] = useState(null)

  // If the active file was deleted, fall back to the first remaining file
  useEffect(() => {
    if (activeFile && !files[activeFile]) {
      const first = Object.keys(files)[0]
      if (first) setActiveFile(first)
    }
  }, [files, activeFile])

  // Persist file edits as the student types — skipped when a demo is running
  useEffect(() => {
    if (!demoActive) saveFiles(milestone.id, files)
  }, [files, milestone.id, demoActive])

  // Handle postMessage events from the iframe runtime
  useEffect(() => {
    const handler = ({ data }) => {
      if (!data?.type) return
      if (data.type === 'log') {
        setLogs(prev => [...prev, { level: data.level ?? 'log', args: data.args ?? [] }])
      } else if (data.type === 'error') {
        setLogs(prev => [...prev, { level: 'error', args: [data.message] }])
      } else if (data.type === 'tree') {
        setComponentTree(data.tree)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Navigate to a milestone: restore saved files or fall back to lesson defaults
  const goToMilestone = useCallback((idx) => {
    const m = MILESTONES[idx]
    if (!m) return
    try { localStorage.setItem(`${LS_KEY}:milestone-idx`, String(idx)) } catch {}
    setDemoActive(false)
    setActiveDemo(null)
    setMilestoneIdx(idx)
    const saved = loadSavedFiles(m.id, m.files)
    setFiles(saved)
    setActiveFile(Object.keys(m.files)[0] ?? '')
    setLogs([])
    setComponentTree(null)
  }, [])

  const handleRun = useCallback(() => {
    setLogs([])
    setComponentTree(null)
    iframeRef.current?.contentWindow?.postMessage({ type: 'run', files }, '*')
  }, [files])

  const updateFile = useCallback((filename, content) => {
    setFiles(prev => ({ ...prev, [filename]: content }))
  }, [])

  // Delete a file from the virtual filesystem (cannot delete the last file)
  const deleteFile = useCallback((filename) => {
    setFiles(prev => {
      if (Object.keys(prev).length <= 1) return prev
      const next = { ...prev }
      delete next[filename]
      return next
    })
  }, [])

  // Reset all files to the lesson's original defaults (escape hatch for broken state)
  const resetFiles = useCallback(() => {
    const defaultFiles = milestone.files
    setDemoActive(false)
    setActiveDemo(null)
    setFiles(defaultFiles)
    setActiveFile(Object.keys(defaultFiles)[0] ?? '')
    saveFiles(milestone.id, defaultFiles)
  }, [milestone])

  const startResize = useCallback((setter, getStart, min = 160, max = 700, dir = 1) => (e) => {
    const startX = e.clientX
    const startW = getStart()
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;cursor:col-resize;z-index:9999'
    document.body.appendChild(overlay)
    const onMove = (e) => setter(Math.max(min, Math.min(max, startW + dir * (e.clientX - startX))))
    const onUp = () => { document.body.removeChild(overlay); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  // Load a demo and auto-run it immediately — passes files directly so we don't
  // wait for React state to settle before posting to the iframe
  const loadDemo = useCallback((demo) => {
    setDemoActive(true)
    setActiveDemo(demo)
    setFiles(demo.files)
    setActiveFile(Object.keys(demo.files)[0] ?? '')
    setLogs([])
    setComponentTree(null)
    iframeRef.current?.contentWindow?.postMessage({ type: 'run', files: demo.files }, '*')
  }, [])

  const clearDemo = useCallback(() => {
    setActiveDemo(null)
    goToMilestone(milestoneIdx)
  }, [milestoneIdx, goToMilestone])

  const addFile = useCallback((filename) => {
    if (!filename || files[filename] !== undefined) return
    const ext = filename.split('.').pop()
    const starter = ext === 'vue'
      ? `<script setup lang="ts">\n</script>\n\n<template>\n  <div>\n  </div>\n</template>\n`
      : ext === 'ts' ? `// ${filename}\n` : `/* ${filename} */\n`
    setFiles(prev => ({ ...prev, [filename]: starter }))
    setActiveFile(filename)
  }, [files])

  const bg = isDark ? '#0f172a' : '#f8fafc'
  const border = isDark ? '#1e293b' : '#e2e8f0'
  const dividerColor = isDark ? '#334155' : '#cbd5e1'

  return (
    <div style={{ display: 'flex', height: '100vh', background: bg, color: isDark ? '#f1f5f9' : '#0f172a', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>

      {/* Lesson panel */}
      <div style={{ width: lessonW, flexShrink: 0, borderRight: `1px solid ${border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <LessonPanel
          milestoneIdx={milestoneIdx}
          onSelectMilestone={goToMilestone}
          onBack={onBack}
          isDark={isDark}
        />
      </div>

      <div onMouseDown={startResize(setLessonW, () => lessonW)} style={{ width: 4, cursor: 'col-resize', background: dividerColor, flexShrink: 0, opacity: 0.5 }} />

      {/* Code editor */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CodePanel
          files={files}
          activeFile={activeFile}
          onActiveFileChange={setActiveFile}
          onFileChange={updateFile}
          onDeleteFile={deleteFile}
          onNewFile={addFile}
          onRun={handleRun}
          onResetFiles={resetFiles}
          demos={DEMOS}
          onLoadDemo={loadDemo}
          activeDemo={activeDemo}
          onClearDemo={clearDemo}
          isDark={isDark}
        />
      </div>

      <div onMouseDown={startResize(setRuntimeW, () => runtimeW, 220, 700, -1)} style={{ width: 4, cursor: 'col-resize', background: dividerColor, flexShrink: 0, opacity: 0.5 }} />

      {/* Runtime panel */}
      <div style={{ width: runtimeW, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <RuntimePanel
          iframeRef={iframeRef}
          logs={logs}
          componentTree={componentTree}
          onClearLogs={() => setLogs([])}
          isDark={isDark}
        />
      </div>
    </div>
  )
}
