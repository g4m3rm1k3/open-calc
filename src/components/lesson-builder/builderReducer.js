import { defaultSection, newId, vizsToChildren } from './builderUtils.js'

export function builderReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.payload

    case 'SET_META':
      return { ...state, meta: { ...state.meta, [action.key]: action.value } }

    case 'SET_HOOK':
      return { ...state, hook: { ...state.hook, [action.key]: action.value } }

    case 'ADD_SECTION': {
      const sec = defaultSection(action.blockType)
      const sections = [...state.sections]
      const at = action.insertAt ?? sections.length
      sections.splice(at, 0, sec)
      return { ...state, sections }
    }

    case 'REMOVE_SECTION':
      return { ...state, sections: state.sections.filter(s => s._id !== action.id) }

    case 'MOVE_UP': {
      const idx = state.sections.findIndex(s => s._id === action.id)
      if (idx <= 0) return state
      const sections = [...state.sections]
      ;[sections[idx - 1], sections[idx]] = [sections[idx], sections[idx - 1]]
      return { ...state, sections }
    }

    case 'MOVE_DOWN': {
      const idx = state.sections.findIndex(s => s._id === action.id)
      if (idx < 0 || idx >= state.sections.length - 1) return state
      const sections = [...state.sections]
      ;[sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]]
      return { ...state, sections }
    }

    case 'UPDATE_SECTION': {
      return {
        ...state,
        sections: state.sections.map(s => s._id === action.id ? { ...s, ...action.updates } : s),
      }
    }

    case 'ADD_CHILD': {
      const newChild = {
        _id: newId(),
        type: 'visualization',
        vizId: action.vizId ?? 'PythonNotebook',
        title: '',
        caption: '',
        mathBridge: '',
        props: action.vizId === 'PythonNotebook' || !action.vizId ? { initialCells: [] } : {},
      }
      return {
        ...state,
        sections: state.sections.map(s =>
          s._id === action.sectionId
            ? { ...s, children: [...(s.children ?? []), newChild] }
            : s,
        ),
      }
    }

    case 'REMOVE_CHILD':
      return {
        ...state,
        sections: state.sections.map(s =>
          s._id === action.sectionId
            ? { ...s, children: (s.children ?? []).filter(c => c._id !== action.childId) }
            : s,
        ),
      }

    case 'UPDATE_CHILD':
      return {
        ...state,
        sections: state.sections.map(s =>
          s._id === action.sectionId
            ? { ...s, children: (s.children ?? []).map(c => c._id === action.childId ? { ...c, ...action.updates } : c) }
            : s,
        ),
      }

    case 'MOVE_CHILD_UP': {
      const sec = state.sections.find(s => s._id === action.sectionId)
      if (!sec) return state
      const kids = [...(sec.children ?? [])]
      const idx = kids.findIndex(c => c._id === action.childId)
      if (idx <= 0) return state
      ;[kids[idx - 1], kids[idx]] = [kids[idx], kids[idx - 1]]
      return { ...state, sections: state.sections.map(s => s._id === action.sectionId ? { ...s, children: kids } : s) }
    }

    case 'MOVE_CHILD_DOWN': {
      const sec = state.sections.find(s => s._id === action.sectionId)
      if (!sec) return state
      const kids = [...(sec.children ?? [])]
      const idx = kids.findIndex(c => c._id === action.childId)
      if (idx < 0 || idx >= kids.length - 1) return state
      ;[kids[idx], kids[idx + 1]] = [kids[idx + 1], kids[idx]]
      return { ...state, sections: state.sections.map(s => s._id === action.sectionId ? { ...s, children: kids } : s) }
    }

    case 'EJECT_CHILD': {
      // Promote a nested visualization to a top-level Python section
      const parentSec = state.sections.find(s => s._id === action.sectionId)
      if (!parentSec) return state
      const child = (parentSec.children ?? []).find(c => c._id === action.childId)
      if (!child) return state

      const ejected = {
        _id: newId(),
        type: 'python',
        cells: child.props?.initialCells ?? [],
        _origKey: 'python',
      }
      const parentIdx = state.sections.findIndex(s => s._id === action.sectionId)
      const sections = state.sections.map(s =>
        s._id === action.sectionId
          ? { ...s, children: (s.children ?? []).filter(c => c._id !== action.childId) }
          : s,
      )
      sections.splice(parentIdx + 1, 0, ejected)
      return { ...state, sections }
    }

    default:
      return state
  }
}
