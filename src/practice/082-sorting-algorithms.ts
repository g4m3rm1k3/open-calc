import type { PracticeChallenge } from './loader'

export const title = 'Sorting Algorithms'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `bubbleSort(arr)` returning a NEW sorted array, repeatedly sweeping and swapping adjacent out-of-order pairs until a full pass makes no swaps.',
        starter: '',
        tests: `
assert JSON.stringify(bubbleSort([5,2,4,1])) === JSON.stringify([1,2,4,5])
assert JSON.stringify(bubbleSort([])) === JSON.stringify([])
`,
        solution: `function bubbleSort(arr) {
  const a = [...arr]
  let swapped
  do {
    swapped = false
    for (let i = 0; i < a.length - 1; i++) {
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]]
        swapped = true
      }
    }
  } while (swapped)
  return a
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `mergeSort(arr)`: recursively split `arr` in half, sort each half, then merge the two sorted halves back together in order — the O(n log n) divide-and-conquer approach.',
        starter: 'function mergeSort(arr) {\n  // TODO: recursively split arr in half, sort each half, then merge the two\n  // sorted halves back together in order\n  return arr\n}',
        tests: `
assert JSON.stringify(mergeSort([5,2,4,1,3])) === JSON.stringify([1,2,3,4,5])
assert JSON.stringify(mergeSort([1])) === JSON.stringify([1])
`,
        solution: `function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  const merged = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) merged.push(left[i++])
    else merged.push(right[j++])
  }
  return [...merged, ...left.slice(i), ...right.slice(j)]
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `multiKeySort(records)`, each record `{ name, age }`. Return a NEW array sorted by `age` ascending, and for records with equal `age`, sorted by `name` alphabetically — a stable multi-key sort.',
        starter: '',
        tests: `
const records = [{name:'Bob',age:30},{name:'Alice',age:25},{name:'Carol',age:30},{name:'Dave',age:25}]
const sorted = multiKeySort(records)
assert JSON.stringify(sorted.map(r => r.name)) === JSON.stringify(['Alice','Dave','Bob','Carol'])
`,
        solution: `function multiKeySort(records) {
  return [...records].sort((a, b) => a.age - b.age || a.name.localeCompare(b.name))
}`,
      },
    ],
  },
]

export default challenges
