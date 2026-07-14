import type { PracticeChallenge } from './loader'

export const title = 'Arithmetic Operators'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `compute(a, b)` that returns `a + b - a * b`, combining `+`, `-`, and `*`.',
        starter: '',
        tests: `
assert compute(2, 3) === -1
assert compute(0, 5) === 5
assert compute(4, 4) === -8
`,
        solution: `function compute(a, b) { return a + b - a * b; }`,
      },
      {
        lang: 'typescript',
        prompt: 'Write `compute(a, b)` that returns `a + b - a * b`, combining `+`, `-`, and `*`.',
        starter: '',
        tests: `
assert compute(2, 3) === -1
assert compute(0, 5) === 5
assert compute(4, 4) === -8
`,
        solution: `function compute(a: number, b: number): number { return a + b - a * b; }`,
      },
      {
        lang: 'python',
        prompt: 'Write `compute(a, b)` that returns `a + b - a * b`, combining `+`, `-`, and `*`.',
        starter: '',
        tests: `
assert compute(2, 3) == -1
assert compute(0, 5) == 5
assert compute(4, 4) == -8
`,
        solution: `def compute(a, b):
    return a + b - a * b`,
      },
      {
        lang: 'java',
        prompt: 'Write `compute(a, b)` that returns `a + b - a * b`, combining `+`, `-`, and `*`.',
        starter: '',
        tests: `
assert compute(2, 3) == -1
assert compute(0, 5) == 5
assert compute(4, 4) == -8
`,
        solution: `static int compute(int a, int b) { return a + b - a * b; }`,
      },
      {
        lang: 'csharp',
        prompt: 'Write `Compute(a, b)` that returns `a + b - a * b`, combining `+`, `-`, and `*`.',
        starter: '',
        tests: `
assert Compute(2, 3) == -1
assert Compute(0, 5) == 5
assert Compute(4, 4) == -8
`,
        solution: `static int Compute(int a, int b) { return a + b - a * b; }`,
      },
      {
        lang: 'cpp',
        prompt: 'Write `compute(a, b)` that returns `a + b - a * b`, combining `+`, `-`, and `*`.',
        starter: '',
        tests: `
assert compute(2, 3) == -1
assert compute(0, 5) == 5
assert compute(4, 4) == -8
`,
        solution: `int compute(int a, int b) { return a + b - a * b; }`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `isEven(n)` using the modulo operator `%` to check divisibility by 2.',
        starter: `function isEven(n) {
  // TODO: use % to check divisibility by 2
}`,
        tests: `
assert isEven(4) === true
assert isEven(7) === false
assert isEven(0) === true
assert isEven(-4) === true
`,
        solution: `function isEven(n) {
  return n % 2 === 0;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'Finish `isEven(n)` using the modulo operator `%` to check divisibility by 2.',
        starter: `function isEven(n: number): boolean {
  // TODO: use % to check divisibility by 2
}`,
        tests: `
assert isEven(4) === true
assert isEven(7) === false
assert isEven(0) === true
assert isEven(-4) === true
`,
        solution: `function isEven(n: number): boolean {
  return n % 2 === 0;
}`,
      },
      {
        lang: 'python',
        prompt: 'Finish `is_even(n)` using the modulo operator `%` to check divisibility by 2.',
        starter: `def is_even(n):
    # TODO: use % to check divisibility by 2
    pass`,
        tests: `
assert is_even(4) == True
assert is_even(7) == False
assert is_even(0) == True
assert is_even(-4) == True
`,
        solution: `def is_even(n):
    return n % 2 == 0`,
      },
      {
        lang: 'java',
        prompt: 'Finish `isEven(n)` using the modulo operator `%` to check divisibility by 2.',
        starter: `static boolean isEven(int n) {
    // TODO: use % to check divisibility by 2
    return false;
}`,
        tests: `
assert isEven(4) == true
assert isEven(7) == false
assert isEven(0) == true
assert isEven(-4) == true
`,
        solution: `static boolean isEven(int n) {
    return n % 2 == 0;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Finish `IsEven(n)` using the modulo operator `%` to check divisibility by 2.',
        starter: `static bool IsEven(int n) {
    // TODO: use % to check divisibility by 2
    return false;
}`,
        tests: `
assert IsEven(4) == true
assert IsEven(7) == false
assert IsEven(0) == true
assert IsEven(-4) == true
`,
        solution: `static bool IsEven(int n) {
    return n % 2 == 0;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Finish `isEven(n)` using the modulo operator `%` to check divisibility by 2.',
        starter: `bool isEven(int n) {
    // TODO: use % to check divisibility by 2
    return false;
}`,
        tests: `
assert isEven(4) == true
assert isEven(7) == false
assert isEven(0) == true
assert isEven(-4) == true
`,
        solution: `bool isEven(int n) {
    return n % 2 == 0;
}`,
      },
    ],
  },
]

export default challenges
