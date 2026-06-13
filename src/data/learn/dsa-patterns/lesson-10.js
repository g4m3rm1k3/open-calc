// DSA + Design Patterns — Lesson 10
// Sliding Window + Observer

export const lesson = {
  id: 'dsa-patterns-10',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '10. Sliding Window + Observer',
  checkpoints: [
    { id: 'cp-window',   label: 'Sliding Window' },
    { id: 'cp-observer', label: 'Observer Pattern' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You have a stream of numbers — stock prices arriving every second, network packet sizes, temperature readings. You need to know the maximum value in the last 10 readings at any moment. The naive approach: every new reading triggers a scan of the last 10 values to find the maximum. O(k) per new reading where k is the window size. For a window of 10 this seems fine. But k might be 10,000, and the stream might deliver 100,000 readings per second — that is a billion operations per second for a problem that should be simple. Separately: you have a dataset. Multiple views display that data — a chart, a table, a summary widget. When the data changes, all three views need to update. Should each view constantly check for changes? Should the data tell each view it changed? How do you wire updates without coupling the data to its viewers? Both problems are about reacting efficiently to what enters and leaves a moving view — one in algorithms, one in software architecture.',
      code: null,
    },

    // ── Step 1: Fixed-size sliding window ─────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-fixed-window',
      text: 'A sliding window is a subarray of fixed or variable size that moves across a larger array, processing a range of elements at a time. For a fixed-size window of size k: instead of recomputing the window from scratch on each move, you maintain a running aggregate (sum, max, count) and update it by removing the outgoing element (the one that just left the window) and adding the incoming element (the one that just entered). One add, one remove — O(1) per move — instead of O(k). For a window of 10,000 elements, this is 10,000 times faster per step.',
      code: `// Naive: O(k) per step — recomputes the entire window sum
function slidingWindowSumNaive(arr, k) {
  const results = []
  for (let i = 0; i <= arr.length - k; i++) {
    let sum = 0
    for (let j = i; j < i + k; j++) sum += arr[j]   // O(k) inner loop
    results.push(sum)
  }
  return results
}

// Efficient: O(1) per step — maintain a running sum
function slidingWindowSum(arr, k) {
  const results = []
  let windowSum = 0

  // Build the first window
  for (let i = 0; i < k; i++) windowSum += arr[i]
  results.push(windowSum)

  // Slide: remove the outgoing element, add the incoming element
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i]       // add element entering the window
    windowSum -= arr[i - k]   // remove element leaving the window
    results.push(windowSum)
  }
  return results
}

const prices = [10, 15, 8, 12, 20, 18, 25, 14, 9, 22]
console.log(slidingWindowSumNaive(prices, 3))  // [33,35,40,50,63,57,48,45]
console.log(slidingWindowSum(prices, 3))        // same result, O(n) total instead of O(nk)`,
    },

    // ── Step 2: Sliding window maximum ────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-window-max',
      text: 'Finding the maximum in a sliding window is harder than finding the sum. When the maximum element leaves the window, you need to know the next largest — but you do not want to scan. A deque (double-ended queue — a queue where elements can be added or removed from both ends) solves this. Maintain a deque of indices into the array, always keeping them in decreasing order of their values. When a new element arrives: remove from the back of the deque any indices whose values are smaller than the new element — they can never be the maximum while the new element is in the window. Remove from the front any index that has left the window. The front of the deque always holds the index of the current maximum. O(n) total — each index is added and removed at most once.',
      code: `function slidingWindowMax(arr, k) {
  const deque   = []   // stores indices, values in decreasing order
  const results = []

  for (let i = 0; i < arr.length; i++) {
    // Remove indices that are out of the current window
    while (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift()
    }

    // Remove indices from the back whose values are smaller than arr[i]
    // They can never be maximum while arr[i] is in the window
    while (deque.length > 0 && arr[deque[deque.length - 1]] < arr[i]) {
      deque.pop()
    }

    deque.push(i)

    // The front of the deque is the index of the maximum in the current window
    if (i >= k - 1) results.push(arr[deque[0]])
  }

  return results
}

const prices = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
console.log(slidingWindowMax(prices, 3))  // [4,4,5,9,9,9,6,6]
console.log(slidingWindowMax(prices, 1))  // same as the array
console.log(slidingWindowMax(prices, 4))  // [4,5,9,9,9,9,6]`,
    },

    // ── Step 3: Variable-size window ──────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-variable-window',
      text: 'A variable-size sliding window expands and contracts based on a condition rather than moving at a fixed step. Two pointers — left and right — define the window boundaries. Right advances to expand the window when the condition is not yet satisfied. Left advances to shrink the window when the condition is violated. The window size adjusts dynamically. This technique solves "longest subarray with sum at most k", "shortest subarray with sum at least k", and "minimum window substring" in O(n) time.',
      code: `// Longest subarray with sum at most target — variable window
function longestSumAtMost(arr, target) {
  let left    = 0
  let sum     = 0
  let maxLen  = 0

  for (let right = 0; right < arr.length; right++) {
    sum += arr[right]                    // expand: add right element

    while (sum > target) {               // shrink until condition is satisfied
      sum -= arr[left]
      left++
    }

    maxLen = Math.max(maxLen, right - left + 1)  // window size: right - left + 1
  }

  return maxLen
}

console.log(longestSumAtMost([1, 2, 3, 4, 5], 9))    // 4 (subarray [1,2,3] or [2,3,4])
console.log(longestSumAtMost([4, 2, 2, 7, 8, 1, 2], 14)) // 5 ([4,2,2,4,?] — check it)
console.log(longestSumAtMost([1, 1, 1, 1], 3))         // 3`,
    },

    // ── Challenge: sliding window ─────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-window',
      text: 'Write a function called maxAverage(arr, k) that returns the maximum average of any contiguous subarray of length exactly k. Use the sliding window sum technique — do not recompute the sum from scratch for each window position. Test: maxAverage([1, 12, -5, -6, 50, 3], 4) should return 12.75 (the subarray [-5,-6,50,3] has sum 42, average 10.5; but [1,12,-5,-6] = 2.5; [12,-5,-6,50] = 51/4 = 12.75). Log the result rounded to 2 decimal places.',
      expectedOutput: null,
      startCode: `function maxAverage(arr, k) {
  // Build the first window sum
  // Slide and maintain the maximum sum
  // Return maxSum / k
}

console.log(maxAverage([1, 12, -5, -6, 50, 3], 4).toFixed(2))   // '12.75'
console.log(maxAverage([5, 5, 5, 5, 5], 3).toFixed(2))           // '5.00'
console.log(maxAverage([0, 1, 1, 3, 3], 2).toFixed(2))           // '3.00'`,
      hint: 'Start with sum of first k elements. Then slide: sum += arr[i]; sum -= arr[i-k]. Track maxSum = Math.max(maxSum, sum). Return maxSum/k.',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim())
        return strs.includes('12.75') && strs.includes('5.00') && strs.includes('3.00')
      },
    },

    { type: 'checkpoint', id: 'cp-window' },

    // ── Step 4: Observer pattern intro ────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-observer-intro',
      text: 'The Observer pattern defines a one-to-many relationship between objects: one subject (also called publisher or observable), many observers (also called subscribers or listeners). When the subject\'s state changes, it automatically notifies all registered observers. Each observer receives the new state and decides what to do with it. Observers can be added or removed at runtime. The subject does not know — and does not care — what the observers do with the notification. This is loose coupling: the subject and observer depend only on the notification interface, not on each other\'s implementation. Event emitters in Node.js, addEventListener in browsers, React\'s useState + useEffect, and Redux reducers are all implementations of the Observer pattern.',
      code: null,
    },

    // ── Step 5: Subject and Observer ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-observer-code',
      text: 'Build a subject (the observable) and attach observers that react to its state changes.',
      code: `class Subject {
  constructor() {
    this._observers = []   // list of registered observer functions
    this._state     = null
  }

  subscribe(observer) {    // ← NEW: register an observer
    this._observers.push(observer)
  }

  unsubscribe(observer) {  // ← NEW: remove an observer
    this._observers = this._observers.filter(o => o !== observer)
  }

  notify(data) {           // ← NEW: tell all observers about a change
    for (const observer of this._observers) {
      observer(data)       // call each observer with the new data
    }
  }

  setState(newState) {     // ← NEW: change state and notify
    this._state = newState
    this.notify(this._state)
  }
}

const subject = new Subject()

const logObserver   = (data) => console.log('[LOG]   state changed to:', data)
const alertObserver = (data) => { if (data > 100) console.log('[ALERT] value exceeded 100!') }

subject.subscribe(logObserver)
subject.subscribe(alertObserver)

subject.setState(50)   // logObserver fires, alertObserver fires (no alert — 50 <= 100)
subject.setState(150)  // logObserver fires, alertObserver fires alert

subject.unsubscribe(alertObserver)
subject.setState(200)  // only logObserver fires now`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-meeting',
      text: 'This is where the two ideas meet. A sliding window reacts to what enters and what leaves: when a new element enters the window on the right, the window updates its aggregate; when an old element leaves on the left, the aggregate updates again. The Observer pattern does exactly the same thing at the software architecture level: observers react to state entering (a new value arrives) and leaving (the previous state is replaced). When you build a real-time dashboard — stock prices updating, a sliding window tracking the last 10 values, charts updating automatically — the sliding window IS the state computation and the Observer IS the notification mechanism that tells the charts to redraw. The window slides; the observers react to each slide.',
      code: null,
    },

    // ── Challenge: Observer ────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-observer',
      text: 'Build a DataStore class with subscribe(fn) and setState(newState) methods. subscribe() registers an observer function. setState() stores the new state and calls all registered observers with the new state. Then create a store. Subscribe two observers: one that logs "A: <value>" and one that logs "B: <value>". Call setState(42) and setState(99). Each setState should trigger both observers. Expected output: "A: 42", "B: 42", "A: 99", "B: 99" (in that order).',
      expectedOutput: null,
      startCode: `class DataStore {
  constructor() {
    this.observers = []
    this.state     = null
  }

  subscribe(fn) {
    // register the observer
  }

  setState(newState) {
    // update state and notify all observers
  }
}

const store = new DataStore()

store.subscribe(v => console.log('A:', v))
store.subscribe(v => console.log('B:', v))

store.setState(42)
store.setState(99)`,
      hint: 'subscribe: this.observers.push(fn). setState: this.state = newState; for (const fn of this.observers) fn(this.state)',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim())
        return strs[0] === 'A: 42' && strs[1] === 'B: 42' && strs[2] === 'A: 99' && strs[3] === 'B: 99'
      },
    },

    { type: 'checkpoint', id: 'cp-observer' },

    // ── Step 7: Combined ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-combined',
      text: 'Build a real-time metric monitor: a SlidingMetric class that maintains a sliding window average and notifies observers whenever a new reading arrives. The window updates with each new value. Observers receive the current average, the current window contents, and the new value. Multiple observers can react: one logs, one raises an alert when the average exceeds a threshold, one records history.',
      code: `class SlidingMetric {
  constructor(windowSize) {
    this.windowSize = windowSize
    this.window     = []
    this.observers  = []
  }

  subscribe(fn) { this.observers.push(fn) }

  push(value) {
    this.window.push(value)
    if (this.window.length > this.windowSize) {
      this.window.shift()   // remove oldest value — window slides
    }

    const avg = this.window.reduce((s, v) => s + v, 0) / this.window.length

    // Notify all observers with current state
    for (const fn of this.observers) {
      fn({ value, avg: Math.round(avg * 100) / 100, window: [...this.window] })
    }
  }
}

const metric = new SlidingMetric(4)

metric.subscribe(({ value, avg }) => {
  console.log('new: ' + value + '  |  avg(4): ' + avg)
})

metric.subscribe(({ avg }) => {
  if (avg > 20) console.log('ALERT: avg exceeded 20 (' + avg + ')')
})

for (const v of [10, 15, 8, 30, 25, 12]) {
  metric.push(v)
}`,
    },

    // ── Challenge: combined ────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Extend the SlidingMetric class below: add a subscribeToMax(fn) method that registers an observer called only when the current window\'s maximum changes — not on every push. Track the last notified max in a this.lastMax field (start as null). After computing the window, find the max, and only call the subscribeToMax observers if max !== this.lastMax. Test: push values [5, 10, 3, 8, 15, 2]. Subscribe a max observer that logs "max changed to: <max>". It should fire when max changes: 5 → 10 → 10 → 10 → 15 → 15. So it fires at 5 (first value), 10, then 15. Log "max changed to: 5", "max changed to: 10", "max changed to: 15".',
      expectedOutput: null,
      startCode: `class SlidingMetric {
  constructor(windowSize) {
    this.windowSize  = windowSize
    this.window      = []
    this.observers   = []
    this.maxObservers = []
    this.lastMax     = null
  }

  subscribe(fn)        { this.observers.push(fn) }
  subscribeToMax(fn)   { this.maxObservers.push(fn) }

  push(value) {
    this.window.push(value)
    if (this.window.length > this.windowSize) this.window.shift()

    const max = Math.max(...this.window)

    // notify all observers
    for (const fn of this.observers) fn({ value, window: [...this.window] })

    // only notify maxObservers when max changes
    if (max !== this.lastMax) {
      // update lastMax and notify maxObservers
    }
  }
}

const m = new SlidingMetric(3)
m.subscribeToMax(max => console.log('max changed to:', max))

for (const v of [5, 10, 3, 8, 15, 2]) m.push(v)`,
      hint: 'if (max !== this.lastMax) { this.lastMax = max; for (const fn of this.maxObservers) fn(max); }',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim())
        return strs.includes('max changed to: 5') && strs.includes('max changed to: 10') && strs.includes('max changed to: 15')
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Step through the SlidingMetric.push() calls. Watch the window array in the Variables panel: it grows with each push until it reaches the window size (3), then shift() removes the oldest element as the newest one is added. Watch avg recompute each time. Then watch the observer functions fire: both observers are called with the same data object. When avg exceeds 20, the alert observer logs an extra message. Step slowly through the observer loop — each function call is independent and the subject does not know what they do.',
      code: `class SlidingMetric {
  constructor(size) { this.size = size; this.window = []; this.obs = [] }
  subscribe(fn) { this.obs.push(fn) }
  push(value) {
    this.window.push(value)
    if (this.window.length > this.size) this.window.shift()
    const avg = this.window.reduce((s,v) => s+v, 0) / this.window.length
    for (const fn of this.obs) fn({ value, avg: Math.round(avg*10)/10 })
  }
}

const m = new SlidingMetric(3)
m.subscribe(d => console.log('value:', d.value, 'avg:', d.avg))
m.subscribe(d => { if (d.avg > 15) console.log('ALERT avg:', d.avg) })

for (const v of [5, 10, 20, 8, 25]) m.push(v)`,
    },

    {
      type: 'codelens',
      id: 'cl-window-observer',
      text: `Step to: this.window.push(value)
Variables panel: window grows from [] to [5], then [5,10], then [5,10,20].

Step to: this.window.shift()
Variables panel: on the 4th push (value=8), window was [5,10,20]. shift() removes 5. window becomes [10,20].  Then 8 is pushed: [10,20,8].

Step through the observer loop for the third push (value=20, avg=11.7):
First fn fires — logs "value: 20 avg: 11.7".
Second fn checks avg (11.7 <= 15) — no alert.

Step through for value=25 (window=[20,8,25], avg=17.7):
First fn fires — logs "value: 25 avg: 17.7".
Second fn checks avg (17.7 > 15) — fires alert.`,
      code: `class SlidingMetric {
  constructor(size){this.size=size;this.window=[];this.obs=[]}
  subscribe(fn){this.obs.push(fn)}
  push(value){
    this.window.push(value)
    if(this.window.length>this.size)this.window.shift()
    const avg=this.window.reduce((s,v)=>s+v,0)/this.window.length
    for(const fn of this.obs)fn({value,avg:Math.round(avg*10)/10})
  }
}
const m=new SlidingMetric(3)
m.subscribe(d=>console.log('value:',d.value,'avg:',d.avg))
m.subscribe(d=>{if(d.avg>15)console.log('ALERT avg:',d.avg)})
for(const v of[5,10,20,8,25])m.push(v)`,
      lang: 'js',
    },

  ],
}
