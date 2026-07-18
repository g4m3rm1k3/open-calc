import type { PracticeChallenge } from './loader'

export const title = 'Stack'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeStack2()` returning `{ push(x), pop(), peek(), size() }`, LIFO ordered.',
        starter: '',
        tests: `
const s = makeStack2()
assert (s.push(1), true)
assert (s.push(2), true)
assert s.peek() === 2
assert s.pop() === 2
assert s.size() === 1
`,
        solution: 'function makeStack2() { const items = []; return { push: x => items.push(x), pop: () => items.pop(), peek: () => items[items.length-1], size: () => items.length }; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `isBalanced(str)` using a stack to check whether every `(`, `[`, `{` in `str` is properly closed and nested.',
        starter: 'function isBalanced(str) {\n  // TODO: use a stack to check that all brackets in str are balanced\n}',
        tests: `
assert isBalanced('([]{})') === true
assert isBalanced('([)]') === false
assert isBalanced('(') === false
`,
        solution: `function isBalanced(str) {
  const stack = []
  const pairs = { ')': '(', ']': '[', '}': '{' }
  for (const ch of str) {
    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch)
    else if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false
    }
  }
  return stack.length === 0
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `evalRPN(tokens)` that evaluates a Reverse Polish Notation expression using a stack.',
        starter: '',
        tests: `
assert evalRPN(['2','1','+','3','*']) === 9
assert evalRPN(['4','13','5','/','+']) === 6
`,
        solution: `function evalRPN(tokens) {
  const stack = []
  for (const t of tokens) {
    if (['+','-','*','/'].includes(t)) {
      const b = stack.pop()
      const a = stack.pop()
      if (t === '+') stack.push(a + b)
      else if (t === '-') stack.push(a - b)
      else if (t === '*') stack.push(a * b)
      else stack.push(Math.trunc(a / b))
    } else {
      stack.push(Number(t))
    }
  }
  return stack.pop()
}`,
      },
    ],
  },
]

export default challenges
