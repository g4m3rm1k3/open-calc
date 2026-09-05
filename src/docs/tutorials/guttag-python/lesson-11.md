# Lesson 11: Comprehensions — Lists, Dicts, Sets, and Generators

What you will build: The reader understands list comprehensions, dict comprehensions, set comprehensions, and generator expressions: their syntax, when to use each, and the performance difference between a list comprehension (eager) and a generator expression (lazy). The transferable insight: comprehensions are declarative transformations. They express WHAT to build, not HOW to build it step by step. A comprehension is almost always more readable than an equivalent for-loop-with-append.

What you need to know first:
- Lesson 00-10

Terms used in this lesson:
- **list comprehension** — A declarative way to create a new list by transforming and optionally filtering an iterable.
- **dict comprehension** — A declarative way to create a new dictionary by transforming an iterable into key-value pairs.
- **set comprehension** — A declarative way to create a new set by transforming an iterable and automatically deduplicating values.
- **generator expression** — A lazy evaluator that yields items one by one rather than building a collection in memory.
- **lazy evaluation** — Producing values on demand rather than eagerly building them all at once.
- **eager evaluation** — Computing all values and storing them in memory immediately.
- **declarative programming** — Expressing WHAT you want to compute rather than HOW to compute it step-by-step.
- **side effect** — Modifying state or interacting with the outside world (e.g., printing) inside a computation.
- **iterable** — Any object that can return its members one at a time, allowing it to be looped over.
- **short-circuiting** — Stopping evaluation as soon as the result is determined.

Objects and methods used:
- **`sum()`**
  - *What it is:* A built-in function that adds items of an iterable from left to right.
  - *Implementation:* `sum(iterable, /, start=0)`
  - *Its use:* To demonstrate aggregating values from a generator expression efficiently.
  - *Type:* Built-in function
  - *Responsibility:* Computes the sum of a sequence of numbers.
  - *Depends on:* An iterable of numbers.
  - *Connects to:* Consumes the iterable; returns a single numeric value.
  - *Shape:* A standard library utility function.
- **`any()`**
  - *What it is:* A built-in function that returns `True` if any element of the iterable is true.
  - *Implementation:* `any(iterable)`
  - *Its use:* To demonstrate short-circuiting with a generator expression.
  - *Type:* Built-in function
  - *Responsibility:* Determines if at least one element is truthy, stopping early if possible.
  - *Depends on:* An iterable.
  - *Connects to:* Consumes the iterable; returns a boolean.
  - *Shape:* A standard library utility function.

## Concept Unit: List comprehension — transform and filter

### The Problem
We often need to create a new list by transforming or filtering elements from an existing sequence. Doing this with a standard for loop requires initializing an empty list and calling `.append()` repeatedly. This is verbose and focuses on *how* to build the list rather than *what* the list is.

What does the code look like if we want to square every even number from 0 to 9 using a `for` loop? How many lines of code does that take? Can we express this more directly as "give me the squares of even numbers"?

### Introduce the concept in isolation
```python
squares = [x**2 for x in range(10) if x % 2 == 0]
print(squares)
```
```text
[0, 4, 16, 36, 64]
```
This proves that a **list comprehension** can filter (`if x % 2 == 0`) and transform (`x**2`) an iterable in a single, readable expression, producing a new list.

### Discard the throwaway
This throwaway code is explicitly discarded and will not be placed in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are adding list comprehension functionality.
- **Files affected:** `src/processor.py` (created)
- **Change type:** add
- **Location:** brand new file
- **Dependencies:** None.

### The New Code
```python
def extract_even_squares(numbers):
    return [x**2 for x in numbers if x % 2 == 0]
```

### The Updated Project
```python
1: # src/processor.py
2: def extract_even_squares(numbers):  # <- new
3:     return [x**2 for x in numbers if x % 2 == 0]  # <- new
```

### Mechanical walkthrough
- `def`: The keyword used to define a function.
- `extract_even_squares`: The name of the function.
- `(numbers)`: The parameter list accepting an iterable.
- `:`: Ends the function definition header.
- `return`: The keyword that sends the evaluated result back to the caller.
- `[`: Opens the list comprehension syntax.
- `x**2`: The expression to evaluate for each item; squares the value.
- `for`: The keyword starting the iteration clause of the comprehension.
- `x`: The variable name bound to each element during iteration.
- `in`: The keyword specifying the iterable to draw from.
- `numbers`: The iterable being processed.
- `if`: The keyword starting the filter clause.
- `x % 2 == 0`: The condition that must be true for `x**2` to be included in the result.
- `]`: Closes the list comprehension syntax.

### CS lens
Declarative programming. Instead of writing imperative steps (create list, loop, check condition, append), we declare the shape of the data we want. This appears in SQL (`SELECT x^2 FROM numbers WHERE x % 2 = 0`), React UI definitions, Makefile targets, and Terraform configurations.

### SE lens
Design principle: Readability and intent. The alternative NOT chosen is using a `for` loop with `.append()`. The real tradeoff is that while comprehensions are more concise and often faster in CPython, they can become unreadable if the logic (nested loops, complex conditions) is too dense, at which point a standard loop is preferable.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `[0, 4, 16, 36, 64]` when called with `range(10)`.

### One sentence connecting to previous unit
Now that we can build lists declaratively, we can apply the same logic to other core data structures like dictionaries and sets.

## Concept Unit: Dict and set comprehensions

### The Problem
We can build lists concisely, but often we need dictionaries to map keys to values, or sets to deduplicate items. Writing loops to build these structures suffers from the same verbosity as list building.

If you have a list of words, how would you create a dictionary mapping each word to its length using a loop? How would you extract all unique words from a text? Could the declarative syntax of list comprehensions be adapted for dicts and sets?

### Introduce the concept in isolation
```python
words = ['hello', 'hi', 'world', 'ok']
lengths = {word: len(word) for word in words if len(word) > 2}
unique_words = {x.lower() for x in words if len(x) > 3}
print(lengths)
print(unique_words)
```
```text
{'hello': 5, 'world': 5}
{'world', 'hello'}
```
This proves that **dict comprehensions** (`{k: v for...}`) and **set comprehensions** (`{expr for...}`) use the exact same declarative pattern as list comprehensions, adjusting only the surrounding braces and key-value syntax.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating dictionary and set comprehensions.
- **Files affected:** `src/processor.py` (modified)
- **Change type:** add
- **Location:** after `extract_even_squares`
- **Dependencies:** None.

### The New Code
```python
def build_word_lengths(words):
    return {w: len(w) for w in words if len(w) > 2}

def get_unique_long_words(words):
    return {w.lower() for w in words if len(w) > 3}
```

### The Updated Project
```python
1: # src/processor.py
2: def extract_even_squares(numbers):
3:     return [x**2 for x in numbers if x % 2 == 0]
4: 
5: def build_word_lengths(words):  # <- new
6:     return {w: len(w) for w in words if len(w) > 2}  # <- new
7: 
8: def get_unique_long_words(words):  # <- new
9:     return {w.lower() for w in words if len(w) > 3}  # <- new
```

### Mechanical walkthrough
- `def`: The keyword used to define a function.
- `build_word_lengths`: The name of the function.
- `(words)`: The parameter list accepting an iterable of strings.
- `:`: Ends the function definition header.
- `return`: The keyword that sends the evaluated result back to the caller.
- `{`: Opens the dictionary comprehension syntax.
- `w`: The key expression.
- `:`: Separates the key from the value in the dictionary comprehension.
- `len(w)`: The value expression.
- `for`: The keyword starting the iteration clause.
- `w`: The variable name bound to each element.
- `in`: The keyword specifying the iterable to draw from.
- `words`: The iterable being processed.
- `if`: The keyword starting the filter clause.
- `len(w) > 2`: The condition that must be true to include the key-value pair.
- `}`: Closes the dictionary comprehension syntax.
- `def get_unique_long_words(words):`: Defines another function taking an iterable.
- `return {w.lower() for w in words if len(w) > 3}`: A set comprehension. `{` and `}` without key-value colons define a set. `w.lower()` transforms the item, deduplication is automatic, and `len(w) > 3` filters the inputs.

### CS lens
Hash-based data structures. Dicts and sets rely on hashing for O(1) lookups and automatic deduplication. This appears in database indexes, caching layers (like Redis or Memcached), symbol tables in compilers, and unique constraints in SQL.

### SE lens
Design principle: Principle of Least Surprise. The alternative NOT chosen is inventing a completely new syntax for dicts and sets. The real tradeoff is that by reusing the `for ... in ... if ...` syntax from list comprehensions, Python lowers the cognitive load, but makes dict and set comprehensions visually similar, distinguished only by the presence of a colon.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `{'hello': 5}` and `{'hello'}` for the respective functions given `['hello', 'hi']`.

### One sentence connecting to previous unit
While comprehensions are great for building collections in memory, sometimes we only need to iterate over the values once without storing them all.

## Concept Unit: Generator expressions — lazy evaluation

### The Problem
List comprehensions compute all values immediately and store them in memory. If we process a billion items, a list comprehension will consume gigabytes of RAM. How can we perform declarative transformations without the massive memory overhead?

What happens to your system's memory if you do `[x**2 for x in range(10**9)]`? If we only want to compute the sum of these squares, do we actually need all billion values at the exact same time? Is there a way to generate each value exactly when `sum()` asks for it?

### Introduce the concept in isolation
```python
gen = (x**2 for x in range(10))
print(gen)
print(sum(gen))
```
```text
<generator object <genexpr> at ...>
285
```
This proves that a **generator expression** uses parentheses `()` instead of brackets, does NOT build a list in memory (it returns a generator object), and uses **lazy evaluation** to yield items one at a time when consumed by functions like `sum()`.

### Discard the throwaway
This throwaway code is explicitly discarded and will not be kept in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating generator expressions.
- **Files affected:** `src/processor.py` (modified)
- **Change type:** add
- **Location:** after `get_unique_long_words`
- **Dependencies:** None.

### The New Code
```python
def sum_of_squares(numbers):
    return sum(x**2 for x in numbers)
```

### The Updated Project
```python
1: # src/processor.py
2: def extract_even_squares(numbers):
3:     return [x**2 for x in numbers if x % 2 == 0]
4: 
5: def build_word_lengths(words):
6:     return {w: len(w) for w in words if len(w) > 2}
7: 
8: def get_unique_long_words(words):
9:     return {w.lower() for w in words if len(w) > 3}
10: 
11: def sum_of_squares(numbers):  # <- new
12:     return sum(x**2 for x in numbers)  # <- new
```

### Mechanical walkthrough
- `def`: The keyword used to define a function.
- `sum_of_squares`: The name of the function.
- `(numbers)`: The parameter list.
- `:`: Ends the header.
- `return`: The keyword to send back the result.
- `sum`: The built-in function that aggregates values.
- `(`: Opens the function call to `sum`. Because it's the only argument, the generator expression's own parentheses can be omitted.
- `x**2`: The expression to evaluate lazily.
- `for`: The keyword starting the iteration clause.
- `x`: The variable name bound to each element.
- `in`: The keyword specifying the iterable.
- `numbers`: The iterable.
- `)`: Closes the function call to `sum`.

### CS lens
Lazy evaluation. Computing values only when they are needed rather than in advance. This appears in infinite data streams, pagination in web APIs, lazy-loading images in browsers, and Haskell (which is entirely lazy by default).

### SE lens
Design principle: Resource efficiency. The alternative NOT chosen is `sum([x**2 for x in numbers])` (a list comprehension). The real tradeoff is that the generator is O(1) in memory but can only be iterated *once*. If you need to traverse the values multiple times, you must use a list comprehension or materialise the generator into a list.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `285` given `range(10)`.

### One sentence connecting to previous unit
Knowing how to use generators effectively also requires understanding when these declarative constructs become an anti-pattern.

## Concept Unit: When NOT to use comprehensions

### The Problem
Because comprehensions are concise, developers sometimes try to force every loop into a comprehension. But what happens if the loop modifies state, or the logic involves complex nested conditions?

If a comprehension's purpose is to build a *new* collection, does it make sense to use one just to call `print(x)` on every item? How readable is `[y for x in matrix if x for y in x if y > 0]`? When does a standard `for` loop communicate intent better than a comprehension?

### Introduce the concept in isolation
```python
lst = [1, 2, 3]
[print(x) for x in lst] # BAD practice
```
```text
1
2
3
[None, None, None]
```
This proves that putting a **side effect** like `print()` inside a comprehension evaluates the effect but creates a useless list of `None` values, which is wasteful and miscommunicates intent.

### Discard the throwaway
This throwaway code is explicitly discarded and will not be placed in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating when to avoid comprehensions.
- **Files affected:** `src/processor.py` (modified)
- **Change type:** add
- **Location:** after `sum_of_squares`
- **Dependencies:** None.

### The New Code
```python
def process_items_with_effects(items):
    for item in items:
        print(f"Processing {item}")
```

### The Updated Project
```python
10: 
11: def sum_of_squares(numbers):
12:     return sum(x**2 for x in numbers)
13: 
14: def process_items_with_effects(items):  # <- new
15:     for item in items:                  # <- new
16:         print(f"Processing {item}")     # <- new
```

### Mechanical walkthrough
- `def`: Defines a function.
- `process_items_with_effects`: Function name.
- `(items)`: Parameter list.
- `:`: Ends header.
- `for`: Starts a traditional for loop.
- `item`: Loop variable.
- `in`: Keyword.
- `items`: Iterable.
- `:`: Ends loop header.
- `print`: Built-in function causing a side effect (output to console).
- `f"Processing {item}"`: Formatted string evaluated for each item.

### CS lens
Side effects vs Pure functions. A comprehension is meant to act like a mathematical map/filter (pure functions returning new data). A side effect alters state outside its scope. This distinction is foundational in functional programming, React's rendering lifecycle, and database transaction isolation.

### SE lens
Design principle: Use the right tool for the job. The alternative NOT chosen is `[print(item) for item in items]`. The real tradeoff is that while the comprehension is technically one line, it violates the semantics of list building and wastes memory on a list of `None`s, making the explicit `for` loop far superior for side effects or highly complex nesting.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Will print "Processing X" for each X in the input, returning `None`.

### One sentence connecting to previous unit
Understanding the limits of comprehensions leads directly into understanding their performance characteristics when used correctly.

## Concept Unit: Comprehensions and performance

### The Problem
We know comprehensions are concise, and generators save memory. But how does this affect runtime performance? Does Python optimize these constructs under the hood?

Is appending to a list in a `for` loop faster or slower than a list comprehension? If we want to check if *any* number in a massive list is even, do we need to check all of them? How does `any()` behave differently with a generator expression versus a list comprehension?

### Introduce the concept in isolation
```python
import time
start = time.time()
res1 = any([x == 5 for x in range(10**7)])
mid = time.time()
res2 = any(x == 5 for x in range(10**7))
end = time.time()
print(f"List comp: {mid - start:.4f}s")
print(f"Gen expr: {end - mid:.4f}s")
```
```text
List comp: 0.5200s
Gen expr: 0.0000s
```
This proves that a generator expression combined with `any()` leverages **short-circuiting**—it stops exactly at `x == 5` without evaluating the rest, whereas the list comprehension eagerly evaluates all 10 million items before `any()` even starts looking.

### Discard the throwaway
This throwaway code is explicitly discarded and will never be used in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/processor.py` (modified)
- **Change type:** add
- **Location:** after `process_items_with_effects`
- **Dependencies:** None.

### The New Code
```python
def has_even(numbers):
    return any(x % 2 == 0 for x in numbers)
```

### The Updated Project
```python
14: def process_items_with_effects(items):
15:     for item in items:
16:         print(f"Processing {item}")
17: 
18: def has_even(numbers):  # <- new
19:     return any(x % 2 == 0 for x in numbers)  # <- new
```

### Mechanical walkthrough
- `def`: Defines a function.
- `has_even`: Function name.
- `(numbers)`: Parameter list.
- `:`: Ends header.
- `return`: Keyword to send back result.
- `any`: Built-in function that returns `True` if any element of the iterable is true.
- `(`: Opens function call.
- `x % 2 == 0`: Expression evaluating to boolean.
- `for`: Starts iteration.
- `x`: Variable bound to element.
- `in`: Keyword.
- `numbers`: Iterable.
- `)`: Closes function call.

### CS lens
Short-circuit evaluation. Stopping computation as soon as the result is logically determined. This appears in boolean logic operators (`A or B`), database query optimizers (stopping a scan once a `LIMIT` is reached), regex engines, and stream processing frameworks.

### SE lens
Design principle: Performance through laziness. The alternative NOT chosen is `any([x % 2 == 0 for x in numbers])`. The real tradeoff is that the list comprehension takes O(N) time and O(N) space, regardless of where the first even number is. The generator expression takes O(1) space and O(K) time, where K is the index of the first even number, drastically improving performance for early matches at the cost of a slightly higher per-iteration overhead in Python.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `True` if any even number is present, fast short-circuiting.

### One sentence connecting to previous unit
These optimizations show how Python's declarative syntax is not just syntactic sugar, but a way to express intent that allows the runtime to execute efficiently.

## Closing

### Connect the pieces
Let's trace how these concepts compose. If we have `words = ['hello', 'hi', 'world', 'ok']` and we want a dictionary of lengths for words longer than 2 characters:
1. `words` is evaluated.
2. The dict comprehension `{word: len(word) for word in words if len(word) > 2}` iterates.
3. `'hello'` passes the filter (len 5 > 2). It adds `{'hello': 5}`.
4. `'hi'` fails the filter (len 2 > 2).
5. `'world'` passes (len 5 > 2). It adds `{'world': 5}`.
6. `'ok'` fails (len 2 > 2).

Result: `{'hello': 5, 'world': 5}`.

If we then want the sum of those lengths using a generator expression:
1. `sum(len(w) for w in words if len(w) > 2)` is called.
2. The generator yields `5` for `'hello'`. `sum` accumulates it (total 5).
3. The generator evaluates `'hi'` and yields nothing.
4. The generator yields `5` for `'world'`. `sum` accumulates it (total 10).
5. The generator evaluates `'ok'` and yields nothing.
6. The generator is exhausted. `sum` returns `10`.

Through this, we see how comprehensions and generators allow us to declare *what* we want to build or calculate without bogging down in *how* to build the intermediate states.
