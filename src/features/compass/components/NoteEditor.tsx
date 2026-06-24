import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Trash2, Eye, Pencil, ArrowRight, Archive, RotateCcw, ChevronDown, Layers } from 'lucide-react'
import type { Note, NoteStatus } from '../types'
import { METHODS } from '../methods'
import CardMaker from './CardMaker'

// This is GTD's Capture → Clarify → Organize → Engage made literal, not a
// reference card describing it (see buildplan.md Slice 3). Capture = the
// textarea below. Clarify = the "→ Plan" / "Archive" buttons on each inbox
// note — "is it actionable? If yes, what's the next step" becomes "turn it
// into a Plan"; "if no, drop it" becomes Archive. Organize = the category
// field. There's no separate "Reflect" step yet (see buildplan.md note
// about not faking a weekly-review feature without real log data).

interface NoteEditorProps {
  notes: Note[]
  categories: string[]
  onAdd: (content: string, category?: string) => void
  onUpdate: (id: string, patch: Partial<Pick<Note, 'content' | 'category'>>) => void
  onDelete: (id: string) => void
  onClarifyToPlan: (noteId: string, content: string) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
  onSaveCards: (cards: { front: string; back: string; noteId: string }[]) => void
}

const STATUS_TABS: { id: NoteStatus; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'clarified', label: 'Clarified' },
  { id: 'archived', label: 'Archived' },
]

export default function NoteEditor({ notes, categories, onAdd, onUpdate, onDelete, onClarifyToPlan, onArchive, onRestore, onSaveCards }: NoteEditorProps) {
  const [draft, setDraft] = useState('')
  const [category, setCategory] = useState('')
  const [statusTab, setStatusTab] = useState<NoteStatus>('inbox')
  const [whyOpen, setWhyOpen] = useState(false)

  const submit = () => {
    if (!draft.trim()) return
    onAdd(draft.trim(), category.trim() || undefined)
    setDraft('')
    setCategory('')
  }

  const visible = notes.filter((n) => n.status === statusTab)
  const inboxCount = notes.filter((n) => n.status === 'inbox').length
  const gtd = METHODS.gtd

  return (
    <div className="space-y-3">
      <button onClick={() => setWhyOpen((o) => !o)} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
        Why notes work this way <ChevronDown size={10} className={`transition-transform ${whyOpen ? 'rotate-180' : ''}`} />
      </button>
      {whyOpen && (
        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 rounded-lg p-2 -mt-1">
          <span className="text-slate-700 dark:text-slate-300 font-semibold">{gtd.name}</span>
          <span className="text-slate-400 dark:text-slate-600"> · {gtd.source}</span>
          <p className="mt-0.5">{gtd.why}</p>
        </div>
      )}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Capture a thought, task, or note..."
          rows={draft.trim().length > 0 ? 3 : 2}
          className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none outline-none transition-all"
        />
        {draft.trim().length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex-1 min-w-0">
              <input 
                list="category-suggestions"
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Assign a category (optional)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors" 
              />
              <datalist id="category-suggestions">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </datalist>
            </div>
            <button onClick={submit} className="w-full sm:w-auto shrink-0 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white px-5 py-2 rounded-xl shadow-sm shadow-sky-500/20 transition-all">
              Save Note
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {STATUS_TABS.map((t) => (
          <button key={t.id} onClick={() => setStatusTab(t.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${statusTab === t.id ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            {t.label}{t.id === 'inbox' && inboxCount > 0 ? ` (${inboxCount})` : ''}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {visible.length === 0 && (
          <p className="text-slate-500 text-sm">
            {statusTab === 'inbox' ? 'Inbox is empty — capture something above.' : `No ${statusTab} notes.`}
          </p>
        )}
        {visible.map((n) => (
          <NoteRow key={n.id} note={n} onUpdate={onUpdate} onDelete={onDelete} onClarifyToPlan={onClarifyToPlan} onArchive={onArchive} onRestore={onRestore} onSaveCards={onSaveCards} />
        ))}
      </div>
    </div>
  )
}

function NoteRow({ note, onUpdate, onDelete, onClarifyToPlan, onArchive, onRestore, onSaveCards }: {
  note: Note
  onUpdate: NoteEditorProps['onUpdate']
  onDelete: NoteEditorProps['onDelete']
  onClarifyToPlan: NoteEditorProps['onClarifyToPlan']
  onArchive: NoteEditorProps['onArchive']
  onRestore: NoteEditorProps['onRestore']
  onSaveCards: NoteEditorProps['onSaveCards']
}) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(note.content)
  const [makingCards, setMakingCards] = useState(false)

  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => { onUpdate(note.id, { content }); setEditing(false) }}
              rows={3}
              autoFocus
              className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-200 resize-none outline-none"
            />
          ) : (
            <div className="text-sm text-slate-700 dark:text-slate-300 prose-slate dark:prose-invert prose-sm">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          )}
          {note.category && (
            <span className="inline-block mt-1.5 text-[10px] bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-transparent text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{note.category}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setEditing((e) => !e)} className="text-slate-400 hover:text-sky-500 dark:text-slate-500 dark:hover:text-sky-400 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            {editing ? <Eye size={13} /> : <Pencil size={13} />}
          </button>
          <button onClick={() => onDelete(note.id)} className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {note.status === 'inbox' && (
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <button onClick={() => onClarifyToPlan(note.id, note.content)} className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold transition-colors">
            <ArrowRight size={14} /> Turn into Plan
          </button>
          <button onClick={() => setMakingCards((m) => !m)} className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 font-semibold transition-colors">
            <Layers size={14} /> Make Cards
          </button>
          <button onClick={() => onArchive(note.id)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors ml-auto sm:ml-0">
            <Archive size={14} /> Archive
          </button>
        </div>
      )}
      {note.status !== 'inbox' && (
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <button onClick={() => setMakingCards((m) => !m)} className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 font-semibold transition-colors">
            <Layers size={14} /> Make Cards
          </button>
          {note.status === 'archived' && (
            <button onClick={() => onRestore(note.id)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
              <RotateCcw size={14} /> Restore to Inbox
            </button>
          )}
        </div>
      )}
      {makingCards && (
        <CardMaker noteContent={note.content} noteId={note.id}
          onSave={(cards) => { onSaveCards(cards); setMakingCards(false) }}
          onCancel={() => setMakingCards(false)} />
      )}
    </div>
  )
}
