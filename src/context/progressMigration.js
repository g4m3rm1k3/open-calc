// Builds the stable progress key for a lesson object that has an `id` field
// (e.g. from courseLoader.js's getChapters()/getAllChapters(), which now
// includes it). Falls back to the old route-derived shape only if `id` is
// somehow missing — shouldn't happen (every real lesson file has one,
// confirmed), but better than producing an unusable key.
export function buildProgressKey(courseId, lesson) {
  return lesson?.id ? `${courseId}::${lesson.id}` : `${courseId}/${lesson?.slug ?? ''}`
}

// Pure, side-effect-free progress merge/migration logic — shared by
// AuthContext.jsx (sign-in conflict resolution) and ProgressContext.jsx
// (one-time old-key migration), and unit-tested directly in
// progressMigration.test.js without needing to import Firebase or mount a
// React context.

// Course progress is accumulative — checkpoints are never un-done. Union
// both versions so no work is ever lost, regardless of which device/key was
// newer. Operates on whole `{ [lessonKey]: {...} }` dictionaries.
export function mergeProgress(local, remote) {
  if (!local && !remote) return null
  if (!local) return remote
  if (!remote) return local
  const merged = { ...remote }
  for (const [id, localLesson] of Object.entries(local)) {
    if (!merged[id]) {
      merged[id] = localLesson
      continue
    }
    const r = merged[id]
    merged[id] = {
      ...r,
      completedCheckpoints: [
        ...new Set([...(r.completedCheckpoints ?? []), ...(localLesson.completedCheckpoints ?? [])]),
      ],
      readingProgress: Math.max(r.readingProgress ?? 0, localLesson.readingProgress ?? 0),
      // Keep whichever quiz attempt is more recent
      quiz: ((localLesson.quiz?.attemptedAt ?? 0) > (r.quiz?.attemptedAt ?? 0))
        ? localLesson.quiz
        : r.quiz,
    }
  }
  return merged
}

// Progress used to be keyed "<courseId>/<slug>" — built entirely from the
// URL (folder/file names), so renaming a lesson file silently orphaned every
// existing user's progress for it (confirmed real incident: the
// ai-engineering course rename). The new key is "<courseId>::<lesson.id>",
// namespaced by course because lesson ids are NOT globally unique (confirmed
// real collisions, e.g. "ch3-001" exists in both calculus and precalculus).
//
// This migrates every old-format entry it can resolve via idLookup (built by
// courseLoader.js's getLessonIdLookup(), mapping "<courseId>/<slug>" -> id),
// merging into any existing new-format entry for the same lesson rather than
// overwriting it. Entries it can't resolve (lesson genuinely gone, or
// already-unrecognized key shapes) are left untouched — never dropped.
export function migrateOldProgressKeys(progress, idLookup) {
  if (!progress) return { migrated: progress, changed: false }
  let changed = false
  let result = {}

  // Carry forward everything already in the new format first.
  for (const [key, value] of Object.entries(progress)) {
    if (key.includes('::')) result[key] = value
  }

  // Migrate old-format ("<courseId>/<slug>") entries, merging into whatever
  // is already at the destination key (from the pass above, or from an
  // earlier old-format entry that mapped to the same lesson).
  for (const [key, value] of Object.entries(progress)) {
    if (key.includes('::')) continue
    const slashIdx = key.indexOf('/')
    if (slashIdx === -1) { result[key] = value; continue } // unrecognized shape — leave alone
    const courseId = key.slice(0, slashIdx)
    const slug = key.slice(slashIdx + 1)
    const id = idLookup[`${courseId}/${slug}`]
    if (!id) { result[key] = value; continue } // can't resolve — leave the old entry alone, don't drop it
    const newKey = `${courseId}::${id}`
    changed = true
    result = mergeProgress({ [newKey]: value }, result)
  }

  return { migrated: result, changed }
}

// ── Generic sync-key merge strategies ───────────────────────────────────────
// Used by AuthContext.jsx's syncOnSignIn() for every SYNC_KEY except
// oc-progress (which uses mergeProgress above) — replaces a blind
// "if remote is newer, overwrite local" with something that can't drop data
// silently. None of these have per-entry timestamps today, so a same-key
// edited-differently-on-both-sides conflict can't be perfectly resolved —
// but nothing is ever discarded outright, only (rarely) shadowed, which is
// a real improvement over a full-object overwrite.

// Array of plain values or ids (pinned videos, completed mission ids) —
// union, order doesn't matter for this kind of data.
export function mergeArrayUnion(local, remote) {
  if (!Array.isArray(local)) return remote ?? []
  if (!Array.isArray(remote)) return local ?? []
  return [...new Set([...remote, ...local])]
}

// Array of rich objects identified by an `id` field (pinned lessons/tools —
// confirmed `{id, title, subtitle, path}` in PinsContext.jsx). A plain Set
// union doesn't dedupe these — two different object instances with the same
// id are never === each other — so dedupe by id explicitly instead.
export function mergeArrayUnionById(local, remote, idKey = 'id') {
  if (!Array.isArray(local)) return remote ?? []
  if (!Array.isArray(remote)) return local ?? []
  const seen = new Set()
  const merged = []
  for (const item of [...remote, ...local]) {
    const key = item?.[idKey]
    if (key != null && seen.has(key)) continue
    if (key != null) seen.add(key)
    merged.push(item)
  }
  return merged
}

// Flat keyed object with no per-entry timestamp (formula memory, calendar
// events keyed by id, etc.) — union of keys; local's value wins for a key
// present on both sides (this IS the device currently being synced from,
// the more defensible default without real timestamps to compare).
export function mergeKeyedObject(local, remote) {
  // typeof [] === 'object' too — explicitly excluded, since spreading an
  // array as if it were a plain object would silently destroy its array-ness
  // (it'd become a {0: x, 1: y, ...}-shaped plain object instead). Safer to
  // just fall back to one side than risk corrupting a shape mismatch.
  const isPlainObject = v => v && typeof v === 'object' && !Array.isArray(v)
  if (!isPlainObject(local)) return remote ?? {}
  if (!isPlainObject(remote)) return local ?? {}
  return { ...remote, ...local }
}

// Flat keyed object of numbers where "higher is better" and should never
// regress (e.g. video-watch-percent — the existing player code already
// refuses to downgrade progress on rewind, so a plain key-union "local
// wins" merge would wrongly undo that the moment a behind-device synced).
export function mergeMaxNumericObject(local, remote) {
  if (!local || typeof local !== 'object') return remote ?? {}
  if (!remote || typeof remote !== 'object') return local ?? {}
  const merged = { ...remote }
  for (const [key, val] of Object.entries(local)) {
    merged[key] = Math.max(Number(val) || 0, Number(merged[key]) || 0)
  }
  return merged
}

// oc-calendar's real shape (confirmed in NavClock.jsx) is `{ events: [...],
// ...other config }` — events is a nested ARRAY, not a flat key-union target.
// A plain mergeKeyedObject would let local's whole `events` array silently
// shadow remote's. Union the events specifically (by id if present,
// otherwise fall back to whichever side has more — never drops events).
export function mergeCalendarData(local, remote) {
  const isPlainObject = v => v && typeof v === 'object' && !Array.isArray(v)
  if (!isPlainObject(local)) return remote ?? {}
  if (!isPlainObject(remote)) return local ?? {}
  const merged = { ...remote, ...local }
  if (Array.isArray(local.events) || Array.isArray(remote.events)) {
    merged.events = mergeArrayUnionById(local.events ?? [], remote.events ?? [])
  }
  return merged
}

// One level deeper than mergeKeyedObject — for shapes like CNC tool
// libraries (`{ mill: {toolNum: {...}}, lathe: {toolNum: {...}} }`): merge
// each top-level group's own keys, instead of one side's whole "mill" group
// shadowing the other's entirely.
export function mergeNestedKeyedObject(local, remote) {
  if (!local || typeof local !== 'object') return remote ?? {}
  if (!remote || typeof remote !== 'object') return local ?? {}
  const merged = { ...remote }
  for (const [group, localGroup] of Object.entries(local)) {
    merged[group] = mergeKeyedObject(localGroup, merged[group])
  }
  return merged
}

// Per-SYNC_KEY merge strategy, keyed by the same localStorage key names
// AuthContext.jsx's SYNC_KEYS list uses. oc-progress is handled separately
// (mergeProgress, lesson-keyed with checkpoint-union semantics) since it
// needs different per-entry logic than a plain key/array union.
export const SYNC_MERGE_STRATEGIES = {
  'open-calc-pinned-videos': mergeArrayUnion,
  'open-calc-video-progress': mergeMaxNumericObject,
  'rfl-completed-v2': mergeArrayUnion,
  'oc_formulas': mergeKeyedObject,
  'cnc_tool_libraries_v1': mergeNestedKeyedObject,
  'oc-calendar': mergeCalendarData,
  'oc-pins': mergeArrayUnionById,
  'oc-health-v1': mergeKeyedObject,
  'oc-rpg-data': mergeKeyedObject,
  'oc-compass': mergeKeyedObject,
}
