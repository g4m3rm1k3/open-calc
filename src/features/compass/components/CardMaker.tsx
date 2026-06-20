// Turns a note into flashcards. The deterministic split (cardSplit.ts) is
// only ever a starting suggestion — every row is editable, and nothing
// saves until the user confirms. No AI call here at all; there's nothing to
// hallucinate when the only source is text the user already wrote.
import { useState } from 'react'
import { Plus, Trash2, X, Check } from 'lucide-react'
import { suggestCardSplit } from '../cardSplit'

interface CardMakerProps {
  noteContent: string
  noteId: string
  onSave: (cards: { front: string; back: string; noteId: string }[]) => void
  onCancel: () => void
}

export default function CardMaker({ noteContent, noteId, onSave, onCancel }: CardMakerProps) {
  const [cards, setCards] = useState(() => {
    const suggested = suggestCardSplit(noteContent)
    return suggested.length > 0 ? suggested : [{ front: '', back: '' }]
  })

  const update = (i: number, patch: Partial<{ front: string; back: string }>) =>
    setCards((c) => c.map((card, idx) => (idx === i ? { ...card, ...patch } : card)))
  const remove = (i: number) => setCards((c) => c.filter((_, idx) => idx !== i))
  const addRow = () => setCards((c) => [...c, { front: '', back: '' }])

  const inputCls = "w-full bg-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 outline-none"

  return (
    <div className="mt-2 pt-2 border-t border-slate-700/60 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Make cards from this note</span>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-300"><X size={13} /></button>
      </div>
      {cards.map((card, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input value={card.front} onChange={(e) => update(i, { front: e.target.value })} placeholder="Front (question)" className={inputCls} />
          <input value={card.back} onChange={(e) => update(i, { back: e.target.value })} placeholder="Back (answer)" className={inputCls} />
          <button onClick={() => remove(i)} className="text-slate-500 hover:text-rose-400 shrink-0"><Trash2 size={12} /></button>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button onClick={addRow} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200">
          <Plus size={12} /> Add card
        </button>
        <button
          onClick={() => onSave(cards.filter((c) => c.front.trim() && c.back.trim()).map((c) => ({ ...c, noteId })))}
          disabled={cards.every((c) => !c.front.trim() || !c.back.trim())}
          className="flex items-center gap-1 text-xs font-semibold bg-sky-500 text-slate-950 rounded-lg px-3 py-1 disabled:opacity-40">
          <Check size={12} /> Save cards
        </button>
      </div>
    </div>
  )
}
