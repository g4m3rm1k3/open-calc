export type Lang = string

export interface UiTheme {
  bg0: string; bg1: string; bg2: string
  border: string
  txt1: string; txt2: string
  hoverBg: string; hoverTx: string
  btnBorder: string
  primary: string; primaryBg: string
}

export interface CodeSnippet {
  lang: Lang
  code: string
}

export interface OutputLine {
  kind: 'stdout' | 'stderr' | 'error' | 'preview'
  text: string
}

export interface ExecutionResult {
  lines: OutputLine[]
  durationMs?: number
}

export type Executor = (code: string, lang: Lang) => Promise<ExecutionResult>

export interface TestResult {
  label: string
  passed: boolean
  detail?: string
}

export interface LessonStep {
  id: string
  title: string
  prose: string               // markdown with code fences and lenses removed
  lenses?: { cs?: string; se?: string }
  examples: CodeSnippet[]     // runnable examples that live with the prose
  challenge: CodeSnippet | null
  tests: string | null        // raw test assertions
}

export interface ParsedLesson {
  title: string
  series: string
  level: number
  topic?: string
  lang: Lang
  steps: LessonStep[]
}
