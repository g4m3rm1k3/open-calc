import { useEffect, useRef, useState } from 'react'
import type { Plan } from './types'
import { computeNudge, CELEBRATE_EVENT, type Nudge } from './montyNudge'

const POLL_INTERVAL_MS = 5 * 60 * 1000
const SNOOZE_MS = 30 * 60 * 1000
const SS_KEY = 'oc-nudge-dismissed'

function nudgeKey(n: Nudge): string {
  return `${n.kind}:${n.planId}:${n.actionId ?? ''}`
}

function loadDismissed(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SS_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveDismissed(keys: Set<string>) {
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify([...keys]))
  } catch {}
}

export function useMontyNudge(plans: Plan[]) {
  const [nudge, setNudge] = useState<Nudge | null>(null)
  const [snoozedUntil, setSnoozedUntil] = useState(0)
  // sessionStorage-backed so "Got it" survives re-mounts but clears on tab close
  const [dismissed, setDismissed] = useState<Set<string>>(() => loadDismissed())
  // Ref keeps plans current without re-triggering the polling effect on every render
  const plansRef = useRef(plans)
  useEffect(() => { plansRef.current = plans }, [plans])

  useEffect(() => {
    const check = () => {
      if (Date.now() < snoozedUntil) return
      const next = computeNudge(plansRef.current)
      if (!next || dismissed.has(nudgeKey(next))) {
        setNudge(null)
        return
      }
      setNudge(next)
    }
    check()
    const id = setInterval(check, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [snoozedUntil, dismissed]) // no `plans` — uses ref to avoid firing on every render

  // Real-time completion celebrations bypass the poll/dismissed/snooze
  // machinery entirely — each one is a fresh, one-off "this just happened"
  // event, not a re-surfaced reminder about standing state.
  useEffect(() => {
    const onCelebrate = (e: Event) => {
      const message = (e as CustomEvent<{ message: string }>).detail?.message
      if (!message) return
      setNudge({ kind: 'celebration', planId: `celebration-${Date.now()}`, message })
    }
    window.addEventListener(CELEBRATE_EVENT, onCelebrate)
    return () => window.removeEventListener(CELEBRATE_EVENT, onCelebrate)
  }, [])

  const dismiss = () => {
    if (!nudge) return
    const next = new Set(dismissed).add(nudgeKey(nudge))
    saveDismissed(next)
    setDismissed(next)
    setNudge(null)
  }

  const snooze = () => {
    setSnoozedUntil(Date.now() + SNOOZE_MS)
    setNudge(null)
  }

  return { nudge, dismiss, snooze }
}
