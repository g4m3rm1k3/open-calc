import type { PracticeChallenge } from './loader'

export const title = 'Expressions'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'An expression is code that evaluates to a value. Write a function `evaluate()` that returns the value of `3 + 4 * 2`.',
        starter: '',
        tests: `assert evaluate() === 11`,
        solution: `function evaluate() { return 3 + 4 * 2; }`,
      },
      {
        lang: 'typescript',
        prompt: 'An expression is code that evaluates to a value. Write a function `evaluate()` that returns the value of `3 + 4 * 2`.',
        starter: '',
        tests: `assert evaluate() === 11`,
        solution: `function evaluate(): number { return 3 + 4 * 2; }`,
      },
      {
        lang: 'python',
        prompt: 'An expression is code that evaluates to a value. Write a function `evaluate()` that returns the value of `3 + 4 * 2`.',
        starter: '',
        tests: `assert evaluate() == 11`,
        solution: `def evaluate():\n    return 3 + 4 * 2`,
      },
      {
        lang: 'java',
        prompt: 'An expression is code that evaluates to a value. Write a method `evaluate()` that returns the value of `3 + 4 * 2`.',
        starter: '',
        tests: `assert evaluate() == 11`,
        solution: `static int evaluate() { return 3 + 4 * 2; }`,
      },
      {
        lang: 'csharp',
        prompt: 'An expression is code that evaluates to a value. Write a method `Evaluate()` that returns the value of `3 + 4 * 2`.',
        starter: '',
        tests: `assert Evaluate() == 11`,
        solution: `static int Evaluate() { return 3 + 4 * 2; }`,
      },
      {
        lang: 'cpp',
        prompt: 'An expression is code that evaluates to a value. Write a function `evaluate()` that returns the value of `3 + 4 * 2`.',
        starter: '',
        tests: `assert evaluate() == 11`,
        solution: `int evaluate() { return 3 + 4 * 2; }`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `average(a, b, c)` so it returns the value of the expression `(a + b + c) / 3`.',
        starter: `function average(a, b, c) {
  // TODO: return (a + b + c) / 3
}`,
        tests: `
assert average(1, 2, 3) === 2
assert average(0, 0, 0) === 0
assert average(4, 5, 6) === 5
`,
        solution: `function average(a, b, c) {
  return (a + b + c) / 3;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'Finish `average(a, b, c)` so it returns the value of the expression `(a + b + c) / 3`.',
        starter: `function average(a: number, b: number, c: number): number {
  // TODO: return (a + b + c) / 3
}`,
        tests: `
assert average(1, 2, 3) === 2
assert average(0, 0, 0) === 0
assert average(4, 5, 6) === 5
`,
        solution: `function average(a: number, b: number, c: number): number {
  return (a + b + c) / 3;
}`,
      },
      {
        lang: 'python',
        prompt: 'Finish `average(a, b, c)` so it returns the value of the expression `(a + b + c) / 3`.',
        starter: `def average(a, b, c):
    # TODO: return (a + b + c) / 3
    pass`,
        tests: `
assert average(1, 2, 3) == 2
assert average(0, 0, 0) == 0
assert average(4, 5, 6) == 5
`,
        solution: `def average(a, b, c):
    return (a + b + c) / 3`,
      },
      {
        lang: 'java',
        prompt: 'Finish `average(a, b, c)` so it returns the value of the expression `(a + b + c) / 3`.',
        starter: `static int average(int a, int b, int c) {
    // TODO: return (a + b + c) / 3
    return 0;
}`,
        tests: `
assert average(1, 2, 3) == 2
assert average(0, 0, 0) == 0
assert average(4, 5, 6) == 5
`,
        solution: `static int average(int a, int b, int c) {
    return (a + b + c) / 3;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Finish `Average(a, b, c)` so it returns the value of the expression `(a + b + c) / 3`.',
        starter: `static int Average(int a, int b, int c) {
    // TODO: return (a + b + c) / 3
    return 0;
}`,
        tests: `
assert Average(1, 2, 3) == 2
assert Average(0, 0, 0) == 0
assert Average(4, 5, 6) == 5
`,
        solution: `static int Average(int a, int b, int c) {
    return (a + b + c) / 3;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Finish `average(a, b, c)` so it returns the value of the expression `(a + b + c) / 3`.',
        starter: `int average(int a, int b, int c) {
    // TODO: return (a + b + c) / 3
    return 0;
}`,
        tests: `
assert average(1, 2, 3) == 2
assert average(0, 0, 0) == 0
assert average(4, 5, 6) == 5
`,
        solution: `int average(int a, int b, int c) {
    return (a + b + c) / 3;
}`,
      },
    ],
  },
]

export default challenges
