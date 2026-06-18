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

export function serializeLesson(state) {
  const { meta, hook, sections } = state

  const obj = {
    id: meta.id,
    slug: meta.slug,
    chapter: meta.chapter,
    order: Number(meta.order) || 1,
    title: meta.title,
    subtitle: meta.subtitle,
    tags: meta.tags ?? [],
    coreConcept: meta.coreConcept,
    prerequisites: meta.prerequisites ?? [],
    timeToComplete: Number(meta.timeToComplete) || 15,
    hook: {
      question: hook.question,
      realWorldContext: hook.realWorldContext,
      ...(hook.previewVisualizationId ? { previewVisualizationId: hook.previewVisualizationId } : {}),
    },
  }

  for (const sec of sections) {
    if (sec.type === 'intuition' || sec.type === 'rigor') {
      obj[sec.type] = { prose: sec.prose ?? [], callouts: sec.callouts ?? [] }
    } else if (sec.type === 'math') {
      obj.math = { prose: sec.prose ?? [], equations: sec.equations ?? [] }
    } else if (sec.type === 'examples') {
      obj.examples = sec.items ?? []
    } else if (sec.type === 'challenges') {
      obj.challenges = sec.items ?? []
    } else if (sec.type === 'checkpoints') {
      obj.checkpoints = sec.items ?? []
    } else if (sec.type === 'quiz') {
      obj.quiz = sec.items ?? []
    }
  }

  const lines = Object.entries(obj).map(([k, v]) => `  ${k}: ${fmtValue(v, 1)}`)
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
