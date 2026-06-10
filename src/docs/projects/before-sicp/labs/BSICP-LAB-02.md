# Before SICP — LAB 02 — Names: Giving Values a Place to Live

**Prerequisites:** LAB 01. You know: expressions, evaluation, the console REPL,
primitive values (number, string, boolean).

**What this lab adds:**
- You bind a name to a value with `const`
- You use that name in later expressions
- You understand what SICP calls "the environment" — the place where names live
- You write your first multi-name computation (like computing an area, or a price)

**Time:** 25–35 minutes

---

> **Quick Check — answer these before reading further:**
>
> 1. In math, you write "let x = 5, then compute x + 3." The answer is 8.
>    How would you do this in the console if you can only type one expression
>    at a time?
> 2. SICP says "the interpreter maintains memory capable of keeping track of
>    name-value pairs." What would you call that memory in everyday terms?
> 3. If you type `const x = 5` and then `const x = 10` in the same console
>    session, what do you think happens?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A small computation broken into named steps — just like SICP's examples:

```javascript
const base   = 6;
const height = 4;
const area   = base * height / 2;

area   // → 12 (the area of a triangle)
```

And a price calculator that shows how naming makes complex formulas readable:

```javascript
const price    = 100;
const tax_rate = 0.08;
const discount = 15;
const total    = price + price * tax_rate - discount;

total  // → 93
```

---

## The Problem: Values Disappear

In LAB 01, you computed `Math.pow(2, 10)` and got `1024`. But the moment you
pressed Enter, that `1024` was gone. If you wanted to use it in the next
expression, you had to type `Math.pow(2, 10)` again.

What if the computation was expensive? What if you needed the result in five
different places? Recomputing it every time is wasteful and error-prone.

You need a way to give a value a name, and then use that name later.

---

### Concept: `const` — Binding a Name to a Value

**What it is:** A declaration that gives a name to a value. The name can then
be used in any later expression.

**The problem before:**
```javascript
100 + 100 * 0.08 - 15   // works, but what are these numbers?
                         // which one is the price? which is the tax?
                         // if price changes, you must find every 100 and update it
```

**The solution:** Name each value so the formula reads like a sentence:
```javascript
const price    = 100;
const tax_rate = 0.08;
const discount = 15;
const total    = price + price * tax_rate - discount;
```

Now `total` reads as: "price plus tax on the price minus discount." The intent
is clear. If price changes, you update one line.

**What it hides:** The connection between the name and the storage location.
`const price = 100` creates a slot in memory and labels it "price." You never
need to know WHERE in memory `price` lives — you just use the name.

**The invariant it protects:** `const` means the binding cannot be reassigned.
Once `price = 100`, you cannot later write `price = 200` to change it. If
you need a mutable value, JavaScript has `let` — but SICP JS uses `const`
almost exclusively in its early chapters because immutable values are easier
to reason about.

**Canonical example:**
```javascript
const x = 5;
x + 3    // → 8  (x is substituted with 5)
x * x    // → 25 (x is substituted with 5 again)
```

The name `x` stands in for `5` wherever it appears. This is exactly the
substitution you learned in algebra.

**Watch for:** `const` does not make the value appear in the console — it
just stores it. If you want to see the value, type the name on its own:
```javascript
const area = 6 * 4 / 2;  // silent — stores 12, prints nothing visible
area                       // → 12 (now you see it)
```

---

## Step 1 — Your First Named Value

Type this in the console:

```javascript
const x = 5;
```

**OPEN CONSOLE AND TRY**

**Expected:** The console shows `undefined` (that is `const`'s return value —
it is a statement, not an expression). But `x` is now defined.

Now type:

```javascript
x
```

**Expected:** `5`

Now type:

```javascript
x + 3
```

**Expected:** `8` — the name `x` was substituted with its value `5`.

```javascript
x * x
```

**Expected:** `25`

**Change something:** Before going further, try:
```javascript
x = 10
```

**Expected:** An error — `TypeError: Assignment to constant variable.`
`const` means the binding is permanent. You cannot change what name `x` refers to.

---

## Step 2 — Names Used in Other Names

Names can be built from other names:

```javascript
const base   = 6;
const height = 4;
const area   = base * height / 2;
```

Type all three lines, pressing Enter after each.

**OPEN CONSOLE AND TRY** (type all three, then:)

```javascript
area
```

**Expected:** `12`

This is a chain of bindings. When `area` is computed, the interpreter looks up
`base` (finds 6) and `height` (finds 4), then evaluates `6 * 4 / 2 = 12`.

**Change something:** After running the above, type `base`. Then type `height`.
Both names still exist. Now type `Math.sqrt(base * base + height * height)`.
What does it return? (Remember the Pythagorean theorem from LAB 01.)

---

### Concept: The Environment

**What it is:** The collection of all active name-to-value bindings. When you
evaluate an expression containing a name, the interpreter looks it up in the environment.

**Canonical example:**
```
Real-world: A classroom whiteboard where the teacher writes variable values.
  x = 5
  y = 3
When a student solves an expression using x and y, they look at the board.
The board IS the environment.
```

SICP says: *"The possibility of associating values with symbols and later retrieving
them means that the interpreter must maintain some sort of memory that keeps track
of the name-object pairs. This memory is called the environment."*

The console's environment is reset when you close the tab or refresh the page.
All your `const` bindings disappear. This is why each console session starts fresh.

**Watch for:** Using a name that has not been defined yet:
```javascript
z + 1
```
If `z` was never declared, you get: `ReferenceError: z is not defined`.
The interpreter looked in the environment, found no entry for `z`, and reported the error.

---

## Step 3 — Multi-Name Computation

Write this price calculator:

```javascript
const price    = 100;
const tax_rate = 0.08;
const discount = 15;
const total    = price + price * tax_rate - discount;
```

**OPEN CONSOLE AND TRY** (all four lines), then:

```javascript
total
```

**Expected:** `93`

Check: 100 + 100×0.08 - 15 = 100 + 8 - 15 = 93. Correct.

Now type:
```javascript
const price_with_tax = price + price * tax_rate;
price_with_tax
```

**Expected:** `108`

You can add more names at any time. Each new `const` extends the environment.

---

## Step 4 — SICP Style: Naming a Computation

In SICP JS, every formula is given a name. The book writes things like:

```javascript
const square    = x => x * x;
const cube      = x => x * x * x;
```

You will learn what `x => x * x` means in LAB 03. For now, just notice:
SICP assigns even *computations* to names, not just values. A name can hold
a function just as easily as it holds a number.

But first — let's practice naming values.

**Type this sequence:**

```javascript
const pi      = 3.14159;
const radius  = 5;
const area    = pi * radius * radius;
const perim   = 2 * pi * radius;
```

Then check each name:
```javascript
area
```
**Expected:** `~78.54`

```javascript
perim
```
**Expected:** `~31.41`

**Change something:** Try `const diameter = 2 * radius`. Then compute
`pi * diameter` — does it equal `perim`? Try it.

---

## Step 5 — Break It on Purpose

**Test 1:** Try redeclaring a name:

```javascript
const pi = 3.14159;
const pi = 3;           // try to redefine pi
```

**Expected error:** `SyntaxError: Identifier 'pi' has already been declared`

**Test 2:** Try using a name before declaring it:

```javascript
result + 1
const result = 10;
```

**Expected error:** `ReferenceError: Cannot access 'result' before initialization`

JavaScript's `const` does not allow use before declaration. This is called the
**temporal dead zone** — the name exists in the environment but cannot be accessed
until the `const` line runs.

> **Term: temporal dead zone** — the period between the start of a scope and
> the `const` declaration line. If you try to use the name in this zone, you
> get a ReferenceError. This is different from the variable not existing at all —
> the interpreter knows the name is coming, but refuses to let you access it early.

---

## 🎯 Challenge: Build a Geometry Toolkit

**The goal:** Using only `const` and arithmetic, compute all of the following for
a circle with radius 7:

1. The area (`π × r²`)
2. The circumference (`2 × π × r`)
3. The diameter (`2 × r`)
4. The ratio of area to circumference (hint: it simplifies to `r/2`)

Use `const pi = 3.14159` and `const r = 7`. Give each result a descriptive name.

After computing them all, type each name to verify the values.

Also: if you change `const r = 7` to `const r = 10`, which of your other
constants update automatically? (Remember: `const` is computed once when the
line runs — it does not "follow" changes to r afterward.)

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```javascript
const pi            = 3.14159;
const r             = 7;
const diameter      = 2 * r;
const area          = pi * r * r;
const circumference = 2 * pi * r;
const area_over_circ = area / circumference;

diameter       // → 14
area           // → 153.938...
circumference  // → 43.982...
area_over_circ // → 3.5  (which is r/2 = 7/2 = 3.5) ✓
```

**The key insight about "updating":** If you change `const r = 7` to `const r = 10`,
the other constants do NOT update automatically. `area` was already computed as
`pi * 7 * 7 = 153.938`. JavaScript does not maintain a live formula — it computes
the value ONCE when the `const` line runs, stores the result, and the name holds
that result forever (until the session ends).

This is why SICP introduces *functions* in its next section — functions let you
re-run a computation with different inputs. A `const` is a stored result;
a function is a reusable recipe.

</details>

---

## Final Check

| What | How to verify |
|------|---------------|
| `const x = 5` defines a name | Type `x` after — it returns `5` |
| Names can be used in later expressions | `x + 3` returns `8` |
| `const` cannot be reassigned | `x = 10` gives a TypeError |
| Using an undefined name gives ReferenceError | Tried `z + 1` with no `z` declared |
| Names can reference other names | `area = base * height / 2` works |
| Challenge: geometry toolkit complete | All four values computed and named |

---

## Quick Check Answers

**1. How do you use a previous result if you can only type one expression at a time?**
You cannot — unless you give it a name with `const`. `const result = Math.pow(2, 10)`
stores `1024` under the name `result`. Then `result + 1` evaluates to `1025`.
Without the name, the value is gone after the Enter key.

**2. What would you call the "memory that keeps track of name-value pairs"?**
A dictionary, a lookup table, a phone book — any data structure that maps keys
to values. SICP calls it the **environment**. The browser console maintains one
environment per tab. All your `const` declarations live in it.

**3. What happens if you declare `const x = 5` then `const x = 10`?**
An error: `SyntaxError: Identifier 'x' has already been declared`. The environment
already has an entry for `x`. `const` does not allow replacing an existing binding.
In SICP's model, this is intentional — once a name is bound to a value, that
binding is permanent within that environment.

---

## What Is Next — LAB 03

You know how to name a value. But what if the value you want to compute depends
on an input that changes? You cannot write a separate `const` for every possible
input. In LAB 03 you learn to name a *computation* — a function. This is the
most important concept in SICP's first chapter.

*Continue to Before SICP — LAB 03 — Functions: Naming a Computation.*
