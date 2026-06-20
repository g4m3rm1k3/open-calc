import { useState } from 'react'
import { RotateCw, Layers } from 'lucide-react'
import type { Flashcard } from '../types'
import type { ReviewOutcome } from '../spacedRepetition'

const GRADE_BUTTONS: { id: ReviewOutcome; label: string; cls: string }[] = [
  { id: 'again', label: 'Again', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { id: 'hard', label: 'Hard', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'good', label: 'Good', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'easy', label: 'Easy', cls: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
]

export default function FlashcardReview({ dueCards, totalCards, onReview }: {
  dueCards: Flashcard[]
  totalCards: number
  onReview: (id: string, outcome: ReviewOutcome) => void
}) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const card = dueCards[index]

  const grade = (outcome: ReviewOutcome) => {
    onReview(card.id, outcome)
    setRevealed(false)
    setIndex((i) => i + 1)
  }

  if (totalCards === 0) {
    return <p className="text-slate-500 text-sm">No cards yet — make some from a note first.</p>
  }
  if (dueCards.length === 0 || index >= dueCards.length) {
    return (
      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-center">
        <Layers size={20} className="text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Nothing due right now.</p>
        <p className="text-xs text-slate-600 mt-1">{totalCards} card{totalCards === 1 ? '' : 's'} total — they'll come back when they're due.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{dueCards.length - index} of {dueCards.length} due</p>
      <button onClick={() => setRevealed((r) => !r)} className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-6 text-center min-h-[120px] flex items-center justify-center">
        <span className="text-base text-slate-100">{revealed ? card.back : card.front}</span>
      </button>
      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold bg-slate-800 text-slate-300 rounded-lg py-2">
          <RotateCw size={14} /> Show answer
        </button>
      ) : (
        <div className="grid grid-cols-4 gap-1.5">
          {GRADE_BUTTONS.map((g) => (
            <button key={g.id} onClick={() => grade(g.id)} className={`text-xs font-semibold rounded-lg py-2 border ${g.cls}`}>
              {g.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
