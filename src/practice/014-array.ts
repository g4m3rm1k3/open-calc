import type { PracticeChallenge } from './loader'

export const title = 'Array'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `maxOf(arr)` that returns the largest number in `arr`.',
        starter: '',
        tests: `
assert maxOf([1, 5, 3]) === 5
assert maxOf([-1, -5, -3]) === -1
assert maxOf([7]) === 7
`,
        solution: 'function maxOf(arr) { return Math.max(...arr); }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `removeDuplicates` so it returns a new array with duplicate values removed, keeping the first occurrence of each and preserving order.',
        starter: `function removeDuplicates(arr) {
  // TODO: return a new array with duplicates removed, order preserved
}`,
        tests: `
assert JSON.stringify(removeDuplicates([1, 2, 2, 3, 1])) === JSON.stringify([1, 2, 3])
assert JSON.stringify(removeDuplicates([])) === JSON.stringify([])
assert JSON.stringify(removeDuplicates([5, 5, 5])) === JSON.stringify([5])
`,
        solution: `function removeDuplicates(arr) {
  return [...new Set(arr)];
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `chunk(arr, size)` that splits `arr` into consecutive groups of `size`, with the last group holding whatever remains.',
        starter: '',
        tests: `
assert JSON.stringify(chunk([1, 2, 3, 4, 5], 2)) === JSON.stringify([[1, 2], [3, 4], [5]])
assert JSON.stringify(chunk([1, 2, 3], 1)) === JSON.stringify([[1], [2], [3]])
assert JSON.stringify(chunk([1, 2, 3, 4], 4)) === JSON.stringify([[1, 2, 3, 4]])
`,
        solution: `function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}`,
      },
    ],
  },
]

export default challenges
