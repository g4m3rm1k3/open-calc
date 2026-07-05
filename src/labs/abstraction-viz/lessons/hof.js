export default {
  id: 'hof',
  title: 'map · filter · reduce',
  tag: 'Functional',
  steps: [
    {
      title: 'numbers — the source array',
      semanticEvent: 'CreateVariable',
      code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
console.log(numbers)`,
      explanation: [
        'This step creates `numbers` as a **named, immutable binding** to an array of eight integers. No transformation happens — this is the source. Every higher-order method (`map`, `filter`, `reduce`) will read from this array and leave it unchanged. The abstraction being established: a labelled dataset that can be passed to any function without risk of mutation.',
        'CS — Arrays are the canonical input to higher-order collection methods. `map`, `filter`, and `reduce` each take a callback and apply it element-by-element. The source array is never mutated — all three methods return a new value and leave `numbers` unchanged. This immutability guarantee is what makes them safe to chain.',
        'SE — In production, `numbers` would be a data fetch result: a list of prices, user IDs, API response items. You rarely operate on raw data directly — you transform it first. `map`, `filter`, and `reduce` handle the three fundamental transformations (shape-preserve, subset, aggregate) that cover the overwhelming majority of data pipeline work.',
        'Without this: without a source array, the higher-order methods have nothing to iterate over. The methods are defined on `Array.prototype` — they only exist on array instances. A non-array value like a number or string does not have `.map` or `.filter`; calling them would throw `TypeError: numbers.map is not a function`.',
      ],
      active: [{ startLine: 1, endLine: 2, color: 'indigo', label: 'source array — 8 integers' }],
      connections: [],
    },
    {
      title: 'map — one-to-one transformation',
      semanticEvent: 'CallFunction',
      code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
console.log(numbers)

const doubled = numbers.map(n => n * 2)`,
      explanation: [
        '`map` establishes a **one-to-one dependency**: every element in `numbers` produces exactly one element in `doubled` at the same position. The callback `n => n * 2` is the rule for that dependency — `doubled[i]` is always `numbers[i] * 2`. The source is unchanged; the relationship between them is what the abstraction captures.',
        'CS — `map` is a one-to-one transformation: input length equals output length. It is the functor operation — applying a function to every element inside a container while preserving the container\'s structure. The callback `n => n * 2` is a pure function: same input always produces the same output, no side effects. Pure callbacks are what make `map` safe to use in any context.',
        'SE — `Array.prototype.map` is the most-used array method in React codebases: `items.map(item => <Card key={item.id} data={item} />)` renders a list. Lodash `_.map(collection, iteratee)` does the same for plain objects and arrays. RxJS `Observable.pipe(map(fn))` applies it to streams. The pattern is identical across all three — apply `fn` to every element, collect results.',
        'Without this: without `map`, you would write a `for` loop, push each transformed value into a temporary array, and return it. That is four lines of bookkeeping for a one-liner operation. Worse, a `for` loop exposes a mutable accumulator — bugs from forgetting to initialise it or accidentally mutating the source. `map` encapsulates all of that.',
      ],
      active: [
        { startLine: 1, endLine: 1, color: 'indigo',  label: 'source' },
        { startLine: 4, endLine: 4, color: 'emerald', label: 'map — callback runs 8 times' },
      ],
      connections: [
        { fromLine: 1, toLine: 4, color: 'indigo', label: 'numbers feeds map', type: 'reads' },
      ],
    },
    {
      title: 'map result — 8 in, 8 out',
      semanticEvent: 'ReturnValue',
      code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
console.log(numbers)

const doubled = numbers.map(n => n * 2)
console.log(doubled)`,
      explanation: [
        '`doubled` is now bound to a new array `[2,4,6,8,10,12,14,16]`. The relationship `map` established is visible in the output: each element is exactly `numbers[i] * 2`. Eight inputs produced eight outputs in the same positions. `numbers` is still `[1,2,3,4,5,6,7,8]` — the dependency is read-only.',
        'CS — The output length equals the input length — this is the defining constraint of `map`. If your operation can drop or merge elements, `map` is the wrong tool. The position correspondence (index `i` in → index `i` out) is also guaranteed. If you need to reorder or deduplicate, you need `filter` or `reduce`.',
        'SE — When debugging a `map` result, the first check is always length: `input.length === output.length`. If not, a callback accidentally returned `undefined` (missing `return` statement, or `return` inside an `if` that didn\'t always hit). A `map` that produces `[2, undefined, 6, ...]` means the callback returned `undefined` for some elements.',
        'Without this: if `doubled` printed something other than `[2,4,6,8,10,12,14,16]`, the callback has a bug — either wrong arithmetic or the function is mutating `numbers` instead of returning a new value. Printing the result immediately after the operation is how you confirm the transformation is correct before chaining further operations.',
      ],
      active: [
        { startLine: 4, endLine: 5, color: 'emerald', label: 'doubled — 8 in, 8 out' },
      ],
      connections: [
        { fromLine: 1, toLine: 4, color: 'indigo',  label: 'numbers feeds map', type: 'reads' },
        { fromLine: 4, toLine: 5, color: 'emerald', label: 'map produces doubled', type: 'produces' },
      ],
    },
    {
      title: 'filter — keeps only matching elements',
      semanticEvent: 'CallFunction',
      code:
`const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
console.log(numbers)

const doubled = numbers.map(n => n * 2)
console.log(doubled)

const evens = numbers.filter(n => n % 2 === 0)
console.log(evens)`,
      explanation: [
        '`filter` establishes a **membership dependency**: `evens` contains only elements of `numbers` that satisfy `n % 2 === 0`. The relationship is a subset — every element in `evens` was in `numbers`, but not vice versa. The predicate callback is the rule that defines the boundary between kept and dropped.',
        'CS — `filter` is a many-to-fewer transformation: output length ≤ input length. The predicate callback returns a boolean — exactly `true` (keep) or `false` (drop). `filter` preserves order: elements that pass appear in the output in the same relative order as they appeared in the input. No element is inserted or reordered.',
        'SE — `.filter` is ubiquitous in production data pipelines. React: `items.filter(item => item.isVisible)` removes hidden elements before rendering. APIs: `results.filter(r => r.status === \'active\')` removes inactive records. Redux selectors: `state.tasks.filter(t => t.assignee === userId)` scopes data to a user. All three are the same pattern — predicate in, subset out.',
        'Without this: without `filter`, you write a `for` loop with an `if` block that conditionally pushes to a result array. The predicate logic is buried inside loop control flow. `filter` externalises the decision — the callback is the only thing that changes between different filter operations. The loop is always identical.',
      ],
      active: [
        { startLine: 1, endLine: 1, color: 'indigo',  label: 'source' },
        { startLine: 7, endLine: 8, color: 'violet', label: 'filter — true keeps, false drops' },
      ],
      connections: [
        { fromLine: 1, toLine: 7, color: 'indigo', label: 'numbers feeds filter', type: 'reads' },
      ],
    },
    {
      title: 'reduce — folds many values into one',
      semanticEvent: 'CallFunction',
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
        '`reduce` establishes a **fold dependency**: all eight elements of `numbers` collapse into a single value `sum`. The accumulator `acc` carries the running total — each element is consumed into it and disappears. At the end, the many-to-one relationship is complete: eight inputs, one output, `36`.',
        'CS — `reduce` is the most general of the three: it can implement both `map` and `filter`. The accumulator `acc` can be any type — a number, an object, an array. `reduce` folds many values into one by repeatedly applying the callback with a running accumulator. This is the left fold (or `foldl`) from functional programming.',
        'SE — `reduce` powers the aggregation layer of every data pipeline. Redux: every reducer is `(state, action) => newState` — `reduce` over a stream of actions. SQL `GROUP BY ... SUM(col)` is a reduce. GraphQL resolvers aggregate sub-fields into one response object using the same accumulate-and-return pattern. Any time many inputs must collapse to one output, `reduce` is the right tool.',
        'Without this: without the initial value `0`, `reduce` uses the first element as `acc` and starts iteration at index 1. For an empty array, that throws `TypeError: Reduce of empty array with no initial value`. Always supply the initial value — it makes the function safe for empty inputs and documents the expected return type.',
      ],
      active: [
        { startLine: 1,  endLine: 1,  color: 'indigo', label: 'source' },
        { startLine: 10, endLine: 11, color: 'pink',   label: 'reduce — acc folds 8 values to 1' },
      ],
      connections: [
        { fromLine: 1,  toLine: 10, color: 'indigo', label: 'numbers feeds reduce', type: 'reads' },
        { fromLine: 10, toLine: 11, color: 'pink',   label: 'reduce produces sum', type: 'produces' },
      ],
    },
    {
      title: 'Chain — three-stage pipeline',
      semanticEvent: 'CallFunction',
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
        'The chain on lines 13–16 creates a **pipeline of dependencies**: `numbers` feeds `filter` → `[2,4,6,8]` feeds `map` → `[6,12,18,24]` feeds `reduce` → `60`. Each stage\'s output is the next stage\'s input. The result is produced by the composition of all three relationships — no intermediate variable is needed because each return value flows directly into the next method.',
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
        { fromLine: 1,  toLine: 14, color: 'indigo', label: 'numbers feeds pipeline', type: 'reads' },
        { fromLine: 14, toLine: 15, color: 'violet', label: 'filter produces [2,4,6,8]', type: 'produces' },
        { fromLine: 15, toLine: 16, color: 'pink',   label: 'map produces [6,12,18,24]', type: 'produces' },
      ],
    },
  ],
}
