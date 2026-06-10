# 26 — Finding the Domain Model: How Business Language Becomes Code

**Follows:** Lesson 25 — TDD and Domain Modeling  
**Question this lesson answers:** *"How would I know that `Batch` is an object with an `allocate` method? Don't I need a UML diagram or a spec first?"*

---

## The Short Answer

You already have the spec. It is the paragraph of business rules written in plain English.

The business language tells you the objects and the methods directly. You translate it — you do not invent it.

---

## The Translation Rules

There are two rules and they cover almost everything:

| In the business language | Becomes in code |
|---|---|
| A **noun** — a thing the business talks about | A **class** or **type** |
| A **verb** — an action the business performs on things | A **method** or **function** |

That is the entire system. Everything else is practice.

---

## Applied to the Book's Allocation Domain

Here is the text again. Read it looking only for **nouns** and **verbs**.

> A **product** is identified by a **SKU**.
> **Customers** place **orders**.
> An **order** comprises multiple **order lines**,
> where each **line** has a **SKU** and a **quantity**.
>
> The purchasing department orders small **batches** of stock.
> A **batch** has a unique ID called a **reference**, a **SKU**, and a **quantity**.
>
> We need to **allocate** order lines to batches.
> When we've **allocated** an order line to a batch,
> the **available quantity** is reduced by that amount.

Step through it:

### Nouns → Classes

| Noun from business | Class in code | Attributes |
|---|---|---|
| Batch | `class Batch` | `reference`, `sku`, `qty`, `eta` |
| Order line | `class OrderLine` | `orderid`, `sku`, `qty` |
| Available quantity | `batch.available_quantity` | computed property |
| SKU | `str` | just a string, no class needed |

Not every noun becomes its own class. "SKU" is just a string — a label.
"Available quantity" is a calculated property on `Batch`, not a separate object.
Judgment comes with practice, but start by giving every significant noun its own class
and collapse the simple ones later.

### Verbs → Methods

| Verb from business | Method in code | Lives on |
|---|---|---|
| allocate (a line to a batch) | `batch.allocate(line)` | `Batch` |
| can allocate | `batch.can_allocate(line)` | `Batch` |
| allocate (top-level operation across many batches) | `allocate(line, batches)` | module-level function |

The sentence structure tells you which object owns the method.

*"We allocate order lines **to batches**"* — the batch is what receives the allocation.
So the method lives on `Batch`.

*"Allocate to warehouse stock **in preference to** shipment batches"* — this is
comparing batches and choosing. No single batch does this. It is a standalone function
that takes a list of batches.

---

## Writing the Test IS the Design Decision

Here is the part that takes time to absorb.

When you write `batch.allocate(line)` in a test, you are not transcribing a spec that
already exists somewhere. **You are writing the spec.**

The test answers:

- What is this thing called? → `Batch`
- How do you create it? → `Batch("ref", "SKU", qty=20, eta=None)`
- What can you do with it? → `.allocate(line)`, `.can_allocate(line)`, `.available_quantity`
- What does calling it return? → nothing from `allocate`, `bool` from `can_allocate`, `int` from `available_quantity`

If writing `batch.allocate(line)` feels awkward in the test, that is feedback.
The test is telling you the design is wrong. Maybe `line.allocate_to(batch)` reads
more naturally in your domain. The discomfort is useful information — act on it
before writing any implementation.

This is why experienced developers describe TDD as a **design activity that produces
tests as a side effect**, not as a testing activity.

---

## The Full Chain

```
Business rule
    ↓
identify nouns → candidate classes
identify verbs → candidate methods
    ↓
write the test (this IS the design document)
    ↓
run the test → Red (NameError / ReferenceError)
    ↓
write the minimum code to pass → Green
    ↓
clean up → Refactor
    ↓
next test
```

### Concrete trace through Rule 1

```
Rule:
  "A batch has a unique ID called a reference, a SKU, and a quantity."

Nouns:     batch, reference, SKU, quantity
Decision:  class Batch(__init__(ref, sku, qty, eta))

Rule:
  "We need to allocate order lines to batches."

Verb:      allocate
Decision:  batch.allocate(line)  ← you chose this shape from the sentence

Rule:
  "The available quantity is reduced by x."

Noun:      available quantity (derived, not stored)
Decision:  batch.available_quantity  ← property, not method, because it is a thing not an action
```

Then the test writes itself:

```python
def test_allocating_reduces_available_quantity():
    # Arrange — from the nouns
    batch = Batch("batch-001", "SMALL-TABLE", qty=20, eta=None)
    line  = OrderLine("order-ref", "SMALL-TABLE", qty=2)

    # Act — from the verb
    batch.allocate(line)

    # Assert — from the rule
    assert batch.available_quantity == 18
```

---

## Where UML and Specs Actually Fit

You are right that there is a design step before writing tests. Modern teams use
two techniques that produce a richer spec than UML diagrams.

### 1. Event Storming

A workshop where developers and business people cover a wall with sticky notes:

- **Orange** — domain events ("Order placed", "Stock allocated", "Batch arrived")
- **Blue** — commands that trigger events ("Place order", "Allocate stock")
- **Yellow** — the people or systems that issue commands

After the workshop you have a timeline of everything the business cares about. Each event
is a noun (an `OrderPlaced` record), each command is a verb (an `allocate` function).
You did not need a UML tool — you needed Post-it notes and a wall.

### 2. Ubiquitous Language (from DDD)

The rule: **use the exact words the business uses, everywhere, without translation.**

If the business calls it a "batch," your class is called `Batch` — not `StockLot`,
not `InventoryGroup`, not `ProductContainer`. Not ever.

If the business says "we allocate lines to batches," your method is called `allocate` —
not `assign`, not `reserve`, not `link`.

The business language IS the spec. When your code uses the same words as the business,
a new developer who reads the business rules can immediately understand the code.
When your code uses different words, every developer must maintain a translation table
in their head.

### Why Not UML?

| UML diagram | Unit test |
|---|---|
| Describes the design | Proves the design works |
| Can be wrong or outdated | If it passes, it is correct by definition |
| Nobody reads it after day 1 | Runs on every commit |
| Requires a separate tool | Lives in the codebase |

A passing test suite IS the living specification of what the system does.

---

## Applied to CNC-SIM

You have already done this without realising it.

The geometry notes from building the app said:

> *"A line is defined by a start point, a method (Two Points, Horizontal, Vertical,
> At Angle), a length, an angle, and a construction Z depth."*

Nouns: line, start point, method, length, angle, Z depth  
Verbs: compute the end point

That became:

```typescript
interface LineOptions {
    method: LineMethod;    // noun: method
    startX: number;        // noun: start point
    startY: number;
    length: number;        // noun: length
    angle:  number;        // noun: angle
    z:      number;        // noun: Z depth
    endX:   number;        // noun: end point (for two-points method)
    endY:   number;
}

// verb: compute
function computeLineEnd(opts: LineOptions): { endX: number; endY: number }
```

And the tests follow directly from the business rules:

```typescript
test('horizontal line endpoint is offset along X by the given length', () => {
    // Arrange — from "horizontal line starts at a point, extends along X"
    const opts: LineOptions = {
        method: 'horizontal',
        startX: 0, startY: 5,
        length: 10, angle: 0, z: 0,
        endX: 0, endY: 0,
    };

    // Act — from "compute the end point"
    const result = computeLineEnd(opts);

    // Assert — from "endpoint is offset along X by the length"
    expect(result.endX).toBe(10);
    expect(result.endY).toBe(5);   // Y unchanged for horizontal
});
```

The business rule gave you the test. The test gave you the function signature.
The function signature gave you the implementation. That chain is TDD.

---

## The Practical Checklist

When you are handed a paragraph of business rules and need to write tests:

```
1. Read the paragraph once for understanding.

2. Read it again and underline every noun that represents a real thing
   the business thinks about. These are your candidate classes.

3. Read it again and circle every verb that describes an action
   performed on or between those things. These are your candidate methods.

4. For each method, ask: which noun is the subject of this action?
   The method lives on that class.

5. Write the test using those class names and method names exactly
   as the business uses them.

6. Run the test. It will fail. That is correct.

7. Write the minimum code to make it pass.
```

That is the complete process. Steps 2–4 replace UML. The test at step 5 replaces a
design document. The running tests at step 7 replace the maintenance of that document.

---

## Summary

The answer to "how would I know `Batch` has an `allocate` method" is:

1. The business told you — they said *"we allocate order lines to batches"*
2. You extracted the noun (batch → `Batch`) and the verb (allocate → `.allocate()`)
3. The sentence structure told you the method lives on the batch (it receives the allocation)
4. Writing the test was the moment you made that design decision concrete

You did not need UML. You needed to read the paragraph carefully and trust that the
business language contains the design.
