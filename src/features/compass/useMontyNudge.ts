import { useEffect, useState } from 'react'
import type { Plan } from './types'
import { computeNudge, type Nudge } from './montyNudge'

const POLL_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const SNOOZE_MS = 30 * 60 * 1000 // 30 minutes

function nudgeKey(n: Nudge): string {
  return `${n.kind}:${n.planId}:${n.actionId ?? ''}`
}

export function useMontyNudge(plans: Plan[]) {
  const [nudge, setNudge] = useState<Nudge | null>(null)
  const [snoozedUntil, setSnoozedUntil] = useState(0)
  const [dismissedKey, setDismissedKey] = useState<string | null>(null)

  useEffect(() => {
    const check = () => {
      if (Date.now() < snoozedUntil) return
      const next = computeNudge(plans)
      if (!next || nudgeKey(next) === dismissedKey) {
        setNudge(null)
        return
      }
      setNudge(next)
    }
    check()
    const interval = setInterval(check, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [plans, snoozedUntil, dismissedKey])

  const dismiss = () => {
    if (nudge) setDismissedKey(nudgeKey(nudge))
    setNudge(null)
  }

  const snooze = () => {
    setSnoozedUntil(Date.now() + SNOOZE_MS)
    setNudge(null)
  }

  return { nudge, dismiss, snooze }
}
