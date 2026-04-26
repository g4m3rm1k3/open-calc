import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePins } from '../../context/PinsContext.jsx';
import { ALL_LESSONS } from '../../content/index.js';
import DEFAULT_NOTES from '../../content/default-notes.json';
import { 
  Pin, 
  PenLine, 
  X, 
  Download, 
  Upload, 
  ChevronRight,
  GripVertical,
  Search,
  BookOpen
} from 'lucide-react';

const STORAGE_KEY_NOTES = 'oc-sticky-notes';
const STORAGE_KEY_WIDTH = 'oc-utility-panel-width';

// Note Logic Utils
const LESSON_META = Object.fromEntries(
  ALL_LESSONS.map(l => [l.id, {
    title: l.title,
    chapterTitle: l.chapterTitle,
    path: `/chapter/${l.chapterNumber}/${l.slug}`,
  }])
);

const DOTS = { yellow: '#fbbf24', blue: '#60a5fa', green: '#4ade80', pink: '#f472b6', orange: '#fb923c' };

function parseNoteId(noteId) {
  const idx = noteId.indexOf(':');
  if (idx === -1) return { lessonId: noteId, section: '' };
  const lessonId = noteId.slice(0, idx);
  const rest = noteId.slice(idx + 1);
  let section;
  if (rest.startsWith('viz:')) section = 'Viz';
  else if (rest.startsWith('example:')) section = 'Example';
  else section = rest.charAt(0).toUpperCase() + rest.slice(1);
  return { lessonId, section };
}

function readUserNotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_NOTES) ?? '{}'); }
  catch { return {}; }
}

function readMergedNotes() {
  const user = readUserNotes();
  const merged = {};
  for (const [id, note] of Object.entries(DEFAULT_NOTES)) {
    if (id === '__version') continue;
    if (note?.text?.trim()) merged[id] = { ...note, _isDefault: true };
  }
  for (const [id, note] of Object.entries(user)) {
    if (note?.deleted) { delete merged[id]; continue; }
    if (note?.text?.trim()) merged[id] = note;
  }
  return merged;
}

export default function UtilityPanel() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pins'); // 'pins' | 'notes'
  const [width, setWidth] = useState(() => parseInt(localStorage.getItem(STORAGE_KEY_WIDTH) || '320'));
  const [isResizing, setIsResizing] = useState(false);
  const [notes, setNotes] = useState({});
  const { pins, removePin } = usePins();
  const navigate = useNavigate();
  const importRef = useRef(null);
  const panelRef = useRef(null);

  // Sync Notes
  useEffect(() => {
    if (open) setNotes(readMergedNotes());
  }, [open]);

  useEffect(() => {
    const handler = () => setNotes(readMergedNotes());
    window.addEventListener('storage', handler);
    window.addEventListener('oc-note-change', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('oc-note-change', handler);
    };
  }, []);

  // Resize Logic
  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      const finalWidth = Math.min(Math.max(newWidth, 260), 600);
      setWidth(finalWidth);
      localStorage.setItem(STORAGE_KEY_WIDTH, finalWidth.toString());
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  // Navigation Logic
  function scrollToElement(elementId) {
    let attempts = 0;
    const maxAttempts = 80;
    setTimeout(() => {
      window.scrollTo(0, 0);
      const chunk = Math.max(window.innerHeight * 0.6, 400);
      function step() {
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        attempts++;
        if (attempts >= maxAttempts) return;
        window.scrollTo(0, window.scrollY + chunk);
        setTimeout(step, 160);
      }
      step();
    }, 600);
  }

  const handlePinAction = (pin) => {
    navigate(pin.path);
    setOpen(false);
    if (pin.elementId) scrollToElement(pin.elementId);
  };

  const handleNoteAction = (noteId) => {
    const { lessonId } = parseNoteId(noteId);
    const meta = LESSON_META[lessonId];
    if (!meta) return;
    const elementId = noteId.replace(/:/g, '-');
    navigate(meta.path);
    setOpen(false);
    scrollToElement(elementId);
  };

  // Note Actions
  const exportNotes = () => {
    const user = readUserNotes();
    const clean = {};
    for (const [id, n] of Object.entries(user)) {
      if (n?.text?.trim()) {
        const { _isDefault, _imported, ...rest } = n;
        clean[id] = rest;
      }
    }
    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'open-calc-notes.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        const current = readUserNotes();
        for (const [id, note] of Object.entries(imported)) {
          if (id === '__version') continue;
          if (!current[id]?.text?.trim()) current[id] = { ...note, _imported: true };
        }
        localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(current));
        setNotes(readMergedNotes());
        window.dispatchEvent(new Event('oc-note-change'));
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const sortedNotes = Object.entries(notes)
    .filter(([, n]) => n?.text?.trim())
    .sort((a, b) => (b[1].updatedAt ?? 0) - (a[1].updatedAt ?? 0));

  return (
    <div className="hidden lg:block fixed right-0 top-[90px] bottom-0 z-50 pointer-events-none">
      {/* Resizable Panel */}
      <div
        ref={panelRef}
        style={{ width: open ? width : 0 }}
        className={`absolute right-0 top-0 bottom-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-[width] duration-300 ease-out pointer-events-auto shadow-2xl overflow-hidden`}
      >
        {/* Resize Handle */}
        {open && (
           <div 
             onMouseDown={startResizing}
             className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-brand-500/20 transition-colors z-[60] flex items-center justify-center group"
           >
             <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 rounded-full group-hover:bg-brand-500 transition-colors" />
           </div>
        )}

        {/* Header / Tabs */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('pins')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'pins' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Pin className="w-3.5 h-3.5" /> Pins
              {pins.length > 0 && <span className="bg-brand-500 text-white text-[9px] px-1.5 rounded-full">{pins.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'notes' ? 'bg-white dark:bg-slate-700 shadow-sm text-yellow-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <PenLine className="w-3.5 h-3.5" /> Notes
              {sortedNotes.length > 0 && <span className="bg-yellow-500 text-white text-[9px] px-1.5 rounded-full">{sortedNotes.length}</span>}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {activeTab === 'notes' && (
              <div className="flex items-center gap-0.5">
                <button onClick={exportNotes} className="p-1.5 text-slate-400 hover:text-brand-500 transition-colors" title="Export Notes"><Download className="w-3.5 h-3.5" /></button>
                <button onClick={() => importRef.current?.click()} className="p-1.5 text-slate-400 hover:text-brand-500 transition-colors" title="Import Notes"><Upload className="w-3.5 h-3.5" /></button>
                <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
              </div>
            )}
            <button onClick={() => setOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'pins' ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {pins.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Pin className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">No Pinned Items</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Hover over visualizations in lessons and click the pin icon to save them here.</p>
                </div>
              ) : (
                pins.map(pin => (
                  <div key={pin.id} className="group p-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors relative">
                    <button onClick={() => handlePinAction(pin)} className="text-left w-full pr-8">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">{pin.subtitle || 'Visualization'}</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-brand-500 transition-colors">{pin.title}</div>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removePin(pin.id); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {sortedNotes.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <PenLine className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Empty Notebook</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Clip a section of any lesson to keep your thoughts organized.</p>
                </div>
              ) : (
                sortedNotes.map(([noteId, note]) => {
                  const { lessonId, section } = parseNoteId(noteId);
                  const meta = LESSON_META[lessonId];
                  const dot = DOTS[note.color] ?? DOTS.yellow;
                  return (
                    <div key={noteId} className="group p-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors relative">
                      <button onClick={() => handleNoteAction(noteId)} className="text-left w-full">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div style={{ background: dot }} className="w-2 h-2 rounded-full" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{section || 'Manual Note'}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{meta?.title || lessonId}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{note.text}</p>
                      </button>
                      <button 
                         onClick={() => {
                           const user = readUserNotes();
                           if (DEFAULT_NOTES[noteId]) user[noteId] = { deleted: true };
                           else delete user[noteId];
                           localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(user));
                           setNotes(readMergedNotes());
                         }}
                         className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Trigger Tabs (Stacked) */}
      {!open && (
        <div className="absolute right-0 top-6 flex flex-col gap-2">
          <button 
            onClick={() => { setOpen(true); setActiveTab('pins'); }}
            className="pointer-events-auto flex items-center gap-2 pl-3 pr-4 py-2 bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-800 border-r-0 rounded-l-xl text-brand-700 dark:text-brand-400 font-bold text-xs shadow-lg hover:pr-6 transition-all group"
          >
            <Pin className="w-4 h-4" />
            <span>Pins</span>
            {pins.length > 0 && <span className="bg-brand-500 text-white text-[9px] px-1.5 rounded-full">{pins.length}</span>}
          </button>
          
          <button 
            onClick={() => { setOpen(true); setActiveTab('notes'); }}
            className="pointer-events-auto flex items-center gap-2 pl-3 pr-4 py-2 bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-800 border-r-0 rounded-l-xl text-yellow-700 dark:text-yellow-400 font-bold text-xs shadow-lg hover:pr-6 transition-all group"
          >
            <PenLine className="w-4 h-4" />
            <span>Notes</span>
            {sortedNotes.length > 0 && <span className="bg-yellow-500 text-white text-[9px] px-1.5 rounded-full">{sortedNotes.length}</span>}
          </button>
        </div>
      )}
    </div>
  );
}
