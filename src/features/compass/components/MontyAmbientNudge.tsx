// Always-mounted (desktop only) — this is what makes Monty actually
// proactive instead of pull-only. Independent of whether the user has the
// Compass Quick panel open; computeNudge/useMontyNudge never fabricate, so
// this only ever appears when there's something real to say.
import { useCompass } from '../useCompass'
import { useMontyNudge } from '../useMontyNudge'
import { useLearningTime } from '../useLearningTime'
import { useIsMobile } from '../../../hooks/useIsMobile.js'
import MontyNudgeToast from './MontyNudgeToast'

export default function MontyAmbientNudge() {
  const isMobile = useIsMobile()
  const compass = useCompass()
  const { nudge, dismiss, snooze } = useMontyNudge(compass.plans)
  // The one always-mounted place that actually accumulates learning time —
  // every other reader of useLearningTime() is read-only.
  useLearningTime(true)

  if (isMobile || !nudge) return null

  return (
    <div className="fixed top-[64px] right-4 z-[140]">
      <MontyNudgeToast nudge={nudge} onDismiss={dismiss} onSnooze={snooze} />
    </div>
  )
}
