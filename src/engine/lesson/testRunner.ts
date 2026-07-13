import type { TestResult, Executor } from './types'

const OC_PREFIX = '__OC_TEST__'

// Assert lines commonly carry an explanatory trailing comment ("assert x > 3   // must
// be descriptive"), which the contract encourages. In JS the assertion expression gets
// wrapped in `!!( ... )` — a trailing `//` there comments out the closing paren and
// everything after it on that line, breaking the harness. Strip a trailing `//` comment
// before using the expression, but only when the `//` is not inside a string literal
// (a URL like 'https://example.com' must survive intact). The label shown to the
// learner still uses the untouched original line, comment included.
function stripTrailingLineComment(line: string): string {
  let quote: string | null = null
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quote) {
      if (ch === '\\') { i++; continue }
      if (ch === quote) quote = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue }
    if (ch === '/' && line[i + 1] === '/') return line.slice(0, i).trimEnd()
  }
  return line
}

// A test fence is not always a flat list of assertions — authors legitimately write
// setup/preamble lines between them for readability (`const i1 = im.report(...)` then
// several `assert i1....` lines, then `const i2 = ...`). These must run in their
// original source order, interleaved with the assertions, not bucketed into "run all
// setup first, then all assertions" — bucketing silently reorders side effects (e.g. a
// later `im.resolve(i1.id)` would run before an earlier `assert im.openIncidents()...`
// that depends on it not having happened yet). Every harness below walks lines once, in
// order, and only treats an `assert `-prefixed line specially.

function buildPythonHarness(userCode: string, testCode: string): string {
  const lines = testCode.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))

  const out = [userCode, '']

  for (const line of lines) {
    if (!line.startsWith('assert ')) {
      out.push(line)
      continue
    }
    const escaped = line.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    // Print immediately (not buffered) so a later preamble line that throws doesn't
    // discard results already earned by assertions that ran before it.
    out.push(`try:`)
    out.push(`    ${line}`)
    out.push(`    print('${OC_PREFIX}PASS|${escaped}')`)
    out.push(`except AssertionError:`)
    out.push(`    print('${OC_PREFIX}FAIL|${escaped}')`)
    out.push(`except Exception as __e:`)
    out.push(`    print('${OC_PREFIX}ERROR|${escaped}|' + str(__e))`)
  }

  return out.join('\n')
}

function buildJSHarness(userCode: string, testCode: string): string {
  const lines = testCode.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'))

  const out = [userCode, '']

  for (const line of lines) {
    if (!line.startsWith('assert ')) {
      out.push(line)
      continue
    }
    const expr = stripTrailingLineComment(line.slice('assert '.length))
    const escaped = line.replace(/`/g, '\\`')
    out.push(`try {`)
    out.push(`  const __ok = !!(${expr});`)
    out.push(`  if (__ok) console.log(\`${OC_PREFIX}PASS|${escaped}\`)`)
    out.push(`  else      console.log(\`${OC_PREFIX}FAIL|${escaped}|\`)`)
    out.push(`} catch(__e) {`)
    out.push(`  console.log(\`${OC_PREFIX}FAIL|${escaped}|\` + __e.message)`)
    out.push(`}`)
  }
  return out.join('\n')
}

// Shared by runCSSTests and runJSXTests: same interleaving rule, but assertions report
// into a `results` array via `results.push(...)` (read back through postMessage) rather
// than printing OC_PREFIX-tagged stdout lines.
function buildInterleavedAssertions(testCode: string): string {
  const lines = testCode.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'))
  const out: string[] = []
  for (const line of lines) {
    if (!line.startsWith('assert ')) {
      out.push(line)
      continue
    }
    const expr = stripTrailingLineComment(line.slice('assert '.length))
    const label = JSON.stringify(line)
    out.push(`try {
  var __ok = Boolean(${expr});
  results.push({label:${label},passed:__ok,detail:__ok?undefined:'Expected true'});
} catch(e) {
  results.push({label:${label},passed:false,detail:e.message});
}`)
  }
  return out.join('\n')
}

export function buildTestHarness(userCode: string, testCode: string, lang: string): string {
  const norm = lang.toLowerCase()
  if (norm === 'python' || norm === 'py') return buildPythonHarness(userCode, testCode)
  return buildJSHarness(userCode, testCode)
}

export function parseTestResults(output: string[]): TestResult[] {
  return output
    .filter(l => l.startsWith(OC_PREFIX))
    .map(l => {
      const parts = l.slice(OC_PREFIX.length).split('|')
      const status = parts[0]
      const label = parts[1] ?? ''
      const detail = parts[2]
      return {
        label,
        passed: status === 'PASS',
        detail: status === 'ERROR' ? `Error: ${detail}` : status === 'FAIL' ? 'Assertion failed' : undefined,
      }
    })
}

export async function runTests(
  userCode: string,
  testCode: string,
  lang: string,
  executor: Executor,
): Promise<TestResult[]> {
  const harness = buildTestHarness(userCode, testCode, lang)
  const result = await executor(harness, lang)
  const stdout = result.lines.filter(l => l.kind === 'stdout').map(l => l.text)
  const errors = result.lines.filter(l => l.kind === 'error')
  if (errors.length && !stdout.some(l => l.startsWith(OC_PREFIX))) {
    return [{ label: errors[0].text, passed: false, detail: 'Runtime error' }]
  }
  return parseTestResults(stdout)
}

// SQL challenges (sql-fundamentals) grade the learner's raw query TEXT, not a query
// result set — no database execution needed. The test fence binds it via a `code`
// variable (e.g. `var q = code.trim().toLowerCase()...; assert q.startsWith('select')`).
// Route through the JS runtime with `code` pre-bound, instead of the (nonexistent) SQL
// test harness — the assertions are already plain JS.
export async function runSqlTests(
  rawQuery: string,
  testCode: string,
  executor: Executor,
): Promise<TestResult[]> {
  const preamble = `const code = ${JSON.stringify(rawQuery)};`
  return runTests(preamble, testCode, 'javascript', executor)
}

// ── JSX/React/Vue test runner ─────────────────────────────────────────────────
// Transpiles JSX with @babel/standalone (runtime: classic → React.createElement),
// injects React/Vue UMD from CDN, runs assertions via postMessage from the iframe.
// Same iframe/postMessage pattern as runCSSTests.

export function runJSXTests(
  userCode: string,
  testCode: string,
  framework: 'react' | 'vue' = 'react',
): Promise<TestResult[]> {
  return new Promise(async resolve => {
    const assertBlocks = buildInterleavedAssertions(testCode)

    // Transpile JSX → plain JS using @babel/standalone (already a local dep)
    let transpiledCode = userCode
    try {
      const Babel = await import('@babel/standalone').then(m => m.default ?? m) as any
      const presets: any[] = [['react', { runtime: 'classic' }]]
      transpiledCode = Babel.transform(userCode, { presets, filename: 'challenge.jsx' }).code ?? userCode
    } catch (e) {
      resolve([{ label: 'JSX transpile error', passed: false, detail: (e as Error).message }])
      return
    }

    const cdnScripts = framework === 'vue'
      ? `<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>`
      : `<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
         <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>`

    const doc = `<!DOCTYPE html>
<html>
<head>${cdnScripts}</head>
<body><div id="root"></div>
<script>
var results = [];
try {
${transpiledCode}
${assertBlocks}
} catch(e) {
  results.push({label:'Runtime error',passed:false,detail:e.message});
}
window.parent.postMessage({type:'__OC_JSX__',results:results},'*');
</script>
</body>
</html>`

    let done = false
    const timer = setTimeout(() => {
      if (done) return
      done = true
      window.removeEventListener('message', onMsg)
      try { document.body.removeChild(frame) } catch {}
      resolve([{ label: 'Tests timed out', passed: false, detail: 'No response from iframe after 8s' }])
    }, 8000)

    function onMsg(e: MessageEvent) {
      if (e.data?.type !== '__OC_JSX__') return
      if (done) return
      done = true
      clearTimeout(timer)
      window.removeEventListener('message', onMsg)
      try { document.body.removeChild(frame) } catch {}
      resolve(e.data.results as TestResult[])
    }

    window.addEventListener('message', onMsg)
    const frame = document.createElement('iframe')
    frame.setAttribute('sandbox', 'allow-scripts')
    frame.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:800px;height:600px;visibility:hidden;pointer-events:none'
    frame.srcdoc = doc
    document.body.appendChild(frame)
  })
}

// ── CSS test runner ──────────────────────────────────────────────────────────
// Injects the student's CSS into an iframe alongside the provided HTML structure,
// then runs test assertions using getComputedStyle. Tests outcomes, not implementation.

export function runCSSTests(
  userCSS: string,
  htmlStructure: string,
  testCode: string,
): Promise<TestResult[]> {
  return new Promise(resolve => {
    const assertBlocks = buildInterleavedAssertions(testCode)

    const doc = `<!DOCTYPE html>
<html>
<head><style>${userCSS}</style></head>
<body>
${htmlStructure}
<script>
var results = [];
try {
${assertBlocks}
} catch(e) {
  results.push({label:'Setup error',passed:false,detail:e.message});
}
window.parent.postMessage({type:'__OC_CSS__',results:results},'*');
</script>
</body>
</html>`

    let done = false
    const timer = setTimeout(() => {
      if (done) return
      done = true
      window.removeEventListener('message', onMsg)
      try { document.body.removeChild(frame) } catch {}
      resolve([{ label: 'Tests timed out', passed: false, detail: 'No response from iframe after 5s' }])
    }, 5000)

    function onMsg(e: MessageEvent) {
      if (e.data?.type !== '__OC_CSS__') return
      if (done) return
      done = true
      clearTimeout(timer)
      window.removeEventListener('message', onMsg)
      try { document.body.removeChild(frame) } catch {}
      resolve(e.data.results as TestResult[])
    }

    window.addEventListener('message', onMsg)

    const frame = document.createElement('iframe')
    frame.setAttribute('sandbox', 'allow-scripts')
    frame.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:600px;height:400px;visibility:hidden;pointer-events:none'
    frame.srcdoc = doc
    document.body.appendChild(frame)
  })
}
