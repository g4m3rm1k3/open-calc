# Junior to Senior — T1·L0a — Destructuring and Spread

**Prerequisites:** T0·L1 (Git Workflow). A code editor and Node.js installed
(`node --version` returns a version number). No prior TypeScript knowledge required
for this lesson — all examples run as plain JavaScript first.

**What this lab adds:**
- Object destructuring — pulling named values out of an object in one line
- Array destructuring — pulling items out of an array by position
- The spread operator — merging and copying arrays and objects
- Function parameter destructuring — receiving an object but naming its parts

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have an object `const person = { name: 'Alice', age: 30, city: 'London' }`.
>    Without destructuring, how many lines does it take to store `name` and `age`
>    in their own variables?
> 2. What do you think `const { name = 'Unknown' } = {}` produces for `name`?
> 3. If spread creates a copy, why can modifying `copy.address.city` still
>    affect the original object?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contacts utility that processes raw data. By the end you will have working
code using each form of destructuring and spread, and you will know when to
reach for each one.

```
$ node contacts.js

Name: Alice
Email: alice@example.com
City: London

Merged: { name: 'Alice', email: 'alice@example.com', phone: '555-0101', city: 'London' }
First contact: Alice
Remaining: [ 'Bob', 'Charlie' ]
```

---

## The Problem — Without Destructuring

Create `contacts.js`:

```js
const contact = {
  name: 'Alice',
  email: 'alice@example.com',
  address: {
    city: 'London',
    country: 'UK',
  },
};

// To use each field you must write the full path every time:
const name  = contact.name;
const email = contact.email;
const city  = contact.address.city;

console.log('Name:', name);
console.log('Email:', email);
console.log('City:', city);
```

### SAVE AND TRY

```bash
node contacts.js
```

Expected:
```
Name: Alice
Email: alice@example.com
City: London
```

This works. But notice the repetition: `contact.name`, `contact.email`,
`contact.address.city`. Every reference repeats the object path. With three
fields it is tolerable. With ten fields across three levels of nesting, it
becomes a maintenance problem and an eye strain. This is the problem
destructuring solves.

**Change something:** Add `const country = contact.address.country` and log it.
Count how many times you type `contact.address`. Change it back.

---

### Concept: Object Destructuring

**What it is:** A syntax that extracts named properties from an object into
individual variables in a single statement.

**The problem before:**
```js
const name    = contact.name;
const email   = contact.email;
const city    = contact.address.city;
// Repeated object path. Error-prone if the path changes.
```

**The solution:**
```js
const { name, email } = contact;
// Reads: "from contact, extract name and email into variables of the same name"
```

**What it hides:** Destructuring hides the repeated property access path.
Without it, the developer must write and maintain `contact.` before every field.
With it, the path is written once on the right side of the `=`, and the fields
appear as clean variable names on the left.

The invariant: if a property does not exist on the object, the variable is
`undefined` — destructuring never throws for a missing key (unlike accessing
a property on `null` or `undefined`).

**Canonical example:** Think of destructuring like labelling packages in a shipment.
Instead of writing "the red box in the second layer of pallet three" every time,
you unpack everything at the loading dock and label each item individually.
After that, you refer to items by their label, not their original address.

**Smallest possible example:**
```js
const point = { x: 10, y: 20 };
const { x, y } = point;
console.log(x, y); // 10  20
```

**Why it matters here:** Every function in the contacts tool receives a contact
object. Without destructuring, every function body repeats the property paths.

**You will see this again in:** React (destructuring props: `function Card({ title, body })`),
every REST API response handler, function parameters in every modern JavaScript
codebase. This is the most-used syntax in modern JavaScript and TypeScript.

**Watch for:** The variable name on the left must match the property name on the
object. `const { Name } = contact` gives `undefined` because the property is
`name` (lowercase). Case matters.

---

## Step 1 — Basic Object Destructuring

Replace the verbose property access in `contacts.js`:

```js
const contact = {
  name: 'Alice',
  email: 'alice@example.com',
  address: {
    city: 'London',
    country: 'UK',
  },
};

// Before (delete these three lines):
// const name  = contact.name;
// const email = contact.email;
// const city  = contact.address.city;

// After — destructuring extracts multiple properties at once:
const { name, email } = contact;            // ← add this line
const { city } = contact.address;           // ← add this line (nested object)

console.log('Name:', name);
console.log('Email:', email);
console.log('City:', city);
```

### SAVE AND TRY

```bash
node contacts.js
```

Expected — identical output, less code:
```
Name: Alice
Email: alice@example.com
City: London
```

**Change something:** Try `const { name, phone } = contact`. Log `phone`.
Expected: `undefined` — the property does not exist, but no error is thrown.
Remove the `phone` line.

---

### Concept: Renaming and Default Values in Destructuring

**What it is:** Two modifiers that can be combined with destructuring:
renaming lets you give the extracted value a different local name; defaults
let you provide a fallback when the property is `undefined`.

**The problem before:**
```js
// The API returns 'firstName' but your code uses 'name':
const name = apiResponse.firstName;  // manual rename

// The field might be absent — you want a fallback:
const city = contact.city !== undefined ? contact.city : 'Unknown';
```

**The solution:**
```js
// Rename: property name on the left of ':', local name on the right
const { firstName: name } = apiResponse;

// Default: use '=' inside the destructuring to set a fallback
const { city = 'Unknown' } = contact;

// Both at once:
const { firstName: name = 'Anonymous' } = apiResponse;
```

**Canonical example:** Renaming is like a customs declaration: "I am receiving
a package labelled `firstName` and I will call it `name` from here on."
Defaults are like a form field: "If the user left this blank, use `'Unknown'`."

**Smallest possible example:**
```js
const { x: horizontalPos = 0, y: verticalPos = 0 } = {};
console.log(horizontalPos, verticalPos); // 0  0
```

**You will see this again in:** React hooks (`const { data: contacts = [] } = useQuery(...)`),
any API response where the server uses snake_case but your code uses camelCase,
configuration objects where some keys are optional.

**Watch for:** `const { name: string }` does NOT mean "the type is string."
In plain JavaScript, `:` after a destructured key means "rename to." TypeScript
adds type annotations separately with a different syntax.

---

## Step 2 — Renaming and Default Values

Add a second contact with a missing field, and demonstrate both features:

```js
// Add below the first contact:
const apiContact = {
  full_name: 'Bob',       // API returns snake_case
  email: 'bob@example.com',
  // city is absent
};

// Rename full_name → name; default city to 'Unknown':
const { full_name: name2, email: email2, city: city2 = 'Unknown' } = apiContact;

console.log('\nName:', name2);
console.log('Email:', email2);
console.log('City:', city2);
```

### SAVE AND TRY

```bash
node contacts.js
```

Expected new lines at the bottom:
```
Name: Bob
Email: bob@example.com
City: Unknown
```

**Change something:** Add `city: 'Paris'` to `apiContact`. Run again.
`city2` should now be `'Paris'` — the default only applies when the value is `undefined`.

---

### Concept: Array Destructuring

**What it is:** A syntax that extracts elements from an array into variables
by their position (index), not by name.

**The problem before:**
```js
const parts = ['Alice', 'alice@example.com', '555-0101'];
const name  = parts[0];   // position must be remembered
const email = parts[1];
const phone = parts[2];
```

**The solution:**
```js
const [name, email, phone] = parts;
// Position 0 → name, position 1 → email, position 2 → phone
```

**Canonical example:** Array destructuring is like seats on a bus. The first
person off is in seat 0, the second in seat 1. You do not ask the bus for "the
person named Alice" — you ask for "the person in seat 0."

**Smallest possible example:**
```js
const [first, second, ...rest] = [10, 20, 30, 40, 50];
console.log(first);  // 10
console.log(second); // 20
console.log(rest);   // [30, 40, 50]  ← rest gathers remaining elements
```

**You will see this again in:** React's `useState` hook (`const [count, setCount] = useState(0)`),
CSV parsing (each row is an array of fields), coordinate pairs (`const [x, y] = position`),
`Object.entries()` iteration (`for (const [key, value] of Object.entries(obj))`).

**Watch for:** Skipping elements uses an empty slot: `const [, second] = arr` skips
the first element and captures the second. Each comma you skip costs a position.

---

## Step 3 — Array Destructuring

Add a function that processes a raw CSV-style contact (array of fields):

```js
// Raw data as arrays (as you might parse from a CSV):
const rawContacts = [
  ['Alice', 'alice@example.com', 'London'],
  ['Bob',   'bob@example.com',   'Paris'],
  ['Charlie','charlie@example.com', 'Berlin'],
];

// Destructure each row into named variables:
const [firstName, firstEmail, firstCity] = rawContacts[0];  // ← add this

console.log('\nFirst contact:', firstName, firstEmail, firstCity);

// Destructure with rest — get the first name, skip email, get all others:
const [contactName, , ...locationData] = rawContacts[0]; // ← add this (note the empty slot)

console.log('Name only:', contactName);
console.log('Location data:', locationData);
```

### SAVE AND TRY

```bash
node contacts.js
```

Expected new output:
```
First contact: Alice alice@example.com London
Name only: Alice
Location data: [ 'London' ]
```

**Change something:** Remove the empty comma slot: `const [contactName, ...locationData]`.
What does `locationData` contain now? It now includes the email. The comma is essential
for skipping positions.

---

### Concept: Spread Operator — Objects

**What it is:** The `...` operator placed before an object inside `{ }` expands
that object's properties into the enclosing object — creating a shallow merge.

**The problem before:**
```js
// Merging two objects the old way:
const merged = Object.assign({}, contactA, contactB);
// Verbose, and Object.assign has subtle mutation risks.

// Updating one field without mutating the original:
const updated = Object.assign({}, contact, { city: 'Paris' });
```

**The solution:**
```js
const merged  = { ...contactA, ...contactB };
const updated = { ...contact, city: 'Paris' };
```

**What it hides:** Spread hides the iteration over an object's own enumerable
properties. Without it, merging objects requires a loop or `Object.assign`.
With it, the merge is expressed as a literal.

The invariant: spread always creates a new object. The original is never
modified. Properties from later spreads overwrite properties from earlier ones
when keys collide.

**Canonical example:** Object spread is like photocopying two documents onto
one sheet. The second document's content overwrites the first wherever they
overlap on the same line.

```js
const base     = { color: 'red',  size: 'small' };
const override = { color: 'blue', weight: 'heavy' };
const result   = { ...base, ...override };
// { color: 'blue', size: 'small', weight: 'heavy' }
// color was overwritten; size and weight were merged
```

**Smallest possible example:**
```js
const a = { x: 1, y: 2 };
const b = { y: 99, z: 3 };
const c = { ...a, ...b };
console.log(c); // { x: 1, y: 99, z: 3 }
```

**You will see this again in:** React state updates (`setState({ ...prev, loading: true })`),
Redux reducers, merging default config with user config, every immutable update pattern.
This is the most-used pattern in React codebases.

**Watch for:** Spread is **shallow**. If `contact.address` is an object, `{ ...contact }`
copies the *reference* to `address`, not a new copy of it. Modifying `copy.address.city`
also changes `original.address.city`. For deep cloning, use `structuredClone(obj)`.

---

## Step 4 — Spread in Objects

Add a function that builds enriched contact records:

```js
// A base contact with core fields:
const baseContact = {
  name:  'Alice',
  email: 'alice@example.com',
};

// Additional data from a separate source:
const phoneData = {
  phone: '555-0101',
  phone_type: 'mobile',
};

// Merge with spread — baseContact properties come first;
// any duplicate keys from phoneData would overwrite baseContact:
const enriched = { ...baseContact, ...phoneData };   // ← add this

console.log('\nMerged:', enriched);

// Override one field without modifying the original:
const updated = { ...baseContact, email: 'alice-new@example.com' }; // ← add this

console.log('Updated:', updated);
console.log('Original unchanged:', baseContact);
```

### SAVE AND TRY

```bash
node contacts.js
```

Expected:
```
Merged: { name: 'Alice', email: 'alice@example.com', phone: '555-0101', phone_type: 'mobile' }
Updated: { name: 'Alice', email: 'alice-new@example.com' }
Original unchanged: { name: 'Alice', email: 'alice@example.com' }
```

**Change something:** Reverse the spread order: `{ ...phoneData, ...baseContact }`.
The result is the same because there are no duplicate keys. Now add `name: 'Imposter'`
to `phoneData` and reverse the order again. The `name` field changes — the last
spread wins on key collisions.

---

### Concept: Spread Operator — Arrays

**What it is:** The `...` operator placed before an array inside `[]` expands
that array's elements into the enclosing array — creating a concatenation
or copy.

**The problem before:**
```js
const combined = contactsA.concat(contactsB);  // verbose method call
const copy      = contactsA.slice();            // non-obvious copy idiom
```

**The solution:**
```js
const combined = [...contactsA, ...contactsB];
const copy      = [...contactsA];
```

**Canonical example:** Array spread is like pouring two glasses of water into
one larger glass. Each element flows in sequence. You can insert items between
the pours: `[...before, 'separator', ...after]`.

**Smallest possible example:**
```js
const a = [1, 2, 3];
const b = [4, 5, 6];
const c = [...a, ...b];
console.log(c); // [1, 2, 3, 4, 5, 6]

const copy = [...a];
copy.push(99);
console.log(a);    // [1, 2, 3]  — original untouched
console.log(copy); // [1, 2, 3, 99]
```

**You will see this again in:** Sorting without mutating (`[...contacts].sort(...)`),
adding items to state arrays in React (`[...prev, newItem]`), converting Sets
to arrays (`[...new Set(duplicates)]`), spreading function arguments
(`Math.max(...numbers)`).

**Watch for:** `[...array]` is a *shallow* copy. If the array contains objects,
the objects themselves are shared references, not copies. Pushing a new object
to the copy does not affect the original, but *mutating* an existing object
inside the copy does affect the original.

---

## Step 5 — Spread in Arrays

Add array spread to combine and copy contact lists:

```js
const teamA = ['Alice', 'Bob'];
const teamB = ['Charlie', 'David'];

// Combine without mutating either source array:
const allContacts = [...teamA, ...teamB];    // ← add this

console.log('\nAll contacts:', allContacts);

// Insert between spreads:
const withSeparator = [...teamA, '---', ...teamB]; // ← add this

console.log('With separator:', withSeparator);

// Shallow copy — safe to sort without affecting the original:
const sorted = [...allContacts].sort();             // ← add this

console.log('Sorted copy:', sorted);
console.log('Original order:', allContacts);
```

### SAVE AND TRY

```bash
node contacts.js
```

Expected:
```
All contacts: [ 'Alice', 'Bob', 'Charlie', 'David' ]
With separator: [ 'Alice', 'Bob', '---', 'Charlie', 'David' ]
Sorted copy: [ 'Alice', 'Bob', 'Charlie', 'David' ]
Original order: [ 'Alice', 'Bob', 'Charlie', 'David' ]
```

**Change something:** Try `allContacts.sort()` directly (without the spread copy).
Log `allContacts` after sorting. It is now sorted in place — the original was
mutated. This is why `[...arr].sort()` is the standard safe sorting pattern.
Undo the change.

---

### Concept: Function Parameter Destructuring

**What it is:** Destructuring applied directly to a function's parameter list,
so the function receives an object but names its properties in the signature.

**The problem before:**
```js
function displayContact(contact) {
  const name  = contact.name;   // repeated inside every function
  const email = contact.email;
  console.log(name, email);
}
```

**The solution:**
```js
function displayContact({ name, email }) {
  console.log(name, email);  // no contact. prefix needed
}
```

**Canonical example:** Function parameter destructuring is like a receptionist
who unpacks a delivery box and sets each item on the desk by name, rather than
keeping the whole box and opening it every time they need something.

**Smallest possible example:**
```js
function greet({ name, age = 0 }) {
  console.log(`Hello, ${name}. You are ${age} years old.`);
}

greet({ name: 'Alice', age: 30 }); // Hello, Alice. You are 30 years old.
greet({ name: 'Bob' });            // Hello, Bob. You are 0 years old.
```

**You will see this again in:** Every React component (`function Button({ label, onClick })`),
every route handler, every event handler that receives an event object, every
function that takes a config object.

**Watch for:** If the function is called with `undefined` as the argument
(not `{}` but literally nothing or `undefined`), destructuring throws:
`Cannot destructure property 'name' of undefined`. Add a default: `function greet({ name } = {})`.

---

## Step 6 — Function Parameter Destructuring

Replace the verbose display function with a destructured version:

```js
// A function that receives a full contact object
// and extracts only what it needs in the signature:
function formatContact({ name, email, city = 'Location unknown' }) {
  return `${name} <${email}> — ${city}`;
}

const contacts = [
  { name: 'Alice', email: 'alice@example.com', city: 'London' },
  { name: 'Bob',   email: 'bob@example.com' },   // city absent
];

// Use the function — no internal property access needed:
contacts.forEach(contact => {
  console.log(formatContact(contact));
});
```

### SAVE AND TRY

```bash
node contacts.js
```

Expected:
```
Alice <alice@example.com> — London
Bob <bob@example.com> — Location unknown
```

**Change something:** Call `formatContact()` with no argument at all.
Expected: `TypeError: Cannot destructure property 'name' of undefined`.
Fix it by adding `= {}` as the default: `function formatContact({ name, email, city = 'Location unknown' } = {})`.
Now `formatContact()` returns `"undefined <undefined> — Location unknown"` — ugly but
no crash.

---

## 🎯 Challenge: Nested Destructuring

**You know:** Object destructuring, renaming, defaults, and function parameter destructuring.

**Task:** Write a function `summariseContact(contact)` that accepts a contact
object with the shape below and returns a formatted summary string. Use
destructuring in the function signature — do not access `contact.X` inside the function body.

```js
const contact = {
  name: 'Alice',
  email: 'alice@example.com',
  address: {
    city: 'London',
    country: 'UK',
  },
  tags: ['vip', 'newsletter'],
};

// Expected output:
// "Alice (alice@example.com) — London, UK [vip, newsletter]"
```

**Requirements:**
- Use nested destructuring for `address.city` and `address.country` in the parameter
- Use array destructuring for `tags` to get `firstTag` and `secondTag` separately
- Provide a default of `'No tags'` if `tags` is absent

**Hints:**
1. Nested destructuring: `function foo({ address: { city } })` — note the inner `{}`
2. Array destructuring inside an object: `{ tags: [first = 'none', second = 'none'] }`

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
function summariseContact({
  name,
  email,
  address: { city, country },
  tags: [firstTag = 'No tags', secondTag = ''] = [],
}) {
  const tagStr = secondTag ? `${firstTag}, ${secondTag}` : firstTag;
  return `${name} (${email}) — ${city}, ${country} [${tagStr}]`;
}

const contact = {
  name: 'Alice',
  email: 'alice@example.com',
  address: { city: 'London', country: 'UK' },
  tags: ['vip', 'newsletter'],
};

console.log(summariseContact(contact));
// Alice (alice@example.com) — London, UK [vip, newsletter]

console.log(summariseContact({
  name: 'Bob',
  email: 'bob@example.com',
  address: { city: 'Paris', country: 'FR' },
}));
// Bob (bob@example.com) — Paris, FR [No tags]
```

**Key insight:** The entire destructuring happens once in the function signature.
Inside the function body, there are no property accesses — only local variable
names. The signature IS the documentation of what the function expects.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Object destructuring works | `const { name } = { name: 'Alice' }; console.log(name)` | `Alice` |
| Rename works | `const { name: n } = { name: 'Alice' }; console.log(n)` | `Alice` |
| Default works | `const { city = 'Unknown' } = {}; console.log(city)` | `Unknown` |
| Array destructuring | `const [a,,c] = [1,2,3]; console.log(a, c)` | `1 3` |
| Spread merges objects | `console.log({...{a:1},...{b:2}})` | `{ a: 1, b: 2 }` |
| Spread copies array | Sort `[...arr]` and verify `arr` is unchanged | Original array unmodified |
| Param destructuring | Call `formatContact` with a full contact | Correct formatted string |

---

## Quick Check Answers

**1. Without destructuring, how many lines to extract name and age?**

Two lines — one per property:
```js
const name = person.name;
const age  = person.age;
```
Destructuring collapses this to one: `const { name, age } = person`. With
ten fields it would be ten lines vs one.

**2. What does `const { name = 'Unknown' } = {}` produce?**

`name` is `'Unknown'`. The empty object `{}` has no `name` property, so the value
is `undefined`. The default `= 'Unknown'` applies whenever the value is `undefined`
(not `null`, not `0`, not `''` — only `undefined`).

**3. Why can modifying `copy.address.city` affect the original?**

Spread creates a *shallow* copy — it copies the references to nested objects,
not new copies of those objects. Both `original.address` and `copy.address` point
to the exact same object in memory. Changing a property on that shared object
changes it for both. To avoid this, use `structuredClone(obj)` for a deep copy,
or spread nested objects too: `{ ...original, address: { ...original.address } }`.
