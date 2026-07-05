// Merges consecutive html/css/js fenced code blocks (the natural way people
// already write CodePen-style tutorials — no special fence annotation needed)
// into a single synthetic ```oc-live-group``` block carrying all three as
// JSON, so the markdown renderer can show one shared live preview per
// exercise instead of one per block. A lone html/css/js block still becomes
// a one-entry group, so LiveCodeCell only ever has to handle one shape.
const LIVE_LANGS = new Set(['html', 'css', 'js', 'javascript'])
const FENCE_RE = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)\n```/g

function keyFor(lang) {
  return lang === 'javascript' ? 'js' : lang
}

export function groupLiveCodeBlocks(markdown) {
  const matches = [...markdown.matchAll(FENCE_RE)]
  if (matches.length === 0) return markdown

  let result = ''
  let cursor = 0
  let i = 0

  while (i < matches.length) {
    const m = matches[i]
    const lang = m[1].toLowerCase()

    if (!LIVE_LANGS.has(lang)) {
      result += markdown.slice(cursor, m.index + m[0].length)
      cursor = m.index + m[0].length
      i++
      continue
    }

    const group = { html: '', css: '', js: '' }
    group[keyFor(lang)] = m[2]
    let groupEnd = m.index + m[0].length
    let j = i + 1

    while (j < matches.length) {
      const next = matches[j]
      const between = markdown.slice(groupEnd, next.index)
      if (!/^\s*$/.test(between)) break // real content between blocks — not one exercise
      const nextLang = next[1].toLowerCase()
      if (!LIVE_LANGS.has(nextLang)) break
      const nextKey = keyFor(nextLang)
      if (group[nextKey]) break // already have this piece — start a new group instead
      group[nextKey] = next[2]
      groupEnd = next.index + next[0].length
      j++
    }

    result += markdown.slice(cursor, m.index)
    result += '```oc-live-group\n' + JSON.stringify(group) + '\n```'
    cursor = groupEnd
    i = j
  }

  result += markdown.slice(cursor)
  return result
}
