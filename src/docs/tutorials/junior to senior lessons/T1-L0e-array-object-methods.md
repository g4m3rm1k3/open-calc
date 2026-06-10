# Junior to Senior — T1·L0e — Comprehensive Array and Object Methods

**Prerequisites:** T1·L0d (Map, Set, WeakMap, WeakSet). You know the purpose
of each collection type. This lesson covers the full range of built-in array
and object utility methods that appear in every real codebase.

**What this lab adds:**
- `find`, `findIndex`, `findLast`, `findLastIndex` — locating elements
- `some`, `every` — testing conditions across a collection
- `flat`, `flatMap` — working with nested arrays
- `Array.from`, `Array.isArray`, `at(-1)` — creation and safe access
- `Object.entries`, `Object.keys`, `Object.values`, `Object.fromEntries`
- `structuredClone` — proper deep cloning

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have an array of contacts. You want the first one where `isActive` is `true`.
>    What method gives you the element itself? What method gives you its position?
> 2. `[1, [2, [3]]].flat()` — what does this produce?
>    `[1, [2, [3]]].flat(Infinity)` — what does this produce?
> 3. What is the difference between `{ ...obj }` and `structuredClone(obj)`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contacts processing pipeline that uses a different method at each stage:

```
$ node array-methods.js

--- Finding Elements ---
First active: Alice (index 0)
Last active:  Eve (index 4)
First inactive: Carol (index 2)

--- Condition Testing ---
All contacts have email: true
Any VIP contacts: true

--- Nested Data ---
All tags: [ 'vip', 'newsletter', 'priority', 'inactive', 'newsletter' ]
Unique tags: [ 'vip', 'newsletter', 'priority', 'inactive' ]

--- Object Methods ---
Names:  [ 'Alice', 'Bob', 'Carol' ]
Cities: [ 'London', 'Paris', 'Berlin' ]
Swapped: { London: 'Alice', Paris: 'Bob', Berlin: 'Carol' }

--- Safe Cloning ---
Original city: London
Clone city:    Paris   ← clone changed
Original city: London  ← original unchanged (deep clone)
```

---

### Concept: `find` and `findIndex` — Locating the First Match

**What it is:** `find` returns the first element that satisfies a predicate
function. `findIndex` returns its index. Both return `undefined` / `-1` if
no element matches.

**The problem before:**
```js
// Manual loop to find the first active contact:
let firstActive;
let firstActiveIndex = -1;
for (let i = 0; i < contacts.length; i++) {
  if (contacts[i].isActive) {
    firstActive = contacts[i];
    firstActiveIndex = i;
    break;
  }
}
```

**The solution:**
```js
const firstActive      = contacts.find(c => c.isActive);
const firstActiveIndex = contacts.findIndex(c => c.isActive);
```

**Canonical example:** `find` is like asking a librarian "find me the first
book by this author." They return the book. `findIndex` is asking "what shelf
number is it on?" They return the location. The librarian stops at the first
match — they do not scan the entire library.

**Smallest possible example:**
```js
const nums   = [3, 7, 2, 9, 4];
const first  = nums.find(n => n > 5);       // 7
const index  = nums.findIndex(n => n > 5);  // 1
const missing = nums.find(n => n > 100);    // undefined
```

**You will see this again in:** Finding a user by ID in a list, finding the
first error in a validation result, finding the first element matching a user's
search query. `find` replaces `filter()[0]` — it is more efficient because it
stops at the first match.

**Watch for:** `find` returns the element, not a copy. Mutating the returned
object mutates the original array element. Use spread to get a safe copy:
`{ ...contacts.find(c => c.id === id) }`.

---

## Step 1 — Finding Elements

Create `array-methods.js`:

```js
console.log('--- Finding Elements ---');

const contacts = [
  { name: 'Alice', isActive: true,  city: 'London' },
  { name: 'Bob',   isActive: true,  city: 'Paris'  },
  { name: 'Carol', isActive: false, city: 'Berlin' },
  { name: 'Diana', isActive: false, city: 'Rome'   },
  { name: 'Eve',   isActive: true,  city: 'Madrid' },
];

// find — first element matching the condition:
const firstActive      = contacts.find(c => c.isActive);
const firstActiveIndex = contacts.findIndex(c => c.isActive);

// findLast — last element matching (searches from the end):
const lastActive      = contacts.findLast(c => c.isActive);
const lastActiveIndex = contacts.findLastIndex(c => c.isActive);

// findIndex returns -1 when nothing matches:
const firstInactive      = contacts.find(c => !c.isActive);
const firstInactiveIndex = contacts.findIndex(c => !c.isActive);

console.log(`First active: ${firstActive.name} (index ${firstActiveIndex})`);
console.log(`Last active:  ${lastActive.name} (index ${lastActiveIndex})`);
console.log(`First inactive: ${firstInactive.name} (index ${firstInactiveIndex})`);
```

### SAVE AND TRY

```bash
node array-methods.js
```

Expected:
```
--- Finding Elements ---
First active: Alice (index 0)
Last active:  Eve (index 4)
First inactive: Carol (index 2)
```

**Change something:** Try `contacts.find(c => c.city === 'Atlantis')`.
Expected: `undefined`. Then try `contacts.findIndex(c => c.city === 'Atlantis')`.
Expected: `-1`. This is the "not found" signal for each method.

---

### Concept: `some` and `every` — Testing Conditions Across a Collection

**What it is:** `some` returns `true` if *at least one* element satisfies the
predicate. `every` returns `true` only if *all* elements satisfy it. Both
short-circuit: `some` stops at the first match, `every` stops at the first failure.

**The problem before:**
```js
let hasVip = false;
for (const c of contacts) {
  if (c.isVip) { hasVip = true; break; }
}

let allHaveEmail = true;
for (const c of contacts) {
  if (!c.email) { allHaveEmail = false; break; }
}
```

**The solution:**
```js
const hasVip      = contacts.some(c => c.isVip);
const allHaveEmail = contacts.every(c => !!c.email);
```

**Canonical example:** `some` is like a security scan — you are looking for
any problem. Finding one is enough to fail. `every` is like a quality check —
every item must pass for the batch to be approved.

**Smallest possible example:**
```js
const scores = [85, 92, 78, 95, 60];
console.log(scores.some(s => s >= 90));  // true — at least one is 90+
console.log(scores.every(s => s >= 60)); // true — all are 60+
console.log(scores.every(s => s >= 80)); // false — 60 fails
```

**You will see this again in:** Form validation ("is any field invalid?"),
permission checks ("does the user have all required permissions?"), data
integrity checks ("do all records have a required field?").

**Watch for:** `[].some(pred)` returns `false` — no elements means no matches.
`[].every(pred)` returns `true` — vacuous truth, because there are no elements
that fail. This is mathematically correct but can surprise.

---

## Step 2 — Condition Testing

```js
console.log('\n--- Condition Testing ---');

const contactsWithData = [
  { name: 'Alice', email: 'alice@example.com', isVip: true  },
  { name: 'Bob',   email: 'bob@example.com',   isVip: false },
  { name: 'Carol', email: 'carol@example.com', isVip: false },
];

// every — ALL must satisfy the condition:
const allHaveEmail = contactsWithData.every(c => !!c.email);

// some — AT LEAST ONE must satisfy:
const anyVip = contactsWithData.some(c => c.isVip);

// Practical: validate required fields before submitting:
const isFormValid = contactsWithData.every(c => c.name && c.email);

console.log('All contacts have email:', allHaveEmail);
console.log('Any VIP contacts:', anyVip);
console.log('All records valid:', isFormValid);
```

### SAVE AND TRY

```bash
node array-methods.js
```

Expected:
```
--- Condition Testing ---
All contacts have email: true
Any VIP contacts: true
All records valid: true
```

**Change something:** Remove `email` from Carol. Run again.
`allHaveEmail` and `isFormValid` should now be `false`. Both `every` calls
stop at Carol — they do not process the rest of the array.

---

### Concept: `flat` and `flatMap` — Working with Nested Arrays

**What it is:** `flat(depth)` creates a new array by flattening nested arrays
up to `depth` levels deep. `flatMap(fn)` maps each element and then flattens
one level — equivalent to `.map(fn).flat(1)` but in a single pass.

**The problem before:**
```js
// Each contact has multiple tags — you want all tags as a flat list:
const allTags = contacts.reduce((acc, c) => acc.concat(c.tags), []);
// Verbose, requires understanding reduce to read.
```

**The solution:**
```js
const allTags = contacts.flatMap(c => c.tags);
// Reads: "for each contact, expand its tags — flatten one level"
```

**Canonical example:** `flatMap` is like unpacking parcels. Each parcel (contact)
contains multiple items (tags). You open every parcel and lay the items on the
table — you get one flat pile, not a pile of open parcels.

**Smallest possible example:**
```js
const nested = [[1, 2], [3, 4], [5, 6]];
console.log(nested.flat());    // [1, 2, 3, 4, 5, 6] — one level
console.log([[1,[2]],[3]].flat());        // [1, [2], 3] — one level only
console.log([[1,[2]],[3]].flat(Infinity)); // [1, 2, 3] — all levels

const sentences = ['Hello world', 'Good morning'];
const words = sentences.flatMap(s => s.split(' '));
// ['Hello', 'world', 'Good', 'morning']
```

**You will see this again in:** Extracting all items from grouped data
(messages from all conversations, items from all orders, tags from all posts),
expanding one-to-many relationships into flat lists.

**Watch for:** `flat()` with no argument flattens exactly one level.
`flat(Infinity)` flattens completely. Forgetting the depth argument when
you have two levels of nesting is a common mistake.

---

## Step 3 — Nested Data with `flat` and `flatMap`

```js
console.log('\n--- Nested Data ---');

const taggedContacts = [
  { name: 'Alice', tags: ['vip', 'newsletter'] },
  { name: 'Bob',   tags: ['priority', 'inactive'] },
  { name: 'Carol', tags: ['newsletter'] },
];

// flatMap: expand each contact's tags into a flat array:
const allTags = taggedContacts.flatMap(c => c.tags);

// Deduplicate with Set + spread:
const uniqueTags = [...new Set(allTags)];

console.log('All tags:', allTags);
console.log('Unique tags:', uniqueTags);
```

### SAVE AND TRY

```bash
node array-methods.js
```

Expected:
```
--- Nested Data ---
All tags: [ 'vip', 'newsletter', 'priority', 'inactive', 'newsletter' ]
Unique tags: [ 'vip', 'newsletter', 'priority', 'inactive' ]
```

**Change something:** Replace `flatMap(c => c.tags)` with `map(c => c.tags)`.
The result is `[['vip','newsletter'], ['priority','inactive'], ['newsletter']]`
— an array of arrays, not flattened. Then add `.flat()` after the `map`.
The result is identical to `flatMap`. `flatMap` is just the efficient one-pass version.

---

### Concept: Object Methods — `entries`, `keys`, `values`, `fromEntries`

**What it is:** Four static methods on `Object` that convert between an object
and arrays, allowing you to use array methods on object data.

**The methods:**
- `Object.keys(obj)` — array of own enumerable property names
- `Object.values(obj)` — array of own enumerable property values
- `Object.entries(obj)` — array of `[key, value]` pairs
- `Object.fromEntries(entries)` — inverse of `entries`; creates an object from pairs

**The problem before:**
```js
// Transform all values of an object — no built-in method:
const result = {};
for (const key of Object.keys(obj)) {
  result[key] = transform(obj[key]);
}
```

**The solution:**
```js
// Map over entries, reconstruct:
const result = Object.fromEntries(
  Object.entries(obj).map(([key, value]) => [key, transform(value)])
);
```

**Canonical example:** `Object.entries` is like pulling all the drawers out of
a filing cabinet and laying them on a table as labeled pairs. `Object.fromEntries`
is putting them back. In between, you can sort, filter, or transform them with
array methods — which objects have no equivalent for.

**Smallest possible example:**
```js
const person = { name: 'Alice', age: 30, city: 'London' };

Object.keys(person);    // ['name', 'age', 'city']
Object.values(person);  // ['Alice', 30, 'London']
Object.entries(person); // [['name','Alice'], ['age',30], ['city','London']]

// Filter to only string values:
const stringsOnly = Object.fromEntries(
  Object.entries(person).filter(([, value]) => typeof value === 'string')
);
// { name: 'Alice', city: 'London' }
```

**You will see this again in:** Every time you need to transform an object
(apply a function to every value), filter an object's properties, or convert
between objects and arrays. Also the foundation of `Map` ↔ object conversion.

**Watch for:** `Object.keys` only returns *own enumerable* properties.
It does not include inherited properties (from the prototype). This is almost
always what you want, but know that it can miss properties set with
`Object.defineProperty(..., { enumerable: false })`.

---

## Step 4 — Object Methods

```js
console.log('\n--- Object Methods ---');

const cityByName = {
  Alice: 'London',
  Bob:   'Paris',
  Carol: 'Berlin',
};

// Extract just the names and cities as arrays:
const names  = Object.keys(cityByName);
const cities = Object.values(cityByName);

console.log('Names: ', names);
console.log('Cities:', cities);

// Invert the object — swap keys and values:
const nameByCity = Object.fromEntries(
  Object.entries(cityByName).map(([name, city]) => [city, name])
);

console.log('Swapped:', nameByCity);
```

### SAVE AND TRY

```bash
node array-methods.js
```

Expected:
```
--- Object Methods ---
Names:  [ 'Alice', 'Bob', 'Carol' ]
Cities: [ 'London', 'Paris', 'Berlin' ]
Swapped: { London: 'Alice', Paris: 'Bob', Berlin: 'Carol' }
```

**Change something:** Add a `map` step that uppercases all city names before
passing to `fromEntries`: `.map(([name, city]) => [city.toUpperCase(), name])`.
Expected: `{ LONDON: 'Alice', PARIS: 'Bob', BERLIN: 'Carol' }`.

---

### Concept: `Array.from`, `at()`, and `structuredClone`

**`Array.from(iterable, mapFn)`** — creates an array from any iterable or
array-like object. The optional `mapFn` is applied to each element.

**`array.at(index)`** — accesses an element by index, with negative indexing:
`at(-1)` is the last element, `at(-2)` is second-to-last. Equivalent to
`arr[arr.length - 1]` but readable and not length-dependent.

**`structuredClone(value)`** — creates a deep clone of an object. Unlike
spread (`{ ...obj }`), nested objects are also copied — not shared references.

**The problems before:**
```js
const last = contacts[contacts.length - 1];     // verbose
const copy = JSON.parse(JSON.stringify(obj));    // the old deep clone hack — loses Dates, undefined, functions
```

**The solutions:**
```js
const last = contacts.at(-1);         // clean
const copy = structuredClone(obj);    // proper deep clone; preserves Dates, Sets, Maps
```

**Smallest possible examples:**
```js
// Array.from:
const letters = Array.from('hello');         // ['h','e','l','l','o']
const squares = Array.from({length: 5}, (_, i) => i * i); // [0,1,4,9,16]
const fromSet = Array.from(new Set([1,2,3])); // [1,2,3]

// at():
const items = ['a', 'b', 'c', 'd'];
console.log(items.at(-1));  // 'd'
console.log(items.at(-2));  // 'c'

// structuredClone:
const original = { name: 'Alice', address: { city: 'London' } };
const clone    = structuredClone(original);
clone.address.city = 'Paris';
console.log(original.address.city); // 'London' — unaffected
```

**You will see this again in:** `Array.from` is used to convert `NodeList`
(DOM query results), `Set`, `Map`, `arguments`, and generator outputs to arrays.
`at(-1)` replaces `arr[arr.length - 1]` everywhere. `structuredClone` is used
whenever you need a safe copy of nested data before modifying it.

**Watch for:** `structuredClone` cannot clone functions or class instances
(the class prototype is not preserved). For those cases, you need a manual
copy or a library. Also, `at()` with an index beyond the array returns
`undefined`, not an error.

---

## Step 5 — `Array.from`, `at()`, and `structuredClone`

```js
console.log('\n--- Safe Cloning ---');

const contact = {
  name: 'Alice',
  address: { city: 'London' },
  tags: ['vip', 'newsletter'],
};

// Spread — SHALLOW copy:
const shallowCopy = { ...contact };
shallowCopy.address.city = 'Paris';  // changes the shared address object!
console.log('After shallow copy modification:');
console.log('Original city:', contact.address.city);     // 'Paris' — affected!
contact.address.city = 'London';                          // reset for next demo

// structuredClone — DEEP copy:
const deepCopy = structuredClone(contact);
deepCopy.address.city = 'Paris';     // modifies only the clone
console.log('\nAfter deep clone modification:');
console.log('Original city:', contact.address.city); // 'London' — safe!
console.log('Clone city:   ', deepCopy.address.city); // 'Paris'

// at() for last element:
const lastTag = contact.tags.at(-1);
console.log('\nLast tag:', lastTag);  // 'newsletter'

// Array.from to generate a sequence:
const indices = Array.from({ length: 5 }, (_, i) => i + 1);
console.log('Sequence:', indices);  // [1, 2, 3, 4, 5]
```

### SAVE AND TRY

```bash
node array-methods.js
```

Expected:
```
--- Safe Cloning ---
After shallow copy modification:
Original city: Paris   ← shallow copy mutated the original!

After deep clone modification:
Original city: London  ← deep clone left the original safe
Clone city:    Paris

Last tag: newsletter
Sequence: [ 1, 2, 3, 4, 5 ]
```

**Change something:** Try `JSON.parse(JSON.stringify(contact))` instead of
`structuredClone`. Add a `Date` field to `contact`: `createdAt: new Date()`.
With `structuredClone`, the cloned date is a real `Date` object. With
`JSON.parse(JSON.stringify(...))`, it becomes a string. `structuredClone` is
strictly better for modern code.

---

## 🎯 Challenge: Pipeline of Array Methods

**You know:** `find`, `some`, `every`, `flatMap`, `Object.entries`, `Object.fromEntries`.

**Task:** Write a function `processContacts(contacts)` that, in a single pipeline
(chained method calls), produces an object mapping city to count of active VIP contacts
in that city. Use no `for` loops, no manual `if` statements, and no intermediate
`let` variables — only method chains.

```js
const contacts = [
  { name: 'Alice', city: 'London', isActive: true,  isVip: true  },
  { name: 'Bob',   city: 'Paris',  isActive: true,  isVip: false },
  { name: 'Carol', city: 'London', isActive: false, isVip: true  },
  { name: 'Diana', city: 'London', isActive: true,  isVip: true  },
  { name: 'Eve',   city: 'Paris',  isActive: true,  isVip: true  },
];

processContacts(contacts);
// { London: 2, Paris: 1 }
// (Alice and Diana are active VIPs in London; Carol is inactive; Eve is active VIP in Paris)
```

**Hint:** Filter first, then reduce or use `Object.fromEntries` + `Map`.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
function processContacts(contacts) {
  // Step 1: keep only active VIPs
  // Step 2: count by city using reduce into a Map
  // Step 3: convert the Map to a plain object
  const cityMap = contacts
    .filter(c => c.isActive && c.isVip)
    .reduce((map, c) => {
      map.set(c.city, (map.get(c.city) ?? 0) + 1);
      return map;
    }, new Map());

  return Object.fromEntries(cityMap);
}

console.log(processContacts(contacts));
// { London: 2, Paris: 1 }
```

**Key insight:** Chaining `filter` + `reduce` creates a pipeline where each
step has a single clear job: filter removes noise, reduce accumulates the result.
The `Map` inside `reduce` gives O(1) per-city updates. `Object.fromEntries`
converts the final Map to a plain object for output. No loop body ever exceeds
one concept.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| `find` vs `filter` | `[1,2,3].find(n=>n>1)` vs `[1,2,3].filter(n=>n>1)` | `2` vs `[2,3]` |
| `findIndex` for missing | `[1,2,3].findIndex(n=>n>10)` | `-1` |
| `some` short-circuits | Add `console.log` in predicate and `some` | Logs stop at first match |
| `flatMap` vs `map` | `[[1],[2],[3]].flatMap(a=>a)` | `[1,2,3]` not `[[1],[2],[3]]` |
| `at(-1)` | `['a','b','c'].at(-1)` | `'c'` |
| `structuredClone` | Deep clone, mutate, check original | Original unchanged |
| `Object.fromEntries` | `Object.fromEntries([['a',1]])` | `{a:1}` |

---

## Quick Check Answers

**1. `find` vs `findIndex` for the first active contact?**

`find` returns the element itself — the entire contact object. Use it when you
need to work with the contact. `findIndex` returns the index (position) in the
array. Use it when you need to know where the contact is so you can update or
remove it. `filter` returns ALL matches as a new array; `find` returns the
first match only and stops scanning.

**2. `flat()` vs `flat(Infinity)`?**

`[1, [2, [3]]].flat()` → `[1, 2, [3]]`. With no argument, `flat()` defaults
to depth `1` — it removes one level of nesting. The inner `[3]` remains nested.
`[1, [2, [3]]].flat(Infinity)` → `[1, 2, 3]`. `Infinity` means "flatten all
levels regardless of depth." Use `flat()` for one level; `flat(Infinity)` for
completely nested structures of unknown depth.

**3. `{ ...obj }` vs `structuredClone(obj)`?**

Spread (`{ ...obj }`) creates a *shallow* copy — it copies the top-level
properties, but nested objects are shared references. Modifying `copy.address.city`
also modifies `original.address.city` because both point to the same `address` object.

`structuredClone(obj)` creates a *deep* copy — every nested object is also cloned.
`copy.address` is a new object; modifying it does not affect `original.address`.
`structuredClone` also correctly handles `Date` objects, `Set`, `Map`, `ArrayBuffer`,
and circular references — `JSON.parse(JSON.stringify(...))` does not.
