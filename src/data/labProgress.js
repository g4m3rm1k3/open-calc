// Progress signals for labs that do NOT write into oc-progress (see
// useProgress/ProgressContext.jsx) — each of these keeps its own,
// independent localStorage key. This module reads those keys directly and
// normalizes them into the same {kind:'lab', key, differentiator} shape
// HomePage.jsx already uses for courses, so both can share one "In Progress"
// grid via TopicTable's existing LABS-registry lookup (src/labs/labRegistryLoader.js).
//
// Scope note: this covers the 4 labs with an unambiguous total count and
// completion signal today. Several other labs (css-mastery, react-mastery,
// dsa-patterns, sicp-js, ts-lab, openmat) only track a per-lesson "last
// position" cache with no single total/done-list to read cleanly — left out
// for now rather than guessing at their numbers.

import { SERIES } from '../labs/lesson-engine/series.ts'
import { MILESTONES } from '../labs/vue-studio/milestones/index.js'
import { LESSONS as BACKEND_LESSONS } from '../labs/backend-lab/lessons/index.ts'

function safeParse(raw, fallback) {
  if (raw == null) return fallback
  try { return JSON.parse(raw) } catch { return fallback }
}

// Robot Arm Simulator's MISSIONS array lives inline in RobotArmLab.jsx and
// isn't exported — 19 is the count topicGroups.js's own description quotes
// ("19 missions on a 2D and 6-DOF 3D arm"), kept here as a single source
// rather than parsing that 3800+ line file just for a length.
const ROBOT_ARM_MISSION_COUNT = 19

function lessonEngineEntry() {
  const completed = safeParse(localStorage.getItem('oc-lesson-progress'), [])
  const total = SERIES.reduce((n, s) => n + s.levels.length, 0)
  const done = Array.isArray(completed) ? completed.length : 0
  if (done === 0 || done >= total || total === 0) return null
  return { key: 'lesson-engine', done, total, noun: 'levels' }
}

function vueStudioEntry() {
  const idxRaw = localStorage.getItem('vue-studio-v3:milestone-idx')
  const idx = idxRaw == null ? -1 : parseInt(idxRaw, 10)
  const total = MILESTONES.length
  const done = Number.isFinite(idx) ? Math.min(total, Math.max(0, idx + 1)) : 0
  if (done === 0 || done >= total || total === 0) return null
  return { key: 'vue-studio', done, total, noun: 'milestones' }
}

function robotArmEntry() {
  const completed = safeParse(localStorage.getItem('rfl-completed-v2'), [])
  const done = Array.isArray(completed) ? completed.length : 0
  const total = ROBOT_ARM_MISSION_COUNT
  if (done === 0 || done >= total) return null
  return { key: 'robot-arm-sim', done, total, noun: 'missions' }
}

// Backend Lab has no explicit "completed" flag — activeLessonId (last lesson
// opened) is the closest honest proxy: furthest lesson reached / total.
function backendLabEntry() {
  const data = safeParse(localStorage.getItem('oc-backend-lab'), null)
  const activeId = data?.activeLessonId
  const idx = BACKEND_LESSONS.findIndex(l => l.id === activeId)
  const total = BACKEND_LESSONS.length
  const done = idx >= 0 ? idx + 1 : 0
  if (done === 0 || done >= total || total === 0) return null
  return { key: 'backend-lab', done, total, noun: 'lessons' }
}

/** In-progress (started, not finished) entries for labs outside oc-progress,
 *  in the {kind:'lab', key, differentiator} shape TopicTable/resolveEntry
 *  expects — differentiator overrides the card's normal description with a
 *  live "N of M done" readout. */
export function getLabInProgressItems() {
  return [lessonEngineEntry(), vueStudioEntry(), robotArmEntry(), backendLabEntry()]
    .filter(Boolean)
    .map(({ key, done, total, noun }) => ({
      kind: 'lab',
      key,
      differentiator: `${done} of ${total} ${noun} complete — continue where you left off.`,
    }))
}
