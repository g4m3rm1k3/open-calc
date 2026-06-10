# Junior to Senior — T1·L0d — Map, Set, WeakMap, WeakSet

**Prerequisites:** T1·L0c (Closures and `this` Binding). You understand
reference types and closures. This lesson covers the four collection types
that JavaScript provides beyond arrays and plain objects.

**What this lab adds:**
- `Map<K, V>` — a key-value store where keys can be any type
- `Set<T>` — a collection with no duplicates and O(1) membership testing
- When to choose `Map` over a plain object and `Set` over an array
- `WeakMap` and `WeakSet` — memory-safe collections for object keys

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You need to count how many times each city appears in a contacts list.
>    Would you use a plain object or a `Map`? Why might they differ?
> 2. You have an array of 10,000 contacts and need to check if a specific
>    email is in the list. What is the time complexity of `array.includes()`?
>    What about `set.has()`?
> 3. What happens to a `WeakMap` entry when the key object is garbage-collected?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ node collections.js

--- Map: City Counts ---
London: 3
Paris: 2
Berlin: 1

--- Set: Unique Emails ---
Unique emails: 4 (from 6 contacts, 2 duplicates removed)

--- Set Operations ---
In both lists: alice@example.com, charlie@example.com
Only in list A: bob@example.com
Only in list B: diana@example.com

--- WeakMap: Private Data ---
Alice's access level: admin
After deletion — memory released (entry no longer accessible)
```

---

### Concept: `Map<K, V>` — A Key-Value Store for Any Key Type

**What it is:** A `Map` is a collection of key-value pairs where keys can be
any type — not just strings — and insertion order is preserved. It has a clean
API for size, iteration, and existence checking.

**The problem before:**

Plain objects work as dictionaries, but they have problems:

```js
// Problem 1: all keys become strings
const counts = {};
counts[1]    = 'one';
counts['1']  = 'also one';  // overwrites! — 1 and '1' are the same key
console.log(counts);         // { '1': 'also one' }

// Problem 2: checking size requires Object.keys()
const size = Object.keys(counts).length;  // verbose

// Problem 3: cannot use objects as keys
const contactObj = { name: 'Alice' };
counts[contactObj] = 'some value';
// key becomes '[object Object]' — useless
```

**The solution:**
```js
const map = new Map();
map.set(1, 'one');
map.set('1', 'also one');  // different key! 1 !== '1'
console.log(map.size);     // 2
```

**What it hides:** `Map` hides the type coercion that plain objects apply to keys.
It also hides the size-counting ceremony (`Object.keys(obj).length`) behind a
simple `.size` property.

The invariant: `Map` preserves key identity. `1` and `'1'` are distinct keys.
An object used as a key is compared by reference — the exact same object.

**Canonical example:** A `Map` is like a coat check with numbered tickets.
Each item gets its own unique hook, and the hook number is preserved exactly —
not converted to a different type. A plain object is like a coat check that
writes all ticket numbers as strings, so ticket 1 and ticket "1" are the same hook.

**Smallest possible example:**
```js
const map = new Map();
map.set('name', 'Alice');
map.set(42, 'the answer');
map.set(true, 'yes');

console.log(map.get('name'));  // 'Alice'
console.log(map.get(42));      // 'the answer'
console.log(map.size);         // 3
console.log(map.has(42));      // true
map.delete(42);
console.log(map.has(42));      // false
```

**You will see this again in:** Caching (map a request URL to its cached response),
counting occurrences (map a word to its count), graph adjacency lists (map a node
to its neighbours), any situation where the key is not a string. The docking
library used `Map<string, THREE.Line>` to track Three.js line objects by ID.

**Watch for:** `Map` is not JSON-serialisable. `JSON.stringify(map)` gives `{}`.
If you need to send a `Map` over HTTP, convert it: `Object.fromEntries(map)`.

---

## Step 1 — Count Cities with a Map

Create `collections.js`:

```js
console.log('--- Map: City Counts ---');

const contacts = [
  { name: 'Alice',   city: 'London' },
  { name: 'Bob',     city: 'Paris'  },
  { name: 'Charlie', city: 'London' },
  { name: 'Diana',   city: 'Berlin' },
  { name: 'Eve',     city: 'Paris'  },
  { name: 'Frank',   city: 'London' },
];

// Count how many contacts live in each city:
const cityCounts = new Map();

contacts.forEach(contact => {
  // get current count, default to 0 if city not yet seen:
  const currentCount = cityCounts.get(contact.city) ?? 0;
  cityCounts.set(contact.city, currentCount + 1);
});

// Iterate in insertion order:
for (const [city, count] of cityCounts) {
  console.log(`${city}: ${count}`);
}
```

### SAVE AND TRY

```bash
node collections.js
```

Expected:
```
--- Map: City Counts ---
London: 3
Paris: 2
Berlin: 1
```

**Change something:** Try the same with a plain object: `const cityCounts = {}`,
then `cityCounts[contact.city] = (cityCounts[contact.city] ?? 0) + 1`.
The result is identical for string keys. Now try adding a contact with a non-string
city: `{ name: 'Ghost', city: 42 }`. With the plain object, the key becomes `'42'`
(a string). With the `Map`, `42` stays a number. Run both and compare.

---

### Concept: `Set<T>` — Unique Values with O(1) Membership Testing

**What it is:** A `Set` is a collection of unique values. Duplicate inserts are
ignored. Membership testing (`has`) runs in O(1) — constant time regardless of
the set's size.

**The problem before:**

```js
// Deduplication with an array:
const seen = [];
const unique = contacts.filter(c => {
  if (seen.includes(c.email)) return false;  // O(n) search on every check!
  seen.push(c.email);
  return true;
});
```

For 10,000 contacts, `seen.includes()` scans up to 10,000 elements on every
check. Total work: O(n²).

**The solution:**
```js
// Deduplication with a Set:
const seen = new Set();
const unique = contacts.filter(c => {
  if (seen.has(c.email)) return false;  // O(1) — constant time
  seen.add(c.email);
  return true;
});
```

**What it hides:** `Set` hides the complexity of maintaining a deduplicated
collection. Without it, you write `if (arr.includes(x))` before every `push`.
With it, you call `set.add(x)` and duplicates are handled automatically.

The invariant: a `Set` never contains the same value twice. `add()` on a value
already present is silently ignored. Equality uses the same-value-zero algorithm:
`NaN === NaN` in a Set (unlike `===` where `NaN !== NaN`).

**Canonical example:** A `Set` is like a guest list with a bouncer. The bouncer
checks whether each name is already on the list before adding it. If it is,
the person is turned away silently. The list always has unique names, and
checking "is Alice on the list?" takes the same time whether the list has 10
or 10,000 names.

**Smallest possible example:**
```js
const tags = new Set(['vip', 'newsletter', 'vip', 'inactive']);
console.log(tags.size);              // 3 — duplicate 'vip' removed
console.log(tags.has('newsletter')); // true — O(1)
tags.add('priority');
tags.delete('inactive');
console.log([...tags]);              // ['vip', 'newsletter', 'priority']
```

**You will see this again in:** Deduplicating IDs from multiple data sources,
tracking which items a user has seen, implementing graph visited-node tracking,
finding unique values in arrays (`[...new Set(arr)]`). The Set's O(1) membership
is essential whenever you check membership many times in a loop.

**Watch for:** `Set` stores values by reference for objects. Two objects with the
same properties are NOT equal in a Set — they are different references.
`new Set([{a:1}, {a:1}]).size` is `2`, not `1`.

---

## Step 2 — Deduplicate Emails with Set

```js
console.log('\n--- Set: Unique Emails ---');

const contactsWithDuplicates = [
  { name: 'Alice',   email: 'alice@example.com' },
  { name: 'Bob',     email: 'bob@example.com'   },
  { name: 'Alice2',  email: 'alice@example.com' },  // duplicate email
  { name: 'Charlie', email: 'charlie@example.com' },
  { name: 'Bob2',    email: 'bob@example.com'   },  // duplicate email
  { name: 'Diana',   email: 'diana@example.com'  },
];

// Track seen emails in a Set — O(1) per check:
const seenEmails   = new Set();
const uniqueContacts = contactsWithDuplicates.filter(contact => {
  if (seenEmails.has(contact.email)) return false;  // already seen — skip
  seenEmails.add(contact.email);                    // first time — add and keep
  return true;
});

console.log(
  `Unique emails: ${uniqueContacts.length}`,
  `(from ${contactsWithDuplicates.length} contacts,`,
  `${contactsWithDuplicates.length - uniqueContacts.length} duplicates removed)`
);
```

### SAVE AND TRY

```bash
node collections.js
```

Expected:
```
--- Set: Unique Emails ---
Unique emails: 4 (from 6 contacts, 2 duplicates removed)
```

**Change something:** Replace `seenEmails.has(contact.email)` with a plain
array version: `const seenArr = []; if (seenArr.includes(contact.email)) ...`.
Both produce the same result. For 6 contacts, there is no perceptible difference.
Consider what changes at 1,000,000 contacts — `includes` on an array scans
linearly; `has` on a Set is constant.

---

### Concept: Set Operations — Union, Intersection, Difference

**What it is:** Mathematical set operations can be computed from JavaScript Sets
using spread and filtering.

**The operations:**
- **Union**: all elements in either set — `new Set([...setA, ...setB])`
- **Intersection**: elements in both sets — `new Set([...setA].filter(x => setB.has(x)))`
- **Difference (A − B)**: elements in A but not B — `new Set([...setA].filter(x => !setB.has(x)))`

**Why this matters:** Comparing contact lists, finding common connections,
finding what changed between two snapshots — all are set operations.

**Smallest possible example:**
```js
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5, 6]);

const union        = new Set([...a, ...b]);       // {1,2,3,4,5,6}
const intersection = new Set([...a].filter(x => b.has(x))); // {3,4}
const difference   = new Set([...a].filter(x => !b.has(x))); // {1,2}
```

**You will see this again in:** Comparing two snapshots of data to find what was
added or removed, finding shared tags or categories between items, any data
reconciliation task.

---

## Step 3 — Set Operations on Contact Lists

```js
console.log('\n--- Set Operations ---');

// Two groups of contacts represented by email:
const listA = new Set(['alice@example.com', 'bob@example.com', 'charlie@example.com']);
const listB = new Set(['charlie@example.com', 'diana@example.com', 'alice@example.com']);

// Intersection — in both lists:
const inBoth = new Set([...listA].filter(email => listB.has(email)));

// Difference A − B — only in list A:
const onlyInA = new Set([...listA].filter(email => !listB.has(email)));

// Difference B − A — only in list B:
const onlyInB = new Set([...listB].filter(email => !listA.has(email)));

console.log('In both lists:', [...inBoth].join(', '));
console.log('Only in list A:', [...onlyInA].join(', '));
console.log('Only in list B:', [...onlyInB].join(', '));
```

### SAVE AND TRY

```bash
node collections.js
```

Expected:
```
--- Set Operations ---
In both lists: alice@example.com, charlie@example.com
Only in list A: bob@example.com
Only in list B: diana@example.com
```

**Change something:** Add `'bob@example.com'` to `listB`. The "Only in list A"
result should now be empty. Bob is in both lists.

---

### Concept: WeakMap and WeakSet — Memory-Safe Object Tracking

**What it is:** `WeakMap<object, V>` and `WeakSet<object>` are like their
strong counterparts but with one key difference: they do not prevent their
keys from being garbage-collected.

**The problem before:**

```js
// Using a regular Map to cache computed data for DOM elements:
const cache = new Map();

let element = document.getElementById('btn'); // a DOM element
cache.set(element, computeExpensiveData(element));

element = null; // We are done with the element
// BUT: the Map still holds a reference to the old DOM element!
// The element cannot be garbage-collected until the Map entry is deleted.
// Memory leak if you forget to call cache.delete(oldElement).
```

**The solution:**

```js
const cache = new WeakMap();
cache.set(element, computeExpensiveData(element));
element = null;
// The WeakMap entry is automatically removed when element is garbage-collected.
// No memory leak. No manual cleanup.
```

**What it hides:** `WeakMap` hides the lifecycle management of entries tied to
object lifetimes. When the key object is garbage-collected, the entry disappears
automatically. No `delete` call needed.

The invariant: entries in a `WeakMap`/`WeakSet` are automatically removed when
their key objects are no longer reachable. You cannot enumerate a `WeakMap` —
you cannot list its keys, because they might be collected at any moment.

**Canonical example:** A `WeakMap` is like a valet ticket attached to a car.
When the car is destroyed (garbage-collected), the ticket becomes meaningless
and disappears. The valet does not need to search for it and remove it manually.

**Smallest possible example:**
```js
const privateData = new WeakMap();

class ContactManager {
  constructor(name) {
    // Store private data — key is 'this', which is the instance:
    privateData.set(this, { accessLevel: 'admin', secret: 'xyz' });
    this.name = name;
  }

  getAccessLevel() {
    return privateData.get(this).accessLevel;
  }
}

const manager = new ContactManager('Alice');
console.log(manager.getAccessLevel()); // 'admin'
console.log(manager.accessLevel);       // undefined — not on the object
```

**You will see this again in:** DOM metadata caching (store computed values
keyed to DOM nodes), private class data (store private state keyed to instances),
any situation where you need to associate data with an object but cannot
modify the object itself.

**Watch for:** `WeakMap` and `WeakSet` cannot be iterated — no `forEach`, no
`keys()`, no `values()`. You can only `get`, `set`, `has`, and `delete` by
providing the exact key object. This limitation is intentional: enumeration would
require knowing all living keys, which would prevent garbage collection.

---

## Step 4 — WeakMap for Private Access Levels

```js
console.log('\n--- WeakMap: Private Data ---');

// Store private data outside the object — keyed to the instance:
const privateContactData = new WeakMap();

class SecureContact {
  constructor(name, accessLevel) {
    this.name = name;
    // Store sensitive data in the WeakMap — not on 'this':
    privateContactData.set(this, { accessLevel });
  }

  getAccessLevel() {
    return privateContactData.get(this)?.accessLevel ?? 'none';
  }
}

let alice = new SecureContact('Alice', 'admin');
console.log(`${alice.name}'s access level: ${alice.getAccessLevel()}`);

// Private data is not on the object:
console.log('Direct access:', alice.accessLevel); // undefined

// When the reference is cleared, the WeakMap entry becomes eligible for GC:
alice = null;
console.log('After deletion — memory released (entry no longer accessible)');
```

### SAVE AND TRY

```bash
node collections.js
```

Expected:
```
--- WeakMap: Private Data ---
Alice's access level: admin
Direct access: undefined
After deletion — memory released (entry no longer accessible)
```

**Change something:** Try `console.log(privateContactData.size)`. Expected: `TypeError`
or `undefined` — `WeakMap` has no `size` property because it cannot be enumerated.
Compare with `new Map()` which does have `.size`. This limitation is the point.

---

## 🎯 Challenge: Contact Index with Map and Set

**You know:** `Map` for key-value with any key type, `Set` for deduplication and O(1) lookup.

**Task:** Write a `ContactIndex` class that allows:
- Adding a contact `{ name, email, tags: ['vip', 'newsletter'] }`
- Looking up all contacts that have a specific tag — must return in O(1) per-tag lookup
- Finding all contacts whose names start with a given letter
- Reporting the total number of unique tags across all contacts

```js
const index = new ContactIndex();
index.add({ name: 'Alice', email: 'alice@example.com', tags: ['vip', 'newsletter'] });
index.add({ name: 'Bob',   email: 'bob@example.com',   tags: ['newsletter'] });
index.add({ name: 'Carol', email: 'carol@example.com', tags: ['vip', 'priority'] });

console.log(index.byTag('vip'));        // [Alice contact, Carol contact]
console.log(index.byLetter('A'));       // [Alice contact]
console.log(index.uniqueTagCount());    // 3 (vip, newsletter, priority)
```

**Requirements:**
- `byTag` must use a `Map` internally — building it at lookup time would be O(n)
- `uniqueTagCount` must use a `Set` — deduplication is free
- Do not use `filter` for `byTag` — pre-index by tag at `add` time

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
class ContactIndex {
  constructor() {
    this.contacts  = [];
    this.tagIndex  = new Map();   // tag → Set of contacts
    this.allTags   = new Set();   // all unique tags ever seen
  }

  add(contact) {
    this.contacts.push(contact);

    // Index by every tag:
    for (const tag of contact.tags) {
      this.allTags.add(tag);

      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag).add(contact);
    }
  }

  byTag(tag) {
    // O(1) lookup — the index is pre-built:
    return [...(this.tagIndex.get(tag) ?? new Set())];
  }

  byLetter(letter) {
    // O(n) over contacts — acceptable because there's no letter index:
    return this.contacts.filter(c =>
      c.name.toUpperCase().startsWith(letter.toUpperCase())
    );
  }

  uniqueTagCount() {
    return this.allTags.size;
  }
}
```

**Key insight:** The `tagIndex` Map inverts the data — instead of scanning all
contacts for each tag lookup, you build the index once (during `add`) and get
O(1) lookup thereafter. This is the classic trade-off: pay more at insert time
to get less work at query time. The `allTags` Set deduplicates automatically —
calling `add` with a tag that already exists is silently ignored.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Map preserves key types | `map.set(1, 'a'); map.has('1')` | `false` — `1` and `'1'` are different |
| Map.size works | `new Map([['a',1],['b',2]]).size` | `2` |
| Set deduplicates | `new Set([1,1,2,2,3]).size` | `3` |
| Set.has is O(1) | `new Set([...Array(1000000)]).has(999999)` | `true` (instantly) |
| WeakMap has no size | `new WeakMap().size` | `undefined` |
| Set iteration | `[...new Set([3,1,2])]` | `[3, 1, 2]` — insertion order |

---

## Quick Check Answers

**1. Plain object vs Map for counting cities?**

For string keys (city names are strings), both work. The difference appears in
edge cases: city names that happen to be prototype properties (`'constructor'`,
`'toString'`) would collide with built-in object properties if using a plain
object — causing subtle bugs. A `Map` has no prototype property collision risk.
`Map` also gives you `.size` directly, while a plain object requires
`Object.keys(obj).length`. For simple string key counting, either is fine;
for production code, `Map` is safer.

**2. Time complexity of `array.includes()` vs `set.has()`?**

`array.includes()` is O(n) — it scans from the beginning until it finds the
value or reaches the end. For 10,000 contacts, it checks up to 10,000 items.
`set.has()` is O(1) — it computes a hash of the value and checks a single bucket.
For 10,000 contacts, it always checks exactly one location. At scale, O(n) in
a loop becomes O(n²) total; O(1) stays O(n) total.

**3. What happens to a WeakMap entry when the key is garbage-collected?**

The entry is automatically removed. The garbage collector sees that the key
object has no remaining strong references — only the WeakMap's weak reference.
Since a weak reference does not prevent collection, the object is collected and
the WeakMap entry disappears. The value associated with that key also becomes
unreachable (unless something else references it). No manual cleanup is needed.
This is why WeakMap cannot be enumerated — the set of live keys is determined
by the garbage collector, not by the application.
