import type { PracticeChallenge } from './loader'

export const title = 'Errors'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `makeError(message)` that returns a `new Error(message)`.',
        starter: '',
        tests: `
const e = makeError('bad')
assert e.message === 'bad'
assert e instanceof Error === true
`,
        solution: 'function makeError(message) { return new Error(message); }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: "Finish `describeError(err)` so it returns `err.name + ': ' + err.message`.",
        starter: 'function describeError(err) {\n  // TODO\n}',
        tests: `
assert describeError(new TypeError('oops')) === 'TypeError: oops'
assert describeError(new Error('x')) === 'Error: x'
`,
        solution: "function describeError(err) { return err.name + ': ' + err.message; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `validateAge(age)` that throws `new Error('Age must be non-negative')` if `age < 0`, otherwise returns `age`.",
        starter: '',
        tests: `
assert validateAge(5) === 5
let caught = null
try { validateAge(-1) } catch (e) { caught = e.message }
assert caught === 'Age must be non-negative'
`,
        solution: "function validateAge(age) { if (age < 0) { throw new Error('Age must be non-negative'); } return age; }",
      },
    ],
  },
]

export default challenges
