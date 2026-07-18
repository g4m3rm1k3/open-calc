import type { PracticeChallenge } from './loader'

export const title = 'Currying'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `curriedAdd(a)` returning a FUNCTION that takes `b` and returns `a + b`. `curriedAdd(2)` alone must be a function, not a number; `curriedAdd(2)(3)` computes the final result; the intermediate function is reusable with different `b` values.',
        starter: '',
        tests: `
assert typeof curriedAdd(2) === 'function'
assert curriedAdd(2)(3) === 5
const add2 = curriedAdd(2)
assert add2(10) === 12
assert add2(100) === 102
`,
        solution: `function curriedAdd(a) {
  return function(b) {
    return a + b
  }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `curriedMultiply(a)`: it must return a FUNCTION still waiting for `b`, not compute the result directly — currying specifically means each step returns a new callable, not just a function with the first argument already applied inline.',
        starter: 'function curriedMultiply(a) {\n  // TODO: this must return a FUNCTION still waiting for b, not compute the\n  // result directly — currying means each step returns a new callable\n  return a\n}',
        tests: `
assert typeof curriedMultiply(2) === 'function'
const double = curriedMultiply(2)
assert double(5) === 10
assert double(7) === 14
`,
        solution: `function curriedMultiply(a) {
  return function(b) {
    return a * b
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `curry3(fn)`, a generic currying utility: transform any 3-argument function `fn(a, b, c)` into a chain `curried(a)(b)(c)`, where each intermediate step returns a new function remembering the arguments supplied so far via closure.',
        starter: '',
        tests: `
function addThree(a, b, c) { return a + b + c }
const curried = curry3(addThree)
assert curried(1)(2)(3) === 6
const add1 = curried(1)
const add1and2 = add1(2)
assert add1and2(10) === 13
`,
        solution: `function curry3(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return fn(a, b, c)
      }
    }
  }
}`,
      },
    ],
  },
]

export default challenges
