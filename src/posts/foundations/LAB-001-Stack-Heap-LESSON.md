# FOUNDATIONS — LAB-001 — The Call Stack and the Heap

**Prerequisites:** LAB-000 (bits, bytes, memory is physical — data is stored somewhere)

**What this lab adds:**
- You will crash the browser on purpose and understand exactly why it crashed
- You will see the call stack in real-time using browser tools
- You will discover why some variables disappear when a function returns and others don't
- You will understand why `a = b` sometimes copies a value and sometimes shares it

**Time:** 40–50 minutes

**Environment:** Browser DevTools console (F12 → Console). Everything runs right there.

---

> **Quick Check — try to answer before reading:**
>
> 1. If a function calls itself, and that function calls itself again, and so on — what eventually happens?
> 2. You write `let x = 5` inside a function. The function returns. Is `x` still in memory?
> 3. You write `let a = {score: 10}` and then `let b = a`. You change `b.score = 99`. What is `a.score`?
>
> *(Answers at the end of this lab)*

---

## What You Will Be Able To Do

When this lab is complete, you can look at any function call and describe: which variables are on the stack (temporary, gone when the function returns), which data is on the heap (persists until nothing references it), and why JavaScript passes objects by reference but passes numbers by value — and what that means for bugs you will write and debug for the rest of your career.

---

## Step 1 — Crash the Browser on Purpose

Let's start with a real failure. Open your browser console (F12 → Console) and paste this:

```js
function infinite() {
  return infinite(); // calls itself — no way to stop
}

infinite();
```

---

### SAVE AND TRY

Paste the code above into the console and press Enter.

**You should see:** An error. Something like:

```
Uncaught RangeError: Maximum call stack size exceeded
```

The browser did not freeze. It threw an error and stopped. That error is telling you something specific — there is a "call stack" and it has a "maximum size." You just hit it.

**Change something:** Before moving on, open the error and expand the stack trace (click the small triangle next to the error). You should see `infinite` repeated hundreds of times. Each line is one call. Count how many there are — somewhere between 10,000 and 15,000 depending on your browser. Change it back to an infinite loop when you're done looking.

---

That error was not vague. It named the exact data structure that overflowed. Now let's find out what that data structure actually is.

---

### Concept: The Call Stack

**What it is:** The call stack is a region of memory that tracks which function is currently running and where to return when it finishes — structured as a stack (last in, first out) of frames, one per active function call.

**The problem before — visible in plain code:**

```js
function greet(name) {
  return formatMessage(name);  // calls another function
}

function formatMessage(name) {
  return "Hello, " + name;
}

greet("Alice");
```

When `greet` calls `formatMessage`, the program needs to remember: (1) which function was interrupted, (2) which line it was on, and (3) the values of its local variables — so it can resume correctly when `formatMessage` finishes. Without a mechanism to track this, calling a function would destroy the caller's context.

**The solution:**

Before calling `formatMessage`, the runtime pushes a **stack frame** onto the call stack. A stack frame is a small block of memory containing:

- The function's local variables
- The return address (which line of the caller to resume)
- A pointer back to the caller's frame

When `formatMessage` returns, its frame is **popped** — erased from the stack. The runtime uses the saved return address to resume `greet` exactly where it left off.

```
greet("Alice") is called:
  ┌──────────────────────────┐  ← top of stack
  │  greet                   │
  │  local: name = "Alice"   │
  │  return to: [call site]  │
  └──────────────────────────┘

greet calls formatMessage:
  ┌──────────────────────────┐  ← top of stack
  │  formatMessage           │
  │  local: name = "Alice"   │
  │  return to: greet line 2 │
  ├──────────────────────────┤
  │  greet                   │
  │  local: name = "Alice"   │
  │  return to: [call site]  │
  └──────────────────────────┘

formatMessage returns "Hello, Alice":
  ┌──────────────────────────┐  ← top of stack
  │  greet                   │  ← resumes here
  │  local: name = "Alice"   │
  │  return to: [call site]  │
  └──────────────────────────┘

greet returns. Stack is empty.
```

**What it hides:**

All of this frame management is completely invisible to the programmer. You write `return formatMessage(name)` and the runtime handles: saving your local variables, recording the return address, switching to `formatMessage`'s frame, and restoring everything when it finishes. Without the call stack, function calls would be impossible — you could never return to the right place.

The invariant it protects: each function's local variables are private to that call. Two calls to the same function at the same time (recursion, concurrent execution) each get their own frame and cannot see each other's locals.

**Canonical example:**

A stack of plates. The last plate put on is the first plate taken off (LIFO — last in, first out). When a function is called, a plate goes on. When a function returns, a plate comes off. You cannot take the bottom plate without removing all the plates above it — which is exactly why a call 10 levels deep must return through all 10 levels in reverse order.

**Smallest possible example** — watch the stack live:

```js
function c() {
  console.trace(); // prints the current call stack to the console
  return "done";
}

function b() {
  return c();
}

function a() {
  return b();
}

a();
```

**Why it matters here:** The `infinite()` crash happened because each recursive call pushed a new frame without ever popping one — the stack grew until it hit the OS-enforced size limit (typically 1–10 MB). There is no way to grow the call stack indefinitely. This is a hard constraint you will hit in any language.

**You will see this again in:**
- Every stack trace in every error message — reading a stack trace is reading the call stack at the moment of the crash
- Recursion limits in Python (`RecursionError: maximum recursion depth exceeded`) — same constraint, Python's limit is 1,000 frames by default
- The "stack" in stack-based languages (Forth, PostScript, WebAssembly)
- Async/await and Promises — `await` suspends the current stack frame and parks it elsewhere, which is why async functions can wait without blocking
- Debugging: "step into" in a debugger literally means "push a new frame and execute its first line"

**Watch for:** The call stack is not visible in your source code — it is a runtime data structure. When you see an error with a stack trace, you are reading a snapshot of the call stack at the moment the error was thrown.

---

### SAVE AND TRY

Paste this into the console:

```js
function c() {
  console.trace();
  return "done";
}
function b() { return c(); }
function a() { return b(); }
a();
```

**You should see:** A stack trace printed in the console showing `c → b → a → (anonymous)`. Read it bottom-up: the bottom entry is where execution started, the top entry is where `console.trace()` was called. This is the exact call stack — live.

**In the console:**
```
console.trace
```
Then just type `console.trace()` directly. Expected: a one-frame stack trace showing just the console itself. The stack only has one frame because you called it from the top level.

**Change something:** Add a fourth function `d()` that calls `a()`. Paste the whole thing again. The trace now shows `c → b → a → d → (anonymous)` — one deeper. Change it back.

---

## Step 2 — See That Local Variables Vanish

Here is something surprising. Run this:

```js
function makeNumber() {
  let secret = 42; // local variable
  return secret;
}

let result = makeNumber();
console.log(result);   // 42 — the value came back
console.log(secret);   // What happens here?
```

---

### SAVE AND TRY

Paste the above code into the console.

**You should see:**
- `42` logged for `result`
- `Uncaught ReferenceError: secret is not defined` for the second line

**Change something:** Comment out the `console.log(secret)` line (add `//` before it) and run again. Only `42` prints. The variable `secret` existed only inside `makeNumber`'s stack frame. When the function returned, its frame was popped — `secret` ceased to exist.

---

This is not a JavaScript quirk. It is a direct consequence of the call stack. Local variables live in stack frames. Stack frames are popped when functions return. Therefore local variables are gone when their function returns.

The value `42` survived only because it was **returned** — copied out of the stack frame into the caller's variable `result` before the frame was destroyed.

This leads directly to the next question: if local variables disappear, where do objects and arrays live when they need to outlast the function that created them?

---

### Concept: The Heap

**What it is:** The heap is a large, unstructured region of memory where objects are stored. Unlike the stack (which is managed automatically as functions are called and return), heap memory persists until nothing references the object anymore.

**The problem before:**

```js
function makeUser() {
  let user = { name: "Alice", score: 0 };
  return user;  // if user lived on the stack, it would be gone after this return
}

let alice = makeUser();
alice.score = 100;  // we need alice to persist and be modifiable
```

If `user` lived on the stack, it would be destroyed when `makeUser` returned — but we need the object to outlive the function.

**The solution:**

When you write `{ name: "Alice", score: 0 }`, JavaScript:
1. Allocates memory for this object on the **heap** — a separate region from the stack
2. Stores the actual data there (the string "Alice", the number 0, the property names)
3. Puts a small **reference** (a memory address — just a number) on the stack

The stack variable `user` holds a reference (an address), not the object itself. When `makeUser` returns, the stack frame with the reference is popped — but the heap allocation remains. The caller receives the reference value as the return value and stores it in `alice`. Now `alice` holds the same address, pointing to the same heap object.

```
Stack:                         Heap:
┌────────────────┐             ┌────────────────────────┐
│ makeUser frame │             │ Object @ address 0x1A30 │
│  user: 0x1A30 ─┼─────────►  │  name: "Alice"          │
└────────────────┘             │  score: 0               │
                               └────────────────────────┘
makeUser returns → frame popped.

Stack:                         Heap:
┌────────────────┐             ┌────────────────────────┐
│ alice: 0x1A30 ─┼─────────►  │ Object @ address 0x1A30 │
└────────────────┘             │  name: "Alice"          │
                               │  score: 100             │
                               └────────────────────────┘
```

**What it hides:**

Memory allocation and deallocation. When you write `{}`, JavaScript calls the allocator to find free heap space, marks that space as used, and gives you back a reference. When nothing references an object anymore, the garbage collector finds it and frees the space — automatically, invisibly, without you writing a single line of cleanup code.

In languages without garbage collection (C, C++, Rust), the programmer manages this manually. In C: `malloc` allocates, `free` releases. Forgetting to call `free` is a **memory leak** — the heap fills up because freed objects are never reclaimed.

The invariant it protects: heap objects exist for exactly as long as something holds a reference to them, and no longer. You cannot hold a reference to freed memory (in languages with GC — in C this is possible and catastrophic).

**Canonical example:**

A parking garage is the heap. Stack frames are people. When a person (function call) arrives, they get a parking ticket (a reference — just a number). They can leave (function returns, stack frame popped), but their car (the object) stays in the garage. Someone else can use the ticket number to find the car. When no one has the ticket anymore, the attendant (garbage collector) reclaims the space.

**Smallest possible example:**

```js
// This demonstrates that objects outlive the function that created them:
function createCounter() {
  return { count: 0 };   // object allocated on heap, reference returned
}

let counter = createCounter(); // stack frame for createCounter is gone
                               // but the object still exists on the heap

counter.count++;  // still accessible — reference in 'counter' keeps it alive
counter.count++;
console.log(counter.count); // 2
```

**Why it matters here:** Every object, array, function, and string in JavaScript lives on the heap. The stack only holds primitive values (numbers, booleans, null, undefined) and references. This distinction is why modifying an object in one place affects it everywhere — you are modifying the single heap allocation that every reference points to.

**You will see this again in:**
- Memory leaks in browser apps — when you hold a reference to an object that should be gone (a DOM node, an event listener), it cannot be garbage collected and the heap grows forever
- Python `id()` function — returns the memory address of an object (its heap location)
- Rust's ownership system — a manual version of these rules enforced by the compiler
- React's virtual DOM — comparing old and new virtual trees to find what changed, which requires understanding reference equality
- Garbage collection pauses — in long-running apps, GC "stop-the-world" pauses cause frame drops; understanding the heap is how you avoid them

**Watch for:** The garbage collector runs on its own schedule. You cannot control when it runs. If you are timing performance in the console and get an occasional spike, a GC pause is often the cause.

---

### SAVE AND TRY

Paste this into the console:

```js
function createCounter() {
  return { count: 0 };
}

let a = createCounter();
let b = a;            // b gets a COPY of the reference — both point to same object

a.count = 99;
console.log(b.count); // What prints here?
```

**Expected:** `99` — not `0`. Both `a` and `b` hold the same heap address. Changing `a.count` modifies the object at that address. `b` looks up the same address and sees the change.

**Change something:** Now try with a primitive number:

```js
let x = 5;
let y = x;   // y gets a COPY of the VALUE 5, not a reference

x = 99;
console.log(y); // What prints here?
```

Expected: `5` — not `99`. Numbers live on the stack and are copied by value. `y` got its own copy of `5`, independent of `x`. Change `x` and `y` does not change.

---

### Concept: Value Types vs Reference Types

**What it is:** In JavaScript, primitive values (number, boolean, null, undefined, string, symbol, bigint) are copied when assigned or passed to a function; objects (including arrays and functions) are passed by reference — the reference (address) is copied, not the object itself.

**The problem before:**

This is one of the most common sources of JavaScript bugs. Run this:

```js
// INTENTION: double each number in the array
function doubleAll(numbers) {
  for (let i = 0; i < numbers.length; i++) {
    numbers[i] = numbers[i] * 2;  // modifying the array directly
  }
  return numbers;
}

let original = [1, 2, 3];
let doubled = doubleAll(original);

console.log(doubled);    // [2, 4, 6] — looks right
console.log(original);   // What do you expect?
```

**Paste this now and see what happens before reading further.**

---

### SAVE AND TRY

Paste the code above. 

**You should see:** `[2, 4, 6]` for both `doubled` AND `original`. The function was supposed to return a new doubled array — but it mutated the original. This is a reference bug. `original` and `numbers` (the parameter) both point to the same heap array. Modifying `numbers[i]` modifies the only copy of the array that exists.

**Change something:** Fix the function to return a new array without mutating the original. Replace the function body with:

```js
function doubleAll(numbers) {
  return numbers.map(n => n * 2);  // map creates a NEW array on the heap
}
```

Run it again. Now `original` stays `[1, 2, 3]` while `doubled` is `[2, 4, 6]`. The heap now has two separate arrays. Change it back to the mutating version so you remember what the bug looks like.

---

**The solution — understanding why:**

```
                  Heap:
Stack:            ┌─────────────────────┐
original: 0x2B10 ─┼─► Array @ 0x2B10   │
numbers:  0x2B10 ─┼─► [1, 2, 3]        │  ← both point here
                  └─────────────────────┘

After numbers[0] = numbers[0] * 2:
                  Heap:
Stack:            ┌─────────────────────┐
original: 0x2B10 ─┼─► Array @ 0x2B10   │
numbers:  0x2B10 ─┼─► [2, 2, 3]        │  ← same object, mutated
                  └─────────────────────┘
```

When `doubleAll` is called, the reference `0x2B10` is copied into the parameter `numbers`. Now there are two stack variables pointing to one heap array. Mutating through either one mutates the only copy.

**What it hides:**

The fact that there is only one copy of the object in memory. The language gives you two variable names that feel independent (`original` and `numbers`) but they are aliases to the same location.

The invariant it protects: heap objects are not silently duplicated when you pass them around. This is efficient — passing a million-element array to a function copies one reference (8 bytes), not the array (megabytes). But it means functions can mutate their callers' data unless you explicitly copy.

**Canonical example:**

Two roommates with a key to the same apartment. Both `original` and `numbers` have a key (reference) to the same apartment (heap object). If roommate A rearranges the furniture, roommate B comes home to rearranged furniture — they share the space.

Primitives are different: two people each read the number `42` from a whiteboard. Each person writes it down on their own piece of paper. If one person crosses out their `42` and writes `99`, the other person's paper still says `42`.

**Smallest possible example:**

```js
// Reference type — one object, two references:
let obj1 = { x: 1 };
let obj2 = obj1;
obj2.x = 99;
console.log(obj1.x); // 99 — same object

// Value type — two independent copies:
let num1 = 1;
let num2 = num1;
num2 = 99;
console.log(num1); // 1 — independent copy
```

**Why it matters here:** This distinction causes more bugs per hour of JavaScript programming than almost anything else. Every time you pass an array or object to a function and then look at the original afterward, you need to know: did the function mutate my data? The answer depends entirely on whether the function assigned to the parameter itself (no mutation possible) or mutated through the parameter (original is affected).

**You will see this again in:**
- React's rule "do not mutate state" — React compares old and new state by reference. If you mutate the old object and pass it back as the new state, `oldState === newState` is `true`, React sees no change, and the component does not re-render
- Redux state management — the entire architecture is built around never mutating, always returning new objects, so that reference comparison is fast
- Python: same issue. Lists and dicts are reference types. Numbers and tuples are value types.
- `Object.freeze()` — JavaScript's tool for preventing mutation
- Immer.js — a library that lets you write mutating code and internally produces new objects

**Watch for:** Arrays in JavaScript are objects and follow reference semantics. `let b = a` where `a` is an array gives you two references to one array, not a copy. To copy an array: `let b = [...a]` or `let b = a.slice()`.

---

### SAVE AND TRY

```js
// Demonstrating the React state bug:
let state = { count: 0 };

function wrongUpdate(s) {
  s.count++;      // mutates the original object
  return s;       // returns the SAME reference
}

let newState = wrongUpdate(state);
console.log(state === newState); // true or false?
```

**Expected:** `true` — they are the same object. A framework using `===` to check for changes would conclude "nothing changed" and skip re-rendering.

Now fix it:
```js
function rightUpdate(s) {
  return { ...s, count: s.count + 1 };  // spread creates a NEW object on the heap
}

let newState2 = rightUpdate(state);
console.log(state === newState2);  // true or false?
```

**Expected:** `false` — two separate heap objects. A framework sees them as different and re-renders.

**Change something:** Try `let arr = [1,2,3]; let arr2 = arr; arr2.push(4); console.log(arr)`. See that `arr` was mutated. Then fix it: `let arr2 = [...arr]; arr2.push(4); console.log(arr)`. Now `arr` is untouched.

---

## 🎯 Challenge: Fix the Stack Overflow

**You know:** Recursion pushes a stack frame on every call. If you recurse deep enough, you get `RangeError: Maximum call stack size exceeded`.

**The situation:** This function computes the nth Fibonacci number recursively and crashes for large inputs.

```js
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

fib(10);   // works: 55
fib(100);  // either takes forever or crashes (try it)
```

**Task:** Rewrite `fib` as an iterative function that uses no recursion and therefore uses a constant amount of stack space regardless of input size. It should:
- Compute the same correct Fibonacci values as the recursive version
- Handle `fib(1000)` without crashing or hanging
- Use only a fixed number of variables (no arrays that grow with n)

**Hints:**

1. You only need to remember the last two Fibonacci numbers to compute the next one
2. A `while` loop replaces the recursion — no function calls, no stack frames

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
function fib(n) {
  if (n <= 1) return n;

  let prev = 0;  // fib(0)
  let curr = 1;  // fib(1)

  for (let i = 2; i <= n; i++) {
    let next = prev + curr;  // compute the next fibonacci number
    prev = curr;              // slide the window forward
    curr = next;
  }

  return curr;
}

// Test:
fib(10)   // → 55
fib(50)   // → 12586269025
fib(1000) // → a very large number (JavaScript BigInt territory, but no crash)
```

**Key insight:** The iterative version uses exactly 3 local variables (`prev`, `curr`, `next`) no matter how large `n` is — the stack stays at exactly one frame. The recursive version uses O(n) stack frames, one per call — which is why it crashes for large n. This is a general principle: any recursive algorithm can be rewritten iteratively, usually with a manually managed stack or a sliding window, and the iterative version never risks stack overflow.

</details>

---

## What Just Happened

Two memory regions govern every running program. The **call stack** is small (a few megabytes), fast, and managed automatically — when a function is called, a frame is pushed; when it returns, the frame is popped and all local variables in it cease to exist. The **heap** is large, slower to allocate, and managed by the garbage collector — objects live there as long as any reference points to them.

The practical consequence you will feel every day as a programmer: primitives (numbers, booleans, strings) behave like independent copies because they live in stack frames that are thrown away. Objects and arrays behave like shared things because what gets copied is the reference (address), not the object — and there is only one object on the heap.

The `infinite()` crash happened because recursion without a base case fills the stack with frames that are never popped. The stack is physically limited. Every call pushes. Nothing ever pops. Eventually you run out of space. The error `Maximum call stack size exceeded` is the OS enforcing that limit.

---

## Final Check

| You can do this | This demonstrates |
|---|---|
| `infinite()` crashes with `RangeError: Maximum call stack size exceeded` | The call stack has a fixed maximum size; unbounded recursion exhausts it |
| `console.trace()` inside a nested function call prints the full call chain | The call stack is a real data structure you can read while the program runs |
| A local variable inside a function is undefined after the function returns | Local variables live in stack frames; the frame is destroyed when the function returns |
| `let b = a` where `a` is an object causes `a === b` to be `true` | Objects are reference types; the reference (address) is copied, not the object |
| `let y = x` where `x` is a number causes `x` and `y` to be independent | Primitives are value types; the value itself is copied |
| Mutating `numbers[i]` inside a function changes the caller's array | Both the parameter and the caller's variable hold the same heap reference |
| Iterative fibonacci handles `fib(1000)` without crashing | Iteration uses O(1) stack space; recursion uses O(n) stack frames |

---

## Quick Check Answers

**1. If a function calls itself, and that function calls itself again — what eventually happens?**
The call stack fills up. Each call pushes a new frame and never pops it. When the stack reaches its maximum size (set by the OS and runtime — typically a few megabytes), the runtime throws `RangeError: Maximum call stack size exceeded`. This is not a JavaScript quirk — every language that uses a call stack has this limit. Python's default is 1,000 recursive calls.

**2. You write `let x = 5` inside a function. The function returns. Is `x` still in memory?**
No. `x` is a local variable — it lives in the function's stack frame. When the function returns, its frame is popped and all local variables in it cease to exist. The value `5` only survives if it was explicitly returned (copied out of the frame into the caller's variable) before the frame was destroyed.

**3. You write `let a = {score: 10}` and `let b = a`, then change `b.score = 99`. What is `a.score`?**
`99`. Both `a` and `b` hold the same heap address — they are references to the same object, not copies of it. Modifying the object through `b` modifies the only copy of the object that exists. `a.score` and `b.score` both read from the same location in memory.
