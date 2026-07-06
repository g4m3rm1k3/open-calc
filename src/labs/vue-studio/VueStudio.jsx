import { useState, useCallback, useEffect, useRef } from 'react'
import { MILESTONES } from './milestones/index.js'
import LessonPanel from './LessonPanel.jsx'
import CodePanel from './CodePanel.jsx'
import RuntimePanel from './RuntimePanel.jsx'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { SPACE_INVADERS } from './demos/space-invaders.js'

const DEMOS = [SPACE_INVADERS]

const LS_KEY = 'vue-studio-v1'

function loadSavedFiles(milestoneId, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(`${LS_KEY}:${milestoneId}`) ?? 'null')
    return saved ?? fallback
  } catch { return fallback }
}

function saveFiles(milestoneId, files) {
  try { localStorage.setItem(`${LS_KEY}:${milestoneId}`, JSON.stringify(files)) } catch {}
}

function loadCompletedIds() {
  try { return new Set(JSON.parse(localStorage.getItem(`${LS_KEY}:completed`) ?? '[]')) } catch { return new Set() }
}

function markCompleted(milestoneId) {
  try {
    const ids = new Set(JSON.parse(localStorage.getItem(`${LS_KEY}:completed`) ?? '[]'))
    ids.add(milestoneId)
    localStorage.setItem(`${LS_KEY}:completed`, JSON.stringify([...ids]))
  } catch {}
}

export default function VueStudio({ onBack }) {
  const { isDarkGlobal: isDark } = useGlobalTheme()

  const [milestoneIdx, setMilestoneIdx] = useState(0)
  const milestone = MILESTONES[milestoneIdx]

  // Virtual file system: { 'src/App.vue': content, ... }
  const [files, setFiles] = useState(() => loadSavedFiles(milestone.id, milestone.files))
  const [activeFile, setActiveFile] = useState(() => Object.keys(milestone.files)[0] ?? '')

  // Runtime panel state
  const [logs, setLogs] = useState([])
  const [componentTree, setComponentTree] = useState(null)
  const iframeRef = useRef(null)

  // Concept checklist: which concepts the student has ticked
  const [checkedConcepts, setCheckedConcepts] = useState({})
  const [completedIds] = useState(loadCompletedIds)

  // Divider widths (px)
  const [lessonW, setLessonW] = useState(240)
  const [runtimeW, setRuntimeW] = useState(380)
  // When a demo is active, don't save its files over the milestone's saved state
  const [demoActive, setDemoActive] = useState(false)

  // When milestone changes: load saved files or milestone defaults, reset logs
  const goToMilestone = useCallback((idx) => {
    const m = MILESTONES[idx]
    if (!m) return
    setDemoActive(false)          // leave demo mode before loading milestone files
    setMilestoneIdx(idx)
    const saved = loadSavedFiles(m.id, m.files)
    setFiles(saved)
    setActiveFile(Object.keys(m.files)[0] ?? '')
    setLogs([])
    setComponentTree(null)
    setCheckedConcepts({})
  }, [])

  // Save files whenever they change — but NOT when a demo is loaded
  useEffect(() => {
    if (!demoActive) saveFiles(milestone.id, files)
  }, [files, milestone.id, demoActive])

  // Handle messages from the iframe runtime
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

  // Trigger a Run — postMessage to iframe
  const handleRun = useCallback(() => {
    setLogs([])
    setComponentTree(null)
    iframeRef.current?.contentWindow?.postMessage({ type: 'run', files }, '*')
  }, [files])

  const updateFile = useCallback((filename, content) => {
    setFiles(prev => ({ ...prev, [filename]: content }))
  }, [])

  // Resizable divider handlers
  // dir: 1 = drag right expands, -1 = drag right shrinks (RTL panel)
  const startResize = useCallback((setter, getStart, min = 160, max = 600, dir = 1) => (e) => {
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

  const loadDemo = useCallback((demo) => {
    setDemoActive(true)           // prevent demo files from being saved to milestone localStorage
    setFiles(demo.files)
    setActiveFile(Object.keys(demo.files)[0] ?? '')
    setLogs([])
    setComponentTree(null)
  }, [])

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

      {/* ── Four-panel body ──────────────────────────────────────────────── */}

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
            onNewFile={addFile}
            onRun={handleRun}
            demos={DEMOS}
            onLoadDemo={loadDemo}
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
