import type { PracticeChallenge } from './loader'

export const title = 'Hoisting'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `checkVarHoisting()` (reads `hoistedVar` BEFORE its `var` declaration, returning that value — should be `undefined`, not an error) and `callSayHiEarly()` (calls `sayHi()` BEFORE its function declaration, returning its result — should work, since declarations are hoisted with their full body).',
        starter: '',
        tests: `
assert checkVarHoisting() === undefined
assert callSayHiEarly() === 'hi'
`,
        solution: `function checkVarHoisting() {
  const before = hoistedVar
  var hoistedVar = 'value'
  return before
}
function callSayHiEarly() {
  const result = sayHi()
  function sayHi() { return 'hi' }
  return result
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `checkLetTemporalDeadZone()`: use `let` for `letVar`, not `var` — `let` is left inaccessible (the "temporal dead zone") until its own declaration line runs, so reading it earlier must throw a `ReferenceError`, not silently return `undefined`.',
        starter: 'function checkLetTemporalDeadZone() {\n  // TODO: use "let" for letVar, not "var" — let is left in the temporal\n  // dead zone until its own declaration line runs, so reading it earlier\n  // must throw a ReferenceError, not silently return undefined\n  try {\n    const before = letVar\n    var letVar = \'value\'\n    return \'no error\'\n  } catch (e) {\n    return e.constructor.name\n  }\n}',
        tests: `
assert checkLetTemporalDeadZone() === 'ReferenceError'
`,
        solution: `function checkLetTemporalDeadZone() {
  try {
    const before = letVar
    let letVar = 'value'
    return 'no error'
  } catch (e) {
    return e.constructor.name
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
        prompt: 'Write `checkFunctionExpressionHoisting()`: unlike a function DECLARATION, a function EXPRESSION assigned to `const` is NOT callable before its own line — calling `sayHiExpr()` before that assignment must throw a `ReferenceError` (the `const` is still in its temporal dead zone), which you should catch and return the error\'s constructor name.',
        starter: '',
        tests: `
assert checkFunctionExpressionHoisting() === 'ReferenceError'
`,
        solution: `function checkFunctionExpressionHoisting() {
  try {
    const result = sayHiExpr()
    const sayHiExpr = function() { return 'hi' }
    return 'no error: ' + result
  } catch (e) {
    return e.constructor.name
  }
}`,
      },
    ],
  },
]

export default challenges
