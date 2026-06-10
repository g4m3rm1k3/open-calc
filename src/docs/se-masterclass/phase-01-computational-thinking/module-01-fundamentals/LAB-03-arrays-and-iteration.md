# SE Masterclass — LAB-03 — Arrays and Iteration

**Language: Python**
*Why Python here:* Python's list model is clean, forgiving, and expressive. List comprehensions, `map()`, `filter()`, and `functools.reduce()` make the patterns — not the syntax — the focus. Python also introduces: `list`, `range()`, `len()`, `enumerate()`, `zip()`, and the `from` import statement.

**Prerequisites:** LAB-02 (Functions and Abstraction — Python).
This lab builds directly on first-class functions: `map` and `filter` accept functions as arguments.

**What this lab adds:**
- Creating and accessing lists
- How arrays are laid out in memory, and why that gives O(1) access
- All four iteration patterns: loop, map, filter, reduce
- `enumerate` and `zip` — the most used patterns when you need index + value or two lists together
- Sorting with key functions — sorting by any computed property
- List comprehensions vs generator expressions — and the memory difference
- Generators with `yield` — lazy sequences that produce values on demand

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If `sorted([3,1,2])` returns a sorted copy, what does `[3,1,2].sort()` return?
> 2. What is the difference between `[x*2 for x in range(10)]` and `(x*2 for x in range(10))`?
> 3. If a function uses `yield` instead of `return`, what happens when you call it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python main.py` prints:

```
=== List Basics ===
scores: [85, 42, 91, 17, 73]
first: 85   last: 73   length: 5

=== For Loop ===
85  42  91  17  73

=== Map ===
raw scores:    [85, 42, 91, 17, 73]
letter grades: ['B', 'F', 'A', 'F', 'C']

=== Filter ===
all scores:    [85, 42, 91, 17, 73]
passing only:  [85, 91, 73]

=== Reduce ===
sum of scores: 308
average score: 61.6

=== List Comprehension ===
doubled: [170, 84, 182, 34, 146]

=== Pipeline ===
passing average: 83.0

=== Enumerate and Zip ===
0: 85 (B)
1: 42 (F)
2: 91 (A)
3: 17 (F)
4: 73 (C)
paired: [(85, 'B'), (42, 'F'), (91, 'A'), (17, 'F'), (73, 'C')]

=== Sorting ===
original:    [85, 42, 91, 17, 73]
sorted asc:  [17, 42, 73, 85, 91]
sorted desc: [91, 85, 73, 42, 17]
by score:    [('Alice', 85), ('Charlie', 73), ('Bob', 42)]

=== Generator Expressions ===
list  size: 488 bytes  (all 50 values in memory now)
gen   size: 104 bytes  (holds a recipe, not the values)
first 3:   [0, 2, 4]
sum via gen: 2450

=== Generators ===
countdown: 5 4 3 2 1
fibonacci:  0 1 1 2 3 5 8 13 21 34
```

---

### Language: Python Lists

Before writing loops, here is the Python list syntax used in this lab.

```python
# Creating a list — ordered, indexed from 0
scores = [85, 42, 91]

# Accessing by index
scores[0]    # 85 — first element
scores[-1]   # 91 — last element (negative index counts from the end)
len(scores)  # 3 — number of elements

# Adding and removing
scores.append(17)       # add to the end
scores.pop()            # remove and return the last element

# Slicing — a range of elements
scores[1:3]   # [42, 91] — from index 1 up to but not including 3
```

**`range()` — a sequence of numbers:**

```python
range(5)        # 0, 1, 2, 3, 4
range(1, 6)     # 1, 2, 3, 4, 5
range(0, 10, 2) # 0, 2, 4, 6, 8  (step of 2)
```

---

### Concept: How Lists Work in Memory

**What it is:** A Python list is an **array** — a contiguous block of memory where each slot holds a reference (pointer) to an object. Elements are packed one after another. The list also stores its current length.

**Why O(1) access:** When you write `scores[2]`, Python computes the address of element 2 as `base_address + 2 × pointer_size`. No searching, no scanning. It goes directly to the right slot. This is always one operation regardless of list size — accessing index 2 in a 5-element list takes the same time as accessing index 2 in a 5-million-element list.

```
scores = [85, 42, 91, 17, 73]

Memory (heap):
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ ptr→85  │ ptr→42  │ ptr→91  │ ptr→17  │ ptr→73  │
└─────────┴─────────┴─────────┴─────────┴─────────┘
  [0]        [1]        [2]        [3]        [4]
    ↑
    base_address

scores[2] = *(base_address + 2 × 8 bytes) → 91  ← direct address calculation
```

**Why insertion is O(n):** `scores.insert(0, 99)` must shift every element one slot to the right to make room at index 0. A 5-element list shifts 5 things. A 5-million-element list shifts 5 million things. This is why appending to the END (`scores.append(x)`) is fast — no shifting needed.

**Why this matters for you:** You will choose data structures based on access patterns. If you need fast random access by index, use a list. If you need fast insertion at both ends, use `collections.deque`. If you need fast lookup by key (not index), use a dictionary. The hardware reality behind each choice appears in LAB-04 (Hash Maps) and LAB-05 (Stacks and Queues).

---

## Step 1 — List Basics

Create `lab-03/main.py`:

```python
# === List Basics ===
print("=== List Basics ===")

scores = [85, 42, 91, 17, 73]   # a list of integers, in order

first = scores[0]               # index 0 is the first element
last = scores[-1]               # index -1 is the last element (counts from the end)
count = len(scores)             # len() returns the number of elements

print("scores:", scores)
print("first:", first, "  last:", last, "  length:", count)
```

### SAVE AND TRY

Run `python main.py`.

**You should see:**

```
=== List Basics ===
scores: [85, 42, 91, 17, 73]
first: 85   last: 73   length: 5
```

**In the terminal:**

```
python -c "s = [10, 20, 30]; print(s[1])"
```

**Expected:** `20` — index 1 is the second element.

**Change something:** Access `scores[2]`. Run. You see `91`. Access `scores[10]`. Run. Python raises `IndexError: list index out of range`. Change it back.

---

### Concept: The For Loop

**What it is:** A `for` loop iterates over every element in a sequence, running the loop body once per element.

**The problem before:**

```python
scores = [85, 42, 91]
print(scores[0])   # manually print each — breaks if list grows
print(scores[1])
print(scores[2])
# You have to know the exact length. Adding an element means adding a line.
```

**The solution:**

```python
for score in scores:    # Python reads: "for each score in scores"
    print(score)        # runs once per element, automatically
```

**Canonical example (General Explanation):**

Think of a conveyor belt at a factory. Each item comes off the belt one at a time
and you perform the same operation on each one. The belt (the list) does not care
how long it is — you just handle whatever comes next.

```python
items = ["widget", "gadget", "doohickey"]
for item in items:
    print("processing:", item)
```

**Project Application (The "Why" here):**

Every system in this curriculum processes collections: a parser processes tokens,
a renderer processes entities, a scheduler processes jobs. The `for` loop is the
most common tool for all of them.

**Smallest possible example:**

```python
numbers = [1, 2, 3]
for n in numbers:
    print(n * 2)    # 2, 4, 6
```

**Why it matters here:** The `for` loop is the foundation of `map`, `filter`, and
`reduce`. Understanding the manual loop first makes those abstractions immediately clear.

**Watch for:** In Python, `for i in range(len(scores))` is an anti-pattern when
you only need the values. Use `for score in scores` directly. Use `range(len(...))` only when you need the index.

---

## Step 2 — For Loop

Add to `main.py`:

```python
# === For Loop ===
print("\n=== For Loop ===")

for score in scores:      # ← add: 'for' iterates over every element
    print(score, end="  ")  # ← add: end="  " prints a space instead of a newline after each value
print()                   # ← add: print a final newline to end the line
```

### SAVE AND TRY

Save. Run `python main.py`.

**You should see:**

```
=== For Loop ===
85  42  91  17  73
```

**In the terminal:**

```
python -c "
for i, val in enumerate([10, 20, 30]):
    print(i, val)
"
```

**Expected:**
```
0 10
1 20
2 30
```

`enumerate()` gives you both the index and the value. Use it when you need both.

**Change something:** Replace `for score in scores` with `for score in scores[1:3]`.
Run. Only `42` and `91` print — you sliced the list before iterating. Change it back.

---

### Concept: Map — Transform Every Element

**What it is:** `map` applies a function to every element in a list and returns a new list of results. The original list is unchanged.

**The problem before:**

```python
scores = [85, 42, 91]
grades = []
for score in scores:
    if score >= 90: grades.append('A')
    elif score >= 80: grades.append('B')
    # ... more conditions ...
```

The loop mechanics (creating an empty list, appending) are mixed with the actual transformation logic.

**The solution:** Separate the transformation function from the iteration:

```python
def to_grade(score):
    if score >= 90: return 'A'
    if score >= 80: return 'B'
    if score >= 70: return 'C'
    return 'F'

grades = list(map(to_grade, scores))   # apply to_grade to every element
```

**Canonical example (General Explanation):**

Think of an assembly line where every item gets painted the same way. The painter
(your function) does one thing. The line (`map`) handles moving each item to the painter.

```python
def double(x): return x * 2
doubled = list(map(double, [1, 2, 3]))   # [2, 4, 6]
```

**Project Application (The "Why" here):**

`map` is the transform stage of every data pipeline. In a parser, you map tokens
to AST nodes. In a renderer, you map world-space positions to screen-space positions.
In a REST API, you map database rows to JSON objects. The pattern is universal.

**Smallest possible example:**

```python
names = ["alice", "bob", "carol"]
upper = list(map(str.upper, names))   # ['ALICE', 'BOB', 'CAROL']
```

**Why it matters here:** `map` is first-class functions from LAB-02 applied to collections.

**Watch for:** `map()` in Python 3 returns a **lazy iterator**, not a list.
Wrapping it in `list()` forces evaluation. Without `list()`, printing it shows
`<map object at 0x...>` instead of the values.

---

## Step 3 — Map

Add to `main.py`:

```python
# === Map ===
print("\n=== Map ===")


def to_letter_grade(score):              # ← add: the transformation function
    if score >= 90: return 'A'           # ← add
    if score >= 80: return 'B'           # ← add
    if score >= 70: return 'C'           # ← add
    return 'F'                           # ← add: anything below 70 fails


letter_grades = list(map(to_letter_grade, scores))   # ← add: apply to every element
                                                      # list() forces the lazy iterator to evaluate

print("raw scores:   ", scores)
print("letter grades:", letter_grades)               # ← add
```

### SAVE AND TRY

Save. Run `python main.py`.

**You should see:**

```
=== Map ===
raw scores:    [85, 42, 91, 17, 73]
letter grades: ['B', 'F', 'A', 'F', 'C']
```

**In the terminal:**

```
python -c "print(list(map(len, ['cat', 'elephant', 'ox'])))"
```

**Expected:** `[3, 8, 2]` — `len` is itself a function, and `map` applies it to each string.

**Change something:** Change the grade boundaries so anything above 50 gets a `C`.
Run. See how the grade list changes. Change it back.

---

### Concept: Filter — Keep Only Matching Elements

**What it is:** `filter` applies a predicate function to every element and returns a new list containing only elements for which the predicate returns `True`.

**The problem before:**

```python
passing = []
for score in scores:
    if score >= 60:
        passing.append(score)
# Loop mechanics obscure the intent
```

**The solution:**

```python
def is_passing(score):
    return score >= 60              # predicate: returns True or False

passing = list(filter(is_passing, scores))
```

**Canonical example (General Explanation):**

Think of a coffee filter: water flows through, grounds stay behind. You define
what gets through (your predicate). The filter handles applying the test to every element.

```python
numbers = [1, 2, 3, 4, 5, 6]
def is_even(n): return n % 2 == 0
evens = list(filter(is_even, numbers))   # [2, 4, 6]
```

**Project Application (The "Why" here):**

Filter is the select stage of every query pipeline. In a search engine,
you filter documents by relevance. In a game, you filter entities by type.
In a REST API, you filter database results by query parameters.

**Smallest possible example:**

```python
words = ["apple", "ant", "banana", "avocado"]
def starts_with_a(word): return word[0] == 'a'
a_words = list(filter(starts_with_a, words))   # ['apple', 'ant', 'avocado']
```

**Watch for:** Same as `map` — `filter` returns a lazy iterator. Wrap in `list()`.
A predicate that always returns `True` is the same as no filter. A predicate that
always returns `False` gives you an empty list.

---

## Step 4 — Filter

Add to `main.py`:

```python
# === Filter ===
print("\n=== Filter ===")


def is_passing(score):               # ← add: predicate — returns True or False
    return score >= 60               # ← add: 60 or above is passing


passing_scores = list(filter(is_passing, scores))   # ← add: keep only elements where is_passing returns True

print("all scores:   ", scores)
print("passing only: ", passing_scores)             # ← add
```

### SAVE AND TRY

Save. Run `python main.py`.

**You should see:**

```
=== Filter ===
all scores:    [85, 42, 91, 17, 73]
passing only:  [85, 91, 73]
```

**In the terminal:**

```
python -c "
nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = list(filter(lambda n: n % 2 == 0, nums))
print(evens)
"
```

**Expected:** `[2, 4, 6, 8, 10]`

`lambda n: n % 2 == 0` is an anonymous function — defined inline without a name.
`lambda parameters: expression` is the Python shorthand for a single-line function.

**Change something:** Change the passing threshold to `80`. Run. Only `85` and `91`
remain. Change it back to `60`.

---

### Concept: Reduce — Collapse to a Single Value

**What it is:** `reduce` applies a function of two arguments cumulatively to a list, reducing it to a single value. It requires an import from `functools`.

**The problem before:**

```python
total = 0
for score in scores:
    total = total + score   # manual accumulation
```

This works, but the pattern is structural boilerplate hiding the core operation: `+`.

**The solution:**

```python
from functools import reduce   # 'from X import Y' brings Y from module X into scope

def add(a, b): return a + b
total = reduce(add, scores)   # [85, 42, 91, 17, 73] → ((((85+42)+91)+17)+73) → 308
```

**Canonical example (General Explanation):**

Think of a snowball rolling downhill. It starts as one element, picks up the
next, grows, picks up the next, and so on until there is nothing left to pick up.
The final snowball is the result.

```
[1, 2, 3, 4]
→ add(1, 2) = 3
→ add(3, 3) = 6
→ add(6, 4) = 10
```

**The `from X import Y` syntax:**
```python
from functools import reduce
# 'functools' is a Python standard library module
# 'reduce' is a function inside that module
# 'from X import Y' makes Y available directly by name
```

**Project Application (The "Why" here):**

Reduce generalizes to any accumulation: summing, building a string, merging
objects, computing a hash, folding a list into a tree. In LAB-12 (Expression
Evaluator), you reduce a list of tokens into a single computed value.

**Smallest possible example:**

```python
from functools import reduce

numbers = [1, 2, 3, 4, 5]
total = reduce(lambda acc, n: acc + n, numbers)   # 15
```

**Watch for:** `reduce` with an empty list raises `TypeError`. If your list might
be empty, pass a third argument as the initial value: `reduce(add, [], 0)` returns `0`.

---

## Step 5 — Reduce

Add to `main.py` — this time the `import` goes at the TOP of the file:

First, add this import at the very top of `main.py` (line 1):

```python
from functools import reduce   # ← add at top: import reduce from the standard library
```

Then add the reduce section at the bottom:

```python
# === Reduce ===
print("\n=== Reduce ===")


def add(a, b):                           # ← add: a two-argument accumulator function
    return a + b                         # ← add


total = reduce(add, scores)              # ← add: collapse scores to a single sum
average = total / len(scores)            # ← add: divide by count for the average

print("sum of scores:", total)           # ← add
print("average score:", average)         # ← add
```

### SAVE AND TRY

Save. Run `python main.py`.

**You should see:**

```
=== Reduce ===
sum of scores: 308
average score: 61.6
```

**In the terminal:**

```
python -c "
from functools import reduce
words = ['Hello', ' ', 'World']
sentence = reduce(lambda acc, w: acc + w, words)
print(sentence)
"
```

**Expected:** `Hello  World` — reduce works on any type, not just numbers.

**Change something:** Replace `add` with `lambda a, b: a * b` (multiply instead of add).
Run. You see `scores[0] * scores[1] * ... * scores[4]`. What is the result?
Change it back.

---

### Concept: List Comprehensions

**What it is:** A list comprehension is Python's compact syntax for creating a list by transforming or filtering another sequence — a shorter form of `map` and `filter` combined.

**The problem before:**

```python
doubled = list(map(lambda x: x * 2, scores))   # works but verbose
```

**The solution:**

```python
doubled = [score * 2 for score in scores]
# reads as: "score * 2, for each score in scores"
```

With filtering:

```python
passing_doubled = [score * 2 for score in scores if score >= 60]
# reads as: "score * 2, for each score in scores, if the score is >= 60"
```

**Canonical example (General Explanation):**

Think of a recipe: "Take each ingredient in the pantry, double the amount, but
only if it's a spice." The comprehension reads almost like that sentence:

```python
[amount * 2 for ingredient, amount in pantry if ingredient in spices]
```

**Smallest possible example:**

```python
squares = [x ** 2 for x in range(5)]   # [0, 1, 4, 9, 16]
```

**Why it matters here:** List comprehensions appear constantly in Python. You need
to be able to read them even if you prefer `map`/`filter`. Both approaches are valid.

**Watch for:** Comprehensions can become unreadable if the expression is complex.
If your comprehension is more than one line, split it into a named function and use `map`.

---

## Step 6 — List Comprehension

Add to `main.py`:

```python
# === List Comprehension ===
print("\n=== List Comprehension ===")

doubled = [score * 2 for score in scores]   # ← add: compact transform — same as map(lambda x: x*2, scores)

print("doubled:", doubled)                  # ← add
```

### SAVE AND TRY

Save. Run `python main.py`.

**You should see:**

```
=== List Comprehension ===
doubled: [170, 84, 182, 34, 146]
```

**In the terminal:**

```
python -c "evens = [n for n in range(20) if n % 2 == 0]; print(evens)"
```

**Expected:** `[0, 2, 4, 6, 8, 10, 12, 14, 16, 18]` — filter and map combined in one expression.

**Change something:** Change the comprehension to `[score + 10 for score in scores if score < 60]`.
Run. You see only the failing scores bumped up by 10. Change it back.

---

## 🎯 Challenge: Pipeline

**You know:** Map transforms every element. Filter keeps matching elements. Reduce collapses to one value.

**Task:** Write a pipeline that computes the **average of passing scores** using `filter`, `reduce`, and basic arithmetic. No `sum()` built-in — use `reduce` manually.

**Starting code:**

```python
from functools import reduce

scores = [85, 42, 91, 17, 73]

def is_passing(score):
    return score >= 60

def add(a, b):
    return a + b

# TODO: 
# 1. Filter to passing scores only
# 2. Use reduce to sum them
# 3. Divide by the count of passing scores
# 4. Print the average

# Expected output: 83.0   (85 + 91 + 73 = 249, 249 / 3 = 83.0)
```

**Hint:** You need `len()` of the filtered list for the count. Store the
filtered list in a variable so you can use it for both `reduce` and `len`.

---

<details>
<summary>▶ Show Solution</summary>

```python
passing = list(filter(is_passing, scores))     # [85, 91, 73]
total = reduce(add, passing)                    # 249
average = total / len(passing)                  # 249 / 3 = 83.0
print("passing average:", average)
```

**Key insight:** Each step is independent and named. `filter` does not know about
`reduce`. `reduce` does not know about `filter`. Each transformation is applied
to the output of the previous one — this is a **pipeline**.

You will build this same structure in LAB-10 (Lexer) where characters flow through
a filter (is this a digit?), a map (classify the token), and a reduce (accumulate
into a token list). In LAB-54 (Search Engine), documents flow through filter
(matches query?), map (compute relevance score), and reduce (rank results).

</details>

---

### Concept: enumerate and zip

**`enumerate` — when you need both the index and the value:**

The most common reason to write `for i in range(len(lst))` is to get the index alongside each element. `enumerate` does exactly that without the awkward range:

```python
# Anti-pattern:
for i in range(len(scores)):
    print(i, scores[i])   # verbose, error-prone

# Correct pattern:
for i, score in enumerate(scores):
    print(i, score)       # same result, cleaner
```

`enumerate` returns `(index, value)` pairs. The `for i, score in ...` syntax is called **unpacking** — Python assigns each element of the tuple to a named variable. You can also start the counter at a number other than 0: `enumerate(scores, start=1)`.

**`zip` — iterate over two lists simultaneously:**

```python
names = ["Alice", "Bob"]
scores_list = [85, 42]

for name, score in zip(names, scores_list):
    print(f"{name}: {score}")   # Alice: 85 / Bob: 42
```

`zip` pairs elements positionally. `zip([1,2,3], ['a','b','c'])` produces `(1,'a'), (2,'b'), (3,'c')`. It stops at the shortest list. Use `list(zip(...))` to see the full result.

---

## Step 7 — Enumerate and Zip

Add to `main.py`:

```python
# === Enumerate and Zip ===
print("\n=== Enumerate and Zip ===")

# enumerate: get index AND value together
for i, score in enumerate(scores):                         # ← add: unpack (index, value) pairs
    grade = to_letter_grade(score)                         # ← add: reuse the function from Step 3
    print(f"{i}: {score} ({grade})")

# zip: pair two lists together by position
paired = list(zip(scores, letter_grades))                  # ← add: [(85,'B'), (42,'F'), ...]
print("paired:", paired)                                   # ← add
```

### SAVE AND TRY

Save. Run `python main.py`.

**Expected new section:**
```
=== Enumerate and Zip ===
0: 85 (B)
1: 42 (F)
2: 91 (A)
3: 17 (F)
4: 73 (C)
paired: [(85, 'B'), (42, 'F'), (91, 'A'), (17, 'F'), (73, 'C')]
```

**In the terminal:**
```
python -c "
letters = ['a','b','c']
numbers = [1, 2, 3, 4, 5]
print(list(zip(letters, numbers)))
"
```
**Expected:** `[('a', 1), ('b', 2), ('c', 3)]` — zip stops at the shortest list (3 elements, not 5).

**Change something:** Change `enumerate(scores)` to `enumerate(scores, start=1)`. Run. The indices now start at 1. Change it back.

---

### Concept: Sorting

**`sorted()` vs `.sort()`:** This distinction matters.

```python
scores = [85, 42, 91]
new_list = sorted(scores)   # returns a NEW sorted list, scores unchanged
scores.sort()               # sorts IN PLACE, returns None
```

`sorted()` is the safe default — the original list is untouched. `.sort()` is faster (no copy) but mutates the data. Using `.sort()` when you meant `sorted()` is a common source of bugs: `result = scores.sort()` assigns `None` to `result`.

**Sorting by a key function:**

The `key` parameter accepts any single-argument function. Python calls it on each element to get a comparison value:

```python
students = [("Alice", 85), ("Bob", 42), ("Charlie", 73)]

# Sort by score (second element of each tuple)
by_score = sorted(students, key=lambda s: s[1])
# Result: [('Bob', 42), ('Charlie', 73), ('Alice', 85)]

# Sort by name (first element)
by_name = sorted(students, key=lambda s: s[0])
# Result: [('Alice', 85), ('Bob', 42), ('Charlie', 73)]
```

The key function is a callback — the same pattern from LAB-02. Python never sees the original tuples during comparison; it only compares the values the key function returned. This means you can sort objects of any complexity by any computed property: sort users by age, sort events by timestamp, sort tasks by priority.

**Reverse:**
```python
sorted(scores, reverse=True)   # descending order
```

---

## Step 8 — Sorting

Add to `main.py`:

```python
# === Sorting ===
print("\n=== Sorting ===")

sorted_asc  = sorted(scores)                      # ← add: new sorted list, ascending (default)
sorted_desc = sorted(scores, reverse=True)        # ← add: descending

print("original:   ", scores)                     # ← add: unchanged
print("sorted asc: ", sorted_asc)
print("sorted desc:", sorted_desc)

# Sorting by a key: sort student (name, score) tuples by score
students = [("Alice", 85), ("Bob", 42), ("Charlie", 73)]    # ← add
by_score = sorted(students, key=lambda s: s[1])             # ← add: key extracts the score
print("by score:   ", by_score)                             # ← add
```

### SAVE AND TRY

Save. Run `python main.py`.

**Expected new section:**
```
=== Sorting ===
original:    [85, 42, 91, 17, 73]
sorted asc:  [17, 42, 73, 85, 91]
sorted desc: [91, 85, 73, 42, 17]
by score:    [('Bob', 42), ('Charlie', 73), ('Alice', 85)]
```

**In the terminal:**
```
python -c "
words = ['banana', 'apple', 'cherry', 'fig']
print(sorted(words, key=len))
"
```
**Expected:** `['fig', 'apple', 'banana', 'cherry']` — sorted by string length. `len` is the key function.

**Change something:** Sort `by_score` descending (highest score first). Add `reverse=True`. Run. You see Alice first. Change it back.

---

### Concept: Generator Expressions vs List Comprehensions

**List comprehension:** builds the entire list immediately and stores it in memory.

```python
big_list = [x * 2 for x in range(1_000_000)]   # allocates 1 million values RIGHT NOW
```

**Generator expression:** builds nothing yet. Creates a lazy object that produces one value at a time, only when asked.

```python
big_gen = (x * 2 for x in range(1_000_000))   # only parentheses change — allocates almost nothing
```

The syntax difference is `[]` vs `()`. The behavior difference is enormous:

```python
import sys
sys.getsizeof([x for x in range(50)])   # 488 bytes — 50 values stored
sys.getsizeof(x for x in range(50))     # 104 bytes — just the recipe
```

**When to use each:**
- Use a **list comprehension** when you need the full list in memory (indexing, multiple passes, `len()`).
- Use a **generator expression** when you only need to consume values once in order (passing to `sum`, `max`, `filter`, `for` loop).

```python
# Memory-efficient: sum never stores the million-element list
total = sum(x * 2 for x in range(1_000_000))   # generator expression passed to sum()

# Memory-wasteful: list created just to be summed once
total = sum([x * 2 for x in range(1_000_000)])
```

**A generator expression is a lazy iterator.** `next()` pulls the next value. Once consumed, it is gone — you cannot iterate it again.

---

## Step 9 — Generator Expressions

Add to `main.py`, adding `import sys` at the top if it is not already there:

First, add at the top of `main.py` (after the existing `from functools import reduce`):
```python
import sys                     # ← add at top: sys.getsizeof measures memory size in bytes
```

Then add the section at the bottom:

```python
# === Generator Expressions ===
print("\n=== Generator Expressions ===")

list_version = [x * 2 for x in range(50)]    # ← add: builds all 50 values NOW
gen_version  = (x * 2 for x in range(50))    # ← add: builds nothing, holds only the formula

print(f"list  size: {sys.getsizeof(list_version)} bytes  (all 50 values in memory now)")
print(f"gen   size: {sys.getsizeof(gen_version)} bytes  (holds a recipe, not the values)")

# Pull the first 3 values using next() — generator advances one step at a time
first_3 = [next(gen_version), next(gen_version), next(gen_version)]   # ← add
print("first 3:  ", first_3)

# A fresh generator — use it in sum() without ever materialising the list
print(f"sum via gen: {sum(x * 2 for x in range(50))}")    # ← add
```

### SAVE AND TRY

Save. Run `python main.py`.

**Expected new section:**
```
=== Generator Expressions ===
list  size: 488 bytes  (all 50 values in memory now)
gen   size: 104 bytes  (holds a recipe, not the values)
first 3:   [0, 2, 4]
sum via gen: 2450
```

*(Exact byte counts may differ slightly by Python version, but the generator will always be much smaller.)*

**In the terminal:**
```
python -c "
import sys
print(sys.getsizeof([x for x in range(1000)]))
print(sys.getsizeof(x for x in range(1000)))
"
```
**Expected:** The list is thousands of bytes. The generator is still ~104 bytes — it does not grow with the range size.

**Change something:** Try to call `next(gen_version)` a 4th time after the 3 calls above. You get `StopIteration` — the generator tracks where it is and eventually exhausts. Change it back.

---

### Concept: Generators with `yield`

**What it is:** A **generator function** uses `yield` instead of `return`. When called, it does NOT run the function body — it returns a generator object. The body runs only when values are pulled with `next()` or a `for` loop. Each `yield` suspends the function and hands out a value. The local variables survive between yields. The next `next()` resumes from exactly where it paused.

```python
def countdown(n):
    while n > 0:
        yield n      # suspend here, give caller the current n
        n -= 1       # resume from here on the next next() call
    # function ends — StopIteration raised automatically

for i in countdown(3):
    print(i)   # 3, 2, 1
```

**What it hides (Law 7):** Where the values come from — the caller just iterates. A generator producing Fibonacci numbers looks identical from the outside to a list of Fibonacci numbers. The protected invariant: the generator owns its own state. The caller cannot modify `n` between yields.

**Generators vs lists:**
- A list computes all values up front. `fib_list(1000)` computes 1000 values at startup.
- A generator computes values on demand. `fib_gen()` can run **forever** — you just stop asking.

```python
def fibonacci_gen():
    a, b = 0, 1
    while True:       # infinite loop — but that is fine, it only runs when polled
        yield a
        a, b = b, a + b   # this line resumes after yield on the next call
```

**Where you will see this:** Python's `range()` is itself a lazy sequence. File reading line-by-line uses generators. Database cursor iteration. Any time a dataset is too large to load entirely into memory — infinite streams, log tailing, sensor data — generators are the right tool.

---

## Step 10 — Generators

Add to `main.py`:

```python
# === Generators ===
print("\n=== Generators ===")

def countdown(n):              # ← add: a generator function — has 'yield', not 'return'
    while n > 0:
        yield n                # ← add: suspend here, pass n to caller, wait for next next()
        n -= 1                 # ← add: resume from here

# countdown is a generator: for loop calls next() until StopIteration
print("countdown:", end=" ")
for val in countdown(5):      # ← add: works with for, next(), list(), zip(), anything that iterates
    print(val, end=" ")
print()

def fibonacci_gen():           # ← add: infinite generator — runs forever, yields on demand
    a, b = 0, 1
    while True:                # ← add: infinite loop is safe — only executes when polled
        yield a                # ← add: yield the current fibonacci number
        a, b = b, a + b        # ← add: advance — a, b = b, a+b is simultaneous assignment

fib = fibonacci_gen()          # ← add: create the generator — nothing computed yet
fib_10 = [next(fib) for _ in range(10)]   # ← add: pull exactly 10 values
print("fibonacci: ", fib_10)  # ← add
```

### SAVE AND TRY

Save. Run `python main.py`. You should see all sections including:

```
=== Generators ===
countdown: 5 4 3 2 1
fibonacci:  [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

**In the terminal:**
```
python -c "
def squares():
    n = 0
    while True:
        yield n * n
        n += 1

gen = squares()
print([next(gen) for _ in range(8)])
"
```
**Expected:** `[0, 1, 4, 9, 16, 25, 36, 49]` — an infinite stream of squares, but you only pull 8.

**Change something:** Change `range(10)` to `range(20)` in the fibonacci comprehension. Run. You see 20 Fibonacci numbers. Change it back.

---

## 🎯 Challenge: Lazy Primes

**You know:** Generators produce values lazily. `yield` suspends until the next value is requested.

**Task:** Write a generator `primes()` that yields prime numbers one at a time, starting from 2, running forever. Pull the first 10 primes.

A **prime number** is a whole number greater than 1 that has no divisors other than 1 and itself. To check if `n` is prime: try dividing `n` by every integer from 2 up to (but not including) `n`. If any division has no remainder (`n % i == 0`), it is not prime.

**Starting code:**
```python
def primes():
    n = 2
    while True:
        # TODO: check if n is prime
        # if it is, yield n
        n += 1

first_10 = [next(primes()) for _ in range(10)]  # wrong! creates a new generator each time
# Fix: create the generator ONCE, then pull 10 values
gen = primes()
first_10 = [next(gen) for _ in range(10)]
print(first_10)   # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
```

<details>
<summary>▶ Show Solution</summary>

```python
def primes():
    n = 2
    while True:
        is_prime = all(n % i != 0 for i in range(2, n))  # generator expression inside all()
        if is_prime:
            yield n
        n += 1

gen = primes()
first_10 = [next(gen) for _ in range(10)]
print(first_10)   # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
```

**Key insight:** `all(n % i != 0 for i in range(2, n))` is a generator expression inside `all()`. `all()` short-circuits — it stops at the first `False`. So if 4 is reached and `10 % 2 == 0`, Python stops checking. No list is built. The entire primality check is lazy. This pattern — generators feeding built-in aggregators — is idiomatic Python.

Note: this is a naïve primality test. The Sieve of Eratosthenes (LAB-later) is vastly more efficient for large primes.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `python main.py` runs without errors | No red text, all 10 sections print |
| List basics: index access and `len()` work | Output shows `first: 85`, `last: 73`, `length: 5` |
| For loop prints all 5 scores on one line | `85  42  91  17  73` on one line |
| Map produces letter grades | `['B', 'F', 'A', 'F', 'C']` |
| Filter keeps only passing scores | `[85, 91, 73]` |
| Reduce sums to 308, average is 61.6 | Both lines print correctly |
| List comprehension doubles all scores | `[170, 84, 182, 34, 146]` |
| `enumerate` prints index and grade for each score | 5 lines, index 0–4 |
| `zip(scores, letter_grades)` pairs them correctly | `[(85, 'B'), ...]` |
| `sorted(scores)` does NOT change `scores` | Original still `[85, 42, 91, 17, 73]` |
| `sorted(students, key=...)` sorts by score | Bob, Charlie, Alice in order |
| Generator expression size is much smaller than list | Confirmed by `sys.getsizeof` output |
| `next()` advances generator state | First 3 values are `[0, 2, 4]` |
| Countdown generator produces 5 4 3 2 1 | Via `for` loop |
| Fibonacci generator correctly yields first 10 | `[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]` |
| You can explain the difference between `sorted()` and `.sort()` | Without notes |
| You can explain why a generator uses less memory than a list | Without notes |

---

## Quick Check Answers

**1. If `sorted([3,1,2])` returns a sorted copy, what does `[3,1,2].sort()` return?**

`None`. The `.sort()` method sorts the list in place — it modifies the list itself and returns `None`. `sorted()` always returns a new list, leaving the original unchanged. This means `result = my_list.sort()` is a common bug: `result` will be `None`. Use `sorted()` when you want to keep the original. Use `.sort()` when in-place mutation is acceptable and you want to avoid the copy.

**2. What is the difference between `[x*2 for x in range(10)]` and `(x*2 for x in range(10))`?**

The list comprehension (square brackets) builds all 10 values immediately and stores them in memory as a list. The generator expression (parentheses) creates a lazy object — it holds only the formula, not the values. Values are produced one at a time when requested via `next()` or a `for` loop. The generator uses ~104 bytes regardless of range size; the list grows proportionally. Use a generator when you consume values once in order. Use a list when you need random access, `len()`, or multiple passes.

**3. If a function uses `yield` instead of `return`, what happens when you call it?**

Calling the function does NOT execute its body. It returns a generator object immediately. The body only starts running when you call `next()` on the generator. The function runs until it hits `yield`, which suspends it and hands the yielded value to the caller. All local variables survive the suspension. The next `next()` resumes from exactly the line after `yield`. When the function body finishes (or `return` is reached), Python raises `StopIteration` automatically, signaling the `for` loop to stop.

---

*Next: [LAB-04 — Objects and Hash Maps](LAB-04-objects-and-hash-maps.md)*

*Next: [LAB-04 — Objects and Hash Maps](LAB-04-objects-and-hash-maps.md) — Java*
