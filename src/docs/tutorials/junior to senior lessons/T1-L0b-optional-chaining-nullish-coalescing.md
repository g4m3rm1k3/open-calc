# Junior to Senior — T1·L0b — Optional Chaining, Nullish Coalescing, Short-circuit

**Prerequisites:** T1·L0a (Destructuring and Spread). You know how to extract
values from objects. This lesson covers what happens when those values might not exist.

**What this lab adds:**
- `?.` optional chaining — safely accessing nested properties that might not exist
- `??` nullish coalescing — providing a fallback only for `null` or `undefined`
- `&&` and `||` short-circuit evaluation — conditional execution in one line
- The critical difference between `??` and `||`

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You write `contact.address.city` but `address` is `null` on some contacts.
>    What happens at runtime?
> 2. `0 || 'fallback'` evaluates to which value — `0` or `'fallback'`?
> 3. `0 ?? 'fallback'` evaluates to which value? Why might that be different?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contact display function that safely handles incomplete data:

```
$ node safe-contact.js

Full contact:
Name: Alice
Phone: 555-0101
City: London

Incomplete contact:
Name: Bob
Phone: No phone on file
City: No city on file

Contact with zero-length name (tricky):
Name (||): No name     ← || treats empty string as falsy — wrong!
Name (??):             ← ?? treats empty string as a valid value — correct
```

---

## The Problem — Accessing Nested Properties That Might Not Exist

Create `safe-contact.js`:

```js
const contacts = [
  {
    name: 'Alice',
    phone: '555-0101',
    address: {
      city: 'London',
    },
  },
  {
    name: 'Bob',
    // phone is absent
    // address is absent
  },
];

// This works for Alice:
console.log(contacts[0].address.city);  // 'London'

// This crashes for Bob:
console.log(contacts[1].address.city);  // ← TypeError!
```

### SAVE AND TRY

```bash
node safe-contact.js
```

Expected crash:
```
TypeError: Cannot read properties of undefined (reading 'city')
```

Bob has no `address`, so `contacts[1].address` is `undefined`. Then you try
to read `.city` on `undefined`, which throws. This is one of the most common
runtime errors in JavaScript. Every contact that comes from an API might be
missing fields.

**The problem is clear.** Now look at the traditional fix:

```js
// Old defensive approach — verbose and repetitive:
const city = contacts[1].address !== undefined
  ? contacts[1].address.city
  : undefined;
```

Or:

```js
// Also common — but reads poorly:
const city = contacts[1] && contacts[1].address && contacts[1].address.city;
```

Both approaches work but grow exponentially worse with deeper nesting.
Optional chaining solves this.

---

### Concept: Optional Chaining (`?.`)

**What it is:** The `?.` operator accesses a property or calls a method but
returns `undefined` immediately if the left-hand side is `null` or `undefined`,
instead of throwing a `TypeError`.

**The problem before:**
```js
// Three levels deep — three manual null checks:
const city = contact
  && contact.address
  && contact.address.location
  && contact.address.location.city;
```

**The solution:**
```js
const city = contact?.address?.location?.city;
// Reads: "if contact exists, and address exists, and location exists,
//         give me city — otherwise give me undefined"
```

**What it hides:** Optional chaining hides the chain of null checks. Each `?.`
is a guard: if the value on its left is `null` or `undefined`, evaluation stops
and the entire expression evaluates to `undefined`. The runtime never tries to
access properties on null.

The invariant: `?.` can only short-circuit to `undefined`. It never throws a
`TypeError` for a missing property. A `TypeError` can still occur if you try
to access a property on a non-object non-null value (like a number or boolean).

**Canonical example:** Optional chaining is like following directions with
optional turns. "Go to Main Street, then turn left onto Oak Ave *if it exists*,
then take the third driveway *if it exists*." If any turn doesn't exist, you
stop and say "destination not found" — you do not drive into a wall.

**Smallest possible example:**
```js
const user = { profile: null };
console.log(user.profile?.avatar);  // undefined — no crash
console.log(user.profile.avatar);   // TypeError — crash!
```

**You will see this again in:** Every API response handler (API data is frequently
incomplete), React component rendering (`user?.name ?? 'Guest'`), event handlers
(`event?.target?.value`), every codebase that deals with data from outside the
application. This is now the standard way to handle optional properties.

**Watch for:** `?.` only guards the step immediately after it. `a?.b.c` is safe
if `a` is null (stops at `b`), but crashes if `b` is null (`.c` has no guard).
Chain `?.` at every step where null is possible: `a?.b?.c`.

---

## Step 1 — Fix the Crash with Optional Chaining

Replace the crashing line and add safe access throughout:

```js
const contacts = [
  {
    name: 'Alice',
    phone: '555-0101',
    address: { city: 'London' },
  },
  {
    name: 'Bob',
    // phone absent, address absent
  },
];

// Safe access with ?. — never crashes, returns undefined for missing data:
contacts.forEach(contact => {
  const city  = contact.address?.city;    // ← add this (was: contact.address.city)
  const phone = contact.phone;

  console.log(`\nName: ${contact.name}`);
  console.log(`Phone: ${phone}`);
  console.log(`City: ${city}`);
});
```

### SAVE AND TRY

```bash
node safe-contact.js
```

Expected — no crash, but `undefined` appears:
```
Name: Alice
Phone: 555-0101
City: London

Name: Bob
Phone: undefined
City: undefined
```

No `TypeError`. The `undefined` values need better display — which is exactly
what nullish coalescing solves next.

**Change something:** Try `contact?.address?.city` — same result, but now the
chain also guards against `contact` being null, which happens if the array
contains null entries.

---

### Concept: Nullish Coalescing (`??`)

**What it is:** An operator that returns the right-hand value when the left-hand
value is exactly `null` or `undefined`, and returns the left-hand value for
everything else — including `0`, `''`, and `false`.

**The problem before:**

The traditional fallback was `||`:
```js
const phone = contact.phone || 'No phone on file';
```

This works for `undefined` and `null`. But it also replaces any *falsy* value —
`0`, `''`, `false` — with the fallback. A contact with phone `''` (blank)
would show "No phone on file," which is a lie.

**The solution:**
```js
const phone = contact.phone ?? 'No phone on file';
// Only replaces null or undefined — not 0, not '', not false
```

**What it hides:** `??` hides the distinction between "absent" and "present but
empty/zero." It treats `0`, `''`, and `false` as real values that should be
preserved. Only `null` and `undefined` — the two JavaScript values that mean
"nothing is here" — trigger the fallback.

The invariant: `??` never replaces a value of `0`, `false`, or `''`. If you
want a fallback for those, use `||`.

**Canonical example:** `??` is like a form that has a "leave blank if unknown"
instruction. A filled-in field with the value `0` (zero hours worked) means
something different from a blank field (hours unknown). `??` preserves the `0`.
`||` treats the `0` the same as a blank.

```js
// || treats falsy values as "missing":
console.log(0     || 'default'); // 'default'  ← wrong for counts
console.log(''    || 'default'); // 'default'  ← wrong for intentionally empty strings
console.log(false || 'default'); // 'default'  ← wrong for boolean flags

// ?? treats only null/undefined as "missing":
console.log(0     ?? 'default'); // 0      ← correct
console.log(''    ?? 'default'); // ''     ← correct
console.log(false ?? 'default'); // false  ← correct
console.log(null  ?? 'default'); // 'default' ← correct
console.log(undefined ?? 'default'); // 'default' ← correct
```

**Smallest possible example:**
```js
const score = 0;
console.log(score || 'No score');  // 'No score' — wrong!
console.log(score ?? 'No score');  // 0 — correct
```

**You will see this again in:** Config defaults (`port ?? 3000`), API response
handling (`data.count ?? 0`), React props with zero values (`count ?? 0`),
any situation where `0` or `false` is a valid value but `null`/`undefined`
should fall back. This distinction is a common job interview question.

**Career signal:** "What is the difference between `||` and `??`?" is a
standard interview question for any JavaScript or TypeScript role.

**Watch for:** `??` has lower precedence than most operators. `a ?? b || c`
parses as `a ?? (b || c)`. Use parentheses when mixing `??` with `||` or `&&`
— TypeScript actually enforces this with a syntax error to prevent mistakes.

---

## Step 2 — Replace `undefined` with Meaningful Fallbacks

Use `??` to display readable messages instead of `undefined`:

```js
contacts.forEach(contact => {
  const city  = contact.address?.city   ?? 'No city on file';   // ← change this
  const phone = contact.phone           ?? 'No phone on file';  // ← change this

  console.log(`\nName: ${contact.name}`);
  console.log(`Phone: ${phone}`);
  console.log(`City: ${city}`);
});
```

### SAVE AND TRY

```bash
node safe-contact.js
```

Expected:
```
Name: Alice
Phone: 555-0101
City: London

Name: Bob
Phone: No phone on file
City: No city on file
```

**Change something:** Change `??` to `||` for the phone fallback. Then add a
contact with `phone: ''` (blank string) and run again. With `||`, the blank
phone shows "No phone on file" — which is misleading. With `??`, the blank
phone stays blank. Switch back to `??`.

---

### Concept: Short-circuit Evaluation (`&&` and `||`)

**What it is:** JavaScript evaluates the left side of `&&` and `||` first.
If that result determines the final answer, the right side is never evaluated.
This enables conditional execution in a single expression.

**`&&` (AND) short-circuits on the left being falsy:**
```js
isLoggedIn && showDashboard();
// If isLoggedIn is false/null/undefined/0/'', showDashboard() is never called
```

**`||` (OR) short-circuits on the left being truthy:**
```js
const display = cachedValue || fetchFromServer();
// If cachedValue is truthy, fetchFromServer() is never called
```

**The problem before:**
```js
if (contact.phone) {
  formatPhone(contact.phone);
}
```

**The solution (when appropriate):**
```js
contact.phone && formatPhone(contact.phone);
// Concise: formatPhone only runs if phone is truthy
```

**What it hides:** Short-circuit evaluation hides the conditional branch.
The `&&` and `||` operators are not just logical operators — they control
execution flow. This is a power tool that aids brevity but can harm readability
if overused.

The invariant: `&&` returns the first falsy value it encounters, or the last
value if all are truthy. `||` returns the first truthy value it encounters,
or the last value if all are falsy.

**Canonical example:** `&&` is a series of locked doors. Each door only opens
if the previous one opened. `||` is a series of emergency exits — the first
unlocked one is used, and the rest are skipped.

```js
// && returns the first falsy value (or last if all truthy):
console.log(1 && 2 && 3);        // 3   (all truthy → last value)
console.log(1 && null && 3);     // null (first falsy)

// || returns the first truthy value (or last if all falsy):
console.log(null || '' || 'hi'); // 'hi' (first truthy)
console.log(null || '' || 0);    // 0    (all falsy → last value)
```

**Smallest possible example:**
```js
const user = { isAdmin: true };
user.isAdmin && console.log('Welcome, admin.');  // prints if isAdmin is truthy

const name = '' || 'Guest';                      // 'Guest' — empty string is falsy
const id   = 0  ?? 'no-id';                      // 0 — zero is not null/undefined
```

**You will see this again in:** React JSX (`{isLoading && <Spinner />}`),
every guard clause, configuration fallbacks, feature flags, early returns.
Short-circuit evaluation is in every professional JavaScript file.

**Watch for:** Do not use `&&` for side effects in complex logic — it makes
code harder to read than a simple `if`. Use it for concise, obvious single-purpose
conditionals. If the condition requires any explanation, use an `if` block.

---

## Step 3 — Short-circuit for Conditional Output

Add conditional display logic using both operators:

```js
// Add a VIP contact:
const vipContact = {
  name: 'Charlie',
  email: 'charlie@example.com',
  isVip: true,
  phone: '',  // intentionally blank — phone unknown, not absent
};

// && for conditional side effects:
vipContact.isVip && console.log('\n⭐ VIP Contact detected');

// ?? vs || demonstration with the blank phone:
console.log('Phone (||):', vipContact.phone || 'No phone');   // 'No phone' — wrong
console.log('Phone (??):', vipContact.phone ?? 'No phone');   // ''         — correct
```

### SAVE AND TRY

```bash
node safe-contact.js
```

Expected new lines:
```
⭐ VIP Contact detected
Phone (||): No phone
Phone (??):
```

**Change something:** Change `vipContact.isVip` to `false`. The `⭐ VIP Contact detected`
line disappears — `&&` short-circuited on the left being falsy.

---

### Concept: Nullish Assignment (`??=`) and Logical Assignment (`||=`, `&&=`)

**What it is:** Compound assignment operators that combine the nullish/logical
operators with assignment — they only assign if the condition is met.

**The problem before:**
```js
// Assigning a default only if the value is null/undefined:
if (contact.city === null || contact.city === undefined) {
  contact.city = 'Unknown';
}
// Or the more common but incorrect:
contact.city = contact.city || 'Unknown';  // replaces '' too!
```

**The solution:**
```js
contact.city ??= 'Unknown';  // only assigns if city is null or undefined
contact.tags ||= [];          // only assigns if tags is falsy (null, undefined, empty, 0)
```

**Smallest possible example:**
```js
let score = null;
score ??= 0;
console.log(score); // 0

let score2 = 5;
score2 ??= 0;
console.log(score2); // 5 — not overwritten
```

**You will see this again in:** Lazy initialisation, cache population,
setting defaults on objects received from APIs before processing them.

**Watch for:** These operators are relatively new (ES2021). If you need to
support very old environments, use the explicit `if` version.

---

## Step 4 — Nullish Assignment for Defaults

Add a function that normalises an incomplete contact before displaying it:

```js
function normaliseContact(contact) {
  // ??= only assigns if the field is currently null or undefined:
  contact.phone ??= '';             // ← add this
  contact.address ??= {};           // ← add this
  contact.address.city ??= 'Unknown'; // ← add this (safe because address is now at least {})
  return contact;
}

const rawContacts2 = [
  { name: 'Diana', email: 'diana@example.com', phone: '555-9999', address: { city: 'Rome' } },
  { name: 'Eve',   email: 'eve@example.com' },  // nothing extra
];

rawContacts2.forEach(c => {
  normaliseContact(c);
  console.log(`\n${c.name}: phone="${c.phone}", city="${c.address.city}"`);
});
```

### SAVE AND TRY

```bash
node safe-contact.js
```

Expected:
```
Diana: phone="555-9999", city="Rome"
Eve: phone="", city="Unknown"
```

**Change something:** Replace `??=` with `=` in `normaliseContact`. Run with
Diana — her phone is now overwritten with `''` even though she had a valid phone.
`??=` preserves existing values; `=` always overwrites.

---

## 🎯 Challenge: Safe Deep Access Utility

**You know:** Optional chaining, nullish coalescing, and short-circuit evaluation.

**Task:** Write a function `safeGet(obj, path, defaultValue)` that safely accesses
a nested property using a dot-separated string path, returning `defaultValue`
if any step in the path is null or undefined.

```js
const contact = {
  name: 'Alice',
  address: {
    billing: {
      city: 'London'
    }
  }
};

safeGet(contact, 'address.billing.city', 'Unknown');    // 'London'
safeGet(contact, 'address.shipping.city', 'Unknown');   // 'Unknown'
safeGet(contact, 'phone', 'No phone');                  // 'No phone'
safeGet(null, 'anything', 'Default');                   // 'Default'
```

**Hint:** Split the path on `'.'` to get an array of keys. Use `reduce` to
walk the object step by step. If any step returns `null` or `undefined`,
the reduce should stay `null`/`undefined` for the remaining steps.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
function safeGet(obj, path, defaultValue) {
  // Split 'address.billing.city' into ['address', 'billing', 'city']
  const keys   = path.split('.');

  // Walk the object step by step:
  // if any step returns null/undefined, ?. stops and returns undefined
  const result = keys.reduce(
    (current, key) => current?.[key],  // optional chaining on each step
    obj,                                // start with the root object
  );

  // Return defaultValue if result is null or undefined:
  return result ?? defaultValue;
}

// Tests:
const contact = {
  name: 'Alice',
  address: { billing: { city: 'London' } },
};

console.log(safeGet(contact, 'address.billing.city', 'Unknown')); // London
console.log(safeGet(contact, 'address.shipping.city', 'Unknown')); // Unknown
console.log(safeGet(contact, 'phone', 'No phone'));                 // No phone
console.log(safeGet(null, 'anything', 'Default'));                  // Default
```

**Key insight:** `current?.[key]` uses optional chaining with a computed
property key. If `current` is `null` or `undefined`, the `?.` prevents the
property access and returns `undefined`. The `reduce` then passes `undefined`
to the next step, which `?.` also short-circuits. The final `?? defaultValue`
converts the terminal `undefined` to your chosen fallback.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| `?.` prevents crash | `null?.city` in node | `undefined` — no TypeError |
| `??` preserves `0` | `0 ?? 'fallback'` | `0` |
| `||` replaces `0` | `0 \|\| 'fallback'` | `'fallback'` |
| `&&` short-circuits | `false && console.log('hi')` | Nothing printed |
| `??=` preserves existing | `let x = 5; x ??= 99; console.log(x)` | `5` |
| Chained `?.` | `null?.a?.b?.c` | `undefined` |

---

## Quick Check Answers

**1. What happens at runtime when `address` is `null`?**

JavaScript throws `TypeError: Cannot read properties of null (reading 'city')`.
When you write `contact.address.city`, JavaScript first evaluates `contact.address`
(which gives `null`), then tries to access `.city` on `null`. Reading any property
on `null` or `undefined` always throws. The fix is `contact.address?.city` —
the `?.` stops evaluation and returns `undefined` instead of crashing.

**2. `0 || 'fallback'` evaluates to?**

`'fallback'`. The `||` operator returns the right side when the left side is
*falsy*. In JavaScript, `0` is falsy (along with `''`, `false`, `null`, `undefined`,
and `NaN`). So `0 || 'fallback'` evaluates the right side and returns `'fallback'`.
This is a common bug when using `||` for numeric defaults.

**3. `0 ?? 'fallback'` evaluates to? Why different?**

`0`. The `??` operator only returns the right side when the left side is `null`
or `undefined` — the two values that specifically mean "nothing is here." Zero
means *something* — it is the number zero. `??` preserves it. The practical
implication: use `??` when a value of `0`, `''`, or `false` is meaningful and
should not be replaced; use `||` when any falsy value should fall back.
