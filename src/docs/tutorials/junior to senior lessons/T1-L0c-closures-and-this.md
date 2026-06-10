# Junior to Senior — T1·L0c — Closures and `this` Binding

**Prerequisites:** T1·L0b (Optional Chaining and Nullish Coalescing).
You can safely access nested properties. This lesson covers why functions
sometimes behave unexpectedly depending on how they are called and defined.

**What this lab adds:**
- What a closure is and how it captures variable references
- The classic loop closure bug and its fix
- How `this` works in regular functions vs arrow functions
- `.bind()`, `.call()`, `.apply()` — explicitly setting `this`

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A `for` loop creates 5 buttons. Each button's click handler logs its
>    index. When you click any button, it logs `5`. Why?
> 2. You pass a class method as a callback to `setTimeout`. Inside the callback,
>    `this` is `undefined`. Why?
> 3. What is the difference between an arrow function and a regular function
>    with regard to `this`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contact manager with event-style callbacks that demonstrates the bugs
closures and `this` create — and the patterns that fix them.

```
$ node closures.js

--- Closure Bug ---
Button 0 clicked: 3   ← should be 0, 1, 2 — all print 3 (the bug)

--- Closure Fix (let) ---
Button 0 clicked: 0   ← correct
Button 1 clicked: 1   ← correct
Button 2 clicked: 2   ← correct

--- this Bug ---
ContactManager error: Cannot read properties of undefined (reading 'contacts')

--- this Fix (arrow function) ---
ContactManager has 2 contacts
```

---

## Part 1: Closures

### Concept: What a Closure Is

**What it is:** A closure is a function that retains access to variables from
the scope where it was *defined*, even after that scope has finished executing.

**The problem before:** Without understanding closures, behaviour like "all my
event handlers log the same value" seems like a framework bug. It is not —
it is a predictable consequence of how JavaScript scopes work.

**The solution:** Understanding that closures capture *variable references*, not
values. When the function finally runs, it reads the current value of the variable,
not the value it had when the function was created.

**What it hides:** A closure hides the connection between a function and the
surrounding scope. The function "remembers" its birthplace. This is what makes
callbacks, event handlers, and private state possible.

The invariant: a closure always has access to the variables in its enclosing
scope, for the lifetime of the function — even if the scope that created those
variables has long since returned.

**Canonical example:** A closure is like a note written by someone who has
left the room. The note says "call me if you need anything." When you call,
they can still answer because the note contains their phone number (the variable
reference). But the phone number might belong to a *later* version of the person
if they changed their number (the variable was reassigned) between when they
wrote the note and when you called.

**Smallest possible example:**
```js
function makeCounter() {
  let count = 0;  // this variable lives in makeCounter's scope
  return function() {
    count += 1;   // this inner function closes over 'count'
    return count;
  };
}

const counter = makeCounter(); // makeCounter finishes — but count lives on
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
// count persists because counter holds a reference to it
```

**You will see this again in:** Every callback function, every event handler,
every asynchronous operation, React's `useState` (the state setter closes over
the current state), memoisation, module patterns. Closures are the mechanism
behind most of JavaScript's expressiveness.

**Career signal:** "Explain closures" and "explain the closure bug in a loop"
are among the most common JavaScript interview questions at every level.

**Watch for:** The closure captures a *reference* to the variable, not a copy
of its value at the time the function was created. If the variable changes
between closure creation and closure execution, the function sees the new value.

---

## Step 1 — Demonstrate the Closure Bug

Create `closures.js`. First, reproduce the classic loop bug:

```js
console.log('--- Closure Bug ---');

// Simulate creating 3 buttons (without a browser):
const handlers = [];

// var creates ONE variable shared across all iterations:
for (var i = 0; i < 3; i++) {
  handlers.push(function() {
    // This function closes over 'i' — but 'i' is the SAME variable in all iterations
    console.log(`Button ${i} clicked: ${i}`);
  });
}

// Simulate clicking all buttons:
handlers.forEach((handler, index) => {
  process.stdout.write(`Button ${index} clicked: `);
  handler();
});
```

### SAVE AND TRY

```bash
node closures.js
```

Expected (the bug):
```
--- Closure Bug ---
Button 0 clicked: 3
Button 1 clicked: 3
Button 2 clicked: 3
```

Every handler logs `3` because `var i` creates a single variable shared by all
three closures. By the time any handler runs, the loop has finished and `i` is `3`.
All three functions close over the *same* `i` — and it is now `3`.

**Change something:** Log `i` immediately inside the loop: `console.log('creating handler, i is', i)`.
You will see `0`, `1`, `2` — `i` has the right value during creation.
But by execution time it is `3`. This confirms: the closure captures the variable,
not the value.

---

### Concept: Fixing the Closure Bug with `let`

**What it is:** `let` (and `const`) have *block scope* — each iteration of a
`for` loop creates a fresh, separate `i` variable. Each closure captures its
own independent copy.

**The problem before:** `var` has *function scope* — all iterations share the
same `i`. Every closure refers to the same variable.

**The solution:**
```js
for (let i = 0; i < 3; i++) {  // let instead of var
  // Each iteration gets its OWN 'i', independent of other iterations
  handlers.push(() => {
    console.log(`Button ${i} clicked: ${i}`);
  });
}
```

**Canonical example:** `var` gives every iteration a sticky note saying
"use the counter in the corner." All notes point to the same counter.
When the loop ends, the counter reads `3`. `let` gives every iteration a personal
counter that lives in their pocket. When the loop ends, each handler still has
their own counter with its unique value.

**You will see this again in:** Every loop that creates async callbacks, every
`addEventListener` inside a loop, any time you create functions inside a loop.
This is why `let` replaced `var` as the standard for loop variables.

---

## Step 2 — Fix the Bug with `let`

Add the fixed version below the buggy one:

```js
console.log('\n--- Closure Fix (let) ---');

const fixedHandlers = [];

// let creates a NEW 'i' for each iteration — each closure captures its own:
for (let i = 0; i < 3; i++) {              // ← changed var to let
  fixedHandlers.push(function() {
    console.log(`Button ${i} clicked: ${i}`);
  });
}

fixedHandlers.forEach((handler, index) => {
  process.stdout.write(`Button ${index} clicked: `);
  handler();
});
```

### SAVE AND TRY

```bash
node closures.js
```

Expected new output:
```
--- Closure Fix (let) ---
Button 0 clicked: 0
Button 1 clicked: 1
Button 2 clicked: 2
```

**Change something:** Change `let` back to `var` for the fixed version.
Confirm it breaks again. This single character (`let` vs `var`) is the entire fix.

---

## Part 2: `this` Binding

### Concept: `this` in Regular Functions

**What it is:** In a regular function, `this` refers to the object that *called*
the function — determined at call time, not at definition time.

**The problem before:** This causes surprising behaviour when a method is
extracted from its object and used as a callback:

```js
class ContactManager {
  constructor() {
    this.contacts = ['Alice', 'Bob'];
  }

  listContacts() {
    console.log(`Has ${this.contacts.length} contacts`);
  }
}

const manager = new ContactManager();
manager.listContacts();  // Works: this = manager

// Pass the method as a callback — loses 'this':
const callback = manager.listContacts;
callback();  // Crashes: this = undefined (or global in non-strict mode)
```

**The solution:** Three approaches — `.bind()`, arrow function methods, or
arrow functions as callbacks.

**What it hides:** `this` hides the receiver of a method call. In most
object-oriented languages, `this` is always the object the method belongs to.
In JavaScript, `this` is the object the method was *called on* — which can
differ from where it was defined if the function is passed around.

The invariant that is violated when `this` is lost: methods expect to be called
on their owning object. When they are detached, the invariant breaks.

**Canonical example:** `this` is like a badge that shows your current employer.
While you work at the company (`manager.listContacts()`), your badge shows the
company name. If you take the badge off and use it as a freelancer
(`const cb = manager.listContacts; cb()`), the badge is blank.

**Smallest possible example:**
```js
const obj = {
  name: 'Alice',
  greet: function() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

obj.greet();             // "Hello, I'm Alice" — this = obj
const fn = obj.greet;
fn();                    // "Hello, I'm undefined" — this = undefined
```

**You will see this again in:** React class components (`this.setState`),
DOM event handlers (`this.handleClick`), any method used as a timer or
event callback. Understanding `this` is essential for reading any class-based code.

**Career signal:** "Explain `this` in JavaScript" is a near-universal interview
question. Most candidates stumble on the callback case.

**Watch for:** `this` in an arrow function is *not* the caller — it is whatever
`this` was in the surrounding scope when the arrow function was defined.
Arrow functions do not have their own `this`.

---

## Step 3 — Demonstrate the `this` Bug

Add a class that loses `this` when its method is used as a callback:

```js
console.log('\n--- this Bug ---');

class ContactManager {
  constructor(contacts) {
    this.contacts = contacts;
  }

  // Regular method — 'this' is determined by how it is called:
  listContacts() {
    // If called as a detached function, this.contacts will crash:
    console.log(`ContactManager has ${this.contacts.length} contacts`);
  }
}

const manager = new ContactManager(['Alice', 'Bob']);

// Works — method called on manager, this = manager:
manager.listContacts();

// Simulate passing the method as a callback (loses 'this'):
const detachedMethod = manager.listContacts;

try {
  detachedMethod();  // 'this' is undefined in strict mode
} catch (error) {
  console.log('ContactManager error:', error.message);
}
```

### SAVE AND TRY

```bash
node closures.js
```

Expected:
```
--- this Bug ---
ContactManager has 2 contacts
ContactManager error: Cannot read properties of undefined (reading 'length')
```

The same method, called two different ways, produces two different results.
`manager.listContacts()` sets `this = manager`. `detachedMethod()` sets
`this = undefined` in strict mode (Node.js uses strict mode by default).

---

### Concept: Fixing `this` with `.bind()` and Arrow Functions

**Three solutions exist:**

**Solution 1 — `.bind()`:** Creates a new function with `this` permanently
bound to the specified object.

```js
const boundMethod = manager.listContacts.bind(manager);
boundMethod(); // this = manager, always
```

**Solution 2 — Arrow function as class field:** An arrow function does not
have its own `this` — it inherits `this` from where it was defined (the class
body during construction).

```js
class ContactManager {
  listContacts = () => {  // arrow function field — 'this' is always the instance
    console.log(`Has ${this.contacts.length} contacts`);
  }
}
```

**Solution 3 — Arrow function wrapper at call site:**

```js
setTimeout(() => manager.listContacts(), 1000);
// The arrow function has no 'this' of its own; manager.listContacts() is called
// on manager explicitly, so this = manager inside the method.
```

**`.call()` and `.apply()`** set `this` for a single call (not permanently):
```js
manager.listContacts.call(manager);    // this = manager for this call
manager.listContacts.apply(manager);   // same — difference is how args are passed
```

**Canonical example:** `.bind()` is like giving someone a printed employee ID
card with your company's name. They can leave the building, but the card
always says who issued it. Arrow functions are like being born inside the
company — you cannot have a different employer badge because the concept
does not apply to you.

**You will see this again in:** React class components (pre-hooks) used `bind`
or arrow fields everywhere. Timer callbacks, event listeners, promise chains.
Understanding this lets you read and debug any codebase that uses classes.

---

## Step 4 — Fix `this` with `.bind()` and Arrow Methods

Show all three solutions:

```js
console.log('\n--- this Fix (bind) ---');

// Solution 1: .bind() creates a new function with 'this' permanently set:
const boundList = manager.listContacts.bind(manager);
boundList();  // works

console.log('\n--- this Fix (arrow field) ---');

class ContactManager2 {
  constructor(contacts) {
    this.contacts = contacts;
  }

  // Arrow function as a class field — 'this' is always the instance:
  listContacts = () => {
    console.log(`ContactManager2 has ${this.contacts.length} contacts`);
  };
}

const manager2  = new ContactManager2(['Charlie', 'Diana']);
const detached2 = manager2.listContacts;
detached2();  // works — arrow function captured 'this' at construction time

console.log('\n--- this Fix (arrow wrapper) ---');

// Solution 3: wrap in an arrow function at the call site:
const detached3 = () => manager.listContacts();
detached3();  // works — manager.listContacts() is called on manager explicitly
```

### SAVE AND TRY

```bash
node closures.js
```

Expected:
```
--- this Fix (bind) ---
ContactManager has 2 contacts

--- this Fix (arrow field) ---
ContactManager2 has 2 contacts

--- this Fix (arrow wrapper) ---
ContactManager has 2 contacts
```

**Change something:** Inside `ContactManager2.listContacts`, add
`console.log('this is:', this)`. You should see the ContactManager2 instance.
Then detach the method and call it — still the instance. Compare with
`ContactManager.listContacts` where detaching logs `undefined`.

---

## 🎯 Challenge: Private Counter with Closure

**You know:** How closures capture variable references and how `let` creates
per-iteration scope.

**Task:** Write a function `makeContactCounter()` that returns an object with
three methods: `increment()`, `decrement()`, and `count()`. The count value
must be completely inaccessible from outside — it can only change through
the returned methods.

```js
const counter = makeContactCounter();
counter.increment();
counter.increment();
counter.increment();
counter.decrement();
console.log(counter.count()); // 2

// The count variable must NOT be directly accessible:
console.log(counter._count);  // undefined — the variable is private
```

**Hint:** The variable that holds the count lives inside `makeContactCounter`,
not on the returned object. The methods close over it.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
function makeContactCounter() {
  // This variable is private — it lives in makeContactCounter's scope.
  // Nothing outside this function can access it directly:
  let count = 0;

  return {
    increment() {
      count += 1;  // closes over 'count'
    },
    decrement() {
      count = Math.max(0, count - 1);  // cannot go below zero
    },
    count() {
      return count;  // read-only access
    },
  };
}

const counter = makeContactCounter();
counter.increment();
counter.increment();
counter.increment();
counter.decrement();
console.log(counter.count()); // 2
console.log(counter._count);  // undefined — count is not on the object
```

**Key insight:** The `count` variable exists only inside `makeContactCounter`.
The returned object's methods close over it, maintaining access even after
`makeContactCounter` returns. The variable is effectively private — no code
outside the function can read or write it without using the provided methods.
This is the closure-based module pattern — the predecessor to ES6 classes
and still the foundation of many libraries.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Closure captures reference | `var` loop bug | All handlers log the same final value |
| `let` fixes the loop | `let` loop | Each handler logs its own value |
| `this` lost on detach | Detach a regular method and call it | `TypeError` or wrong `this` |
| `.bind()` fixes `this` | `method.bind(obj)()` | Correct `this` |
| Arrow field fixes `this` | Arrow field class, detach, call | Correct `this` |
| Closure privacy | `makeContactCounter()._count` | `undefined` |

---

## Quick Check Answers

**1. Why do all five buttons log `5`?**

Because the loop used `var`, which creates a single `i` variable shared across
all iterations. Each button's click handler closes over the same `i`. By the
time any button is clicked, the loop has finished and `i` is `5`. All five
functions read the current value of `i` — which is now `5`. The fix is `let`,
which creates a separate `i` for each loop iteration. Each closure then captures
its own independent variable.

**2. Why is `this` `undefined` inside a method passed to `setTimeout`?**

`this` in a regular function is determined by how the function is called, not
where it is defined. When you pass `manager.listContacts` to `setTimeout`,
`setTimeout` calls it as a plain function — not as `manager.listContacts()`.
There is no object before the `.` at call time, so `this` is `undefined`
(in strict mode) or the global object (in non-strict mode). The method was
detached from its owner.

**3. What is the difference between arrow functions and regular functions regarding `this`?**

A regular function has its own `this` binding, determined by how it is called.
`obj.method()` gives `this = obj`. `method()` gives `this = undefined`.
An arrow function has no `this` of its own. It inherits `this` from the
lexical scope where it was *defined* — the `this` that was in effect when the
arrow function was created. This means arrow functions always use the same `this`
regardless of how they are called, making them safe for callbacks.
