# FOUNDATIONS — LAB-042 — Python: List Comprehensions and Generator Expressions

**Series:** FOUNDATIONS — Part VIII: Python Features
**Environment:** Python REPL (`python3`)
**Time:** 40–55 minutes.

---

## What You Will Build

List comprehensions that replace for-loops building lists, dict/set comprehensions, and generator expressions that produce values lazily. After this lab you will understand the memory difference between a list comprehension (builds the whole list immediately) and a generator expression (computes one value at a time), and choose the right form based on how the result is used.

---

## What You Need to Know First

**From LAB-021 (Higher-Order Functions):** `map` and `filter` are the functional equivalents of comprehensions. Comprehensions are Python's idiomatic syntax for the same operations.

**From LAB-041 (Type Hints):** The examples include type annotations for clarity.

---

> **Quick Check — try to answer before reading:**
>
> 1. `[x * 2 for x in range(10)]` — how many list items does this create?
> 2. `(x * 2 for x in range(10))` — how many values are computed immediately?
> 3. What is the equivalent `map`/`filter` expression for `[x for x in numbers if x > 0]`?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — List Comprehension: Transform and Filter in One Expression

A list comprehension builds a new list by transforming and/or filtering an iterable.

**Syntax:** `[expression for item in iterable if condition]`

```python
# Equivalent for-loop:
doubled = []
for number in range(10):
    doubled.append(number * 2)

# List comprehension — same result, one line:
doubled = [number * 2 for number in range(10)]
print(doubled)   # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# With filter — only even numbers:
even_squares = [number ** 2 for number in range(10) if number % 2 == 0]
print(even_squares)  # [0, 4, 16, 36, 64]

# From a list of strings:
words = ['hello', 'world', 'python', 'is', 'great']
long_words = [word.upper() for word in words if len(word) > 4]
print(long_words)  # ['HELLO', 'WORLD', 'PYTHON', 'GREAT']
```

**The walkthrough — even_squares:**
- Iterate over `range(10)`: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9.
- Filter: keep only `number % 2 == 0` → 0, 2, 4, 6, 8.
- Transform: compute `number ** 2` → 0, 4, 16, 36, 64.
- Build a list: `[0, 4, 16, 36, 64]`.

All steps happen at evaluation time. The result is a fully-built list in memory.

**The CS lens — declarative over imperative:** The for-loop describes HOW to build the list (append each element). The comprehension describes WHAT the list is (squares of even numbers in range(10)). Declarative code is shorter, harder to introduce bugs into (no `append` call to forget), and communicates intent more clearly.

**The SE lens — readable limit:** Comprehensions become hard to read when they contain complex expressions or multiple nested loops. The rule: if the comprehension does not fit comfortably on one line, write a for-loop with a descriptive variable name. Brevity should not come at the cost of clarity.

---

### Step 2 — Nested Comprehensions

```python
# Matrix: list of lists
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# Flatten a matrix:
flat = [element for row in matrix for element in row]
print(flat)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Transpose a matrix (swap rows and columns):
transposed = [[matrix[row][column] for row in range(3)] for column in range(3)]
print(transposed)  # [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
```

**The walkthrough — flatten:** The `for row in matrix` iterates over the three rows. The `for element in row` iterates over each element within each row. The outer loop is written first, the inner loop second.

**Caution — deeply nested comprehensions:** The transposed matrix example is at the limit of readability. Three or more nested loops in a comprehension are almost always better as explicit for-loops.

---

### Step 3 — Dict and Set Comprehensions

```python
# Dict comprehension: {key: value for item in iterable}
word_lengths = {word: len(word) for word in words}
print(word_lengths)  # {'hello': 5, 'world': 5, 'python': 6, 'is': 2, 'great': 5}

# Invert a dictionary:
original = {'a': 1, 'b': 2, 'c': 3}
inverted = {value: key for key, value in original.items()}
print(inverted)  # {1: 'a', 2: 'b', 3: 'c'}

# Set comprehension — unique values only (no duplicates):
numbers = [1, 2, 2, 3, 3, 3, 4]
unique_squares = {number ** 2 for number in numbers}
print(unique_squares)  # {1, 4, 9, 16} — order not guaranteed
```

**The CS lens — syntax signal:** Brackets `[]` produce a list. Curly braces `{}` with `key: value` produce a dict. Curly braces `{}` with a single expression produce a set. The syntax clearly signals the data structure being built.

---

### Step 4 — Generator Expressions: Lazy Evaluation

A generator expression uses the same syntax as a list comprehension but with parentheses instead of brackets. It produces values one at a time on demand, using O(1) memory regardless of the input size.

```python
import sys

numbers = range(1_000_000)

# List comprehension — builds all 1,000,000 items in memory:
list_comp = [number ** 2 for number in numbers]
print(f"List size:      {sys.getsizeof(list_comp):,} bytes")   # ~8,000,056 bytes

# Generator expression — stores only the generator object:
gen_expr = (number ** 2 for number in numbers)
print(f"Generator size: {sys.getsizeof(gen_expr):,} bytes")    # ~208 bytes

# Both produce the same values when iterated:
total_from_list = sum(list_comp)
total_from_gen  = sum(number ** 2 for number in range(1_000_000))
print(total_from_list == total_from_gen)  # True
```

**The walkthrough:** The list comprehension evaluates all million expressions immediately and stores them in memory. The generator expression stores only the generator object (a state machine with the current index). Each value is computed on demand when the generator is advanced (by `next()`, a for-loop, or `sum()`).

For `sum(number ** 2 for number in range(1_000_000))`: `sum` calls `next()` on the generator, gets one value, adds it to the accumulator, and discards it. Memory usage is constant — it never holds more than one computed value at a time.

**The CS lens — lazy evaluation:** A generator expression is a lazy sequence — values are produced on demand. This is the same concept as Haskell's lazy lists, Java's Streams, and JavaScript's generator functions (LAB-043). Lazy evaluation is essential for processing data sets too large to fit in memory.

**When to use each:**

| Use list comprehension when | Use generator expression when |
|---|---|
| You need to access elements by index | You only iterate once |
| You need `len()` on the result | The sequence might be infinite |
| You iterate multiple times | Memory efficiency matters |
| You need to share the result | You pass it directly to `sum`, `max`, `any`, `all` |

---

### Step 5 — Passing Generators to Built-ins

The most common generator expression pattern:

```python
prices = [9.99, 19.99, 4.99, 29.99, 2.50]

# Total without building an intermediate list:
total = sum(price for price in prices if price > 5.0)
print(f"Total (>$5): ${total:.2f}")  # $59.97

# Any price over $25?
has_expensive = any(price > 25 for price in prices)
print(has_expensive)  # True

# All prices positive?
all_positive = all(price > 0 for price in prices)
print(all_positive)  # True

# Maximum discount savings:
max_savings = max(price * 0.1 for price in prices)
print(f"Best saving: ${max_savings:.2f}")  # $3.00
```

**The SE lens — no intermediate list:** `sum(price for price in prices if price > 5.0)` builds no list. The generator passes one value at a time to `sum`. This pattern is idiomatic Python for aggregation and is more efficient than `sum([price for price in prices if price > 5.0])`.

When the generator is the only argument to a function, the outer parentheses are not required: `sum(price for price in prices)` not `sum((price for price in prices))`.

---

## Connect the Pieces

- **Pandas' vectorized operations** use lazy evaluation internally. DataFrames compute column operations without materializing intermediate arrays when possible.
- **Python's `itertools`** module provides composable lazy iterators — `islice`, `chain`, `product`. Generator expressions compose with these naturally.
- **Django's QuerySets** are lazy — `User.objects.filter(active=True)` does not hit the database until the queryset is iterated. This is the same lazy evaluation principle.

---

## What Breaks Without This

**Mutating the source list during comprehension:**

```python
numbers = [1, 2, 3, 4, 5]
# BUG: modifying numbers while iterating it
result = [numbers.pop() for _ in range(len(numbers))]
# numbers is modified during comprehension evaluation
# result: [5, 4, 3] — only 3 elements, not 5
```

The `len(numbers)` is evaluated once at the start (5), but `numbers.pop()` shrinks `numbers` on each iteration. The `range(5)` runs all 5 iterations but `numbers.pop()` runs out after 3. Use a copy: `numbers[:]` or `list(numbers)` if you need to mutate while iterating.

---

## Definition of Done

- [ ] `[x**2 for x in range(1, 6)]` → `[1, 4, 9, 16, 25]`
- [ ] `{word: len(word) for word in ['cat', 'elephant', 'ox']}` → correct dict
- [ ] Generator expression vs list comprehension memory comparison using `sys.getsizeof`
- [ ] `sum(x for x in range(100) if x % 3 == 0)` → correct sum without list
- [ ] You can explain when a generator expression is better than a list comprehension

**Git commit:**

```
git add src/
git commit -m "LAB-042: Python comprehensions — list/dict/set comprehensions replace explicit loops; generator expressions provide lazy O(1) memory evaluation"
```

---

## Quick Check Answers

1. **10 items.** `range(10)` produces 0–9. The comprehension maps each through `x * 2`, producing `[0, 2, 4, 6, 8, 10, 12, 14, 16, 18]` — ten elements in a list allocated immediately.
2. **Zero values are computed immediately.** A generator expression computes nothing when created. Values are computed on demand as the generator is iterated. Creating `(x * 2 for x in range(10))` just stores the iterator state — no computation.
3. **`list(filter(lambda x: x > 0, numbers))`** is the functional equivalent. The comprehension `[x for x in numbers if x > 0]` is the same operation with Python's idiomatic syntax.
