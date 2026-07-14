import type { PracticeChallenge } from './loader'

export const title = 'Blocks'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'A block groups statements to run together, like the body of an `if`. Write `absSum(a, b)`: compute `a + b`, then inside an `if` block negate it if it\'s negative, then return it.',
        starter: '',
        tests: `
assert absSum(-3, -4) === 7
assert absSum(3, 4) === 7
assert absSum(0, 0) === 0
`,
        solution: `function absSum(a, b) {
  let sum = a + b;
  if (sum < 0) {
    sum = -sum;
  }
  return sum;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'A block groups statements to run together, like the body of an `if`. Write `absSum(a, b)`: compute `a + b`, then inside an `if` block negate it if it\'s negative, then return it.',
        starter: '',
        tests: `
assert absSum(-3, -4) === 7
assert absSum(3, 4) === 7
assert absSum(0, 0) === 0
`,
        solution: `function absSum(a: number, b: number): number {
  let sum: number = a + b;
  if (sum < 0) {
    sum = -sum;
  }
  return sum;
}`,
      },
      {
        lang: 'python',
        prompt: 'An indented block groups statements to run together, like the body of an `if`. Write `abs_sum(a, b)`: compute `a + b`, then inside an `if` block negate it if it\'s negative, then return it.',
        starter: '',
        tests: `
assert abs_sum(-3, -4) == 7
assert abs_sum(3, 4) == 7
assert abs_sum(0, 0) == 0
`,
        solution: `def abs_sum(a, b):
    total = a + b
    if total < 0:
        total = -total
    return total`,
      },
      {
        lang: 'java',
        prompt: 'A block groups statements to run together, like the body of an `if`. Write `absSum(a, b)`: compute `a + b`, then inside an `if` block negate it if it\'s negative, then return it.',
        starter: '',
        tests: `
assert absSum(-3, -4) == 7
assert absSum(3, 4) == 7
assert absSum(0, 0) == 0
`,
        solution: `static int absSum(int a, int b) {
    int sum = a + b;
    if (sum < 0) {
        sum = -sum;
    }
    return sum;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'A block groups statements to run together, like the body of an `if`. Write `AbsSum(a, b)`: compute `a + b`, then inside an `if` block negate it if it\'s negative, then return it.',
        starter: '',
        tests: `
assert AbsSum(-3, -4) == 7
assert AbsSum(3, 4) == 7
assert AbsSum(0, 0) == 0
`,
        solution: `static int AbsSum(int a, int b) {
    int sum = a + b;
    if (sum < 0) {
        sum = -sum;
    }
    return sum;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'A block groups statements to run together, like the body of an `if`. Write `absSum(a, b)`: compute `a + b`, then inside an `if` block negate it if it\'s negative, then return it.',
        starter: '',
        tests: `
assert absSum(-3, -4) == 7
assert absSum(3, 4) == 7
assert absSum(0, 0) == 0
`,
        solution: `int absSum(int a, int b) {
    int sum = a + b;
    if (sum < 0) {
        sum = -sum;
    }
    return sum;
}`,
      },
    ],
  },
]

export default challenges
