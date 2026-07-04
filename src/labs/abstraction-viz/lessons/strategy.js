export default   {
    id: 'strategy',
    title: 'Strategy',
    tag: 'Design Pattern',
    steps: [
      {
        title: 'sortUsers — context, not logic',
        code:
`function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}`,
        explanation: [
          '`sortUsers` on line 1 takes two arguments: `users` (an array) and `strategy` (a function). Line 2 copies the array with `[...users]` so the original is never mutated, then calls `.sort(strategy)`. `sort` will call `strategy(a, b)` for every comparison pair and use the return value to determine order. `sortUsers` does not contain any ordering logic — it only provides the structure.',
          'CS — This is the Strategy design pattern: a context function (`sortUsers`) delegates its variable behaviour to an injected strategy function. The context owns "how to run the sort"; the strategy owns "how to compare two items." Separating these concerns means the context never changes when the ordering rule changes.',
          'SE — `Array.prototype.sort(compareFn)` is the built-in implementation of this exact pattern. The browser\'s sort algorithm (TimSort in V8) is the context. Your comparator is the strategy. Lodash `_.sortBy(collection, iteratee)` abstracts further — the iteratee extracts the sort key and Lodash handles the comparison. Both APIs follow the same separation.',
          'Without this: if `sortUsers` contained `a.name.localeCompare(b.name)` directly, every new ordering rule (by age, by join date, by score) would require a new function. The sort algorithm and the comparison rule would be entangled. Adding `sortByAge` would mean copy-pasting `sortUsers` with one line changed — a clear sign the wrong separation is in place.',
        ],
        active: [{ startLine: 1, endLine: 3, color: 'violet', label: 'sortUsers — slot for strategy' }],
        connections: [],
      },
      {
        title: 'sortByName — the first strategy',
        code:
`function sortByName(a, b) {
  return a.name.localeCompare(b.name)
}

function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}`,
        explanation: [
          '`sortByName` on line 1 is a comparator function. `Array.sort` calls it with two elements `a` and `b`. Line 2 calls `a.name.localeCompare(b.name)`: if `a.name` comes before `b.name` alphabetically, returns a negative number (put `a` first); if after, returns positive (put `b` first); if equal, returns `0`. This is the contract `sort` requires from every comparator.',
          'CS — The comparator contract is: return negative → `a` before `b`, return zero → equal, return positive → `b` before `a`. This three-way comparison maps directly to the mathematical trichotomy relation. `localeCompare` is locale-aware string comparison — it handles accented characters, case, and Unicode collation correctly, unlike `<` / `>` operator comparison.',
          'SE — Production sort comparators should always use `localeCompare` for string fields, not `a.name < b.name ? -1 : 1`. The `<` operator compares Unicode code points, which sorts uppercase before lowercase and handles accented characters incorrectly for most locales. `localeCompare` is what UI frameworks use when displaying sorted tables or dropdowns to users.',
          'Without this: a comparator that returns only `true` or `false` instead of a negative/zero/positive number is a common mistake. `sort` calls the comparator and checks the sign of the return value — a boolean `true` coerces to `1` (positive) and `false` to `0`, making the sort behave erratically. The sort will run but produce wrong ordering on some inputs.',
        ],
        active: [{ startLine: 1, endLine: 3, color: 'indigo', label: 'sortByName — comparator function' }],
        connections: [],
      },
      {
        title: 'The data',
        code:
`function sortByName(a, b) {
  return a.name.localeCompare(b.name)
}

function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}

const users = [
  { name: 'Charlie', age: 30 },
  { name: 'Alice',   age: 25 },
  { name: 'Bob',     age: 28 },
]`,
        explanation: [
          'Lines 9–12 declare `users`: three objects in unsorted order — Charlie, Alice, Bob. Each has a `name` string and an `age` number. This is the array that `sortUsers` will receive. The original array will never be modified — `[...users]` inside `sortUsers` creates a copy before sorting.',
          'CS — Object arrays are the most common real-world input to sorting functions. Each object is a record with multiple fields, and the sort criterion selects one field at a time. The Strategy pattern separates "which field to sort by" from "how to execute the sort loop" — the data structure does not need to change for each new sort criterion.',
          'SE — In production: `users` would come from a database query or API response, typically as an array of plain objects. Sorting on the frontend before rendering a table is standard practice. The same `sortUsers` function handles any criterion — the product can add a "sort by last login" column without touching `sortUsers` at all.',
          'Without this: if the data were not plain objects with named fields — say, just an array of strings — the comparator would be simpler but less illustrative. Objects with multiple fields make the Strategy pattern\'s value clear: you choose which field the comparator reads, without the context knowing which field you chose.',
        ],
        active: [{ startLine: 9, endLine: 13, color: 'emerald', label: 'data — unsorted' }],
        connections: [],
      },
      {
        title: 'sortUsers(users, sortByName) — sort by name',
        code:
`function sortByName(a, b) {
  return a.name.localeCompare(b.name)
}

function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}

const users = [
  { name: 'Charlie', age: 30 },
  { name: 'Alice',   age: 25 },
  { name: 'Bob',     age: 28 },
]

console.log(sortUsers(users, sortByName).map(u => u.name))`,
        explanation: [
          'Line 15 calls `sortUsers(users, sortByName)`. Inside, `strategy` receives `sortByName`. `.sort(strategy)` calls `sortByName(a, b)` for each comparison pair: `sortByName(Charlie, Alice)` returns positive (Charlie after Alice), `sortByName(Alice, Bob)` returns negative (Alice before Bob), etc. The array is rearranged to `[Alice, Bob, Charlie]`. `.map(u => u.name)` extracts the names for display.',
          'CS — The call stack at the moment `sort` calls the comparator: `sortUsers` → `sort internals` → `sortByName`. `sortByName` executes in the context of `sort`, which is inside `sortUsers`, which was called from line 15. `strategy` in `sortUsers` and `a`, `b` in `sortByName` are all on the stack simultaneously during each comparison.',
          'SE — This is exactly how `Array.prototype.sort` is used in every JavaScript application that renders a sorted list. The comparator is always kept separate from the calling code. In React: `users.sort(sortByName).map(u => <Row key={u.id} user={u} />)`. The sort and the render are two separate concerns chained together.',
          'Without this: if `sort` were called without a comparator — `[...users].sort()` — JavaScript converts each element to a string and sorts lexicographically. `{ name: \'Charlie\', age: 30 }` becomes `\'[object Object]\'` — all three elements are identical strings, so the order is undefined. Always pass a comparator when sorting non-primitive arrays.',
        ],
        active: [
          { startLine: 15, endLine: 15, color: 'emerald', label: 'call site' },
          { startLine: 5,  endLine: 7,  color: 'violet',  label: 'sortUsers — strategy = sortByName' },
        ],
        connections: [{ fromLine: 15, toLine: 5, color: 'emerald', label: 'enters' }],
      },
      {
        title: 'strategy(a, b) dispatches to sortByName',
        code:
`function sortByName(a, b) {
  return a.name.localeCompare(b.name)
}

function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}

const users = [
  { name: 'Charlie', age: 30 },
  { name: 'Alice',   age: 25 },
  { name: 'Bob',     age: 28 },
]

console.log(sortUsers(users, sortByName).map(u => u.name))`,
        explanation: [
          'Each time `sort` needs to compare two elements, it calls `strategy(a, b)`. `strategy` is `sortByName`. Line 2 runs: `a.name.localeCompare(b.name)`. For `(Charlie, Alice)`: `\'Charlie\'.localeCompare(\'Alice\')` returns a positive number → Charlie moves after Alice. This executes once per comparison until the full ordering is determined. Final result: `[\'Alice\', \'Bob\', \'Charlie\']`.',
          'CS — The dispatch is dynamic: `sort` calls `strategy` without knowing what function it holds. This is the same mechanism as virtual dispatch in object-oriented languages — the concrete implementation is resolved at call time, not at write time. `sort`\'s algorithm is independent of the comparator; the comparator is independent of the sort algorithm.',
          'SE — Understanding this dispatch chain is essential for debugging sort bugs. If the output order is wrong: (1) log `a.name` and `b.name` inside the comparator to confirm which values it receives, (2) log the return value to confirm the sign is correct. The comparator is a pure function — testing it directly with `sortByName({name:\'B\'},{name:\'A\'})` should return a positive number.',
          'Without this: if `strategy` were not a function — say, you accidentally passed `sortByName()` (called it) instead of `sortByName` (referenced it) — then `strategy` would be `undefined` (the return value of `sortByName(undefined, undefined)`). `.sort(undefined)` falls back to default lexicographic sort. This is a common mistake when wiring callbacks: always pass the function reference, not the result of calling it.',
        ],
        active: [
          { startLine: 15, endLine: 15, color: 'emerald', label: '→ [Alice, Bob, Charlie]' },
          { startLine: 6,  endLine: 6,  color: 'violet',  label: 'sort dispatches strategy(a,b)' },
          { startLine: 1,  endLine: 3,  color: 'indigo',  label: 'sortByName fires per comparison' },
        ],
        connections: [
          { fromLine: 15, toLine: 5, color: 'emerald', label: 'enters sortUsers' },
          { fromLine: 6,  toLine: 1, color: 'indigo',  label: 'strategy(a,b)' },
        ],
      },
      {
        title: 'sortByAge — swap the strategy',
        code:
`function sortByName(a, b) {
  return a.name.localeCompare(b.name)
}

function sortByAge(a, b) {
  return a.age - b.age
}

function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}

const users = [
  { name: 'Charlie', age: 30 },
  { name: 'Alice',   age: 25 },
  { name: 'Bob',     age: 28 },
]

console.log(sortUsers(users, sortByName).map(u => u.name))
console.log(sortUsers(users, sortByAge).map(u => u.name))`,
        explanation: [
          '`sortByAge` on line 5 subtracts ages: `a.age - b.age`. If `a` is younger (smaller age), the result is negative → `a` goes first. If older, positive → `b` goes first. Line 20 passes `sortByAge` to `sortUsers`. Alice=25, Bob=28, Charlie=30. Ascending by age: `[\'Alice\', \'Bob\', \'Charlie\']`. `sortUsers` is byte-for-byte unchanged — only the `strategy` argument changes.',
          'CS — Open/Closed Principle: `sortUsers` is closed for modification and open for extension via the `strategy` parameter. Adding a third criterion (`sortByScore`, `sortByJoinDate`) requires defining one new comparator function and passing it in — zero changes to `sortUsers`. The context function is stable; the strategies are the extension points.',
          'SE — This is why sort functions in libraries accept comparators rather than field names. A field-name API (`sortUsers(users, \'age\')`) would require the library to enumerate every possible field and add special cases for strings vs numbers vs dates. A comparator API (`sortUsers(users, sortByAge)`) puts the field logic in your code and keeps the library simple. This is why `Array.sort`, Lodash `_.sortWith`, and Java\'s `Comparator` all follow this pattern.',
          'Without this: if each sort criterion required a different version of `sortUsers` — `sortUsersByName`, `sortUsersByAge` — adding a third criterion means writing a third function with identical structure and one different line. The duplicated boilerplate accumulates and any bug in the sort logic (the `[...users]` copy, the `.sort()` call) must be fixed in every copy. The strategy parameter eliminates all of that.',
        ],
        active: [
          { startLine: 5,  endLine: 7,  color: 'pink',    label: 'sortByAge — second strategy' },
          { startLine: 20, endLine: 20, color: 'emerald', label: 'swap strategy — sortUsers unchanged' },
          { startLine: 9,  endLine: 11, color: 'violet',  label: 'sortUsers — not a single line changed' },
        ],
        connections: [
          { fromLine: 20, toLine: 9, color: 'emerald', label: 'enters' },
          { fromLine: 10, toLine: 5, color: 'pink',    label: 'strategy = sortByAge' },
        ],
      },
    ],
  }
