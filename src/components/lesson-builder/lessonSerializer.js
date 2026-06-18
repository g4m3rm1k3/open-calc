import { HANDLED_SECTION_KEYS, childrenToVizs } from './builderUtils.js'

function fmtValue(v, depth = 1) {
  const pad = '  '.repeat(depth)
  const innerPad = '  '.repeat(depth + 1)

  if (v === null || v === undefined) return 'null'
  if (typeof v === 'string') return JSON.stringify(v)
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)

  if (Array.isArray(v)) {
    if (v.length === 0) return '[]'
    if (v.every(x => typeof x === 'string' || typeof x === 'number')) {
      const inline = '[' + v.map(x => JSON.stringify(x)).join(', ') + ']'
      if (inline.length < 72) return inline
    }
    const items = v.map(x => innerPad + fmtValue(x, depth + 1))
    return '[\n' + items.join(',\n') + ',\n' + pad + ']'
  }

  if (typeof v === 'object') {
    const entries = Object.entries(v).filter(([, val]) => val !== undefined && val !== null)
    if (entries.length === 0) return '{}'
    const lines = entries.map(([k, val]) => innerPad + k + ': ' + fmtValue(val, depth + 1))
    return '{\n' + lines.join(',\n') + ',\n' + pad + '}'
  }

  return String(v)
}

// Build the final lesson object by overlaying edited state onto the original (_raw).
// Fields the builder explicitly edits are taken from state; everything else passes
// through from _raw unchanged — so no field is ever silently dropped.
export function serializeLesson(state) {
  const { meta, hook, sections, _raw } = state

  // Start from raw if available, otherwise from an empty base
  const base = _raw ? { ..._raw } : {}

  // Overlay meta fields
  base.id             = meta.id
  base.slug           = meta.slug
  base.chapter        = meta.chapter
  base.order          = Number(meta.order) || 1
  base.title          = meta.title
  base.subtitle       = meta.subtitle
  base.tags           = meta.tags ?? []
  if (meta.aliases)    base.aliases = meta.aliases
  else if (_raw?.aliases !== undefined) delete base.aliases  // removed
  base.coreConcept    = meta.coreConcept
  base.prerequisites  = meta.prerequisites ?? []
  base.timeToComplete = Number(meta.timeToComplete) || 15
  if (meta.nextLesson) base.nextLesson = meta.nextLesson
  else if (_raw?.nextLesson !== undefined) delete base.nextLesson

  // Overlay hook
  base.hook = {
    question: hook.question,
    realWorldContext: hook.realWorldContext,
    ...(hook.previewVisualizationId ? { previewVisualizationId: hook.previewVisualizationId } : {}),
  }
  // Preserve any extra hook fields from raw (visualizations, etc.)
  if (_raw?.hook) {
    for (const [k, v] of Object.entries(_raw.hook)) {
      if (!(k in base.hook)) base.hook[k] = v
    }
  }

  // Use the original key (for python variants) to decide what to delete/overlay.
  // sec._origKey is set for PythonNotebook / notebooks / pythonLab variants.
  const presentOrigKeys = new Set(sections.map(s => s._origKey ?? s.type))

  // Remove keys for section types the builder owns but that the user has removed
  for (const key of HANDLED_SECTION_KEYS) {
    if (presentOrigKeys.has(key)) continue
    if (key === 'notebooks') {
      // 'notebooks' is a nested object — only remove the python sub-key
      if (base.notebooks?.python) {
        const { python: _p, ...rest } = base.notebooks
        if (Object.keys(rest).length > 0) base.notebooks = rest
        else delete base.notebooks
      }
    } else {
      delete base[key]
    }
  }

  // Overlay each section the user has edited.
  // For object-valued sections (intuition, math, rigor), spread the original first so
  // any sub-fields the builder doesn't edit (e.g. visualizations, extra callout types)
  // are preserved verbatim.
  for (const sec of sections) {
    if (sec.type === 'intuition' || sec.type === 'rigor') {
      base[sec.type] = {
        ...(_raw?.[sec.type] ?? {}),
        prose: sec.prose ?? [],
        callouts: sec.callouts ?? [],
        visualizations: childrenToVizs(sec.children),
      }
    } else if (sec.type === 'math') {
      base.math = {
        ...(_raw?.math ?? {}),
        prose: sec.prose ?? [],
        equations: sec.equations ?? [],
        visualizations: childrenToVizs(sec.children),
      }
    } else if (sec.type === 'examples') {
      base.examples = sec.items ?? []
    } else if (sec.type === 'challenges') {
      base.challenges = sec.items ?? []
    } else if (sec.type === 'checkpoints') {
      base.checkpoints = sec.items ?? []
    } else if (sec.type === 'quiz') {
      base.quiz = sec.items ?? []
    } else if (sec.type === 'python') {
      const origKey = sec._origKey ?? 'python'
      if (origKey === 'notebooks') {
        base.notebooks = { ...(_raw?.notebooks ?? {}), python: { ...(_raw?.notebooks?.python ?? {}), cells: sec.cells ?? [] } }
      } else if (origKey === 'pythonLab') {
        base.pythonLab = { ...(_raw?.pythonLab ?? {}), cells: sec.cells ?? [] }
      } else {
        // 'python' or 'PythonNotebook'
        base[origKey] = { ...(_raw?.[origKey] ?? {}), cells: sec.cells ?? [] }
      }
    }
  }

  // Remove internal builder-only keys
  delete base._raw
  delete base._chapterId
  delete base._lessonSlug

  const lines = Object.entries(base).map(([k, v]) => `  ${k}: ${fmtValue(v, 1)}`)
  return `export default {\n${lines.join(',\n\n')},\n}\n`
}

export function getFilePath(state) {
  const { meta, _chapterId, _lessonSlug } = state
  const courseId = (_chapterId || meta.chapter || 'unknown').replace(/-\d+$/, '')
  const chNum = (_chapterId?.match(/-(\d+)$/) ?? [])[1] ?? '?'
  const order = String(Number(meta.order) || 1).padStart(3, '0')
  const slug = meta.slug || _lessonSlug || 'new-lesson'
  return `src/courses/${courseId}/[${chNum}-chapter-folder]/${order}-${slug}.js`
}
