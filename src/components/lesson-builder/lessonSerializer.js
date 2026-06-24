import { HANDLED_SECTION_KEYS, childrenToVizs, stateToBlocks } from './builderUtils.js'

// Deterministic identifier for a diagram import, matching the hand-authored
// convention (e.g. '../diagrams/la-drone-displacement.svg' -> 'laDroneDisplacementUrl').
function pathToImportName(path) {
  const base = (path.split('/').pop() ?? path).replace(/\.svg$/i, '')
  const camel = base.replace(/[-_]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase())
  return camel.charAt(0).toLowerCase() + camel.slice(1) + 'Url'
}

// Walk the built lesson object collecting every { __importRef, path }
// marker (see builderUtils.js stateToBlocks) into path -> identifier,
// de-duplicated by path so re-used diagrams don't get re-imported.
function collectImports(v, importsMap) {
  if (v === null || typeof v !== 'object') return
  if (v.__importRef) {
    if (v.path && !importsMap.has(v.path)) importsMap.set(v.path, pathToImportName(v.path))
    return
  }
  if (Array.isArray(v)) { v.forEach(x => collectImports(x, importsMap)); return }
  for (const val of Object.values(v)) collectImports(val, importsMap)
}

function fmtValue(v, depth = 1, importsMap = new Map()) {
  const pad = '  '.repeat(depth)
  const innerPad = '  '.repeat(depth + 1)

  if (v === null || v === undefined) return 'null'
  if (typeof v === 'object' && v.__importRef) {
    return v.path ? (importsMap.get(v.path) ?? 'undefined /* missing diagram path */') : 'undefined /* no diagram path set */'
  }
  if (typeof v === 'string') return JSON.stringify(v)
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)

  if (Array.isArray(v)) {
    if (v.length === 0) return '[]'
    if (v.every(x => typeof x === 'string' || typeof x === 'number')) {
      const inline = '[' + v.map(x => JSON.stringify(x)).join(', ') + ']'
      if (inline.length < 72) return inline
    }
    const items = v.map(x => innerPad + fmtValue(x, depth + 1, importsMap))
    return '[\n' + items.join(',\n') + ',\n' + pad + ']'
  }

  if (typeof v === 'object') {
    const entries = Object.entries(v).filter(([, val]) => val !== undefined && val !== null)
    if (entries.length === 0) return '{}'
    const lines = entries.map(([k, val]) => innerPad + k + ': ' + fmtValue(val, depth + 1, importsMap))
    return '{\n' + lines.join(',\n') + ',\n' + pad + '}'
  }

  return String(v)
}

// Build the final lesson object by overlaying edited state onto the original (_raw).
// Fields the builder explicitly edits are taken from state; everything else passes
// through from _raw unchanged — so no field is ever silently dropped.
// Exported separately from serializeLesson() so callers that need the actual
// object (e.g. running it through checkLessonLatex before submitting a
// contribution) don't have to re-parse the generated source string.
export function buildLessonObject(state) {
  const { meta, hook, mentalModel, sections, _raw, _oldFormat } = state

  // Start from raw if available, otherwise from an empty base
  const base = _raw ? { ..._raw } : {}

  if (_oldFormat) {
    // Old-format lesson (const NAME = { subject, sequential, cells }).
    // Only update the fields the user can actually edit in the builder.
    // Everything else stays exactly as it was in _raw — no new-format
    // fields (id, slug, chapter, tags, hook, etc.) get injected.
    base.title = meta.title
    if (meta.subtitle) base.subtitle = meta.subtitle
  } else {
    // New-format lesson: overlay all meta fields
    base.id             = meta.id
    base.slug           = meta.slug
    base.chapter        = meta.chapter
    base.order          = Number(meta.order) || 1
    base.title          = meta.title
    base.subtitle       = meta.subtitle
    base.tags           = meta.tags ?? []
    if (meta.aliases)    base.aliases = meta.aliases
    else if (_raw?.aliases !== undefined) delete base.aliases
    base.coreConcept    = meta.coreConcept
    base.prerequisites  = meta.prerequisites ?? []
    base.timeToComplete = Number(meta.timeToComplete) || 15
    if (meta.nextLesson) base.nextLesson = meta.nextLesson
    else if (_raw?.nextLesson !== undefined) delete base.nextLesson
  }

  // Old-format lessons don't have hook/mentalModel — skip them entirely
  if (_oldFormat) {
    delete base._raw
    delete base._chapterId
    delete base._lessonSlug
    return base
  }

  // Overlay hook — some lessons have hook as a plain string instead of the
  // {question, realWorldContext, previewVisualizationId} shape (see
  // lessonToState's _legacyString handling). If it's untouched, round-trip
  // it back exactly as the original string rather than promoting it to the
  // object shape just because the builder opened the lesson.
  if (hook._legacyString && hook.question === _raw?.hook && !hook.realWorldContext && !hook.previewVisualizationId) {
    base.hook = _raw.hook
  } else {
    base.hook = {
      question: hook.question,
      realWorldContext: hook.realWorldContext,
      ...(hook.previewVisualizationId ? { previewVisualizationId: hook.previewVisualizationId } : {}),
    }
    // Preserve any extra hook fields from raw (visualizations, etc.) — only
    // when _raw.hook is actually an object. Object.entries on a STRING
    // iterates character-by-character (each index becomes a "key"), which
    // used to corrupt base.hook with one property per character whenever
    // the original hook was a plain string.
    if (_raw?.hook && typeof _raw.hook === 'object') {
      for (const [k, v] of Object.entries(_raw.hook)) {
        if (!(k in base.hook)) base.hook[k] = v
      }
    }
  }

  // Overlay mentalModel (array of strings) — omit the key entirely if empty,
  // same delete-if-empty convention as aliases/nextLesson above.
  if (mentalModel?.length) base.mentalModel = mentalModel
  else if (_raw?.mentalModel !== undefined) delete base.mentalModel

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
      if (Array.isArray(sec.blocks)) {
        // blocks[] mode (prose+image pattern) supersedes prose/visualizations —
        // both are dropped so MicroCycleLesson.jsx doesn't have a stale prose[]
        // sitting unused alongside the real blocks[] content.
        const { prose: _prose, visualizations: _viz, ...rest } = _raw?.[sec.type] ?? {}
        base[sec.type] = {
          ...rest,
          blocks: stateToBlocks(sec.blocks),
          callouts: sec.callouts ?? [],
        }
      } else {
        base[sec.type] = {
          ...(_raw?.[sec.type] ?? {}),
          prose: sec.prose ?? [],
          callouts: sec.callouts ?? [],
          visualizations: childrenToVizs(sec.children),
        }
        delete base[sec.type].blocks
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
    } else if (sec.type === 'walkthroughs') {
      base.walkthroughs = sec.items ?? []
    } else if (sec.type === 'cells') {
      // Image cells store their import path separately (_importPath) so the
      // serializer can output the correct `import X from '...?url'` identifier
      // rather than the runtime-resolved URL string the dynamic import produced.
      base.cells = (sec.cells ?? []).map(cell => {
        if (cell.type === 'image' && cell._importPath) {
          const { _importPath, src: _resolvedSrc, ...rest } = cell
          return { ...rest, src: { __importRef: true, path: _importPath } }
        }
        return cell
      })
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

  return base
}

export function serializeLesson(state) {
  const { _oldFormat, _varName } = state
  const base = buildLessonObject(state)
  const importsMap = new Map()
  collectImports(base, importsMap)
  const importLines = [...importsMap.entries()]
    .map(([path, name]) => `import ${name} from '${path}?url'`)
  const lines = Object.entries(base).map(([k, v]) => `  ${k}: ${fmtValue(v, 1, importsMap)}`)
  const importBlock = importLines.length ? importLines.join('\n') + '\n\n' : ''

  if (_oldFormat && _varName) {
    return `${importBlock}const ${_varName} = {\n${lines.join(',\n\n')},\n};\n\nexport { ${_varName} };\n`
  }
  return `${importBlock}export default {\n${lines.join(',\n\n')},\n}\n`
}

export function getFilePath(state) {
  const { meta, _chapterId, _lessonSlug } = state
  const courseId = (_chapterId || meta.chapter || 'unknown').replace(/-\d+$/, '')
  const chNum = (_chapterId?.match(/-(\d+)$/) ?? [])[1] ?? '?'
  const order = String(Number(meta.order) || 1).padStart(3, '0')
  const slug = meta.slug || _lessonSlug || 'new-lesson'
  return `src/courses/${courseId}/[${chNum}-chapter-folder]/${order}-${slug}.js`
}
