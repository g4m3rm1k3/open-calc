import type { PracticeChallenge } from './loader'

export const title = 'Interpreter Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeNum(value)` returning `{ interpret() }` that returns `value` directly (the base case), and `makeAdd(left, right)` returning `{ interpret() }` that returns `left.interpret() + right.interpret()`.',
        starter: '',
        tests: `
const expr = makeAdd(makeNum(3), makeNum(4))
assert expr.interpret() === 7
const nested = makeAdd(makeAdd(makeNum(2), makeNum(3)), makeNum(4))
assert nested.interpret() === 9
`,
        solution: `function makeNum(value) {
  return { interpret: () => value }
}
function makeAdd(left, right) {
  return { interpret: () => left.interpret() + right.interpret() }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `makeSubtract(left, right)`, following the same shape as `makeAdd`: `interpret()` must return `left.interpret() - right.interpret()`.',
        starter: 'function makeNum(value) {\n  return { interpret: () => value }\n}\nfunction makeSubtract(left, right) {\n  // TODO: interpret() must return left.interpret() - right.interpret()\n  return { interpret: () => 0 }\n}',
        tests: `
const expr = makeSubtract(makeSubtract(makeNum(10), makeNum(3)), makeNum(2))
assert expr.interpret() === 5
`,
        solution: `function makeNum(value) {
  return { interpret: () => value }
}
function makeSubtract(left, right) {
  return { interpret: () => left.interpret() - right.interpret() }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeAdd`, `makeSubtract`, `makeMultiply` (each `{ interpret() }`, combining two sub-expressions), and `parseRPN(tokens)` that parses a Reverse Polish Notation token array (e.g. `[\'3\',\'4\',\'+\']`) into a tree of these nodes using a stack, returning the root node.',
        starter: '',
        tests: `
assert parseRPN(['3','4','+']).interpret() === 7
assert parseRPN(['10','3','-','2','-']).interpret() === 5
assert parseRPN(['2','3','+','4','*']).interpret() === 20
`,
        solution: `function makeNum(value) { return { interpret: () => value } }
function makeAdd(l, r) { return { interpret: () => l.interpret() + r.interpret() } }
function makeSubtract(l, r) { return { interpret: () => l.interpret() - r.interpret() } }
function makeMultiply(l, r) { return { interpret: () => l.interpret() * r.interpret() } }
function parseRPN(tokens) {
  const stack = []
  for (const token of tokens) {
    if (token === '+') { const r = stack.pop(), l = stack.pop(); stack.push(makeAdd(l, r)) }
    else if (token === '-') { const r = stack.pop(), l = stack.pop(); stack.push(makeSubtract(l, r)) }
    else if (token === '*') { const r = stack.pop(), l = stack.pop(); stack.push(makeMultiply(l, r)) }
    else stack.push(makeNum(Number(token)))
  }
  return stack.pop()
}`,
      },
    ],
  },
]

export default challenges
