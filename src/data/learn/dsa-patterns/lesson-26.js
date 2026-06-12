// DSA + Design Patterns — Lesson 09
// Sorting Algorithms and the Template Method Pattern

export const lesson = {
  id: 'dsa-patterns-09',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '9. Sorting Algorithms and the Template Method',
  checkpoints: [
    { id: 'cp-slow',     label: 'O(n²) Sorts' },
    { id: 'cp-fast',     label: 'O(n log n) Sorts' },
    { id: 'cp-template', label: 'Template Method' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'Sorting is one of the most studied problems in computer science — not because sorting itself is the end goal, but because every sorted list enables faster everything else. Binary search only works on sorted data. Merging two datasets efficiently requires sorted order. A database without sorted indexes would be unusable. In this lesson you will build four sorting algorithms from scratch, understand why some are fast and some are slow, and then apply the Template Method pattern to write a single generic sorter that works for any comparison logic.',
      code: null,
    },

    // ── Step 1: Bubble sort ───────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-bubble',
      text: 'Bubble sort is the simplest correct sorting algorithm and also one of the slowest. The idea: walk the array from left to right. Compare each pair of adjacent items. If they are in the wrong order, swap them. After one full pass, the largest item has "bubbled" to the end. Repeat for the remaining items. Each pass requires n comparisons; there are n passes: O(n²). For 1000 items, that is 1 million comparisons. For 1 million items, that is 1 trillion.',
      code: `// Bubble sort — O(n²) comparisons and swaps
function bubbleSort(arr) {
  const a = [...arr]   // copy — do not mutate the original
  const n = a.length

  for (let pass = 0; pass < n - 1; pass++) {
    let swapped = false

    // Each pass pushes the largest unsorted item to the end
    for (let i = 0; i < n - 1 - pass; i++) {
      if (a[i] > a[i + 1]) {
        // Swap — destructuring assignment
        ;[a[i], a[i + 1]] = [a[i + 1], a[i]]
        swapped = true
      }
    }

    // Early exit: if no swaps, the array is already sorted
    if (!swapped) break
  }
  return a
}

console.log(bubbleSort([5, 3, 8, 1, 9, 2]))   // [1, 2, 3, 5, 8, 9]
console.log(bubbleSort([1, 2, 3, 4]))           // [1, 2, 3, 4] — 1 pass, early exit`,
    },

    // ── Step 2: Insertion sort ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-insertion',
      text: 'Insertion sort builds a sorted section at the front of the array, one item at a time. Take the next unsorted item and slide it leftward into its correct position in the sorted section. Best case (already sorted): O(n). Worst case: O(n²). The key insight: insertion sort is excellent for small arrays (under ~20 items) and nearly-sorted arrays. It is also an "online" algorithm — you can sort items as they arrive. Many production sort implementations switch to insertion sort for small partitions.',
      code: `// Insertion sort — O(n²) worst, O(n) best (already sorted)
function insertionSort(arr) {
  const a = [...arr]

  for (let i = 1; i < a.length; i++) {
    const current = a[i]   // item to be inserted into sorted section
    let j = i - 1

    // Shift sorted items rightward while they are larger than current
    while (j >= 0 && a[j] > current) {
      a[j + 1] = a[j]
      j--
    }

    a[j + 1] = current   // insert current in its correct position
  }
  return a
}

console.log(insertionSort([5, 3, 8, 1, 9, 2]))     // [1, 2, 3, 5, 8, 9]
console.log(insertionSort([1, 2, 3, 4, 5]))          // already sorted — O(n)
console.log(insertionSort([2, 1]))                   // [1, 2] — one swap`,
    },

    {
      type: 'challenge',
      id: 'ch-slow',
      text: 'Write a selectionSort(arr) function. Selection sort works by finding the minimum element in the unsorted portion and swapping it into the first position of that portion, then moving the boundary forward. O(n²) comparisons, but always exactly n-1 swaps regardless of input. Sort [64, 25, 12, 22, 11]. Expected: [11, 12, 22, 25, 64].',
      expectedOutput: null,
      startCode: `function selectionSort(arr) {
  const a = [...arr]
  for (let i = 0; i < a.length - 1; i++) {
    // find the index of the minimum in a[i..end]
    let minIdx = i
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) minIdx = j
    }
    // swap a[i] and a[minIdx]
    if (minIdx !== i) {
      // your swap here
    }
  }
  return a
}

console.log(selectionSort([64, 25, 12, 22, 11]))`,
      hint: '[a[i], a[minIdx]] = [a[minIdx], a[i]]',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('11') && flat.includes('12') && flat.includes('64') && flat.indexOf('11') < flat.indexOf('64')
      },
    },

    { type: 'checkpoint', id: 'cp-slow' },

    // ── Step 3: Merge sort ────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-merge',
      text: 'Merge sort is a divide-and-conquer algorithm (recursion from lesson 5). Split the array in half, recursively sort each half, then merge the two sorted halves together. Merging two sorted arrays is O(n) and always possible: compare the fronts of both halves, take the smaller one, repeat. The recursion has O(log n) levels. Each level does O(n) work. Total: O(n log n). For 1 million items: 20 million operations instead of a trillion. This is a fundamental improvement.',
      code: `// Merge sort — O(n log n) using divide and conquer
function mergeSort(arr) {
  // Base case: an array of 0 or 1 items is already sorted
  if (arr.length <= 1) return arr

  // Divide: split in half
  const mid   = Math.floor(arr.length / 2)
  const left  = mergeSort(arr.slice(0, mid))    // sort left half
  const right = mergeSort(arr.slice(mid))        // sort right half

  // Conquer: merge the two sorted halves
  return merge(left, right)
}

function merge(left, right) {
  const result = []
  let l = 0, r = 0

  // Compare front elements and take the smaller one
  while (l < left.length && r < right.length) {
    if (left[l] <= right[r]) {
      result.push(left[l++])
    } else {
      result.push(right[r++])
    }
  }

  // Append any remaining elements from either half
  while (l < left.length)  result.push(left[l++])
  while (r < right.length) result.push(right[r++])

  return result
}

console.log(mergeSort([5, 3, 8, 1, 9, 2, 7, 4, 6]))`,
    },

    // ── Step 4: Quicksort ─────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-quicksort',
      text: 'Quicksort is another divide-and-conquer sort. Choose a "pivot" element. Partition the array into two groups: elements smaller than the pivot and elements larger than it. Recursively sort both groups. No merge step needed — once each partition is sorted, the whole array is sorted. Average case: O(n log n). Worst case: O(n²) if the pivot is always the smallest or largest (picking a random pivot avoids this). Quicksort is often faster in practice than merge sort because it sorts in-place with less memory overhead.',
      code: `// Quicksort — O(n log n) average, O(n²) worst case
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low >= high) return arr   // base case: partition of 0 or 1 elements

  const pivotIdx = partition(arr, low, high)
  quickSort(arr, low, pivotIdx - 1)    // sort left of pivot
  quickSort(arr, pivotIdx + 1, high)   // sort right of pivot
  return arr
}

function partition(arr, low, high) {
  const pivot = arr[high]   // choose last element as pivot
  let i = low - 1           // i tracks the end of the "smaller" region

  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++
      ;[arr[i], arr[j]] = [arr[j], arr[i]]   // swap into smaller region
    }
  }

  // Place pivot in its correct final position
  ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
  return i + 1   // return pivot's final index
}

const arr = [5, 3, 8, 1, 9, 2, 7, 4, 6]
console.log(quickSort(arr))`,
    },

    {
      type: 'challenge',
      id: 'ch-fast',
      text: 'Use mergeSort to sort an array of objects by a numeric field. Sort these tasks by dueDate: [{name:"report", dueDate:5}, {name:"meeting", dueDate:2}, {name:"email", dueDate:8}, {name:"call", dueDate:1}]. The function should use mergeSort internally but accept a compareFn(a, b) that returns negative if a comes before b. Log the task names in order.',
      expectedOutput: null,
      startCode: `function mergeSort(arr, compareFn) {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  const left  = mergeSort(arr.slice(0, mid), compareFn)
  const right = mergeSort(arr.slice(mid),    compareFn)
  return mergeFn(left, right, compareFn)
}

function mergeFn(left, right, compareFn) {
  const result = []
  let l = 0, r = 0
  while (l < left.length && r < right.length) {
    // use compareFn to decide which to take
    if (compareFn(left[l], right[r]) <= 0) result.push(left[l++])
    else result.push(right[r++])
  }
  while (l < left.length)  result.push(left[l++])
  while (r < right.length) result.push(right[r++])
  return result
}

const tasks = [
  { name: 'report',  dueDate: 5 },
  { name: 'meeting', dueDate: 2 },
  { name: 'email',   dueDate: 8 },
  { name: 'call',    dueDate: 1 },
]

const sorted = mergeSort(tasks, (a, b) => a.dueDate - b.dueDate)
sorted.forEach(t => console.log(t.name))`,
      hint: 'The compareFn is already wired in — just run the code as written.',
      validate: ({ logs }) => {
        const names = logs.map(l => String(l).trim())
        const callIdx  = names.indexOf('call')
        const emailIdx = names.indexOf('email')
        return callIdx !== -1 && emailIdx !== -1 && callIdx < emailIdx
      },
    },

    { type: 'checkpoint', id: 'cp-fast' },

    // ── Step 5: Template Method Pattern ───────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-template-problem',
      text: 'Look at merge sort and bubble sort: both have the same skeleton. There is a "sort" step that delegates comparison to some definition of "which comes first." The Template Method pattern formalises this: define the skeleton of an algorithm in a base structure, but leave one or more steps to be provided by the caller. The "template" is the fixed skeleton. The "method" is the step that varies. You have already seen this in the mergeSort with compareFn from the challenge above.',
      code: null,
    },

    {
      type: 'narration',
      id: 'step6-template-sorter',
      text: 'Build a createSorter factory that takes a compareFn and returns a sort function. The sorter owns the algorithm (merge sort). The compareFn defines what "comes first" means. Sort numbers ascending, descending, sort strings alphabetically, sort objects by any field — the algorithm never changes. Only the compareFn changes. This is the Template Method: the algorithm is the template, the compareFn is the variable step.',
      code: `// Template Method: sort algorithm is fixed, comparison is variable
function createSorter(compareFn) {
  function merge(left, right) {
    const result = []
    let l = 0, r = 0
    while (l < left.length && r < right.length) {
      result.push(compareFn(left[l], right[r]) <= 0 ? left[l++] : right[r++])
    }
    while (l < left.length)  result.push(left[l++])
    while (r < right.length) result.push(right[r++])
    return result
  }

  function sort(arr) {
    if (arr.length <= 1) return arr
    const mid = Math.floor(arr.length / 2)
    return merge(sort(arr.slice(0, mid)), sort(arr.slice(mid)))
  }

  return sort
}

// Three sorters — same algorithm, different comparison functions
const sortAsc    = createSorter((a, b) => a - b)
const sortDesc   = createSorter((a, b) => b - a)
const sortByName = createSorter((a, b) => a.name.localeCompare(b.name))

const nums = [5, 1, 8, 3, 9, 2]
console.log('ascending:',  sortAsc(nums))
console.log('descending:', sortDesc(nums))

const people = [
  { name: 'Carol' }, { name: 'Alice' }, { name: 'Bob' },
]
console.log('by name:', sortByName(people).map(p => p.name))`,
    },

    {
      type: 'challenge',
      id: 'ch-template',
      text: 'Create a sortByMultiple(fields) function that returns a compareFn for createSorter. It should sort by the first field, and if tied, by the second field. Sort these people: [{name:"Bob",age:30},{name:"Alice",age:25},{name:"Alice",age:30},{name:"Bob",age:25}] by name then age. Expected order: Alice 25, Alice 30, Bob 25, Bob 30.',
      expectedOutput: null,
      startCode: `function createSorter(compareFn) {
  function merge(l, r) { const res=[]; let i=0,j=0; while(i<l.length&&j<r.length){ res.push(compareFn(l[i],r[j])<=0?l[i++]:r[j++]) } return [...res,...l.slice(i),...r.slice(j)] }
  function sort(a) { if(a.length<=1) return a; const m=Math.floor(a.length/2); return merge(sort(a.slice(0,m)),sort(a.slice(m))) }
  return sort
}

function sortByMultiple(...fields) {
  return (a, b) => {
    for (const field of fields) {
      const diff = typeof a[field] === 'string'
        ? a[field].localeCompare(b[field])
        : a[field] - b[field]
      if (diff !== 0) return diff
    }
    return 0
  }
}

const people = [
  { name: 'Bob',   age: 30 },
  { name: 'Alice', age: 25 },
  { name: 'Alice', age: 30 },
  { name: 'Bob',   age: 25 },
]

const sortPeople = createSorter(sortByMultiple('name', 'age'))
sortPeople(people).forEach(p => console.log(p.name, p.age))`,
      hint: 'The sortByMultiple and createSorter are already correct — just run the code.',
      validate: ({ logs }) => {
        const joined = logs.map(l => String(l).toLowerCase())
        const a25 = joined.findIndex(l => l.includes('alice') && l.includes('25'))
        const b30 = joined.findIndex(l => l.includes('bob')   && l.includes('30'))
        return a25 !== -1 && b30 !== -1 && a25 < b30
      },
    },

    { type: 'checkpoint', id: 'cp-template' },

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens and step through merge sort. Watch the recursive calls split the array in half repeatedly until each piece has one element. Then watch the merge calls combine them: two sorted pieces become one sorted piece. The call tree goes down (divide) and then up (conquer). Count the levels — that is log₂ of the array length. Each level does linear work.',
      code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid   = Math.floor(arr.length / 2)
  const left  = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  return merge(left, right)
}

function merge(left, right) {
  const result = []
  let l = 0, r = 0
  while (l < left.length && r < right.length) {
    result.push(left[l] <= right[r] ? left[l++] : right[r++])
  }
  while (l < left.length)  result.push(left[l++])
  while (r < right.length) result.push(right[r++])
  return result
}

console.log(mergeSort([5, 3, 8, 1, 9, 2]))`,
    },

    {
      type: 'codelens',
      id: 'cl-sorting',
      text: 'Step through mergeSort in CodeLens. Watch the recursive calls. The array [5,3,8,1,9,2] first splits to [5,3,8] and [1,9,2]. Each splits again until single elements remain. Then watch the merge calls work back upward: two [x] pieces become one [x,y] piece. The combine phase is where the sorting actually happens.',
      code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid   = Math.floor(arr.length / 2)
  const left  = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  return merge(left, right)
}
function merge(left, right) {
  const result = []
  let l = 0, r = 0
  while (l < left.length && r < right.length) {
    result.push(left[l] <= right[r] ? left[l++] : right[r++])
  }
  while (l < left.length)  result.push(left[l++])
  while (r < right.length) result.push(right[r++])
  return result
}
console.log(mergeSort([5, 3, 8, 1, 9, 2]))`,
      lang: 'js',
    },

  ],
}
