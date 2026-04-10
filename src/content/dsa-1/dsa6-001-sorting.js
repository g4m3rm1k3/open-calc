const lesson = {
  id: 'dsa6-001',
  title: 'Sorting Algorithms',
  subtitle: 'From bubble sort to merge sort to quicksort — understand the tradeoffs',
  course: 'dsa-1',
  chapter: 'dsa6',

  scienceNotebook: {
    title: 'How Sorting Algorithms Work',
    subtitle: 'Step-by-step animation of merge sort and quicksort',
    sequential: true,
    cells: [
      {
        id: 'sort-complexity-overview',
        title: 'The Landscape of Sorting',
        type: 'js',
        code: `
const display = document.getElementById('display');

const algorithms = [
  { name: 'Bubble Sort',     best:'O(n)',     avg:'O(n²)',    worst:'O(n²)',    space:'O(1)',      stable: true,  notes: 'Only for teaching. Never in production.' },
  { name: 'Selection Sort',  best:'O(n²)',    avg:'O(n²)',    worst:'O(n²)',    space:'O(1)',      stable: false, notes: 'Minimizes swaps, but always O(n²).' },
  { name: 'Insertion Sort',  best:'O(n)',     avg:'O(n²)',    worst:'O(n²)',    space:'O(1)',      stable: true,  notes: 'Fast on nearly-sorted data. Used by Timsort for small runs.' },
  { name: 'Merge Sort',      best:'O(n log n)',avg:'O(n log n)',worst:'O(n log n)',space:'O(n)',   stable: true,  notes: 'Guaranteed O(n log n). Great for linked lists.' },
  { name: 'Quick Sort',      best:'O(n log n)',avg:'O(n log n)',worst:'O(n²)',   space:'O(log n)', stable: false, notes: 'Fastest in practice on average. Worst case on bad pivots.' },
  { name: 'Heap Sort',       best:'O(n log n)',avg:'O(n log n)',worst:'O(n log n)',space:'O(1)',   stable: false, notes: 'In-place and O(n log n) guaranteed. Rarely used in practice.' },
];

let html = '<table style="border-collapse:collapse;width:100%;font-size:12px">';
html += '<tr style="color:#64748b"><th style="padding:5px 8px;text-align:left">Algorithm</th><th>Best</th><th>Average</th><th>Worst</th><th>Space</th><th>Stable</th></tr>';
algorithms.forEach(a => {
  const stableColor = a.stable ? '#4ade80' : '#f87171';
  const worstColor  = a.worst.includes('n²') ? '#f87171' : '#4ade80';
  html += '<tr style="border-top:1px solid #1e293b">' +
    '<td style="padding:5px 8px;color:#60a5fa;font-weight:bold">' + a.name + '<br><span style="color:#475569;font-size:11px;font-weight:normal">' + a.notes + '</span></td>' +
    '<td style="padding:5px 8px;text-align:center;color:#e2e8f0">' + a.best + '</td>' +
    '<td style="padding:5px 8px;text-align:center;color:#e2e8f0">' + a.avg + '</td>' +
    '<td style="padding:5px 8px;text-align:center;color:' + worstColor + '">' + a.worst + '</td>' +
    '<td style="padding:5px 8px;text-align:center;color:#e2e8f0">' + a.space + '</td>' +
    '<td style="padding:5px 8px;text-align:center;color:' + stableColor + '">' + (a.stable ? '✓' : '✗') + '</td></tr>';
});
html += '</table>';
display.innerHTML = html;
        `,
        html: '<div id="display" style="padding:12px"></div>',
      },

      {
        id: 'merge-sort-demo',
        title: 'Merge Sort — Divide, Recurse, Merge',
        type: 'js',
        code: `
const display = document.getElementById('display');

const mergeLog = [];

function mergeSort(arr, depth=0) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left  = mergeSort(arr.slice(0, mid), depth+1);
  const right = mergeSort(arr.slice(mid),    depth+1);
  return merge(left, right, depth);
}

function merge(left, right, depth) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else                      result.push(right[j++]);
  }
  while (i < left.length)  result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  mergeLog.push({ depth, left: [...left], right: [...right], result: [...result] });
  return result;
}

const arr = [38, 27, 43, 3, 9, 82, 10];
mergeSort([...arr]);

let html = '<h3 style="color:#60a5fa;margin:0 0 12px">Merge Sort: [' + arr.join(', ') + ']</h3>';
mergeLog.forEach((entry, i) => {
  const indent = '&nbsp;'.repeat(entry.depth * 8);
  html += '<div style="margin-bottom:5px;font-size:13px;font-family:monospace">' +
    indent +
    '<span style="color:#f59e0b">[' + entry.left.join(',') + ']</span>' +
    ' <span style="color:#64748b">+</span> ' +
    '<span style="color:#c084fc">[' + entry.right.join(',') + ']</span>' +
    ' <span style="color:#64748b">→</span> ' +
    '<span style="color:#4ade80">[' + entry.result.join(',') + ']</span>' +
    '</div>';
});
display.innerHTML = html;
        `,
        html: '<div id="display" style="padding:12px"></div>',
      },

      {
        id: 'quicksort-demo',
        title: 'Quicksort — Pick a Pivot, Partition Around It',
        type: 'js',
        code: `
const display = document.getElementById('display');

const qLog = [];

function quickSort(arr, lo=0, hi=arr.length-1) {
  if (lo >= hi) return;
  const pivot = partition(arr, lo, hi);
  quickSort(arr, lo, pivot - 1);
  quickSort(arr, pivot + 1, hi);
}

function partition(arr, lo, hi) {
  const pivotVal = arr[hi]; // last element as pivot
  let i = lo - 1;
  const before = arr.slice(lo, hi+1).join(', ');
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivotVal) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; }
  }
  [arr[i+1], arr[hi]] = [arr[hi], arr[i+1]];
  qLog.push({ pivot: pivotVal, range: [lo, hi], after: arr.slice(lo, hi+1).join(', '), pivotIdx: i+1 });
  return i + 1;
}

const arr = [10, 80, 30, 90, 40, 50, 70];
quickSort(arr);

let html = '<h3 style="color:#60a5fa;margin:0 0 12px">Quicksort: [10, 80, 30, 90, 40, 50, 70]</h3>';
qLog.forEach((entry, i) => {
  html += '<div style="margin-bottom:6px;padding:6px 10px;background:#1e293b;border-radius:4px;font-size:13px">' +
    'Step ' + (i+1) + ': pivot=<b style="color:#f59e0b">' + entry.pivot + '</b>' +
    ', range [' + entry.range[0] + ',' + entry.range[1] + ']' +
    ' → [<span style="color:#4ade80">' + entry.after + '</span>]' +
    ' (pivot lands at index ' + entry.pivotIdx + ')' +
    '</div>';
});
html += '<p style="color:#4ade80;margin-top:8px">Sorted: [' + arr.join(', ') + ']</p>';
display.innerHTML = html;
        `,
        html: '<div id="display" style="padding:12px"></div>',
      },
    ],
  },

  jsNotebook: {
    title: 'Sorting — JavaScript',
    subtitle: 'Implement bubble sort, merge sort, and quicksort from scratch',
    cells: [
      {
        id: 'sort-js-bubble-insertion',
        title: 'Step 1 — Bubble Sort and Insertion Sort',
        prose: [
          'Bubble sort repeatedly swaps adjacent elements if they\'re out of order. Each pass "bubbles" the largest remaining element to its final position.',
          'Insertion sort builds a sorted prefix one element at a time — like sorting playing cards in your hand.',
        ],
        instructions: 'Implement bubbleSort() and insertionSort(). Both sort in-place and return the array.',
        startCode: `// Sort arr in-place by repeatedly swapping adjacent out-of-order pairs.
// Outer loop: n passes. Inner loop: compare arr[j] and arr[j+1].
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    // TODO: inner loop from j=0 to n-i-2
    //   if arr[j] > arr[j+1]: swap them
  }
  return arr;
}

// Sort arr in-place. For each i from 1 to n-1:
//   key = arr[i]
//   shift elements left while arr[j] > key
//   place key in its correct position
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    // TODO: while j >= 0 and arr[j] > key: arr[j+1] = arr[j]; j--
    // TODO: arr[j+1] = key
  }
  return arr;
}

// --- Tests ---
console.log('bubble:', bubbleSort([64,34,25,12,22,11,90]).join(', ')); // 11, 12, 22, 25, 34, 64, 90
console.log('insertion:', insertionSort([12,11,13,5,6]).join(', '));    // 5, 6, 11, 12, 13
`,
        solutionCode: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j+1]) [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
    }
  }
  return arr;
}

function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) { arr[j+1] = arr[j]; j--; }
    arr[j+1] = key;
  }
  return arr;
}

console.log('bubble:', bubbleSort([64,34,25,12,22,11,90]).join(', '));
console.log('insertion:', insertionSort([12,11,13,5,6]).join(', '));
`,
        check: (output) => {
          return output.includes('bubble: 11, 12, 22, 25, 34, 64, 90') &&
                 output.includes('insertion: 5, 6, 11, 12, 13');
        },
      },

      {
        id: 'sort-js-merge',
        title: 'Step 2 — Merge Sort',
        prose: [
          'Divide the array in half, recursively sort each half, then merge the two sorted halves.',
          'merge() uses two pointers — one into each half. Always pick the smaller element. Append any leftover elements at the end.',
        ],
        instructions: 'Implement merge() then mergeSort(). mergeSort returns a new sorted array (not in-place).',
        startCode: `// Merge two sorted arrays into one sorted array
function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  // TODO: while i < left.length and j < right.length:
  //   if left[i] <= right[j]: push left[i], i++
  //   else: push right[j], j++
  // TODO: append remaining left elements
  // TODO: append remaining right elements
  return result;
}

// Recursively split, sort, and merge
function mergeSort(arr) {
  // TODO: base case — if arr.length <= 1 return arr
  // TODO: find mid = Math.floor(arr.length / 2)
  // TODO: recursively sort left half and right half
  // TODO: return merge(left, right)
}

// --- Tests ---
console.log('merge:', merge([1,3,5],[2,4,6]).join(', ')); // 1, 2, 3, 4, 5, 6
console.log('mergeSort:', mergeSort([38,27,43,3,9,82,10]).join(', ')); // 3, 9, 10, 27, 38, 43, 82
console.log('already sorted:', mergeSort([1,2,3,4,5]).join(', '));
console.log('single element:', mergeSort([42]).join(', '));
`,
        solutionCode: `function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else                      result.push(right[j++]);
  }
  while (i < left.length)  result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left  = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

console.log('merge:', merge([1,3,5],[2,4,6]).join(', '));
console.log('mergeSort:', mergeSort([38,27,43,3,9,82,10]).join(', '));
console.log('already sorted:', mergeSort([1,2,3,4,5]).join(', '));
console.log('single element:', mergeSort([42]).join(', '));
`,
        check: (output) => {
          return output.includes('merge: 1, 2, 3, 4, 5, 6') &&
                 output.includes('mergeSort: 3, 9, 10, 27, 38, 43, 82');
        },
      },

      {
        id: 'sort-js-quick',
        title: 'Step 3 — Quicksort',
        prose: [
          'Choose a pivot (we\'ll use the last element). partition() rearranges the array so everything ≤ pivot is left of it, everything > pivot is right.',
          'After partition, the pivot is in its final position. Recursively sort the left and right sub-arrays.',
        ],
        instructions: 'Implement partition() and quickSort(). Sort in-place — no return value needed except from partition().',
        startCode: `// Partition arr[lo..hi] around arr[hi] as pivot.
// Returns the final index of the pivot.
function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo - 1; // index of last element ≤ pivot

  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      // TODO: i++, swap arr[i] and arr[j]
    }
  }
  // TODO: swap arr[i+1] and arr[hi] (place pivot in correct spot)
  // TODO: return i + 1
}

function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return;
  // TODO: pivot = partition(arr, lo, hi)
  // TODO: quickSort(arr, lo, pivot - 1)
  // TODO: quickSort(arr, pivot + 1, hi)
}

// --- Tests ---
const a = [10, 80, 30, 90, 40, 50, 70];
quickSort(a);
console.log('quickSort:', a.join(', ')); // 10, 30, 40, 50, 70, 80, 90

const b = [5, 4, 3, 2, 1];
quickSort(b);
console.log('reversed:', b.join(', ')); // 1, 2, 3, 4, 5

const c = [1];
quickSort(c);
console.log('single:', c.join(', ')); // 1
`,
        solutionCode: `function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i+1], arr[hi]] = [arr[hi], arr[i+1]];
  return i + 1;
}

function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return;
  const pivot = partition(arr, lo, hi);
  quickSort(arr, lo, pivot - 1);
  quickSort(arr, pivot + 1, hi);
}

const a = [10, 80, 30, 90, 40, 50, 70];
quickSort(a);
console.log('quickSort:', a.join(', '));

const b = [5, 4, 3, 2, 1];
quickSort(b);
console.log('reversed:', b.join(', '));

const c = [1];
quickSort(c);
console.log('single:', c.join(', '));
`,
        check: (output) => {
          return output.includes('quickSort: 10, 30, 40, 50, 70, 80, 90') &&
                 output.includes('reversed: 1, 2, 3, 4, 5');
        },
      },

      {
        id: 'sort-js-scratch',
        title: 'From Scratch — All Three Sorting Algorithms',
        prose: [
          'Write bubbleSort, mergeSort (with merge), and quickSort (with partition) from memory.',
        ],
        instructions: 'Empty shells — fill in every algorithm. 10 tests verify correctness.',
        startCode: `function bubbleSort(arr) {
  // your code — sort in-place, return arr
}

function merge(left, right) {
  // your code — return merged sorted array
}

function mergeSort(arr) {
  // your code — return new sorted array
}

function partition(arr, lo, hi) {
  // your code — return pivot index
}

function quickSort(arr, lo = 0, hi = arr.length - 1) {
  // your code — sort in-place
}

// --- Test Suite ---
let pass = 0, fail = 0;
function test(desc, got, expected) {
  const g = JSON.stringify(got), e = JSON.stringify(expected);
  if (g === e) { console.log('✓', desc); pass++; }
  else { console.log('✗', desc, '| expected:', e, '| got:', g); fail++; }
}

test('bubbleSort basic',  bubbleSort([5,3,8,1,9,2]), [1,2,3,5,8,9]);
test('bubbleSort sorted', bubbleSort([1,2,3]),        [1,2,3]);
test('bubbleSort single', bubbleSort([7]),             [7]);

test('merge two halves', merge([1,3,5],[2,4,6]), [1,2,3,4,5,6]);
test('mergeSort basic',  mergeSort([38,27,43,3,9,82,10]), [3,9,10,27,38,43,82]);
test('mergeSort single', mergeSort([1]),                   [1]);
test('mergeSort empty',  mergeSort([]),                    []);

const q1 = [10,80,30,90,40,50,70];
quickSort(q1);
test('quickSort basic',  q1, [10,30,40,50,70,80,90]);
const q2 = [5,4,3,2,1];
quickSort(q2);
test('quickSort reversed', q2, [1,2,3,4,5]);
const q3 = [42];
quickSort(q3);
test('quickSort single', q3, [42]);

console.log('\\n' + pass + '/' + (pass+fail) + ' tests passed');
`,
        solutionCode: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++)
    for (let j = 0; j < n - i - 1; j++)
      if (arr[j] > arr[j+1]) [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
  return arr;
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else                      result.push(right[j++]);
  }
  while (i < left.length)  result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}

function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; }
  }
  [arr[i+1], arr[hi]] = [arr[hi], arr[i+1]];
  return i + 1;
}

function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return;
  const p = partition(arr, lo, hi);
  quickSort(arr, lo, p - 1);
  quickSort(arr, p + 1, hi);
}

let pass = 0, fail = 0;
function test(desc, got, expected) {
  const g = JSON.stringify(got), e = JSON.stringify(expected);
  if (g === e) { console.log('✓', desc); pass++; }
  else { console.log('✗', desc, '| expected:', e, '| got:', g); fail++; }
}

test('bubbleSort basic',  bubbleSort([5,3,8,1,9,2]), [1,2,3,5,8,9]);
test('bubbleSort sorted', bubbleSort([1,2,3]),        [1,2,3]);
test('bubbleSort single', bubbleSort([7]),             [7]);
test('merge two halves', merge([1,3,5],[2,4,6]), [1,2,3,4,5,6]);
test('mergeSort basic',  mergeSort([38,27,43,3,9,82,10]), [3,9,10,27,38,43,82]);
test('mergeSort single', mergeSort([1]),                   [1]);
test('mergeSort empty',  mergeSort([]),                    []);

const q1 = [10,80,30,90,40,50,70];
quickSort(q1);
test('quickSort basic',  q1, [10,30,40,50,70,80,90]);
const q2 = [5,4,3,2,1];
quickSort(q2);
test('quickSort reversed', q2, [1,2,3,4,5]);
const q3 = [42];
quickSort(q3);
test('quickSort single', q3, [42]);

console.log('\\n' + pass + '/' + (pass+fail) + ' tests passed');
`,
        check: (output) => {
          return output.includes('10/10 tests passed');
        },
      },
    ],
  },

  pythonNotebook: {
    title: 'Sorting — Python',
    subtitle: 'Build all three sorting algorithms in Python with comparison visualization',
    cells: [
      {
        id: 'sort-py-bubble-insertion',
        cellTitle: 'Step 1 — Bubble Sort and Insertion Sort',
        prose: [
          'Python makes swaps elegant: a, b = b, a. Both algorithms sort in-place.',
        ],
        instructions: 'Fill in bubble_sort() and insertion_sort().',
        code: `# TODO: fill in bubble_sort — sort arr in-place
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        # for j in range(n - i - 1):
        #   if arr[j] > arr[j+1]: arr[j], arr[j+1] = arr[j+1], arr[j]
        pass
    return arr

# TODO: fill in insertion_sort — sort arr in-place
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        # while j >= 0 and arr[j] > key:
        #   arr[j+1] = arr[j]; j -= 1
        # arr[j+1] = key
    return arr

print('bubble:', bubble_sort([64,34,25,12,22,11,90]))   # [11,12,22,25,34,64,90]
print('insertion:', insertion_sort([12,11,13,5,6]))      # [5,6,11,12,13]
`,
        output: `bubble: [11, 12, 22, 25, 34, 64, 90]
insertion: [5, 6, 11, 12, 13]`,
        status: 'incomplete',
      },

      {
        id: 'sort-py-merge-quick',
        cellTitle: 'Step 2 — Merge Sort and Quicksort',
        prose: [
          'merge_sort returns a new list. quick_sort sorts in-place using lo/hi indices.',
        ],
        instructions: 'Fill in merge(), merge_sort(), partition(), and quick_sort().',
        code: `def merge(left, right):
    result = []
    i = j = 0
    # TODO: while i < len(left) and j < len(right):
    #   pick smaller, advance pointer
    # TODO: extend with remaining left and right
    return result

def merge_sort(arr):
    # TODO: base case, split, recurse, merge
    pass

def partition(arr, lo, hi):
    pivot = arr[hi]
    i = lo - 1
    # TODO: for j in range(lo, hi):
    #   if arr[j] <= pivot: i += 1; swap arr[i], arr[j]
    # swap arr[i+1] and arr[hi]
    # return i + 1
    pass

def quick_sort(arr, lo=0, hi=None):
    if hi is None: hi = len(arr) - 1
    # TODO: if lo >= hi: return
    # p = partition(arr, lo, hi)
    # quick_sort(arr, lo, p - 1)
    # quick_sort(arr, p + 1, hi)
    pass

print('merge_sort:', merge_sort([38,27,43,3,9,82,10]))  # [3,9,10,27,38,43,82]

q = [10,80,30,90,40,50,70]
quick_sort(q)
print('quick_sort:', q)  # [10,30,40,50,70,80,90]
`,
        output: `merge_sort: [3, 9, 10, 27, 38, 43, 82]
quick_sort: [10, 30, 40, 50, 70, 80, 90]`,
        status: 'incomplete',
      },

      {
        id: 'sort-py-scratch',
        cellTitle: 'From Scratch — All Algorithms + Performance Bar Chart',
        prose: [
          'Write every sorting algorithm from memory. When assertions pass, opencalc draws a bar chart comparing how many operations each algorithm takes on a 20-element array.',
        ],
        instructions: 'Fill in all five functions. The figure shows operation counts side by side.',
        code: `from opencalc import Figure

def bubble_sort(arr):
    pass  # your code

def merge(left, right):
    pass  # your code

def merge_sort(arr):
    pass  # your code

def partition(arr, lo, hi):
    pass  # your code

def quick_sort(arr, lo=0, hi=None):
    pass  # your code

# ---------- Assertions ----------
assert bubble_sort([5,3,8,1,9,2]) == [1,2,3,5,8,9], "bubble_sort failed"
assert merge([1,3,5],[2,4,6]) == [1,2,3,4,5,6], "merge failed"
assert merge_sort([38,27,43,3,9,82,10]) == [3,9,10,27,38,43,82], "merge_sort failed"

q = [10,80,30,90,40,50,70]
quick_sort(q)
assert q == [10,30,40,50,70,80,90], "quick_sort failed"

print("All assertions passed!")

# ---------- Count operations for each algorithm ----------
import random

def count_bubble(arr):
    arr = arr[:]
    ops = 0
    n = len(arr)
    for i in range(n-1):
        for j in range(n-i-1):
            ops += 1
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return ops

def count_merge(arr):
    ops = [0]
    def ms(a):
        if len(a) <= 1: return a
        mid = len(a) // 2
        l, r = ms(a[:mid]), ms(a[mid:])
        res = []
        i = j = 0
        while i < len(l) and j < len(r):
            ops[0] += 1
            if l[i] <= r[j]: res.append(l[i]); i += 1
            else:             res.append(r[j]); j += 1
        res += l[i:]; res += r[j:]
        return res
    ms(arr[:])
    return ops[0]

test_data = list(range(20, 0, -1))  # worst case: reversed
bubble_ops = count_bubble(test_data)
merge_ops  = count_merge(test_data)

fig = Figure()
fig.set_title("Operations on 20-element reversed array")
fig.bar(0, bubble_ops, label=f"Bubble ({bubble_ops})", color="#f87171")
fig.bar(1, merge_ops,  label=f"Merge ({merge_ops})",  color="#4ade80")
fig.show()
`,
        output: `All assertions passed!`,
        status: 'incomplete',
        figureJson: null,
      },
    ],
  },
};

export default lesson;
