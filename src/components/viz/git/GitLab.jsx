import { useState, useEffect, useMemo, useRef } from 'react'
import { GitEngine } from '../../../scripts/git/GitEngine.js'

/**
 * GitLab - The Command Center for learning Git.
 * Mimics a terminal + visual tree.
 */
export default function GitLab({ initialFiles = { 'story.txt': 'Phase 1: Your first line...' }, scenario = null, mode = 'snapshot', mission = null }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  
  const [version, setVersion] = useState(0)
  const gitRef = useRef(new GitEngine())
  const git = gitRef.current
  const forceUpdate = () => setVersion(v => v + 1)

  const C = useMemo(() => isDark ? {
    bg:      '#050a15',
    surface: '#111827',
    border:  '#1f2937',
    text:    '#f9fafb',
    muted:   '#6b7280',
    brand:   '#3b82f6',
    danger:  '#ef4444',
    console: '#020617'
  } : {
    bg:      '#f1f5f9',
    surface: '#ffffff',
    border:  '#e2e8f0',
    text:    '#0f172a',
    muted:   '#64748b',
    brand:   '#2563eb',
    danger:  '#dc2626',
    console: '#0f172a'
  }, [isDark])

  const [activeTab, setActiveTab] = useState('vfs')
  const [editingFile, setEditingFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [corruptionActive, setCorruptionActive] = useState(false)
  const [snapshotCount, setSnapshotCount] = useState(0)
  const [lostWorkWarning, setLostWorkWarning] = useState(null)
  
  const MAX_SNAPSHOTS = 4

  // --- INITIALIZATION ---
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    Object.entries(initialFiles).forEach(([name, content]) => git.writeFile(name, content))
    forceUpdate()
  }, [JSON.stringify(initialFiles)])

  const takeQuickSnapshot = () => {
    if (snapshotCount >= MAX_SNAPSHOTS) {
      setLostWorkWarning("SNAPSHOT LIMIT REACHED! You cannot save more states.")
      return
    }
    git.status().modified.forEach(f => git.add(f))
    git.commit(`Snapshot ${snapshotCount + 1}`)
    setSnapshotCount(prev => prev + 1)
    setLostWorkWarning(null)
    forceUpdate()
  }

  const simulateCorruption = (filename) => {
    git.writeFile(filename, "ERROR: [DATA_CORRUPTION_EVENT] - 0x7FF..." + Math.random())
    setCorruptionActive(true)
    setLostWorkWarning("SYSTEM FAILURE: File content has been overwritten!")
    forceUpdate()
  }

  const renderDAG = () => (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/5">
         <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">History Vault</h4>
         <div className="text-[9px] font-bold opacity-30 uppercase">{snapshotCount} / {MAX_SNAPSHOTS} Saved</div>
      </div>
      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-blue-500/10" />
        <div className="space-y-6">
          {git.getHistory().reverse().map((c) => (
            <div key={c.hash} className="pl-8 relative group cursor-pointer" onClick={() => { git.checkout(c.hash); setCorruptionActive(false); setLostWorkWarning(null); forceUpdate() }}>
              <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full transition-all border-4 shadow-xl ${git.head === c.hash ? 'bg-blue-500 border-blue-500/20 scale-150 z-10' : 'bg-slate-300 dark:bg-slate-700 border-transparent hover:scale-110'}`} />
              <div className={`p-4 rounded-[2rem] border-2 transition-all ${git.head === c.hash ? 'border-blue-500/40 shadow-2xl scale-[1.03] ring-1 ring-blue-500/10' : 'border-black/5 dark:border-white/5 opacity-40 hover:opacity-100 hover:border-blue-500/10'}`} style={{ background: C.surface, color: C.text }}>
                <div className="flex items-center justify-between mb-2">
                   <div className="text-[9px] font-black font-mono text-blue-500 uppercase tracking-tight">{c.hash.slice(0, 8)}</div>
                   {git.head === c.hash && <div className="text-[8px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase scale-90">Current State</div>}
                </div>
                <div className="text-xs font-black leading-tight uppercase tracking-tight">{c.message}</div>
              </div>
            </div>
          ))}
          {snapshotCount === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-4 opacity-20">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
               <div className="text-[10px] font-black uppercase tracking-widest">No History Yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderVFS = () => (
    <div className="p-8 space-y-6">
      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Workspace</h4>
      {Array.from(git.workingDir.entries()).map(([path, content]) => (
        <div key={path} className="p-5 rounded-[2rem] border-2 transition-all group cursor-pointer hover:border-blue-500/40 shadow-sm hover:shadow-xl" 
          onClick={() => { setEditingFile(path); setFileContent(content) }}
          style={{ background: C.surface, borderColor: editingFile === path ? C.brand : C.border }}>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-sm font-black font-mono tracking-tight" style={{ color: C.text }}>{path}</h5>
            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${corruptionActive ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 opacity-40'}`}>
              {corruptionActive ? 'ERROR' : 'READY'}
            </div>
          </div>
          <div className={`text-[11px] font-mono opacity-50 line-clamp-4 bg-black/5 dark:bg-black/20 p-4 rounded-2xl overflow-hidden leading-relaxed ${corruptionActive ? 'text-red-500' : ''}`} style={{ color: !corruptionActive ? C.text : undefined }}>{String(content)}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-full min-h-[600px] rounded-[3.5rem] border-[8px] overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.5)] transition-all font-sans" style={{ background: C.bg, borderColor: C.border }}>
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-12 py-8 border-b-2" style={{ borderColor: C.border }}>
        <div className="flex items-center gap-8">
          <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl rotate-2 transition-transform hover:rotate-0" style={{ background: C.brand }}>
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter" style={{ color: C.text }}>State Lab</h3>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex p-2 rounded-2xl bg-black/10 dark:bg-black/40 backdrop-blur-3xl border border-black/5 dark:border-white/5 shadow-inner">
          {['vfs', 'dag'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === t ? 'bg-white dark:bg-slate-700 shadow-2xl scale-105' : 'opacity-40 hover:opacity-100'}`} style={{ color: activeTab === t ? C.brand : C.text }}>
              {t === 'vfs' ? 'Files' : 'Timeline'}
            </button>
          ))}
        </div>
      </div>

      {mission && (
        <div className="px-12 py-5 bg-brand-500/10 border-b-4 border-brand-500/20 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="px-3 py-1.5 bg-brand-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Active Scenario</div>
              <p className="text-sm font-black italic tracking-tight" style={{ color: C.text }}>{mission}</p>
           </div>
           {scenario === 'corruptable' && !corruptionActive && (
             <button onClick={() => simulateCorruption('story.txt')} className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-600 hover:text-white border-2 border-red-600/20 text-[10px] font-black rounded-xl uppercase transition-all shadow-lg active:scale-95">
                Simulate Accident
             </button>
           )}
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        <div className="w-96 overflow-auto border-r border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/2 backdrop-blur-3xl">
          {activeTab === 'vfs' && renderVFS()}
          {activeTab === 'dag' && renderDAG()}
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden" style={{ background: C.console }}>
          {editingFile ? (
            <div className="flex-1 flex flex-col p-12 animate-in zoom-in-95 duration-500">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Editing Disk Buffer</h4>
                    <div className="text-lg font-black text-white">{editingFile}</div>
                  </div>
                  <button onClick={() => setEditingFile(null)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest border border-white/5">Discard</button>
               </div>
               <textarea 
                 autoFocus
                 className="flex-1 bg-slate-900/40 rounded-[3rem] p-12 text-blue-300 font-mono text-2xl border-4 border-slate-800 outline-none focus:border-brand-500 transition-all shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
                 value={fileContent}
                 onChange={e => setFileContent(e.target.value)}
                 onBlur={() => { git.writeFile(editingFile, fileContent); setEditingFile(null); forceUpdate() }}
                 placeholder="Type your story here..."
               />
               <button onClick={() => { git.writeFile(editingFile, fileContent); setEditingFile(null); forceUpdate() }}
                 className="mt-10 px-12 py-7 bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(59,130,246,0.5)] active:scale-95 transition-all">
                 Apply Workspace Change
               </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
               
               {lostWorkWarning && (
                 <div className="mb-12 p-8 bg-red-500/10 border-4 border-red-500/30 rounded-[3rem] max-w-lg mb-10 animate-bounce">
                    <h5 className="text-red-500 font-black text-xl uppercase tracking-tighter mb-2">Work Lost!</h5>
                    <p className="text-red-500/60 font-bold text-xs uppercase tracking-widest leading-relaxed">{lostWorkWarning}</p>
                 </div>
               )}

               <div className="relative mb-16">
                  <div className="absolute inset-0 bg-brand-500/30 blur-[80px] rounded-full animate-pulse" />
                  <div className={`w-40 h-40 rounded-[3rem] bg-brand-500/20 border-4 border-brand-500/50 flex items-center justify-center text-brand-500 relative z-10 shadow-2xl transition-transform duration-700 ${corruptionActive ? 'rotate-[15deg] scale-110 grayscale' : 'hover:scale-110 hover:-rotate-3'}`}>
                     {corruptionActive ? (
                       <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                     ) : (
                       <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                     )}
                  </div>
               </div>

               {snapshotCount < MAX_SNAPSHOTS ? (
                 <div className="space-y-12">
                   <div className="max-w-md mx-auto">
                     <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none">Capture State</h2>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-loose">Once you edit your story, you must decide when to freeze your work into history. But choose wisely—you only have **{MAX_SNAPSHOTS - snapshotCount} snapshots left**.</p>
                   </div>
                   <button 
                     onClick={takeQuickSnapshot}
                     className="px-16 py-8 bg-white hover:bg-brand-500 hover:text-white text-slate-950 text-base font-black uppercase tracking-[0.4em] rounded-[2.5rem] shadow-2xl transform active:scale-95 transition-all outline outline-offset-8 outline-white/10"
                   >
                     Take Snapshot
                   </button>
                 </div>
               ) : (
                 <div className="max-w-md mx-auto">
                    <div className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Out of Memory</div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Snapshot Limit Reached</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">You must rely on your existing timeline to recover from any future crashes. Good luck.</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
