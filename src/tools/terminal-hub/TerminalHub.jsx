import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { X, Minus, Square, Plus, ChevronDown } from 'lucide-react'
import PythonRepl from './PythonRepl.jsx'
import JSRepl from './JSRepl.jsx'
import FullPageIDE from '../js-playground/FullPageIDE.jsx'
import CppLab from '../../courses/c-plus-plus/viz/CppLab.jsx'
import GitTerminal from '../../courses/git/viz/GitTerminal.jsx'
import MatlabRepl from './MatlabRepl.jsx'

const RUNTIMES = [
  { type: 'python',     label: 'Python',     color: '#4ec9b0', icon: '🐍' },
  { type: 'javascript', label: 'JavaScript', color: '#f7c948', icon: '⚡' },
  { type: 'html',       label: 'HTML / CSS', color: '#e8704a', icon: '🌐' },
  { type: 'cpp',        label: 'C++',        color: '#4f8ef7', icon: '⬡' },
  { type: 'git',        label: 'Git',        color: '#f05033', icon: '⑂' },
  { type: 'matlab',     label: 'MATLAB',     color: '#e8a020', icon: '📊' },
]

const DEFAULT_W = 1000
const DEFAULT_H = 600

let _nextId = 1
function makeTab(type) {
  const rt = RUNTIMES.find(r => r.type === type) ?? RUNTIMES[0]
  return { id: _nextId++, type, label: rt.label }
}

function TabPanel({ tab }) {
  switch (tab.type) {
    case 'python':
      return <PythonRepl key={tab.id} />
    case 'javascript':
      return <JSRepl key={tab.id} />
    case 'html':
      return (
        <FullPageIDE
          key={tab.id}
          contained
          cell={{ html: '<h1>Hello</h1>', css: 'body { font-family: sans-serif; padding: 20px; }', js: '' }}
          onChange={() => {}}
          onClose={() => {}}
        />
      )
    case 'cpp':
      // CppLab: the actual C++ component from the C++ course — code editor + shell, C++ only
      return (
        <div className="h-full overflow-auto">
          <CppLab params={{}} />
        </div>
      )
    case 'git':
      return (
        <div className="h-full overflow-auto" style={{ background: '#1e1e2e' }}>
          <GitTerminal params={{}} />
        </div>
      )
    case 'matlab':
      return <MatlabRepl key={tab.id} />
    default:
      return null
  }
}

export default function TerminalHub({ isOpen, onClose }) {
  const [tabs, setTabs] = useState(() => [makeTab('python')])
  const [activeId, setActiveId] = useState(() => _nextId - 1)
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const addMenuRef = useRef(null)
  const constraintsRef = useRef(null)
  const dragControls = useDragControls()

  useEffect(() => {
    if (!addMenuOpen) return
    const h = (e) => { if (!addMenuRef.current?.contains(e.target)) setAddMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [addMenuOpen])

  useEffect(() => {
    const h = (e) => addTab(e.detail?.type ?? 'python')
    window.addEventListener('oc-terminal-open-tab', h)
    return () => window.removeEventListener('oc-terminal-open-tab', h)
  }, []) // eslint-disable-line

  const addTab = useCallback((type) => {
    const tab = makeTab(type)
    setTabs(prev => [...prev, tab])
    setActiveId(tab.id)
    setAddMenuOpen(false)
    setMinimized(false)
  }, [])

  const closeTab = useCallback((id, e) => {
    e?.stopPropagation()
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id)
      if (next.length === 0) {
        onClose()
        const fresh = makeTab('python')
        setActiveId(fresh.id)
        return [fresh]
      }
      if (activeId === id) {
        const idx = prev.findIndex(t => t.id === id)
        setActiveId(next[Math.min(idx, next.length - 1)].id)
      }
      return next
    })
  }, [activeId, onClose])

  if (!isOpen) return null

  const sizeStyle = maximized
    ? { inset: 0, width: '100vw', height: '100vh', borderRadius: 0 }
    : minimized
    ? { bottom: 0, left: '50%', transform: 'translateX(-50%)', width: DEFAULT_W, height: 40, borderRadius: '8px 8px 0 0' }
    : { top: '6vh', left: '50%', transform: 'translateX(-50%)', width: DEFAULT_W, height: DEFAULT_H, borderRadius: 8 }

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[149]" />

      <motion.div
        drag={!maximized && !minimized}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={constraintsRef}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col overflow-hidden shadow-2xl"
        style={{ position: 'fixed', zIndex: 150, border: '1px solid #2a2a2a', background: '#0c0c0c', ...sizeStyle }}
      >
        {/* Tab bar */}
        <div
          className="flex items-stretch shrink-0"
          style={{ height: 40, background: '#1f1f1f', cursor: maximized || minimized ? 'default' : 'grab', userSelect: 'none' }}
          onPointerDown={e => { if (!maximized && !minimized) dragControls.start(e) }}
        >
          <div className="flex items-end flex-1 min-w-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(tab => {
              const rt = RUNTIMES.find(r => r.type === tab.type)
              const active = tab.id === activeId
              return (
                <div
                  key={tab.id}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => { setActiveId(tab.id); setMinimized(false) }}
                  className="flex items-center gap-1.5 px-3 h-full shrink-0 cursor-pointer group"
                  style={{
                    borderRight: '1px solid #2a2a2a',
                    borderBottom: active ? `2px solid ${rt?.color}` : '2px solid transparent',
                    background: active ? '#0c0c0c' : 'transparent',
                    color: active ? '#fff' : '#777',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#252525' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 11 }}>{rt?.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{tab.label}</span>
                  <span
                    role="button"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => closeTab(tab.id, e)}
                    className="ml-1 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
                    style={{ color: '#f48771', lineHeight: 0 }}
                  >
                    <X style={{ width: 11, height: 11 }} />
                  </span>
                </div>
              )
            })}
          </div>

          {/* New tab */}
          <div ref={addMenuRef} className="relative flex-shrink-0" onPointerDown={e => e.stopPropagation()}>
            <WinBtn onClick={() => setAddMenuOpen(o => !o)} title="New tab">
              <Plus style={{ width: 13, height: 13 }} />
              <ChevronDown style={{ width: 9, height: 9 }} />
            </WinBtn>
            {addMenuOpen && (
              <div
                className="absolute left-0 top-full mt-0.5 py-1 rounded-lg shadow-2xl z-10"
                style={{ background: '#252526', border: '1px solid #3a3a3a', minWidth: 170 }}
              >
                {RUNTIMES.map(rt => (
                  <button
                    key={rt.type}
                    onClick={() => addTab(rt.type)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-left"
                    style={{ fontSize: 12, color: '#ccc' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#2a2d2e'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ccc' }}
                  >
                    <span style={{ fontSize: 14 }}>{rt.icon}</span>
                    <span style={{ fontWeight: 500 }}>{rt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Window controls */}
          <div className="flex items-center flex-shrink-0" style={{ borderLeft: '1px solid #2a2a2a' }} onPointerDown={e => e.stopPropagation()}>
            <WinBtn onClick={() => setMinimized(m => !m)} title={minimized ? 'Restore' : 'Minimize'}>
              <Minus style={{ width: 13, height: 13 }} />
            </WinBtn>
            <WinBtn onClick={() => { setMaximized(m => !m); setMinimized(false) }} title={maximized ? 'Restore' : 'Maximize'}>
              <Square style={{ width: 11, height: 11 }} />
            </WinBtn>
            <WinBtn onClick={onClose} title="Close" closeStyle>
              <X style={{ width: 13, height: 13 }} />
            </WinBtn>
          </div>
        </div>

        {/* Content panels — all mounted, active one shown */}
        {!minimized && (
          <div className="flex-1 min-h-0 relative overflow-hidden">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className="absolute inset-0"
                style={{ display: tab.id === activeId ? 'block' : 'none' }}
              >
                <TabPanel tab={tab} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </>
  )
}

function WinBtn({ onClick, title, closeStyle = false, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center gap-0.5 flex-shrink-0 transition-colors"
      style={{ width: 46, height: 40, color: '#777' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = closeStyle ? '#c42b1c' : '#2a2a2a'
        e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = '#777'
      }}
    >
      {children}
    </button>
  )
}
