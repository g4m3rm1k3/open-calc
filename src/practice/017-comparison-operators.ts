import type { PracticeChallenge } from './loader'

export const title = 'Comparison Operators'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'A comparison operator tests a relationship between two values. Write `isFreezing(tempC)` returning true if `tempC <= 0`.',
        starter: '',
        tests: `
assert isFreezing(0) === true
assert isFreezing(-5) === true
assert isFreezing(10) === false
`,
        solution: `function isFreezing(tempC) { return tempC <= 0; }`,
      },
      {
        lang: 'typescript',
        prompt: 'A comparison operator tests a relationship between two values. Write `isFreezing(tempC)` returning true if `tempC <= 0`.',
        starter: '',
        tests: `
assert isFreezing(0) === true
assert isFreezing(-5) === true
assert isFreezing(10) === false
`,
        solution: `function isFreezing(tempC: number): boolean { return tempC <= 0; }`,
      },
      {
        lang: 'python',
        prompt: 'A comparison operator tests a relationship between two values. Write `is_freezing(temp_c)` returning True if `temp_c <= 0`.',
        starter: '',
        tests: `
assert is_freezing(0) == True
assert is_freezing(-5) == True
assert is_freezing(10) == False
`,
        solution: `def is_freezing(temp_c):
    return temp_c <= 0`,
      },
      {
        lang: 'java',
        prompt: 'A comparison operator tests a relationship between two values. Write `isFreezing(tempC)` returning true if `tempC <= 0`.',
        starter: '',
        tests: `
assert isFreezing(0) == true
assert isFreezing(-5) == true
assert isFreezing(10) == false
`,
        solution: `static boolean isFreezing(int tempC) { return tempC <= 0; }`,
      },
      {
        lang: 'csharp',
        prompt: 'A comparison operator tests a relationship between two values. Write `IsFreezing(tempC)` returning true if `tempC <= 0`.',
        starter: '',
        tests: `
assert IsFreezing(0) == true
assert IsFreezing(-5) == true
assert IsFreezing(10) == false
`,
        solution: `static bool IsFreezing(int tempC) { return tempC <= 0; }`,
      },
      {
        lang: 'cpp',
        prompt: 'A comparison operator tests a relationship between two values. Write `isFreezing(tempC)` returning true if `tempC <= 0`.',
        starter: '',
        tests: `
assert isFreezing(0) == true
assert isFreezing(-5) == true
assert isFreezing(10) == false
`,
        solution: `bool isFreezing(int tempC) { return tempC <= 0; }`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `clampToZero(n)`: return `0` if `n < 0`, otherwise return `n` itself.',
        starter: `function clampToZero(n) {
  // TODO: return 0 if n < 0, otherwise return n
}`,
        tests: `
assert clampToZero(-5) === 0
assert clampToZero(5) === 5
assert clampToZero(0) === 0
`,
        solution: `function clampToZero(n) {
  if (n < 0) {
    return 0;
  }
  return n;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'Finish `clampToZero(n)`: return `0` if `n < 0`, otherwise return `n` itself.',
        starter: `function clampToZero(n: number): number {
  // TODO: return 0 if n < 0, otherwise return n
}`,
        tests: `
assert clampToZero(-5) === 0
assert clampToZero(5) === 5
assert clampToZero(0) === 0
`,
        solution: `function clampToZero(n: number): number {
  if (n < 0) {
    return 0;
  }
  return n;
}`,
      },
      {
        lang: 'python',
        prompt: 'Finish `clamp_to_zero(n)`: return `0` if `n < 0`, otherwise return `n` itself.',
        starter: `def clamp_to_zero(n):
    # TODO: return 0 if n < 0, otherwise return n
    pass`,
        tests: `
assert clamp_to_zero(-5) == 0
assert clamp_to_zero(5) == 5
assert clamp_to_zero(0) == 0
`,
        solution: `def clamp_to_zero(n):
    if n < 0:
        return 0
    return n`,
      },
      {
        lang: 'java',
        prompt: 'Finish `clampToZero(n)`: return `0` if `n < 0`, otherwise return `n` itself.',
        starter: `static int clampToZero(int n) {
    // TODO: return 0 if n < 0, otherwise return n
    return 0;
}`,
        tests: `
assert clampToZero(-5) == 0
assert clampToZero(5) == 5
assert clampToZero(0) == 0
`,
        solution: `static int clampToZero(int n) {
    if (n < 0) {
        return 0;
    }
    return n;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Finish `ClampToZero(n)`: return `0` if `n < 0`, otherwise return `n` itself.',
        starter: `static int ClampToZero(int n) {
    // TODO: return 0 if n < 0, otherwise return n
    return 0;
}`,
        tests: `
assert ClampToZero(-5) == 0
assert ClampToZero(5) == 5
assert ClampToZero(0) == 0
`,
        solution: `static int ClampToZero(int n) {
    if (n < 0) {
        return 0;
    }
    return n;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Finish `clampToZero(n)`: return `0` if `n < 0`, otherwise return `n` itself.',
        starter: `int clampToZero(int n) {
    // TODO: return 0 if n < 0, otherwise return n
    return 0;
}`,
        tests: `
assert clampToZero(-5) == 0
assert clampToZero(5) == 5
assert clampToZero(0) == 0
`,
        solution: `int clampToZero(int n) {
    if (n < 0) {
        return 0;
    }
    return n;
}`,
      },
    ],
  },
]

export default challenges
