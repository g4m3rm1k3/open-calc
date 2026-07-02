// ── Core value types ──────────────────────────────────────────────────────────

export interface ComplexLike {
  re: number
  im: number
}

export interface SymbolicValue {
  __sym: string
  __shape?: [number, number]
}

export interface MultiValue {
  __multi: Value[]
}

export interface HistData {
  centers: number[]
  counts: number[]
}

export interface HistValue {
  __histData: HistData
}

/** Any value the OpenMAT engine can produce or accept. */
export type Value =
  | number
  | string
  | boolean
  | ComplexLike
  | SymbolicValue
  | MultiValue
  | HistValue
  | unknown[]

// ── Workspace ─────────────────────────────────────────────────────────────────

export interface WorkspaceEntry {
  name: string
  className: string
  size: [number, number]
  bytes: number
  preview: string
  value: Value
}

// ── Controls (sliders, dropdowns declared via openmat_slider / openmat_dropdown) ──

export interface SliderControl {
  name: string
  type: 'slider'
  min: number
  max: number
  step: number
  value: number
  defaultValue: number
}

export interface DropdownControl {
  name: string
  type: 'dropdown'
  options: string[]
  value: number
  defaultValue: number
}

export type Control = SliderControl | DropdownControl

// ── Execution result ──────────────────────────────────────────────────────────

export interface ExecutionResult {
  /** Combined text output (disp/fprintf/ans) joined by newlines. */
  output: string
  /** Serialized JSON string for the 2D figure, or null if no plot was produced. */
  figureJson: string | null
  /** 3D figure config object (for surf/mesh/scatter3/plot3), or null. */
  plot3DRequest: Record<string, unknown> | null
  /** Current workspace after execution. */
  workspace: WorkspaceEntry[]
  /** Interactive controls declared in the script. */
  controls: Control[]
  /** MATLAB compatibility warnings detected in the source. */
  compatibilityWarnings: string[]
}

// ── Engine options ────────────────────────────────────────────────────────────

export interface EngineExtension {
  onRun?: (result: ExecutionResult, context: unknown) => void
}

export interface EngineOptions {
  extensions?: EngineExtension[]
  controlValues?: Record<string, number>
  initialWorkspace?: WorkspaceEntry[]
}

// ── Notebook wrapper result ───────────────────────────────────────────────────

export interface NotebookResult {
  logs: string[]
  figureJson: string | null
  variables: string[]
}

// ── AST nodes produced by transpiler/parseBlocks ─────────────────────────────

export interface LineNode     { type: 'line';     raw: string; lineNo: number }
export interface IfBranch     { cond: string; body: ParsedNode[] }
export interface IfNode       { type: 'if';      branches: IfBranch[]; elseBody: ParsedNode[] | null }
export interface ForNode      { type: 'for';     varName: string; iterExpr: string; body: ParsedNode[] }
export interface WhileNode    { type: 'while';   condExpr: string; body: ParsedNode[] }
export interface FunctionNode { type: 'function'; name: string; ins: string[]; outs: string[]; body: ParsedNode[] }
export interface TryNode      { type: 'try';     tryBody: ParsedNode[]; catchBody: ParsedNode[] | null; catchVar: string | null }
export interface SwitchCase   { val: string; body: ParsedNode[] }
export interface SwitchNode   { type: 'switch';  expr: string; cases: SwitchCase[]; otherwise: ParsedNode[] | null }
export interface BreakNode    { type: 'break' }
export interface ContinueNode { type: 'continue' }
export interface ReturnNode   { type: 'return' }

export type ParsedNode =
  | LineNode | IfNode | ForNode | WhileNode | FunctionNode
  | TryNode  | SwitchNode | BreakNode | ContinueNode | ReturnNode

// ── Plot state ────────────────────────────────────────────────────────────────

export type ColormapName =
  | 'parula' | 'jet' | 'hot' | 'cool' | 'gray' | 'bone'
  | 'copper' | 'spring' | 'summer' | 'autumn' | 'winter'
  | 'hsv' | 'viridis' | 'plasma' | 'inferno' | 'magma'

export interface PlotSeries {
  kind: 'plot' | 'scatter' | 'bar' | 'stem' | 'area'
  x: number[]
  y: number[]
  label?: string
  values?: number[]
  labels?: string[]
}

export interface PlotState {
  series: PlotSeries[]
  hold: boolean
  title: string
  xlabel: string
  ylabel: string
  zlabel: string
  legend: string[]
  grid: boolean
  xlim: [number, number] | null
  ylim: [number, number] | null
  zlim: [number, number] | null
  axisMode: 'auto' | 'tight' | 'equal'
  view: string
  colormap: ColormapName
  colorbar: boolean
}
