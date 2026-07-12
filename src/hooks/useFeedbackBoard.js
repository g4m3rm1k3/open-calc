import { useMemo } from 'react'
import { useBugBoard } from './useBugBoard.js'
import { useSuggestions } from './useSuggestions.js'

// Merges the two public collections (bugs, suggestions) into one feed for
// the Help modal's "Feedback & Bugs" section — a single Open/Closed view
// instead of two separate lists. Status is exactly 'open' or anything else
// counts as closed (a maintainer flips it by hand in the Firebase console;
// see firestore.rules for the convention).
export function useFeedbackBoard() {
  const bugs = useBugBoard()
  const suggestions = useSuggestions()

  return useMemo(() => {
    if (bugs === null || suggestions === null) return { open: null, closed: null }

    const combined = [
      ...bugs.map(item => ({ ...item, kind: 'bug' })),
      ...suggestions.map(item => ({ ...item, kind: 'suggestion' })),
    ].sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))

    return {
      open: combined.filter(item => item.status !== 'closed'),
      closed: combined.filter(item => item.status === 'closed'),
    }
  }, [bugs, suggestions])
}
