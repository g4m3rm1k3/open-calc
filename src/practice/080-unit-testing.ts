import type { PracticeChallenge } from './loader'

export const title = 'Unit Testing'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `assertEqual(actual, expected)` returning `{ pass, actual, expected }`, where `pass` is `true` only if `actual === expected` — the Assert step of Arrange-Act-Assert, made into a reusable, checkable value instead of a printed line.',
        starter: '',
        tests: `
assert JSON.stringify(assertEqual(4, 4)) === JSON.stringify({pass:true, actual:4, expected:4})
assert JSON.stringify(assertEqual(4, 5)) === JSON.stringify({pass:false, actual:4, expected:5})
`,
        solution: `function assertEqual(actual, expected) {
  return { pass: actual === expected, actual, expected }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `runTests(cases)`, where each case is `{ name, actual, expected }`. Return `{ passed, failed, failures }` — `passed`/`failed` are counts, and `failures` is an array of the `name` of every case where `actual !== expected`.',
        starter: 'function runTests(cases) {\n  // TODO: return { passed, failed, failures } — failures is an array of the\n  // "name" of each case where actual !== expected\n  return { passed: 0, failed: 0, failures: [] }\n}',
        tests: `
const cases = [
  { name: 'isEven(4)', actual: true, expected: true },
  { name: 'isEven(7)', actual: false, expected: false },
  { name: 'isEven(0)', actual: true, expected: false },
]
const result = runTests(cases)
assert result.passed === 2
assert result.failed === 1
assert JSON.stringify(result.failures) === JSON.stringify(['isEven(0)'])
`,
        solution: `function runTests(cases) {
  let passed = 0
  let failed = 0
  const failures = []
  for (const c of cases) {
    if (c.actual === c.expected) passed++
    else { failed++; failures.push(c.name) }
  }
  return { passed, failed, failures }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `runSuite(fn, cases)`, where `cases` is an array of `[input, expected]` pairs. For each pair, CALL `fn(input)` (the Act step) and compare it to `expected` (the Assert step), returning an array of `{ input, expected, actual, pass }`.',
        starter: '',
        tests: `
function isEven(n) { return n % 2 === 0 }
const results = runSuite(isEven, [[4,true],[7,false],[0,true],[-2,true]])
assert results.every(r => r.pass === true)
assert results.length === 4
assert results[0].actual === true
`,
        solution: `function runSuite(fn, cases) {
  return cases.map(([input, expected]) => {
    const actual = fn(input)
    return { input, expected, actual, pass: actual === expected }
  })
}`,
      },
    ],
  },
]

export default challenges
