# Lesson 11: Comprehensions — Lists, Dicts, Sets, and Generators

**What you will build:**
The reader will write list, dict, and set comprehensions, and understand generator expressions (lazy comprehensions). The transferable problems: (1) a comprehension replaces a loop-and-append pattern with a single expression — it is FASTER and more readable when the logic is simple; (2) filtering with `if` inside a comprehension avoids a nested `if` block; (3) generator expressions compute lazily, element by element — they use constant memory even for huge sequences.

**What you need to know first:**
Lessons 0–10 (REPL, types, variables, conditionals, iteration, functions, strings, lists, tuples, dicts, sets).

**Terms used in this lesson:**
- **Comprehension** — a compact syntax for creating a new sequence (list, dict, set) by processing an existing iterable, filtering or transforming its items in a single expression. It solves the verbosity of the standard loop-and-append pattern.
- **Generator expression** — a lazy version of a comprehension that evaluates items one by one rather than building the entire collection in memory at once. It solves the problem of Out-Of-Memory errors for massive datasets.
- **Iterable** — any Python object capable of returning its members one at a time (like lists, tuples, or strings). It exists to allow looping constructs to work universally across different collection types.
- **Lazy evaluation** — a computing strategy that delays the evaluation of an expression until its value is actually needed. It exists to conserve memory and computation time when dealing with large or infinite sequences.
- **List** — a built-in mutable, ordered collection of items. It exists to store ordered collections where elements can be modified.
- **Dictionary (dict)** — a built-in collection of key-value pairs. It exists to provide fast data retrieval by a unique key rather than an index.
- **Set** — an unordered collection of unique elements. It exists to store distinct items and provide fast membership testing and mathematical set operations.
- **Tuple** — a built-in immutable, ordered collection of items. It exists to store fixed collections of data that should not change.
- **Loop-and-append pattern** — a common way of building a list by initializing an empty list, looping over an iterable, and calling `.append()` on each item. It exists as the procedural way to construct collections dynamically.
- **REPL** — Read-Eval-Print Loop, an interactive shell that takes user inputs, executes them, and returns the result. It exists for rapid testing, debugging, and learning.

**Objects and methods used:**
- **`range()`**
  - *What it is:* A built-in function that generates an immutable sequence of numbers.
  - *Implementation:* `range(start, stop[, step])` returning a `range` object.
  - *Its use:* Used to generate sequences of numbers for loops and comprehensions.
  - *Type:* A built-in class/function in Python.
  - *Responsibility:* Generates a sequence of integers efficiently without storing them all in memory.
  - *Depends on:* Integer arguments defining the start, stop, and step of the sequence.
  - *Connects to:* Called by loops (`for i in range(...)`) or sequence constructors (`list(range(...))`).
  - *Shape:* A fundamental built-in utility at the core of Python iteration.
- **`list.append()`**
  - *What it is:* A method that adds a single item to the end of a list.
  - *Implementation:* `list.append(x)` where `x` is any Python object. Returns `None`.
  - *Its use:* Used in the traditional loop-and-append pattern to build a list dynamically.
  - *Type:* An instance method on the built-in `list` class.
  - *Responsibility:* Modifies the list in-place by adding exactly one element to its end.
  - *Depends on:* An existing list object and the item to be added.
  - *Connects to:* Called by user code building lists procedurally.
  - *Shape:* A core mutating API for Python's primary collection type.
- **`len()`**
  - *What it is:* A built-in function that returns the number of items in a container.
  - *Implementation:* `len(s)` where `s` is a sequence or collection. Returns an `int`.
  - *Its use:* Used to check the length of strings and lists for filtering.
  - *Type:* A built-in function.
  - *Responsibility:* Reports the accurate count of elements in a given collection.
  - *Depends on:* An object that implements the `__len__()` protocol.
  - *Connects to:* Called by user logic needing size constraints.
  - *Shape:* A standard built-in utility.
- **`str.upper()`**
  - *What it is:* A method that returns a copy of a string with all characters converted to uppercase.
  - *Implementation:* `str.upper()` returning a new `str`.
  - *Its use:* Used in comprehensions to transform string data.
  - *Type:* An instance method on the built-in `str` class.
  - *Responsibility:* Produces an uppercase version of a string without modifying the original.
  - *Depends on:* An existing string object.
  - *Connects to:* Called on strings inside list comprehensions.
  - *Shape:* A standard string manipulation API.
- **`dict.items()`**
  - *What it is:* A method that returns a view object displaying a list of a dictionary's key-value tuple pairs.
  - *Implementation:* `dict.items()` returning a `dict_items` view.
  - *Its use:* Used to iterate over both keys and values simultaneously in dict comprehensions.
  - *Type:* An instance method on the built-in `dict` class.
  - *Responsibility:* Provides a dynamic view of the dictionary's entries.
  - *Depends on:* An existing dictionary object.
  - *Connects to:* Usually consumed by `for key, value in d.items():` loops.
  - *Shape:* The standard way to access both keys and values in Python dictionaries.
- **`next()`**
  - *What it is:* A built-in function that retrieves the next item from an iterator.
  - *Implementation:* `next(iterator[, default])` returning the next element or raising `StopIteration`.
  - *Its use:* Used to manually advance a generator expression to demonstrate lazy evaluation.
  - *Type:* A built-in function.
  - *Responsibility:* Asks an iterator for its next value and handles the iteration protocol.
  - *Depends on:* An object that implements the iterator protocol (`__next__()`).
  - *Connects to:* Called to consume generators or iterators element by element.
  - *Shape:* The core built-in function for manual iteration control.
- **`sum()`**
  - *What it is:* A built-in function that sums the items of an iterable from left to right.
  - *Implementation:* `sum(iterable, /, start=0)` returning a number.
  - *Its use:* Used with generator expressions to accumulate a total without building a list.
  - *Type:* A built-in function.
  - *Responsibility:* Calculates the mathematical sum of an iterable sequence of numbers.
  - *Depends on:* An iterable of numerical values.
  - *Connects to:* Consumes an iterable or generator to produce a single aggregated scalar.
  - *Shape:* A standard mathematical built-in.
- **`max()`**
  - *What it is:* A built-in function that returns the largest item in an iterable.
  - *Implementation:* `max(iterable, *[, key, default])` returning the maximal item.
  - *Its use:* Used with generator expressions to find the maximum value efficiently.
  - *Type:* A built-in function.
  - *Responsibility:* Scans an iterable to find its largest element according to standard or custom ordering.
  - *Depends on:* An iterable of comparable values.
  - *Connects to:* Consumes iterators or collections to find a single extreme value.
  - *Shape:* A standard statistical built-in.
- **`str.strip()`**
  - *What it is:* A method that returns a copy of a string with leading and trailing whitespace removed.
  - *Implementation:* `str.strip([chars])` returning a new `str`.
  - *Its use:* Used as an example of a good, simple transformation inside a comprehension.
  - *Type:* An instance method on the built-in `str` class.
  - *Responsibility:* Cleans up strings by removing extraneous boundary characters.
  - *Depends on:* An existing string object.
  - *Connects to:* Called during data cleaning pipelines.
  - *Shape:* A core string sanitization API.
- **`str.lower()`**
  - *What it is:* A method that returns a copy of a string with all characters converted to lowercase.
  - *Implementation:* `str.lower()` returning a new `str`.
  - *Its use:* Used as an example of data transformation alongside `.strip()`.
  - *Type:* An instance method on the built-in `str` class.
  - *Responsibility:* Normalizes string case by making it fully lowercase.
  - *Depends on:* An existing string object.
  - *Connects to:* Called in data formatting steps.
  - *Shape:* A standard string manipulation API.


---

## Concept Unit: List Comprehensions — The Basic Form

### The Problem
When programming, we often need to create a new list by transforming every item in an existing sequence. In earlier lessons, we solved this with the loop-and-append pattern: initializing an empty list, looping over an iterable, calculating a new value, and calling `.append()` to add it. This is perfectly valid, but it is verbose. It spreads the logic of building a simple list across three lines and introduces a mutating state (the empty list). How can we declare our intent to transform an entire sequence into a new list in just one line?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are experimenting directly in the REPL.
- **Files affected:** None, run in REPL.
- **Change type:** Add.
- **Location:** REPL input.
- **Dependencies:** Python 3.12.

### The New Code
```python
>>> # Without comprehension (the loop-and-append pattern)
>>> squares_loop = []
>>> for x in range(1, 6):
...     squares_loop.append(x**2)
...
>>> print(squares_loop)
[1, 4, 9, 16, 25]

>>> # With list comprehension
>>> squares_comp = [x**2 for x in range(1, 6)]
>>> print(squares_comp)
[1, 4, 9, 16, 25]
```

### The Updated Project
Because this is a REPL experiment, there is no larger enclosing structure. We are executing the statements in a clean session. The loop-and-append approach has been replicated in a single line using a **list comprehension**.

### Introduce the concept in isolation
We will write a small throwaway lab to demonstrate the list comprehension syntax.

```python
>>> doubled = [n * 2 for n in [10, 20, 30]]
>>> print(doubled)
[20, 40, 60]
```

This is called a **list comprehension**. The output proves that the expression `n * 2` is evaluated for each element `n` in the list `[10, 20, 30]`, and the results are automatically gathered into a brand new list. The syntax is always `[expression for variable in iterable]`. 

### Discard the throwaway example
We have seen how it works, so the `doubled` list lab is now discarded and will not appear in our project again.

### Mechanical walkthrough
Let's dissect the primary code block containing our list comprehension:
- **`[` and `]`**: The square brackets tell Python that the result of this expression should be a brand-new **list**. A list is a built-in mutable, ordered collection of items.
- **`x**2`**: This is the **expression**. It defines what will actually go into the new list. Here, it squares the value of `x`.
- **`for x in`**: This acts identically to a standard `for` loop. It dictates iteration over the sequence.
- **`range(1, 6)`**: This is the built-in **`range()`** function, which generates an immutable sequence of numbers from 1 up to (but not including) 6. `range()` efficiently provides the values 1, 2, 3, 4, and 5 without storing them all in memory at once.

The full trace for `range(1, 4)` would be: `x=1` evaluates `1**2` -> `1`, `x=2` evaluates `2**2` -> `4`, `x=3` evaluates `3**2` -> `9`. The final list collected is `[1, 4, 9]`. The comprehension is not only shorter to read but generally runs faster in Python than the equivalent loop-and-append.


---

## Concept Unit: Filtering with `if`

### The Problem
Sometimes, we only want to transform *certain* items in a sequence, not all of them. Using the loop-and-append pattern, this requires placing an `if` statement inside the `for` loop, adding even more indentation and verbosity. How can we build a list based on a condition cleanly in a single expression?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are experimenting directly in the REPL.
- **Files affected:** None, run in REPL.
- **Change type:** Add.
- **Location:** REPL input.
- **Dependencies:** Python 3.12.

### The New Code
```python
>>> # Only even numbers:
>>> evens = [x for x in range(20) if x % 2 == 0]
>>> print(evens)
[0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

>>> # Words longer than 4 letters:
>>> words = ['apple', 'fig', 'banana', 'kiwi', 'cherry']
>>> long_words = [w for w in words if len(w) > 4]
>>> print(long_words)
['apple', 'banana', 'cherry']

>>> # Uppercase only the long ones:
>>> processed = [w.upper() for w in words if len(w) > 4]
>>> print(processed)
['APPLE', 'BANANA', 'CHERRY']
```

### The Updated Project
Because this is a REPL experiment, there is no larger enclosing structure. We are executing the statements in a clean session. We are now combining transformation with conditional logic in one statement.

### Introduce the concept in isolation
We will write a small throwaway lab to demonstrate a filtered list comprehension.

```python
>>> odds = [n for n in [1, 2, 3, 4, 5] if n % 2 != 0]
>>> print(odds)
[1, 3, 5]
```

This output proves that the `if` clause acts as a filter. Only the elements for which the condition evaluates to `True` are passed to the expression (which here is just `n`). The items that fail the condition are skipped entirely.

### Discard the throwaway example
The `odds` lab is now discarded and will not appear in our project again.

### Mechanical walkthrough
Let's trace the mechanics of filtering in our main code snippet:
- **`evens = [x for x in range(20) if x % 2 == 0]`**: 
  - The `for x in range(20)` generates values from 0 to 19.
  - The `if x % 2 == 0` evaluates BEFORE the item is collected.
  - Full trace: `x=0` (condition true, keep 0), `x=1` (condition false, skip), `x=2` (condition true, keep 2), etc.
- **`len(w)`**: This uses the built-in **`len()`** function, which returns the accurate count of items (characters, in this case) in a given collection. It asks strings for their length. If the string is strictly greater than 4 characters, it is kept.
- **`w.upper()`**: This is an instance method on the built-in string class. It returns a copy of a string with all characters converted to uppercase. When combined with the filter, `w.upper()` is *only* executed if `len(w) > 4` is true.


---

## Concept Unit: Nested Comprehensions

### The Problem
Data often arrives as a list of lists, or we might need to compute every combination of items from two different sequences. A standard approach requires two nested `for` loops, which results in deep indentation. Can comprehensions handle multiple loops?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are experimenting directly in the REPL.
- **Files affected:** None, run in REPL.
- **Change type:** Add.
- **Location:** REPL input.
- **Dependencies:** Python 3.12.

### The New Code
```python
>>> # Flatten a list of lists:
>>> nested = [[1, 2, 3], [4, 5], [6, 7, 8, 9]]
>>> flat = [x for row in nested for x in row]
>>> print(flat)
[1, 2, 3, 4, 5, 6, 7, 8, 9]

>>> # All pairs (i, j) where i != j, both in range(3):
>>> pairs = [(i, j) for i in range(3) for j in range(3) if i != j]
>>> print(pairs)
[(0, 1), (0, 2), (1, 0), (1, 2), (2, 0), (2, 1)]
```

### The Updated Project
Because this is a REPL experiment, there is no larger enclosing structure. We are executing the statements in a clean session. We've replaced nested loop structures with nested comprehensions.

### Introduce the concept in isolation
We will write a small throwaway lab to demonstrate a nested comprehension.

```python
>>> coordinates = [(x, y) for x in [1, 2] for y in [10, 20]]
>>> print(coordinates)
[(1, 10), (1, 20), (2, 10), (2, 20)]
```

This output proves that the nested loops read from left to right. The outer loop `for x in [1, 2]` runs first, and for each value of `x`, the inner loop `for y in [10, 20]` executes fully.

### Discard the throwaway example
The `coordinates` lab is now discarded and will not appear in our project again.

### Mechanical walkthrough
Let's examine how our flattening code works:
- **`for row in nested`**: This is the first (outer) loop. In our example, it first yields the list `[1, 2, 3]`.
- **`for x in row`**: This is the second (inner) loop. It iterates over the elements of the current `row`. For `[1, 2, 3]`, it yields `1`, `2`, and `3`.
- **`x`**: This is the final expression that is yielded to the resulting flat list.
- **Left-to-right ordering**: The rule of thumb for nested comprehensions is that they evaluate in the exact same order as you would write normal nested `for` loops top-to-bottom. The leftmost `for` in the comprehension is the outermost loop.
- **Caution**: While you can nest three or more loops or even use matrix multiplication logic, readability drops drastically. Beyond two levels of iteration, you should write a regular nested loop instead of a comprehension to keep the code clear for other developers.


---

## Concept Unit: Dict Comprehensions

### The Problem
Lists are not the only collections we build dynamically. A **Dictionary (dict)** — a built-in collection of key-value pairs that provides fast data retrieval by a unique key — is frequently built dynamically. Building a dictionary requires initializing an empty dict and inserting key-value pairs one at a time via a loop. Can we use comprehension syntax to build dictionaries as well?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are experimenting directly in the REPL.
- **Files affected:** None, run in REPL.
- **Change type:** Add.
- **Location:** REPL input.
- **Dependencies:** Python 3.12.

### The New Code
```python
>>> # Reverse a dict (swap keys and values):
>>> d = {'a': 1, 'b': 2, 'c': 3}
>>> reversed_d = {v: k for k, v in d.items()}
>>> print(reversed_d)
{1: 'a', 2: 'b', 3: 'c'}

>>> # Square a list of numbers as a dict:
>>> square_dict = {x: x**2 for x in range(1, 6)}
>>> print(square_dict)
{1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

>>> # Filter while building:
>>> high_scores = {name: score for name, score in
...                [('Alice', 95), ('Bob', 72), ('Carol', 88)]
...                if score >= 80}
>>> print(high_scores)
{'Alice': 95, 'Carol': 88}
```

### The Updated Project
Because this is a REPL experiment, there is no larger enclosing structure. We are executing the statements in a clean session. We are generating dictionaries directly from iterables in a single expression.

### Introduce the concept in isolation
We will write a small throwaway lab to demonstrate a dict comprehension.

```python
>>> word_lens = {w: len(w) for w in ["cat", "dog", "elephant"]}
>>> print(word_lens)
{'cat': 3, 'dog': 3, 'elephant': 8}
```

This output proves that the `{key_expr: value_expr for ... in ...}` syntax builds a dictionary mapping each string to its length.

### Discard the throwaway example
The `word_lens` lab is now discarded and will not appear in our project again.

### Mechanical walkthrough
Let's dissect the dict comprehension used for reversing our dictionary:
- **`{` and `}`**: Curly braces denote that the result is a dictionary (when used with a colon) or a set (when used without a colon).
- **`v: k`**: This is the expression format for a dict comprehension. It defines the `key: value` pair to insert. Here we use the old value `v` as the new key, and the old key `k` as the new value.
- **`d.items()`**: This built-in instance method on dictionaries returns a view object displaying a list of the dictionary's key-value tuple pairs. We use it so that our `for` loop can unpack both `k` and `v` simultaneously.

Full trace for `reversed_d`: `d.items()` yields `('a', 1)`. The loop unpacks this to `k='a'`, `v=1`. The expression `v: k` inserts `1: 'a'` into the new dictionary. It repeats for `2: 'b'` and `3: 'c'`.


---

## Concept Unit: Set Comprehensions

### The Problem
A **Set** is an unordered collection of unique elements, useful for storing distinct items and providing fast membership testing. Suppose we want to extract a collection of properties from items in a list, but we only care about the *unique* properties. We can build a set using a loop and `.add()`, but there is a comprehension for that too.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are experimenting directly in the REPL.
- **Files affected:** None, run in REPL.
- **Change type:** Add.
- **Location:** REPL input.
- **Dependencies:** Python 3.12.

### The New Code
```python
>>> # Unique lengths of words:
>>> words = ['apple', 'fig', 'banana', 'kiwi', 'cherry', 'plum']
>>> unique_lengths = {len(w) for w in words}
>>> print(unique_lengths)
{3, 4, 5, 6}

>>> # Unique first letters:
>>> first_letters = {w[0] for w in words}
>>> print(first_letters)
{'a', 'b', 'c', 'f', 'k', 'p'}
```

### The Updated Project
Because this is a REPL experiment, there is no larger enclosing structure. We are executing the statements in a clean session. We are now generating sets natively with comprehension syntax.

### Introduce the concept in isolation
We will write a small throwaway lab to demonstrate a set comprehension.

```python
>>> unique_squares = {x**2 for x in [-2, -1, 0, 1, 2]}
>>> print(unique_squares)
{0, 1, 4}
```

This output proves that the `{expr for ...}` syntax builds a set. The values `-2` and `2` both square to `4`, but since sets only hold unique elements, `4` appears exactly once in the resulting collection.

### Discard the throwaway example
The `unique_squares` lab is now discarded and will not appear in our project again.

### Mechanical walkthrough
Let's analyze the first set comprehension:
- **`{len(w) for w in words}`**: The curly braces signify a set or dictionary. Because the expression `len(w)` lacks a colon (`:`), Python knows this is a **set comprehension**, not a dict comprehension.
- **`len(w)`**: The built-in **`len()`** function checks the length of each string. 
- **Automatic Deduplication**: 'apple', 'kiwi', and 'plum' evaluate to lengths 5, 4, and 4. The resulting set automatically ensures duplicates are ignored, resulting in `{3, 4, 5, 6}`. 


---

## Concept Unit: Generator Expressions

### The Problem
A list comprehension computes all its elements immediately and stores the entire resulting list in memory at once. If we write `[x**2 for x in range(1000000)]`, Python will allocate memory for one million integers simultaneously. This can lead to massive performance penalties or Out-Of-Memory crashes. If we only intend to iterate through these values once (e.g., to find the sum), we don't need the whole list to exist simultaneously. How can we perform comprehension-style logic lazily, only generating the next value when it is strictly needed?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are experimenting directly in the REPL.
- **Files affected:** None, run in REPL.
- **Change type:** Add.
- **Location:** REPL input.
- **Dependencies:** Python 3.12.

### The New Code
```python
>>> # A list comprehension computes everything immediately:
>>> squares_list = [x**2 for x in range(1000000)]
>>> # 1 million integers in memory!

>>> # A generator expression is lazy:
>>> squares_gen = (x**2 for x in range(1000000))
>>> # Nothing computed yet! O(1) memory.

>>> type(squares_gen)
<class 'generator'>
>>> next(squares_gen)
0
>>> next(squares_gen)
1
>>> next(squares_gen)
4

>>> # Use with sum, max, min without materializing:
>>> print(sum(x**2 for x in range(1, 11)))
385
>>> print(max(len(w) for w in ['apple', 'fig', 'banana']))
6
```

### The Updated Project
Because this is a REPL experiment, there is no larger enclosing structure. We are executing the statements in a clean session. We've introduced a lazy evaluation technique using generator expressions.

### Introduce the concept in isolation
We will write a small throwaway lab to demonstrate a generator expression's behavior.

```python
>>> lazy_gen = (x for x in [10, 20, 30])
>>> print(lazy_gen)
<generator object <genexpr> at ...>
>>> print(next(lazy_gen))
10
```

This output proves that unlike a list comprehension, wrapping the expression in parentheses `(...)` creates a `<class 'generator'>` object. It does not output the elements immediately. We must explicitly ask for the next element using `next()`.

### Discard the throwaway example
The `lazy_gen` lab is now discarded and will not appear in our project again.

### Mechanical walkthrough
Let's break down the generator expression mechanics from our new code:
- **`(` and `)`**: Wrapping a comprehension syntax in standard parentheses creates a **generator expression**.
- **Lazy evaluation**: A computing strategy that delays the evaluation of an expression until its value is actually needed. `squares_gen` knows *how* to compute the squares, but hasn't done so yet.
- **`next(squares_gen)`**: The built-in **`next()`** function retrieves the next item from an iterator. Calling it once yields `0**2 -> 0`. Calling it again yields `1**2 -> 1`, and then `2**2 -> 4`. The generator remembers where it left off, and each item replaces the last one in memory.
- **`sum(x**2 for x in range(1, 11))`**: The built-in **`sum()`** function sums the items of an iterable from left to right. When passing a generator expression into a function like `sum()`, we can drop the extra set of parentheses. `sum()` will internally call `next()` on the generator until it is exhausted, accumulating the total without ever keeping all 10 integers in memory at once.
- **`max(...)`**: The built-in **`max()`** function returns the largest item in an iterable. Just like `sum()`, it consumes the generator expression efficiently.


---

## Concept Unit: When NOT to Use a Comprehension

### The Problem
Because comprehensions are concise, it is tempting to use them everywhere. However, comprehensions exist for building sequences. They should not be used merely to loop over logic that has side effects (like printing), nor should they be stuffed with so much logic that they become impossible to read. When is a comprehension the wrong choice?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are experimenting directly in the REPL.
- **Files affected:** None, run in REPL.
- **Change type:** Add.
- **Location:** REPL input.
- **Dependencies:** Python 3.12.

### The New Code
```python
>>> # BAD: comprehension for side effects
>>> [print(x) for x in range(5)]
0
1
2
3
4
[None, None, None, None, None]

>>> # GOOD: simple transformation or filter
>>> lines = ['  apple  ', '', 'Banana ']
>>> clean = [x.strip().lower() for x in lines if x.strip()]
>>> print(clean)
['apple', 'banana']
```

### The Updated Project
Because this is a REPL experiment, there is no larger enclosing structure. We are executing the statements in a clean session. We are highlighting anti-patterns in comprehension usage.

### Introduce the concept in isolation
We will write a small throwaway lab to demonstrate side-effects in list comprehensions.

```python
>>> useless_list = [list.append(x) for x in [1, 2] if False]
>>> print(useless_list)
[]
```

This output proves that forcing side-effect logic (like attempting to mutate another list inside the comprehension) often leads to confusing code and meaningless return values, bypassing the real intent of comprehensions which is purely mapping and filtering.

### Discard the throwaway example
The `useless_list` lab is now discarded and will not appear in our project again.

### Mechanical walkthrough
Let's analyze the bad and good usage:
- **`[print(x) for x in range(5)]`**: This code prints the numbers, but `print()` evaluates to `None`. Thus, it builds a useless list of `[None, None, None, None, None]` which is immediately thrown away. A regular `for x in range(5): print(x)` loop makes the intent far clearer and doesn't build a dummy list in memory.
- **`x.strip()`**: The built-in **`str.strip()`** method returns a copy of a string with leading and trailing whitespace removed. Here it cleans the input strings.
- **`x.lower()`**: The built-in **`str.lower()`** method returns a copy of a string with all characters converted to lowercase.
- **`if x.strip()`**: If the string is entirely whitespace (like `''`), `.strip()` evaluates to an empty string, which is falsy. This cleanly drops empty entries.
- **The Rule**: If the comprehension can't be read aloud in one breath, rewrite it as a standard loop. Comprehensions are for clarity, not cleverness.

---

**Closing:**
Comprehensions are one of Python's most distinctive and practical features. They replace the loop-and-append pattern with a single, readable expression. Lesson 12 covers functions as objects — lambda, map, filter, and sorted with a key. 

**Exercises:**
- Write a dict comprehension that generates a Celsius-to-Fahrenheit conversion table from 0 to 100 in steps of 10.
- Use a generator expression to compute the sum of all prime numbers below 1000 without building a list.
- Write a `transpose(matrix)` function using a list comprehension.
