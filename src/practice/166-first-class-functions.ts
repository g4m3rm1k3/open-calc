import type { PracticeChallenge } from './loader'

export const title = 'First-Class Functions'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `callTwice(fn)` returning `[fn(), fn()]` (accepting a function AS A VALUE, calling it twice inside), and `makeGreeter()` returning a NEW function (`() => \'hi there\'`) — just like returning any other value.',
        starter: '',
        tests: `
const greet = function() { return 'hi' }
assert JSON.stringify(callTwice(greet)) === JSON.stringify(['hi','hi'])
const g = makeGreeter()
assert g() === 'hi there'
`,
        solution: `function callTwice(fn) { return [fn(), fn()] }
function makeGreeter() {
  return function() { return 'hi there' }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `wrapFunctions(fns)`: it must store each function ITSELF as `ref`, not the RESULT of calling it — writing `fn()` instead of `fn` calls it immediately, storing a plain value instead of a reusable function reference.',
        starter: 'function wrapFunctions(fns) {\n  // TODO: store the function itself as "ref", not the RESULT of calling it —\n  // passing fn() instead of fn calls it immediately, storing a value instead\n  // of a reusable function reference\n  return fns.map(fn => ({ name: fn.name, ref: fn() }))\n}',
        tests: `
function greet() { return 'hi' }
function shout() { return 'HI' }
const wrapped = wrapFunctions([greet, shout])
assert typeof wrapped[0].ref === 'function'
assert wrapped[0].ref() === 'hi'
assert wrapped[1].ref() === 'HI'
`,
        solution: `function wrapFunctions(fns) {
  return fns.map(fn => ({ name: fn.name, ref: fn }))
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `composeFunctions(fns)` returning a NEW function that, when called with an input, pipes it through every function in `fns` in order — each one\'s output becomes the next one\'s input. This builds a brand-new function dynamically out of other functions, only possible because functions are ordinary, passable values.',
        starter: '',
        tests: `
const addOne = x => x + 1
const double = x => x * 2
const pipeline = composeFunctions([addOne, double])
assert pipeline(3) === 8
`,
        solution: `function composeFunctions(fns) {
  return function(input) {
    return fns.reduce((value, fn) => fn(value), input)
  }
}`,
      },
    ],
  },
]

export default challenges
