// ─── Executor ─────────────────────────────────────────────────────────────────
//
// Adapts the existing inlineRunner to the engine's ExecutionResult shape.
// This is the ONLY file in the engine that knows about specific runtimes.
// Replace this file to target a different execution environment.

import type { ExecutionResult, Lang, OutputLine } from './types'

// Lazy imports so the engine doesn't load heavy runtimes (Pyodide) until first run
async function getRunner() {
  return import('../../utils/inlineRunner.js') as Promise<{
    runJSInline: (code: string) => Promise<{ output: string; error: string | null }>
    runTSInline: (code: string) => Promise<{ output: string; error: string | null }>
    runPythonInline: (code: string, onLine?: (l: { type: string; text?: string; src?: string }) => void) => Promise<{ error: string | null }>
    runSQLInline: (code: string, onLine: (l: { type: string; text?: string }) => void) => Promise<{ error: string | null }>
    runShellInline: (code: string) => { output: string; error: string | null }
    runCInline: (code: string, onLine: (l: { type: string; text?: string }) => void) => Promise<{ error: string | null }>
    RUNNABLE_LANGS: Set<string>
  }>
}

async function getCodeRunner() {
  return import('../../utils/codeRunner.js') as Promise<{
    runCode: (language: string, code: string) => Promise<string>
  }>
}

// Routed through codeRunner.js's Wandbox-backed runCode(), same as C/C++/C#/Java
// below — kotlin/scala deliberately excluded, no working execution backend for
// either right now (Wandbox's scalac is broken server-side, Piston is whitelist-only).
const WANDBOX_RUNNABLE_LANGS = new Set(['rust', 'go', 'ruby', 'php', 'haskell', 'swift', 'julia', 'r'])

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
      const r = await runner.runJSInline(code)
      if (r.output && r.output !== '(no output)') out(r.output)
      if (r.error) err(r.error)
    } else if (norm === 'typescript' || norm === 'ts') {
      const r = await runner.runTSInline(code)
      if (r.output && r.output !== '(no output)') out(r.output)
      if (r.error) err(r.error)
    } else if (norm === 'html') {
      lines.push({ kind: 'preview', text: code })
    } else if (norm === 'css') {
      err('CSS runs with an HTML tab. Add an `html` fence to preview this style.')
    } else if (norm === 'sql' || norm === 'sqlite') {
      const result = await runner.runSQLInline(code, (line: { type: string; text?: string }) => {
        if (!line.text) return
        lines.push({ kind: line.type === 'error' ? 'error' : 'stdout', text: line.text })
      })
      if (result?.error) err(result.error)
    } else if (norm === 'bash' || norm === 'shell' || norm === 'sh') {
      const r = runner.runShellInline(code)
      if (r.output && r.output !== '(no output)') out(r.output)
      if (r.error) err(r.error)
    } else if (norm === 'c' || norm === 'cpp' || norm === 'c++') {
      try {
        const { runCode } = await getCodeRunner()
        const output = await runCode(norm === 'c' ? 'c' : 'cpp', code)
        if (output.startsWith('Compile error:') || output.startsWith('No runner')) err(output)
        else out(output || '(no output)')
      } catch {
        // Wandbox unavailable — fall back to in-browser JSCPP
        const result = await runner.runCInline(code, (line: { type: string; text?: string }) => {
          if (!line.text) return
          lines.push({ kind: line.type === 'error' ? 'error' : 'stdout', text: line.text })
        })
        if (result?.error) err(result.error)
      }
    } else if (norm === 'csharp' || norm === 'cs') {
      const { runCode } = await getCodeRunner()
      const output = await runCode('csharp', code)
      if (output.startsWith('Compile error:') || output.startsWith('No runner')) err(output)
      else out(output || '(no output)')
    } else if (norm === 'java') {
      const { runCode } = await getCodeRunner()
      const output = await runCode('java', code)
      if (output.startsWith('Compile error:') || output.startsWith('No runner')) err(output)
      else out(output || '(no output)')
    } else if (WANDBOX_RUNNABLE_LANGS.has(norm)) {
      const { runCode } = await getCodeRunner()
      const output = await runCode(norm, code)
      if (output.startsWith('Compile error:') || output.startsWith('No runner')) err(output)
      else out(output || '(no output)')
    } else {
      err(`Run not supported for '${lang}'. Supported: python, javascript, typescript, html/css/js, sql, bash, C/C++, C#, Java, Rust, Go, Ruby, PHP, Haskell, Swift, Julia, and R.`)
    }
  } catch (e) {
    err(e instanceof Error ? e.message : String(e))
  }

  if (!lines.length) lines.push({ kind: 'stdout', text: '(no output)' })
  return { lines, durationMs: Date.now() - start }
}

export function isRunnable(lang: Lang): boolean {
  const norm = lang.toLowerCase()
  if (WANDBOX_RUNNABLE_LANGS.has(norm)) return true
  return [
    'python', 'py',
    'javascript', 'js',
    'typescript', 'ts',
    'html', 'css',
    'sql', 'sqlite',
    'bash', 'shell', 'sh',
    'c', 'cpp', 'c++',
    'csharp', 'cs',
    'java',
  ].includes(norm)
}
