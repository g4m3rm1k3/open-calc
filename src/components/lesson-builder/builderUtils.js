let _counter = 0
export const newId = () => `blk-${Date.now()}-${_counter++}`

export const PALETTE_BLOCKS = [
  { type: 'intuition',   label: 'Intuition',   icon: '🧠', desc: 'Prose + callouts explaining the core idea' },
  { type: 'math',        label: 'Math',         icon: '📐', desc: 'Formal math content with equations' },
  { type: 'rigor',       label: 'Rigor',        icon: '∴',  desc: 'Formal proof or rigorous derivation' },
  { type: 'examples',   label: 'Examples',     icon: '✏️', desc: 'Worked examples with step-by-step solutions' },
  { type: 'challenges', label: 'Challenges',   icon: '🎯', desc: 'Practice problems for the learner' },
  { type: 'checkpoints',label: 'Checkpoints',  icon: '✅', desc: 'Progress tracking items' },
  { type: 'quiz',        label: 'Quiz',         icon: '🧪', desc: 'Multiple-choice quiz questions' },
]

export function defaultSection(type) {
  const _id = newId()
  switch (type) {
    case 'intuition':
    case 'rigor':
      return { _id, type, prose: [''], callouts: [] }
    case 'math':
      return { _id, type, prose: [''], equations: [] }
    case 'examples':
      return { _id, type, items: [{ title: 'Example 1', problem: '', steps: [''], answer: '' }] }
    case 'challenges':
      return { _id, type, items: [{ title: 'Challenge 1', problem: '', hint: '' }] }
    case 'checkpoints':
      return { _id, type, items: [{ id: 'cp-1', label: 'Read this section', type: 'read' }] }
    case 'quiz':
      return { _id, type, items: [{ id: `q${Date.now()}`, type: 'choice', text: '', options: ['', '', '', ''], answer: '', hints: [], reviewSection: '' }] }
    default:
      return { _id, type, prose: [] }
  }
}

export function lessonToState(lesson, chapterId, lessonSlug) {
  const sections = []
  const add = (type, extra) => sections.push({ _id: newId(), type, ...extra })

  if (lesson.intuition) add('intuition', { prose: lesson.intuition.prose ?? [], callouts: lesson.intuition.callouts ?? [] })
  if (lesson.math)      add('math',      { prose: lesson.math.prose ?? [],      equations: lesson.math.equations ?? [] })
  if (lesson.rigor)     add('rigor',     { prose: lesson.rigor.prose ?? [],     callouts: lesson.rigor.callouts ?? [] })
  if (lesson.examples?.length)    add('examples',    { items: lesson.examples.map(ex => ({ ...ex, steps: ex.steps ?? [] })) })
  if (lesson.challenges?.length)  add('challenges',  { items: lesson.challenges })
  if (lesson.checkpoints?.length) add('checkpoints', { items: lesson.checkpoints })
  if (lesson.quiz?.length)        add('quiz',        { items: lesson.quiz })

  return {
    meta: {
      id: lesson.id ?? '',
      slug: lesson.slug ?? lessonSlug ?? '',
      chapter: lesson.chapter ?? (chapterId ?? '').replace(/-\d+$/, ''),
      order: lesson.order ?? 1,
      title: lesson.title ?? '',
      subtitle: lesson.subtitle ?? '',
      tags: lesson.tags ?? [],
      coreConcept: lesson.coreConcept ?? '',
      prerequisites: lesson.prerequisites ?? [],
      timeToComplete: lesson.timeToComplete ?? 15,
    },
    hook: {
      question: lesson.hook?.question ?? '',
      realWorldContext: lesson.hook?.realWorldContext ?? '',
      previewVisualizationId: lesson.hook?.previewVisualizationId ?? '',
    },
    sections,
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
      coreConcept: '',
      prerequisites: [],
      timeToComplete: 15,
    },
    hook: { question: '', realWorldContext: '', previewVisualizationId: '' },
    sections: [],
    _chapterId,
    _lessonSlug,
  }
}
