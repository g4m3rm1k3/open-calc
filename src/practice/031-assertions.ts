import type { PracticeChallenge } from './loader'

export const title = 'Assertions'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `assertPositive(n)` that throws `new Error('assertion failed: not positive')` if `n <= 0`, otherwise returns `true`.",
        starter: '',
        tests: `
assert assertPositive(5) === true
let caught = null
try { assertPositive(-1) } catch (e) { caught = e.message }
assert caught === 'assertion failed: not positive'
`,
        solution: "function assertPositive(n) { if (n <= 0) { throw new Error('assertion failed: not positive'); } return true; }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: "Finish `assertEqual(a, b)` so it throws a descriptive error (`'assertion failed: ' + a + ' !== ' + b`) if `a !== b`, otherwise returns `true`.",
        starter: 'function assertEqual(a, b) {\n  // TODO: throw a descriptive error if a !== b, else return true\n}',
        tests: `
assert assertEqual(1, 1) === true
let caught = null
try { assertEqual(1, 2) } catch (e) { caught = e.message }
assert caught === 'assertion failed: 1 !== 2'
`,
        solution: "function assertEqual(a, b) { if (a !== b) { throw new Error('assertion failed: ' + a + ' !== ' + b); } return true; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `assertAll(conditions)` that throws on the FIRST falsy value in `conditions`, with a message naming its index, otherwise returns `true`.",
        starter: '',
        tests: `
assert assertAll([true, true, true]) === true
let caught = null
try { assertAll([true, false, true]) } catch (e) { caught = e.message }
assert caught === 'assertion failed at index 1'
`,
        solution: "function assertAll(conditions) { for (let i = 0; i < conditions.length; i++) { if (!conditions[i]) { throw new Error('assertion failed at index ' + i); } } return true; }",
      },
    ],
  },
]

export default challenges
