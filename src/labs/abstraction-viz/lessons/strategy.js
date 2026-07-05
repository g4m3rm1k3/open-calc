export default {
  id: 'strategy',
  title: 'Strategy',
  tag: 'Design Pattern',
  steps: [
    {
      title: 'sortUsers — context, not logic',
      semanticEvent: 'DefineFunction',
      code:
`function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}`,
      explanation: [
        '`sortUsers` establishes a **context → strategy dependency slot**: the function owns the structure (copy the array, call sort) but delegates the comparison rule to whatever `strategy` is injected at call time. The context never changes; only what gets passed into it changes. This separation is the entire Strategy pattern.',
        'CS — This is the Strategy design pattern: a context function (`sortUsers`) delegates its variable behaviour to an injected strategy function. The context owns "how to run the sort"; the strategy owns "how to compare two items." Separating these concerns means the context never changes when the ordering rule changes.',
        'SE — `Array.prototype.sort(compareFn)` is the built-in implementation of this exact pattern. The browser\'s sort algorithm (TimSort in V8) is the context. Your comparator is the strategy. Lodash `_.sortBy(collection, iteratee)` abstracts further — the iteratee extracts the sort key and Lodash handles the comparison. Both APIs follow the same separation.',
        'Without this: if `sortUsers` contained `a.name.localeCompare(b.name)` directly, every new ordering rule (by age, by join date, by score) would require a new function. The sort algorithm and the comparison rule would be entangled. Adding `sortByAge` would mean copy-pasting `sortUsers` with one line changed — a clear sign the wrong separation is in place.',
      ],
      active: [{ startLine: 1, endLine: 3, color: 'violet', label: 'sortUsers — slot for strategy' }],
      connections: [],
    },
    {
      title: 'sortByName — the first strategy',
      semanticEvent: 'DefineFunction',
      code:
`function sortByName(a, b) {
  return a.name.localeCompare(b.name)
}

function sortUsers(users, strategy) {
  return [...users].sort(strategy)
}`,
      explanation: [
        '`sortByName` defines the **first concrete comparison rule**: given two user objects, it returns a negative, zero, or positive number expressing their alphabetical order by name. It is a pure function — no state, no side effects, same inputs always produce the same output. This makes it safe to swap in or out of any context that accepts a comparator.',
        'CS — The comparator contract is: return negative → `a` before `b`, return zero → equal, return positive → `b` before `a`. This three-way comparison maps directly to the mathematical trichotomy relation. `localeCompare` is locale-aware string comparison — it handles accented characters, case, and Unicode collation correctly, unlike `<` / `>` operator comparison.',
        'SE — Production sort comparators should always use `localeCompare` for string fields, not `a.name < b.name ? -1 : 1`. The `<` operator compares Unicode code points, which sorts uppercase before lowercase and handles accented characters incorrectly for most locales. `localeCompare` is what UI frameworks use when displaying sorted tables or dropdowns to users.',
        'Without this: a comparator that returns only `true` or `false` instead of a negative/zero/positive number is a common mistake. `sort` calls the comparator and checks the sign of the return value — a boolean `true` coerces to `1` (positive) and `false` to `0`, making the sort behave erratically. The sort will run but produce wrong ordering on some inputs.',
      ],
      active: [{ startLine: 1, endLine: 3, color: 'indigo', label: 'sortByName — comparator function' }],
      connections: [],
    },
    {
      title: 'The data',
      semanticEvent: 'CreateVariable',
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
        '`users` introduces the **data the strategies will operate on**: three unsorted objects, each with a `name` and `age` field. The strategy pattern\'s power is visible here — the same array can be sorted by any field without changing the data structure or the `sortUsers` function. The criterion lives entirely in the strategy function.',
        'CS — Object arrays are the most common real-world input to sorting functions. Each object is a record with multiple fields, and the sort criterion selects one field at a time. The Strategy pattern separates "which field to sort by" from "how to execute the sort loop" — the data structure does not need to change for each new sort criterion.',
        'SE — In production: `users` would come from a database query or API response, typically as an array of plain objects. Sorting on the frontend before rendering a table is standard practice. The same `sortUsers` function handles any criterion — the product can add a "sort by last login" column without touching `sortUsers` at all.',
        'Without this: if the data were not plain objects with named fields — say, just an array of strings — the comparator would be simpler but less illustrative. Objects with multiple fields make the Strategy pattern\'s value clear: you choose which field the comparator reads, without the context knowing which field you chose.',
      ],
      active: [{ startLine: 9, endLine: 13, color: 'emerald', label: 'data — unsorted' }],
      connections: [],
    },
    {
      title: 'sortUsers(users, sortByName) — sort by name',
      semanticEvent: 'CallFunction',
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
        '`sortUsers(users, sortByName)` **plugs the strategy into the context**: inside `sortUsers`, `strategy` is now `sortByName`. `.sort(strategy)` will call `sortByName(a, b)` for each comparison pair. The caller expressed intent ("sort by name") without touching `sortUsers`. The result — `[Alice, Bob, Charlie]` — emerges from the composition of the context and the injected strategy.',
        'CS — The call stack at the moment `sort` calls the comparator: `sortUsers` → `sort internals` → `sortByName`. `sortByName` executes in the context of `sort`, which is inside `sortUsers`, which was called from line 15. `strategy` in `sortUsers` and `a`, `b` in `sortByName` are all on the stack simultaneously during each comparison.',
        'SE — This is exactly how `Array.prototype.sort` is used in every JavaScript application that renders a sorted list. The comparator is always kept separate from the calling code. In React: `users.sort(sortByName).map(u => <Row key={u.id} user={u} />)`. The sort and the render are two separate concerns chained together.',
        'Without this: if `sort` were called without a comparator — `[...users].sort()` — JavaScript converts each element to a string and sorts lexicographically. `{ name: \'Charlie\', age: 30 }` becomes `\'[object Object]\'` — all three elements are identical strings, so the order is undefined. Always pass a comparator when sorting non-primitive arrays.',
      ],
      active: [
        { startLine: 15, endLine: 15, color: 'emerald', label: 'call site' },
        { startLine: 5,  endLine: 7,  color: 'violet',  label: 'sortUsers — strategy = sortByName' },
      ],
      connections: [{ fromLine: 15, toLine: 5, color: 'emerald', label: 'enters', type: 'calls' }],
    },
    {
      title: 'strategy(a, b) dispatches to sortByName',
      semanticEvent: 'CallFunction',
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
        'Each comparison dispatches through `strategy` to `sortByName`: `sort` calls `strategy(a, b)`, `strategy` is `sortByName`, and `sortByName` returns the sign that determines order. The context (`sort`) and the algorithm (`sortByName`) are connected only through the comparator contract — neither knows anything else about the other.',
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
        { fromLine: 15, toLine: 5, color: 'emerald', label: 'enters sortUsers', type: 'calls' },
        { fromLine: 6,  toLine: 1, color: 'indigo',  label: 'strategy(a,b)', type: 'calls' },
      ],
    },
    {
      title: 'sortByAge — swap the strategy',
      semanticEvent: 'DefineFunction',
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
        '`sortByAge` defines a **second interchangeable strategy**: `a.age - b.age` returns the age difference directly — a standard numeric comparator. Passing it to the same `sortUsers` context produces a different ordering (`[Alice, Bob, Charlie]` by age) with zero changes to `sortUsers`. Adding a new sort criterion is additive-only — define the comparator, pass it in.',
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
        { fromLine: 20, toLine: 9, color: 'emerald', label: 'enters', type: 'calls' },
        { fromLine: 10, toLine: 5, color: 'pink',    label: 'strategy = sortByAge', type: 'calls' },
      ],
    },
  ],
}
