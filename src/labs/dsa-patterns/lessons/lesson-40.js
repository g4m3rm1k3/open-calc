// DSA + Design Patterns — Lesson 40
// Randomized Algorithms + Strategy

export const lesson = {
  id: 'dsa-patterns-40',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '40. Randomized Algorithms + Strategy',
  checkpoints: [
    { id: 'cp-random',    label: 'Randomization' },
    { id: 'cp-quicksort', label: 'Randomized QuickSort' },
    { id: 'cp-strategy',  label: 'Strategy Pattern' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You deploy a sorting service and a competitor discovers that your deterministic QuickSort always picks the first element as the pivot. They craft a request containing a reverse-sorted array — your pivot is always the worst possible choice, and O(n²) performance degrades your service. The same attack works against some hash tables and binary search trees: an adversary who knows your algorithm can construct inputs that trigger worst-case behaviour every time. The fix is not a better deterministic algorithm — it is randomisation. If the algorithm\'s choices depend on random numbers the adversary cannot predict, worst-case inputs become astronomically unlikely regardless of the input.',
      code: null,
    },

    // ── Step 1: Deterministic QuickSort worst case ────────────────────────────

    {
      type: 'narration',
      id: 'step1-deterministic-qs',
      text: 'QuickSort partitions an array around a pivot: elements less than the pivot go left, elements greater go right, then each half is sorted recursively. When the pivot is always the minimum or maximum element, one partition is empty and the other has n-1 elements. The recurrence becomes T(n) = T(n-1) + O(n), which solves to O(n²). This happens with the first-element pivot strategy on already-sorted input — which is common in practice because pre-sorted data appears frequently. The average case with a random-looking input is O(n log n), but the adversarial worst case is O(n²).',
      code: `// Deterministic QuickSort — first element as pivot
// Worst case: sorted or reverse-sorted input

function partition(arr, lo, hi, pivotIndex) {
  const pivot = arr[pivotIndex]
  // Move pivot to end temporarily
  ;[arr[pivotIndex], arr[hi]] = [arr[hi], arr[pivotIndex]]
  let store = lo
  for (let i = lo; i < hi; i++) {
    if (arr[i] <= pivot) {
      ;[arr[i], arr[store]] = [arr[store], arr[i]]
      store++
    }
  }
  ;[arr[store], arr[hi]] = [arr[hi], arr[store]]  // move pivot to final position
  return store
}

function quickSortDet(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return
  const pivotIdx = lo   // always pick first element — deterministic, adversarial
  const p = partition(arr, lo, hi, pivotIdx)
  quickSortDet(arr, lo, p - 1)
  quickSortDet(arr, p + 1, hi)
}

// Best case: random input
const random = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
quickSortDet(random)
console.log('sorted:', random)

// Worst case: already sorted — O(n^2) call depth
// On n=10000, this hits maximum recursion depth
const sorted = Array.from({length: 100}, (_, i) => i)   // [0..99]
quickSortDet(sorted)
console.log('sorted input last 5:', sorted.slice(95))    // [95,96,97,98,99]
// But for n=100000, deterministic QuickSort on sorted input would stack overflow`,
    },

    // ── Step 2: Randomized pivot ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-random-pivot',
      text: 'Randomized QuickSort picks the pivot uniformly at random from the current subarray. The expected number of comparisons across the entire sort is O(n log n) regardless of the input. Why? For any fixed input, the probability that a bad split (pivot in the worst 50% of positions) happens at every level is (1/2)^(log n) — negligibly small. The expected depth of recursion is O(log n). The algorithm is Las Vegas: it always produces the correct sorted output; only the running time is random. The worst case is still O(n²), but the probability of a worst-case input causing O(n²) behaviour on a specific run is 1/n! — less than one in a trillion for n = 20.',
      code: `function partition(arr, lo, hi, pivotIndex) {
  const pivot = arr[pivotIndex]
  ;[arr[pivotIndex], arr[hi]] = [arr[hi], arr[pivotIndex]]
  let store = lo
  for (let i = lo; i < hi; i++) {
    if (arr[i] <= pivot) { ;[arr[i], arr[store]] = [arr[store], arr[i]]; store++ }
  }
  ;[arr[store], arr[hi]] = [arr[hi], arr[store]]
  return store
}

function quickSortRandom(arr, lo = 0, hi = arr.length - 1) {   // ← NEW
  if (lo >= hi) return                                          // ← NEW
  // Random pivot: uniform random index in [lo, hi]
  const pivotIdx = lo + Math.floor(Math.random() * (hi - lo + 1))  // ← NEW
  const p = partition(arr, lo, hi, pivotIdx)                   // ← NEW
  quickSortRandom(arr, lo, p - 1)                              // ← NEW
  quickSortRandom(arr, p + 1, hi)                              // ← NEW
}

// Adversarial input: sorted array — kills deterministic QuickSort
const sorted = Array.from({length: 1000}, (_, i) => i)
quickSortRandom(sorted)
console.log('sorted correctly:', sorted[0] === 0 && sorted[999] === 999)   // true

// Reverse sorted — also adversarial for deterministic
const rev = Array.from({length: 1000}, (_, i) => 999 - i)
quickSortRandom(rev)
console.log('rev sorted correctly:', rev[0] === 0 && rev[999] === 999)   // true`,
    },

    // ── Step 3: Reservoir sampling ────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-reservoir',
      text: 'Reservoir sampling (Vitter\'s algorithm R, 1985) selects k uniformly random items from a stream of unknown length using only O(k) memory. Step 1: fill the reservoir with the first k items. Step 2: for each subsequent item at position i (1-indexed, starting at k+1), generate a random integer j in [1, i]. If j ≤ k, replace reservoir[j-1] with the current item. The invariant: after processing i items, each of the first i items has equal probability k/i of being in the reservoir. The proof is by induction: when item i arrives, it enters with probability k/i; each existing reservoir item survives with probability 1 - (k/i) * (1/k) = (i-1)/i; multiplying the survival probabilities gives k/i for each item. This is a Monte Carlo algorithm — the output is random but correct on average.',
      code: `// Reservoir sampling: k uniform samples from a stream in O(k) space
// Stream: an array simulating a potentially infinite stream

function reservoirSample(stream, k) {           // ← NEW
  const reservoir = stream.slice(0, k)          // ← NEW  fill first k items
  for (let i = k; i < stream.length; i++) {    // ← NEW  process remaining items
    // Pick random index j in [0, i] inclusive
    const j = Math.floor(Math.random() * (i + 1))  // ← NEW
    if (j < k) {                               // ← NEW  j is within reservoir
      reservoir[j] = stream[i]                 // ← NEW  replace with current item
    }
    // If j >= k: current item is not selected — it falls off the stream
  }
  return reservoir                             // ← NEW
}

// Verify uniformity: sample 1 item from [0..9] many times — should be ~10% each
const counts = new Array(10).fill(0)
for (let trial = 0; trial < 10000; trial++) {
  const sample = reservoirSample([0,1,2,3,4,5,6,7,8,9], 1)
  counts[sample[0]]++
}
console.log('expected ~1000 each:')
counts.forEach((c, i) => console.log(i + ':', c))

// Sample 3 from 10 items — verify we get 3 distinct items
const s3 = reservoirSample([0,1,2,3,4,5,6,7,8,9], 3)
console.log('sample of 3:', s3.sort((a,b)=>a-b))`,
    },

    // ── Challenge 1: reservoir sampling ──────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-reservoir',
      text: 'Implement reservoirSample(stream, k) that selects k uniformly random items from stream using only O(k) space. Test with stream = [10,20,30,40,50,60,70,80,90,100] and k = 3. Log the sample (it should have exactly 3 items, all from the stream). Also verify that reservoirSample(stream, 5).length === 5. Log both results.',
      expectedOutput: null,
      startCode: `function reservoirSample(stream, k) {
  const reservoir = stream.slice(0, k)   // fill first k items

  for (let i = k; i < stream.length; i++) {
    // YOUR CODE HERE:
    // Pick j = random integer in [0, i] inclusive
    // If j < k, replace reservoir[j] with stream[i]
  }

  return reservoir
}

const stream = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

const s3 = reservoirSample(stream, 3)
console.log('sample of 3:', s3)
console.log('length is 3:', s3.length === 3)

const s5 = reservoirSample(stream, 5)
console.log('length is 5:', s5.length === 5)
`,
      hint: 'const j=Math.floor(Math.random()*(i+1)); if(j<k) reservoir[j]=stream[i];',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        const trueCount = (flat.match(/true/g) || []).length
        return trueCount >= 2
      },
    },

    { type: 'checkpoint', id: 'cp-random' },
    { type: 'checkpoint', id: 'cp-quicksort' },

    // ── Step 4: Strategy pattern — introduction ───────────────────────────────

    {
      type: 'narration',
      id: 'step4-strategy-intro',
      text: 'The Strategy design pattern (Gang of Four behavioural pattern) defines a family of algorithms, encapsulates each one, and makes them interchangeable. The context object uses a strategy through a common interface, not by knowing which concrete algorithm is in use. Replacing the strategy changes the algorithm without changing the context. This is different from a simple function parameter: Strategy is about a family of related algorithms that share a meaningful interface and may each have their own state. Classic examples: sorting strategies (sort by name, by date, by size), route-finding strategies (fastest, shortest, fewest transfers), payment processing strategies (credit card, PayPal, crypto).',
      code: `// Classic Strategy: sort with pluggable comparators
// The "strategy" is the comparator function

class Sorter {
  constructor(strategy) { this.strategy = strategy }  // inject strategy
  sort(arr) { return [...arr].sort(this.strategy) }    // context uses strategy interface
}

// Concrete strategies
const byValueAsc  = (a, b) => a - b
const byValueDesc = (a, b) => b - a
const byAbsValue  = (a, b) => Math.abs(a) - Math.abs(b)

const sorter = new Sorter(byValueAsc)
console.log(sorter.sort([3,-1,4,-1,5,-9,2,-6]))     // [-9,-6,-1,-1,2,3,4,5]

sorter.strategy = byAbsValue   // swap strategy at runtime
console.log(sorter.sort([3,-1,4,-1,5,-9,2,-6]))     // [-1,-1,2,3,4,5,-6,-9]

// Strategy as a first-class function — equivalent to the Strategy pattern in JS
function sortWith(arr, strategy) {
  return [...arr].sort(strategy)
}
console.log(sortWith([3,-1,4,-1,5,-9,2,-6], byValueDesc))  // [5,4,3,2,-1,-1,-6,-9]`,
    },

    // ── Step 5: Pivot strategy ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-pivot-strategy',
      text: 'The pivot selection algorithm is a natural Strategy: the QuickSort skeleton is identical regardless of how the pivot is chosen. Concrete strategies: (1) FirstPivot — always pick arr[lo]; deterministic; adversarial on sorted input. (2) RandomPivot — pick a uniform random index in [lo, hi]; Las Vegas; expected O(n log n) on any input. (3) MedianOfThree — pick the median of arr[lo], arr[mid], arr[hi]; deterministic; resilient to sorted and reverse-sorted inputs but can still be exploited by an adversary who knows the algorithm. The QuickSort context calls strategy.choosePivot(arr, lo, hi) and receives an index — it does not know or care which concrete strategy is in use.',
      code: `// Strategy interface: choosePivot(arr, lo, hi) → pivot index

class FirstPivotStrategy {
  choosePivot(arr, lo, hi) { return lo }   // always first — deterministic
}

class RandomPivotStrategy {
  choosePivot(arr, lo, hi) {               // ← NEW
    return lo + Math.floor(Math.random() * (hi - lo + 1))  // ← NEW  uniform random
  }
}

class MedianOfThreePivotStrategy {
  choosePivot(arr, lo, hi) {                      // ← NEW
    const mid = (lo + hi) >> 1                    // ← NEW  middle index
    // Sort lo, mid, hi by value — pick the median
    if (arr[lo] > arr[mid]) { ;[arr[lo], arr[mid]] = [arr[mid], arr[lo]] }  // ← NEW
    if (arr[lo] > arr[hi])  { ;[arr[lo], arr[hi]]  = [arr[hi], arr[lo]]  }  // ← NEW
    if (arr[mid] > arr[hi]) { ;[arr[mid], arr[hi]] = [arr[hi], arr[mid]] }  // ← NEW
    return mid   // ← NEW  arr[mid] is now the median of the three
  }
}

// QuickSort context — uses strategy, knows nothing about pivot selection
function partition(arr, lo, hi, pivotIndex) {
  const pivot = arr[pivotIndex]
  ;[arr[pivotIndex], arr[hi]] = [arr[hi], arr[pivotIndex]]
  let store = lo
  for (let i = lo; i < hi; i++) if (arr[i] <= pivot) { ;[arr[i], arr[store]] = [arr[store], arr[i]]; store++ }
  ;[arr[store], arr[hi]] = [arr[hi], arr[store]]
  return store
}

class QuickSort {                                       // ← NEW
  constructor(strategy) { this.strategy = strategy }  // ← NEW  inject pivot strategy

  sort(arr, lo = 0, hi = arr.length - 1) {            // ← NEW
    if (lo >= hi) return                               // ← NEW
    const pivotIdx = this.strategy.choosePivot(arr, lo, hi)  // ← NEW  delegate to strategy
    const p = partition(arr, lo, hi, pivotIdx)        // ← NEW
    this.sort(arr, lo, p - 1)                         // ← NEW
    this.sort(arr, p + 1, hi)                         // ← NEW
  }
}

const arr1 = [3,1,4,1,5,9,2,6]
new QuickSort(new RandomPivotStrategy()).sort(arr1)
console.log('random pivot sort:', arr1)

const arr2 = Array.from({length: 10}, (_, i) => 9 - i)  // reverse sorted
new QuickSort(new MedianOfThreePivotStrategy()).sort(arr2)
console.log('median-of-3 sort:', arr2)`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-meeting-point',
      text: 'The meeting point of randomised algorithms and the Strategy pattern: QuickSort has a fixed, correct structure — partition, recurse left, recurse right. The only variable is how to choose the pivot. Strategy encapsulates that variation. This is the pattern at its most natural: the context (QuickSort) is unaffected by which strategy is active; the strategies (First, Random, MedianOfThree) are interchangeable and independently testable. The randomised strategy is where the algorithmic insight lives — it converts an adversarial worst case from O(n²) to O(n log n) expected by breaking the adversary\'s ability to predict the pivot. Neither the QuickSort structure nor the Strategy interface knows anything about probability theory; the probabilistic guarantee emerges purely from RandomPivotStrategy.choosePivot.',
      code: `// The full picture: QuickSort + Strategy + Reservoir Sampling in one example

function partition(arr, lo, hi, pivotIndex) {
  const pivot = arr[pivotIndex]
  ;[arr[pivotIndex], arr[hi]] = [arr[hi], arr[pivotIndex]]
  let store = lo
  for (let i = lo; i < hi; i++) if (arr[i] <= pivot) { ;[arr[i], arr[store]] = [arr[store], arr[i]]; store++ }
  ;[arr[store], arr[hi]] = [arr[hi], arr[store]]
  return store
}

class QuickSort {
  constructor(strategy) { this.strategy = strategy }
  sort(arr, lo = 0, hi = arr.length - 1) {
    if (lo >= hi) return
    const p = partition(arr, lo, hi, this.strategy.choosePivot(arr, lo, hi))
    this.sort(arr, lo, p - 1); this.sort(arr, p + 1, hi)
  }
}

class RandomPivotStrategy {
  choosePivot(arr, lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)) }
}

// Sample k items from a large unsorted dataset, then sort the sample
function sortedSample(data, k) {
  // Step 1: reservoir sample — O(n) time, O(k) space
  const res = data.slice(0, k)
  for (let i = k; i < data.length; i++) {
    const j = Math.floor(Math.random() * (i + 1))
    if (j < k) res[j] = data[i]
  }
  // Step 2: sort the small sample with randomised QuickSort
  new QuickSort(new RandomPivotStrategy()).sort(res)
  return res
}

const data = Array.from({length: 1000}, () => Math.floor(Math.random() * 10000))
const sample = sortedSample(data, 5)
console.log('sorted sample of 5:', sample)
console.log('is sorted:', sample.every((v,i,a) => i===0 || a[i-1] <= v))   // true`,
    },

    // ── Challenge 2: randomized QuickSort ────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-quicksort',
      text: 'Implement the QuickSort class with a RandomPivotStrategy. Sort [5,3,8,1,9,2,7,4,6]. Verify: (1) the result is sorted (log true/false), (2) the sorted array contains 9 (the maximum). Also sort a reverse-sorted array [10,9,8,7,6,5,4,3,2,1] and verify it is sorted correctly. Log all verification results.',
      expectedOutput: null,
      startCode: `function partition(arr, lo, hi, pivotIndex) {
  const pivot = arr[pivotIndex]
  ;[arr[pivotIndex], arr[hi]] = [arr[hi], arr[pivotIndex]]
  let store = lo
  for (let i = lo; i < hi; i++) {
    if (arr[i] <= pivot) { ;[arr[i], arr[store]] = [arr[store], arr[i]]; store++ }
  }
  ;[arr[store], arr[hi]] = [arr[hi], arr[store]]
  return store
}

class RandomPivotStrategy {
  choosePivot(arr, lo, hi) {
    // YOUR CODE HERE: return a random index between lo and hi inclusive
  }
}

class QuickSort {
  constructor(strategy) { this.strategy = strategy }
  sort(arr, lo = 0, hi = arr.length - 1) {
    if (lo >= hi) return
    // YOUR CODE HERE: get pivot from strategy, partition, recurse
  }
}

const arr1 = [5, 3, 8, 1, 9, 2, 7, 4, 6]
new QuickSort(new RandomPivotStrategy()).sort(arr1)
console.log('arr1 sorted:', arr1.every((v, i, a) => i === 0 || a[i-1] <= v))
console.log('max is 9:', arr1[arr1.length - 1] === 9)

const arr2 = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
new QuickSort(new RandomPivotStrategy()).sort(arr2)
console.log('arr2 sorted:', arr2.every((v, i, a) => i === 0 || a[i-1] <= v))
`,
      hint: 'choosePivot: return lo+Math.floor(Math.random()*(hi-lo+1))\nsort: const p=partition(arr,lo,hi,this.strategy.choosePivot(arr,lo,hi)); this.sort(arr,lo,p-1); this.sort(arr,p+1,hi);',
      validate: ({ logs }) => {
        const trueCount = logs.filter(l => String(l).includes('true')).length
        return trueCount >= 3
      },
    },

    { type: 'checkpoint', id: 'cp-strategy' },

    // ── Step 7: Universal hashing ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-universal-hashing',
      text: 'Universal hashing applies randomisation to hash tables. A hash function h maps keys to table slots [0, m-1]. A deterministic hash function can be attacked: an adversary who knows h can craft n keys that all hash to the same slot, turning O(1) lookups into O(n). Universal hashing selects the hash function randomly from a family of hash functions at initialisation time. The family is universal if for any two distinct keys k1, k2, the probability that h(k1) === h(k2) is at most 1/m. With a universal hash family, no adversary can guarantee collisions without knowing which function was chosen. The expected chain length is O(1 + n/m) regardless of the input.',
      code: `// Universal hash family: h_{a,b}(k) = ((a*k + b) mod p) mod m
// where p is a prime larger than the key universe, a in [1,p-1], b in [0,p-1] chosen randomly

class UniversalHashTable {
  constructor(m = 16) {
    this.m    = m
    this.p    = 1000003   // prime larger than key universe (keys assumed < p)
    this.a    = 1 + Math.floor(Math.random() * (this.p - 1))   // random a in [1, p-1]
    this.b    = Math.floor(Math.random() * this.p)              // random b in [0, p-1]
    this.buckets = Array.from({length: m}, () => [])           // chaining
  }

  _hash(k) {
    return ((this.a * k + this.b) % this.p) % this.m   // universal hash function
  }

  set(k, v) {
    const h = this._hash(k)
    const bucket = this.buckets[h]
    const existing = bucket.find(pair => pair[0] === k)
    if (existing) existing[1] = v   // update
    else bucket.push([k, v])         // insert
  }

  get(k) {
    const h = this._hash(k)
    const pair = this.buckets[h].find(p => p[0] === k)
    return pair ? pair[1] : undefined
  }
}

const ht = new UniversalHashTable(8)
for (let i = 0; i < 20; i++) ht.set(i * 100, 'value' + i)  // spread keys across table

console.log(ht.get(0))      // 'value0'
console.log(ht.get(700))    // 'value7'
console.log(ht.get(1900))   // 'value19'
console.log(ht.get(9999))   // undefined — not in table`,
    },

    // ── Challenge 3: combined ─────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-combined',
      text: 'Using QuickSort with RandomPivotStrategy: sort 1000 random integers (use Array.from({length:1000}, ()=>Math.floor(Math.random()*10000))), then use reservoirSample to pick 5 items from the sorted array. Log: (1) sorted array is correctly sorted (true/false), (2) the sample has exactly 5 items (true/false), (3) all sample items are present in the sorted array (true/false).',
      expectedOutput: null,
      startCode: `function partition(arr, lo, hi, pivotIndex) {
  const pivot = arr[pivotIndex]
  ;[arr[pivotIndex], arr[hi]] = [arr[hi], arr[pivotIndex]]
  let store = lo
  for (let i = lo; i < hi; i++) if (arr[i] <= pivot) { ;[arr[i], arr[store]] = [arr[store], arr[i]]; store++ }
  ;[arr[store], arr[hi]] = [arr[hi], arr[store]]
  return store
}
class RandomPivotStrategy {
  choosePivot(arr, lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)) }
}
class QuickSort {
  constructor(strategy) { this.strategy = strategy }
  sort(arr, lo = 0, hi = arr.length - 1) {
    if (lo >= hi) return
    const p = partition(arr, lo, hi, this.strategy.choosePivot(arr, lo, hi))
    this.sort(arr, lo, p - 1); this.sort(arr, p + 1, hi)
  }
}
function reservoirSample(stream, k) {
  const res = stream.slice(0, k)
  for (let i = k; i < stream.length; i++) {
    const j = Math.floor(Math.random() * (i + 1))
    if (j < k) res[j] = stream[i]
  }
  return res
}

// YOUR CODE HERE:
// 1. Generate 1000 random integers, sort with randomized QuickSort
// 2. Reservoir sample 5 items from sorted array
// 3. Log: isSorted, length===5, all items in sorted array
`,
      hint: 'const data=Array.from({length:1000},()=>Math.floor(Math.random()*10000)); new QuickSort(new RandomPivotStrategy()).sort(data); const s=reservoirSample(data,5); console.log(data.every((v,i,a)=>i===0||a[i-1]<=v)); console.log(s.length===5); console.log(s.every(v=>data.includes(v)));',
      validate: ({ logs }) => {
        const trueCount = logs.filter(l => String(l).trim() === 'true').length
        return trueCount >= 3
      },
    },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through the QuickSort with RandomPivotStrategy. Watch choosePivot return a random index on each call. See how the same partition function is used regardless of strategy — the context is unchanged. Then step through reservoir sampling: watch the reservoir fill with the first k items, then watch each subsequent item either replace a random reservoir slot or be discarded.',
      code: null,
    },

    {
      type: 'codelens',
      id: 'cl-random',
      text: 'Step through the randomised QuickSort. Observe choosePivot produce a different index each time the same subarray is sorted (run it twice — the pivot changes). Watch partition move elements around the pivot. Then trace reservoir sampling: each item at position i enters the reservoir with probability k/i — watch the replacement decision at each step.',
      code: `function partition(arr,lo,hi,pi){const p=arr[pi];[arr[pi],arr[hi]]=[arr[hi],arr[pi]];let s=lo;for(let i=lo;i<hi;i++)if(arr[i]<=p){[arr[i],arr[s]]=[arr[s],arr[i]];s++}[arr[s],arr[hi]]=[arr[hi],arr[s]];return s}
class RandomPivotStrategy{choosePivot(arr,lo,hi){return lo+Math.floor(Math.random()*(hi-lo+1))}}
class QuickSort{constructor(s){this.strategy=s}sort(arr,lo=0,hi=arr.length-1){if(lo>=hi)return;const p=partition(arr,lo,hi,this.strategy.choosePivot(arr,lo,hi));this.sort(arr,lo,p-1);this.sort(arr,p+1,hi)}}
function reservoirSample(stream,k){const r=stream.slice(0,k);for(let i=k;i<stream.length;i++){const j=Math.floor(Math.random()*(i+1));if(j<k)r[j]=stream[i]}return r}
const arr=[5,3,8,1,9,2,7,4,6]
new QuickSort(new RandomPivotStrategy()).sort(arr)
console.log(arr)
console.log(reservoirSample([10,20,30,40,50,60,70,80,90,100],3))`,
      lang: 'js',
    },

  ],
}
