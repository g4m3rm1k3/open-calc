import { describe, it, expect } from 'vitest'
import { buildTestHarness, parseTestResults, runSqlTests } from './testRunner'
import { runJSInline } from '../../utils/inlineRunner.js'
import type { Executor } from './types'

// Runs a generated JS harness for real (not just string-inspects it) and collects the
// __OC_TEST__-prefixed console.log lines the same way the browser executor would.
function runJSHarness(harness: string): string[] {
  const logs: string[] = []
  const fn = new Function('console', harness)
  fn({ log: (m: string) => logs.push(m) })
  return logs
}

describe('buildTestHarness (javascript) — preamble/assertion interleaving', () => {
  it('REGRESSION: a single setup line before an assertion used to throw a hard SyntaxError for every JS/TS lesson that used it', () => {
    const userCode = `function validateRegistration(x) { return { valid: true, email: x.email } }`
    const testCode = `const v1 = validateRegistration({ email: 'alice@example.com' })
assert v1.valid === true
assert v1.email === 'alice@example.com'`

    const harness = buildTestHarness(userCode, testCode, 'javascript')
    // Must not throw when constructed/run — this alone reproduces and fixes the bug.
    const logs = runJSHarness(harness)
    const results = parseTestResults(logs)

    expect(results).toHaveLength(2)
    expect(results.every(r => r.passed)).toBe(true)
  })

  it('preserves source order for interleaved setup/assert/setup/assert (order-dependent side effects)', () => {
    // Mirrors the real professional-engineering/level-2.md incident-manager pattern:
    // im.resolve(i1.id) must run strictly after the "3 open incidents" assertion and
    // strictly before the "2 open incidents" assertion. Bucketing all setup lines
    // before all assertions (the old bug) would run resolve() too early and both
    // assertions would report the wrong count.
    const userCode = `
function createTracker() {
  let open = []
  return {
    add(id) { open.push(id) },
    resolve(id) { open = open.filter(x => x !== id) },
    count() { return open.length },
  }
}`
    const testCode = `const t = createTracker()
t.add('a')
t.add('b')
t.add('c')
assert t.count() === 3
t.resolve('a')
assert t.count() === 2`

    const harness = buildTestHarness(userCode, testCode, 'javascript')
    const logs = runJSHarness(harness)
    const results = parseTestResults(logs)

    expect(results).toHaveLength(2)
    expect(results[0].passed).toBe(true)  // count === 3, evaluated before resolve('a')
    expect(results[1].passed).toBe(true)  // count === 2, evaluated after resolve('a')
  })

  it('a failing assertion does not abort later assertions in the same test fence', () => {
    const testCode = `assert 1 === 2
assert 1 === 1`
    const harness = buildTestHarness('', testCode, 'javascript')
    const results = parseTestResults(runJSHarness(harness))
    expect(results.map(r => r.passed)).toEqual([false, true])
  })

  it('a throwing assertion expression reports FAIL with the error message, not a harness crash', () => {
    const testCode = `assert nonExistentFn() === 1
assert 1 === 1`
    const harness = buildTestHarness('', testCode, 'javascript')
    const results = parseTestResults(runJSHarness(harness))
    expect(results).toHaveLength(2)
    expect(results[0].passed).toBe(false)
    expect(results[1].passed).toBe(true)
  })
})

describe('buildTestHarness (python) — preamble/assertion interleaving', () => {
  it('emits the preamble line in its original source position, not bucketed before all assertions', () => {
    const testCode = `v1 = validate("x")
assert v1 == 1
v2 = validate("y")
assert v2 == 2`
    const harness = buildTestHarness('def validate(x): pass', testCode, 'python')
    const lines = harness.split('\n')
    const v1Idx = lines.findIndex(l => l.trim() === 'v1 = validate("x")')
    const firstAssertIdx = lines.findIndex(l => l.includes('assert v1 == 1'))
    const v2Idx = lines.findIndex(l => l.trim() === 'v2 = validate("y")')
    expect(v1Idx).toBeGreaterThan(-1)
    expect(v1Idx).toBeLessThan(firstAssertIdx)
    expect(v2Idx).toBeGreaterThan(firstAssertIdx)
  })

  it('prints each assertion result immediately (not buffered to a list printed at the end)', () => {
    const harness = buildTestHarness('', 'assert 1 == 1', 'python')
    expect(harness).not.toContain('__oc_results')
    expect(harness).toContain("print('__OC_TEST__PASS|assert 1 == 1')")
  })
})

describe('buildTestHarness (cpp) — per-assertion grading instead of <cassert> abort-on-first-failure', () => {
  it('wraps each assertion in try/catch so a failure does not abort the remaining checks', () => {
    const userCode = 'bool isPrime(int n) {\n  if (n <= 1) return false;\n  for (int i = 2; i < n; i++) if (n % i == 0) return false;\n  return true;\n}'
    const testCode = 'assert isPrime(7) == true\nassert isPrime(10) == false\nassert isPrime(1) == false'
    const harness = buildTestHarness(userCode, testCode, 'cpp')

    expect(harness).toContain('#include <iostream>')
    expect(harness).toContain('bool isPrime(int n)')
    expect(harness).toContain('int main() {')
    // Every assertion gets its own try/catch, not a bare assert() that aborts on failure
    expect((harness.match(/try \{/g) || []).length).toBe(3)
    expect(harness).not.toContain('#include <cassert>')
    expect(harness).toContain('__OC_TEST__" << (__ok ? "PASS" : "FAIL")')
  })

  it('preserves preamble/assertion interleaving for stateful class-based challenges', () => {
    const userCode = 'class Counter {\npublic:\n  int count = 0;\n  void increment() { count++; }\n};'
    const testCode = 'Counter c;\nc.increment();\nc.increment();\nassert c.count == 2'
    const harness = buildTestHarness(userCode, testCode, 'cpp')
    const lines = harness.split('\n')
    const counterIdx = lines.findIndex(l => l.trim() === 'Counter c;')
    const tryIdx = lines.findIndex(l => l.includes('try {') && lines.indexOf(l) > counterIdx)
    expect(counterIdx).toBeGreaterThan(-1)
    expect(tryIdx).toBeGreaterThan(counterIdx)
  })
})

describe('runSqlTests — grades raw query text via the JS runtime, no database needed', () => {
  const executor: Executor = async (code) => {
    const r = await runJSInline(code)
    const lines: { kind: 'stdout' | 'error'; text: string }[] = []
    if (r.output && r.output !== '(no output)') {
      r.output.split('\n').forEach(text => lines.push({ kind: 'stdout', text }))
    }
    if (r.error) lines.push({ kind: 'error', text: r.error })
    return { lines }
  }

  // Mirrors sql-fundamentals/level-1.md's real select_where test fence.
  const testCode = `var q = code.trim().toLowerCase().replace(/\\s+/g, ' ')
assert q.startsWith('select')
assert !q.includes('select *')
assert q.includes('title')
assert q.includes('from courses')`

  it('passes a correct query', async () => {
    const results = await runSqlTests('SELECT title FROM courses', testCode, executor)
    expect(results).toHaveLength(4)
    expect(results.every(r => r.passed)).toBe(true)
  })

  it('fails a query that violates a constraint (SELECT *)', async () => {
    const results = await runSqlTests('SELECT * FROM courses', testCode, executor)
    const startsWithFails = results.filter(r => !r.passed)
    expect(startsWithFails.length).toBeGreaterThan(0)
  })
})

describe('parseTestResults', () => {
  it('parses PASS/FAIL/ERROR-tagged lines and ignores everything else', () => {
    const results = parseTestResults([
      'unrelated program output',
      '__OC_TEST__PASS|assert 1 === 1',
      '__OC_TEST__FAIL|assert 1 === 2|',
      "__OC_TEST__ERROR|assert f()|f is not defined",
    ])
    expect(results).toEqual([
      { label: 'assert 1 === 1', passed: true, detail: undefined },
      { label: 'assert 1 === 2', passed: false, detail: 'Assertion failed' },
      { label: 'assert f()', passed: false, detail: 'Error: f is not defined' },
    ])
  })
})
