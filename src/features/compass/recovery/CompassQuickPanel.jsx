// Quick-access overlay — capture a note or tick a habit without leaving
// whatever lesson/tool you're in. Full system building/AI-coach workflows live on the
// /compass page; this is the on-the-fly counterpart.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass, X, ExternalLink } from 'lucide-react'
import { useCompass } from './useCompass'

export default function CompassQuickPanel({ onClose }) {
  const compass = useCompass()
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')

  const capture = () => {
    if (!draft.trim()) return
    compass.addNote(draft.trim())
    setDraft('')
  }

  const goFull = () => {
    onClose?.()
    navigate('/compass')
  }

  return (
    <div className="fixed bottom-4 right-4 z-[150] w-80 max-h-[70vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Compass size={15} className="text-emerald-400" /> Compass Quick
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goFull} className="text-slate-500 hover:text-emerald-400 p-1" title="Open full dashboard">
            <ExternalLink size={14} />
          </button>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1" title="Close">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Quick capture a note..."
            rows={2}
            className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 resize-none outline-none"
          />
          <button onClick={capture} disabled={!draft.trim()} className="mt-1.5 text-xs font-semibold bg-emerald-600 text-white px-3 py-1 rounded-lg disabled:opacity-40 hover:bg-emerald-500">
            Save Note
          </button>
        </div>

        {compass.systems.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1.5">Active Systems</p>
            <ul className="space-y-1">
              {compass.systems.map((s) => (
                <li key={s.id} className="text-xs text-slate-300 bg-slate-800/60 rounded-lg px-2 py-1.5">{s.title}</li>
              ))}
            </ul>
          </div>
        )}

        {compass.habits.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1.5">Daily Habits</p>
            <ul className="space-y-1">
              {compass.habits.map((h) => (
                <li key={h.id} className="text-xs text-slate-300 bg-slate-800/60 rounded-lg px-2 py-1.5">{h.routine}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
