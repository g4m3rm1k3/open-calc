# Lesson 67: Side Effects

**What you will build.** `sorted_lines_by_price(lines)` is meant to
produce a price-sorted preview of an order's line items for a receipt,
without touching the order itself. Written with `lines.sort(...)`, it
does something its name and call site give no hint of: it reorders the
real list permanently, in place. A caller who only wanted to *look* at a
sorted preview has, without meaning to, changed the order's actual
stored line order for good. This lesson fixes it with `sorted(lines,
...)` instead — a built-in that returns a new list, leaving the
original untouched. The transferable problem: nothing about
`sorted_lines_by_price`'s own name, signature, or call site told a
reader it might mutate what was handed to it — a **side effect** hiding
behind what looked, from the outside, like an ordinary
compute-and-return function.

**What you need to know first.** Configuration vs Code (Lesson 66) —
`load_enabled_payment_methods` reading a file is itself a side effect
(reaching outside the function for information, rather than depending
only on its arguments); this lesson names that category precisely and
applies it to a different, more common case, mutation, instead.
Encapsulation (Lesson 54) — `Order`'s own defensive copies exist
specifically to prevent exactly the kind of accidental mutation this
lesson demonstrates on an unprotected plain list.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still the **Design** stage. Carried through: this lesson names, in
general, the category of risk Lesson 54's defensive copy and Lesson
48's computed property were each already specific fixes for — a
function or method doing something to shared state that its own
signature gives no warning about.

**Terms introduced in this lesson.** One line each.

- **side effect** — any observable change a function makes beyond
  computing and returning its result: mutating an argument in place,
  writing to a file, changing shared or global state, printing to the
  screen. It's worth naming precisely because it's the one piece of
  information a function's own signature almost never states directly —
  a reader has to know to ask, or read the body, to find out whether
  calling something twice, or calling it "just to look," is actually
  safe.
- **pure function** — a function whose only effect is computing and
  returning a value, with no side effects at all: the same input always
  produces the same output, and calling it changes nothing else in the
  program, ever. It's the standard `sorted_lines_by_price` is measured
  against — the `.sort()` version looked pure from its own call site and
  wasn't; the `sorted(...)` version actually is.

**Objects and methods used.**

- **`list.sort(key=...)`** (a list's own in-place sorting method)
  - *What it is:* a method on the built-in `list` type that reorders the
    list's own elements according to `key`, returning `None`.
  - *Implementation:* `lines.sort(key=lambda line: line.unit_price)`
    mutates `lines` itself, in place, comparing elements by the result of
    calling `key` on each one; nothing new is returned — the return
    value is always `None`, which is itself a signal, easy to miss, that
    this method's whole point is the mutation, not a result to use.
  - *Its use:* this lesson's Problem section calls it inside
    `sorted_lines_by_price`, where its in-place nature is exactly the
    unintended side effect the lesson exists to catch.
- **`sorted(iterable, key=...)`** (the built-in sorting function)
  - *What it is:* a built-in function that returns a new, sorted list
    built from the elements of whatever iterable it's given, leaving the
    original completely untouched.
  - *Implementation:* `sorted(lines, key=lambda line: line.unit_price)`
    reads `lines` without modifying it, and returns a brand-new list
    object containing the same elements in sorted order.
  - *Its use:* this lesson's fix uses it specifically because it's a
    pure function with respect to its input — calling it never changes
    `lines`, no matter how many times it's called.

## Concept Unit: A Function That Looks Safe to Call and Isn't

### The Problem

A receipt needs to show an order's line items sorted by price, without
changing the order's own stored line order — a customer expects to see
their items listed in the order they added them, elsewhere in the same
receipt:

```python
def sorted_lines_by_price(lines):
    lines.sort(key=lambda line: line.unit_price)
    return lines


lines = [OrderLine("sku-3", 30), OrderLine("sku-1", 10), OrderLine("sku-2", 20)]
print("original add order:", lines)

preview = sorted_lines_by_price(lines)
print("price-sorted preview:", preview)
print("original list after the preview:", lines)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
original add order: [OrderLine('sku-3', 30), OrderLine('sku-1', 10), OrderLine('sku-2', 20)]
price-sorted preview: [OrderLine('sku-1', 10), OrderLine('sku-2', 20), OrderLine('sku-3', 30)]
original list after the preview: [OrderLine('sku-1', 10), OrderLine('sku-2', 20), OrderLine('sku-3', 30)]
```

The third line is the bug: `lines`, the *original* list, is now in
price order too — permanently. Nothing about calling
`sorted_lines_by_price(lines)`, reading its name, or looking at its
return value gave any warning that the argument itself would change.
`list.sort()` returns `None`, not a sorted list — this function only
appears to "return the sorted lines" because it also, silently,
returns the very argument it just mutated.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** the receipt-formatting code, modified.
- **Change type:** refactor — `.sort()` replaced with `sorted(...)`.
- **Location:** `sorted_lines_by_price`'s own body.
- **Dependencies:** none — `sorted` is a Python built-in.

### The New Code

The smallest new piece is the single call that replaces the mutation:

```python
return sorted(lines, key=lambda line: line.unit_price)
```

### The Updated Project

`sorted_lines_by_price`'s entire body becomes one line, returning a new
list instead of mutating and returning the argument it was given:

```python
def sorted_lines_by_price(lines):
    return sorted(lines, key=lambda line: line.unit_price)   # ← changed, replaces .sort() + return lines
```

Nothing about the function's name, parameters, or call sites changes at
all — every caller of `sorted_lines_by_price(lines)` keeps working,
unmodified, and gets back a genuinely independent, sorted list instead
of the original, quietly rearranged.

### Isolating the Concept: Two Functions, One Mutates, One Doesn't

The mechanism doing the real work above — the difference between a
method that sorts in place and a function that returns a new sorted
copy — is small and general enough to see clearly through Python's own
two built-in options, shown directly rather than through a separate
unrelated example:

```python
numbers = [3, 1, 2]
result = numbers.sort()
print("numbers after .sort():", numbers)
print("what .sort() itself returned:", result)

numbers2 = [3, 1, 2]
result2 = sorted(numbers2)
print("numbers2 after sorted():", numbers2)
print("what sorted() returned:", result2)
```

Running it produces:

```
numbers after .sort(): [1, 2, 3]
what .sort() itself returned: None
numbers2 after sorted(): [3, 1, 2]
what sorted() returned: [1, 2, 3]
```

`.sort()` mutated `numbers` in place and returned `None` — its whole
purpose is the side effect, and using its return value at all, the way
the Problem section's buggy version implicitly did, is itself a signal
something is wrong. `sorted()` left `numbers2` completely alone and
handed back a new list containing the sorted result — the shape a pure
function is supposed to have. This throwaway example is now discarded;
`numbers` and `numbers2` do not appear anywhere else in this lesson or
this project again.

### Mechanical Walkthrough

Working through the one syntactic element that actually changed:

- **`sorted(lines, key=lambda line: line.unit_price)`** — calls the
  built-in `sorted` function with two arguments: `lines`, the iterable
  to sort, and `key`, a function called once per element to determine
  its sort position — here, an anonymous `lambda` returning that line's
  `unit_price`. `sorted` reads every element of `lines` to build its
  result but never calls any mutating method on `lines` itself, which is
  exactly what makes the original list's own identity and contents
  untouched afterward.

### CS Lens

This is the distinction between a **pure function** and a function with
a **side effect**, one of the foundational ideas functional programming
is built around: a pure function's result depends only on its inputs,
and calling it can never change anything else in the program, which
means it can be called any number of times, in any order, from any
context, and always behaves the same way. `list.sort()` is not pure —
its entire purpose is a side effect. Neither Python nor most mainstream
languages force this distinction to be visible in a function's own
signature, which is exactly why `sorted_lines_by_price`'s original
version could hide a mutation behind what looked, from its name and
call site, like an ordinary transformation.

Also recognized in: React and other UI frameworks' insistence that
rendering functions be pure (calling them twice with the same input
should always produce the same output, with no side effect on anything
else), database query planners that can safely reorder or cache pure
computations but never a function with side effects, and spreadsheet
formula cells, which are pure by construction — a cell can never mutate
another cell as a side effect of being read.

### SE Lens

The principle is **a function's name and call site should not be the
only place a side effect could be hiding** — the alternative that was in
place before this lesson, `.sort()` used inside a function whose name
promised a *sorted result*, not a *mutation*, is exactly the trap: the
function's own name, `sorted_lines_by_price`, reads as if it computes
and returns something, giving no hint that calling it also silently
rewrites its argument. The real cost of preferring pure functions:
`sorted(lines, ...)` allocates a brand-new list on every call, which for
a very large list, called very often, is real, measurable extra memory
and time compared to sorting in place once — the identical honest
tradeoff Lesson 54 already named for defensive copies, recurring here
in a different, more common shape.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed version, against the identical unsorted starting
order:

```python
lines = [OrderLine("sku-3", 30), OrderLine("sku-1", 10), OrderLine("sku-2", 20)]
print("original add order:", lines)

preview = sorted_lines_by_price(lines)
print("price-sorted preview:", preview)
print("original list after the preview:", lines)
```

The real output:

```
original add order: [OrderLine('sku-3', 30), OrderLine('sku-1', 10), OrderLine('sku-2', 20)]
price-sorted preview: [OrderLine('sku-1', 10), OrderLine('sku-2', 20), OrderLine('sku-3', 30)]
original list after the preview: [OrderLine('sku-3', 30), OrderLine('sku-1', 10), OrderLine('sku-2', 20)]
```

The preview is correctly sorted by price, identical to the broken
version's own preview. What's different is the third line: `lines`
still shows items in their original add order, `sku-3, sku-1, sku-2` —
exactly as it was before `sorted_lines_by_price` was ever called. The
"preview" is now actually just a preview.

### Connecting Back

Where Lesson 54 protected one specific object's data with a defensive
copy, this lesson names the general category of risk that fix was
solving — a side effect hiding behind what looks like an ordinary
compute-and-return call — so it can be recognized anywhere it shows up,
not only in the one place this domain already happened to fix it.

## Connect the Pieces

The same three unsorted `OrderLine` objects were sorted for a receipt
preview twice in this lesson. First, using `.sort()`: the preview was
correct, and the original list was silently, permanently reordered too
— a side effect nothing about the call site revealed. Second, using
`sorted(...)`: the identical, correctly-sorted preview, with the
original list completely unchanged afterward — proving the fix wasn't
about the sorting logic at all, which was correct both times, but purely
about whether that logic was allowed to reach back and change what it
was given.

## What Breaks Without This

`sorted(lines, ...)` fixes the *specific* mutation this lesson found.
It says nothing about a *different* function elsewhere still reaching
for `.sort()` out of habit:

```python
def cheapest_line(lines):
    lines.sort(key=lambda line: line.unit_price)
    return lines[0]


receipt_lines = [OrderLine("sku-3", 30), OrderLine("sku-1", 10), OrderLine("sku-2", 20)]
cheapest = cheapest_line(receipt_lines)
print("cheapest item:", cheapest)
print("receipt_lines after finding the cheapest item:", receipt_lines)
```

Run for real, this is what comes back:

```
cheapest item: OrderLine('sku-1', 10)
receipt_lines after finding the cheapest item: [OrderLine('sku-1', 10), OrderLine('sku-2', 20), OrderLine('sku-3', 30)]
```

`cheapest_line` correctly finds the lowest-priced line — and, exactly
like `sorted_lines_by_price` before this lesson's fix, permanently
reorders `receipt_lines` as a side effect nobody asked for and nothing
in its name or return value reveals. This lesson's own fix taught the
pattern; it didn't apply itself automatically to every other function in
the same codebase reaching for the same convenient, mutating method.

## Exercises

1. Fix `cheapest_line` the same way this lesson fixed
   `sorted_lines_by_price` — using `min(lines, key=...)` instead of
   sorting at all — and prove with real output that `receipt_lines` is
   untouched afterward.
2. Write a `reversed_lines(lines)` function using Python's `.reverse()`
   list method, and demonstrate, with real output, that it has the
   identical hidden-mutation problem this lesson's own `.sort()` example
   had. Fix it using `list(reversed(lines))` or slicing, and prove the
   fix.
3. `Order.add_line`, from Lesson 49, deliberately *does* mutate
   `Order`'s own internal `_lines` — that's its entire job. Using this
   lesson's own vocabulary, explain in two or three sentences why
   `add_line` having a side effect is correct and expected, while
   `sorted_lines_by_price` having one was a bug, even though both
   "mutate a list."

## Definition of Done

- [ ] `sorted_lines_by_price` uses `sorted(...)`, not `.sort()`, and its
      own argument is left unmodified by calling it.
- [ ] The Problem section's silent mutation has been reproduced for
      real, against the *original* `.sort()`-based version, before you
      apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here.
- [ ] The "What Breaks Without This" `cheapest_line` scenario has been
      run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `side
      effects: use sorted() instead of .sort() so a receipt preview
      can't silently reorder the real order`, not `fix sort bug`.

Up next: Lesson 68, State Ownership — given that a side effect is any
change reaching outside a function, the deeper question of which single
piece of code should actually be allowed to own and change a given
piece of state in the first place.
