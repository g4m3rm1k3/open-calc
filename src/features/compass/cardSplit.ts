/**
 * Deterministically splits a note into flashcard suggestions.
 * Follows "X: Y" or "X is Y" patterns.
 */
export function suggestCardSplit(content: string): { front: string; back: string }[] {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)
  const cards: { front: string; back: string }[] = []

  for (const line of lines) {
    let splitIndex = line.indexOf(':')
    if (splitIndex !== -1) {
      cards.push({
        front: line.substring(0, splitIndex).trim(),
        back: line.substring(splitIndex + 1).trim()
      })
      continue
    }

    splitIndex = line.toLowerCase().indexOf(' is ')
    if (splitIndex !== -1) {
      cards.push({
        front: line.substring(0, splitIndex).trim(),
        back: line.substring(splitIndex + 4).trim()
      })
    }
  }

  return cards
}
