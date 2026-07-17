---
concept: 170-side-effects
name: Side Effects
---

## Definition

A side effect is any observable change a function makes BEYOND simply
computing and returning a value — mutating an argument, modifying a
global variable, writing to a file or database, making a network request,
or printing to the console are all side effects.

## Problem

Side effects are often necessary (a program that never actually DOES
anything observable — no output, no saved data — isn't useful), but
unmanaged, unpredictable side effects scattered throughout a codebase make
it hard to know what a given piece of code will actually do without
reading its ENTIRE implementation, and make testing much harder (side
effects often need to be mocked or cleaned up). Being deliberate about
WHERE side effects happen (vs. keeping the rest of the logic pure) is the
actual engineering goal, not eliminating them entirely.

## Execution

A pure computation that just totals up item prices and returns a number —
no side effects
↓
Logging to the console — writes an OBSERVABLE effect beyond the
function's return value
↓
Making a real network request — an effect that reaches OUTSIDE the
program entirely
↓
Mutating a data structure that exists OUTSIDE the function's own local
scope
↓
A well-organized function often separates these: compute the result
PURELY first, THEN perform any side effects (logging, saving, sending) as
a clearly separate, final step — rather than interleaving computation and
side effects throughout

## Computer Science

Side effects are precisely what distinguish an impure function (see Pure
Functions) from a pure one — a function with zero side effects (and no
dependency on external state) is pure by definition; any single side
effect, however small, makes it impure.

Tags: Purity boundary, Observable effects, I/O

## Software Engineering

A common, valuable structuring principle is "functional core, imperative
shell" — keep the bulk of a program's actual LOGIC in pure functions with
no side effects, and push all the necessary side effects (database
writes, network calls, logging) to a thin outer layer that calls those
pure functions — this keeps the majority of the codebase easy to test and
reason about, while still allowing the program to do real, observable
things.

Tags: Functional core imperative shell, Testable logic, I/O boundary

## Common Mistakes

- Scattering side effects (logging, mutation, network calls) throughout core computation logic instead of separating them — this makes the computation harder to test in isolation, since testing it also triggers the unrelated side effects.
- Assuming "side effect" only means something dramatic like a network call — a function silently mutating one of its own arguments is just as much a side effect, and just as important to be deliberate about.

## Exercises

- Identify every side effect in a function you've written recently (mutations, I/O, logging), and consider whether any of them could be moved to a separate step, keeping the core computation pure.
- Explain why testing a function with side effects (like one that writes to a real file) is typically harder than testing an equivalent pure function.

## javascript

```javascript
// Separating a PURE calculation from its side effects (logging), rather
// than interleaving them, demonstrating the "compute, then act" structure.
function calculateTotal(items) {
  // pure -- no side effects, just returns a number based purely on its input
  return items.reduce((sum, i) => sum + i.price, 0)
}

function checkout(items) {
  const total = calculateTotal(items)   // pure computation, isolated and separately testable
  console.log(`Total: $${total}`)       // side effect -- happens AFTER, and separately from, the computation
  return total
}

const items = [{ price: 10 }, { price: 25 }]
console.log(calculateTotal(items))   // 35 -- can be tested with ZERO side effects, just checking the return value
checkout(items)                      // 'Total: $35' -- the side effect (logging) happens here, separately
```
Walkthrough: `calculateTotal` can be tested completely in isolation — call
it, check the returned number, done, with no console output or other
observable effect to account for. `checkout` is where the side effect
(logging) actually happens, kept as a clearly separate step AFTER the
pure computation, rather than mixed into `calculateTotal` itself.

## python

```python
def calculate_total(items):
    # pure -- no side effects, just returns a number based purely on its input
    return sum(item['price'] for item in items)


def checkout(items):
    total = calculate_total(items)   # pure computation, isolated and separately testable
    print(f'Total: ${total}')        # side effect -- happens AFTER, and separately from, the computation
    return total


items = [{'price': 10}, {'price': 25}]
print(calculate_total(items))   # 35 -- can be tested with ZERO side effects, just checking the return value
checkout(items)                 # Total: $35 -- the side effect (printing) happens here, separately
```
Walkthrough: identical pure-computation-then-separate-side-effect
structure as the JavaScript version — `calculate_total` is fully testable
in isolation, while `checkout` is where the actual observable side effect
occurs, kept as a distinct step.
