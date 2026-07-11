// ─── Executor ─────────────────────────────────────────────────────────────────
//
// Adapts the existing inlineRunner to the engine's ExecutionResult shape.
// This is the ONLY file in the engine that knows about specific runtimes.
// Replace this file to target a different execution environment.

import type { ExecutionResult, Lang, OutputLine } from './types'

// Lazy imports so the engine doesn't load heavy runtimes (Pyodide) until first run
async function getRunner() {
  return import('../../utils/inlineRunner.js') as Promise<{
    runJSInline: (code: string) => { output: string; error: string | null }
    runTSInline: (code: string) => Promise<{ output: string; error: string | null }>
    runPythonInline: (code: string, onLine?: (l: { type: string; text?: string; src?: string }) => void) => Promise<{ error: string | null }>
    runSQLInline: (code: string, onLine: (l: string) => void) => Promise<{ error: string | null }>
    runShellInline: (code: string) => { output: string; error: string | null }
    RUNNABLE_LANGS: Set<string>
  }>
}

export async function executeCode(code: string, lang: Lang): Promise<ExecutionResult> {
  const start = Date.now()
  const lines: OutputLine[] = []
  const out = (text: string) => text.split('\n').filter(Boolean).forEach(t => lines.push({ kind: 'stdout', text: t }))
  const err = (text: string) => lines.push({ kind: 'error', text })

  try {
    const runner = await getRunner()
    const norm = lang.toLowerCase()

    if (norm === 'python' || norm === 'py') {
      const result = await runner.runPythonInline(code, (line: { type: string; text?: string; src?: string }) => {
        if (line.type === 'output' && line.text) lines.push({ kind: 'stdout', text: line.text })
        else if (line.type === 'error' && line.text) lines.push({ kind: 'error', text: line.text })
      })
      if (result?.error) err(result.error)
    } else if (norm === 'javascript' || norm === 'js') {
      const r = runner.runJSInline(code)
      if (r.output && r.output !== '(no output)') out(r.output)
      if (r.error) err(r.error)
    } else if (norm === 'typescript' || norm === 'ts') {
      const r = await runner.runTSInline(code)
      if (r.output && r.output !== '(no output)') out(r.output)
      if (r.error) err(r.error)
    } else if (norm === 'sql' || norm === 'sqlite') {
      await runner.runSQLInline(code, out)
    } else if (norm === 'bash' || norm === 'shell' || norm === 'sh') {
      const r = runner.runShellInline(code)
      if (r.output && r.output !== '(no output)') out(r.output)
      if (r.error) err(r.error)
    } else {
      err(`Run not supported for '${lang}'.  Supported: python, javascript, typescript, sql, bash.`)
    }
  } catch (e) {
    err(e instanceof Error ? e.message : String(e))
  }

  if (!lines.length) lines.push({ kind: 'stdout', text: '(no output)' })
  return { lines, durationMs: Date.now() - start }
}

export function isRunnable(lang: Lang): boolean {
  const norm = lang.toLowerCase()
  return ['python', 'py', 'javascript', 'js', 'typescript', 'ts', 'sql', 'sqlite', 'bash', 'shell', 'sh'].includes(norm)
}
