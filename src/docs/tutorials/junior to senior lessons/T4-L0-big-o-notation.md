# Junior to Senior — T4·L0 — Big O Notation and Complexity

**Prerequisites:** T3·L8 (Testing with Fakes). You have a solid testing foundation.
This lesson starts Topic 4 — Domain Modeling — with the algorithm analysis tool
you need before writing any search, sort, or lookup code.

**What this lab adds:**
- What Big O notation actually measures — and what it does not
- O(1), O(log n), O(n), O(n log n), O(n²) — with code you can run and time
- The practical thresholds where each complexity class becomes painful
- Why this matters for CAD/CAM: geometry picking and toolpath processing

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A function doubles its runtime every time the input doubles. What is its
>    Big O complexity?
> 2. A hash map lookup always takes the same time regardless of how many items
>    are in the map. What is its Big O?
> 3. You have 10,000 geometry items and a function that checks every pair.
>    Roughly how many comparisons is that?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A TypeScript file that measures real execution times, demonstrating the difference
between complexity classes:

```
n=1,000
  O(1)  map.get (×1000):  0.05ms
  O(n)  linear scan:      0.02ms
  O(n²) all pairs:        0.50ms

n=10,000
  O(1)  map.get (×1000):  0.05ms   ← same as n=1,000 (constant)
  O(n)  linear scan:      0.18ms   ← 10× slower (linear)
  O(n²) all pairs:        45ms     ← 100× slower (quadratic)
```

---

### Concept: What Big O Describes

**What it is:** Big O notation describes how the runtime (or memory usage) of an
algorithm GROWS as the input size grows. It is not about the exact number of operations —
it is about the shape of the growth curve.

**The problem before (guessing performance):**

```ts
function findDuplicate(contacts: Contact[]): Contact | undefined {
  for (let i = 0; i < contacts.length; i++) {
    for (let j = i + 1; j < contacts.length; j++) {
      if (contacts[i].email === contacts[j].email) return contacts[i];
    }
  }
  return undefined;
}

// "It seems fast enough on my 10 test cases."
// → crashes in production with 100,000 contacts
```

Without Big O analysis, you have no way to predict whether an algorithm will scale.

**The solution:**

Big O analysis tells you: this is O(n²) — for 100,000 contacts, it will perform
10,000,000,000 comparisons. That will take minutes, not milliseconds.

**What it hides:** Hardware-specific details. Big O describes growth rate independent
of your CPU speed, cache size, or language. An O(n) algorithm on a slow machine
will outperform an O(n²) algorithm on a fast machine for large enough input.

**The rule:** Big O describes the WORST CASE unless specified otherwise.

**Canonical example:** Searching for a name in a phone book:
- O(n): start at A, read every name until found
- O(log n): open to the middle, go left or right (binary search)
- O(1): if you had a pre-built index {name → page number}

The log n approach halves the problem each step. Even with 10 million names, you find
anyone in ~23 steps.

**Project Application:** In the CAD/CAM viewport, geometry picking must check which item
the user clicked. With 10,000 geometry items:
- O(n) picking: 10,000 checks per click — fast enough (~1ms)
- O(n²) overlap checking: 50,000,000 pair checks — too slow (~500ms)

**You will see this again in:**
- Every algorithm course and technical interview
- Database query planning: SQL `EXPLAIN` shows the complexity of query plans
- Career signal: Big O is asked in almost every software engineering interview at larger companies

**Watch for:** Big O ignores constants. `O(2n)` is written as `O(n)`. This matters
in practice — two O(n) algorithms can have very different real-world performance —
but the notation only captures the growth rate.

---

### Concept: O(1) — Constant Time

**What it is:** The runtime does not change regardless of input size.

**The problem it solves:**

```ts
// O(n) — scanning every item to find one:
function findByEmail(contacts: Contact[], target: string) {
  for (const contact of contacts) {     // n iterations
    if (contact.email === target) return contact;
  }
  return undefined;
}
// 1,000 contacts → up to 1,000 comparisons
// 1,000,000 contacts → up to 1,000,000 comparisons
```

**The O(1) version:**

```ts
// O(1) — hash map lookup:
const emailIndex = new Map(contacts.map(c => [c.email, c]));

function findByEmailFast(email: string) {
  return emailIndex.get(email);  // same speed for 10 or 10,000,000 contacts
}
```

**Canonical example:** Looking up a word in an index vs reading the whole book.
The index jumps you directly to the page. The total book size doesn't matter.

**Project Application:** The CAD/CAM geometry registry: `Map<string, GeometryItem>`
where the key is the item's ID. Every pick operation is an O(1) ID lookup.

**Smallest possible example:**

```ts
const map = new Map([['alice', { age: 30 }], ['bob', { age: 25 }]]);
map.get('alice');   // always O(1) — hash computation + one bucket check
```

**You will see this again in:**
- Any lookup by primary key, UUID, or hash
- Database primary key lookups use B-tree indexes — effectively O(log n) ≈ O(1) for small depth

**Watch for:** Hash maps have O(1) AVERAGE case. Worst case (all keys in same bucket)
is O(n) — but this is rare with good hash functions and is an academic concern in practice.

---

### Concept: O(log n) — Logarithmic

**What it is:** Each step halves the remaining problem. Doubling the input adds only
one extra step. 1,000 items → 10 steps. 1,000,000 items → 20 steps.

**When it appears:** Binary search, balanced tree operations, divide-and-conquer.

```ts
// O(log n) — binary search (input must be sorted):
function binarySearch(sorted: number[], target: number): number {
  let low = 0, high = sorted.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (sorted[mid] === target)  return mid;
    if (sorted[mid] < target)    low  = mid + 1;
    else                         high = mid - 1;
  }
  return -1;
}
// 1,024 items → 10 steps max.  1,048,576 items → 20 steps max.
```

**Canonical example:** Searching a dictionary. Flip to the middle. "G" is before "M" →
look in the first half. Flip to the quarter mark. Keep halving. You find any word in
~20 flips, regardless of dictionary size.

**Project Application:** Finding the closest Z-layer from a sorted list of machining
depths. Binary search finds it in ~log₂(n) steps regardless of how many layers there are.

**Smallest possible example:**

```ts
const sorted = [1, 3, 5, 7, 9, 11, 13, 15];
binarySearch(sorted, 9);   // finds index 4 in 3 steps (not 5 with linear scan)
```

**You will see this again in:**
- Database B-tree indexes: lookups are O(log n)
- `Array.prototype.sort` compares: sorting is O(n log n) because it does n items × log n comparisons

**Watch for:** Binary search requires a SORTED array. Unsorted input → wrong results.
Always sort first, then binary search — total cost is O(n log n) for the sort.

---

### Concept: O(n) — Linear

**What it is:** Work grows proportionally with input. Twice the input = twice the work.

```ts
// O(n) — scanning every item:
function countDoneContacts(contacts: Contact[]): number {
  let count = 0;
  for (const c of contacts) {   // n iterations
    if (c.done) count++;
  }
  return count;
}
```

**Canonical example:** Reading every page of a book to count the word "the." Pages
double → reading time doubles.

**Project Application:** Computing the bounding box of all geometry — must visit
every item. This is O(n) and acceptable for n up to millions.

**Smallest possible example:**

```ts
const total = contacts.reduce((sum, c) => sum + (c.done ? 1 : 0), 0);
// Also O(n) — one pass through the array
```

**Watch for:** Multiple sequential O(n) loops are STILL O(n). Three loops over n
items = O(3n) = O(n). Only NESTED loops multiply complexity.

---

### Concept: O(n²) — Quadratic

**What it is:** Work grows with the square of input. Double the input → four times
the work. This becomes catastrophic fast.

```ts
// O(n²) — checking every pair:
function findAllDuplicateEmails(contacts: Contact[]): string[] {
  const duplicates: string[] = [];
  for (let i = 0; i < contacts.length; i++) {
    for (let j = i + 1; j < contacts.length; j++) {   // nested loop
      if (contacts[i].email === contacts[j].email) {
        duplicates.push(contacts[i].email);
      }
    }
  }
  return duplicates;
}
```

| n | n² | At 10⁸ ops/sec |
|---|---|---|
| 100 | 10,000 | < 1ms |
| 1,000 | 1,000,000 | ~10ms |
| 10,000 | 100,000,000 | ~1 second |
| 100,000 | 10,000,000,000 | ~100 seconds |

**Canonical example:** Matching every person at a party to every other person.
100 people → 4,950 handshakes. 1,000 people → 499,500 handshakes. The party
never ends.

**Project Application:** A naive geometry overlap check — checking every pair of
geometry items. With 10,000 items, this is 50,000,000 pair checks. Completely
unusable for interactive use.

**Smallest possible example:**

```ts
// WRONG for large inputs — O(n²):
function hasDuplicate(arr: string[]): boolean {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] === arr[j]) return true;
  return false;
}

// RIGHT — O(n):
function hasDuplicateFast(arr: string[]): boolean {
  return new Set(arr).size < arr.length;
}
```

**You will see this again in:**
- Sorting algorithms: bubble sort is O(n²); mergesort/quicksort is O(n log n)
- Every "find all pairs" problem
- Database queries without indexes: sequential scan × join = O(n²)

**Watch for:** O(n²) is fine for small n (< 1,000). It becomes a problem when n grows.
Build for the expected scale, not the current test data.

---

## Step 1 — Measure Empirically

Create `src/complexity.ts`:

```ts
function measureMs(fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

// Build test data:
function buildMap(n: number): Map<number, number> {
  const m = new Map<number, number>();
  for (let i = 0; i < n; i++) m.set(i, i * 2);
  return m;
}

function linearFind(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

function countPairs(arr: number[]): number {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      count++;
    }
  }
  return count;
}

const sizes = [1_000, 10_000, 100_000];

for (const n of sizes) {
  const arr = Array.from({ length: n }, (_, i) => i);
  const map = buildMap(n);

  const mapTime    = measureMs(() => { for (let i = 0; i < 1000; i++) map.get(n - 1); });
  const linearTime = measureMs(() => linearFind(arr, n - 1));

  console.log(`n=${n.toLocaleString()}`);
  console.log(`  O(1)  map.get (×1000): ${mapTime.toFixed(2)}ms`);
  console.log(`  O(n)  linear scan:     ${linearTime.toFixed(2)}ms`);

  if (n <= 10_000) {
    const quadTime = measureMs(() => countPairs(arr));
    console.log(`  O(n²) all pairs:       ${quadTime.toFixed(2)}ms`);
  }
  console.log();
}
```

### SAVE AND TRY

```bash
npx tsx src/complexity.ts
```

**You should see** (approximate — varies by machine):
```
n=1,000
  O(1)  map.get (×1000): 0.05ms
  O(n)  linear scan:     0.02ms
  O(n²) all pairs:       0.50ms

n=10,000
  O(1)  map.get (×1000): 0.05ms   ← same (constant)
  O(n)  linear scan:     0.18ms   ← ~10× slower (linear)
  O(n²) all pairs:       45ms     ← ~90× slower (quadratic)

n=100,000
  O(1)  map.get (×1000): 0.05ms   ← still constant
  O(n)  linear scan:     1.80ms   ← ~100× vs n=1,000
```

**Change something:** Uncomment the O(n²) test for n=100,000:

```ts
if (n <= 100_000) {   // ← change from 10_000 to 100_000
```

Expected: the O(n²) test for n=100,000 takes **several seconds**. This is why O(n²)
is unacceptable for large input. Change back to `n <= 10_000`.

---

## Step 2 — Binary Search vs Linear Scan

Add to `complexity.ts`:

```ts
function binarySearch(sorted: number[], target: number): number {
  let low = 0, high = sorted.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (sorted[mid] === target)  return mid;
    if (sorted[mid] < target)    low  = mid + 1;
    else                         high = mid - 1;
  }
  return -1;
}

const large = Array.from({ length: 1_000_000 }, (_, i) => i);
const target = 999_998;

const linearTime2 = measureMs(() => {
  for (let i = 0; i < 100; i++) large.findIndex(x => x === target);
});
const binaryTime  = measureMs(() => {
  for (let i = 0; i < 100; i++) binarySearch(large, target);
});

console.log('1,000,000 items — searching for the near-last element (×100 calls):');
console.log(`  Linear scan:    ${linearTime2.toFixed(0)}ms`);
console.log(`  Binary search:  ${binaryTime.toFixed(0)}ms`);
```

### SAVE AND TRY

```bash
npx tsx src/complexity.ts
```

**Expected at the bottom:**
```
1,000,000 items — searching for the near-last element (×100 calls):
  Linear scan:    ~500ms
  Binary search:  <1ms
```

The binary search is 500–1000× faster for this case. Both find the same element —
the difference is purely algorithmic.

---

## 🎯 Challenge: Fix an O(n²) Function

**You know:** The five complexity classes. What O(n²) costs at scale.

**Task:** The following function is O(n²). Identify why, then rewrite it as O(n):

```ts
function findDuplicateEmails(contacts: { email: string }[]): string[] {
  const duplicates: string[] = [];

  for (let i = 0; i < contacts.length; i++) {
    for (let j = i + 1; j < contacts.length; j++) {
      if (contacts[i].email === contacts[j].email) {
        if (!duplicates.includes(contacts[i].email)) {
          duplicates.push(contacts[i].email);
        }
      }
    }
  }

  return duplicates;
}
```

Write 2 tests before implementing the O(n) version.

---

<details>
<summary>▶ Show Solution</summary>

**Why it is O(n²):** The nested `for` loops check every pair — O(n × (n-1) / 2).
Additionally, `duplicates.includes()` is O(n) inside the inner loop, making the
worst case O(n³).

**O(n) rewrite:**

```ts
function findDuplicateEmails(contacts: { email: string }[]): string[] {
  const seen      = new Set<string>();
  const duplicates = new Set<string>();

  for (const contact of contacts) {
    if (seen.has(contact.email)) {
      duplicates.add(contact.email);  // Set prevents adding the same email twice
    } else {
      seen.add(contact.email);
    }
  }

  return [...duplicates];
}
```

One pass through the array. `Set.has()` is O(1). `Set.add()` is O(1). Total: O(n).

**Tests:**
```ts
it('returns empty array when no emails are duplicated', () => {
  const contacts = [{ email: 'a@e.com' }, { email: 'b@e.com' }];
  expect(findDuplicateEmails(contacts)).toHaveLength(0);
});

it('returns duplicated emails', () => {
  const contacts = [
    { email: 'a@e.com' }, { email: 'b@e.com' }, { email: 'a@e.com' },
  ];
  expect(findDuplicateEmails(contacts)).toContain('a@e.com');
});
```

**Key insight:** Replace "does this value already appear?" (O(n) scan) with a `Set`
lookup (O(1)). This converts the inner loop to a constant-time operation, reducing
the overall complexity from O(n²) to O(n).

</details>

---

## Final Check

| Complexity | Doubles input → | Real-world example | Acceptable for n= |
|---|---|---|---|
| O(1) | No change | Hash map lookup | Any |
| O(log n) | +1 step | Binary search | Any |
| O(n) | 2× work | Linear scan | Millions |
| O(n log n) | ~2× work | Merge sort | Millions |
| O(n²) | 4× work | All-pairs comparison | ~1,000–10,000 |

---

## Quick Check Answers

**1. Runtime doubles every time input doubles — what complexity?**

O(n) — linear. Doubling the input doubles the work. This is the defining characteristic
of linear growth. O(n²) would quadruple when the input doubles; O(log n) would add
only one step.

**2. Hash map lookup always takes the same time — what complexity?**

O(1) — constant. A hash map computes the hash of the key and jumps directly to the
storage location. The number of items in the map does not affect the time.

**3. 10,000 geometry items, checking every pair — how many comparisons?**

`n × (n-1) / 2 = 10,000 × 9,999 / 2 ≈ 50,000,000`. Fifty million comparisons.
At 100 million comparisons per second, that is half a second per pick operation —
completely unacceptable for interactive use. The solution is a spatial data structure
(quadtree, R-tree) that reduces the candidates before comparison.
