import { useState, useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { setupOpenCalcMonaco } from "../../utils/monacoThemes.js";

// ─────────────────────────────────────────────────────────────────────────────
//  DSA SERIES — APP 01: ARRAYS & MEMORY
//  Aesthetic: serious hacker workstation — phosphor on near-black,
//  JetBrains-style density, monospace everything, grid substrate,
//  surgical green accents, zero decoration that doesn't earn its place.
// ─────────────────────────────────────────────────────────────────────────────

// ── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#080c0f",
  surface: "#0d1117",
  panel: "#111820",
  border: "#1e2730",
  border2: "#263040",
  green: "#00ff88",
  green2: "#00cc66",
  blue: "#4fc3f7",
  amber: "#ffb347",
  red: "#ff4d6d",
  purple: "#c084fc",
  muted: "#3d5060",
  dim: "#1e2a34",
  text: "#c9d8e8",
  textDim: "#5a7080",
  textBright: "#e8f4ff",
  mono: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
  sans: "'IBM Plex Sans','SF Pro Text',system-ui,sans-serif",
};

const px = (s, extra = {}) => ({ fontFamily: T.mono, ...extra, ...s });

// ── REFERENCE IMPLEMENTATIONS (hidden — used for verification & trace) ────────
const ref_arrayGet = (arr, i) => (i >= 0 && i < arr.length ? arr[i] : null);
const ref_arraySet = (arr, i, v) => {
  const a = [...arr];
  if (i >= 0 && i < a.length) a[i] = v;
  return a;
};
const ref_arrayInsert = (arr, i, v) => {
  const a = [...arr];
  a.splice(i, 0, v);
  return a;
};
const ref_arrayDelete = (arr, i) => {
  const a = [...arr];
  a.splice(i, 1);
  return a;
};
const ref_linearSearch = (arr, v) => arr.findIndex((x) => x === v);
const ref_binarySearch = (arr, v) => {
  let lo = 0,
    hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === v) return mid;
    arr[mid] < v ? (lo = mid + 1) : (hi = mid - 1);
  }
  return -1;
};

// Generate step traces for visualizer
const traceInsert = (arr, idx, val) => {
  const steps = [];
  const a = [...arr];
  steps.push({
    state: [...a],
    highlight: null,
    note: `Start: insert ${val} at index ${idx}`,
    phase: "start",
  });
  for (let i = a.length - 1; i >= idx; i--) {
    a[i + 1] = a[i];
    steps.push({
      state: [...a, 0].slice(0, a.length + 1),
      highlight: i,
      note: `Shift a[${i}] → a[${i + 1}]`,
      phase: "shift",
      addr: i,
    });
  }
  a[idx] = val;
  steps.push({
    state: [...a],
    highlight: idx,
    note: `Write ${val} at index ${idx}`,
    phase: "write",
  });
  return steps;
};

const traceDelete = (arr, idx) => {
  const steps = [];
  const a = [...arr];
  steps.push({
    state: [...a],
    highlight: idx,
    note: `Delete a[${idx}] = ${a[idx]}`,
    phase: "start",
  });
  for (let i = idx; i < a.length - 1; i++) {
    a[i] = a[i + 1];
    steps.push({
      state: [...a],
      highlight: i,
      note: `Shift a[${i + 1}] → a[${i}]`,
      phase: "shift",
    });
  }
  a.pop();
  steps.push({
    state: [...a],
    highlight: null,
    note: `Done. Length now ${a.length}`,
    phase: "done",
  });
  return steps;
};

const traceBinarySearch = (arr, val) => {
  const steps = [];
  let lo = 0,
    hi = arr.length - 1;
  steps.push({
    state: [...arr],
    lo,
    hi,
    mid: null,
    note: `Search for ${val}. lo=${lo}, hi=${hi}`,
    found: -1,
  });
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    steps.push({
      state: [...arr],
      lo,
      hi,
      mid,
      note: `mid=${mid}, a[mid]=${arr[mid]} — compare with ${val}`,
      found: -1,
    });
    if (arr[mid] === val) {
      steps.push({
        state: [...arr],
        lo,
        hi,
        mid,
        note: `Found ${val} at index ${mid}!`,
        found: mid,
      });
      break;
    }
    if (arr[mid] < val) {
      lo = mid + 1;
      steps.push({
        state: [...arr],
        lo,
        hi,
        mid: null,
        note: `${arr[mid]} < ${val} → search right half. lo=${lo}`,
        found: -1,
      });
    } else {
      hi = mid - 1;
      steps.push({
        state: [...arr],
        lo,
        hi,
        mid: null,
        note: `${arr[mid]} > ${val} → search left half. hi=${hi}`,
        found: -1,
      });
    }
  }
  if (steps[steps.length - 1].found === -1)
    steps.push({
      state: [...arr],
      lo,
      hi,
      mid: null,
      note: `Not found. lo > hi — search space exhausted.`,
      found: -2,
    });
  return steps;
};

// ── LESSONS ───────────────────────────────────────────────────────────────────
const LESSONS = [
  {
    id: 0,
    title: "Memory Layout",
    shortTitle: "Memory",
    color: T.green,
    osHook: "Virtual Address Space",
    concept: [
      {
        head: "What an array actually is",
        body: `An array is a contiguous block of memory.
Every element sits at a fixed, calculated address:

  address(i) = base_address + i × element_size

This is why array access is O(1) — the CPU
computes the address directly, no searching.

For a 32-bit integer array at base 0x7fff1000:
  a[0] → 0x7fff1000
  a[1] → 0x7fff1004  (+4 bytes)
  a[2] → 0x7fff1008  (+8 bytes)`,
      },
      {
        head: "The OS side: virtual memory",
        body: `When you declare an array in any language,
the OS allocates virtual memory pages (usually
4096 bytes each) and maps them to physical RAM.

Your process sees addresses like 0x7fff1000.
The CPU's MMU (Memory Management Unit) translates
these to physical RAM addresses transparently.

This is why two processes can both use address
0x7fff1000 — they're in different virtual spaces.

malloc() asks the OS kernel for pages via the
brk() or mmap() syscall. Free RAM is tracked
in a kernel data structure (a tree of free blocks).`,
      },
      {
        head: "Cache lines",
        body: `The CPU doesn't fetch one byte at a time.
It fetches 64-byte cache lines. Arrays are
cache-friendly because sequential access loads
one cache line that covers 16 int elements.

Linked list traversal is cache-hostile because
each node is at a random address → cache miss
every step. This is why arrays beat linked lists
for iteration even when Big-O looks the same.`,
      },
    ],
    pseudo: `// address arithmetic
FUNCTION get(arr, i):
  IF i < 0 OR i >= arr.length:
    RETURN null            // bounds check — no segfault
  address ← base + i × sizeof(element)
  RETURN memory[address]  // one CPU instruction

// Complexity: O(1) — always, regardless of size`,
    starterCode: `function arrayGet(arr, i) {
  // YOUR CODE ↓
  // Check bounds first (prevents out-of-bounds access)
  // Then return arr[i]
  // If out of bounds, return null
  ___
}`,
    blanks: ["___"],
    solutions: [
      `  if (i < 0 || i >= arr.length) return null;\n  return arr[i];`,
    ],
    testFn: (fn) => {
      const a = [10, 20, 30, 40, 50];
      const r0 = fn(a, 0),
        r2 = fn(a, 2),
        rn = fn(a, -1),
        ro = fn(a, 10);
      return {
        ok: r0 === 10 && r2 === 30 && rn === null && ro === null,
        result: r2,
        checks: [
          { label: "get([10,20,30,40,50], 0) = 10", pass: r0 === 10 },
          { label: "get([10,20,30,40,50], 2) = 30", pass: r2 === 30 },
          { label: "get(arr, -1) = null (bounds check)", pass: rn === null },
          { label: "get(arr, 10) = null (out of range)", pass: ro === null },
        ],
      };
    },
  },
  {
    id: 1,
    title: "Insert & Shift",
    shortTitle: "Insert",
    color: T.blue,
    osHook: "Buffer Management",
    concept: [
      {
        head: "Why insert is O(n)",
        body: `Arrays store elements contiguously. Inserting
at index i requires shifting every element from
i to end one position right to make room.

Worst case: insert at index 0 → shift ALL n elements.
Best case:  insert at end    → no shifting needed.
Average:    shift n/2 elements → O(n).

This is the core array trade-off:
  Fast random access  (O(1) reads)
  Slow arbitrary insert (O(n) writes)`,
      },
      {
        head: "OS: keyboard buffer",
        body: `Your keyboard input is managed by the kernel
using a circular buffer (a fixed-size array).

When you type faster than the CPU processes,
the kernel inserts keystrokes into this buffer.
When the buffer is full (overflow), keystrokes
are dropped — that's why fast typists sometimes
lose characters in a slow terminal.

The circular buffer avoids the O(n) shift cost
by using head/tail pointers on a fixed array.
You'll implement this in App 3 (Queues).`,
      },
      {
        head: "Amortized O(1) appending",
        body: `JavaScript arrays (and Python lists) double
in capacity when full. The sequence of appends:
  - n/2 appends: no resize, O(1) each
  - 1 resize: O(n) copy

Total cost for n appends: O(n)
Amortized per append: O(1)

This is why arr.push() is "effectively O(1)"
even though occasionally it's O(n). Same trick
used by C++ std::vector and Java ArrayList.`,
      },
    ],
    pseudo: `FUNCTION insert(arr, i, val):
  // Make space: shift elements right from the end
  FOR j FROM arr.length - 1 DOWN TO i:
    arr[j + 1] ← arr[j]   // shift right

  arr[i] ← val             // write into the gap
  arr.length ← arr.length + 1

// Complexity: O(n) — must shift up to n elements`,
    starterCode: `function arrayInsert(arr, i, val) {
  const a = [...arr]; // clone — never mutate input

  // YOUR CODE A ↓
  // Shift elements from index i rightward to make a gap
  // Loop from end down to i, moving each element one right
  ___A___

  // YOUR CODE B ↓
  // Write val into position i
  ___B___

  return a;
}`,
    blanks: ["___A___", "___B___"],
    solutions: [
      `  for (let j = a.length - 1; j >= i; j--) a[j + 1] = a[j];`,
      `  a[i] = val;`,
    ],
    testFn: (fn) => {
      const a = [1, 2, 3, 4, 5];
      const r0 = fn(a, 0, 99),
        rm = fn(a, 2, 99),
        re = fn(a, 5, 99);
      const ok =
        JSON.stringify(r0) === "[99,1,2,3,4,5]" &&
        JSON.stringify(rm) === "[1,2,99,3,4,5]";
      return {
        ok,
        result: rm,
        checks: [
          {
            label: "insert([1..5], 0, 99) = [99,1,2,3,4,5]",
            pass: JSON.stringify(r0) === "[99,1,2,3,4,5]",
          },
          {
            label: "insert([1..5], 2, 99) = [1,2,99,3,4,5]",
            pass: JSON.stringify(rm) === "[1,2,99,3,4,5]",
          },
          {
            label: "insert([1..5], 5, 99) = [1,2,3,4,5,99]",
            pass: JSON.stringify(re) === "[1,2,3,4,5,99]",
          },
          { label: "Original array not mutated", pass: a.length === 5 },
        ],
      };
    },
    multi: true,
    hasTrace: true,
    traceType: "insert",
  },
  {
    id: 2,
    title: "Delete & Compact",
    shortTitle: "Delete",
    color: T.amber,
    osHook: "Memory Compaction",
    concept: [
      {
        head: "Deletion is also O(n)",
        body: `Deleting from index i requires shifting every
element from i+1 onward one position left.

Without this shift you'd have a "hole" — an
invalid element sitting in the middle. The
array would no longer be contiguous.

This is why arrays store length separately:
the physical memory block doesn't shrink,
but length tells you where valid data ends.`,
      },
      {
        head: "OS: memory fragmentation",
        body: `When the OS frees memory (delete/free/GC),
it leaves holes in the heap — allocated blocks
surrounded by free space too small to reuse.

The kernel's memory allocator (glibc uses
ptmalloc, Linux kernel uses SLUB) must track
these holes. When fragmentation gets bad,
malloc() fails even when total free bytes
would be enough — it needs *contiguous* space.

Some GC languages (Java, Go) run a compaction
phase: copy live objects to one end, slide them
together — exactly the array delete shift,
applied to the entire heap.`,
      },
      {
        head: "Lazy deletion",
        body: `Instead of shifting on every delete, some
systems mark the slot as "deleted" with a
tombstone value and only compact periodically.

Hash tables use this (you'll see it in App 8).
It turns O(n) delete into O(1) amortized,
at the cost of wasted space and slower search.`,
      },
    ],
    pseudo: `FUNCTION delete(arr, i):
  // Compact: shift elements left to fill the gap
  FOR j FROM i TO arr.length - 2:
    arr[j] ← arr[j + 1]   // shift left

  arr.length ← arr.length - 1  // shrink logical size
  RETURN arr

// Complexity: O(n) — must shift up to n elements`,
    starterCode: `function arrayDelete(arr, i) {
  const a = [...arr];

  // YOUR CODE ↓
  // Shift elements from i+1 leftward to fill the gap
  // Then reduce the array length by 1
  // Tip: loop j from i to a.length-2, set a[j] = a[j+1]
  // Then: a.length -= 1  OR  a.pop()
  ___

  return a;
}`,
    blanks: ["___"],
    solutions: [
      `  for (let j = i; j < a.length - 1; j++) a[j] = a[j + 1];\n  a.pop();`,
    ],
    testFn: (fn) => {
      const a = [10, 20, 30, 40, 50];
      const r0 = fn(a, 0),
        rm = fn(a, 2),
        re = fn(a, 4);
      return {
        ok:
          JSON.stringify(r0) === "[20,30,40,50]" &&
          JSON.stringify(rm) === "[10,20,40,50]",
        result: rm,
        checks: [
          {
            label: "delete([10..50], 0) = [20,30,40,50]",
            pass: JSON.stringify(r0) === "[20,30,40,50]",
          },
          {
            label: "delete([10..50], 2) = [10,20,40,50]",
            pass: JSON.stringify(rm) === "[10,20,40,50]",
          },
          {
            label: "delete([10..50], 4) = [10,20,30,40]",
            pass: JSON.stringify(re) === "[10,20,30,40]",
          },
          { label: "Length decreases by 1", pass: r0.length === 4 },
        ],
      };
    },
    hasTrace: true,
    traceType: "delete",
  },
  {
    id: 3,
    title: "Linear Search",
    shortTitle: "Linear",
    color: T.purple,
    osHook: "File System Lookup",
    concept: [
      {
        head: "O(n) — scan every element",
        body: `Linear search checks each element in order
until it finds the target or exhausts the array.

Best case:  target is at index 0      → O(1)
Worst case: target at end or absent   → O(n)
Average:    target at random position → O(n/2) = O(n)

No assumptions about ordering. Works on any array.
The only search option for unsorted data.`,
      },
      {
        head: "OS: directory lookup",
        body: `Early filesystems (FAT12, FAT16) stored directory
entries as a flat array. Finding a file required
scanning every entry — O(n) linear search.

With 1000 files in a directory, finding one file
meant reading up to 1000 directory entries from disk.
Disk I/O is ~100,000× slower than RAM access, so
this was catastrophically slow for large directories.

Modern filesystems (ext4, NTFS, APFS) use B-trees
(a generalized balanced BST) for directories —
O(log n) lookup regardless of directory size.
You'll build this foundation in App 6 (Trees).`,
      },
      {
        head: "When linear search wins",
        body: `Despite O(n), linear search beats binary search
for small arrays (n < ~20) because:
1. No sort requirement
2. CPU branch prediction favors sequential access
3. Entire small array fits in L1 cache (32KB)
4. No overhead of computing midpoints

Real implementations often use linear search for
small arrays and switch to binary/hash for larger.
Go's sort.Search() and Java's Arrays.binarySearch()
both have this hybrid logic.`,
      },
    ],
    pseudo: `FUNCTION linearSearch(arr, target):
  FOR i FROM 0 TO arr.length - 1:
    IF arr[i] = target:
      RETURN i        // found — return index

  RETURN -1           // not found

// Complexity: O(n) worst/average, O(1) best`,
    starterCode: `function linearSearch(arr, target) {
  // YOUR CODE ↓
  // Iterate through arr
  // Return the index of the first element equal to target
  // Return -1 if not found
  ___
}`,
    blanks: ["___"],
    solutions: [
      `  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;`,
    ],
    testFn: (fn) => {
      const a = [5, 3, 8, 1, 9, 2, 7];
      return {
        ok: fn(a, 8) === 2 && fn(a, 99) === -1 && fn(a, 5) === 0,
        result: fn(a, 8),
        checks: [
          {
            label: "linearSearch([5,3,8,1,9,2,7], 8) = 2",
            pass: fn(a, 8) === 2,
          },
          {
            label: "linearSearch(arr, 5) = 0 (first element)",
            pass: fn(a, 5) === 0,
          },
          {
            label: "linearSearch(arr, 99) = -1 (not found)",
            pass: fn(a, 99) === -1,
          },
          {
            label: "linearSearch(arr, 7) = 6 (last element)",
            pass: fn(a, 7) === 6,
          },
        ],
      };
    },
  },
  {
    id: 4,
    title: "Binary Search",
    shortTitle: "Binary",
    color: T.green,
    osHook: "OS Kernel Symbol Tables",
    concept: [
      {
        head: "O(log n) — halve the search space",
        body: `Binary search requires a SORTED array.
Each step eliminates half the remaining elements:

  n=1000: 10 steps maximum (log₂ 1000 ≈ 10)
  n=1M:   20 steps maximum
  n=1B:   30 steps maximum

Compare linear search on 1 billion elements:
  worst case 1,000,000,000 comparisons vs 30.

The requirement: array must be sorted.
The payoff: absurdly fast for large datasets.`,
      },
      {
        head: "OS: kernel symbol tables",
        body: `The Linux kernel maintains a sorted symbol table
(/proc/kallsyms) mapping function names to
memory addresses. ~100,000 symbols.

When a kernel panic prints a stack trace, it
must resolve each return address to a function
name — binary searching the symbol table.
Without binary search, a single panic would take
seconds just for symbol resolution.

The C standard library qsort() + bsearch()
pair is used everywhere in the kernel for this
reason. Sort once, binary search many times.`,
      },
      {
        head: "The off-by-one trap",
        body: `Binary search has a famous bug: integer overflow
in the midpoint calculation.

WRONG:  mid = (lo + hi) / 2
  → lo + hi can overflow 32-bit int if both are large

CORRECT: mid = lo + (hi - lo) / 2
  → always stays within range

This bug existed in Java's Arrays.binarySearch()
for nearly a decade (2006 blog post by Joshua Bloch,
one of Java's designers). The overflow only triggers
with arrays > 1 billion elements — rare in testing.

JavaScript uses floating point so overflow isn't
the issue, but the pattern is worth knowing.`,
      },
    ],
    pseudo: `FUNCTION binarySearch(arr, target):
  lo ← 0
  hi ← arr.length - 1

  WHILE lo ≤ hi:
    mid ← lo + (hi - lo) / 2  // safe midpoint

    IF arr[mid] = target:
      RETURN mid           // found

    IF arr[mid] < target:
      lo ← mid + 1         // target in right half

    ELSE:
      hi ← mid - 1         // target in left half

  RETURN -1                // not found

// Complexity: O(log n)`,
    starterCode: `function binarySearch(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    // YOUR CODE A ↓  compute mid safely (no overflow)
    const mid = ___A___;

    if (arr[mid] === target) return mid;

    // YOUR CODE B ↓  narrow the search range
    if (arr[mid] < target) {
      ___B___   // target is in right half
    } else {
      ___C___   // target is in left half
    }
  }
  return -1;
}`,
    blanks: ["___A___", "___B___", "___C___"],
    solutions: [
      `lo + Math.floor((hi - lo) / 2)`,
      `lo = mid + 1;`,
      `hi = mid - 1;`,
    ],
    testFn: (fn) => {
      const a = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
      return {
        ok: fn(a, 7) === 3 && fn(a, 1) === 0 && fn(a, 4) === -1,
        result: fn(a, 7),
        checks: [
          { label: "binarySearch([1,3..19], 7) = 3", pass: fn(a, 7) === 3 },
          { label: "binarySearch(arr, 1) = 0 (first)", pass: fn(a, 1) === 0 },
          { label: "binarySearch(arr, 19) = 9 (last)", pass: fn(a, 19) === 9 },
          {
            label: "binarySearch(arr, 4) = -1 (not found)",
            pass: fn(a, 4) === -1,
          },
        ],
      };
    },
    multi: true,
    hasTrace: true,
    traceType: "binarySearch",
  },
];

// ── PYTHON STARTERS ───────────────────────────────────────────────────────────
const PY_STARTERS = [
  `def array_get(arr, i):
    # YOUR CODE ↓  bounds check then return
    ___`,
  `def array_insert(arr, i, val):
    a = arr[:]
    # YOUR CODE A ↓  shift elements right from end to i
    ___A___
    # YOUR CODE B ↓  write val at index i
    ___B___
    return a`,
  `def array_delete(arr, i):
    a = arr[:]
    # YOUR CODE ↓  shift left from i, then shrink
    ___
    return a`,
  `def linear_search(arr, target):
    # YOUR CODE ↓
    ___`,
  `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        # YOUR CODE A ↓  safe midpoint
        mid = ___A___
        if arr[mid] == target: return mid
        # YOUR CODE B/C ↓  narrow range
        if arr[mid] < target:
            ___B___
        else:
            ___C___
    return -1`,
];

const PY_BLANKS = [
  ["___"],
  ["___A___", "___B___"],
  ["___"],
  ["___"],
  ["___A___", "___B___", "___C___"],
];

const PY_SOLUTIONS = [
  ["    if i < 0 or i >= len(arr): return None\n    return arr[i]"],
  [
    "    for j in range(len(a)-1, i-1, -1):\n        if j+1 < len(a): a[j+1]=a[j]\n        else: a.append(a[j])\n    if i >= len(a): a.append(val)",
    "    a[i] = val",
  ],
  ["    for j in range(i, len(a)-1):\n        a[j] = a[j+1]\n    a.pop()"],
  [
    "    for i in range(len(arr)):\n        if arr[i] == target: return i\n    return -1",
  ],
  ["    lo + (hi - lo) // 2", "        lo = mid + 1", "        hi = mid - 1"],
];

const PY_HARNESSES = [
  `import json as _j
_a=[10,20,30,40,50]
_checks=[
  {'label':'get(arr,0)=10','pass':array_get(_a,0)==10},
  {'label':'get(arr,2)=30','pass':array_get(_a,2)==30},
  {'label':'get(arr,-1)=None','pass':array_get(_a,-1) is None},
  {'label':'get(arr,10)=None','pass':array_get(_a,10) is None},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':array_get(_a,2)})`,

  `import json as _j
_a=[1,2,3,4,5]
_r0=array_insert(_a,0,99)
_rm=array_insert(_a,2,99)
_re=array_insert(_a,5,99)
_checks=[
  {'label':'insert at 0 → [99,1,2,3,4,5]','pass':_r0==[99,1,2,3,4,5]},
  {'label':'insert at 2 → [1,2,99,3,4,5]','pass':_rm==[1,2,99,3,4,5]},
  {'label':'insert at end','pass':_re==[1,2,3,4,5,99]},
  {'label':'original not mutated','pass':_a==[1,2,3,4,5]},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_rm})`,

  `import json as _j
_a=[10,20,30,40,50]
_r0=array_delete(_a,0)
_rm=array_delete(_a,2)
_checks=[
  {'label':'delete idx 0 → [20,30,40,50]','pass':_r0==[20,30,40,50]},
  {'label':'delete idx 2 → [10,20,40,50]','pass':_rm==[10,20,40,50]},
  {'label':'length decreases','pass':len(_r0)==4},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_rm})`,

  `import json as _j
_a=[5,3,8,1,9,2,7]
_checks=[
  {'label':'search 8 → 2','pass':linear_search(_a,8)==2},
  {'label':'search 5 → 0','pass':linear_search(_a,5)==0},
  {'label':'search 99 → -1','pass':linear_search(_a,99)==-1},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':linear_search(_a,8)})`,

  `import json as _j
_a=[1,3,5,7,9,11,13,15,17,19]
_checks=[
  {'label':'search 7 → 3','pass':binary_search(_a,7)==3},
  {'label':'search 1 → 0','pass':binary_search(_a,1)==0},
  {'label':'search 4 → -1','pass':binary_search(_a,4)==-1},
  {'label':'search 19 → 9','pass':binary_search(_a,19)==9},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':binary_search(_a,7)})`,
];

// ── JS RUNNER ─────────────────────────────────────────────────────────────────
const runJS = (lesson, code) => {
  try {
    const fnMatch = code.match(/function\s+(\w+)/);
    if (!fnMatch) return { error: "No function definition found." };
    // eslint-disable-next-line no-new-func
    const fn = new Function(code + `; return ${fnMatch[1]};`)();
    return { testResult: lesson.testFn(fn), error: null };
  } catch (e) {
    return { error: e.message || String(e) };
  }
};

// ── MEMORY VISUALIZER ─────────────────────────────────────────────────────────
const MemoryViz = ({ arr, highlight, lo, hi, mid, found, phase, label }) => {
  const BASE_ADDR = 0x7fff1000;
  const ELEM_SIZE = 4;

  return (
    <div style={{ overflowX: "auto" }}>
      {/* Address bar */}
      <div style={{ display: "flex", gap: 0, marginBottom: 2 }}>
        <div style={{ width: 80, flexShrink: 0 }} />
        {arr.map((_, i) => (
          <div
            key={i}
            style={{
              width: 56,
              flexShrink: 0,
              textAlign: "center",
              fontSize: 8,
              color: T.muted,
              fontFamily: T.mono,
              letterSpacing: -0.5,
            }}
          >
            {`0x${(BASE_ADDR + i * ELEM_SIZE).toString(16)}`}
          </div>
        ))}
      </div>

      {/* Index bar */}
      <div style={{ display: "flex", gap: 0, marginBottom: 3 }}>
        <div
          style={{
            width: 80,
            flexShrink: 0,
            fontSize: 9,
            color: T.muted,
            fontFamily: T.mono,
            paddingTop: 4,
          }}
        >
          index
        </div>
        {arr.map((_, i) => (
          <div
            key={i}
            style={{
              width: 56,
              flexShrink: 0,
              textAlign: "center",
              fontSize: 10,
              color: T.textDim,
              fontFamily: T.mono,
            }}
          >
            [{i}]
          </div>
        ))}
      </div>

      {/* Memory cells */}
      <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
        <div
          style={{
            width: 80,
            flexShrink: 0,
            fontSize: 9,
            color: T.muted,
            fontFamily: T.mono,
            paddingTop: 12,
          }}
        >
          mem
        </div>
        {arr.map((v, i) => {
          const isHighlight = highlight === i;
          const isLo = lo === i;
          const isHi = hi === i;
          const isMid = mid === i;
          const isFound = found === i;
          const inRange =
            lo !== undefined && hi !== undefined && i >= lo && i <= hi;

          let bg = T.dim;
          let border = `1px solid ${T.border2}`;
          let textCol = T.text;

          if (isFound) {
            bg = "#1a4020";
            border = `1px solid ${T.green}`;
            textCol = T.green;
          } else if (isMid) {
            bg = "#1a1a40";
            border = `1px solid ${T.blue}`;
            textCol = T.blue;
          } else if (isHighlight && phase === "shift") {
            bg = "#2a1a00";
            border = `1px solid ${T.amber}`;
            textCol = T.amber;
          } else if (isHighlight && phase === "write") {
            bg = "#1a2a10";
            border = `1px solid ${T.green}`;
            textCol = T.green;
          } else if (isHighlight) {
            bg = "#2a1020";
            border = `1px solid ${T.red}`;
            textCol = T.red;
          } else if (inRange) {
            bg = "#0d1420";
            border = `1px solid #1e2d45`;
          }

          return (
            <div
              key={i}
              style={{ width: 56, flexShrink: 0, position: "relative" }}
            >
              <div
                style={{
                  height: 44,
                  background: bg,
                  border,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: T.mono,
                  fontSize: 13,
                  fontWeight: 600,
                  color: textCol,
                  transition: "all .2s",
                }}
              >
                {v}
              </div>
              {/* Range markers */}
              <div
                style={{
                  height: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                {isLo && (
                  <span
                    style={{ fontSize: 8, color: T.purple, fontFamily: T.mono }}
                  >
                    lo
                  </span>
                )}
                {isMid && (
                  <span
                    style={{ fontSize: 8, color: T.blue, fontFamily: T.mono }}
                  >
                    mid
                  </span>
                )}
                {isHi && (
                  <span
                    style={{ fontSize: 8, color: T.purple, fontFamily: T.mono }}
                  >
                    hi
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      {label && (
        <div
          style={{
            marginTop: 10,
            fontFamily: T.mono,
            fontSize: 11,
            color: T.textDim,
            lineHeight: 1.5,
            padding: "6px 10px",
            background: T.dim,
            borderRadius: 4,
            borderLeft: `2px solid ${T.border2}`,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

// ── COMPLEXITY CHART ──────────────────────────────────────────────────────────
const ComplexityChart = ({ active }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width,
      H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = T.surface;
    ctx.fillRect(0, 0, W, H);

    const PAD = 32,
      plotW = W - PAD * 2,
      plotH = H - PAD * 2;
    const maxN = 100,
      maxOps = 200;

    // Grid
    ctx.strokeStyle = T.border;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const x = PAD + i * (plotW / 5),
        y = PAD + i * (plotH / 5);
      ctx.beginPath();
      ctx.moveTo(x, PAD);
      ctx.lineTo(x, PAD + plotH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(PAD + plotW, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = T.muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, PAD);
    ctx.lineTo(PAD, PAD + plotH);
    ctx.lineTo(PAD + plotW, PAD + plotH);
    ctx.stroke();
    ctx.fillStyle = T.textDim;
    ctx.font = `9px ${T.mono}`;
    ctx.fillText("n (elements)", PAD + plotW / 2 - 20, H - 4);
    ctx.save();
    ctx.translate(10, PAD + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("operations", 0, 0);
    ctx.restore();

    const curves = [
      { name: "O(1)", fn: (_) => 1, col: T.green },
      { name: "O(log n)", fn: (n) => Math.log2(n + 1) * 10, col: T.blue },
      { name: "O(n)", fn: (n) => n * 2, col: T.amber },
    ];

    curves.forEach(({ name, fn, col, dash }) => {
      const isActive =
        active && active.includes(name.replace("O(", "").replace(")", ""));
      ctx.strokeStyle = isActive ? col : col + "44";
      ctx.lineWidth = isActive ? 2.5 : 1;
      if (dash) ctx.setLineDash([4, 3]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      let first = true;
      for (let n = 1; n <= maxN; n++) {
        const ops = fn(n);
        const x = PAD + (n / maxN) * plotW;
        const y = PAD + plotH - (Math.min(ops, maxOps) / maxOps) * plotH;
        first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        first = false;
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // Label
      const labelN = maxN * 0.8;
      const ops = fn(labelN);
      const lx = PAD + (labelN / maxN) * plotW + 4;
      const ly = PAD + plotH - (Math.min(ops, maxOps) / maxOps) * plotH;
      if (ly > PAD + 6 && ly < PAD + plotH - 4) {
        ctx.fillStyle = isActive ? col : col + "66";
        ctx.font = `${isActive ? 10 : 9}px ${T.mono}`;
        ctx.fillText(name, lx, ly);
      }
    });
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={160}
      style={{
        width: "100%",
        borderRadius: 6,
        border: `1px solid ${T.border}`,
        display: "block",
      }}
    />
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function DSA01Arrays({ onBack }) {
  const [lessonIdx, setLessonIdx] = useState(0);
  const [tab, setTab] = useState("concept");
  const [lang, setLang] = useState("js");
  const [jsCode, setJsCode] = useState(LESSONS[0].starterCode);
  const [pyCode, setPyCode] = useState(PY_STARTERS[0]);
  const [runResult, setRunResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [traceSteps, setTraceSteps] = useState([]);
  const [traceIdx, setTraceIdx] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [demoArr, setDemoArr] = useState([12, 34, 56, 78, 90, 23, 45]);
  const [demoSorted, setDemoSorted] = useState([
    2, 5, 8, 12, 16, 23, 35, 42, 58, 72,
  ]);
  const [demoInput, setDemoInput] = useState("");
  const [demoOp, setDemoOp] = useState("insert");
  const [demoIdx, setDemoIdx] = useState(2);
  const [demoVal, setDemoVal] = useState(99);

  const lesson = LESSONS[lessonIdx];
  const lc = lesson.color;
  const isComplete = completed.has(lessonIdx);

  const currentCode = lang === "js" ? jsCode : pyCode;
  const setCurrentCode = lang === "js" ? setJsCode : setPyCode;
  const currentBlanks =
    lang === "js" ? lesson.blanks : PY_BLANKS[lessonIdx] || [];
  const currentSols =
    lang === "js" ? lesson.solutions : PY_SOLUTIONS[lessonIdx] || [];
  const currentStarter =
    lang === "js" ? lesson.starterCode : PY_STARTERS[lessonIdx];

  const switchLesson = (idx) => {
    setLessonIdx(idx);
    setJsCode(LESSONS[idx].starterCode);
    setPyCode(PY_STARTERS[idx]);
    setRunResult(null);
    setShowHint(false);
    setTraceSteps([]);
    setTraceIdx(0);
    setTab("concept");
  };

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    if (lang === "js") {
      const res = runJS(lesson, jsCode);
      setRunResult(res);
      if (res.testResult?.ok) {
        setCompleted((c) => new Set([...c, lessonIdx]));
        buildTrace();
      }
    } else {
      // Pyodide path — caller must inject getPyodide
      try {
        // Dynamic import so this file works without pyodide too
        const { getPyodide } =
          await import("../../utils/pyodideRuntime.js").catch(() => ({
            getPyodide: null,
          }));
        if (!getPyodide) {
          setRunResult({
            error: "Pyodide runtime not available in this environment.",
          });
          setRunning(false);
          return;
        }
        const pyodide = await getPyodide();
        const fullCode = `${pyCode}\n${PY_HARNESSES[lessonIdx]}`;
        await pyodide.runPythonAsync(fullCode);
        const proxy = pyodide.globals.get("_matrix_result");
        const parsed = JSON.parse(
          typeof proxy === "string" ? proxy : proxy.toString(),
        );
        if (typeof proxy?.destroy === "function") proxy.destroy();
        setRunResult({
          testResult: {
            ok: parsed.ok,
            checks: parsed.checks,
            result: parsed.result,
          },
        });
        if (parsed.ok) {
          setCompleted((c) => new Set([...c, lessonIdx]));
          buildTrace();
        }
      } catch (e) {
        setRunResult({ error: e.message || String(e) });
      }
    }
    setRunning(false);
  };

  const buildTrace = useCallback(() => {
    const l = LESSONS[lessonIdx];
    if (!l.hasTrace) return;
    let steps = [];
    if (l.traceType === "insert")
      steps = traceInsert(demoArr, demoIdx, demoVal);
    if (l.traceType === "delete") steps = traceDelete(demoArr, demoIdx);
    if (l.traceType === "binarySearch")
      steps = traceBinarySearch(demoSorted, demoVal);
    setTraceSteps(steps);
    setTraceIdx(0);
  }, [lessonIdx, demoArr, demoSorted, demoIdx, demoVal]);

  const handleReveal = () => {
    let code = currentStarter;
    currentBlanks.forEach((b, i) => {
      code = code.replace(b, currentSols[i] || "");
    });
    setCurrentCode(code);
  };

  const cur = traceSteps[traceIdx];

  // Scanline overlay
  const scanlineStyle = {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 9999,
    backgroundImage:
      "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)",
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: T.bg,
        fontFamily: T.sans,
        color: T.text,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={scanlineStyle} />

      {/* ═══ HEADER ═══ */}
      <div
        style={{
          height: 46,
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          gap: 14,
          flexShrink: 0,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              height: 28,
              padding: "0 10px",
              borderRadius: 4,
              background: "transparent",
              border: `1px solid ${T.border2}`,
              color: T.muted,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: T.mono,
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            ‹ Back
          </button>
        )}
        {/* Series badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 10px",
            borderRadius: 4,
            background: `${T.green}12`,
            border: `1px solid ${T.green}30`,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: T.green,
              boxShadow: `0 0 6px ${T.green}`,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: T.mono,
              color: T.green,
              letterSpacing: "0.12em",
              fontWeight: 700,
            }}
          >
            DSA SERIES
          </span>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: T.textBright,
            letterSpacing: -0.3,
          }}
        >
          01 — Arrays & Memory
        </div>
        <div style={{ fontSize: 11, color: T.textDim, fontFamily: T.mono }}>
          /dev/memory → O(1) access → O(n) mutation
        </div>

        {/* Lesson progress dots */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 5,
            alignItems: "center",
          }}
        >
          {LESSONS.map((_, i) => (
            <div
              key={i}
              onClick={() => switchLesson(i)}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                cursor: "pointer",
                background: completed.has(i)
                  ? LESSONS[i].color
                  : i === lessonIdx
                    ? LESSONS[i].color + "44"
                    : T.dim,
                border: `1px solid ${completed.has(i) || i === lessonIdx ? LESSONS[i].color : T.border2}`,
                boxShadow: completed.has(i)
                  ? `0 0 6px ${LESSONS[i].color}66`
                  : "none",
                transition: "all .2s",
              }}
            />
          ))}
          <span
            style={{
              fontSize: 10,
              color: T.muted,
              marginLeft: 6,
              fontFamily: T.mono,
            }}
          >
            {completed.size}/{LESSONS.length}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ═══ SIDEBAR ═══ */}
        <div
          style={{
            width: 240,
            background: T.panel,
            borderRight: `1px solid ${T.border}`,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "12px 14px 6px",
              fontSize: 9,
              fontWeight: 700,
              color: T.muted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: T.mono,
            }}
          >
            Lessons
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {LESSONS.map((l, i) => {
              const active = i === lessonIdx,
                done = completed.has(i);
              return (
                <div
                  key={i}
                  onClick={() => switchLesson(i)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    background: active ? `${l.color}08` : "transparent",
                    borderLeft: `2px solid ${active ? l.color : "transparent"}`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    transition: "background .1s",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      flexShrink: 0,
                      background: done ? l.color : T.dim,
                      border: `1px solid ${done ? l.color : active ? l.color + "66" : T.border2}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: done ? "#000" : active ? l.color : T.muted,
                      fontFamily: T.mono,
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: active ? 600 : 400,
                        color: active ? T.textBright : T.textDim,
                        lineHeight: 1.3,
                      }}
                    >
                      {l.shortTitle}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: T.muted,
                        marginTop: 2,
                        fontFamily: T.mono,
                      }}
                    >
                      {l.osHook}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Complexity reference */}
          <div
            style={{ padding: "10px 14px", borderTop: `1px solid ${T.border}` }}
          >
            <div
              style={{
                fontSize: 9,
                color: T.muted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 8,
                fontFamily: T.mono,
              }}
            >
              Complexity
            </div>
            <ComplexityChart
              active={
                lessonIdx <= 2
                  ? ["1", "n"]
                  : lessonIdx === 3
                    ? ["n"]
                    : ["1", "log n"]
              }
            />
            <div
              style={{
                marginTop: 6,
                fontSize: 9,
                color: T.muted,
                fontFamily: T.mono,
                lineHeight: 1.8,
              }}
            >
              {lessonIdx <= 2 && (
                <>
                  <span style={{ color: T.green }}>get</span>: O(1){" "}
                  <span style={{ color: T.amber }}>insert/del</span>: O(n)
                  <br />
                </>
              )}
              {lessonIdx === 3 && (
                <>
                  <span style={{ color: T.amber }}>linear</span>: O(n)
                  <br />
                </>
              )}
              {lessonIdx === 4 && (
                <>
                  <span style={{ color: T.blue }}>binary</span>: O(log n)
                  <br />
                  requires sorted array
                </>
              )}
            </div>
          </div>
        </div>

        {/* ═══ MAIN ═══ */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* ── LEFT: Lesson panel ── */}
          <div
            style={{
              width: 380,
              background: T.panel,
              borderRight: `1px solid ${T.border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "14px 16px 12px",
                borderBottom: `1px solid ${T.border}`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: lc,
                    background: `${lc}15`,
                    border: `1px solid ${lc}30`,
                    borderRadius: 3,
                    padding: "2px 8px",
                    fontFamily: T.mono,
                  }}
                >
                  {lesson.osHook.toUpperCase()}
                </div>
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: T.textBright,
                  letterSpacing: -0.5,
                  lineHeight: 1.2,
                }}
              >
                {lesson.title}
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                background: T.bg,
                borderBottom: `1px solid ${T.border}`,
                flexShrink: 0,
              }}
            >
              {[
                ["concept", "Concept"],
                ["pseudo", "Pseudocode"],
                ["code", "Inputs"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    fontSize: 11,
                    fontWeight: tab === id ? 700 : 400,
                    color: tab === id ? lc : T.muted,
                    background: "transparent",
                    border: "none",
                    borderBottom: `2px solid ${tab === id ? lc : "transparent"}`,
                    cursor: "pointer",
                    fontFamily: T.mono,
                    letterSpacing: "0.04em",
                    transition: "color .12s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
              {tab === "concept" &&
                lesson.concept.map((b, i) => (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: lc,
                        letterSpacing: "0.1em",
                        marginBottom: 6,
                        textTransform: "uppercase",
                        fontFamily: T.mono,
                      }}
                    >
                      {b.head}
                    </div>
                    <pre
                      style={{
                        fontSize: 11.5,
                        color: T.textDim,
                        lineHeight: 1.85,
                        whiteSpace: "pre-wrap",
                        margin: 0,
                        fontFamily: T.mono,
                      }}
                    >
                      {b.body}
                    </pre>
                  </div>
                ))}

              {tab === "pseudo" && (
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.muted,
                      letterSpacing: "0.1em",
                      marginBottom: 10,
                      textTransform: "uppercase",
                      fontFamily: T.mono,
                    }}
                  >
                    Algorithm — read this, then write the code
                  </div>
                  <pre
                    style={{
                      fontSize: 11.5,
                      color: "#a8c8a8",
                      lineHeight: 2,
                      whiteSpace: "pre-wrap",
                      margin: 0,
                      fontFamily: T.mono,
                      background: "#0a1008",
                      border: `1px solid #1a3020`,
                      borderRadius: 6,
                      padding: "14px",
                    }}
                  >
                    {lesson.pseudo}
                  </pre>
                  <div
                    style={{
                      marginTop: 12,
                      padding: "8px 12px",
                      background: `${lc}0a`,
                      border: `1px solid ${lc}20`,
                      borderRadius: 5,
                      fontSize: 10.5,
                      color: T.textDim,
                      lineHeight: 1.6,
                      fontFamily: T.mono,
                    }}
                  >
                    Fill in the <span style={{ color: lc }}>___</span> blanks
                    above, guided by this pseudocode. Each blank is one line.
                  </div>
                </div>
              )}

              {tab === "code" && (
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      color: T.muted,
                      letterSpacing: "0.1em",
                      marginBottom: 10,
                      fontFamily: T.mono,
                      textTransform: "uppercase",
                    }}
                  >
                    Interactive Demo
                  </div>

                  {/* Live demo array */}
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: 9,
                        color: T.muted,
                        marginBottom: 6,
                        fontFamily: T.mono,
                      }}
                    >
                      {lessonIdx === 4 ? "sorted array" : "working array"}
                    </div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {(lessonIdx === 4 ? demoSorted : demoArr).map((v, i) => (
                        <div
                          key={i}
                          style={{
                            width: 36,
                            height: 36,
                            background: T.dim,
                            border: `1px solid ${T.border2}`,
                            borderRadius: 3,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: T.mono,
                            fontSize: 11,
                            color: T.text,
                          }}
                        >
                          <span>{v}</span>
                          <span style={{ fontSize: 7, color: T.muted }}>
                            [{i}]
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Demo controls */}
                  {lessonIdx === 1 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          color: T.muted,
                          fontFamily: T.mono,
                        }}
                      >
                        Try it:
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color: T.textDim,
                            fontFamily: T.mono,
                            width: 40,
                          }}
                        >
                          idx
                        </span>
                        <input
                          type="number"
                          value={demoIdx}
                          min={0}
                          max={demoArr.length}
                          onChange={(e) => setDemoIdx(+e.target.value)}
                          style={{
                            width: 50,
                            padding: "3px 6px",
                            background: T.dim,
                            border: `1px solid ${T.border2}`,
                            borderRadius: 3,
                            color: T.text,
                            fontFamily: T.mono,
                            fontSize: 11,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 10,
                            color: T.textDim,
                            fontFamily: T.mono,
                            width: 30,
                          }}
                        >
                          val
                        </span>
                        <input
                          type="number"
                          value={demoVal}
                          onChange={(e) => setDemoVal(+e.target.value)}
                          style={{
                            width: 50,
                            padding: "3px 6px",
                            background: T.dim,
                            border: `1px solid ${T.border2}`,
                            borderRadius: 3,
                            color: T.text,
                            fontFamily: T.mono,
                            fontSize: 11,
                          }}
                        />
                        <button
                          onClick={() => {
                            const steps = traceInsert(
                              demoArr,
                              demoIdx,
                              demoVal,
                            );
                            setTraceSteps(steps);
                            setTraceIdx(0);
                          }}
                          style={{
                            padding: "4px 10px",
                            background: `${lc}18`,
                            border: `1px solid ${lc}44`,
                            borderRadius: 3,
                            color: lc,
                            fontSize: 10,
                            cursor: "pointer",
                            fontFamily: T.mono,
                          }}
                        >
                          trace
                        </button>
                      </div>
                    </div>
                  )}

                  {lessonIdx === 2 && (
                    <div
                      style={{ display: "flex", gap: 6, alignItems: "center" }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          color: T.textDim,
                          fontFamily: T.mono,
                          width: 30,
                        }}
                      >
                        idx
                      </span>
                      <input
                        type="number"
                        value={demoIdx}
                        min={0}
                        max={demoArr.length - 1}
                        onChange={(e) => setDemoIdx(+e.target.value)}
                        style={{
                          width: 50,
                          padding: "3px 6px",
                          background: T.dim,
                          border: `1px solid ${T.border2}`,
                          borderRadius: 3,
                          color: T.text,
                          fontFamily: T.mono,
                          fontSize: 11,
                        }}
                      />
                      <button
                        onClick={() => {
                          const steps = traceDelete(demoArr, demoIdx);
                          setTraceSteps(steps);
                          setTraceIdx(0);
                        }}
                        style={{
                          padding: "4px 10px",
                          background: `${lc}18`,
                          border: `1px solid ${lc}44`,
                          borderRadius: 3,
                          color: lc,
                          fontSize: 10,
                          cursor: "pointer",
                          fontFamily: T.mono,
                        }}
                      >
                        trace
                      </button>
                    </div>
                  )}

                  {lessonIdx === 4 && (
                    <div
                      style={{ display: "flex", gap: 6, alignItems: "center" }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          color: T.textDim,
                          fontFamily: T.mono,
                          width: 60,
                        }}
                      >
                        search
                      </span>
                      <input
                        type="number"
                        value={demoVal}
                        onChange={(e) => setDemoVal(+e.target.value)}
                        style={{
                          width: 60,
                          padding: "3px 6px",
                          background: T.dim,
                          border: `1px solid ${T.border2}`,
                          borderRadius: 3,
                          color: T.text,
                          fontFamily: T.mono,
                          fontSize: 11,
                        }}
                      />
                      <button
                        onClick={() => {
                          const steps = traceBinarySearch(demoSorted, demoVal);
                          setTraceSteps(steps);
                          setTraceIdx(0);
                        }}
                        style={{
                          padding: "4px 10px",
                          background: `${lc}18`,
                          border: `1px solid ${lc}44`,
                          borderRadius: 3,
                          color: lc,
                          fontSize: 10,
                          cursor: "pointer",
                          fontFamily: T.mono,
                        }}
                      >
                        trace
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── CENTER: Code editor ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: T.bg,
              overflow: "hidden",
            }}
          >
            {/* Toolbar */}
            <div
              style={{
                height: 40,
                background: T.surface,
                borderBottom: `1px solid ${T.border}`,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <button
                onClick={handleRun}
                disabled={running}
                style={{
                  height: 26,
                  padding: "0 16px",
                  borderRadius: 4,
                  background: isComplete ? `${T.green}18` : `${lc}15`,
                  border: `1px solid ${isComplete ? T.green2 : lc + "55"}`,
                  color: isComplete ? T.green : lc,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: running ? "default" : "pointer",
                  fontFamily: T.mono,
                  letterSpacing: "0.04em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: running ? 0.6 : 1,
                  boxShadow: isComplete ? `0 0 8px ${T.green}22` : "none",
                }}
              >
                <span style={{ fontSize: 8 }}>{running ? "⟳" : "▶"}</span>
                {running ? "Running…" : "Run"}
              </button>

              <button
                onClick={() => setShowHint((h) => !h)}
                style={{
                  height: 26,
                  padding: "0 10px",
                  borderRadius: 4,
                  background: "transparent",
                  border: `1px solid ${T.border2}`,
                  color: showHint ? lc : T.muted,
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: T.mono,
                }}
              >
                {showHint ? "Hide Hint" : "Hint"}
              </button>

              <button
                onClick={handleReveal}
                style={{
                  height: 26,
                  padding: "0 10px",
                  borderRadius: 4,
                  background: "transparent",
                  border: `1px solid ${T.border2}`,
                  color: T.muted,
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: T.mono,
                }}
              >
                Reveal
              </button>

              {lesson.hasTrace && (
                <button
                  onClick={buildTrace}
                  style={{
                    height: 26,
                    padding: "0 10px",
                    borderRadius: 4,
                    background: `${T.purple}15`,
                    border: `1px solid ${T.purple}44`,
                    color: T.purple,
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: T.mono,
                  }}
                >
                  Step Through
                </button>
              )}

              {isComplete && (
                <span
                  style={{
                    fontSize: 10,
                    color: T.green,
                    background: `${T.green}10`,
                    border: `1px solid ${T.green}30`,
                    borderRadius: 3,
                    padding: "3px 8px",
                    fontFamily: T.mono,
                    boxShadow: `0 0 6px ${T.green}22`,
                  }}
                >
                  ✓ passing
                </span>
              )}

              {/* Lang switcher */}
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                {[
                  ["js", "JS"],
                  ["python", "Python"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setLang(id);
                      setRunResult(null);
                    }}
                    style={{
                      height: 22,
                      padding: "0 8px",
                      borderRadius: 3,
                      background:
                        lang === id
                          ? `${id === "js" ? "#f7df1e" : "#7dd3fc"}18`
                          : "transparent",
                      border: `1px solid ${lang === id ? (id === "js" ? "#f7df1e" : "#7dd3fc") : T.border2}`,
                      color:
                        lang === id
                          ? id === "js"
                            ? "#f7df1e"
                            : "#7dd3fc"
                          : T.muted,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: T.mono,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {showHint && (
              <div
                style={{
                  padding: "8px 14px",
                  background: "#1a1400",
                  borderBottom: `1px solid #3a2800`,
                  fontSize: 11,
                  color: "#c8a040",
                  fontFamily: T.mono,
                  lineHeight: 1.6,
                  flexShrink: 0,
                }}
              >
                <span style={{ color: "#705010", marginRight: 6 }}>hint</span>
                {currentBlanks.map((b, i) => (
                  <div key={i} style={{ color: "#c8a840", marginTop: 2 }}>
                    {b}: {currentSols[i]}
                  </div>
                ))}
              </div>
            )}

            {/* Editor — plain textarea with mono styling (swap for Monaco in your project) */}
            <Editor
              height="100%"
              language={lang === "python" ? "python" : "javascript"}
              value={currentCode}
              onChange={(val) => setCurrentCode(val || "")}
              beforeMount={setupOpenCalcMonaco}
              theme="open-calc-dark"
              options={{
                fontSize: 13,
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 2,
                renderLineHighlight: "line",
                padding: { top: 12, bottom: 12 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                fontLigatures: true,
                fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
              }}
            />
          </div>

          {/* ── RIGHT: Results + Trace ── */}
          <div
            style={{
              width: 360,
              background: T.panel,
              borderLeft: `1px solid ${T.border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {/* Test results */}
            <div
              style={{
                padding: "12px 14px",
                borderBottom: `1px solid ${T.border}`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: T.muted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  fontFamily: T.mono,
                }}
              >
                Test Results
              </div>

              {!runResult && !running && (
                <div
                  style={{
                    fontSize: 11,
                    color: T.muted,
                    lineHeight: 1.7,
                    fontFamily: T.mono,
                  }}
                >
                  Fill <span style={{ color: lc }}>___</span> blanks → Run
                </div>
              )}

              {running && (
                <div
                  style={{ fontSize: 11, color: T.textDim, fontFamily: T.mono }}
                >
                  Running…
                </div>
              )}

              {runResult?.error && (
                <div
                  style={{
                    background: "#200808",
                    border: `1px solid ${T.red}44`,
                    borderRadius: 5,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      color: T.red,
                      fontSize: 10,
                      fontWeight: 700,
                      marginBottom: 4,
                      fontFamily: T.mono,
                    }}
                  >
                    error
                  </div>
                  <div
                    style={{
                      color: "#c06060",
                      fontSize: 10,
                      fontFamily: T.mono,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {runResult.error}
                  </div>
                </div>
              )}

              {runResult?.testResult && (
                <div>
                  {runResult.testResult.checks.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 7,
                        alignItems: "flex-start",
                        marginBottom: 7,
                      }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          flexShrink: 0,
                          marginTop: 1,
                          background: c.pass ? `${T.green}20` : "#300",
                          border: `1px solid ${c.pass ? T.green2 : T.red}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 8,
                          color: c.pass ? T.green : T.red,
                          fontFamily: T.mono,
                        }}
                      >
                        {c.pass ? "✓" : "✗"}
                      </div>
                      <span
                        style={{
                          fontSize: 10.5,
                          color: c.pass ? T.textDim : T.muted,
                          lineHeight: 1.5,
                          fontFamily: T.mono,
                        }}
                      >
                        {c.label}
                      </span>
                    </div>
                  ))}

                  <div
                    style={{
                      marginTop: 8,
                      padding: "8px 10px",
                      borderRadius: 5,
                      background: runResult.testResult.ok
                        ? `${T.green}0d`
                        : "#200808",
                      border: `1px solid ${runResult.testResult.ok ? T.green2 + "44" : T.red + "33"}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: runResult.testResult.ok ? T.green : T.red,
                        fontFamily: T.mono,
                        marginBottom:
                          runResult.testResult.result != null ? 6 : 0,
                      }}
                    >
                      {runResult.testResult.ok
                        ? "✓ all tests pass"
                        : "✗ tests failing"}
                    </div>
                    {runResult.testResult.result != null && (
                      <div
                        style={{ fontSize: 12, color: lc, fontFamily: T.mono }}
                      >
                        → {JSON.stringify(runResult.testResult.result)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Execution trace */}
            {traceSteps.length > 0 ? (
              <div
                style={{
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "8px 14px",
                    borderBottom: `1px solid ${T.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.muted,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontFamily: T.mono,
                    }}
                  >
                    Execution Trace
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: T.textDim,
                      fontFamily: T.mono,
                    }}
                  >
                    {traceIdx + 1}/{traceSteps.length}
                  </span>
                </div>

                <div
                  style={{
                    padding: "8px 14px",
                    borderBottom: `1px solid ${T.border}`,
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {[
                    ["«", () => setTraceIdx(0)],
                    ["‹", () => setTraceIdx((i) => Math.max(0, i - 1))],
                    [
                      "›",
                      () =>
                        setTraceIdx((i) =>
                          Math.min(traceSteps.length - 1, i + 1),
                        ),
                    ],
                    ["»", () => setTraceIdx(traceSteps.length - 1)],
                  ].map(([label, action], i) => (
                    <button
                      key={i}
                      onClick={action}
                      style={{
                        width: 26,
                        height: 24,
                        borderRadius: 3,
                        background: T.dim,
                        border: `1px solid ${T.border2}`,
                        color: T.textDim,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: T.mono,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  <input
                    type="range"
                    min={0}
                    max={traceSteps.length - 1}
                    value={traceIdx}
                    onChange={(e) => setTraceIdx(+e.target.value)}
                    style={{ flex: 1, accentColor: lc }}
                  />
                </div>

                {cur && (
                  <div
                    style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}
                  >
                    <MemoryViz
                      arr={cur.state}
                      highlight={cur.highlight}
                      lo={cur.lo}
                      hi={cur.hi}
                      mid={cur.mid}
                      found={cur.found}
                      phase={cur.phase}
                      label={cur.note}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* OS Connection callout */}
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: `1px solid ${T.border}`,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.muted,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                      fontFamily: T.mono,
                    }}
                  >
                    OS Connection
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: T.textDim,
                      lineHeight: 1.7,
                      fontFamily: T.mono,
                    }}
                  >
                    {lessonIdx === 0 &&
                      "RAM is a giant array.\nYour CPU accesses any byte in ~70ns regardless\nof address — the DRAM controller computes\nrow/column from the address directly.\nSame O(1) logic as array indexing."}
                    {lessonIdx === 1 &&
                      "Keyboard driver → ring buffer insert.\nNetwork packet → sk_buff queue insert.\nProcess creation → task list insert.\nAll in the Linux kernel. All O(n) worst case\nunless using clever ring buffer tricks."}
                    {lessonIdx === 2 &&
                      "When a process exits, the kernel removes\nits task_struct from the process list.\nWith a doubly-linked list (not array), this\nis O(1) — no shifting needed.\nThat's why Linux uses a linked list here,\nnot an array. Right tool for the job."}
                    {lessonIdx === 3 &&
                      "The /etc/passwd file is a linear list.\nLooking up a user by name: O(n) scan.\nThe kernel caches it in memory, but the\nalgorithm is still linear search.\nOn a system with 10,000 users this matters."}
                    {lessonIdx === 4 &&
                      "The kernel's System.map file is sorted\nby address. Symbol resolution during panic:\nbinary search. ~100k symbols, 17 steps max.\nWithout sorting + binary search: 100k steps."}
                  </div>
                </div>

                {/* Memory layout diagram */}
                <div style={{ padding: "12px 14px", flex: 1 }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.muted,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                      fontFamily: T.mono,
                    }}
                  >
                    Memory Layout
                  </div>
                  <MemoryViz
                    arr={[12, 34, 56, 78, 90]}
                    highlight={null}
                    label="Contiguous block — each cell is 4 bytes (int32). Address = base + i×4"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
