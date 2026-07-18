import type { PracticeChallenge } from './loader'

export const title = 'Heap / Priority Queue'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeMinHeap()` returning `{ insert(value), peek() }`. `insert` adds the value at the end of an internal array, then "bubbles it up" past any larger parent; `peek` returns the current minimum (index 0).',
        starter: '',
        tests: `
const heap = makeMinHeap()
for (const v of [5,3,8,1]) heap.insert(v)
assert heap.peek() === 1
`,
        solution: `function makeMinHeap() {
  const items = []
  return {
    insert(value) {
      items.push(value)
      let i = items.length - 1
      while (i > 0) {
        const parent = Math.floor((i - 1) / 2)
        if (items[parent] <= items[i]) break
        ;[items[parent], items[i]] = [items[i], items[parent]]
        i = parent
      }
    },
    peek() { return items[0] },
  }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `extractMin()`: remove and return the root, move the LAST item into the root position, then "bubble it down" (swap with its smaller child, repeatedly) to restore the heap property. Calling it repeatedly must yield elements in sorted order.',
        starter: 'function makeMinHeap() {\n  const items = []\n  return {\n    insert(value) {\n      items.push(value)\n      let i = items.length - 1\n      while (i > 0) {\n        const parent = Math.floor((i - 1) / 2)\n        if (items[parent] <= items[i]) break\n        ;[items[parent], items[i]] = [items[i], items[parent]]\n        i = parent\n      }\n    },\n    peek() { return items[0] },\n    // TODO: extractMin() must remove and return the root, move the LAST item\n    // to the root, then "bubble it down" to restore the heap property\n    extractMin() { return items.shift() },\n  }\n}',
        tests: `
const heap = makeMinHeap()
for (const v of [5,3,8,1]) heap.insert(v)
const sorted = []
sorted.push(heap.extractMin())
sorted.push(heap.extractMin())
sorted.push(heap.extractMin())
sorted.push(heap.extractMin())
assert JSON.stringify(sorted) === JSON.stringify([1,3,5,8])
`,
        solution: `function makeMinHeap() {
  const items = []
  function bubbleDown(i) {
    const n = items.length
    while (true) {
      const left = 2 * i + 1, right = 2 * i + 2
      let smallest = i
      if (left < n && items[left] < items[smallest]) smallest = left
      if (right < n && items[right] < items[smallest]) smallest = right
      if (smallest === i) break
      ;[items[smallest], items[i]] = [items[i], items[smallest]]
      i = smallest
    }
  }
  return {
    insert(value) {
      items.push(value)
      let i = items.length - 1
      while (i > 0) {
        const parent = Math.floor((i - 1) / 2)
        if (items[parent] <= items[i]) break
        ;[items[parent], items[i]] = [items[i], items[parent]]
        i = parent
      }
    },
    peek() { return items[0] },
    extractMin() {
      const min = items[0]
      const last = items.pop()
      if (items.length > 0) { items[0] = last; bubbleDown(0) }
      return min
    },
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeMinHeap(keyFn)` (same as before, but comparing by `keyFn(value)` instead of the raw value) and `mergeKSortedArrays(arrays)`, which uses that heap to merge several already-sorted arrays into one fully sorted array — a classic real use of a priority queue.',
        starter: '',
        tests: `
assert JSON.stringify(mergeKSortedArrays([[1,4,7],[2,5,8],[3,6,9]])) === JSON.stringify([1,2,3,4,5,6,7,8,9])
`,
        solution: `function makeMinHeap(keyFn = x => x) {
  const items = []
  function bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      if (keyFn(items[parent]) <= keyFn(items[i])) break
      ;[items[parent], items[i]] = [items[i], items[parent]]
      i = parent
    }
  }
  function bubbleDown(i) {
    const n = items.length
    while (true) {
      const left = 2 * i + 1, right = 2 * i + 2
      let smallest = i
      if (left < n && keyFn(items[left]) < keyFn(items[smallest])) smallest = left
      if (right < n && keyFn(items[right]) < keyFn(items[smallest])) smallest = right
      if (smallest === i) break
      ;[items[smallest], items[i]] = [items[i], items[smallest]]
      i = smallest
    }
  }
  return {
    insert(value) { items.push(value); bubbleUp(items.length - 1) },
    peek() { return items[0] },
    extractMin() {
      const min = items[0]
      const last = items.pop()
      if (items.length > 0) { items[0] = last; bubbleDown(0) }
      return min
    },
    size() { return items.length },
  }
}
function mergeKSortedArrays(arrays) {
  const heap = makeMinHeap(x => x.value)
  arrays.forEach((arr, arrIdx) => {
    if (arr.length > 0) heap.insert({ value: arr[0], arrIdx, elIdx: 0 })
  })
  const result = []
  while (heap.size() > 0) {
    const { value, arrIdx, elIdx } = heap.extractMin()
    result.push(value)
    if (elIdx + 1 < arrays[arrIdx].length) {
      heap.insert({ value: arrays[arrIdx][elIdx + 1], arrIdx, elIdx: elIdx + 1 })
    }
  }
  return result
}`,
      },
    ],
  },
]

export default challenges
