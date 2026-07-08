import type { Matrix } from './types'

const LS_VARS     = 'oc_memory'
const LS_FORMULAS = 'oc_formulas'
const LS_SCRIPTS  = 'oc_scripts'
const LS_HISTORY  = 'oc_math_os_history'
const LS_MAT_VARS = 'oc_mat_vars'

function safeGet<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback }
  catch { return fallback }
}
function safeSet(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const loadVars    = (): Record<string, number | string> => safeGet(LS_VARS, {})
export const saveVars    = (v: Record<string, number | string>) => safeSet(LS_VARS, v)

export const loadFormulas = (): Record<string, string> => safeGet(LS_FORMULAS, {})
export const saveFormulas = (f: Record<string, string>) => safeSet(LS_FORMULAS, f)

export const loadScripts = (): Record<string, string> => safeGet(LS_SCRIPTS, {})
export const saveScripts = (s: Record<string, string>) => safeSet(LS_SCRIPTS, s)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadHistory = (): any[] => safeGet(LS_HISTORY, [])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const saveHistory = (h: any[]) => safeSet(LS_HISTORY, h.slice(-100))

export const loadMatVars = (): Record<string, Matrix> => safeGet(LS_MAT_VARS, {})
export const saveMatVars = (v: Record<string, Matrix>) => safeSet(LS_MAT_VARS, v)
