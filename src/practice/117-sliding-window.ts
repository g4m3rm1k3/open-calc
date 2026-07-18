import type { PracticeChallenge } from './loader'

export const title = 'Sliding Window'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `maxSubarraySum(arr, k)` returning the maximum sum of any `k` CONSECUTIVE elements, updating the running sum by subtracting what leaves and adding what enters each slide — not re-summing from scratch.',
        starter: '',
        tests: `
assert maxSubarraySum([2,1,5,1,3,2], 3) === 9
assert maxSubarraySum([1,2,3,4], 2) === 7
`,
        solution: `function maxSubarraySum(arr, k) {
  let windowSum = 0
  for (let i = 0; i < k; i++) windowSum += arr[i]
  let maxSum = windowSum
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i]
    maxSum = Math.max(maxSum, windowSum)
  }
  return maxSum
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `minSubarraySum(arr, k)`: it must track the MINIMUM window sum seen across all slides, not the maximum.',
        starter: 'function minSubarraySum(arr, k) {\n  let windowSum = 0\n  for (let i = 0; i < k; i++) windowSum += arr[i]\n  let minSum = windowSum\n  for (let i = k; i < arr.length; i++) {\n    windowSum = windowSum - arr[i - k] + arr[i]\n    // TODO: track the MINIMUM window sum seen, not the maximum\n    minSum = Math.max(minSum, windowSum)\n  }\n  return minSum\n}',
        tests: `
assert minSubarraySum([2,1,5,1,3,2], 3) === 6
`,
        solution: `function minSubarraySum(arr, k) {
  let windowSum = 0
  for (let i = 0; i < k; i++) windowSum += arr[i]
  let minSum = windowSum
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i]
    minSum = Math.min(minSum, windowSum)
  }
  return minSum
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `longestSubstringNoRepeat(str)` returning the length of the longest substring with no repeated characters, using a VARIABLE-size window: expand the window\'s right edge each step, and shrink its left edge (jump it past the previous occurrence) whenever a repeat is found.',
        starter: '',
        tests: `
assert longestSubstringNoRepeat('abcabcbb') === 3
assert longestSubstringNoRepeat('bbbbb') === 1
assert longestSubstringNoRepeat('pwwkew') === 3
`,
        solution: `function longestSubstringNoRepeat(str) {
  const seen = new Map()
  let start = 0
  let maxLen = 0
  for (let end = 0; end < str.length; end++) {
    const ch = str[end]
    if (seen.has(ch) && seen.get(ch) >= start) {
      start = seen.get(ch) + 1
    }
    seen.set(ch, end)
    maxLen = Math.max(maxLen, end - start + 1)
  }
  return maxLen
}`,
      },
    ],
  },
]

export default challenges
