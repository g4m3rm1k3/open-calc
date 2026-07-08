import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { MILESTONES } from './milestones/index.js'
import LessonPanel from './LessonPanel.jsx'
import CodePanel from './CodePanel.jsx'
import RuntimePanel from './RuntimePanel.jsx'
import { SANDBOX_HTML as SANDBOX_HTML_SRC } from './sandbox.js'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { SPACE_INVADERS } from './demos/space-invaders.js'

const DEMOS = [SPACE_INVADERS]

// v3 busts any cached completed-solution state from before starter files were added.
const LS_KEY = 'vue-studio-v3'

function loadSavedFiles(milestoneId, starter) {
  try {
    const saved = JSON.parse(localStorage.getItem(`${LS_KEY}:${milestoneId}`) ?? 'null')
    return saved ?? starter
  } catch { return starter }
}

function saveFiles(milestoneId, files) {
  try { localStorage.setItem(`${LS_KEY}:${milestoneId}`, JSON.stringify(files)) } catch {}
}

function computeDepGraph(files) {
  const nodes = Object.keys(files).map(f => ({
    id: f,
    label: f.split('/').pop(),
    isEntry: /\/main\.[jt]s$/.test(f),
  }))
  const edges = []
  for (const [filename, content] of Object.entries(files)) {
    for (const [, imp] of content.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      if (!imp.startsWith('.')) continue
      const dir = filename.includes('/') ? filename.slice(0, filename.lastIndexOf('/') + 1) : ''
      const parts = (dir + imp).split('/')
      const resolved = []
      for (const p of parts) {
        if (p === '..') resolved.pop()
        else if (p !== '.') resolved.push(p)
      }
      let target = resolved.join('/')
      if (!target.match(/\.[a-z]+$/i)) target += '.vue'
      if (files[target]) edges.push({ from: filename, to: target })
    }
  }
  return { nodes, edges }
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
  const [files, setFiles] = useState(() => loadSavedFiles(milestone.id, milestone.starter ?? milestone.files))
  const [activeFile, setActiveFile] = useState(() => Object.keys(milestone.starter ?? milestone.files)[0] ?? '')

  // Runtime panel
  const [logs, setLogs] = useState([])
  const [componentTree, setComponentTree] = useState(null)
  const [reactiveHistory, setReactiveHistory] = useState(() => new Map())
  const [execState, setExecState] = useState(null)
  const iframeRef = useRef(null)

  // Dependency graph — recomputed when files change (debounced by useMemo)
  const depGraph = useMemo(() => computeDepGraph(files), [files])

  // Timeline — last 60 reactive-update snapshots (used by bottom panel)
  const [timeline, setTimeline] = useState([])

  // VDom diff: track previous tree snapshot to highlight changed components
  const prevTreeRef = useRef(null)
  const [treeChanges, setTreeChanges] = useState(new Set())

  // Last clicked element info (from sandbox) — used for code-specific step explanations
  const [lastClick, setLastClick] = useState(null)

  // Accumulate reactive history outside React state so timeline snapshots are pure
  const reactiveHistoryAccRef = useRef(new Map())

  // Panel dimensions
  const [lessonW,  setLessonW]  = useState(240)
  const [previewW, setPreviewW] = useState(420)
  const [bottomH,  setBottomH]  = useState(240)

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

  const filesRef = useRef(files)
  useEffect(() => { filesRef.current = files }, [files])

  // Clear old v2 localStorage keys on first load
  useEffect(() => {
    Object.keys(localStorage).filter(k => k.startsWith('vue-studio-v2:')).forEach(k => localStorage.removeItem(k))
  }, [])

  // Handle postMessage events from the iframe runtime
  useEffect(() => {
    let execTimer1 = null
    let execTimer2 = null
    const handler = ({ data }) => {
      if (!data?.type) return
      if (data.type === 'sandbox-ready') {
        iframeRef.current?.contentWindow?.postMessage({ type: 'run', files: filesRef.current }, '*')
      } else if (data.type === 'log') {
        setLogs(prev => [...prev, { level: data.level ?? 'log', args: data.args ?? [] }])
      } else if (data.type === 'error') {
        setLogs(prev => [...prev, { level: 'error', args: [data.message] }])
      } else if (data.type === 'tree') {
        setComponentTree(data.tree)
      } else if (data.type === 'reactive-update') {
        setComponentTree(data.tree)

        // VDom diff: collect paths of nodes whose data changed vs prev snapshot
        const changed = new Set()
        const diffTree = (prev, next, path = '') => {
          if (!next) return
          const prevData = prev?.data ?? {}
          const nextData = next.data ?? {}
          const anyChanged = Object.keys(nextData).some(
            k => JSON.stringify(prevData[k]) !== JSON.stringify(nextData[k])
          )
          if (anyChanged) changed.add(path || next.name)
          ;(next.children ?? []).forEach((child, i) =>
            diffTree(prev?.children?.[i], child, `${path}/${child.name}:${i}`)
          )
        }
        diffTree(prevTreeRef.current, data.tree)
        prevTreeRef.current = data.tree
        setTreeChanges(changed)

        // Build next reactive history map from the accumulated ref (not from prev state)
        // so timeline snapshots can be recorded outside a state updater (which must be pure)
        const nextHistory = new Map(reactiveHistoryAccRef.current)
        const flatten = (node) => {
          if (!node) return
          Object.entries(node.data ?? {}).forEach(([k, v]) => {
            const existing = nextHistory.get(k)
            nextHistory.set(k, { value: v, prevValue: existing?.value ?? v, updateCount: (existing?.updateCount ?? 0) + 1 })
          })
          node.children?.forEach(flatten)
        }
        flatten(data.tree)
        reactiveHistoryAccRef.current = nextHistory
        setReactiveHistory(new Map(nextHistory))
        setTimeline(t => [...t.slice(-59), { ts: Date.now(), reactiveHistory: new Map(nextHistory), tree: data.tree }])
        clearTimeout(execTimer1)
        clearTimeout(execTimer2)
        setExecState('updating')
        execTimer1 = setTimeout(() => setExecState('done'), 500)
        execTimer2 = setTimeout(() => setExecState(null), 1500)
      } else if (data.type === 'user-click') {
        setLastClick({ tag: data.tag, text: data.text, id: data.id })
        setExecState('click')
        // Snapshot prevValues so the diff after the next reactive-update is accurate
        const withPrev = new Map()
        reactiveHistoryAccRef.current.forEach((v, k) => withPrev.set(k, { ...v, prevValue: v.value }))
        reactiveHistoryAccRef.current = withPrev
        setReactiveHistory(new Map(withPrev))
      }
    }
    window.addEventListener('message', handler)
    return () => {
      window.removeEventListener('message', handler)
      clearTimeout(execTimer1)
      clearTimeout(execTimer2)
    }
  }, [])

  // Navigate to a milestone: restore saved files or fall back to lesson starter
  const goToMilestone = useCallback((idx) => {
    const m = MILESTONES[idx]
    if (!m) return
    try { localStorage.setItem(`${LS_KEY}:milestone-idx`, String(idx)) } catch {}
    setDemoActive(false)
    setActiveDemo(null)
    setMilestoneIdx(idx)
    const defaultFiles = m.starter ?? m.files
    const saved = loadSavedFiles(m.id, defaultFiles)
    setFiles(saved)
    setActiveFile(Object.keys(defaultFiles)[0] ?? '')
    setLogs([])
    setComponentTree(null)
    setReactiveHistory(new Map())
    setExecState(null)
    setTimeline([])
    setTreeChanges(new Set())
    prevTreeRef.current = null
    reactiveHistoryAccRef.current = new Map()
    iframeRef.current?.contentWindow?.postMessage({ type: 'run', files: saved }, '*')
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

  // Reset to the lesson's blank starter (clears the student's saved work)
  const resetFiles = useCallback(() => {
    const defaultFiles = milestone.starter ?? milestone.files
    setDemoActive(false)
    setActiveDemo(null)
    setFiles(defaultFiles)
    setActiveFile(Object.keys(defaultFiles)[0] ?? '')
    saveFiles(milestone.id, defaultFiles)
    setLogs([])
    setComponentTree(null)
    setReactiveHistory(new Map())
    setExecState(null)
    setTimeline([])
    setTreeChanges(new Set())
    prevTreeRef.current = null
    reactiveHistoryAccRef.current = new Map()
    iframeRef.current?.contentWindow?.postMessage({ type: 'run', files: defaultFiles }, '*')
  }, [milestone])

  // Load the reference solution for this lesson and run it immediately
  const loadSolution = useCallback(() => {
    const solutionFiles = milestone.files
    setDemoActive(false)
    setActiveDemo(null)
    setFiles(solutionFiles)
    setActiveFile(Object.keys(solutionFiles)[0] ?? '')
    setLogs([])
    setComponentTree(null)
    setReactiveHistory(new Map())
    setExecState(null)
    setTimeline([])
    setTreeChanges(new Set())
    prevTreeRef.current = null
    reactiveHistoryAccRef.current = new Map()
    iframeRef.current?.contentWindow?.postMessage({ type: 'run', files: solutionFiles }, '*')
  }, [milestone])

  const startResize = useCallback((setter, getStart, axis = 'x', min = 160, max = 800, dir = 1) => (e) => {
    const startPos = axis === 'x' ? e.clientX : e.clientY
    const startSize = getStart()
    const cursor = axis === 'x' ? 'col-resize' : 'row-resize'
    const overlay = document.createElement('div')
    overlay.style.cssText = `position:fixed;inset:0;cursor:${cursor};z-index:9999`
    document.body.appendChild(overlay)
    const onMove = (ev) => {
      const delta = (axis === 'x' ? ev.clientX : ev.clientY) - startPos
      setter(Math.max(min, Math.min(max, startSize + dir * delta)))
    }
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
        <LessonPanel milestoneIdx={milestoneIdx} onSelectMilestone={goToMilestone} onBack={onBack} isDark={isDark} />
      </div>
      <div onMouseDown={startResize(setLessonW, () => lessonW)} style={{ width: 4, cursor: 'col-resize', background: dividerColor, flexShrink: 0, opacity: 0.5 }} />

      {/* Middle column: editor (top) + visualization (bottom) */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Code editor */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <CodePanel
            files={files}
            activeFile={activeFile}
            onActiveFileChange={setActiveFile}
            onFileChange={updateFile}
            onDeleteFile={deleteFile}
            onNewFile={addFile}
            onRun={handleRun}
            onResetFiles={resetFiles}
            onLoadSolution={loadSolution}
            demos={DEMOS}
            onLoadDemo={loadDemo}
            activeDemo={activeDemo}
            onClearDemo={clearDemo}
            isDark={isDark}
            reactiveHistory={reactiveHistory}
          />
        </div>

        {/* Vertical resize handle */}
        <div
          onMouseDown={startResize(setBottomH, () => bottomH, 'y', 120, 480, -1)}
          style={{ height: 4, cursor: 'row-resize', background: dividerColor, flexShrink: 0, opacity: 0.5 }}
        />

        {/* Bottom visualization panel */}
        <div style={{ height: bottomH, flexShrink: 0, overflow: 'hidden', borderTop: `1px solid ${border}` }}>
          <RuntimePanel
            logs={logs}
            componentTree={componentTree}
            reactiveHistory={reactiveHistory}
            execState={execState}
            onClearLogs={() => setLogs([])}
            isDark={isDark}
            depGraph={depGraph}
            treeChanges={treeChanges}
            timeline={timeline}
            milestone={milestone}
            files={files}
            activeFile={activeFile}
            lastClick={lastClick}
          />
        </div>
      </div>

      <div onMouseDown={startResize(setPreviewW, () => previewW, 'x', 280, 700, -1)} style={{ width: 4, cursor: 'col-resize', background: dividerColor, flexShrink: 0, opacity: 0.5 }} />

      {/* Live preview — full height, no tabs */}
      <div style={{ width: previewW, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: `1px solid ${border}` }}>
        <div style={{ padding: '4px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: isDark ? '#475569' : '#94a3b8', borderBottom: `1px solid ${border}`, background: isDark ? '#0c1426' : '#f8fafc', flexShrink: 0 }}>
          Preview
        </div>
        <iframe
          ref={iframeRef}
          srcDoc={SANDBOX_HTML_SRC}
          sandbox="allow-scripts allow-same-origin"
          title="Vue Studio Preview"
          style={{ flex: 1, border: 'none', background: '#fff', minHeight: 0 }}
        />
      </div>
    </div>
  )
}
