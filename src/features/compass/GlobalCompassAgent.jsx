/**
 * GlobalCompassAgent — the persistent floating Compass button available on every page.
 *
 * This component is mounted once in AppShell so the agent is always accessible
 * regardless of which page the user is on. It owns its own open/close state and
 * reads from useCompass() directly rather than receiving props, so it doesn't
 * need wiring in every page that mounts it.
 *
 * CompassPage's existing Monty button is still there for the /compass route,
 * but GlobalCompassAgent provides the ambient, always-on version everywhere else.
 * Both use the same MontyPanel component — one source of truth.
 */
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useCompass } from '../../features/compass/useCompass'
import MontyPanel from '../../features/compass/components/MontyPanel'
import { isComplicated } from '../../features/compass/playbooks'

export default function GlobalCompassAgent() {
  const location = useLocation()
  const compass = useCompass()

  const [open, setOpen] = useState(false)
  const [questionTitle, setQuestionTitle] = useState(null)
  const [draftTitle, setDraftTitle] = useState(null)
  const [draftActions, setDraftActions] = useState([])
  const [convertingNoteId, setConvertingNoteId] = useState(null)

  // Hide on /compass — that page has its own Monty button
  if (location.pathname.startsWith('/compass')) return null

  const handleIntake = (title) => {
    if (isComplicated(title)) {
      setQuestionTitle(title)
    } else {
      setDraftTitle(title)
      setDraftActions(compass.proposePlan(title))
    }
  }

  const handleAnswered = (answers) => {
    if (!questionTitle) return
    setDraftTitle(questionTitle)
    setDraftActions(compass.proposePlan(questionTitle, answers))
    setQuestionTitle(null)
  }

  const handleConfirm = (title, drafts, reward) => {
    compass.confirmPlan(title, drafts, reward)
    if (convertingNoteId) {
      compass.updateNote(convertingNoteId, { status: 'clarified' })
      setConvertingNoteId(null)
    }
    setDraftTitle(null)
    setDraftActions([])
  }

  const handleCancelBreakdown = () => {
    setConvertingNoteId(null)
    setQuestionTitle(null)
    setDraftTitle(null)
  }

  // Count things due today for the badge
  const today = new Date().toISOString().split('T')[0]
  const dueCount = compass.plans.reduce((acc, plan) => {
    if (plan.status !== 'active') return acc
    const day = new Date().getDay()
    plan.actions.forEach(action => {
      const isDue =
        action.cadence === 'daily' ||
        (action.cadence === 'weekdays' && day !== 0 && day !== 6) ||
        (action.cadence === 'once' && action.status !== 'done')
      if (isDue) {
        const loggedDone = action.log.some(l => l.date === today && l.outcome === 'done')
        if (!loggedDone) acc++
      }
    })
    return acc
  }, 0)

  return (
    <>
      {/* Floating button — always visible, bottom-right */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-[1600] flex items-center gap-2 bg-sky-500 text-slate-950 font-bold text-sm rounded-full pl-3 pr-4 py-2.5 shadow-xl hover:bg-sky-400 transition-all hover:scale-105 active:scale-95"
          title="Open Compass"
        >
          <Sparkles size={15} />
          Compass
          {dueCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 text-[10px] font-black bg-red-500 text-white rounded-full flex items-center justify-center min-w-[18px] px-1">
              {dueCount}
            </span>
          )}
        </button>
      )}

      {/* Panel */}
      {open && (
        <MontyPanel
          plans={compass.plans}
          notes={compass.notes}
          flashcards={compass.flashcards}
          dueFlashcards={compass.dueFlashcards}
          onClose={() => setOpen(false)}
          questionTitle={questionTitle}
          draftTitle={draftTitle}
          draftActions={draftActions}
          onIntake={handleIntake}
          onAnswered={handleAnswered}
          onConfirm={handleConfirm}
          onCancelBreakdown={handleCancelBreakdown}
        />
      )}
    </>
  )
}
