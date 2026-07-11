import type { TestResult } from './types'
import type { Executor } from './types'

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
