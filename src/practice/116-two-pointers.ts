import type { PracticeChallenge } from './loader'

export const title = 'Two Pointers'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `twoSumSorted(arr, target)`, where `arr` is sorted ascending. Using pointers starting at each end, return a pair `[a, b]` summing to `target`, or `null` if none exists — moving `left` right when the sum is too small, `right` left when too large.',
        starter: '',
        tests: `
assert JSON.stringify(twoSumSorted([1,3,5,7,9], 12)) === JSON.stringify([3,9])
assert twoSumSorted([1,3,5,7,9], 20) === null
`,
        solution: `function twoSumSorted(arr, target) {
  let left = 0, right = arr.length - 1
  while (left < right) {
    const sum = arr[left] + arr[right]
    if (sum === target) return [arr[left], arr[right]]
    if (sum < target) left++
    else right--
  }
  return null
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `isPalindrome(str)`: two pointers start at each end and move inward, COMPARING characters as they go — return `false` the instant a mismatched pair is found, `true` if the pointers meet without one.',
        starter: 'function isPalindrome(str) {\n  // TODO: two pointers starting at each end, moving inward, comparing\n  // characters — return false the instant a mismatched pair is found\n  let left = 0, right = str.length - 1\n  while (left < right) {\n    left++\n    right--\n  }\n  return true\n}',
        tests: `
assert isPalindrome('racecar') === true
assert isPalindrome('hello') === false
`,
        solution: `function isPalindrome(str) {
  let left = 0, right = str.length - 1
  while (left < right) {
    if (str[left] !== str[right]) return false
    left++
    right--
  }
  return true
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `mergeSortedArrays(a, b)` merging two ALREADY-sorted arrays into one sorted array in a single pass, using one pointer per array and always advancing whichever points at the smaller current value.',
        starter: '',
        tests: `
assert JSON.stringify(mergeSortedArrays([1,3,5],[2,4,6])) === JSON.stringify([1,2,3,4,5,6])
assert JSON.stringify(mergeSortedArrays([],[1,2])) === JSON.stringify([1,2])
`,
        solution: `function mergeSortedArrays(a, b) {
  const result = []
  let i = 0, j = 0
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) result.push(a[i++])
    else result.push(b[j++])
  }
  while (i < a.length) result.push(a[i++])
  while (j < b.length) result.push(b[j++])
  return result
}`,
      },
    ],
  },
]

export default challenges
