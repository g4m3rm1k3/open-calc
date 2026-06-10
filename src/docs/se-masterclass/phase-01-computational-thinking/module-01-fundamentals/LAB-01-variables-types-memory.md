# SE Masterclass — LAB-01 — Variables, Types, and Memory

**Prerequisites:** Node.js installed. Ability to open a terminal and create a file.
No programming experience required.

**What this lab adds:**
- A Node.js script that runs from your terminal right now
- A mental model for how variables store values in memory
- Visible, runnable proof of the value vs reference distinction
- Why `0.1 + 0.2` is not `0.3` — IEEE 754 floating-point and the workarounds
- Why data types differ across languages, and the cost of getting it wrong
- Type coercion — JavaScript silently converting between types, and how to stop it
- Static vs dynamic typing — why static typing is more robust

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If you copy a number into a new variable and change the copy, does the original number change?
> 2. What do you think `0.1 + 0.2 === 0.3` evaluates to in JavaScript? (`true` or `false`?)
> 3. If two variables point to the same object, what happens when you modify the object through one of them?
> 4. Why might a language use separate `int` and `float` types instead of one `number` type?
> 5. What do you think `"5" - 3` produces in JavaScript? What about `"5" + 3`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node main.js` from your terminal prints:

```
Lab 01 is running

=== Primitive Types ===
42 is a number
Alice is a string
true is a boolean
undefined is a undefined

=== Value Copy ===
original: 10
copy: 10
--- after changing copy ---
original: 10  ← unchanged
copy: 99

=== Reference Copy ===
user.name: Alice
alias.name: Alice
--- after changing alias ---
user.name: Bob  ← changed!
alias.name: Bob

=== Floating Point ===
0.1 + 0.2 = 0.30000000000000004   ← not 0.3!
0.1 + 0.2 === 0.3 : false
workaround (cents): 30 cents
workaround (epsilon): true
workaround (toFixed): 0.30

=== Type Coercion ===
"5" + 3 = 53    ← string! + triggered concatenation
"5" - 3 = 2     ← number! - forced numeric conversion
"5" == 5 : true     ← loose equality coerces types
"5" === 5 : false   ← strict equality never coerces
Number("42") = 42   typeof: number
Number("")   = 0    ← empty string becomes zero!
Number("abc") = NaN ← not-a-number: conversion failed
parseInt("42px") = 42  ← stops at the non-digit
```

Each section is produced by one step. You will see the output grow as you add each step.

---

### Concept: What Is a Variable?

**What it is:** A variable is a named label that points to a value stored in memory.

**The problem before:** Without names, you would need to write raw memory addresses
to access values — `memory[0x4A2F]` instead of `score`. Code would be unreadable
and impossible to maintain.

**The solution:** When you write `const age = 25`, you are telling the computer:
"find a place in memory, store the number 25 there, and from now on, when I write
`age`, use that value."

**Canonical example (General Explanation):**

Think of a variable like a label on a jar. The jar holds a value. The label lets
you find it. You can look inside by using the label name.

```js
const temperature = 72     // the jar is labeled "temperature" and holds 72
console.log(temperature)   // open the jar → prints: 72
```

**Project Application (The "Why" here):**

Every piece of data in our script — numbers, names, objects — needs a variable
so we can refer to it by name. Without variables, we would repeat the same literal
values everywhere and have no way to update them in one place.

**Smallest possible example:**

```js
const score = 100
console.log(score)   // 100
```

**Why it matters here:** Every step in this lab stores values using variables.
This is the foundation everything else in the curriculum depends on.

**Watch for:** In JavaScript, `const` means "this label cannot be reassigned to
point to a different value." It does NOT mean the value itself is frozen — an
object declared with `const` can still have its properties changed. You will see
this distinction in Step 4.

---

## Step 1 — Get Something Running

Create a folder called `lab-01`. Inside it, create a file called `main.js`.

Add this to `main.js`:

```js
const message = "Lab 01 is running"   // a label pointing to a text value
console.log(message)                   // print the value to the terminal
```

### SAVE AND TRY

Open your terminal. Navigate to the `lab-01` folder. Run:

```
node main.js
```

**You should see:**

```
Lab 01 is running
```

**In the terminal, type:**

```
node -e "const x = 5; console.log(x)"
```

**Expected:** `5` — this runs a one-line Node.js program inline. It confirms your
Node.js installation works.

**Change something:** Change the string to your own name. Save. Run `node main.js`
again. You see your name printed. Change it back to `"Lab 01 is running"`.

---

### Concept: Primitive Types

**What it is:** JavaScript has five primitive types — `number`, `string`, `boolean`,
`null`, and `undefined`. A primitive is a single, indivisible value.

**The problem before:** Without types, the computer cannot interpret raw bytes.
The bits `01000001` could mean the number 65, the letter `A`, or something else.
Types tell the runtime what the bits represent and what operations are valid.

**The solution:** JavaScript automatically tracks the type of every value.
You can ask what type a value has using the `typeof` operator.

**Canonical example (General Explanation):**

Think of types like containers with rules: a number container only holds
quantities, a string container only holds text. `typeof` is like reading the
label on the container.

```js
typeof 42          // "number"
typeof "hello"     // "string"
typeof true        // "boolean"
typeof undefined   // "undefined"
```

**Project Application (The "Why" here):**

We need to see that different values have different types before we can understand
why they behave differently when copied. Type is the key to the value-vs-reference
distinction in Steps 3 and 4.

**Smallest possible example:**

```js
const count = 10
console.log(typeof count)   // "number"
```

**Why it matters here:** The type of a value determines how it is stored in memory —
and critically, how it behaves when you assign it to another variable.

**Watch for:** `typeof null` returns `"object"` in JavaScript. This is a
decades-old language bug that was never fixed for compatibility reasons.
`null` is NOT an object. Do not use `typeof` to detect `null`.

---

## Step 2 — Explore Primitive Types

Add to `main.js`, below the existing line:

```js
// === Primitive Types ===
console.log("\n=== Primitive Types ===")   // \n adds a blank line before the header

const count = 42             // ← add: a whole number (or decimal — JS treats them the same)
const name = "Alice"         // ← add: text, delimited by quotes
const isActive = true        // ← add: a boolean — only two possible values: true or false
const notYetSet = undefined  // ← add: a variable declared but never given a value

// typeof returns a string that names the type of the value
console.log(count, "is a", typeof count)
console.log(name, "is a", typeof name)
console.log(isActive, "is a", typeof isActive)
console.log(notYetSet, "is a", typeof notYetSet)
```

### SAVE AND TRY

Save. Run `node main.js`.

**You should see:**

```
Lab 01 is running

=== Primitive Types ===
42 is a number
Alice is a string
true is a boolean
undefined is a undefined
```

**In the terminal, type:**

```
node -e "console.log(typeof null)"
```

**Expected:** `"object"` — this is the historical bug. `null` means "intentionally
no value" but `typeof` misreports it as `"object"`.

**Change something:** Change `42` to `3.14`. Save. Run. The type still says
`"number"` — JavaScript makes no distinction between integers and decimals.
Change it back.

---

### Concept: Value Semantics — Copy by Value

**What it is:** When you assign a primitive to a new variable, the VALUE is
copied. The two variables are completely independent after that.

**The problem before:**

```js
let original = 10
let copy = original
copy = 99
// What is original now? 10 or 99?
```

Without understanding value semantics, this is confusing. Is `copy` an alias
for `original`, or is it its own thing?

**The solution:** Primitives are copied by value. When you write `let copy = original`,
the computer reads the value of `original` (10) and writes that number into a new,
separate memory slot for `copy`. After the assignment, `copy` and `original` are
completely independent — like two separate jars.

**Canonical example (General Explanation):**

Think of a photocopier. You copy a document. Now you have two separate sheets of
paper. Writing on one does not change the other.

```js
let original = 10
let copy = original   // copy gets its own 10 — like a photocopy
copy = 99             // only the copy changes
console.log(original) // still 10 — the original paper is untouched
```

**Project Application (The "Why" here):**

This is why you can safely pass numbers into functions, reassign variables, and
build calculations without worrying about accidentally modifying data elsewhere.
Any number you touch is yours alone.

**Smallest possible example:**

```js
let a = 5
let b = a      // b gets a copy of 5
b = 100
console.log(a) // 5 — unchanged
console.log(b) // 100
```

**Why it matters here:** This behavior is the OPPOSITE of what happens with objects.
Seeing value semantics clearly first makes the reference-type contrast in Step 4
immediately meaningful.

**Watch for:** This ONLY applies to primitives (`number`, `string`, `boolean`,
`null`, `undefined`). Objects behave differently. Expecting value semantics
from an object is one of the most common JavaScript bugs.

---

## Step 3 — Value Copying

Add to `main.js`, below the existing code:

```js
// === Value Copy ===
console.log("\n=== Value Copy ===")

let original = 10     // ← add: let (not const) so we can reassign below
let valueCopy = original  // ← add: valueCopy gets its own independent copy of 10

console.log("original:", original)    // ← add
console.log("copy:", valueCopy)

valueCopy = 99  // ← add: reassign ONLY the copy — original is a separate memory slot

console.log("--- after changing copy ---")
console.log("original:", original, " ← unchanged")   // ← add
console.log("copy:", valueCopy)
```

### SAVE AND TRY

Save. Run `node main.js`.

**You should see:**

```
=== Value Copy ===
original: 10
copy: 10
--- after changing copy ---
original: 10  ← unchanged
copy: 99
```

**In the terminal, type:**

```
node -e "let a = 'hello'; let b = a; b = 'world'; console.log(a)"
```

**Expected:** `"hello"` — strings are also primitives. The same copy-by-value
rule applies to all five primitive types.

**Change something:** Replace `valueCopy = 99` with `valueCopy = valueCopy * 2`.
Save. Run. The copy is `20`, the original stays `10`. Change it back.

---

## 🎯 Challenge: Predict String Behavior

**You know:** Primitives are copied by value — changes to the copy do not
affect the original.

**Task:** Before running the code, predict what each `console.log` will print.
Then verify by running it.

```js
let greeting = "hello"
let shout = greeting
shout = shout.toUpperCase()
console.log(greeting)   // What does this print?
console.log(shout)      // What does this print?
```

**Starting code:** Create a temporary file `predict.js` and paste this in. Run
`node predict.js` to verify your prediction.

Try to predict both outputs before running.

---

<details>
<summary>▶ Show Solution</summary>

```
hello
HELLO
```

**Key insight:** `toUpperCase()` does not modify the original string. It creates
a NEW string and returns it. Assigning the result to `shout` makes `shout` point
to the new `"HELLO"` string. `greeting` still points to `"hello"` — untouched.

Primitives cannot be mutated in place. Operations on primitives always produce
new values. This is why `shout = shout.toUpperCase()` does not affect `greeting`
even though `shout` was originally assigned from `greeting`.

</details>

---

### Concept: Reference Semantics — Copy by Reference

**What it is:** When you assign an object to a new variable, both variables
point to the SAME object in memory. The object itself is not copied.

**The problem before:** If objects copied by value the way primitives do, every
assignment would duplicate the entire object. A large object with hundreds of
properties would be expensive to copy every time it was passed around. And there
would be no clean way to share state across your program.

**The solution:** Objects are stored in a different area of memory called the
heap. Variables do not hold the object directly — they hold a **reference**,
which is a pointer to the object's location. When you assign one object variable
to another, you copy the reference (the address), not the object. Both variables
now point to the same location.

**Canonical example (General Explanation):**

Think of a shared Google Doc. Two people both have a link to the same document.
If one person edits it, the other sees the change immediately — because there is
only one document. The two links are independent, but what they point to is the same.

```js
const user = { name: "Alice" }   // one object created on the heap
const alias = user               // alias gets a copy of the link, not a copy of the object
alias.name = "Bob"               // modify the object through the alias link
console.log(user.name)           // "Bob" — same object was modified
```

**Project Application (The "Why" here):**

This is one of the most common sources of bugs in JavaScript. Understanding it
in this lab — with direct console proof — prevents hours of confusing debugging
in every future lab that involves state, objects, and functions.

**Smallest possible example:**

```js
const obj = { value: 1 }
const ref = obj
ref.value = 99
console.log(obj.value)   // 99 — they share the same object
```

**Why it matters here:** In every future lab where we pass objects to functions
or store application state, we need to know whether we are working with the
original data or an independent copy.

**Watch for:** `const` does NOT prevent an object from being modified. `const`
only prevents the variable from being reassigned to a different object entirely.
The object's contents are still fully mutable.

---

### Mental Model: Stack and Heap

**Official name:** Stack vs Heap Memory Model

**Why it exists:** A program needs two kinds of memory. Fast, fixed-size storage
for values the runtime knows the exact size of at compile time (primitives,
references). Flexible, dynamically-sized storage for things that can grow at
runtime (objects, arrays). The **stack** handles the first. The **heap** handles
the second.

**Concrete example from this lab:**

```
Stack (fast, fixed size):              Heap (flexible):
┌──────────────────────┐              ┌───────────────────────┐
│ original:  10        │              │                       │
│ valueCopy: 99        │              │  { name: "Bob" }  ◄───┼── user
│ user:      ──────────┼──────────────►                       │
│ alias:     ──────────┼──────────────►  (same address!)      │
└──────────────────────┘              └───────────────────────┘
```

`original` and `valueCopy` live entirely on the stack — each has its own slot
holding the actual number. `user` and `alias` also live on the stack, but their
slots hold memory addresses (references) pointing into the heap where the object
actually lives.

**Where you will see this again:**
- LAB-26 (Serialization) — copying object state from heap to JSON
- LAB-32 (Reactivity) — why React requires new objects instead of mutation
- LAB-50 (Auth Service) — why you must not mutate request objects in middleware

---

## Step 4 — Reference Types

Add to `main.js`, below the existing code:

```js
// === Reference Copy ===
console.log("\n=== Reference Copy ===")

const user = { name: "Alice" }   // ← add: an object stored on the heap
const aliasUser = user            // ← add: aliasUser gets a copy of the REFERENCE (the address), not a copy of the object

console.log("user.name:", user.name)          // ← add
console.log("alias.name:", aliasUser.name)

aliasUser.name = "Bob"   // ← add: modify the object through aliasUser — only one object exists

console.log("--- after changing alias ---")
console.log("user.name:", user.name, " ← changed!")   // ← add
console.log("alias.name:", aliasUser.name)
```

### SAVE AND TRY

Save. Run `node main.js`.

**You should see the full output:**

```
Lab 01 is running

=== Primitive Types ===
42 is a number
Alice is a string
true is a boolean
undefined is a undefined

=== Value Copy ===
original: 10
copy: 10
--- after changing copy ---
original: 10  ← unchanged
copy: 99

=== Reference Copy ===
user.name: Alice
alias.name: Alice
--- after changing alias ---
user.name: Bob  ← changed!
alias.name: Bob
```

**In the terminal, type:**

```
node -e "const a = {x:1}; const b = a; b.x = 99; console.log(a.x)"
```

**Expected:** `99` — confirms `a` and `b` share one object.

**Change something:** Add a second property `age: 30` to the user object.
Modify `aliasUser.age = 99`. Run. Both `user.age` and `aliasUser.age` print `99`.
Change it back.

---

## 🎯 Challenge: Real Independence

**You know:** Assigning an object variable copies the reference. Both variables
then share the same object data.

**Task:** Write a function `cloneUser` that takes a user object and returns a
brand-new object with the same properties. After cloning, changing one should
NOT affect the other.

**Starting code:**

```js
const original = { name: "Alice", age: 30 }

function cloneUser(user) {
  // TODO: return a new object with the same properties
  // Hint: create a new object literal {} and copy the properties manually
}

const copy = cloneUser(original)
copy.name = "Bob"

console.log(original.name)   // should print: Alice (unchanged)
console.log(copy.name)       // should print: Bob
```

**Hint:** You do not need any built-in copy functions. Create `{}` and assign
each property individually from the input.

---

<details>
<summary>▶ Show Solution</summary>

```js
function cloneUser(user) {
  return {
    name: user.name,   // copy each property into a brand-new object literal
    age: user.age      // new object gets its own heap location
  }
}
```

**Key insight:** Writing `{ name: user.name, age: user.age }` builds a new object
on the heap with the same property values but a different memory address. Now
`original` and `copy` point to two separate objects. Changing `copy.name` cannot
affect `original` because they no longer share an address.

This is called a **shallow clone**. It works correctly when all properties are
primitives. If a property is itself an object, you would need to clone that
object too — a concept called a **deep clone** that you will implement in LAB-26
(Serialization Engine).

</details>

---

---

### Concept: Floating-Point Numbers and IEEE 754

**What it is:** Computers store numbers in binary (base 2). Fractions that look clean in base 10 — like `0.1` — do not have a finite binary representation. The stored value is a tiny bit off. This error is called **floating-point imprecision**.

**The problem:**

```js
console.log(0.1 + 0.2)         // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3) // false
```

This is not a JavaScript bug. It is how floating-point arithmetic works in **every** language that uses IEEE 754 — Python, C, C++, Java, Rust, all of them. JavaScript's `number` is a 64-bit IEEE 754 double-precision float. It can represent numbers with about 15–17 significant decimal digits but cannot represent all fractions exactly.

**Why it happens — the short version:**

`0.1` in binary is `0.0001100110011001100110011...` repeating infinitely, just like `1/3` in base 10 is `0.3333...` repeating. The computer must cut it off somewhere. The stored value is `0.1000000000000000055511151231257827021181583404541015625` — off by about `5.5 × 10⁻¹⁸`. Small, but not zero. When you add two of these slightly-off numbers, the errors accumulate.

**The IEEE 754 64-bit double layout:**

```
63       62      52 51                               0
┌───────┬──────────┬────────────────────────────────┐
│  sign │ exponent │           mantissa             │
│  1 bit│  11 bits │            52 bits             │
└───────┴──────────┴────────────────────────────────┘
  0 = +         ↑                    ↑
  1 = -    range of values    precision of values
```

The mantissa stores the significant digits. 52 bits gives you about 15–16 decimal digits of precision. The exponent stores the scale. Together they can represent numbers from roughly `5 × 10⁻³²⁴` to `1.8 × 10³⁰⁸` — but not every decimal fraction in between.

**Why other languages have more numeric types:**

JavaScript has ONE number type — always a 64-bit double. This is convenient but imprecise for integers above `2⁵³`. C, C++, Java, and Rust have multiple types:

| Type | Size | Range | Use |
|------|------|-------|-----|
| `int8` / `byte` | 8 bits | -128 to 127 | tiny counters |
| `int32` / `int` | 32 bits | ±2.1 billion | general integers |
| `int64` / `long` | 64 bits | ±9.2 × 10¹⁸ | large integers, IDs |
| `float` | 32 bits | ~7 sig. digits | graphics, physics |
| `double` | 64 bits | ~15 sig. digits | general floating point |

Why does this matter? **Memory layout and performance.** An array of 1 million `int32` values takes 4 MB. The same array as `double` takes 8 MB. In graphics, the GPU processes `float` arrays in SIMD operations — using `double` halves your throughput. Choosing the wrong type wastes memory, slows code, and can introduce overflow bugs: `int8` cannot hold 200.

**Three workarounds for floating-point imprecision:**

**1. Integer arithmetic** — work in the smallest indivisible unit (cents, not dollars):
```js
// WRONG: 0.1 + 0.2 !== 0.3
// RIGHT: work in cents (integers), convert only at display time
const priceCents = 10 + 20   // 30 — exact integer arithmetic
const priceDisplay = priceCents / 100   // 0.30 — display only
```

**2. `Number.EPSILON` comparison** — never compare floats with `===`:
```js
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON   // true — "close enough"
// Number.EPSILON ≈ 2.22 × 10⁻¹⁶ — the smallest representable difference
```

**3. `toFixed(n)`** — round to `n` decimal places for display:
```js
(0.1 + 0.2).toFixed(2)   // "0.30" — returns a string
```

**What it hides (Law 7):** The `Number.EPSILON` workaround hides the question of whether the error is within acceptable tolerance. The protected invariant: two floating-point results are considered equal if their difference is smaller than the smallest representable unit of difference.

**Where you will see this:** Every financial calculation, every physics simulation, every graphics coordinate — anywhere floats are compared for equality. The Python `decimal` module, Java's `BigDecimal`, and JavaScript's proposed `Decimal` type all exist to solve this exact problem.

---

## Step 5 — Floating Point

Add to `main.js`, below the existing code:

```js
// === Floating Point ===
console.log("\n=== Floating Point ===")

const a = 0.1
const b = 0.2
console.log(`0.1 + 0.2 = ${a + b}`)               // ← add: shows the imprecision
console.log(`0.1 + 0.2 === 0.3 : ${a + b === 0.3}`) // ← add: false!

// Workaround 1: integer arithmetic (multiply by 100 to work in cents)
const aCents = 10   // 10 cents = $0.10
const bCents = 20   // 20 cents = $0.20
console.log(`workaround (cents): ${aCents + bCents} cents`)   // ← add: 30 — exact!

// Workaround 2: Number.EPSILON — compare by tolerance instead of exact equality
// Number.EPSILON is the smallest difference JavaScript can represent
console.log(`workaround (epsilon): ${Math.abs(a + b - 0.3) < Number.EPSILON}`)  // ← add: true

// Workaround 3: toFixed — round to N decimal places for display (returns a string)
console.log(`workaround (toFixed): ${(a + b).toFixed(2)}`)   // ← add: "0.30"
```

### SAVE AND TRY

Save. Run `node main.js`.

**Expected new section:**
```
=== Floating Point ===
0.1 + 0.2 = 0.30000000000000004
0.1 + 0.2 === 0.3 : false
workaround (cents): 30 cents
workaround (epsilon): true
workaround (toFixed): 0.30
```

**In the terminal, try each of these — predict the output first:**
```
node -e "console.log(0.3 - 0.1)"
```
**Expected:** `0.19999999999999998` — subtraction also accumulates error.

```
node -e "console.log(Number.MAX_SAFE_INTEGER)"
```
**Expected:** `9007199254740991` — this is `2⁵³ - 1`. JavaScript integers above this value are not represented exactly. The reason: the mantissa has 52 bits plus an implicit leading 1 = 53 bits of integer precision.

```
node -e "console.log(Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2)"
```
**Expected:** `true` — both values map to the same float. This is why JavaScript uses `BigInt` for large integers (like database IDs or cryptographic keys).

**Change something:** Try `(0.1 + 0.2).toFixed(20)`. Run. You see all 20 decimal places of the imprecision. Change it back.

---

### Concept: Type Coercion and Explicit Casting

**What it is:** JavaScript automatically converts between types in certain operations. This is called **implicit type coercion**. It is convenient but dangerous — it silently changes what your code does.

**The three coercion rules that cause the most bugs:**

**Rule 1: `+` with a string is concatenation, not addition:**
```js
"5" + 3    // "53" — 3 is converted to string and concatenated
3 + "5"    // "35" — same rule: any string + anything = string
5 + 3 + "1"  // "81" — left to right: 5+3=8, then "8"+"1"="81"
"1" + 5 + 3  // "153" — "1"+5="15", then "15"+3="153"
```

**Rule 2: Arithmetic operators other than `+` force numeric conversion:**
```js
"5" - 3    // 2  — "-" forces both sides to numbers
"6" * "2"  // 12 — both strings converted to numbers
"abc" - 1  // NaN — "abc" cannot be converted to a number
```

**Rule 3: `==` (loose equality) coerces types; `===` (strict equality) never does:**
```js
"5" == 5    // true  — JS converts "5" to 5, then compares
"5" === 5   // false — types differ, no conversion, immediately false
null == undefined  // true  — a special exception in the spec
null === undefined // false — strict never converts
0 == false  // true  — false converts to 0
0 === false // false
```

**The safe rule:** Always use `===` and `!==`. Never use `==`. The spec authors themselves regret `==`.

**Explicit conversion — taking control:**

When you *want* to convert a type, do it explicitly:

```js
Number("42")     // 42       — convert string to number
Number("")       // 0        — empty string becomes 0 (!
)
Number("abc")    // NaN      — failed conversion returns NaN
Number(true)     // 1        — boolean to number
Number(false)    // 0
parseInt("42px") // 42       — stops at the first non-digit character
parseFloat("3.14abc") // 3.14
String(42)       // "42"     — number to string
Boolean(0)       // false    — falsy values: 0, "", null, undefined, NaN, false
Boolean("0")     // true     — non-empty string, even "0", is truthy
```

**The `NaN` trap:** `NaN` (Not a Number) is the result of a failed numeric conversion or invalid arithmetic (`0/0`, `Math.sqrt(-1)`). The bizarre rule: `NaN !== NaN` — NaN is not equal to itself! Use `Number.isNaN(value)` to detect it.

**What it hides (Law 7):** Implicit coercion hides type mismatches that should be errors. A compiler in a statically-typed language rejects `"5" + 3` at compile time. JavaScript silently produces `"53"` — which may crash a loop 10 lines later when something expects a number, far from the point of the mistake.

**Where you will see this:** Every user input from `<input>` elements arrives as a string. `parseInt` and `Number()` are required before any arithmetic. Ignoring this is one of the most common sources of bugs in JavaScript web apps.

---

## Step 6 — Type Coercion

Add to `main.js`, below the existing code:

```js
// === Type Coercion ===
console.log("\n=== Type Coercion ===")

// The + operator: string + anything = string concatenation
console.log(`"5" + 3 = ${"5" + 3}`)    // ← add: "53" — NOT 8!
console.log(`"5" - 3 = ${"5" - 3}`)    // ← add: 2 — minus forces numeric conversion

// == vs ===
console.log(`"5" == 5 : ${"5" == 5}`)    // ← add: true  — loose equality coerces
console.log(`"5" === 5 : ${"5" === 5}`)  // ← add: false — strict equality never coerces

// Explicit conversion — you control what happens
console.log(`Number("42") = ${Number("42")}   typeof: ${typeof Number("42")}`)   // ← add
console.log(`Number("")   = ${Number("")}    ← empty string becomes zero!`)      // ← add
console.log(`Number("abc") = ${Number("abc")} ← not-a-number: conversion failed`) // ← add
console.log(`parseInt("42px") = ${parseInt("42px")}  ← stops at the non-digit`)   // ← add
```

### SAVE AND TRY

Save. Run `node main.js`. The full output should now show all 6 sections.

**Expected new section:**
```
=== Type Coercion ===
"5" + 3 = 53    ← string! + triggered concatenation
"5" - 3 = 2     ← number! - forced numeric conversion
"5" == 5 : true     ← loose equality coerces types
"5" === 5 : false   ← strict equality never coerces
Number("42") = 42   typeof: number
Number("")   = 0    ← empty string becomes zero!
Number("abc") = NaN ← not-a-number: conversion failed
parseInt("42px") = 42  ← stops at the non-digit
```

**In the terminal, predict before running:**
```
node -e "console.log(1 + 2 + '3')"
```
Your prediction: ___

```
node -e "console.log('1' + 2 + 3)"
```
Your prediction: ___

**Expected:** `"33"` and `"123"` — the `+` rule applies left-to-right. Once a string appears, all subsequent `+` are concatenation.

```
node -e "console.log(NaN === NaN)"
```
**Expected:** `false` — NaN is the only value in JavaScript not equal to itself. Use `Number.isNaN(NaN)` to test for NaN.

**Change something:** Change `Number("abc")` to `Number("3.14")`. Run. The output changes to `3.14` with `typeof: number`. Change it back.

---

### Concept: Static vs Dynamic Typing

**What it is:** In a **dynamically typed** language (JavaScript, Python), types are checked at runtime — when the code runs. In a **statically typed** language (TypeScript, Java, C++, Rust), types are checked at compile time — before the code runs.

**Dynamic typing — flexibility with risk:**
```js
// JavaScript — dynamic
let value = 42          // number at this moment
value = "hello"         // now it's a string — no error
value = { x: 1 }       // now it's an object — no error

function add(a, b) { return a + b }  // what types are a and b?
add(5, 3)         // 8  — works as expected
add("5", 3)       // "53" — silently wrong, no warning
add({}, [])       // "[object Object]" — absurd, no error
```

The bug from `add("5", 3)` will not surface until that call is actually executed — potentially not until it hits a user in production.

**Static typing — safety with verbosity:**
```ts
// TypeScript — static (TypeScript is JavaScript with types)
function add(a: number, b: number): number {
  return a + b
}

add(5, 3)      // ✅ compiles
add("5", 3)    // ❌ compile error: Argument of type 'string' is not assignable to parameter of type 'number'
add({}, [])    // ❌ compile error — caught before the code ever runs
```

**Why static typing is more robust:**

| Property | Dynamic (JS) | Static (TS, Java, C++) |
|----------|-------------|------------------------|
| When errors are caught | Runtime — in production | Compile time — before shipping |
| IDE support | Limited autocomplete | Full autocomplete, jump-to-definition |
| Refactoring safety | Manual search | Compiler finds every affected call site |
| Self-documentation | Must read the function body | Signature describes input/output types |
| Performance | Runtime type checks | Compiler optimizes based on known types |
| Common bug class | Type mismatch (silent) | Eliminated at compile time |

**Strong vs weak typing (different axis):**
- **Weak typing** (JavaScript): implicit coercion — `"5" + 3 = "53"` without error
- **Strong typing** (Python, Java, Rust): no implicit coercion — `"5" + 3` raises `TypeError`

Note: dynamic/static and strong/weak are independent dimensions. Python is dynamically typed (types checked at runtime) but strongly typed (no silent coercion). JavaScript is dynamically typed AND weakly typed (silent coercion everywhere).

**Where you will see this:** LAB-07 introduces TypeScript (statically typed JavaScript). Rust (LAB-11) is the most aggressively statically typed language in common use — if it compiles, most categories of bugs are guaranteed not to exist at runtime. You will feel the difference directly.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `node main.js` runs without errors | No red text in terminal, all 6 sections print |
| Primitive types section prints all 4 values with correct types | Output shows `number`, `string`, `boolean`, `undefined` |
| Value copy: original is 10 after copy is changed to 99 | Output shows `original: 10  ← unchanged` |
| Reference copy: user.name is "Bob" after alias is modified | Output shows `user.name: Bob  ← changed!` |
| Floating point: `0.1 + 0.2 === 0.3` prints `false` | Confirmed in Step 5 output |
| All three floating-point workarounds print correctly | cents=30, epsilon=true, toFixed="0.30" |
| `"5" + 3` prints `53` (string), `"5" - 3` prints `2` (number) | Step 6 output confirms coercion rules |
| `Number("abc")` prints `NaN` | Explicit conversion failure shown |
| You can explain static vs dynamic typing in one sentence each | Without looking at the lab |
| You can explain why `==` is dangerous | Type coercion concept, without notes |

---

## Quick Check Answers

**1. If you copy a number into a new variable and change the copy, does the original change?**

No. Numbers are primitives and are copied by value. When you write `let copy = original`, the computer copies the actual number into a new, independent memory slot. Changing `copy` later has no effect on `original`. Demonstrated in Step 3 where `original` stayed `10` after `valueCopy` was set to `99`.

**2. What does `0.1 + 0.2 === 0.3` evaluate to?**

`false`. JavaScript's `number` is a 64-bit IEEE 754 double-precision float. `0.1` and `0.2` cannot be represented exactly in binary, so the stored values are slightly off. When added together, the error accumulates: the actual result is `0.30000000000000004`. The workarounds are: integer arithmetic (work in cents), `Number.EPSILON` comparison for tolerance, or `toFixed()` for display rounding.

**3. If two variables point to the same object, what happens when you modify the object through one of them?**

Both variables reflect the change. There is only one object in memory (on the heap). Both variables hold references (addresses) pointing to that same object. Modifying the object through either variable modifies the single shared object — as shown in Step 4 where `user.name` became `"Bob"` even though we wrote `aliasUser.name = "Bob"`.

**4. Why might a language use separate `int` and `float` types instead of one `number` type?**

Two reasons: memory and precision. A 32-bit `int` takes half the space of a 64-bit `double`, which matters for arrays of millions of values (graphics, physics, machine learning). And integers above `2⁵³` cannot be represented exactly as doubles — the precision loss is silent and dangerous. Languages like C, Java, and Rust expose the type-size tradeoff to the programmer so they can choose the right fit. JavaScript hides it for simplicity but pays the cost: no native 64-bit integers (hence `BigInt`), and all arithmetic is floating-point even when you want integer behavior.

**5. What do `"5" - 3` and `"5" + 3` produce?**

`"5" - 3` produces `2` (a number). The `-` operator has no string behavior — it forces both operands to numbers. `"5"` becomes `5`, minus `3` equals `2`. `"5" + 3` produces `"53"` (a string). The `+` operator is overloaded — when either operand is a string, it concatenates instead of adding. `3` is converted to `"3"`, then `"5"` + `"3"` = `"53"`. This asymmetry is one of JavaScript's most notorious inconsistencies. The safe fix: always use `Number()` to convert string inputs before any arithmetic.

---

*Next: [LAB-02 — Functions, Closures, and Memoization](LAB-02-functions-and-abstraction.md)*
