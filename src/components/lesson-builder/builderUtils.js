let _counter = 0
export const newId = () => `blk-${Date.now()}-${_counter++}`

// Keys explicitly edited by the builder — everything else passes through from _raw unchanged
export const HANDLED_SECTION_KEYS = new Set([
  'intuition', 'math', 'rigor', 'examples', 'challenges', 'checkpoints', 'quiz',
  // All Python notebook variant keys
  'python', 'PythonNotebook', 'notebooks', 'pythonLab',
  // ScienceNotebook cell array
  'cells',
])
export const HANDLED_META_KEYS = new Set(['id', 'slug', 'chapter', 'order', 'title', 'subtitle', 'tags', 'coreConcept', 'prerequisites', 'timeToComplete', 'aliases', 'nextLesson'])

export const PALETTE_BLOCKS = [
  { type: 'intuition',    label: 'Intuition',   icon: '🧠', desc: 'Prose + callouts explaining the core idea' },
  { type: 'math',         label: 'Math',         icon: '📐', desc: 'Formal math content with equations' },
  { type: 'rigor',        label: 'Rigor',        icon: '∴',  desc: 'Formal proof or rigorous derivation' },
  { type: 'examples',    label: 'Examples',     icon: '✏️', desc: 'Worked examples with step-by-step solutions' },
  { type: 'challenges',  label: 'Challenges',   icon: '🎯', desc: 'Practice problems for the learner' },
  { type: 'checkpoints', label: 'Checkpoints',  icon: '✅', desc: 'Progress tracking items' },
  { type: 'quiz',         label: 'Quiz',         icon: '🧪', desc: 'Multiple-choice quiz questions' },
  { type: 'python',       label: 'Python',       icon: '🐍', desc: 'Python notebook cells with runnable code' },
  { type: 'cells',        label: 'Cells',        icon: '⚗️', desc: 'ScienceNotebook cells (markdown, js, challenge, coding, walkthrough)' },
]

// Convert lesson.*.visualizations array → builder children array
export function vizsToChildren(vizs) {
  return (vizs ?? []).map(viz => ({
    _id: newId(),
    type: 'visualization',
    vizId: viz.id ?? '',
    title: viz.title ?? '',
    caption: viz.caption ?? '',
    mathBridge: viz.mathBridge ?? '',
    props: viz.props ?? {},
  }))
}

// Convert builder children array → lesson.*.visualizations array
export function childrenToVizs(children) {
  return (children ?? []).map(child => {
    const v = { id: child.vizId }
    if (child.title)      v.title = child.title
    if (child.caption)    v.caption = child.caption
    if (child.mathBridge) v.mathBridge = child.mathBridge
    v.props = child.props ?? {}
    return v
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
    default:
      return { _id, type, prose: [] }
  }
}

export function lessonToState(lesson, chapterId, lessonSlug) {
  const sections = []
  const add = (type, extra) => sections.push({ _id: newId(), type, ...extra })

  // ScienceNotebook cells — map before old-format sections so they appear first
  if (lesson.cells?.length) add('cells', { cells: lesson.cells })

  // Old-format sections — skip intuition if it uses blocks[] (ScienceNotebook style) rather than prose[]
  if (lesson.intuition && lesson.intuition.prose) add('intuition', { prose: lesson.intuition.prose ?? [], callouts: lesson.intuition.callouts ?? [], children: vizsToChildren(lesson.intuition.visualizations) })
  if (lesson.math)      add('math',      { prose: lesson.math.prose ?? [],      equations: lesson.math.equations ?? [],   children: vizsToChildren(lesson.math.visualizations) })
  if (lesson.rigor)     add('rigor',     { prose: lesson.rigor.prose ?? [],     callouts: lesson.rigor.callouts ?? [],    children: vizsToChildren(lesson.rigor.visualizations) })
  if (lesson.examples?.length)    add('examples',    { items: lesson.examples.map(ex => ({ ...ex, steps: ex.steps ?? [] })) })
  if (lesson.challenges?.length)  add('challenges',  { items: lesson.challenges })
  if (lesson.checkpoints?.length) add('checkpoints', { items: lesson.checkpoints })
  if (lesson.quiz?.length)        add('quiz',        { items: lesson.quiz })

  // Python notebooks — four possible field shapes across the codebase
  if (lesson.python?.cells?.length)
    add('python', { cells: lesson.python.cells })
  else if (lesson.PythonNotebook?.cells?.length)
    add('python', { cells: lesson.PythonNotebook.cells, _origKey: 'PythonNotebook' })
  else if (lesson.notebooks?.python?.cells?.length)
    add('python', { cells: lesson.notebooks.python.cells, _origKey: 'notebooks' })
  else if (lesson.pythonLab?.cells?.length)
    add('python', { cells: lesson.pythonLab.cells, _origKey: 'pythonLab' })

  return {
    meta: {
      id: lesson.id ?? '',
      slug: lesson.slug ?? lessonSlug ?? '',
      chapter: lesson.chapter ?? (chapterId ?? '').replace(/-\d+$/, ''),
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
    hook: {
      question: lesson.hook?.question ?? '',
      realWorldContext: lesson.hook?.realWorldContext ?? '',
      previewVisualizationId: lesson.hook?.previewVisualizationId ?? '',
    },
    sections,
    // Full original lesson — anything not explicitly edited passes through unchanged
    _raw: lesson,
    _chapterId: chapterId ?? '',
    _lessonSlug: lessonSlug ?? '',
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
    sections: [],
    _raw: null,
    _chapterId,
    _lessonSlug,
  }
}
