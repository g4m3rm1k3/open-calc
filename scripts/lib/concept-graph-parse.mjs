/**
 * Shared parsing for track-foundations/CONCEPT-GRAPH.md, used by both
 * scripts/concept-graph-report.mjs (validation + growth/health reporting)
 * and scripts/concept-graph-resolve.mjs (Stage 5 dependency resolution).
 *
 * Node format this parses (one block per concept, see CONCEPT-GRAPH.md's
 * own header for the authoritative spec):
 *
 *   ### concept-id
 *
 *   Preferred Name: ...
 *   Aliases: ...
 *   Definition: ...
 *   First needed because: ...
 *   Category: NN Category Name
 *   Depth required: Recognition | Working | Mastery
 *   Required prerequisites: [a, b, c]
 *   Builds toward: [x, y]
 *   Related concepts: [...]
 *   Syntax by language: ...            (optional)
 *   Used by (track/): Lesson N, Lesson M (note), ...
 *   Recognition taught in (track-foundations): ...
 *   Fully taught in (track-foundations): ...
 */

export const FIELD_NAMES = [
  'Preferred Name',
  'Aliases',
  'Definition',
  'First needed because',
  'Category',
  'Depth required',
  'Required prerequisites',
  'Builds toward',
  'Related concepts',
  'Syntax by language',
  'Used by (track/)',
  'Recognition taught in (track-foundations)',
  'Fully taught in (track-foundations)',
]

export function parseListField(value) {
  // "[a, b, c]" or "[]" -> ['a','b','c'] or []
  const match = value.match(/\[(.*)\]/s)
  const inner = match ? match[1] : value
  return inner
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function parseUsedBy(value) {
  // "Lesson 1 (sighted only), Lesson 2, Lesson 4, Lesson 5" -> [1,2,4,5]
  return value
    .split(',')
    .map((chunk) => {
      const m = chunk.match(/Lesson\s+(\d+)/)
      return m ? Number(m[1]) : null
    })
    .filter((n) => n !== null)
}

export function parseNodes(text) {
  // Split on top-level "### " headings, but only inside category sections
  // (category headings are "## Category ..." and are not nodes themselves).
  const lines = text.split('\n')
  const nodes = []
  let current = null

  for (const line of lines) {
    const nodeHeading = line.match(/^###\s+(\S+)\s*$/)
    if (nodeHeading) {
      if (current) nodes.push(current)
      current = { id: nodeHeading[1], fields: {}, raw: [] }
      continue
    }
    if (!current) continue
    current.raw.push(line)

    let matchedField = null
    for (const name of FIELD_NAMES) {
      if (line.startsWith(name + ':')) {
        matchedField = name
        break
      }
    }
    if (matchedField) {
      current.fields[matchedField] = line.slice(matchedField.length + 1).trim()
    }
  }
  if (current) nodes.push(current)
  return nodes
}

export function buildGraph(nodes) {
  const byId = new Map()
  for (const n of nodes) {
    const category = (n.fields['Category'] || '').trim()
    const requiredPrereqs = parseListField(n.fields['Required prerequisites'] || '[]')
    const buildsToward = parseListField(n.fields['Builds toward'] || '[]')
    const usedByRaw = n.fields['Used by (track/)'] || ''
    const usedByLessons = parseUsedBy(usedByRaw)
    byId.set(n.id, {
      id: n.id,
      preferredName: n.fields['Preferred Name'] || '',
      definition: n.fields['Definition'] || '',
      firstNeededBecause: n.fields['First needed because'] || '',
      category,
      requiredPrereqs,
      buildsToward,
      usedByRaw,
      usedByLessons: [...new Set(usedByLessons)].sort((a, b) => a - b),
    })
  }
  return byId
}

// Finds the parenthetical annotation (if any) attached to a specific
// lesson number inside a raw "Used by (track/)" field, e.g. for
// "Lesson 1 (sighted only), Lesson 2" and introducedAt=1, returns
// "(sighted only)". Used to distinguish a lesson that fully introduces a
// concept from one that only assumes or briefly sights it.
export function parseIntroductionAnnotation(usedByRaw, introducedAt) {
  const chunks = usedByRaw.split(',').map((s) => s.trim())
  for (const chunk of chunks) {
    const m = chunk.match(/Lesson\s+(\d+)\s*(\(.*\))?/)
    if (m && Number(m[1]) === introducedAt) {
      return m[2] || null
    }
  }
  return null
}
