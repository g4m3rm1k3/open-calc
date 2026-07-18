import type { PracticeChallenge } from './loader'

export const title = 'Binary Search'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `binarySearch(arr, target)`, where `arr` is sorted ascending. Return the index of `target`, or `-1` if it\'s not present, by repeatedly halving the search range.',
        starter: '',
        tests: `
const sorted = [1, 3, 5, 7, 9, 11, 13]
assert binarySearch(sorted, 11) === 5
assert binarySearch(sorted, 4) === -1
`,
        solution: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `leftmostOccurrence(arr, target)`: `arr` is sorted and may contain `target` more than once. Return the index of its FIRST (leftmost) occurrence, or `-1` if absent — when a match is found, keep searching the left half instead of stopping immediately.',
        starter: 'function leftmostOccurrence(arr, target) {\n  // TODO: binary search for target in sorted arr, but when a match is found,\n  // keep searching the LEFT half to find the first (leftmost) occurrence\n  return -1\n}',
        tests: `
assert leftmostOccurrence([1,2,2,2,3,4], 2) === 1
assert leftmostOccurrence([1,2,3], 5) === -1
`,
        solution: `function leftmostOccurrence(arr, target) {
  let lo = 0, hi = arr.length - 1
  let result = -1
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (arr[mid] === target) {
      result = mid
      hi = mid - 1
    } else if (arr[mid] < target) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return result
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `searchInsertPosition(arr, target)`, where `arr` is sorted ascending. Return the index of `target` if present, or the index where it WOULD need to be inserted to keep `arr` sorted, if it\'s not.',
        starter: '',
        tests: `
assert searchInsertPosition([1,3,5,6], 5) === 2
assert searchInsertPosition([1,3,5,6], 2) === 1
assert searchInsertPosition([1,3,5,6], 7) === 4
assert searchInsertPosition([1,3,5,6], 0) === 0
`,
        solution: `function searchInsertPosition(arr, target) {
  let lo = 0, hi = arr.length - 1
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return lo
}`,
      },
    ],
  },
]

export default challenges
