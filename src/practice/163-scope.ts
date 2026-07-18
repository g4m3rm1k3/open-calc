import type { PracticeChallenge } from './loader'

export const title = 'Scope'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a global `x`, a function `outer()` declaring its own `y`, with a nested `inner()` declaring its own `z`. `inner()` must return all three joined as `"x, y, z"` — following the scope chain outward from its own scope through `outer`\'s to global.',
        starter: '',
        tests: `
assert outer() === 'global, outer, inner'
`,
        solution: `let x = 'global'
function outer() {
  let y = 'outer'
  function inner() {
    let z = 'inner'
    return x + ', ' + y + ', ' + z
  }
  return inner()
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `makeCounter()`: `count` must be declared INSIDE `makeCounter`, in the smallest scope that actually needs it — not shared at module level, which would make every counter secretly interfere with every other one instead of being independent.',
        starter: 'let count = 0\nfunction makeCounter() {\n  // TODO: count must be declared INSIDE makeCounter (minimal scope), not\n  // shared at module level — otherwise every counter created shares the\n  // same state instead of being independent\n  return function() { return ++count }\n}',
        tests: `
const counterA = makeCounter()
const counterB = makeCounter()
assert counterA() === 1
assert counterA() === 2
assert counterB() === 1
`,
        solution: `function makeCounter() {
  let count = 0
  return function() { return ++count }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `outerAttempt()`: it calls a nested `inner()` that declares its own local `secret`, then tries to read `secret` from OUTSIDE `inner()` — this must fail (visibility only flows inward-to-outward, never the reverse), so catch the error and return `\'ReferenceError: cannot access inner scope\'`.',
        starter: '',
        tests: `
assert outerAttempt() === 'ReferenceError: cannot access inner scope'
`,
        solution: `function outerAttempt() {
  function inner() {
    let secret = 'hidden'
  }
  inner()
  try {
    return secret
  } catch (e) {
    return 'ReferenceError: cannot access inner scope'
  }
}`,
      },
    ],
  },
]

export default challenges
