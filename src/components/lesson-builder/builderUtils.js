let _counter = 0
export const newId = () => `blk-${Date.now()}-${_counter++}`

// Keys explicitly edited by the builder — everything else passes through from _raw unchanged
export const HANDLED_SECTION_KEYS = new Set([
  'intuition', 'math', 'rigor', 'examples', 'challenges', 'checkpoints', 'quiz',
  // All Python notebook variant keys
  'python', 'PythonNotebook', 'notebooks', 'pythonLab',
  // ScienceNotebook cell array
  'cells',
  // Guided walkthroughs
  'walkthroughs',
  // Semantic / pedagogical layers
  'semantics', 'spiral', 'assessment', 'misconceptions', 'transferPrompts', 'debugging', 'mastery',
])
export const HANDLED_META_KEYS = new Set(['id', 'slug', 'chapter', 'order', 'title', 'subtitle', 'tags', 'coreConcept', 'prerequisites', 'timeToComplete', 'aliases', 'nextLesson', 'mentalModel'])

export const SECTION_COLORS = {
  intuition:      'sky',
  rigor:          'teal',
  math:           'amber',
  examples:       'emerald',
  challenges:     'orange',
  walkthroughs:   'cyan',
  quiz:           'pink',
  checkpoints:    'lime',
  cells:          'violet',
  python:         'green',
  semantics:      'blue',
  spiral:         'rose',
  assessment:     'red',
  misconceptions: 'yellow',
  transferPrompts:'indigo',
  debugging:      'red',
  mastery:        'fuchsia',
}

export const PALETTE_BLOCKS = [
  { type: 'intuition',      label: 'Intuition',       icon: '🧠', desc: 'Prose + callouts explaining the core idea' },
  { type: 'math',           label: 'Math',            icon: '📐', desc: 'Formal math content with equations and callouts' },
  { type: 'rigor',          label: 'Rigor',           icon: '∴',  desc: 'Formal proof or rigorous derivation' },
  { type: 'examples',       label: 'Examples',        icon: '✏️', desc: 'Worked examples with step-by-step solutions' },
  { type: 'challenges',     label: 'Challenges',      icon: '🎯', desc: 'Practice problems with difficulty, answer, and walkthrough' },
  { type: 'checkpoints',    label: 'Checkpoints',     icon: '✅', desc: 'Progress tracking items' },
  { type: 'quiz',           label: 'Quiz',            icon: '🧪', desc: 'Multiple-choice quiz questions' },
  { type: 'python',         label: 'Python',          icon: '🐍', desc: 'Python notebook cells with runnable code' },
  { type: 'cells',          label: 'Cells',           icon: '⚗️', desc: 'ScienceNotebook cells (markdown, js, challenge, coding, walkthrough)' },
  { type: 'walkthroughs',   label: 'Walkthroughs',    icon: '🚶', desc: 'Step-by-step guided problem walkthroughs with LaTeX math' },
  { type: 'semantics',      label: 'Semantics',       icon: '🔣', desc: 'Core symbol definitions and rules of thumb' },
  { type: 'spiral',         label: 'Spiral',          icon: '🌀', desc: 'Recovery points (prerequisites) and future lesson links' },
  { type: 'assessment',     label: 'Assessment',      icon: '📋', desc: 'Standalone assessment questions (separate from the quiz)' },
  { type: 'misconceptions', label: 'Misconceptions',  icon: '⚠️', desc: 'Common false beliefs and how to correct them' },
  { type: 'transferPrompts',label: 'Transfer Prompts',icon: '🚀', desc: 'Situations where students must apply the concept to unfamiliar contexts' },
  { type: 'debugging',      label: 'Debugging',       icon: '🐛', desc: 'Common errors, symptoms, causes, and repair strategies' },
  { type: 'mastery',        label: 'Mastery',         icon: '🎓', desc: 'Target level and mastery criteria for this lesson' },
]

// Viz IDs that embed editable notebook cells inside initialProps.initialCells
// (vs props.initialCells which some older vizzes use).
const NOTEBOOK_VIZ_IDS = new Set(['PythonNotebook', 'OpenMatNotebook'])

// Convert lesson.*.visualizations array → builder children array
export function vizsToChildren(vizs) {
  return (vizs ?? []).map(viz => {
    // Cells can live in either initialProps.initialCells (LA-style) or
    // props.initialCells (older style). Extract them into _initialCells so
    // VisualizationBlock can edit them without touching the _rawViz structure.
    const _initialCells = NOTEBOOK_VIZ_IDS.has(viz.id)
      ? (viz.initialProps?.initialCells ?? viz.props?.initialCells ?? null)
      : null
    return {
      _id: newId(),
      type: 'visualization',
      vizId: viz.id ?? '',
      title: viz.title ?? '',
      caption: viz.caption ?? '',
      mathBridge: viz.mathBridge ?? '',
      props: viz.props ?? {},
      // _initialCells is null for non-notebook vizzes — undefined would be
      // ambiguous with "never had cells"; null means "notebook with 0 cells".
      ...(_initialCells !== null ? { _initialCells } : {}),
      // Preserve the full original so fields the builder doesn't edit (initialProps, etc.)
      // pass through unchanged on export. Never serialized — consumed only by childrenToVizs.
      _rawViz: viz,
    }
  })
}

// Convert builder children array → lesson.*.visualizations array
export function childrenToVizs(children) {
  return (children ?? []).map(child => {
    // Start from the full original viz so unrecognized fields (initialProps, etc.) survive.
    const v = { ...(child._rawViz ?? { id: child.vizId }) }
    v.id = child.vizId || v.id
    if (child.title) v.title = child.title; else delete v.title
    if (child.caption) v.caption = child.caption; else delete v.caption
    if (child.mathBridge) v.mathBridge = child.mathBridge; else delete v.mathBridge
    // Only write props when non-empty — don't inject {} when the source didn't have it
    if (child.props && Object.keys(child.props).length) v.props = child.props
    else delete v.props
    // Write edited notebook cells back to whichever key the original used
    if (child._initialCells !== undefined) {
      if (v.initialProps !== undefined) {
        v.initialProps = { ...v.initialProps, initialCells: child._initialCells }
      } else if (v.props !== undefined) {
        v.props = { ...v.props, initialCells: child._initialCells }
      }
    }
    return v
  })
}

// An image block's `src` is an imported identifier in the source file
// (`import droneDisplacementUrl from '../diagrams/foo.svg?url'`), but the
// evaluated lesson module only has the final resolved URL string — the
// import path is gone by then. Recover it from raw source text instead:
// find every `{ type: 'image', ..., src: <identifier> }` block and resolve
// <identifier> against the file's own `import X from 'PATH?url'` lines.
// Good enough for this codebase's consistent one-import-per-image style —
// not a real parser, just two regexes correlated by document order.
export function extractImageImports(sourceText) {
  if (!sourceText) return []
  const importMap = new Map()
  const importRe = /import\s+(\w+)\s+from\s+['"]([^'"]+?)\?url['"]/g
  let m
  while ((m = importRe.exec(sourceText))) importMap.set(m[1], m[2])

  const blockRe = /\{\s*type:\s*['"]image['"][^}]*?src:\s*(\w+)[^}]*?\}/g
  const results = []
  while ((m = blockRe.exec(sourceText))) {
    const identifier = m[1]
    results.push({ identifier, importPath: importMap.get(identifier) ?? '' })
  }
  return results
}

// Raw lesson blocks[] → builder state blocks[]. `imageImportQueue` is
// consumed in document order (shared across intuition + rigor, since
// that's the order they appear in the source file too).
export function blocksToState(blocks, imageImportQueue) {
  return (blocks ?? []).map(b => {
    const _id = newId()
    if (b.type === 'image') {
      const recovered = imageImportQueue.shift()
      return { _id, type: 'image', importPath: recovered?.importPath ?? '', _importIdentifier: recovered?.identifier ?? '', alt: b.alt ?? '', caption: b.caption ?? '', _previewSrc: b.src ?? '' }
    }
    if (b.type === 'prose') {
      // Some prose blocks store a single markdown string under `md` instead
      // of `paragraphs` (an array) — reading only `paragraphs` silently
      // discarded the entire block's text. Track which shape the original
      // used so it round-trips back the same way.
      if (b.paragraphs === undefined && typeof b.md === 'string') {
        return { _id, type: 'prose', paragraphs: [b.md], _proseKey: 'md' }
      }
      return { _id, type: 'prose', paragraphs: b.paragraphs ?? [] }
    }
    if (b.type === 'viz') {
      // Viz config lives under `props` in most lessons but `initialProps` in
      // others (the LA-style convention) — reading only `props` silently
      // dropped every initialProps-shaped config (confirmed in 65 real
      // lessons). Track which key the original used so it round-trips back
      // under the same name instead of always normalizing to `props`.
      const propsKey = b.props !== undefined ? 'props' : b.initialProps !== undefined ? 'initialProps' : 'props'
      return { _id, type: 'viz', vizId: b.id ?? '', title: b.title ?? '', caption: b.caption ?? '', mathBridge: b.mathBridge ?? '', props: b[propsKey] ?? {}, _propsKey: propsKey }
    }
    if (b.type === 'callout') {
      // Most callout blocks nest their content under `callout: {type, title,
      // body}`, but some are flat — {type:'callout', kind, title, body}
      // directly on the block. Reading only the nested shape silently
      // discarded the entire callout (title AND body) for the flat ones.
      if (b.callout === undefined && (b.kind !== undefined || b.title !== undefined || b.body !== undefined)) {
        return { _id, type: 'callout', calloutType: b.kind ?? 'insight', title: b.title ?? '', body: b.body ?? '', _calloutFlat: true }
      }
      return { _id, type: 'callout', calloutType: b.callout?.type ?? 'insight', title: b.callout?.title ?? '', body: b.callout?.body ?? '' }
    }
    // math / stepthrough / anything else the editor doesn't special-case —
    // preserved verbatim so re-export doesn't drop it, and still editable
    // as raw JSON (see GenericBlockEditor) rather than silently invisible.
    return { _id, type: b.type, _raw: b }
  })
}

// Builder state blocks[] → plain lesson blocks[] for export. Image blocks
// emit an __importRef marker instead of a real value — lessonSerializer's
// fmtValue() recognizes it and writes a bare identifier (not a string),
// plus collects the import line that needs to go at the top of the file.
export function stateToBlocks(blocks) {
  return (blocks ?? []).map(b => {
    if (b.type === 'image') {
      return { type: 'image', src: { __importRef: true, path: b.importPath, identifier: b._importIdentifier || '' }, alt: b.alt ?? '', caption: b.caption ?? '' }
    }
    if (b.type === 'prose') {
      if (b._proseKey === 'md') return { type: 'prose', md: (b.paragraphs ?? []).join('\n\n') }
      return { type: 'prose', paragraphs: b.paragraphs ?? [] }
    }
    if (b.type === 'viz') {
      const v = { type: 'viz', id: b.vizId }
      if (b.title)      v.title = b.title
      if (b.caption)    v.caption = b.caption
      if (b.mathBridge) v.mathBridge = b.mathBridge
      if (b.props && Object.keys(b.props).length) v[b._propsKey ?? 'props'] = b.props
      return v
    }
    if (b.type === 'callout') {
      if (b._calloutFlat) return { type: 'callout', kind: b.calloutType, title: b.title, body: b.body }
      return { type: 'callout', callout: { type: b.calloutType, title: b.title, body: b.body } }
    }
    return b._raw ?? b
  })
}

export function defaultSection(type) {
  const _id = newId()
  switch (type) {
    case 'intuition':
    case 'rigor':
      return { _id, type, prose: [''], callouts: [], children: [] }
    case 'math':
      return { _id, type, prose: [''], equations: [], children: [] }
    case 'examples':
      return { _id, type, items: [{ title: 'Example 1', problem: '', steps: [''], answer: '' }] }
    case 'challenges':
      return { _id, type, items: [{ title: 'Challenge 1', problem: '', hint: '' }] }
    case 'checkpoints':
      return { _id, type, items: [{ id: 'cp-1', label: 'Read this section', type: 'read' }] }
    case 'quiz':
      return { _id, type, items: [{ id: `q${Date.now()}`, type: 'choice', text: '', options: ['', '', '', ''], answer: '', hints: [], reviewSection: '' }] }
    case 'python':
      return { _id, type, cells: [{ id: 'py1', cellTitle: '', prose: '', code: '' }] }
    case 'cells':
      return { _id, type, cells: [{ type: 'markdown', instruction: '' }] }
    case 'walkthroughs':
      return { _id, type: 'walkthroughs', items: [] }
    case 'semantics':
      return { _id, type: 'semantics', core: [], rulesOfThumb: [] }
    case 'spiral':
      return { _id, type: 'spiral', recoveryPoints: [], futureLinks: [] }
    case 'assessment':
      return { _id, type: 'assessment', items: [] }
    case 'misconceptions':
      return { _id, type: 'misconceptions', items: [] }
    case 'transferPrompts':
      return { _id, type: 'transferPrompts', items: [] }
    case 'debugging':
      return { _id, type: 'debugging', items: [] }
    case 'mastery':
      return { _id, type: 'mastery', targetLevel: 1, solveIndependently: '', explainVerbally: '', detectIncorrectApplication: '', transferToUnfamiliar: '' }
    default:
      return { _id, type, prose: [] }
  }
}

export function lessonToState(lesson, chapterId, lessonSlug, sourceText = '') {
  const sections = []
  const add = (type, extra) => sections.push({ _id: newId(), type, ...extra })

  // Shared queue: image blocks are consumed in document order across
  // intuition then rigor, matching the order they appear in source.
  const imageImportQueue = extractImageImports(sourceText)

  // ScienceNotebook cells — map before old-format sections so they appear first.
  // For cells with { type: 'image', src: <identifier> }, the dynamic import resolves
  // the identifier to a URL string — recover the original import path from sourceText
  // so the serializer can round-trip the correct `import X from '...?url'` line.
  if (lesson.cells?.length) {
    const cells = lesson.cells.map(cell => {
      if (cell.type === 'image') {
        const r = imageImportQueue.shift()
        if (r?.importPath) return { ...cell, _importPath: r.importPath, _importIdentifier: r.identifier ?? '' }
      }
      return cell
    })
    add('cells', { cells })
  }

  // Intuition / Rigor: blocks[] (new prose+image pattern) takes priority
  // over the legacy prose[]/callouts[]/visualizations[] shape when present.
  // Detect on ANY of those three sub-fields, not just .prose — a section
  // that's purely visual (visualizations but no prose text) used to fail
  // this check entirely, so the whole section (including its visualizations)
  // got deleted as "removed by user" on every save, even with zero edits.
  if (lesson.intuition?.blocks?.length) {
    add('intuition', { blocks: blocksToState(lesson.intuition.blocks, imageImportQueue), callouts: lesson.intuition.callouts ?? [] })
  } else if (lesson.intuition?.prose || lesson.intuition?.callouts?.length || lesson.intuition?.visualizations?.length) {
    add('intuition', { prose: lesson.intuition.prose ?? [], callouts: lesson.intuition.callouts ?? [], children: vizsToChildren(lesson.intuition.visualizations) })
  }
  if (lesson.math)      add('math',      { prose: lesson.math.prose ?? [], equations: lesson.math.equations ?? [], callouts: lesson.math.callouts ?? [], children: vizsToChildren(lesson.math.visualizations) })
  if (lesson.rigor?.blocks?.length) {
    add('rigor', { blocks: blocksToState(lesson.rigor.blocks, imageImportQueue), callouts: lesson.rigor.callouts ?? [] })
  } else if (lesson.rigor?.prose || lesson.rigor?.callouts?.length || lesson.rigor?.visualizations?.length) {
    add('rigor', { prose: lesson.rigor.prose ?? [], callouts: lesson.rigor.callouts ?? [], children: vizsToChildren(lesson.rigor.visualizations) })
  }
  // Pass examples through verbatim — don't synthesize a steps:[] field for
  // items that never had one. ExamplesBlock.jsx already reads `ex.steps ?? []`
  // defensively wherever it renders, so this is safe; writing it unconditionally
  // here previously added a spurious empty array to ~260 lessons.
  if (lesson.examples?.length) add('examples', { items: lesson.examples })
  if (lesson.challenges?.length)  add('challenges',  { items: lesson.challenges })
  if (lesson.checkpoints?.length) add('checkpoints', { items: lesson.checkpoints })
  if (lesson.quiz?.length)        add('quiz',        { items: lesson.quiz })

  // Python notebooks — four possible field shapes across the codebase
  if (lesson.walkthroughs?.length) add('walkthroughs', { items: lesson.walkthroughs })

  if (lesson.python?.cells?.length)
    add('python', { cells: lesson.python.cells })
  else if (lesson.PythonNotebook?.cells?.length)
    add('python', { cells: lesson.PythonNotebook.cells, _origKey: 'PythonNotebook' })
  else if (lesson.notebooks?.python?.cells?.length)
    add('python', { cells: lesson.notebooks.python.cells, _origKey: 'notebooks' })
  else if (lesson.pythonLab?.cells?.length)
    add('python', { cells: lesson.pythonLab.cells, _origKey: 'pythonLab' })

  // Semantic / pedagogical layers
  if (lesson.semantics)                      add('semantics',       { core: lesson.semantics.core ?? [], rulesOfThumb: lesson.semantics.rulesOfThumb ?? [] })
  if (lesson.spiral)                         add('spiral',          { recoveryPoints: lesson.spiral.recoveryPoints ?? [], futureLinks: lesson.spiral.futureLinks ?? [] })
  // assessment is usually {questions:[...]}, but some lessons store it as a
  // bare array, or even a plain string (a single free-text prompt — e.g.
  // src/courses/linear-algebra/10-advanced-theory/001-dual-spaces.js). Reading
  // .questions off either of those silently produced items:[], discarding the
  // real content. The builder only has UI for the {questions} shape, so for
  // the other two, leave it out of `sections` entirely — _unrecognizedKeys
  // below stops the serializer from deleting it as a result.
  if (Array.isArray(lesson.assessment?.questions))
    add('assessment', { items: lesson.assessment.questions })
  if (lesson.misconceptions?.length)         add('misconceptions',  { items: lesson.misconceptions })
  if (lesson.transferPrompts?.length)        add('transferPrompts', { items: lesson.transferPrompts })
  if (lesson.debugging?.length)              add('debugging',       { items: lesson.debugging })
  if (lesson.mastery)                        add('mastery',         {
    // Leave targetLevel undefined when absent rather than defaulting to 1 —
    // MasteryBlock.jsx already renders/edits it safely either way (`?? 1` at
    // display time), and defaulting here meant the serializer's `!= null`
    // presence check could never see "this lesson never set a target level".
    targetLevel:               lesson.mastery.targetLevel,
    solveIndependently:        lesson.mastery.solveIndependently ?? '',
    explainVerbally:           lesson.mastery.explainVerbally ?? '',
    detectIncorrectApplication: lesson.mastery.detectIncorrectApplication ?? '',
    transferToUnfamiliar:      lesson.mastery.transferToUnfamiliar ?? '',
  })

  // Safety net: any key the builder normally owns (HANDLED_SECTION_KEYS) that's
  // actually present on the raw lesson but didn't get turned into a section
  // above — because its value didn't match the shape that key's `if` check
  // expects (e.g. assessment-as-a-string, or some future surprise) — gets
  // listed here so the serializer below knows to leave it completely alone
  // instead of deleting it as "removed by the user".
  const _handledOrigKeys = new Set(sections.map(s => s._origKey ?? s.type))
  const _unrecognizedKeys = [...HANDLED_SECTION_KEYS].filter(key => {
    if (_handledOrigKeys.has(key)) return false
    if (key === 'notebooks') return lesson.notebooks !== undefined
    return lesson[key] !== undefined
  })

  // Detect old-format lessons: they have subject/sequential but no id/slug/chapter.
  // Store the const variable name so the serializer can round-trip the exact same wrapper.
  const _oldFormat = !lesson.id && !lesson.slug && !!(lesson.subject || lesson.sequential != null)
  const _varName = sourceText.match(/\bconst\s+([A-Z_][A-Z0-9_]*)\s*=\s*\{/)?.[1] ?? null

  // Neither the recognized old format nor the standard one (has id or slug) —
  // surfaced in the builder UI so edits to a genuinely unrecognized shape get a
  // visible warning instead of silently being treated as "standard" and risking
  // fields the new-format overlay doesn't know to preserve.
  const _format = _oldFormat ? 'old-sequential' : (lesson.id || lesson.slug) ? 'standard' : 'unknown'

  const derivedChapter = (chapterId ?? '').replace(/-\d+$/, '')

  return {
    meta: {
      id: lesson.id ?? '',
      slug: lesson.slug ?? lessonSlug ?? '',
      chapter: lesson.chapter ?? derivedChapter,
      order: lesson.order ?? 1,
      title: lesson.title ?? '',
      subtitle: lesson.subtitle ?? '',
      tags: lesson.tags ?? [],
      aliases: lesson.aliases ?? '',
      coreConcept: lesson.coreConcept ?? '',
      prerequisites: lesson.prerequisites ?? [],
      timeToComplete: lesson.timeToComplete ?? 15,
      nextLesson: lesson.nextLesson ?? '',
    },
    // Most lessons have hook as {question, realWorldContext, previewVisualizationId},
    // but some (e.g. src/courses/sql/1-sql-zero-to-mastery/001-what-is-data.js)
    // have it as a plain string. Reading .question off a string silently
    // returns undefined for every field — the original text would vanish the
    // instant this lesson got saved. Treat the whole string as the question
    // instead, and flag it as legacy so the serializer can round-trip it back
    // to a plain string unless the user actually edits the hook.
    //
    // A third real shape (14 lessons in the corpus as of this writing, e.g.
    // src/courses/geometry/3-geometry-3/005-midpoint-section.js): no `hook`
    // field at all. Without `_hadHook`, buildLessonObject would inject a
    // brand-new empty hook object on save even with zero edits.
    hook: typeof lesson.hook === 'string'
      ? { question: lesson.hook, realWorldContext: '', previewVisualizationId: '', _legacyString: true }
      : {
          question: lesson.hook?.question ?? '',
          realWorldContext: lesson.hook?.realWorldContext ?? '',
          previewVisualizationId: lesson.hook?.previewVisualizationId ?? '',
        },
    mentalModel: lesson.mentalModel ?? [],
    sections,
    // Full original lesson — anything not explicitly edited passes through unchanged
    _raw: lesson,
    _chapterId: chapterId ?? '',
    _lessonSlug: lessonSlug ?? '',
    _oldFormat,
    _format,
    _varName,
    _hadHook: lesson.hook !== undefined,
    _hadChapter: lesson.chapter !== undefined,
    _derivedChapter: derivedChapter,
    _unrecognizedKeys,
    _hadPrerequisites: lesson.prerequisites !== undefined,
    _hadCoreConcept: lesson.coreConcept !== undefined,
    _hadTimeToComplete: lesson.timeToComplete !== undefined,
    _hadOrder: lesson.order !== undefined,
    _hadSubtitle: lesson.subtitle !== undefined,
    _hadTags: lesson.tags !== undefined,
  }
}

export function emptyState(_chapterId = '', _lessonSlug = '') {
  return {
    meta: {
      id: '',
      slug: _lessonSlug,
      chapter: _chapterId.replace(/-\d+$/, ''),
      order: 1,
      title: 'Untitled Lesson',
      subtitle: '',
      tags: [],
      aliases: '',
      coreConcept: '',
      prerequisites: [],
      timeToComplete: 15,
      nextLesson: '',
    },
    hook: { question: '', realWorldContext: '', previewVisualizationId: '' },
    mentalModel: [],
    sections: [],
    _raw: null,
    _chapterId,
    _lessonSlug,
    _format: 'standard',
    // A brand-new lesson has nothing to "preserve the absence of" — write the
    // standard shape (hook + chapter present) rather than treating it like an
    // existing lesson that never had these fields.
    _hadHook: true,
    _hadChapter: true,
    _derivedChapter: _chapterId.replace(/-\d+$/, ''),
    _unrecognizedKeys: [],
    _hadPrerequisites: true,
    _hadCoreConcept: true,
    _hadTimeToComplete: true,
    _hadOrder: true,
    _hadSubtitle: true,
    _hadTags: true,
  }
}
