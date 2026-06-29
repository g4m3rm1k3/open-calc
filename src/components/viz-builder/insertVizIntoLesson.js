import { newId, defaultSection } from '../lesson-builder/builderUtils.js'

export const VIZ_TARGET_SECTIONS = [
  { type: 'intuition', label: 'Intuition' },
  { type: 'math', label: 'Math' },
  { type: 'rigor', label: 'Rigor' },
]

// Insert a Viz Builder config ({vizId, title, caption, props}) into a parsed
// lesson builder state's target section (intuition/math/rigor), returning a
// new state ready to hand to the lesson ExportPanel as-is.
//
// intuition/rigor sections can be in two shapes: the newer blocks[] form, or
// the older prose+children form (see lessonToState/lessonSerializer.js) —
// appending to `.children` on a blocks[]-mode section would silently do
// nothing, since the serializer's blocks-mode branch ignores `.children`
// entirely. So a blocks-mode target gets a `viz` block appended instead.
export function insertVizIntoLessonState(state, sectionType, vizConfig) {
  const sections = [...state.sections]
  const idx = sections.findIndex(s => s.type === sectionType)

  if (idx === -1) {
    // defaultSection() seeds prose with one empty paragraph (meant for a human
    // about to type something) — clear it so a section created solely to hold
    // this viz doesn't pick up a stray empty prose paragraph in the diff.
    const sec = { ...defaultSection(sectionType), prose: [], children: [makeChild(vizConfig)] }
    sections.push(sec)
    return { ...state, sections }
  }

  const target = sections[idx]
  if ((target.type === 'intuition' || target.type === 'rigor') && Array.isArray(target.blocks)) {
    sections[idx] = { ...target, blocks: [...target.blocks, makeVizBlock(vizConfig)] }
  } else {
    sections[idx] = { ...target, children: [...(target.children ?? []), makeChild(vizConfig)] }
  }
  return { ...state, sections }
}

function makeChild(vizConfig) {
  return {
    _id: newId(),
    type: 'visualization',
    vizId: vizConfig.vizId,
    title: vizConfig.title ?? '',
    caption: vizConfig.caption ?? '',
    mathBridge: '',
    props: vizConfig.props ?? {},
  }
}

function makeVizBlock(vizConfig) {
  return {
    _id: newId(),
    type: 'viz',
    vizId: vizConfig.vizId,
    title: vizConfig.title ?? '',
    caption: vizConfig.caption ?? '',
    mathBridge: '',
    props: vizConfig.props ?? {},
  }
}
