export default   {
    id: 'hof',
    title: 'map · filter · reduce',
    tag: 'Functional',
    steps: [
      {
        title: 'numbers — the source',
        code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
console.log(numbers)`,
        explanation: [
          'Line 1 declares `numbers` as a constant array of eight integers. Line 2 prints the array. No transformation happens yet — this is the raw input that the next three higher-order functions will each process in a different way.',
          'CS — Arrays are the canonical input to higher-order collection methods. `map`, `filter`, and `reduce` each take a callback and apply it element-by-element. The source array is never mutated — all three methods return a new value and leave `numbers` unchanged. This immutability guarantee is what makes them safe to chain.',
          'SE — In production, `numbers` would be a data fetch result: a list of prices, user IDs, API response items. You rarely operate on raw data directly — you transform it first. `map`, `filter`, and `reduce` handle the three fundamental transformations (shape-preserve, subset, aggregate) that cover the overwhelming majority of data pipeline work.',
          'Without this: without a source array, the higher-order methods have nothing to iterate over. The methods are defined on `Array.prototype` — they only exist on array instances. A non-array value like a number or string does not have `.map` or `.filter`; calling them would throw `TypeError: numbers.map is not a function`.',
        ],
        active: [{ startLine: 1, endLine: 2, color: 'indigo', label: 'source array — 8 integers' }],
        connections: [],
      },
      {
        title: 'map — transform every element',
        code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
console.log(numbers)

const doubled = numbers.map(n => n * 2)`,
        explanation: [
          '`numbers.map(n => n * 2)` on line 4 calls the arrow function once for each of the eight elements. For `n = 1`: returns `2`. For `n = 2`: returns `4`. And so on through `n = 8`: returns `16`. Each return value is collected into a new array at the same index. `doubled` is that new array. `numbers` is unchanged.',
          'CS — `map` is a one-to-one transformation: input length equals output length. It is the functor operation — applying a function to every element inside a container while preserving the container\'s structure. The callback `n => n * 2` is a pure function: same input always produces the same output, no side effects. Pure callbacks are what make `map` safe to use in any context.',
          'SE — `Array.prototype.map` is the most-used array method in React codebases: `items.map(item => <Card key={item.id} data={item} />)` renders a list. Lodash `_.map(collection, iteratee)` does the same for plain objects and arrays. RxJS `Observable.pipe(map(fn))` applies it to streams. The pattern is identical across all three — apply `fn` to every element, collect results.',
          'Without this: without `map`, you would write a `for` loop, push each transformed value into a temporary array, and return it. That is four lines of bookkeeping for a one-liner operation. Worse, a `for` loop exposes a mutable accumulator — bugs from forgetting to initialise it or accidentally mutating the source. `map` encapsulates all of that.',
        ],
        active: [
          { startLine: 1, endLine: 1, color: 'indigo',  label: 'source' },
          { startLine: 4, endLine: 4, color: 'emerald', label: 'map — callback runs 8 times' },
        ],
        connections: [],
      },
      {
        title: 'map result',
        code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
console.log(numbers)

const doubled = numbers.map(n => n * 2)
console.log(doubled)`,
        explanation: [
          'Line 5 prints `doubled`. Each element in `numbers` was multiplied by 2 in order: `1→2`, `2→4`, `3→6`, `4→8`, `5→10`, `6→12`, `7→14`, `8→16`. Eight inputs, eight outputs, same positions. The original `numbers` array is still `[1,2,3,4,5,6,7,8]` — `map` never writes to the source.',
          'CS — The output length equals the input length — this is the defining constraint of `map`. If your operation can drop or merge elements, `map` is the wrong tool. The position correspondence (index `i` in → index `i` out) is also guaranteed. If you need to reorder or deduplicate, you need `filter` or `reduce`.',
          'SE — When debugging a `map` result, the first check is always length: `input.length === output.length`. If not, a callback accidentally returned `undefined` (missing `return` statement, or `return` inside an `if` that didn\'t always hit). A `map` that produces `[2, undefined, 6, ...]` means the callback returned `undefined` for some elements.',
          'Without this: if `doubled` printed something other than `[2,4,6,8,10,12,14,16]`, the callback has a bug — either wrong arithmetic or the function is mutating `numbers` instead of returning a new value. Printing the result immediately after the operation is how you confirm the transformation is correct before chaining further operations.',
        ],
        active: [
          { startLine: 4, endLine: 5, color: 'emerald', label: '8 in → 8 out' },
        ],
        connections: [],
      },
      {
        title: 'filter — keep matching elements',
        code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
console.log(numbers)

const doubled = numbers.map(n => n * 2)
console.log(doubled)

const evens = numbers.filter(n => n % 2 === 0)
console.log(evens)`,
        explanation: [
          '`numbers.filter(n => n % 2 === 0)` on line 7 calls the predicate once for each element. For `n = 1`: `1 % 2 === 0` is `false` — dropped. For `n = 2`: `true` — kept. For `n = 3`: `false` — dropped. For `n = 4`: `true` — kept. Through to `n = 8`: `true` — kept. The result is `[2, 4, 6, 8]`. Four elements survive out of eight.',
          'CS — `filter` is a many-to-fewer transformation: output length ≤ input length. The predicate callback returns a boolean — exactly `true` (keep) or `false` (drop). `filter` preserves order: elements that pass appear in the output in the same relative order as they appeared in the input. No element is inserted or reordered.',
          'SE — `.filter` is ubiquitous in production data pipelines. React: `items.filter(item => item.isVisible)` removes hidden elements before rendering. APIs: `results.filter(r => r.status === \'active\')` removes inactive records. Redux selectors: `state.tasks.filter(t => t.assignee === userId)` scopes data to a user. All three are the same pattern — predicate in, subset out.',
          'Without this: without `filter`, you write a `for` loop with an `if` block that conditionally pushes to a result array. The predicate logic is buried inside loop control flow. `filter` externalises the decision — the callback is the only thing that changes between different filter operations. The loop is always identical.',
        ],
        active: [
          { startLine: 7, endLine: 8, color: 'violet', label: 'filter — true keeps, false drops' },
        ],
        connections: [],
      },
      {
        title: 'reduce — fold to one value',
        code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
console.log(numbers)

const doubled = numbers.map(n => n * 2)
console.log(doubled)

const evens = numbers.filter(n => n % 2 === 0)
console.log(evens)

const sum = numbers.reduce((acc, n) => acc + n, 0)
console.log(sum)`,
        explanation: [
          '`numbers.reduce((acc, n) => acc + n, 0)` on line 10: `acc` starts at `0` (the second argument). Round 1: `acc=0, n=1` → `acc=1`. Round 2: `acc=1, n=2` → `acc=3`. Round 3: `acc=3, n=3` → `acc=6`. Round 4: `acc=6, n=4` → `acc=10`. Rounds 5–8 continue: `15 → 21 → 28 → 36`. Final `acc` is returned as the result.',
          'CS — `reduce` is the most general of the three: it can implement both `map` and `filter`. The accumulator `acc` can be any type — a number, an object, an array. `reduce` folds many values into one by repeatedly applying the callback with a running accumulator. This is the left fold (or `foldl`) from functional programming.',
          'SE — `reduce` powers the aggregation layer of every data pipeline. Redux: every reducer is `(state, action) => newState` — `reduce` over a stream of actions. SQL `GROUP BY ... SUM(col)` is a reduce. GraphQL resolvers aggregate sub-fields into one response object using the same accumulate-and-return pattern. Any time many inputs must collapse to one output, `reduce` is the right tool.',
          'Without this: without the initial value `0`, `reduce` uses the first element as `acc` and starts iteration at index 1. For an empty array, that throws `TypeError: Reduce of empty array with no initial value`. Always supply the initial value — it makes the function safe for empty inputs and documents the expected return type.',
        ],
        active: [
          { startLine: 10, endLine: 11, color: 'pink', label: 'reduce — acc accumulates round by round' },
        ],
        connections: [],
      },
      {
        title: 'Chain — pipeline of three stages',
        code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
console.log(numbers)

const doubled = numbers.map(n => n * 2)
console.log(doubled)

const evens = numbers.filter(n => n % 2 === 0)
console.log(evens)

const sum = numbers.reduce((acc, n) => acc + n, 0)
console.log(sum)

const result = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * 3)
  .reduce((acc, n) => acc + n, 0)
console.log(result)`,
        explanation: [
          'Lines 13–16 chain three methods. `filter` runs first on `numbers` → `[2, 4, 6, 8]`. That intermediate array immediately receives `.map(n => n * 3)` → `[6, 12, 18, 24]`. That array immediately receives `.reduce((acc, n) => acc + n, 0)` → `6+12+18+24 = 60`. Each method\'s return value is the next method\'s receiver. One expression, three transformations.',
          'CS — Method chaining works because `filter` and `map` both return new arrays, and arrays have `map`, `filter`, and `reduce` on their prototype. The result of `.filter(...)` is an array, so `.map(...)` is immediately available on it. No intermediate variable is needed. Each stage is a pure transformation — the output of one is the input to the next.',
          'SE — This is the Unix pipe philosophy applied to JavaScript. In Unix: `cat file | grep pattern | sort | uniq`. In JavaScript: `data.filter(pred).map(transform).reduce(aggregate)`. Lodash chain (`_.chain(data).filter(...).map(...).value()`) and RxJS `pipe(filter(...), map(...), reduce(...))` are the same mental model formalised as library APIs.',
          'Without this: without chaining, you would store each intermediate result in a named variable: `const filtered = numbers.filter(...)`, `const mapped = filtered.map(...)`, `const total = mapped.reduce(...)`. That is three extra variable declarations for temporaries that are immediately thrown away. Chaining is not just style — it eliminates accidental reuse of intermediate arrays and makes the pipeline\'s direction explicit.',
        ],
        active: [
          { startLine: 14, endLine: 14, color: 'violet',  label: 'filter → [2,4,6,8]' },
          { startLine: 15, endLine: 15, color: 'pink',    label: 'map → [6,12,18,24]' },
          { startLine: 16, endLine: 16, color: 'emerald', label: 'reduce → 60' },
        ],
        connections: [
          { fromLine: 14, toLine: 15, color: 'violet', label: '[2,4,6,8]' },
          { fromLine: 15, toLine: 16, color: 'pink',   label: '[6,12,18,24]' },
        ],
      },
    ],
  }
