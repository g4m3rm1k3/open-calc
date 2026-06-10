# Junior to Senior — T1·L0g — Iterators and Generators

**Prerequisites:** T1·L0f (Enums and Const Objects). You know the TypeScript
type system. This lesson covers how JavaScript's iteration protocol works and
how generators let you write lazy sequences.

**What this lab adds:**
- The iterator protocol — what makes a `for...of` loop work
- Implementing `[Symbol.iterator]()` to make any object iterable
- `function*` and `yield` — declaring and using a generator
- `yield*` — delegating to another iterable
- Practical uses: infinite sequences, lazy pipelines, streaming

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `for...of` works on arrays, strings, Maps, and Sets. What do they all
>    have in common that makes `for...of` work on them?
> 2. A generator function is called. Does its body execute immediately?
>    What does calling it return?
> 3. You have a generator that yields 1 billion numbers. How much memory
>    does it use?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A lazy contact reader that processes data one item at a time, never loading
the full dataset into memory:

```
$ npx ts-node generators.ts

--- Iterator Protocol ---
Iterating ContactRange: A, B, C, D

--- Generator Basics ---
Yielded: 1
Yielded: 2
Yielded: 3
Generator done

--- Infinite Sequence ---
First 5 contact IDs: [ 'C-001', 'C-002', 'C-003', 'C-004', 'C-005' ]

--- Lazy Pipeline ---
Processing: Alice (active)
Processing: Charlie (vip)
Processed 2 contacts (skipped 1 inactive)
```

---

### Concept: The Iterator Protocol

**What it is:** JavaScript's iterator protocol is a contract: any object with
a `next()` method that returns `{ value: T, done: boolean }` is an iterator.
Any object with a `[Symbol.iterator]()` method that returns an iterator is
an *iterable* — usable with `for...of`, spread, and destructuring.

**The problem before:**

You can `for...of` over an array, a Map, or a Set. Why not over your own
domain objects? Without the iterator protocol, custom classes require a manual
index-based loop:

```ts
// Without iterator — access by index, requires knowing the length:
for (let i = 0; i < contactGroup.count(); i++) {
  process(contactGroup.getAt(i));
}
```

**The solution:**

Implement `[Symbol.iterator]()` on the class. Then `for...of` works natively:

```ts
for (const contact of contactGroup) {
  process(contact);  // no index math needed
}
```

**What it hides:** The iterator protocol hides the traversal mechanics.
The caller writes `for...of contact` and trusts that each iteration receives
the next item. How items are retrieved, stored, or computed is the iterator's
internal concern.

The invariant: `next()` must always return an object. Once `done` is `true`,
all subsequent calls also return `{ value: undefined, done: true }`. The
iterator is exhausted — re-using it yields nothing.

**Canonical example:** The iterator protocol is like a vending machine with a
"next" button. Each press gives you the next item. When the machine is empty,
pressing the button still returns a response (`done: true`) rather than crashing.
The machine manages what "next" means — you just press the button.

**Smallest possible example:**

```ts
// Manual iterator — rarely written by hand, but important to understand:
function rangeIterator(start: number, end: number) {
  let current = start;
  return {
    next(): IteratorResult<number> {
      if (current <= end) {
        return { value: current++, done: false };
      }
      return { value: undefined as unknown as number, done: true };
    }
  };
}

const iter = rangeIterator(1, 3);
console.log(iter.next()); // { value: 1, done: false }
console.log(iter.next()); // { value: 2, done: false }
console.log(iter.next()); // { value: 3, done: false }
console.log(iter.next()); // { value: undefined, done: true }
```

**You will see this again in:** `for...of`, spread (`[...iterable]`),
destructuring, `Array.from(iterable)`, `Promise.all([...iterable])`,
React's keys in lists (collections are iterated). Every built-in collection
in JavaScript implements this protocol. When you implement it on your domain
objects, they integrate seamlessly with all array utilities.

**Watch for:** `Symbol.iterator` is a well-known symbol — a special globally
unique symbol built into JavaScript for exactly this purpose. The method name
`[Symbol.iterator]` uses computed property syntax. Do not confuse it with a
string property called `'Symbol.iterator'`.

---

## Step 1 — Implement the Iterator Protocol

Create `generators.ts`:

```ts
console.log('--- Iterator Protocol ---');

// A class representing a range of contact name initials:
class ContactRange implements Iterable<string> {
  constructor(
    private readonly start: string,  // 'A'
    private readonly end:   string,  // 'D'
  ) {}

  // [Symbol.iterator] makes this class iterable — required by Iterable<T>:
  [Symbol.iterator](): Iterator<string> {
    let currentCode = this.start.charCodeAt(0);         // character code of 'A'
    const endCode   = this.end.charCodeAt(0);

    return {
      next(): IteratorResult<string> {
        if (currentCode <= endCode) {
          return {
            value: String.fromCharCode(currentCode++),  // 'A', 'B', ...
            done:  false,
          };
        }
        return { value: '', done: true };  // exhausted
      },
    };
  }
}

const range = new ContactRange('A', 'D');

// for...of works because ContactRange implements [Symbol.iterator]:
const letters: string[] = [];
for (const letter of range) {
  letters.push(letter);
}
console.log('Iterating ContactRange:', letters.join(', '));

// Spread also works:
console.log('Spread:', [...new ContactRange('X', 'Z')]);
```

### SAVE AND TRY

```bash
npx ts-node generators.ts
```

Expected:
```
--- Iterator Protocol ---
Iterating ContactRange: A, B, C, D
Spread: [ 'X', 'Y', 'Z' ]
```

**Change something:** Try destructuring: `const [first, second] = new ContactRange('P', 'T')`.
Log `first` and `second`. Expected: `'P'` and `'Q'`. Destructuring uses the
iterator protocol — it calls `next()` for each binding.

---

### Concept: Generators — Functions That Pause and Resume

**What it is:** A generator is a function declared with `function*` that can
pause execution at each `yield` expression, returning control to the caller,
and resume from the same point when `next()` is called again.

**The problem before:**

Implementing an iterator manually requires maintaining state explicitly —
a `current` variable, a return object, and careful logic:

```ts
// Manual iterator — verbose and error-prone:
function rangeIterator(start: number, end: number) {
  let current = start;
  return {
    next() {
      if (current <= end) return { value: current++, done: false as false };
      return { value: undefined as unknown as number, done: true as true };
    }
  };
}
```

**The solution:**

```ts
// Generator — the same logic, written as sequential code:
function* range(start: number, end: number): Generator<number> {
  for (let i = start; i <= end; i++) {
    yield i;  // pause here, return i to caller; resume on next next() call
  }
  // returning from the function signals done: true
}
```

**What it hides:** A generator hides the state machine that drives an iterator.
Without generators, you must manually track where "you are" in the sequence.
With generators, JavaScript's runtime manages the execution state — the function's
local variables, the current line — and resumes from exactly where it left off.

The invariant: a generator function, when called, returns a generator object.
The function body does not execute until `next()` is called. Each `yield`
suspends the function and produces a value. Returning from the function
(or reaching the end) sends `done: true`.

**Canonical example:** A generator is like a recipe with "pause" markers.
"Add flour, stir — PAUSE. Add eggs, stir — PAUSE. Bake for 30 minutes — DONE."
Each time you resume, the chef continues exactly where they left off.
The chef (the generator's runtime state) remembers exactly what was done.

**Smallest possible example:**
```ts
function* counter(): Generator<number> {
  let n = 1;
  while (true) {       // infinite loop is fine — yield controls when it pauses
    yield n++;         // pause, return n, increment n, wait for next()
  }
}

const gen = counter(); // body does NOT run yet
console.log(gen.next().value); // 1 — runs until first yield
console.log(gen.next().value); // 2 — resumes from after first yield
console.log(gen.next().value); // 3
// gen can yield forever — no memory issue, only one value exists at a time
```

**You will see this again in:** The G-code tokeniser (yields one token at a time
from the input string), streaming API responses, pagination (yield one page at
a time), any sequence that is expensive to compute all at once. Python, Ruby,
C#, and Kotlin all have generator equivalents. This is a foundational pattern.

**Watch for:** Calling a generator function returns a generator object — it does
not run the body. You must call `.next()` on the generator to start execution.
This surprises many developers on first encounter.

---

## Step 2 — Basic Generator

```ts
console.log('\n--- Generator Basics ---');

// A generator that yields three values and then stops:
function* threeValues(): Generator<number> {
  yield 1;   // pause, return 1
  yield 2;   // pause, return 2
  yield 3;   // pause, return 3
  // function ends — next() will return { value: undefined, done: true }
}

const gen = threeValues();  // body does NOT run here

console.log('Yielded:', gen.next().value);  // 1 — runs to first yield
console.log('Yielded:', gen.next().value);  // 2 — resumes, runs to second yield
console.log('Yielded:', gen.next().value);  // 3 — resumes, runs to third yield
console.log('Generator done:', gen.next().done); // true — function finished

// for...of also works — generators implement the iterator protocol:
for (const value of threeValues()) {
  console.log('Loop:', value);
}
```

### SAVE AND TRY

```bash
npx ts-node generators.ts
```

Expected:
```
--- Generator Basics ---
Yielded: 1
Yielded: 2
Yielded: 3
Generator done: true
Loop: 1
Loop: 2
Loop: 3
```

**Change something:** Add `console.log('before yield 2')` between the two yields.
Run again. Confirm that "before yield 2" appears only after the second `next()`
call — the generator paused before reaching it.

---

### Concept: Infinite Generators and `yield*`

**What it is:** Generators can yield forever — a `while (true)` loop with
`yield` is safe because execution only resumes when `next()` is called.
`yield*` delegates to another iterable, yielding all its values before continuing.

**Infinite generators:**
```ts
function* naturals(): Generator<number> {
  let n = 0;
  while (true) { yield n++; }  // never ends — caller decides when to stop
}
```

This is memory-efficient: only the current value exists. An array of 1 billion
numbers would require gigabytes of RAM. The generator uses constant memory.

**`yield*`:** Delegates to another iterable:
```ts
function* combined(): Generator<number> {
  yield* [1, 2, 3];      // yield all items from the array
  yield* naturals();     // then yield all items from another generator
}
```

**Canonical example:** An infinite generator is like a running tap —
water flows only when you hold a glass under it. Holding the glass briefly
gives you a small amount. The water supply is conceptually infinite, but
you only take what you need.

**Smallest possible example:**
```ts
function* ids(prefix: string): Generator<string> {
  let n = 1;
  while (true) {
    yield `${prefix}-${String(n++).padStart(3, '0')}`; // 'C-001', 'C-002', ...
  }
}

// Take first N values from an infinite generator:
function take<T>(count: number, gen: Generator<T>): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    const { value, done } = gen.next();
    if (done) break;
    result.push(value);
  }
  return result;
}

console.log(take(3, ids('C'))); // ['C-001', 'C-002', 'C-003']
```

**You will see this again in:** Auto-generating IDs, paginating through a
data source one page at a time, the G-code tokeniser (infinite loop that
yields tokens until the input is consumed), any streaming data source.

**Watch for:** Spreading an infinite generator (`[...infiniteGen()]`) causes
an infinite loop that fills memory. Always use `take()` or a `for` loop with
a break condition when consuming infinite generators.

---

## Step 3 — Infinite ID Generator and `yield*`

```ts
console.log('\n--- Infinite Sequence ---');

// Infinite generator — yields contact IDs forever:
function* contactIds(prefix: string = 'C'): Generator<string> {
  let n = 1;
  while (true) {
    yield `${prefix}-${String(n++).padStart(3, '0')}`;
  }
}

// Helper — take exactly N values from any generator:
function take<T>(count: number, generator: Generator<T>): T[] {
  const result: T[] = [];
  for (const value of generator) {
    result.push(value);
    if (result.length >= count) break;
  }
  return result;
}

const firstFive = take(5, contactIds());
console.log('First 5 contact IDs:', firstFive);

// yield* — compose generators:
function* allContactIds(): Generator<string> {
  yield* contactIds('C');  // regular contacts
  // (never reaches this because contactIds is infinite — but the pattern is valid)
}
```

### SAVE AND TRY

```bash
npx ts-node generators.ts
```

Expected:
```
--- Infinite Sequence ---
First 5 contact IDs: [ 'C-001', 'C-002', 'C-003', 'C-004', 'C-005' ]
```

**Change something:** Create a finite generator that yields `['A-001', 'A-002']`
using `yield*` on an array, then `yield* contactIds('B')` for more:
```ts
function* combined() {
  yield* ['A-001', 'A-002'];
  yield* contactIds('B');
}
console.log(take(5, combined()));
// ['A-001', 'A-002', 'B-001', 'B-002', 'B-003']
```

---

### Concept: Lazy Pipelines — Processing Without Loading Everything

**What it is:** A generator-based pipeline processes elements one at a time.
Each stage is a generator that receives items from the previous stage and
yields transformed or filtered items to the next stage. The full dataset is
never held in memory simultaneously.

**The problem before:**

```ts
// Eager pipeline — loads everything into memory at each stage:
const contacts = fetchAllContacts();                 // 1M contacts in memory
const active   = contacts.filter(c => c.isActive);  // another 500K in memory
const vip      = active.filter(c => c.isVip);       // another 250K
const names    = vip.map(c => c.name);              // another 250K
// Peak memory: all four arrays exist simultaneously
```

**The solution (generator pipeline):**

```ts
function* filterActive(contacts: Iterable<Contact>) {
  for (const c of contacts) {
    if (c.isActive) yield c;  // only active contacts pass through
  }
}

function* filterVip(contacts: Iterable<Contact>) {
  for (const c of contacts) {
    if (c.isVip) yield c;
  }
}

// Compose: lazily filter through both stages:
for (const contact of filterVip(filterActive(allContacts))) {
  // Only one contact exists in memory at a time
  process(contact);
}
```

**Canonical example:** A factory assembly line with inspection stations.
Each station processes one car at a time — it does not wait for all cars
to arrive before starting. If a car fails inspection, it is removed and the
next car comes through. Only one car is at each station at any moment.

**You will see this again in:** The G-code tokeniser → parser pipeline (tokens
flow from tokeniser to parser one at a time), reading large log files, processing
database result sets that are too large to load entirely.

---

## Step 4 — Lazy Pipeline

```ts
console.log('\n--- Lazy Pipeline ---');

interface Contact { name: string; isActive: boolean; isVip: boolean; }

const allContacts: Contact[] = [
  { name: 'Alice',   isActive: true,  isVip: false },
  { name: 'Bob',     isActive: false, isVip: true  }, // inactive — skipped
  { name: 'Charlie', isActive: true,  isVip: true  },
];

// Generator stage 1: filter active contacts:
function* activeContacts(contacts: Iterable<Contact>): Generator<Contact> {
  for (const contact of contacts) {
    if (contact.isActive) {
      yield contact;  // only active contacts pass through
    }
  }
}

// Generator stage 2: filter VIP among those:
function* vipContacts(contacts: Iterable<Contact>): Generator<Contact> {
  for (const contact of contacts) {
    if (contact.isVip) {
      yield contact;
    }
  }
}

// Compose the pipeline — lazy: no work until the for...of starts:
const pipeline = vipContacts(activeContacts(allContacts));

let count = 0;
for (const contact of pipeline) {
  console.log(`Processing: ${contact.name} (${contact.isVip ? 'vip' : 'active'})`);
  count++;
}

console.log(`Processed ${count} contacts (skipped ${allContacts.length - count} inactive)`);
```

### SAVE AND TRY

```bash
npx ts-node generators.ts
```

Expected:
```
--- Lazy Pipeline ---
Processing: Alice (active)
Processing: Charlie (vip)
Processed 2 contacts (skipped 1 inactive)
```

**Change something:** Add `console.log('checking:', contact.name)` inside
`activeContacts` to see the order. You will see "checking: Alice", then "Processing: Alice",
then "checking: Bob" (skipped), then "checking: Charlie", then "Processing: Charlie".
Items flow through the full pipeline one at a time — there is no intermediate array.

---

## 🎯 Challenge: Paginated Generator

**You know:** Generators, infinite sequences, lazy pipelines.

**Task:** Write a generator `paginatedContacts(pageSize: number)` that simulates
fetching contacts from an API one page at a time. Each "fetch" produces `pageSize`
contacts with auto-generated IDs. The generator should be infinite — it keeps
fetching until the caller stops consuming.

Then write a `take` helper and demonstrate fetching the first 7 contacts from
pages of 3.

Expected output:
```
Page 1: C-001, C-002, C-003
Page 2: C-004, C-005, C-006
Page 3 (partial): C-007
Total yielded: 7
```

**Requirements:**
- The generator yields individual contacts, not pages
- Each "page" is logged when it starts being fetched
- `take` must work to stop after 7 items without fetching more pages than needed

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function* paginatedContacts(pageSize: number): Generator<string> {
  let pageNumber = 1;
  let contactNumber = 1;

  while (true) {
    // Simulate fetching a page:
    console.log(`Page ${pageNumber}:`);
    const page: string[] = [];
    for (let i = 0; i < pageSize; i++) {
      page.push(`C-${String(contactNumber++).padStart(3, '0')}`);
    }
    pageNumber++;

    // Yield each item from the page:
    yield* page;
  }
}

function take<T>(count: number, gen: Generator<T>): T[] {
  const result: T[] = [];
  for (const value of gen) {
    result.push(value);
    if (result.length >= count) break;
  }
  return result;
}

const contacts2 = take(7, paginatedContacts(3));
console.log('Total yielded:', contacts2.length);
console.log('IDs:', contacts2.join(', '));
```

**Key insight:** `yield* page` inside the generator yields all items from the
page array before the outer `while` loop fetches the next page. The `take`
function's `break` exits the `for...of` loop, which causes the generator to stop.
Even though `paginatedContacts` is an infinite loop, it stops as soon as
nothing is consuming its values — no more pages are fetched after the 7th contact.
This is the laziness guarantee: work only happens when values are consumed.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| `[Symbol.iterator]` enables `for...of` | Implement it on a class, use `for...of` | Works without error |
| Generator body defers execution | Log before first `yield`, call the function | Nothing logged until `next()` |
| Generators are iterables | `[...threeValues()]` | `[1, 2, 3]` |
| Infinite generator is memory-safe | `take(5, counter())` | `[0,1,2,3,4]` — no crash |
| `yield*` delegates | `yield* [1,2,3]` inside a generator | Yields 1, then 2, then 3 |
| Pipeline is lazy | Add logging inside filter generators | Items flow one-at-a-time |

---

## Quick Check Answers

**1. What do arrays, strings, Maps, and Sets have in common for `for...of`?**

They all implement the iterable protocol — they have a `[Symbol.iterator]()`
method that returns an iterator object. The `for...of` loop calls
`[Symbol.iterator]()` on the collection to get an iterator, then calls
`iterator.next()` on each iteration until `done` is `true`. Any object
implementing this protocol works with `for...of`, spread (`[...iterable]`),
and destructuring.

**2. Does calling a generator function execute its body?**

No. Calling `myGenerator()` returns a generator object immediately — the body
does not run. The body only starts executing when `next()` is first called
(or when the generator is used in `for...of`). Each `yield` pauses execution
and returns `{ value, done: false }`. The function returns `{ value: undefined, done: true }`
when it exits. This deferred execution is what makes lazy evaluation possible.

**3. How much memory does a generator yielding 1 billion numbers use?**

Constant memory — approximately the same as a single number variable. A generator
stores only its current execution state: the values of its local variables and
the current position in the function body. It does not materialise the sequence
it represents. An array of 1 billion numbers would require about 8 GB of RAM.
The generator producing those same billion numbers uses a few bytes. This is
the core advantage of generators over arrays for large or infinite sequences.
