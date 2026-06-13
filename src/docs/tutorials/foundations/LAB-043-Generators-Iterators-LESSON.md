# FOUNDATIONS — LAB-043 — Python: Generators and Iterators

**Series:** FOUNDATIONS — Part VIII: Python Features
**Environment:** Python REPL (`python3`)
**Time:** 50–65 minutes.

---

## What You Will Build

A custom iterator class, a generator function using `yield`, an infinite sequence generator, and a generator pipeline. After this lab you will understand the iterator protocol, why `yield` suspends execution, and how generators enable processing infinite sequences and large files without loading everything into memory.

---

## What You Need to Know First

**From LAB-042 (List Comprehensions):** Generator expressions are the compact form of generator functions. This lab builds the underlying machinery.

**From LAB-008 (Recursion):** Like recursion, generators use the call stack implicitly. Each `yield` suspends the current frame without destroying it — the opposite of a function return.

---

> **Quick Check — try to answer before reading:**
>
> 1. What does `yield` do differently from `return`?
> 2. Can you call `len()` on a generator? Why or why not?
> 3. What is `StopIteration` and when is it raised?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Iterator Protocol

Python's `for` loop works with any object that implements the **iterator protocol**:
- `__iter__(self)` returns an iterator object (often `self`)
- `__next__(self)` returns the next value, or raises `StopIteration` when exhausted

```python
class CountUp:
    """Counts from start to stop, inclusive."""

    def __init__(self, start: int, stop: int) -> None:
        self.current = start
        self.stop = stop

    def __iter__(self):
        return self  # the object is its own iterator

    def __next__(self) -> int:
        if self.current > self.stop:
            raise StopIteration   # signals that the sequence is exhausted
        value = self.current
        self.current += 1
        return value

# Used directly:
counter = CountUp(1, 5)
print(next(counter))  # 1
print(next(counter))  # 2

# Used in a for loop — the loop calls next() repeatedly until StopIteration:
for number in CountUp(1, 5):
    print(number, end=' ')  # 1 2 3 4 5
```

**The walkthrough:** A `for` loop calls `iter(obj)` to get an iterator, then calls `next(iterator)` repeatedly until `StopIteration` is raised. The loop catches `StopIteration` and exits cleanly. `next(counter)` advances by one step.

**The CS lens — iterator protocol:** This is the Iterator design pattern (LAB-079) as a language protocol. Any object implementing `__iter__` and `__next__` works with `for`, `list()`, `sum()`, `max()`, `zip()`, and every other Python construct that processes sequences. This is the same protocol in JavaScript (`Symbol.iterator`, `next()`).

---

### Step 2 — Generator Functions: `yield` Suspends Execution

A generator function uses `yield` instead of `return`. Calling a generator function does not execute the body — it returns a generator object. The body executes lazily, one `yield` at a time.

```python
def count_up(start: int, stop: int):
    """Generator version of CountUp — simpler, no class needed."""
    current = start
    while current <= stop:
        yield current    # suspend here, return value to caller
        current += 1    # resume here on next next() call

# Calling count_up doesn't run the body:
generator = count_up(1, 5)
print(type(generator))  # <class 'generator'>

# Advance manually:
print(next(generator))  # 1
print(next(generator))  # 2
print(next(generator))  # 3

# Consume the rest with a for loop:
for number in generator:  # starts from 4
    print(number, end=' ')  # 4 5
```

**The walkthrough — `yield` suspension:**

1. `generator = count_up(1, 5)` — creates generator object, **no code executes**.
2. `next(generator)` — execution starts: `current = 1`. `while 1 <= 5`: enters loop. `yield 1` — **execution suspends**. The value `1` is returned to the caller. The generator's frame (with `current = 1`) is preserved on the heap.
3. `next(generator)` — **execution resumes** after the `yield`: `current += 1` (now 2). Loop condition: `2 <= 5`. `yield 2` — suspends again.
4. After `yield 5`: `current += 1` (6). Loop condition: `6 <= 5` — false. Function exits normally. Python raises `StopIteration` automatically.

**The CS lens — coroutine:** A generator function is a type of coroutine — a function that can be paused and resumed. Each `yield` is a suspension point. The generator's frame is stored on the heap (not the call stack) while suspended, which is why it survives across multiple `next()` calls.

---

### Step 3 — Infinite Sequences

A generator can `yield` forever because it never builds the complete sequence:

```python
def fibonacci():
    """Yields the infinite Fibonacci sequence."""
    previous, current = 0, 1
    while True:          # infinite — no StopIteration ever raised
        yield current
        previous, current = current, previous + current

# Take only what we need:
def take(n: int, iterable):
    """Take the first n values from an iterable."""
    count = 0
    for item in iterable:
        if count >= n:
            break
        yield item
        count += 1

fib = fibonacci()
print(list(take(10, fib)))
# [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]

# Alternative using itertools:
import itertools
fib_gen = fibonacci()
first_10 = list(itertools.islice(fib_gen, 10))
print(first_10)  # [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
```

**The walkthrough — infinite generator:** `while True` means the generator never terminates on its own. It keeps yielding as long as the caller calls `next()`. When `take` breaks out of the for loop, the generator is abandoned — its frame remains on the heap until garbage collected. This is safe: Python's garbage collector handles unreachable generators.

---

### Step 4 — Generator Pipelines

Generators compose naturally — one generator can consume another:

```python
def read_numbers(source: list[str]):
    """Yield parsed numbers from a list of strings."""
    for line in source:
        stripped = line.strip()
        if stripped:
            yield float(stripped)

def filter_positive(numbers):
    """Yield only positive numbers."""
    for number in numbers:
        if number > 0:
            yield number

def scale_by(numbers, factor: float):
    """Scale each number by factor."""
    for number in numbers:
        yield number * factor

# Pipeline: source → parse → filter → scale
raw_data = ['3.5', '-1.2', '0', '7.8', '-0.5', '4.1']
pipeline = scale_by(filter_positive(read_numbers(raw_data)), 100)

print(list(pipeline))  # [350.0, 780.0, 410.0]
```

**The walkthrough:** `scale_by` wraps `filter_positive` which wraps `read_numbers`. When the pipeline is iterated, it pulls one value at a time through the entire chain. Reading, filtering, and scaling happen for each element in turn — not one stage for all elements before the next stage starts.

**The CS lens — pipeline as coroutine composition:** Each generator is a coroutine. The pipeline composes coroutines so that data flows one element at a time, never materializing the full intermediate sequences. For large files (millions of rows), this is essential — you process line by line, keeping only one line in memory at a time.

---

### Step 5 — Processing Large Files

The canonical production use of generators:

```python
def read_large_csv(filename: str):
    """Yield one row at a time — never loads the whole file."""
    with open(filename, 'r') as file:
        header = next(csv.reader([file.readline()]))  # skip header
        for line in file:
            yield line.strip().split(',')

def parse_price(row: list[str]) -> float:
    """Extract price from CSV row."""
    return float(row[2])  # column index 2 is 'price'

# Process a 10GB file with constant memory:
# total = sum(parse_price(row) for row in read_large_csv('sales.csv'))
```

A file object in Python is itself an iterator — `for line in file` yields one line at a time. The generator `read_large_csv` wraps this, adding processing. The entire pipeline uses only the memory for one line at a time.

---

## Connect the Pieces

- **Django QuerySets** use the iterator protocol. `User.objects.all()` is lazy — `.iterator()` makes it process rows one at a time like a generator.
- **Python's `csv`, `json` streaming parsers** are iterator-based for large file handling.
- **JavaScript generators** (LAB-011 adjacent) use the same `function*` / `yield` / `Symbol.iterator` protocol — identical semantics, different syntax.
- **Async generators** in Python (`async def` with `yield`) and JavaScript (`async function*`) enable streaming over network connections.

---

## What Breaks Without This

**Consuming a generator twice:**

```python
generator = count_up(1, 5)
first_pass  = list(generator)   # [1, 2, 3, 4, 5] — consumes the generator
second_pass = list(generator)   # [] — generator is exhausted

print(first_pass)   # [1, 2, 3, 4, 5]
print(second_pass)  # []  ← not a copy of first_pass
```

Generators are one-shot — they can only be iterated once. Once `StopIteration` is raised, the generator is done. To iterate multiple times, either recreate the generator or convert to a list first. This is why it matters to know whether you are working with a reusable sequence (list) or a one-shot generator.

---

## Definition of Done

- [ ] `CountUp(1, 5)` works in a for-loop and with `next()`
- [ ] `count_up(1, 5)` generator function produces the same sequence
- [ ] `fibonacci()` is infinite — calling `next()` 10 times gives the first 10 Fibonacci numbers
- [ ] Generator pipeline: parse → filter → scale works correctly
- [ ] Second iteration of an exhausted generator yields empty — you can explain why

**Git commit:**

```
git add src/
git commit -m "LAB-043: Python generators — yield suspends without destroying frame; infinite sequences and pipelines work with O(1) memory"
```

---

## Quick Check Answers

1. **`yield` suspends execution and preserves the frame; `return` terminates execution and destroys the frame.** After `yield`, the generator can be resumed from exactly where it stopped. After `return`, the function is finished — there is nothing to resume.
2. **No.** `len()` requires knowing the total count upfront. A generator may be infinite, or the count may only be known after consuming all values. Generators implement `__next__` but not `__len__`. Use `sum(1 for _ in gen)` to count (consuming the generator).
3. **`StopIteration` is an exception raised by `__next__` when the sequence is exhausted.** For a generator function, Python raises it automatically when the function body returns (normally or via `return`). The `for` loop catches `StopIteration` and exits cleanly. Calling `next()` on an exhausted generator raises `StopIteration` that the caller must handle.
