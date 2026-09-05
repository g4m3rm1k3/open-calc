# Lesson 08: Tuples — Immutable Sequences

What you will build: The reader understands tuples: immutable ordered sequences, when to choose tuple over list, packing/unpacking, multiple return values, and using tuples as dict keys. The transferable insight: immutability is a GUARANTEE. A tuple promises it will not change. This lets Python use tuples as dict keys (requires hashability), lets you use them as function return values safely, and signals to the reader that this collection is not meant to be modified.

What you need to know first: Lessons 00-07.

## Terms used in this lesson

- **Tuple literal** — A sequence of values separated by commas, often enclosed in parentheses, representing a fixed-size ordered collection.
- **Immutability** — The property of an object whose state cannot be modified after it is created. It guarantees the data will not change.
- **Packing** — The act of grouping multiple values into a single tuple object without explicitly writing parentheses.
- **Unpacking** — The act of assigning the individual elements of a tuple to a sequence of variables in a single statement.
- **Star unpacking** — Using an asterisk (`*`) during unpacking to gather multiple remaining elements of a sequence into a list.
- **Hashability** — A property of an object that means it has a hash value which never changes during its lifetime, allowing it to be used as a dictionary key or in a set.
- **Record** — A data structure (often a tuple in Python) that groups related, heterogeneous fields together (like a row in a database).

## Objects and methods used

- **`len`**
  - *What it is:* A built-in function that returns the number of items in a container.
  - *Implementation:* `def len(obj, /): ...`
  - *Its use:* To count the number of elements in a tuple.
  - *Type:* Built-in function.
  - *Responsibility:* Computes and returns the size (length) of the given collection.
  - *Depends on:* A collection or sequence passed as an argument.
  - *Connects to:* Called by application code, queries the object's internal `__len__` method.
  - *Shape:* A global built-in function boundary.

- **`min`**
  - *What it is:* A built-in function that returns the smallest item in an iterable.
  - *Implementation:* `def min(iterable, *[, default=obj, key=func]): ...`
  - *Its use:* To find the minimum value in a sequence to demonstrate multiple return values.
  - *Type:* Built-in function.
  - *Responsibility:* Identifies and returns the minimum element from a given iterable.
  - *Depends on:* An iterable containing comparable elements.
  - *Connects to:* Called by application code, queries the iterable's elements and their comparison operations.
  - *Shape:* A global built-in function boundary.

- **`max`**
  - *What it is:* A built-in function that returns the largest item in an iterable.
  - *Implementation:* `def max(iterable, *[, default=obj, key=func]): ...`
  - *Its use:* To find the maximum value in a sequence to demonstrate multiple return values.
  - *Type:* Built-in function.
  - *Responsibility:* Identifies and returns the maximum element from a given iterable.
  - *Depends on:* An iterable containing comparable elements.
  - *Connects to:* Called by application code, queries the iterable's elements and their comparison operations.
  - *Shape:* A global built-in function boundary.

- **`hash`**
  - *What it is:* A built-in function that returns the hash value of an object, if it has one.
  - *Implementation:* `def hash(obj, /): ...`
  - *Its use:* To demonstrate that tuples of hashable items are themselves hashable and thus valid as dictionary keys.
  - *Type:* Built-in function.
  - *Responsibility:* Computes an integer fingerprint for an object.
  - *Depends on:* An object that implements a valid hash function.
  - *Connects to:* Called by application code or internally by dictionaries and sets.
  - *Shape:* A global built-in function boundary.

- **`frozenset`**
  - *What it is:* A built-in class representing an immutable set.
  - *Implementation:* `class frozenset(iterable=(), /): ...`
  - *Its use:* Mentioned as the immutable (and therefore hashable) equivalent to a set.
  - *Type:* Built-in class.
  - *Responsibility:* Provides set operations without allowing modifications after creation.
  - *Depends on:* An iterable to initialize its elements.
  - *Connects to:* Called by application code to create immutable sets.
  - *Shape:* A built-in type boundary.

---

## Concept Unit: Tuple literals and immutability

### The Problem

If you need a collection of items that should *never* change during the execution of your program, how do you prevent yourself or other code from accidentally modifying it? If you use a list, what happens if someone calls `.append()` or overwrites an index? How do you create an ordered collection that guarantees it will remain exactly as defined?

### Introduce the concept in isolation

```python
t = (1, 2, 3)
single_t = (1,)
print(t[0])
try:
    t[0] = 99
except TypeError as e:
    print(f"Error: {e}")
```
Output:
```text
1
Error: 'tuple' object does not support item assignment
```
This proves that a **tuple** is an immutable sequence. Attempting to reassign an index raises a `TypeError`, guaranteeing the collection's structure cannot be changed once created.

### Discard the throwaway

This throwaway code is explicitly discarded and will not appear in our project.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are exploring Python sequence types.
- **Files affected:** `tests/test_collections.py` (created)
- **Change type:** Add
- **Location:** At the top of the file
- **Dependencies:** None

### The New Code

```python
def check_tuple():
    coordinates = (10, 20)
    return len(coordinates)
```

### The Updated Project

```python
# ← new
1: def check_tuple():
2:     coordinates = (10, 20)
3:     return len(coordinates)
```
This new file introduces a function that creates a tuple and returns its length.

### Mechanical walkthrough

- `def check_tuple():`: Defines a new function named `check_tuple` taking no arguments.
- `coordinates = (10, 20)`: Assigns a tuple literal containing `10` and `20` to the variable `coordinates`.
- The `(10, 20)` literal creates an ordered sequence of two integers in memory.
- `return len(coordinates)`: Calls the built-in `len` function on the tuple and returns the resulting integer (`2`).

### CS lens

This is the concept of **Immutability**. In Computer Science, immutable data structures cannot be modified after creation. This appears in string representations in Java, state management in React (where state is treated as immutable), Git commits (which cannot be changed once written, only appended), and functional programming languages like Haskell where all data is immutable by default.

### SE lens

The design principle here is **Defense in Depth**. By using a tuple instead of a list, you statically prevent a whole class of bugs related to unintended state mutation. The alternative NOT chosen is using a list and just trying to be careful not to modify it. The tradeoff is that you lose the flexibility to append or modify elements in-place, meaning you must create a whole new tuple if a change is genuinely needed, which can have minor performance costs.

### Commands needed

`python3`

### Run it

Predicted confidently: `2`

### One sentence connecting to previous unit

With the guarantee that a tuple will not change, we can now look at how to easily extract its fixed values into distinct variables.

---

## Concept Unit: Packing and unpacking

### The Problem

When you have a record containing multiple related values (like a name and an age), accessing them by index (`record[0]`, `record[1]`) is tedious and hard to read. How can we elegantly extract all the values of a tuple into distinct, named variables in a single line of code?

### Introduce the concept in isolation

```python
record = "Alice", 25, 95.5
name, age, score = record
print(name, score)

a, b = 1, 2
a, b = b, a
print(a, b)

first, *rest = (1, 2, 3, 4)
print(rest)
```
Output:
```text
Alice 95.5
2 1
[2, 3, 4]
```
This proves **packing and unpacking**. Values separated by commas are automatically packed into a tuple, and assigning a tuple to a comma-separated list of variables unpacks it. The `*` syntax gathers remaining elements.

### Discard the throwaway

This throwaway code is explicitly discarded and will not appear in our project.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are exploring Python sequence types.
- **Files affected:** `tests/test_collections.py` (modified)
- **Change type:** Add
- **Location:** Below `check_tuple`
- **Dependencies:** None

### The New Code

```python
def get_user_info():
    user = ("Bob", 30)
    name, age = user
    return name
```

### The Updated Project

```python
1: def check_tuple():
2:     coordinates = (10, 20)
3:     return len(coordinates)
4: 
5: # ← new
6: def get_user_info():
7:     user = ("Bob", 30)
8:     name, age = user
9:     return name
```
This adds a function demonstrating unpacking a tuple into individual named variables.

### Mechanical walkthrough

- `def get_user_info():`: Defines a new function.
- `user = ("Bob", 30)`: Assigns a tuple literal to `user`.
- `name, age = user`: Unpacks the tuple `user`. The first element `"Bob"` is assigned to `name`, and the second element `30` is assigned to `age`.
- `return name`: Returns the string assigned to `name`.

### CS lens

This is **Pattern Matching / Destructuring**. This idea appears in Lisp (via macros like `destructuring-bind`), Rust (pattern matching in `match` or `let`), JavaScript (object and array destructuring), and Erlang (where pattern matching is the primary way to bind variables and direct control flow).

### SE lens

The design principle is **Self-Documenting Code**. By unpacking `user` into `name, age`, the code explicitly documents what the tuple contains, rather than forcing the reader to guess what `user[0]` and `user[1]` mean. The alternative NOT chosen is index-based access. The tradeoff is that unpacking requires you to know the exact length of the tuple (or use star unpacking), otherwise Python raises a `ValueError`.

### Commands needed

None for this unit.

### Run it

Predicted confidently: `'Bob'`

### One sentence connecting to previous unit

Because packing and unpacking are so seamless, tuples become the perfect mechanism for a function to return more than one result at a time.

---

## Concept Unit: Multiple return values

### The Problem

A function can only execute one `return` statement that yields one object. If you need a function to compute and return two distinct pieces of information—like the minimum and maximum of a sequence—how do you get both values back to the caller without creating a complex custom class?

### Introduce the concept in isolation

```python
def minmax(lst):
    return min(lst), max(lst)

lo, hi = minmax([3, 1, 4, 1, 5])
print(lo, hi)
```
Output:
```text
1 5
```
This proves that a function can return multiple values as a tuple, which the caller can immediately unpack. The return statement automatically packs the values.

### Discard the throwaway

This throwaway code is explicitly discarded and will not appear in our project.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are exploring Python sequence types.
- **Files affected:** `tests/test_collections.py` (modified)
- **Change type:** Add
- **Location:** Below `get_user_info`
- **Dependencies:** None

### The New Code

```python
def bounds(numbers):
    return min(numbers), max(numbers)
```

### The Updated Project

```python
6: def get_user_info():
7:     user = ("Bob", 30)
8:     name, age = user
9:     return name
10:
11: # ← new
12: def bounds(numbers):
13:     return min(numbers), max(numbers)
```
This adds a function that computes the minimum and maximum of a collection and returns both.

### Mechanical walkthrough

- `def bounds(numbers):`: Defines a function accepting a collection.
- `return min(numbers), max(numbers)`: Computes the minimum using the built-in `min` function, computes the maximum using the built-in `max` function, and returns them as an implicitly packed tuple.

### CS lens

This is the concept of **Multiple Return Values**. It appears in Go (where returning a result and an error is idiomatic), Lua (which natively supports multiple returns), Swift (using tuples for multiple returns), and SQL (where a `SELECT` statement returns a row with multiple columns).

### SE lens

The design principle is **Lightweight Abstraction**. Tuples provide a zero-overhead way to group values temporarily. The alternative NOT chosen is returning a dictionary or defining a custom class for the return type. The tradeoff is that tuples lack field names; the caller must remember the exact order of the returned elements, which can become confusing if a function returns more than three values.

### Commands needed

None for this unit.

### Run it

Predicted confidently: `(1, 5)` if called with `[3, 1, 4, 1, 5]`.

### One sentence connecting to previous unit

The fact that a tuple is a single, immutable object not only makes it great for returns, but also makes it safe to use as a unique identifier or key.

---

## Concept Unit: Tuples as dict keys — hashability

### The Problem

Dictionaries require keys to be immutable so their internal hash values never change. You cannot use a list like `[0, 0]` as a dictionary key to represent a coordinate. How can we use a composite value—like a grid coordinate `(x, y)`—as a key to map to a location string?

### Introduce the concept in isolation

```python
d = {}
t = (0, 0)
d[t] = "start"

try:
    d[[0, 0]] = "end"
except TypeError as e:
    print(e)
    
print(hash(t) == hash((0, 0)))
```
Output:
```text
unhashable type: 'list'
True
```
This proves that tuples are **hashable** (if their contents are hashable), allowing them to be used as dictionary keys. Lists are unhashable and will raise a `TypeError`.

### Discard the throwaway

This throwaway code is explicitly discarded and will not appear in our project.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are exploring Python sequence types.
- **Files affected:** `tests/test_collections.py` (modified)
- **Change type:** Add
- **Location:** Below `bounds`
- **Dependencies:** None

### The New Code

```python
def map_grid():
    grid = {(0, 0): 'start', (3, 4): 'end'}
    return grid[(0, 0)]
```

### The Updated Project

```python
12: def bounds(numbers):
13:     return min(numbers), max(numbers)
14:
15: # ← new
16: def map_grid():
17:     grid = {(0, 0): 'start', (3, 4): 'end'}
18:     return grid[(0, 0)]
```
This adds a function demonstrating a dictionary that uses tuples as its keys.

### Mechanical walkthrough

- `def map_grid():`: Defines a function.
- `grid = {(0, 0): 'start', (3, 4): 'end'}`: Creates a dictionary where the keys are tuple literals (`(0, 0)` and `(3, 4)`) and the values are strings.
- `return grid[(0, 0)]`: Looks up the value associated with the tuple key `(0, 0)` and returns it.

### CS lens

This is **Hashability**. For a hash table to function, the hash of a key must remain constant over time. This appears in Java's `hashCode()` contract, Cryptographic hashes (SHA-256) where any change to input radically changes the output, database indexing strategies, and Content-Addressable Storage systems (like Git's internal objects).

### SE lens

The design principle is **Contract Enforcement**. Python enforces at runtime that only hashable types can be dict keys. The alternative NOT chosen is allowing mutable keys but warning the user not to change them (which C++'s `std::map` historically allowed, leading to hard-to-find bugs when elements were modified). The tradeoff is that if you have a tuple containing a list, that tuple is suddenly no longer hashable, meaning hashability depends deeply on the entire contents of the tuple.

### Commands needed

None for this unit.

### Run it

Predicted confidently: `'start'`

### One sentence connecting to previous unit

Understanding how tuples act as fixed records leads directly into the question of when to use a tuple versus a list.

---

## Concept Unit: When to use tuple vs. list

### The Problem

Both lists and tuples hold ordered sequences of items, and both support indexing and slicing. If you can do almost everything with a list, why shouldn't you just use lists for everything? How do you decide which sequence type to use when designing a program?

### Introduce the concept in isolation

```python
import sys
my_list = [1, "two", 3.0]
my_tuple = (1, "two", 3.0)
print(sys.getsizeof(my_list) > sys.getsizeof(my_tuple))
```
Output:
```text
True
```
This proves that tuples are a lighter, fixed-size structure. A tuple is best used as a **heterogeneous record** (different types, fixed structure), while a list is best for a **homogeneous collection** (same type, variable size).

### Discard the throwaway

This throwaway code is explicitly discarded and will not appear in our project.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are exploring Python sequence types.
- **Files affected:** `tests/test_collections.py` (modified)
- **Change type:** Add
- **Location:** Below `map_grid`
- **Dependencies:** None

### The New Code

```python
def process_records():
    # List of heterogeneous tuples
    people = [("Alice", 25), ("Bob", 30)]
    return people[0][1]
```

### The Updated Project

```python
16: def map_grid():
17:     grid = {(0, 0): 'start', (3, 4): 'end'}
18:     return grid[(0, 0)]
19:
20: # ← new
21: def process_records():
22:     # List of heterogeneous tuples
23:     people = [("Alice", 25), ("Bob", 30)]
24:     return people[0][1]
```
This adds a function showing the standard convention: using a list to hold an unknown number of items, where each item is a fixed-structure tuple record.

### Mechanical walkthrough

- `def process_records():`: Defines a function.
- `people = [("Alice", 25), ("Bob", 30)]`: Creates a list named `people`. Inside the list are two tuple literals. The list can grow or shrink, but each tuple strictly holds a name string and an age integer.
- `return people[0][1]`: Accesses the first element of the list (the tuple `("Alice", 25)`), and then accesses the second element of that tuple (the integer `25`).

### CS lens

This is **Data Modeling / Structuring**. This pattern appears in Relational Databases (a table is a list of rows, and each row is a fixed-schema tuple), JSON arrays of objects, CSV files (where lines are homogeneous, but columns are heterogeneous), and C `struct` arrays.

### SE lens

The design principle is **Intent Disclosure**. Using a tuple signals to any programmer reading your code: "This structure has a specific, unchanging shape." The alternative NOT chosen is using a list of lists. The tradeoff is that you cannot dynamically add new fields (like an address) to the tuple at runtime; if your data needs to morph, a dictionary or an object is a better choice.

### Commands needed

None for this unit.

### Run it

Predicted confidently: `25`

### One sentence connecting to previous unit

With the differences firmly established, we can see how all these properties of tuples interact across a system.

---

## Closing

### Connect the pieces

Consider the record `('Alice', 25, 95.5)` as it flows through a system across all these concepts.
1. **Creation:** You create it as a literal: `record = ('Alice', 25, 95.5)`. Its immutability guarantees that no other part of the program can accidentally change Alice's score.
2. **Unpacking:** When you need to process it, you can effortlessly extract the fields: `name, age, score = record`.
3. **Use as a dict key:** Because it's a tuple of immutable values, it is hashable. You could use it as a key in a dictionary to cache results: `cache[record] = "Processed"`.
4. **Sorting:** When placed in a list with other tuples (e.g., `records = [('Alice', 25, 95.5), ('Bob', 30, 80.0)]`), you can easily sort the list. Python will sort the tuples by comparing their first elements, then their second, and so on, taking advantage of the predictable structure a tuple provides.

The immutability of the tuple is the core feature that enables all of these safe, efficient behaviors.
