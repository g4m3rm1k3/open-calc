---
series: python-fundamentals
level: 30
title: Refactoring
lang: python
---

Refactoring is changing how code is written without changing what it does. A refactored function passes exactly the same tests as the original. The goal is code that is easier to read, easier to change, and harder to break. This lesson teaches the four techniques that eliminate the most common sources of confusion: extracting functions, using guard clauses, choosing descriptive names, and removing duplication.

## What Refactoring Is Not

Refactoring is not fixing a bug. It is not adding a feature. It is not rewriting from scratch.

Refactoring is a sequence of small, safe changes — each one leaves the tests passing:

```text
Before                        After
─────────────────────────────────────────────────────
Same observable behaviour     Same observable behaviour
Hard to read                  Easy to read
Tangled logic                 Clear structure
Repeated code                 Single source of truth
```

The tests you wrote in Level 29 are what make refactoring safe. Without them, you cannot know whether a change broke something.

## Extract Function — Naming a Chunk of Logic

When a block of code inside a function does one identifiable thing, extract it into its own function with a descriptive name:

```python
def report_bmi(weight_kg, height_m):
    bmi = weight_kg / (height_m ** 2)
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25.0:
        category = "Normal"
    elif bmi < 30.0:
        category = "Overweight"
    else:
        category = "Obese"
    print(f"BMI: {bmi:.1f} — {category}")
```

The BMI calculation and the categorisation are two different responsibilities. Extract each:

```python
def calculate_bmi(weight_kg, height_m):
    return weight_kg / (height_m ** 2)

def categorise_bmi(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25.0:
        return "Normal"
    elif bmi < 30.0:
        return "Overweight"
    else:
        return "Obese"

def report_bmi(weight_kg, height_m):
    bmi = calculate_bmi(weight_kg, height_m)
    category = categorise_bmi(bmi)
    print(f"BMI: {bmi:.1f} — {category}")

report_bmi(70, 1.75)
```

```text
BMI: 22.9 — Normal
```

Now `calculate_bmi` and `categorise_bmi` can be tested independently. `report_bmi` is readable in four lines.

**SE lens:** The Single Responsibility Principle: each function should do exactly one thing. A function that calculates AND categorises AND prints has three responsibilities. When any one changes — a new BMI category, a different display format — you touch only the function responsible, not a tangled function that mixes all three.

## Guard Clauses — Inverting Nested Conditionals

Deeply nested `if` blocks force the reader to track multiple conditions simultaneously. A **guard clause** handles the exceptional case early and returns, leaving the main logic unindented:

```python
def process_order(order, user, inventory):
    if user is not None:
        if user.is_verified:
            if order is not None:
                if order.quantity > 0:
                    if inventory >= order.quantity:
                        return order.quantity * order.price
    return None
```

Refactored with guard clauses:

```python
def process_order(order, user, inventory):
    if user is None:
        return None
    if not user.is_verified:
        return None
    if order is None:
        return None
    if order.quantity <= 0:
        return None
    if inventory < order.quantity:
        return None
    return order.quantity * order.price
```

Each guard clause states one failing condition and exits immediately. The happy path — the main logic — sits at the lowest indentation level and is easy to find.

## Descriptive Names — The Most Powerful Refactoring

A descriptive name eliminates the need for a comment:

```python
x = 86400
flag = True
result = []
```

Refactored:

```python
seconds_per_day = 86400
is_authenticated = True
matching_records = []
```

The first version requires context to understand. The second version explains itself. Names are the primary documentation of code — they are always in sync with the code because they are the code.

**Rules for names:**
- Variables: noun or noun phrase describing what the value represents
- Functions: verb or verb phrase describing what the function does
- Booleans: `is_`, `has_`, `can_`, or similar prefix
- Never: `x`, `temp`, `val`, `data`, `result` when a descriptive name is possible

## Remove Duplication — DRY

When the same logic appears in more than one place, a change requires updating every copy. Extract the duplicated logic into a shared function:

```python
def area_of_circle(radius):
    return 3.14159 * radius * radius

def circumference_of_circle(radius):
    return 2 * 3.14159 * radius
```

The constant `3.14159` appears twice. If you want to use `math.pi` instead, you change it in two places:

```python
import math

def area_of_circle(radius):
    return math.pi * radius ** 2

def circumference_of_circle(radius):
    return 2 * math.pi * radius
```

Now there is one source of truth for `pi`. This is the DRY principle: every piece of knowledge has exactly one representation.

**CS lens:** Duplication is the root cause of many bugs. A developer fixes the logic in one copy and forgets the other. The two copies drift. A test only covers one copy. DRY forces these copies together so they can only be wrong in one place — and only need to be fixed in one place.

## Challenge: flatten_and_sum

Write a function `flatten_and_sum(nested)` that takes a list of lists of numbers and returns the sum of every number across all inner lists.

`flatten_and_sum([[1, 2], [3, 4], [5]])` → `15`.

Use a `for` loop over the outer list and a nested `for` loop over each inner list. Accumulate into a single total.

```challenge
def flatten_and_sum(nested):
    pass
```

```test
assert flatten_and_sum([[1, 2], [3, 4], [5]]) == 15
assert flatten_and_sum([[]]) == 0
assert flatten_and_sum([]) == 0
assert flatten_and_sum([[10], [20], [30]]) == 60
assert flatten_and_sum([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) == 45
```
