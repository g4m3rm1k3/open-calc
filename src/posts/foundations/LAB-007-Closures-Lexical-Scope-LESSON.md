# FOUNDATIONS — LAB-007 — Closures and Lexical Scope

**Series:** FOUNDATIONS — Part II: Programming Fundamentals
**Environment:** Browser DevTools console (F12 → Console). No install required.
**Time:** 55–70 minutes.

---

## What You Will Build

A private counter object whose internal count cannot be read or modified except through a controlled interface — no direct access possible from outside. Along the way you will build the mental model for how every callback, every event handler, and every React hook actually retains its data. You will also reproduce and fix the classic loop closure bug that has broken production code in every JavaScript codebase.

---

## What You Need to Know First

**From LAB-006 (First-Class Functions):** A function can be returned from another function. The returned function is a value you can call later.

**From LAB-001 (The Call Stack and the Heap):** When a function returns, its stack frame is popped and its local variables normally disappear. The heap stores data that persists beyond a function's lifetime. This lab is about what happens when a local variable is referenced by an inner function — it survives on the heap rather than disappearing with the stack frame.

---

> **Quick Check — try to answer before reading:**
>
> 1. A function `inner` is defined inside a function `outer`. After `outer` returns, `inner` is called. Can `inner` still access `outer`'s local variables? What determines the answer?
> 2. You add click handlers to ten buttons in a `for (var i = 0; ...)` loop. Each handler should log its button number. They all log the same number. Why?
> 3. What does "lexical" mean when people say "lexical scope"?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Lexical Scope: A Function Sees Where It Was Written

**The problem this step solves:** Establish the rule that governs which variables any function can access.

**The code:**

```js
let color = "red";

function describeColor() {
  console.log("The color is: " + color);
}

function setContext() {
  let color = "blue";
  describeColor();
}

setContext();
```

Before running this: predict what `setContext()` logs.

**The walkthrough — what executes:**

1. `setContext()` is called. A new stack frame is created. A local variable `color` with value `"blue"` is created inside this frame.
2. `describeColor()` is called from inside `setContext`. A new stack frame for `describeColor` is pushed.
3. `describeColor` reads the variable `color`. JavaScript looks up `color` by searching outward from where `describeColor` was **written** — not from where it was called.
4. `describeColor` was written at the top of the file, next to `let color = "red"`. It finds the outer `color = "red"`.
5. Logs `"The color is: red"`. Not `"blue"`.

**CS lens — lexical scope defined:**

**Lexical scope** (also called **static scope**) means that a variable lookup is resolved by walking outward from where the function was written in the source code, not from where it was called at runtime. The word "lexical" relates to the written text — scope is determined by the code's textual structure, not the execution path.

JavaScript uses lexical scope universally, except for `this` (which is dynamically bound). Every variable lookup follows the same rule: start in the current function, then move outward through each enclosing scope, until the variable is found or a `ReferenceError` is thrown.

**SE lens — why lexical scope makes reasoning possible:**

If scope were dynamic — if a function saw the caller's variables instead of its own enclosing scope — then `describeColor`'s behavior would change depending on who calls it. It would behave differently from `setContext` than from `main` than from a timer callback. You could not read `describeColor` alone and understand what it does. You would have to trace every possible call site. Lexical scope eliminates this: the function's behavior depends only on where it was written and what it was passed.

**What breaks without this:**

Dynamic scope exists in some older languages (early LISP, traditional shell scripts). Debugging was extraordinarily difficult because a function's meaning changed at every call site. Every JavaScript developer working today benefits from lexical scope without knowing it — it is the invisible foundation under every module, every React component, and every callback.

---

### SAVE AND TRY

```js
let message = "global";

function inner() {
  console.log(message);
}

function outer() {
  let message = "local";
  inner();   // inner looks up message where inner was WRITTEN, not where it is called from
}

outer();     // → "global"
```

Expected: `"global"`. `inner` was written at the top level, adjacent to `let message = "global"`. The `let message = "local"` inside `outer` is invisible to `inner`.

**Change something:** Move the definition of `inner` to be *inside* `outer`. Now `inner` is written inside `outer`'s scope. Run again. Expected: `"local"`. Moving where the function is written — not where it is called — changes what it sees.

---

### Step 2 — Closures: When a Variable Outlives Its Function

**The problem this step solves:** Show that a function can carry its enclosing scope's variables with it after the enclosing function returns.

**The code:**

```js
function makeCounter() {
  let count = 0;             // local to makeCounter

  return function() {
    count = count + 1;
    return count;
  };
}

const tick = makeCounter();   // makeCounter's stack frame is NOW GONE
console.log(tick());          // → 1
console.log(tick());          // → 2
console.log(tick());          // → 3
```

**The walkthrough — what executes:**

1. `makeCounter()` is called. A stack frame is created. `count` is created with value `0`.
2. An inner function is created. It references `count` from `makeCounter`'s scope.
3. `makeCounter` returns the inner function. The stack frame for `makeCounter` is **popped**.
4. Normally, popping the frame destroys `count`. But because the returned function still references `count`, the JavaScript engine moves `count` from the stack to the **heap**. It survives.
5. `tick()` is called. There is no stack frame for `makeCounter` — it finished. But `count` still exists on the heap, reachable through the returned function. `count` becomes `1`. Returns `1`.
6. `tick()` is called again. The **same** `count` on the heap is incremented to `2`. Returns `2`.
7. And again: returns `3`.

**CS lens — what a closure is:**

A **closure** is a function combined with the variables from its enclosing scope that it references. The function "closes over" those variables — it carries them with it wherever it goes. When the enclosing scope exits, the closed-over variables are not garbage collected because the closure still holds a live reference to them.

The name: the function *closes* over its environment. The environment is not open — no other code can reach in and modify `count`. Only the returned function has a reference to it.

**SE lens — closures give you persistent private state:**

`count` is not a global variable. It is not a property on an object. It cannot be accessed by any code other than the returned function. This is **genuine privacy** — not a naming convention, not documentation saying "don't touch this," but a guarantee enforced by the language's scoping rules. This is the mechanism under: React's `useState` (each component instance's state is in a closure), memoization caches (the cache lives in a closure, invisible to callers), and the module pattern (module-level state is in a closure over the file scope).

**What breaks without closures:**

Without closures, the only way to share state between calls is to put it in a global variable. Global variables can be read and modified by any code anywhere. A bug in unrelated code — a typo, a wrong assignment — can silently corrupt a counter that "should" be private. Closures move the state to exactly where it is needed, and nowhere else.

---

### SAVE AND TRY

```js
function makeCounter() {
  let count = 0;
  return {
    increment: () => { count += 1; },
    decrement: () => { count -= 1; },
    value:     () => count,
  };
}

const counterA = makeCounter();
const counterB = makeCounter();

counterA.increment();
counterA.increment();
counterA.increment();
counterB.increment();

console.log(counterA.value());   // → 3
console.log(counterB.value());   // → 1
```

Expected: `3` then `1`. Two separate calls to `makeCounter` create two separate `count` variables on the heap. `counterA` and `counterB` do not share state.

**Change something:** Try `counterA.count` — expected `undefined`. The variable is not a property of the returned object; it is invisible outside the closure. Try `counterA.decrement(); counterA.decrement(); counterA.value()` — expected `1` (started at 3, decremented twice).

---

### Step 3 — The Loop Closure Bug

**The problem this step solves:** Show the most common closure mistake and two ways to prevent it.

**The code with the bug:**

```js
const handlers = [];

for (var i = 0; i < 3; i++) {
  handlers.push(function() {
    return i;
  });
}

console.log(handlers[0]());   // → 3  (expected 0)
console.log(handlers[1]());   // → 3  (expected 1)
console.log(handlers[2]());   // → 3  (expected 2)
```

**The walkthrough — why all three return `3`:**

1. The `for` loop runs. Three functions are created and pushed into `handlers`.
2. Each function closes over the variable `i`. But `var i` is **function-scoped** (or globally-scoped here) — there is exactly **one** `i` variable for the entire loop. All three functions close over the *same* `i`.
3. The loop finishes. `i` is now `3` (the value that caused the loop condition `i < 3` to be false).
4. When any handler is called, it reads the current value of `i`, which is `3`.

`var` does not create a new scope for each loop iteration. The `{}` block in a `for` loop is not a new scope for `var`. All three functions literally reference the same memory location.

**Fix 1 — Use `let`:**

```js
const handlers = [];

for (let i = 0; i < 3; i++) {   // 'let' creates a new binding per iteration
  handlers.push(function() {
    return i;
  });
}

console.log(handlers[0]());   // → 0
console.log(handlers[1]());   // → 1
console.log(handlers[2]());   // → 2
```

`let` is **block-scoped**. In a `for` loop, each iteration creates a new block scope, which means a new `i` binding. Each function closes over its own `i` that never changes after the iteration ends.

**Fix 2 — IIFE (the pre-`let` solution):**

```js
const handlers = [];

for (var i = 0; i < 3; i++) {
  handlers.push(
    (function(captured) {
      return function() { return captured; };
    })(i)
  );
}

console.log(handlers[0]());   // → 0
console.log(handlers[1]());   // → 1
console.log(handlers[2]());   // → 2
```

An **IIFE** (Immediately Invoked Function Expression) — a function that is called immediately after being defined — creates a new scope for each iteration. The current `i` is passed as the argument `captured`. Each inner function closes over its own `captured`, which never changes.

`(function(captured) { ... })(i)` means: define a function that takes one parameter, then immediately call it with the current `i`. The `(i)` at the end is the call.

**CS lens — scope boundaries determine sharing:**

`var` creates one variable per function scope (or globally). `let` creates one variable per block scope. A `for` loop body is a block. So `let` gives each iteration its own binding — its own closure environment. The bug exists specifically because `var` predates block scope in JavaScript and does not respect block boundaries.

**SE lens — use `let` and `const` always:**

The existence of this bug is the primary reason the JavaScript community switched from `var` to `let` and `const`. Modern JavaScript style guides prohibit `var` entirely. When you see `var` in a codebase, you are looking at code written before 2015 (when `let` was standardized) or by someone who has not updated their habits. Use `let` for variables that change; use `const` for everything that does not change after initialization.

**What breaks without this:**

Click handlers attached to dynamically created elements in a `for (var i ...)` loop all respond to the same index — typically the last one. This bug has appeared in every production JavaScript codebase written before ES6. The symptom is always the same: all the handlers do the same thing regardless of which element you interact with.

---

### SAVE AND TRY

Run the bug, then the fix:

```js
// The bug
const buggy = [];
for (var i = 0; i < 3; i++) { buggy.push(() => i); }
console.log(buggy.map(fn => fn()));   // → [3, 3, 3]

// The fix
const fixed = [];
for (let i = 0; i < 3; i++) { fixed.push(() => i); }
console.log(fixed.map(fn => fn()));   // → [0, 1, 2]
```

Expected: `[3, 3, 3]` then `[0, 1, 2]`.

**Change something:** Change the loop range to `i < 5`. The buggy version still produces all the same value (now `5`). The fixed version produces `[0, 1, 2, 3, 4]`. The number of handlers scales; the bug mechanism does not change.

---

### Step 4 — The Module Pattern: Closures as Privacy Enforcement

**The problem this step solves:** Use closures deliberately to create an object with private state that no external code can bypass.

**The code:**

```js
const bankAccount = (function() {
  let balance = 0;
  const transactions = [];

  return {
    deposit: function(amount) {
      if (amount <= 0) throw new Error("Deposit must be positive");
      balance += amount;
      transactions.push({ type: "deposit", amount: amount });
    },
    withdraw: function(amount) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
      transactions.push({ type: "withdrawal", amount: amount });
    },
    getBalance: function() {
      return balance;
    },
    getHistory: function() {
      return transactions.slice();   // return a copy — caller cannot mutate the real array
    },
  };
})();
```

Note: `(function() { ... })()` is an **IIFE** again. It runs once immediately, creates the private state, and returns the public interface. After it runs, there is no way to call it again — no way to get a fresh reference to `balance` or `transactions`. The IIFE creates the closure environment exactly once.

`transactions.slice()` — the built-in Array method `slice()` with no arguments returns a shallow copy of the array. We return the copy, not the original, so the caller cannot modify the real transaction history by doing `account.getHistory().push(...)`.

**The walkthrough — what happens when you call `bankAccount.deposit(100)`:**

1. `deposit` is looked up on the `bankAccount` object. Found: it is the function defined in the IIFE.
2. That function runs. It checks `amount > 0`. Passes.
3. `balance` is looked up via lexical scope — the closure finds the `balance` variable that was created in the IIFE, now on the heap.
4. `balance += 100` mutates that heap variable. It is now `100`.
5. A new transaction object is pushed to `transactions`.
6. The function returns.
7. Nothing outside `bankAccount` can read `balance` directly — it has no path to the heap location where `balance` lives except through `getBalance`.

**CS lens — the module pattern:**

The **module pattern** uses an IIFE to create a private scope and returns only the public interface. Before JavaScript had file-level modules (`import`/`export`), this was how library authors prevented their code from polluting the global scope and how they kept implementation details private. jQuery, Lodash, and every major pre-2015 JavaScript library used this pattern.

Modern ES modules (LAB-010) achieve the same effect at the file level: variables declared in a module file are private to that file unless explicitly exported. The module pattern is the manual implementation of what the language now provides natively. Understanding the manual version makes the native version's mechanics clear.

**SE lens — why not just prefix private fields with `_`?**

A common convention: `_balance` means "do not access this directly." But it is only a convention. Nothing prevents `account._balance = 999999`. The module pattern enforces privacy at the language level — there is no path to `balance` except through the defined methods. This is the difference between a locked door and a "please do not enter" sign on an unlocked door.

**What breaks without the copy in `getHistory`:**

```js
const history = bankAccount.getHistory();
history.push({ type: "fraud", amount: -1000000 });
console.log(bankAccount.getHistory());  // would show the fraud entry if we returned the real array
```

If `getHistory` returned `transactions` directly instead of `transactions.slice()`, the caller could modify the real history. Returning a copy ensures the internal state can only change through the `deposit` and `withdraw` methods — the invariants those methods enforce remain intact.

---

### SAVE AND TRY

```js
const bankAccount = (function() {
  let balance = 0;
  const transactions = [];
  return {
    deposit:    amount => { if (amount <= 0) throw new Error("positive only"); balance += amount; transactions.push({type:"deposit", amount}); },
    withdraw:   amount => { if (amount > balance) throw new Error("insufficient funds"); balance -= amount; transactions.push({type:"withdrawal", amount}); },
    getBalance: () => balance,
    getHistory: () => transactions.slice(),
  };
})();

bankAccount.deposit(100);
bankAccount.deposit(50);
bankAccount.withdraw(30);
console.log(bankAccount.getBalance());   // → 120
console.log(bankAccount.getHistory().length);  // → 3
```

Expected: `120` then `3`.

**Change something:** Try `bankAccount.balance` — expected `undefined`. Try `bankAccount.deposit(-1)` — expected an error thrown. Try `bankAccount.withdraw(500)` — expected "insufficient funds" error. Try modifying the returned history and verifying the real history is unaffected: `bankAccount.getHistory().push({type:"fraud",amount:-999}); console.log(bankAccount.getHistory().length)` — expected still `3`.

---

## Connect the Pieces

**What you built:** The mental model for lexical scope, three-step closure mechanics (create, return, call), the loop bug and both fixes, and the module pattern.

**How it connects to LAB-001:** In LAB-001 you learned that local variables normally disappear when their function's stack frame is popped. Closures are the exception: when a local variable is referenced by an inner function that outlives the outer function, the JavaScript engine moves that variable to the heap. The stack frame goes away; the variable survives. This is not a special feature — it is the automatic consequence of garbage collection combined with live references.

**How it connects to LAB-006:** In LAB-006 you saw that functions are values that can be returned. Closures are what makes the returned function useful: it carries its enclosing scope with it. `makeMultiplier(3)` returns a function; that function is useful because it remembers `3` through a closure.

**How it connects forward:**

- **LAB-009 (Error Handling):** Error handlers set up in a `try/catch` block are callbacks — they close over the variables of the surrounding function. Understanding closures makes error propagation patterns legible.
- **LAB-010 (Modules):** ES modules are closures at file scope. Variables declared in a module file are private unless exported — the same mechanism as the module pattern, provided by the language rather than by an IIFE.
- **LAB-022 (Function Composition):** `pipe` and `compose` return functions that close over the array of functions to apply. The pipeline is a closure.
- **LAB-023 (Currying):** A curried function returns a function that closes over earlier arguments. `multiply(3)` returns a function that closes over `3`.
- **React's `useState`:** When a component renders, `useState` returns a `[value, setter]` pair. The setter closes over the component instance's slot in React's internal hook array. When you call `setCount(5)`, it updates that slot through a closure, then triggers a re-render. Every React hook is a closure.

**The real-world connection:**

Closures are the mechanism that makes JavaScript's event-driven, asynchronous programming model work. Every `setTimeout` callback, every `fetch().then()` callback, every `addEventListener` handler that references outer variables — all of these work because closures keep those variables alive after the setup code has returned. Without closures, every callback would have to receive all its needed data as arguments, which is often impossible (the data does not exist yet when the callback is registered).

---

## What Breaks Without This

**Concrete failure — all event handlers fire for the same index:**

```js
const buttons = ["A", "B", "C"];
const clickHandlers = [];

for (var buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
  clickHandlers.push(function() {
    console.log("Clicked: " + buttons[buttonIndex]);
  });
}

// Simulate clicking each button:
clickHandlers[0]();   // → "Clicked: undefined"  (buttons[3] does not exist)
clickHandlers[1]();   // → "Clicked: undefined"
clickHandlers[2]();   // → "Clicked: undefined"
```

All three log `undefined` because `buttonIndex` is `3` after the loop — past the end of the array. Fix: change `var` to `let`. Expected: "Clicked: A", "Clicked: B", "Clicked: C".

This exact bug has appeared in production code for every dynamically-created button, list item, or tab that adds click handlers in a loop. It is the most reported "JavaScript is broken" issue for developers who do not yet understand closures.

---

## Definition of Done

Verify each item before moving to LAB-008.

- [ ] `describeColor()` logs `"red"` even when called from inside a function that defines a local `color = "blue"` — and you can explain why
- [ ] A counter built with `makeCounter()` increments correctly across multiple calls
- [ ] Two separate counters do not share state
- [ ] `counterA.count` returns `undefined` — the value is not accessible from outside
- [ ] The loop bug version produces `[3, 3, 3]` and you can explain why
- [ ] The `let` fix produces `[0, 1, 2]` and you can explain why
- [ ] `bankAccount.deposit(-1)` throws an error
- [ ] `bankAccount.balance` returns `undefined`
- [ ] Modifying the array returned by `getHistory()` does not change the real transaction history

**Git commit:**

```
git add .
git commit -m "LAB-007: understand closures and lexical scope — private counter, loop closure fix, module pattern"
```

---

## Quick Check Answers

**1. Can `inner` access `outer`'s local variables after `outer` returns?**

Yes — if `inner` closes over them. When `inner` is defined inside `outer` and references a variable from `outer`, the JavaScript engine detects this reference and moves that variable from the stack to the heap. The stack frame for `outer` is popped when `outer` returns, but the variable survives on the heap, reachable only through `inner`. This is a closure: `inner` carries the environment from `outer` with it wherever it goes.

**2. Why do all handlers in a `for (var i = ...)` loop log the same value?**

Because `var` is function-scoped, not block-scoped. The entire `for` loop shares one `i` variable. All the handler functions close over the *same* `i`. The loop finishes and leaves `i` at its final value (3 for a 0,1,2 loop). When any handler runs later, it reads that single `i`, which is now `3`. Fix: use `let`, which creates a new block-scoped `i` for each iteration, giving each handler its own independent value.

**3. What does "lexical" mean in "lexical scope"?**

"Lexical" means "relating to the written text." Lexical scope means a variable lookup is determined by where the function is **written** in the source code — specifically, by which scopes textually enclose the function. This is determined at parse time, by reading the code, before any execution happens. The alternative — dynamic scope — determines variable lookups by the runtime call stack (who called the function). JavaScript uses lexical scope for all variables. This makes functions predictable: their behavior depends on where they are defined, not on who calls them.

---

*Next: LAB-008 — Recursion*
