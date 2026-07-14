import type { PracticeChallenge } from './loader'

export const title = 'Function'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `double(n)` that returns `n` multiplied by 2.',
        starter: '',
        tests: `
assert double(2) === 4
assert double(0) === 0
assert double(-3) === -6
`,
        solution: 'function double(n) { return n * 2; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `sumArray` so it returns the sum of every number in `arr`.',
        starter: `function sumArray(arr) {
  // TODO: return the sum of every number in arr
}`,
        tests: `
assert sumArray([1, 2, 3]) === 6
assert sumArray([]) === 0
assert sumArray([5]) === 5
assert sumArray([-2, 2]) === 0
`,
        solution: `function sumArray(arr) {
  return arr.reduce((a, b) => a + b, 0);
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `isPalindrome(str)` that returns true if `str` reads the same forwards and backwards.',
        starter: '',
        tests: `
assert isPalindrome('racecar') === true
assert isPalindrome('hello') === false
assert isPalindrome('') === true
assert isPalindrome('a') === true
`,
        solution: `function isPalindrome(str) {
  return str === str.split('').reverse().join('');
}`,
      },
    ],
  },
]

export default challenges
