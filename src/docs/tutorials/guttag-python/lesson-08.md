# Lesson 8: Tuples — Immutable Sequences

What you will build: You will learn when to use tuples instead of lists, how tuple unpacking works, how functions use tuples to return multiple values, and how to use `zip()`. The transferable problems this lesson addresses are: (1) communicating intent with a tuple: "this collection should not change" — it is a CONTRACT, not just an optimization; (2) using tuple unpacking as a powerful pattern that appears everywhere in Python (e.g., swapping variables, function return values); (3) using `zip()` to pair elements from multiple sequences, enabling parallel iteration.

What you need to know first: Lessons 0–7 (REPL, types, variables, conditionals, iteration, functions, strings, lists).

**Terms used in this lesson:**
- **Tuple** — A sequence type in Python that is like a list, but immutable. It exists to represent fixed collections of items, such as a record (e.g., coordinates), where the structure and values should not change after creation.
- **Immutable** — A property of an object meaning its state or contents cannot be modified after it is created. It solves the problem of unintended side effects and allows data to be safely shared and used as dictionary keys.
- **Unpacking** — The act of assigning the individual elements of a sequence (like a tuple or list) to multiple variables in a single statement. It solves the problem of needing to write multiple lines of indexing assignments just to extract values.
- **Hashable** — A property of an object that means it has a hash value that never changes during its lifetime, allowing it to be used as a dictionary key or in a set. Tuples are hashable (if all their elements are); lists are not.

**Objects and methods used:**
- `tuple`
  - *What it is:* A built-in Python sequence type.
  - *Implementation:* Created using parentheses `()` or a comma-separated sequence of values.
  - *Its use:* Used when a collection represents a fixed record that should not change.
  - *Type:* Built-in class.
  - *Responsibility:* Stores an ordered, immutable collection of elements.
  - *Depends on:* The elements provided at creation time.
  - *Connects to:* Supports sequence operations like indexing, slicing, and iteration.
  - *Shape:* A core data structure in Python, often used at API boundaries for returning multiple values.
- `zip()`
  - *What it is:* A built-in function that iterates over several iterables in parallel.
  - *Implementation:* Returns a zip object, which is an iterator of tuples where the i-th tuple contains the i-th element from each of the argument sequences or iterables.
  - *Its use:* Used to pair elements from multiple sequences together, making parallel iteration clean and readable.
  - *Type:* Built-in function (technically a type/class in Python 3).
  - *Responsibility:* Pairs items from multiple iterables, stopping when the shortest iterable is exhausted.
  - *Depends on:* One or more iterables passed as arguments.
  - *Connects to:* Consumed by loops (`for` loops) or sequence constructors (`list()`, `tuple()`).
  - *Shape:* A utility function operating on sequences, often used in data transformation pipelines.
- `namedtuple`
  - *What it is:* A factory function for creating tuple subclasses with named fields.
  - *Implementation:* `collections.namedtuple(typename, field_names)`. Returns a new tuple subclass.
  - *Its use:* Used to create lightweight, immutable data objects where fields can be accessed by name rather than position, improving readability.
  - *Type:* Factory function from the `collections` module.
  - *Responsibility:* Generates a new class that behaves like a tuple but adds attribute access for its fields.
  - *Depends on:* A type name string and a sequence of field name strings.
  - *Connects to:* Code that needs a simple record type without the overhead of a full custom class.
  - *Shape:* A structural data type, sitting between basic tuples and full custom classes.

---

## Concept Unit: What a tuple is — immutable sequence

### The Problem
We have learned how to use lists to store sequences of data. However, lists are mutable: any part of the program can append, sort, or overwrite elements. What if we want to define a point in 2D space `(x, y)` or an RGB color `(r, g, b)`? These are fixed records. If we use a list, someone might accidentally change the `x` coordinate later. We need a way to group data together with a guarantee—a contract—that it will not change once created.

> What happens if you try to build a system where constants are stored in lists, but multiple functions share that list? How would you ensure no function breaks the others by modifying it?

### Introduce the concept in isolation
A **tuple** is exactly this: an immutable sequence. We create it with parentheses instead of square brackets.

```python
>>> t = (1, 2, 3)
>>> t[0]
1
>>> t[-1]
3
>>> t[0:2]
(1, 2)
>>> len(t)
3
>>> t[0] = 99
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: 'tuple' object does not support item assignment
>>> type(t)
<class 'tuple'>
```

This output proves that tuples support the same indexing, slicing, and length operations as lists, but crucially, they reject any attempt to modify an element, raising a `TypeError`. The data is locked in.

### Discard the throwaway example
This `t` tuple example is deleted and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because we are exploring core language syntax in the REPL.
- Files affected: REPL / throwaway script.
- Change type: add.
- Location: REPL.
- Dependencies: None.

### The New Code
```python
point = (10, 20)
print(point[0])
```

### The Updated Project
```python
# ← new
point = (10, 20)
print(point[0])
```
This structure creates a tuple representing a fixed point and accesses its first element.

### Mechanical walkthrough
1. `point` — A variable name.
2. `=` — The assignment operator.
3. `(10, 20)` — A **tuple literal**, creating a new tuple object containing two integers.
4. `print` — The built-in output function.
5. `point[0]` — Tuple indexing. Just like lists, tuples are zero-indexed. This retrieves the first element, `10`, without modifying the tuple.

---

## Concept Unit: Creating tuples — the tricky one-element case

### The Problem
If parentheses create tuples, how do we create a tuple with exactly one element? In mathematics, parentheses are used for grouping operations, like `(4 + 5) * 2`. If we write `(42)`, does Python see a tuple or just the number 42 inside grouping parentheses?

> Before reading on, if you type `type((42))` in Python, what do you predict it will say?

### Introduce the concept in isolation
The comma makes the tuple, not the parentheses.

```python
>>> empty = ()
>>> empty
()
>>> single = (42,)   # NOTE the trailing comma!
>>> single
(42,)
>>> not_a_tuple = (42)  # just parentheses, not a tuple
>>> not_a_tuple
42
>>> type(not_a_tuple)
<class 'int'>
>>> type(single)
<class 'tuple'>
>>> no_parens = 1, 2, 3  # parens are optional!
>>> no_parens
(1, 2, 3)
>>> type(no_parens)
<class 'tuple'>
```

This proves that `(42)` is evaluated as an integer, while `(42,)` is evaluated as a tuple. It also proves that multiple items separated by commas, even without parentheses, evaluate as a tuple (tuple packing).

### Discard the throwaway example
These test variables are deleted and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because we are demonstrating syntax rules.
- Files affected: REPL / throwaway script.
- Change type: add.
- Location: REPL.
- Dependencies: None.

### The New Code
```python
record = ("Alice",)
```

### The Updated Project
```python
# ← new
record = ("Alice",)
```
This structure creates a single-element tuple safely.

### Mechanical walkthrough
1. `record` — Variable assignment.
2. `("Alice",)` — A tuple containing one string. The trailing comma `,` tells Python that this is a tuple, not just a string inside grouping parentheses. Without the comma, `record` would just be the string `"Alice"`.

---

## Concept Unit: Tuple unpacking

### The Problem
If you have a tuple representing a coordinate, `point = (3, 4)`, and you want to use the X and Y values separately, you could write `x = point[0]` and `y = point[1]`. But this is repetitive and noisy. Is there a way to extract all the elements into variables at once?

> Given `point = (3, 4)`, how would you design a syntax to assign both `x` and `y` in a single line if you were creating the language?

### Introduce the concept in isolation
**Tuple unpacking** allows us to assign elements of a sequence to multiple variables simultaneously.

```python
>>> point = (3, 4)
>>> x, y = point
>>> x
3
>>> y
4
>>> a, b, c = (10, 20, 30)
>>> a
10
>>> # Swap with tuple unpacking:
>>> a, b = b, a
>>> a
20
>>> b
10
>>> # Unpacking with *:
>>> first, *rest = (1, 2, 3, 4, 5)
>>> first
1
>>> rest
[2, 3, 4, 5]
>>> *front, last = (1, 2, 3, 4, 5)
>>> last
5
```

This output proves that Python unpacks the elements on the right into the variables on the left based on position. The swap `a, b = b, a` works because the right side `b, a` creates a new tuple first, and then it is unpacked into `a, b`. The `*rest` syntax captures any remaining elements as a list.

### Discard the throwaway example
These unpacking examples are deleted and will not appear in the project again.

### Project Change
No reference counterpart — exploring unpacking mechanics.
- Files affected: REPL / throwaway script.
- Change type: add.
- Location: REPL.
- Dependencies: None.

### The New Code
```python
config = ("localhost", 8080)
host, port = config
```

### The Updated Project
```python
# ← new
config = ("localhost", 8080)
host, port = config
```
This extracts configuration values from a tuple directly into named variables.

### Mechanical walkthrough
1. `config = ("localhost", 8080)` — Creates a two-element tuple.
2. `host, port` — Two variables listed on the left side of the assignment.
3. `=` — Assignment operator triggering unpacking.
4. `config` — The tuple being unpacked. Python assigns `config[0]` to `host` and `config[1]` to `port`.

---

## Concept Unit: Functions returning multiple values as tuples

### The Problem
In many languages, a function can only return one single value. If you need to return both a minimum and a maximum from a calculation, you have to create a custom class or pass in lists to be modified. How does Python handle functions that need to return multiple pieces of data?

> If a function has `return a, b`, what data type is actually being returned to the caller?

### Introduce the concept in isolation
When a function returns multiple values separated by commas, it is implicitly creating and returning a **tuple**.

```python
>>> def min_max(lst):
...     return min(lst), max(lst)
... 
>>> lo, hi = min_max([3, 1, 4, 1, 5, 9])
>>> print(lo, hi)
1 9
>>> def divmod_manual(a, b):
...     return a // b, a % b
... 
>>> q, r = divmod_manual(17, 5)
>>> print(q, r)
3 2
```

This proves that `return a, b` is simply returning a tuple `(a, b)`, and the caller can immediately use tuple unpacking (`q, r = ...`) to capture those returned values.

### Discard the throwaway example
These function examples are deleted and will not appear in the project again.

### Project Change
No reference counterpart.
- Files affected: REPL / throwaway script.
- Change type: add.
- Location: REPL.
- Dependencies: None.

### The New Code
```python
def get_user_info():
    return "Alice", 25

name, age = get_user_info()
```

### The Updated Project
```python
# ← new
def get_user_info():
    return "Alice", 25

name, age = get_user_info()
```
This defines a function that returns two values and unpacks them immediately.

### Mechanical walkthrough
1. `def get_user_info():` — Function definition.
2. `return "Alice", 25` — The `return` keyword. Because the values are separated by a comma, Python packs them into a tuple `("Alice", 25)` and returns that tuple.
3. `name, age = get_user_info()` — The function call returns the tuple, which is immediately unpacked into `name` and `age`.

---

## Concept Unit: Tuples as dictionary keys (lists cannot be)

### The Problem
We haven't fully explored dictionaries yet (that's the next lesson), but know this: dictionaries map keys to values. Dictionary keys must be "hashable" — meaning they have a fixed, unchanging identity. Can we use a coordinate like `[1, 2]` as a key to look up what object is at that location on a grid?

> If a list's contents can change at any time, how could a dictionary reliably keep track of it if used as a key?

### Introduce the concept in isolation
Lists cannot be used as dictionary keys because they are mutable. Tuples are immutable and hashable, making them perfect for this.

```python
>>> d = {}
>>> d[(0, 0)] = 'origin'
>>> d[(1, 0)] = 'right'
>>> d[(0, 1)] = 'up'
>>> d[(0, 0)]
'origin'
>>> d = {(1, 2): 'point A', (3, 4): 'point B'}
>>> # Lists CANNOT be keys:
>>> d[[1, 2]] = 'fail'
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: unhashable type: 'list'
```

This proves that trying to use a `list` as a key raises a `TypeError: unhashable type`, while a `tuple` works perfectly.

### Discard the throwaway example
This grid dictionary example is deleted.

### Project Change
No reference counterpart.
- Files affected: REPL / throwaway script.
- Change type: add.
- Location: REPL.
- Dependencies: None.

### The New Code
```python
grid = {}
grid[(10, 10)] = "Player"
```

### The Updated Project
```python
# ← new
grid = {}
grid[(10, 10)] = "Player"
```
This uses a tuple coordinate to store a value in a dictionary.

### Mechanical walkthrough
1. `grid = {}` — Creates an empty dictionary.
2. `grid[...]` — Dictionary assignment.
3. `(10, 10)` — A tuple used as the key. Because it is immutable, its hash value will never change, ensuring the dictionary can safely store and retrieve it.
4. `="Player"` — The value stored at that key.

---

## Concept Unit: `zip()` — pairing sequences together

### The Problem
Suppose you have a list of names and a separate list of scores. You want to iterate over both at the same time to print "Name: Score". You could use a `for` loop with an index variable `i`, but managing indexes manually is error-prone and un-Pythonic.

> How would you combine `names = ["Alice", "Bob"]` and `scores = [10, 20]` so you can easily loop over both?

### Introduce the concept in isolation
The `zip()` function pairs up elements from multiple sequences, producing tuples.

```python
>>> names = ['Alice', 'Bob', 'Carol']
>>> scores = [95, 87, 92]
>>> list(zip(names, scores))
[('Alice', 95), ('Bob', 87), ('Carol', 92)]

>>> for name, score in zip(names, scores):
...     print(f'{name}: {score}')
... 
Alice: 95
Bob: 87
Carol: 92

>>> # zip stops at the shortest:
>>> list(zip([1, 2, 3], ['a', 'b']))
[(1, 'a'), (2, 'b')]

>>> # Unzipping with zip(*):
>>> pairs = [(1, 'a'), (2, 'b'), (3, 'c')]
>>> numbers, letters = zip(*pairs)
>>> numbers
(1, 2, 3)
>>> letters
('a', 'b', 'c')
```

This proves that `zip` takes parallel elements and combines them into tuples. We can unpack those tuples directly in the `for` loop definition (`for name, score in ...`). `zip` is lazy; `list()` forces it to evaluate immediately. The `zip(*pairs)` trick unpacks the list of tuples back into separate iterables.

### Discard the throwaway example
These zip loops are deleted.

### Project Change
No reference counterpart.
- Files affected: REPL / throwaway script.
- Change type: add.
- Location: REPL.
- Dependencies: None.

### The New Code
```python
keys = ["a", "b"]
vals = [1, 2]
combined = list(zip(keys, vals))
```

### The Updated Project
```python
# ← new
keys = ["a", "b"]
vals = [1, 2]
combined = list(zip(keys, vals))
```
This pairs two lists into a single list of tuples.

### Mechanical walkthrough
1. `zip(keys, vals)` — The `zip()` built-in function pairs elements from `keys` and `vals`.
2. `list(...)` — Converts the lazy zip iterator into a concrete list so we can see the results immediately.
3. `combined` — The resulting list of tuples: `[('a', 1), ('b', 2)]`.

---

## Concept Unit: Named tuples — a preview of Lesson 27

### The Problem
Accessing tuple elements by index, like `point[0]` and `point[1]`, works, but it isn't very readable. If we have a tuple representing a user `(id, name, email)`, reading `user[2]` doesn't clearly explain that it's the email. How can we get the immutability of a tuple but access fields by name like `user.email`?

> Is there a way to give names to the slots in a tuple without writing a full class from scratch?

### Introduce the concept in isolation
Python provides `namedtuple` in the `collections` module. It creates a tuple subclass with named fields.

```python
>>> from collections import namedtuple
>>> 
>>> Point = namedtuple('Point', ['x', 'y'])
>>> p = Point(3, 4)
>>> print(p.x)
3
>>> print(p.y)
4
>>> print(p[0])
3
>>> print(p)
Point(x=3, y=4)
```

This proves that `namedtuple` generates a class that behaves exactly like a tuple (you can still use `p[0]`), but also allows attribute access (`p.x`). It remains completely immutable.

### Discard the throwaway example
This namedtuple example is deleted.

### Project Change
No reference counterpart.
- Files affected: REPL / throwaway script.
- Change type: add.
- Location: REPL.
- Dependencies: None.

### The New Code
```python
from collections import namedtuple
Color = namedtuple('Color', ['r', 'g', 'b'])
red = Color(255, 0, 0)
```

### The Updated Project
```python
# ← new
from collections import namedtuple
Color = namedtuple('Color', ['r', 'g', 'b'])
red = Color(255, 0, 0)
```
This defines a named tuple for colors and instantiates one.

### Mechanical walkthrough
1. `from collections import namedtuple` — Imports the `namedtuple` factory function from the standard library.
2. `namedtuple('Color', ['r', 'g', 'b'])` — Calls the factory. It creates and returns a new class type. The first argument is the name of the new type, and the second is a list of field names.
3. `Color = ...` — Assigns the generated class to the variable `Color`.
4. `Color(255, 0, 0)` — Instantiates the new named tuple, passing values for `r`, `g`, and `b`.
5. `red` — The resulting immutable object, whose fields can be accessed as `red.r`.

---

## Summary
Tuples are the right tool for fixed records, multiple return values, and dictionary keys. Their immutability is a feature, providing a contract that data will not change unexpectedly. Tuple unpacking allows for clean and readable extraction of values, and tools like `zip()` and `namedtuple` build upon tuples to organize related data easily.

Lesson 9 will cover dictionaries — the key-value store, where you will see tuples used as keys in practice.

### Exercises
1. Write a function `statistics(lst)` that returns a named tuple with `.mean`, `.minimum`, and `.maximum` calculated from a list of numbers.
2. Write a function that takes a list of `(name, score)` tuples and returns the name of the highest scorer.
3. Use `zip` to implement a dot product of two vectors (e.g., given `[1, 2]` and `[3, 4]`, compute `(1*3) + (2*4)`).
