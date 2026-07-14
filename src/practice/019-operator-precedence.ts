import type { PracticeChallenge } from './loader'

export const title = 'Operator Precedence'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Precedence decides which operator runs first. Write `applyPrecedence(a, b, c, d)` returning the value of `a + b * c - d` (multiplication before addition/subtraction).',
        starter: '',
        tests: `
assert applyPrecedence(2, 3, 4, 1) === 13
assert applyPrecedence(0, 5, 5, 0) === 25
assert applyPrecedence(10, 0, 9, 10) === 0
`,
        solution: `function applyPrecedence(a, b, c, d) { return a + b * c - d; }`,
      },
      {
        lang: 'typescript',
        prompt: 'Precedence decides which operator runs first. Write `applyPrecedence(a, b, c, d)` returning the value of `a + b * c - d` (multiplication before addition/subtraction).',
        starter: '',
        tests: `
assert applyPrecedence(2, 3, 4, 1) === 13
assert applyPrecedence(0, 5, 5, 0) === 25
assert applyPrecedence(10, 0, 9, 10) === 0
`,
        solution: `function applyPrecedence(a: number, b: number, c: number, d: number): number { return a + b * c - d; }`,
      },
      {
        lang: 'python',
        prompt: 'Precedence decides which operator runs first. Write `apply_precedence(a, b, c, d)` returning the value of `a + b * c - d` (multiplication before addition/subtraction).',
        starter: '',
        tests: `
assert apply_precedence(2, 3, 4, 1) == 13
assert apply_precedence(0, 5, 5, 0) == 25
assert apply_precedence(10, 0, 9, 10) == 0
`,
        solution: `def apply_precedence(a, b, c, d):
    return a + b * c - d`,
      },
      {
        lang: 'java',
        prompt: 'Precedence decides which operator runs first. Write `applyPrecedence(a, b, c, d)` returning the value of `a + b * c - d` (multiplication before addition/subtraction).',
        starter: '',
        tests: `
assert applyPrecedence(2, 3, 4, 1) == 13
assert applyPrecedence(0, 5, 5, 0) == 25
assert applyPrecedence(10, 0, 9, 10) == 0
`,
        solution: `static int applyPrecedence(int a, int b, int c, int d) { return a + b * c - d; }`,
      },
      {
        lang: 'csharp',
        prompt: 'Precedence decides which operator runs first. Write `ApplyPrecedence(a, b, c, d)` returning the value of `a + b * c - d` (multiplication before addition/subtraction).',
        starter: '',
        tests: `
assert ApplyPrecedence(2, 3, 4, 1) == 13
assert ApplyPrecedence(0, 5, 5, 0) == 25
assert ApplyPrecedence(10, 0, 9, 10) == 0
`,
        solution: `static int ApplyPrecedence(int a, int b, int c, int d) { return a + b * c - d; }`,
      },
      {
        lang: 'cpp',
        prompt: 'Precedence decides which operator runs first. Write `applyPrecedence(a, b, c, d)` returning the value of `a + b * c - d` (multiplication before addition/subtraction).',
        starter: '',
        tests: `
assert applyPrecedence(2, 3, 4, 1) == 13
assert applyPrecedence(0, 5, 5, 0) == 25
assert applyPrecedence(10, 0, 9, 10) == 0
`,
        solution: `int applyPrecedence(int a, int b, int c, int d) { return a + b * c - d; }`,
      },
    ],
  },
]

export default challenges
