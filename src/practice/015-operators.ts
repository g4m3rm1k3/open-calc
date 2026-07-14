import type { PracticeChallenge } from './loader'

export const title = 'Operators'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'An operator combines values into a new value. Write `calculate(a, b, op)` that applies `op` (`\'+\'`, `\'-\'`, `\'*\'`, or `\'/\'`) to `a` and `b`.',
        starter: '',
        tests: `
assert calculate(4, 2, '+') === 6
assert calculate(4, 2, '-') === 2
assert calculate(4, 2, '*') === 8
assert calculate(4, 2, '/') === 2
`,
        solution: `function calculate(a, b, op) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  return a / b;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'An operator combines values into a new value. Write `calculate(a, b, op)` that applies `op` (`\'+\'`, `\'-\'`, `\'*\'`, or `\'/\'`) to `a` and `b`.',
        starter: '',
        tests: `
assert calculate(4, 2, '+') === 6
assert calculate(4, 2, '-') === 2
assert calculate(4, 2, '*') === 8
assert calculate(4, 2, '/') === 2
`,
        solution: `function calculate(a: number, b: number, op: string): number {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  return a / b;
}`,
      },
      {
        lang: 'python',
        prompt: 'An operator combines values into a new value. Write `calculate(a, b, op)` that applies `op` (`\'+\'`, `\'-\'`, `\'*\'`, or `\'/\'`) to `a` and `b`.',
        starter: '',
        tests: `
assert calculate(4, 2, '+') == 6
assert calculate(4, 2, '-') == 2
assert calculate(4, 2, '*') == 8
assert calculate(4, 2, '/') == 2
`,
        solution: `def calculate(a, b, op):
    if op == '+':
        return a + b
    if op == '-':
        return a - b
    if op == '*':
        return a * b
    return a / b`,
      },
      {
        lang: 'java',
        prompt: 'An operator combines values into a new value. Write `calculate(a, b, op)` that applies `op` (`"+"`, `"-"`, `"*"`, or `"/"`) to `a` and `b`.',
        starter: '',
        tests: `
assert calculate(4, 2, "+") == 6
assert calculate(4, 2, "-") == 2
assert calculate(4, 2, "*") == 8
assert calculate(4, 2, "/") == 2
`,
        solution: `static int calculate(int a, int b, String op) {
    if (op.equals("+")) return a + b;
    if (op.equals("-")) return a - b;
    if (op.equals("*")) return a * b;
    return a / b;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'An operator combines values into a new value. Write `Calculate(a, b, op)` that applies `op` (`"+"`, `"-"`, `"*"`, or `"/"`) to `a` and `b`.',
        starter: '',
        tests: `
assert Calculate(4, 2, "+") == 6
assert Calculate(4, 2, "-") == 2
assert Calculate(4, 2, "*") == 8
assert Calculate(4, 2, "/") == 2
`,
        solution: `static int Calculate(int a, int b, string op) {
    if (op == "+") return a + b;
    if (op == "-") return a - b;
    if (op == "*") return a * b;
    return a / b;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'An operator combines values into a new value. Write `calculate(a, b, op)` that applies `op` (`"+"`, `"-"`, `"*"`, or `"/"`) to `a` and `b`.',
        starter: '',
        tests: `
assert calculate(4, 2, "+") == 6
assert calculate(4, 2, "-") == 2
assert calculate(4, 2, "*") == 8
assert calculate(4, 2, "/") == 2
`,
        solution: `int calculate(int a, int b, std::string op) {
    if (op == "+") return a + b;
    if (op == "-") return a - b;
    if (op == "*") return a * b;
    return a / b;
}`,
      },
    ],
  },
]

export default challenges
