# Lesson 20: Iterators and Generators — Lazy Computation

What you will build: The reader will understand the iterator protocol (`__iter__`, `__next__`), write generator functions with `yield`, build infinite generators, and use the `itertools` module. The transferable problems: (1) the iterator protocol is how Python's `for` loop actually works — it calls `__next__()` repeatedly; understanding this means you can make ANY object work with `for`; (2) a generator function suspends at each `yield` and resumes where it left off — it does not build the whole sequence in memory; (3) `itertools` gives you combinatorial generators (product, combinations, permutations) and sequence tools (chain, islice, cycle) that work lazily.

What you need to know first: Lessons 0–19.

### Terms used in this lesson

- **Iterator protocol** — the pair of methods (`__iter__` and `__next__`) that an object must implement to support Python's iteration. It exists so that language constructs like `for` loops have a standardized way to request the "next" item from a sequence, regardless of how that sequence is stored or computed.
- **Generator function** — a function that uses `yield` instead of `return` to emit a sequence of values over time. It exists to allow computing a series of values lazily without storing the entire sequence in memory at once.
- **`StopIteration`** — the specific exception raised by an iterator's `__next__` method when there are no more items to return. It exists as a formal signal to consumers (like the `for` loop) that the iteration has cleanly finished, rather than crashing due to an error.
- **`iter`** — the built-in function that requests an iterator object from an iterable. It exists to initialize the iteration process by calling the underlying `__iter__` method on the target object.
- **`next`** — the built-in function that requests the next value from an iterator. It exists to advance the iteration by calling the underlying `__next__` method, handling the transition from one item to the next.
- **`yield`** — the keyword that suspends a function's execution and emits a value to the caller. It exists to maintain the function's internal state between calls, so that the next time it is invoked, it resumes exactly where it left off instead of starting over.
- **`yield from`** — the keyword combination that delegates yielding to a sub-generator or another iterable. It exists to simplify writing recursive generators or yielding everything from another sequence without writing a manual `for` loop.

### Objects and methods used

- **`CountUp`**
  - *What it is:* A custom class demonstrating the iterator protocol.
  - *Implementation:* `class CountUp:` implementing `__iter__` and `__next__`.
  - *Its use:* Serves as a concrete example of how to make a custom object work with a `for` loop.
  - *Type:* Class.
  - *Responsibility:* Maintains a current count and a stop limit, yielding sequential integers until the limit is reached.
  - *Depends on:* Starting and stopping integers provided to the constructor.
  - *Connects to:* A consumer like a `for` loop or `list()` constructor that requests values.
  - *Shape:* An internal implementation detail demonstrating class-based iteration.

- **`sys.getsizeof`**
  - *What it is:* A function from the `sys` module that returns the memory size of an object in bytes.
  - *Implementation:* `def getsizeof(obj, default=...): ...`
  - *Its use:* Used here to prove the massive memory efficiency of generators compared to lists.
  - *Type:* Free function in the `sys` module.
  - *Responsibility:* Accurately reports the memory footprint of a specific object in the Python interpreter.
  - *Depends on:* Any instantiated Python object.
  - *Connects to:* The Python runtime's internal memory management data.
  - *Shape:* A diagnostic tool for introspection.

- **`itertools.islice`**
  - *What it is:* A function to slice an iterable lazily.
  - *Implementation:* `class islice:` (implemented as an iterator type in C).
  - *Its use:* Used to take a specific number of elements from an infinite generator without attempting to consume the whole thing.
  - *Type:* Class/Iterator in the `itertools` module.
  - *Responsibility:* Yields selected items from an iterable based on start, stop, and step arguments, without consuming unneeded items.
  - *Depends on:* An underlying iterable and slice parameters.
  - *Connects to:* Consumes the underlying iterable; is consumed by a `for` loop or `list()`.
  - *Shape:* A standard library utility for iterator manipulation.

- **`itertools.chain`**
  - *What it is:* A function that links multiple iterables together sequentially.
  - *Implementation:* `class chain:` (iterator type).
  - *Its use:* Used to treat multiple sequences as a single continuous sequence without concatenating them in memory.
  - *Type:* Class/Iterator in the `itertools` module.
  - *Responsibility:* Exhausts its first input iterable, then moves seamlessly to the second, and so on.
  - *Depends on:* One or more input iterables.
  - *Connects to:* Consumes the input iterables in order; provides a unified stream to the caller.
  - *Shape:* A standard library utility for iterator manipulation.

- **`itertools.product`**
  - *What it is:* A function that computes the Cartesian product of input iterables.
  - *Implementation:* `class product:` (iterator type).
  - *Its use:* Generates all possible combinations of items from multiple sequences.
  - *Type:* Class/Iterator in the `itertools` module.
  - *Responsibility:* Yields tuples representing the combinatorial product of the inputs.
  - *Depends on:* One or more input iterables.
  - *Connects to:* Consumes the inputs; yields to the caller.
  - *Shape:* A standard library combinatoric tool.

- **`itertools.combinations`**
  - *What it is:* A function that yields length-N subsequences of elements from the input iterable.
  - *Implementation:* `class combinations:` (iterator type).
  - *Its use:* Generates unique subsets of a specific size where order does not matter.
  - *Type:* Class/Iterator in the `itertools` module.
  - *Responsibility:* Yields combinations without replacement.
  - *Depends on:* An input iterable and a combination length integer.
  - *Connects to:* Consumes the input; yields to the caller.
  - *Shape:* A standard library combinatoric tool.

- **`itertools.zip_longest`**
  - *What it is:* An iterator that aggregates elements from multiple iterables, filling in missing values if the iterables are of uneven length.
  - *Implementation:* `class zip_longest:` (iterator type).
  - *Its use:* Zipping parallel streams without losing data from the longer stream.
  - *Type:* Class/Iterator in the `itertools` module.
  - *Responsibility:* Yields tuples containing elements from each iterable, padding with a fill value when an iterable is exhausted.
  - *Depends on:* Input iterables and an optional `fillvalue`.
  - *Connects to:* Consumes the inputs in parallel; yields to the caller.
  - *Shape:* A standard library utility for iterator manipulation.

## Concept Unit: The Iterator Protocol

### The Problem

When you write `for item in [1, 2, 3]:`, Python somehow knows how to start at the beginning of the list, hand you one item at a time, and stop perfectly when the list runs out. What is the actual mechanism making this work, and how could we make our own objects participate in it?

**Socratic prompt:** Think about what a loop needs to function mechanically. If you had to write a `while` loop that did exactly what a `for` loop does for a list, what three specific pieces of state or logic would you need to manage? Take a moment to sketch pseudocode for how a generic loop might ask an object for its next item.

### Isolate the Concept

Here is how the iterator protocol works behind the scenes, using throwaway code to manually trigger the steps a `for` loop usually hides:

```python
lst = [1, 2, 3]
it = iter(lst)          
print(next(it))         
print(next(it))         
print(next(it))         
next(it)                
```

*Output (predicted with certainty without running):*
```
1
2
3
StopIteration
```

This sequence proves that iteration is stateful. The `iter()` function takes an iterable and returns an iterator object (which keeps track of where we are). Calling `next()` advances the state and returns the item. When there is nothing left, a `StopIteration` exception is raised. The `for` loop is simply a syntactic wrapper around this `try/except` pattern. This is called the **iterator protocol**.

### Discard the throwaway example

The manual `iter()` and `next()` code above is discarded; you rarely call these manually in production code, but this is exactly what the `for` loop is doing under the hood.

### Project Change

No reference counterpart — this is a from-scratch addition because we are demonstrating the core language mechanic before applying it to project files.

### The New Code

```python
lst = [1, 2, 3]
it = iter(lst)
while True:
    try:
        item = next(it)
    except StopIteration:
        break
    print(item)
```

### The Updated Project

```python
# 1: lst = [1, 2, 3]
# 2: it = iter(lst)
# 3: while True:
# 4:     try:
# 5:         item = next(it)
# 6:     except StopIteration:
# 7:         break
# 8:     print(item)
```

This `while` loop is the exact mechanical equivalent of `for item in lst: print(item)`.

### Mechanical Walkthrough

1. `lst = [1, 2, 3]` — creates a standard Python list, which is an iterable.
2. `it = iter(lst)` — calls the built-in `iter` function, which delegates to the list's `__iter__()` method, returning a stateful iterator object.
3. `while True:` — begins an infinite loop, exactly what `for` does internally before finding an exit condition.
4. `try:` — sets up an exception handler, because the end of iteration is signaled via an exception in Python.
5. `item = next(it)` — calls the built-in `next` function, which delegates to the iterator's `__next__()` method. This fetches the value and advances the internal pointer.
6. `except StopIteration:` — catches the specific `StopIteration` exception that `__next__()` raises when no items remain.
7. `break` — exits the infinite loop cleanly.
8. `print(item)` — the actual body of what would be the `for` loop.

1. `iter(lst)` runs, requesting the iterator.
2. `next(it)` runs, returning `1`.
3. `next(it)` runs, returning `2`.
4. `next(it)` runs, returning `3`.
5. `next(it)` runs, raising `StopIteration`. The loop catches it and breaks.

### CS Lens

This embodies the **Iterator pattern**, a behavioral design pattern that lets you traverse elements of a collection without exposing its underlying representation (list, stack, tree, etc.). 
Also recognized in: database cursors fetching rows one by one, file stream readers processing a file line by line without loading the whole file into RAM, and linked list traversal algorithms.

### SE Lens

By designing iteration around a protocol (`__iter__` and `__next__`) rather than hardcoding how lists or dictionaries are traversed, Python achieves immense decoupling. The `for` loop code doesn't need to know whether it's iterating over a list, a string, an open file, or a custom object. The alternative would be writing different loop constructs for every data type (`for_list`, `for_dict`), which scales terribly and breaks the moment a developer creates a custom container class.

### Verification

Run via predicted output based on Python's stable core language behavior.

### Connecting to the next step

Now that we know the `for` loop just looks for `__iter__` and `__next__`, we can write a class that implements these exact methods to make it iterable.

## Concept Unit: Making a custom iterator class

### The Problem

If we want to build our own data structure, how do we let other developers loop over it using a standard `for` loop without them needing to call our custom `.get_item_at_index()` methods?

**Socratic prompt:** Look at the iterator protocol we just covered. If you were defining a class `CountUp(start, stop)`, what specific methods would you need to define inside the class to satisfy the `iter()` and `next()` calls? 

### Isolate the Concept

Let's prove we can hook into Python's loop mechanics with throwaway code:

```python
class DummyIter:
    def __iter__(self):
        return self
    def __next__(self):
        raise StopIteration

for x in DummyIter():
    print("This will never print")
```
*Output (predicted with certainty):*
Nothing is printed.

This proves that `for` is completely reliant on these magic methods. The `for` loop called `__iter__`, got `self`, called `__next__`, immediately hit `StopIteration`, and exited before ever running the loop body. 

### Discard the throwaway example

The `DummyIter` class is discarded; an iterator that instantly stops isn't useful for our project, but it proves the hook works.

### Project Change

No reference counterpart — building a standalone iterator class to demonstrate state management.

### The New Code

```python
class CountUp:
    def __init__(self, start, stop):
        self.current = start
        self.stop = stop

    def __iter__(self):
        return self

    def __next__(self):
        if self.current >= self.stop:
            raise StopIteration
        value = self.current
        self.current += 1
        return value
```

### The Updated Project

```python
# 1: class CountUp:
# 2:     def __init__(self, start, stop):
# 3:         self.current = start
# 4:         self.stop = stop
# 5: 
# 6:     def __iter__(self):
# 7:         return self
# 8: 
# 9:     def __next__(self):
# 10:         if self.current >= self.stop:
# 11:             raise StopIteration
# 12:         value = self.current
# 13:         self.current += 1
# 14:         return value
# 15: 
# 16: for n in CountUp(1, 4):
# 17:     print(n)
```

The class now acts exactly like a built-in collection when used in a `for` loop.

### Mechanical Walkthrough

1. `class CountUp:` — defines a new class.
2. `def __init__(self, start, stop):` — the constructor initializing the state (`self.current`) and the boundary (`self.stop`).
3. `def __iter__(self): return self` — the required method for the iterator protocol. By returning `self`, the object declares that it is its own iterator.
4. `def __next__(self):` — the required method to advance state.
5. `if self.current >= self.stop: raise StopIteration` — the exit condition. Once the count reaches the stop limit, it signals exhaustion.
6. `value = self.current` — stores the value to return before mutating state.
7. `self.current += 1` — mutates the state, preparing for the next call.
8. `return value` — yields the value back to the caller.
9. `for n in CountUp(1, 4):` — constructs the object, implicitly calls `iter()`, and begins the loop.

1. `CountUp(1, 4)` creates the object. `current=1`, `stop=4`.
2. `for` calls `iter()`, which returns the object itself.
3. `for` calls `next()`. `current` (1) is less than `stop` (4). Returns 1, increments `current` to 2.
4. `for` calls `next()`. Returns 2, increments `current` to 3.
5. `for` calls `next()`. Returns 3, increments `current` to 4.
6. `for` calls `next()`. `current` (4) equals `stop` (4). `StopIteration` raised. Loop ends.

### CS Lens

This is **State Machine** behavior. The iterator maintains an internal state (`self.current`) and transitions to a new state every time `__next__` is called.

### SE Lens

Writing a full class with `__iter__` and `__next__` is verbose, but it gives you total control over the iteration process. The tradeoff is boilerplate: for simple sequences, writing a full class with initialization and state mutation is heavy compared to just writing a function. We'll see the alternative next.

### Verification

Run via predicted output: the loop will print `1`, `2`, `3` on separate lines.

### Connecting to the next step

Writing classes for every iterator is tedious. Python provides a keyword, `yield`, that writes this entire state machine for you automatically inside a standard function.

## Concept Unit: Generator functions — `yield`

### The Problem

How can we create an iterator without the verbose boilerplate of defining a class with `__iter__` and `__next__` methods?

**Socratic prompt:** If a normal function uses `return` to pass a value back and destroy its local variables, what would a function need to do to pass a value back but *keep* its local variables intact for the next time it's called?

### Isolate the Concept

Let's prove we can pause a function with throwaway code:

```python
def pause_demo():
    yield "first"
    yield "second"

gen = pause_demo()
print(next(gen))
print(next(gen))
```
*Output (predicted with certainty):*
```
first
second
```

This proves that `yield` suspends the function rather than destroying it. The function **generator** emits `"first"`, goes to sleep, and when `next()` is called again, it wakes up on the line immediately following the first `yield` and continues to the second. This is called a **generator function**.

### Discard the throwaway example

The `pause_demo` is discarded; it proves the suspension mechanic but isn't a robust counter.

### Project Change

No reference counterpart. Rebuilding the `CountUp` logic using the `yield` keyword.

### The New Code

```python
def count_up(start, stop):
    current = start
    while current < stop:
        yield current
        current += 1
```

### The Updated Project

```python
# 1: def count_up(start, stop):
# 2:     current = start
# 3:     while current < stop:
# 4:         yield current
# 5:         current += 1
# 6:
# 7: gen = count_up(1, 4)
# 8: print(type(gen))
# 9: print(next(gen))
# 10: print(next(gen))
# 11: print(next(gen))
# 12: next(gen)
```

The function `count_up` replaces the entire `CountUp` class we wrote previously.

### Mechanical Walkthrough

1. `def count_up(start, stop):` — defines a function. However, because the body contains the `yield` keyword, Python's parser marks this as a generator function, not a regular function.
2. `current = start` — initializes the local state.
3. `while current < stop:` — loops based on the boundary condition.
4. `yield current` — suspends the function, saves all local state (including the value of `current`), and emits the value to the caller.
5. `current += 1` — when the generator is resumed via `next()`, execution starts exactly here, mutating the state.
6. `gen = count_up(1, 4)` — calling a generator function does *not* execute its body. It returns a generator object.
7. `print(type(gen))` — prints `<class 'generator'>`.
8. `print(next(gen))` — advances the generator, yielding `1`.
9. `next(gen)` (last line) — the `while` condition fails, the function naturally ends, which Python translates into raising `StopIteration`.

1. Call `count_up(1,4)` → nothing runs yet, returns a generator object.
2. First `next(gen)` → execution enters function, `current` is 1, hits `yield 1`, suspends, returns 1.
3. Second `next(gen)` → resumes after yield, increments `current` to 2, loops, hits `yield 2`, returns 2.
4. Third `next(gen)` → resumes after yield, increments `current` to 3, hits `yield 3`, returns 3.
5. Fourth `next(gen)` → increments to 4, `while 4 < 4` is False, loop exits, function ends, `StopIteration` raised.

### CS Lens

This is **Coroutines** or **Continuations** (specifically, asymmetric coroutines). A routine that can suspend its execution and yield control back to the caller, only to be resumed later from the exact point of suspension.

### SE Lens

The `yield` keyword shifts the burden of writing state machines from the developer to the compiler. The tradeoff is that generator functions can be slightly harder to debug conceptually because control flow jumps back and forth between the caller and the generator, breaking the traditional "functions run top-to-bottom and return once" mental model.

### Verification

Run via predicted output: 1, 2, 3, followed by a `StopIteration` exception.

### Connecting to the next step

Because generators only compute the next value when asked, they don't need to know when to stop. We can build sequences that go on forever.

## Concept Unit: Infinite generators

### The Problem

If a list holds its data in memory, a list of all positive integers is impossible. How can we represent a mathematically infinite sequence in a finite program?

**Socratic prompt:** If a generator only runs when `next()` is called, what happens if the generator has a `while True:` loop inside it? Will it crash the program immediately, or will it just wait patiently?

### Isolate the Concept

Let's prove an infinite loop is safe inside a generator with throwaway code:

```python
def naturals():
    n = 0
    while True:
        yield n
        n += 1

gen = naturals()
print(next(gen))
print(next(gen))
```

*Output (predicted with certainty):*
```
0
1
```

This proves that infinite loops in generators do not freeze the program. The generator yields and waits. It only computes the next value when `next()` is called. We can represent infinity lazily.

### Discard the throwaway example

The `naturals` generator is discarded here, but we will write a more complex infinite generator for the project.

### Project Change

No reference counterpart. Adding a Fibonacci generator and using `itertools.islice` to safely consume it.

### The New Code

```python
import itertools

def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

print(list(itertools.islice(fibonacci(), 10)))
```

### The Updated Project

```python
# 1: import itertools
# 2: 
# 3: def fibonacci():
# 4:     a, b = 0, 1
# 5:     while True:
# 6:         yield a
# 7:         a, b = b, a + b
# 8: 
# 9: print(list(itertools.islice(fibonacci(), 10)))
```

The program calculates the first 10 Fibonacci numbers lazily from an infinite sequence.

### Mechanical Walkthrough

1. `import itertools` — brings in Python's standard library for iterator manipulation.
2. `def fibonacci():` — defines a generator function.
3. `a, b = 0, 1` — initializes the first two Fibonacci numbers.
4. `while True:` — creates an infinite loop.
5. `yield a` — yields the current Fibonacci number and suspends.
6. `a, b = b, a + b` — on resume, advances the sequence using tuple unpacking to update both variables simultaneously.
7. `itertools.islice(fibonacci(), 10)` — calls `islice`, which wraps the infinite generator. It will internally call `next()` exactly 10 times and then raise `StopIteration`, shielding the caller from the infinite loop.
8. `list(...)` — consumes the finite slice and collects the yielded items into memory.

1. `fibonacci()` returns an infinite generator object.
2. `islice` wraps it, creating a new iterator configured to stop after 10 pulls.
3. `list()` rapidly pulls 10 times.
4. `islice` reaches 10, raises `StopIteration`.
5. `list()` catches it and returns the completed list.

### CS Lens

This embodies **Lazy Evaluation** (or call-by-need). Values are computed exactly at the moment they are needed, rather than computed upfront. This is identical to streams in Lisp or Scheme, providing a way to decouple the definition of a sequence (infinite) from the consumption of a sequence (finite).

### SE Lens

Infinite generators perfectly separate the *generation* logic from the *termination* logic. The `fibonacci()` function doesn't need to accept a `max_terms` argument. The consumer decides when to stop. This increases the reusability of the generator.

### Verification

Run via predicted output: `[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`

### Connecting to the next step

Writing `yield` functions is powerful, but Python provides an even shorter syntax for mapping and filtering data lazily: generator expressions.

## Concept Unit: Generator expressions

### The Problem

List comprehensions build a whole list in memory (`[x**2 for x in range(1_000_000)]`). If we only want to iterate over the squared numbers one by one, can we write a one-liner that doesn't waste RAM?

**Socratic prompt:** A list comprehension uses brackets `[]`. If you change those brackets to parentheses `()`, what kind of object might Python construct instead?

### Isolate the Concept

Let's prove the memory difference with throwaway code:

```python
import sys
big_list = [x**2 for x in range(1_000_000)]
big_gen = (x**2 for x in range(1_000_000))

print(sys.getsizeof(big_list)) 
print(sys.getsizeof(big_gen))  
```
*Output (predicted with certainty):*
```
8448728
208
```

This proves that generator expressions (`()`) are fundamentally different from list comprehensions (`[]`). The list computes all million items immediately, consuming ~8MB. The generator expression computes nothing upfront, storing only the rule for how to compute items, consuming a constant ~208 bytes regardless of the sequence size.

### Discard the throwaway example

The sizing demonstration is discarded. We will write a practical generator expression.

### Project Change

No reference counterpart. Using generator expressions for lazy filtering.

### The New Code

```python
gen = (x**2 for x in range(10) if x % 2 == 0)
print(next(gen))
print(next(gen))
print(list(gen))
```

### The Updated Project

```python
# 1: gen = (x**2 for x in range(10) if x % 2 == 0)
# 2: print(next(gen))
# 3: print(next(gen))
# 4: print(list(gen))
```
This iterates lazily and demonstrates generator exhaustion.

### Mechanical Walkthrough

1. `(x**2 for x in range(10) if x % 2 == 0)` — a **generator expression**. The syntax is identical to a list comprehension, but bounded by parentheses. It returns a generator object.
2. `gen = ...` — stores the generator object.
3. `print(next(gen))` — pulls the first item (`0**2` = `0`).
4. `print(next(gen))` — pulls the second item (skips 1, calculates `2**2` = `4`).
5. `print(list(gen))` — pulls all *remaining* items into a list. Because 0 and 4 were already consumed, the list only contains `[16, 36, 64]`.

1. `next(gen)` yields 0.
2. `next(gen)` yields 4.
3. `list(gen)` exhausts the iterator, gathering the rest.

### CS Lens

This is **Stream Processing**. Data flows through transformations without ever being materialized in a large intermediate buffer.

### SE Lens

Generator expressions are stateful and consumable. Once an item is pulled out, it is gone forever. If you need to iterate over the data multiple times, a generator is the wrong choice; you must convert it to a list first. The tradeoff is memory efficiency vs. reusability.

### Verification

Run via predicted output: 
```
0
4
[16, 36, 64]
```

### Connecting to the next step

Python provides an entire standard library module built explicitly to manipulate these lazy sequences: `itertools`.

## Concept Unit: `itertools`

### The Problem

If you want to concatenate two lazy generators, you can't use the `+` operator, because `+` only works on realized lists in memory. How do we perform complex operations (chaining, zipping, permutations) while maintaining laziness?

**Socratic prompt:** If you have an iterator of letters and an iterator of numbers, how would you lazily yield from the first until it's empty, and then instantly start yielding from the second?

### Isolate the Concept

Let's prove lazy concatenation with throwaway code:

```python
import itertools
letters = (x for x in "AB")
numbers = (x for x in [1, 2])
chained = itertools.chain(letters, numbers)
print(next(chained))
print(next(chained))
print(next(chained))
```
*Output (predicted with certainty):*
```
A
B
1
```

This proves `itertools.chain` seamlessly glues iterators together without materializing a new list in memory.

### Discard the throwaway example

The chaining demonstration is discarded. We will explore a suite of combinatorial tools.

### Project Change

No reference counterpart. Expanding the toolbox.

### The New Code

```python
import itertools

# zip_longest: zip with fill value for unequal lengths
print(list(itertools.zip_longest([1,2],[10,20,30], fillvalue=0)))

# product: Cartesian product
print(list(itertools.product('AB', repeat=2)))

# combinations
print(list(itertools.combinations('ABC', 2)))
```

### The Updated Project

```python
# 1: import itertools
# 2: 
# 3: print(list(itertools.zip_longest([1,2],[10,20,30], fillvalue=0)))
# 4: print(list(itertools.product('AB', repeat=2)))
# 5: print(list(itertools.combinations('ABC', 2)))
```

We now have robust tools for manipulating streams.

### Mechanical Walkthrough

1. `import itertools` — imports the iterator tools module.
2. `itertools.zip_longest([1,2],[10,20,30], fillvalue=0)` — standard `zip` stops when the shortest iterable stops. `zip_longest` continues until the longest one stops, padding the missing slots of the shorter one with `0`. Returns an iterator yielding tuples.
3. `list(...)` — consumes the tuples to display them.
4. `itertools.product('AB', repeat=2)` — computes the Cartesian product (every possible combination with replacement). `repeat=2` is equivalent to `product('AB', 'AB')`. Returns an iterator yielding tuples.
5. `itertools.combinations('ABC', 2)` — yields unique combinations of length 2 from the input iterable, without replacement. Order does not matter (`A,B` is the same as `B,A`, so only one is yielded). Returns an iterator yielding tuples.

### CS Lens

This is **Combinatorics**. `itertools` provides highly optimized, C-level implementations of foundational mathematical permutations and combinations.

### SE Lens

Using `itertools` avoids deeply nested `for` loops. `itertools.product` flattens what would be a multi-level nested loop into a single, lazy stream. The tradeoff is readability for those unfamiliar with the module, but it is heavily idiomatic in professional Python codebases.

### Verification

Run via predicted output:
```
[(1, 10), (2, 20), (0, 30)]
[('A', 'A'), ('A', 'B'), ('B', 'A'), ('B', 'B')]
[('A', 'B'), ('A', 'C'), ('B', 'C')]
```

### Connecting to the next step

If `itertools.chain` didn't exist, you would have to write a loop to yield items from one generator, and then a second loop to yield items from another. Python 3.3 introduced a keyword to make delegating generators easier.

## Concept Unit: Using `yield from`

### The Problem

If a generator needs to yield every item from a list or another generator, writing `for item in sub_iterable: yield item` is verbose and slow. How can a generator directly delegate its output to a sub-iterator?

**Socratic prompt:** If you have a recursive data structure like a list containing other lists, how would a generator dive into the inner lists and yield their items?

### Isolate the Concept

Let's prove delegation with throwaway code:

```python
def sub_gen():
    yield 1
    yield 2

def main_gen():
    yield from sub_gen()
    yield 3

print(list(main_gen()))
```
*Output (predicted with certainty):*
```
[1, 2, 3]
```

This proves `yield from` directly connects the inner iterable to the outer caller. The `main_gen` delegates control entirely to `sub_gen` until `sub_gen` is exhausted, then resumes.

### Discard the throwaway example

The basic delegation is discarded. We will write a recursive flatter.

### Project Change

No reference counterpart. Writing a recursive flattener.

### The New Code

```python
def flatten(lst):
    for item in lst:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item
```

### The Updated Project

```python
# 1: def flatten(lst):
# 2:     for item in lst:
# 3:         if isinstance(item, list):
# 4:             yield from flatten(item)
# 5:         else:
# 6:             yield item
# 7: 
# 8: print(list(flatten([1, [2, 3], [4, [5, 6]], 7])))
```

This handles arbitrary nesting depth cleanly and lazily.

### Mechanical Walkthrough

1. `def flatten(lst):` — defines the generator function.
2. `for item in lst:` — iterates over the incoming iterable.
3. `if isinstance(item, list):` — checks if the current item is itself a list.
4. `yield from flatten(item)` — if it is a list, recursively calls `flatten(item)`. `yield from` unpacks the recursively yielded items and forwards them directly to the original caller.
5. `else:` — if it's a scalar value.
6. `yield item` — yields it normally.
7. `print(list(...))` — consumes the generator.

1. `flatten` sees `1`, yields `1`.
2. Sees `[2, 3]`, makes recursive call, `yield from` pipes `2` and `3` out.
3. Sees `[4, [5, 6]]`, recursively flattens, piping `4`, `5`, `6` out.
4. Sees `7`, yields `7`.

### CS Lens

This is **Tree Traversal**. A nested list is structurally a tree. The generator is performing a depth-first search (DFS) over the tree, yielding leaf nodes.

### SE Lens

`yield from` is functionally equivalent to writing an inner `for` loop, but it is heavily optimized in C under the hood, making it significantly faster for deep recursion. It also automatically handles propagating `StopIteration` and generator return values correctly, eliminating subtle edge case bugs.

### Verification

Run via predicted output:
```
[1, 2, 3, 4, 5, 6, 7]
```

### Connecting to the next step

Iterators and generators are the foundation of Python's memory-efficient processing. All of Python's built-in iteration tools (for, list comprehensions, map, filter, zip) use the same iterator protocol. Lesson 21 closes Module 2 with program structure, decomposition, and style.
