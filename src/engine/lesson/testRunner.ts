import type { TestResult, Executor } from './types'

const OC_PREFIX = '__OC_TEST__'

function buildPythonHarness(userCode: string, testCode: string): string {
  const assertions = testCode
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('assert ') || (l && !l.startsWith('#')))

  const lines = [
    userCode,
    '',
    '__oc_results = []',
  ]

  for (const assertion of assertions) {
    const escaped = assertion.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    lines.push(`try:`)
    lines.push(`    ${assertion}`)
    lines.push(`    __oc_results.append('PASS|${escaped}')`)
    lines.push(`except AssertionError:`)
    lines.push(`    __oc_results.append('FAIL|${escaped}')`)
    lines.push(`except Exception as __e:`)
    lines.push(`    __oc_results.append('ERROR|${escaped}|' + str(__e))`)
  }

  lines.push(`for __r in __oc_results: print('${OC_PREFIX}' + __r)`)
  return lines.join('\n')
}

function buildJSHarness(userCode: string, testCode: string): string {
  const assertions = testCode
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('//'))

  const lines = [userCode, '']

  for (const assertion of assertions) {
    const escaped = assertion.replace(/`/g, '\\`')
    lines.push(`try {`)
    lines.push(`  const __ok = (${assertion.replace(/^assert\s+/, '')});`)
    lines.push(`  console.log(\`${OC_PREFIX}PASS|${escaped}\`)`)
    lines.push(`} catch(__e) {`)
    lines.push(`  console.log(\`${OC_PREFIX}FAIL|${escaped}|\` + __e.message)`)
    lines.push(`}`)
  }
  return lines.join('\n')
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

// ── CSS test runner ──────────────────────────────────────────────────────────
// Injects the student's CSS into an iframe alongside the provided HTML structure,
// then runs test assertions using getComputedStyle. Tests outcomes, not implementation.

export function runCSSTests(
  userCSS: string,
  htmlStructure: string,
  testCode: string,
): Promise<TestResult[]> {
  return new Promise(resolve => {
    const lines = testCode
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//'))

    // Lines NOT starting with `assert` are preamble/setup — run once in shared scope.
    // Lines starting with `assert` are individual checks — wrapped in try/catch.
    const preamble = lines.filter(l => !l.startsWith('assert '))
    const asserts  = lines.filter(l =>  l.startsWith('assert '))

    const assertBlocks = asserts.map(a => {
      const expr = a.replace(/^assert\s+/, '')
      const label = JSON.stringify(a)
      return `try {
  var __ok = Boolean(${expr});
  results.push({label:${label},passed:__ok,detail:__ok?undefined:'Expected true'});
} catch(e) {
  results.push({label:${label},passed:false,detail:e.message});
}`
    }).join('\n')

    const doc = `<!DOCTYPE html>
<html>
<head><style>${userCSS}</style></head>
<body>
${htmlStructure}
<script>
var results = [];
try {
${preamble.join('\n')}
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
