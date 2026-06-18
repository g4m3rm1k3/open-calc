import { defaultSection, newId } from './builderUtils.js'

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

    default:
      return state
  }
}
