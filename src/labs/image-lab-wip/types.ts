export interface ImgData {
  width: number
  height: number
  pixels: Uint8ClampedArray
}

export interface Settings {
  brightness: number
  contrast: number
  gamma: number
  channel: 'rgb' | 'gray' | 'red' | 'green' | 'blue'
}

export type Kernel3x3 = number[][]

export interface Inspect {
  x: number
  y: number
  r: number
  g: number
  b: number
  a: number
}

export interface SvdData {
  U: number[][]
  V: number[][]
  sigmas: number[]
  w: number
  h: number
  gray: number[][]
}

export interface SvdState {
  data: SvdData | null
  k: number
  computing: boolean
}

export interface FftData {
  re: Float64Array
  im: Float64Array
  mag: Float64Array
  phase: Float64Array
  N: number
}

export interface FftState {
  data: FftData | null
  mask: Uint8Array | null
  computing: boolean
  reconstructed: ImgData | null
}

export type TransformType = 'identity' | 'rotate' | 'scale' | 'shear' | 'flipH' | 'flipV' | 'custom'

export interface TransformState {
  type: TransformType
  angle: number
  scale: number
  shear: number
  customMatrix: number[][]
}

export type EdgeMethod = 'sobel' | 'prewitt' | 'laplacian' | 'roberts' | 'canny'

export interface EdgeState {
  method: EdgeMethod
  overlay: 'original' | 'edges' | 'combined'
  edgeImage: ImgData | null
}

export interface NotebookEntry {
  id: string
  at: number
  type: string
  label: string
  annotation: string
}

export interface LogItem {
  label: string
  at: number
}

export interface HistorySnapshot {
  id: string
  at: number
  label: string
  source: ImgData
  settings: Settings
}

export type ViewerMode = 'image' | 'matrix' | 'split'

export type MenuId = 'file' | 'view' | 'adjust' | 'analyze' | 'transform' | 'tools' | null

// Which panel (if any) is showing in the bottom drawer. Menus set this and
// close themselves; the drawer renders the matching panel and can be
// dismissed independently, so nothing sits permanently docked in the shell.
export type ActiveTool =
  | 'kernel' | 'pixels' | 'histogram' | 'rgb' | 'matrix' | 'edges'
  | 'transform' | 'svd' | 'fft' | 'compress'
  | 'openmat' | 'notebook' | 'log' | 'history'
  | null
