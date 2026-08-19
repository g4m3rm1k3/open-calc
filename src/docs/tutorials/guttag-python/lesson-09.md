# Lesson 9: Dictionaries — Key-Value Stores

The reader will master Python dictionaries: creation, key lookup, `.get()`, `.keys()`, `.values()`, `.items()`, mutation, iteration patterns, and using dicts as frequency counters and dispatch tables. The transferable problems: (1) a dict maps unique keys to values — lookup by key is O(1), not O(n) like a list search; (2) `.get(key, default)` is the safe way to look up a key that might not exist; (3) dicts as counters and dicts as dispatch tables are two of the most powerful Python patterns.

**What you need to know first:**
Lessons 0–8 (REPL, types, variables, conditionals, iteration, functions, strings, lists, tuples).

**Terms used in this lesson:**
- **dict** — short for dictionary, a data structure that maps unique keys to values. Exists to provide fast, direct O(1) lookups by a name or identifier instead of relying on sequential indexing.
- **KeyError** — an error raised when trying to look up a key that does not exist in a dictionary. Exists to fail fast and prevent silent bugs from undefined access.
- **hashable** — a property of an object meaning its value never changes during its lifetime and it has a hash value. Keys in dictionaries must be hashable so their internal location remains constant.
- **O(1)** — constant time complexity. It means an operation takes the same amount of time regardless of how much data is in the structure.
- **O(n)** — linear time complexity. It means the time taken scales linearly with the size of the data.
- **lambda** — a keyword for creating anonymous inline functions. Exists to pass simple functionality without needing a formal `def` block.
- **def** — a keyword that defines a named function block. Exists to create reusable pieces of executable code.
- **for** — a keyword that starts an iteration loop. Exists to systematically iterate through collections.
- **in** — a keyword that tests membership within a collection. Exists to provide an O(1) existence check for keys in dictionaries.

**Objects and methods used:**

- **`len()`**
  - *What it is:* A built-in function that returns the number of items in a container.
  - *Implementation:* `def len(__obj: Sized) -> int`
  - *Its use:* Used to determine how many key-value pairs are stored in the dictionary.
  - *Type:* Built-in function.
  - *Responsibility:* Accurately count and return the number of elements in a given collection.
  - *Depends on:* An object that implements the `__len__` magic method.
  - *Connects to:* Called by user code, calls the object's `__len__`.
  - *Shape:* Python global namespace.

- **`type()`**
  - *What it is:* A built-in function that returns the class type of an object.
  - *Implementation:* `class type(object)`
  - *Its use:* Used to prove that a literal `{}` or `dict()` creates a `<class 'dict'>`.
  - *Type:* Built-in function/class.
  - *Responsibility:* Identify and return the exact runtime type of the provided instance.
  - *Depends on:* Any Python object.
  - *Connects to:* Called by user code, interacts with the CPython object header.
  - *Shape:* Python global namespace.

- **`dict.get()`**
  - *What it is:* A method to retrieve a value for a key with an optional default.
  - *Implementation:* `def get(self, key, default=None)`
  - *Its use:* Used to safely access dictionary values without risking a `KeyError`.
  - *Type:* Instance method on `dict`.
  - *Responsibility:* Return the value for `key` if it exists, otherwise return `default`.
  - *Depends on:* The dictionary instance, a key, and optionally a fallback value.
  - *Connects to:* Called by user code.
  - *Shape:* Public API of the `dict` class.

- **`dict.pop()`**
  - *What it is:* A method to remove a specified key and return its value.
  - *Implementation:* `def pop(self, key, default=...)`
  - *Its use:* Used to extract and simultaneously remove a key-value pair.
  - *Type:* Instance method on `dict`.
  - *Responsibility:* Remove the item with the specified key and return its value, raising an error or returning a default if missing.
  - *Depends on:* The dictionary instance and a key.
  - *Connects to:* Mutates the dictionary internally.
  - *Shape:* Public API of the `dict` class.

- **`dict.update()`**
  - *What it is:* A method to merge another dictionary (or iterable of pairs) into this one.
  - *Implementation:* `def update(self, *args, **kwargs)`
  - *Its use:* Used to add or overwrite multiple key-value pairs at once.
  - *Type:* Instance method on `dict`.
  - *Responsibility:* Update the dictionary in-place with elements from another dictionary object or from an iterable of key/value pairs.
  - *Depends on:* The dictionary instance and a source of new keys/values.
  - *Connects to:* Mutates the dictionary internally.
  - *Shape:* Public API of the `dict` class.

- **`dict.keys()`**
  - *What it is:* A method that returns a dynamic view of the dictionary's keys.
  - *Implementation:* `def keys(self) -> dict_keys`
  - *Its use:* Used to explicitly iterate or check membership only against keys.
  - *Type:* Instance method on `dict`.
  - *Responsibility:* Provide a set-like view object representing the keys.
  - *Depends on:* The dictionary instance.
  - *Connects to:* Provides access to the dictionary's internal hash table keys.
  - *Shape:* Public API of the `dict` class.

- **`dict.values()`**
  - *What it is:* A method that returns a dynamic view of the dictionary's values.
  - *Implementation:* `def values(self) -> dict_values`
  - *Its use:* Used to iterate over the values in a dictionary.
  - *Type:* Instance method on `dict`.
  - *Responsibility:* Provide a view object representing all values in the dictionary.
  - *Depends on:* The dictionary instance.
  - *Connects to:* Provides access to the dictionary's internal hash table values.
  - *Shape:* Public API of the `dict` class.

- **`dict.items()`**
  - *What it is:* A method that returns a dynamic view of the dictionary's key-value tuple pairs.
  - *Implementation:* `def items(self) -> dict_items`
  - *Its use:* Used to iterate over both keys and values simultaneously.
  - *Type:* Instance method on `dict`.
  - *Responsibility:* Provide a set-like view of `(key, value)` tuples.
  - *Depends on:* The dictionary instance.
  - *Connects to:* Provides paired access to the dictionary's internal hash table.
  - *Shape:* Public API of the `dict` class.

- **`str.split()`**
  - *What it is:* A method that splits a string into a list of words.
  - *Implementation:* `def split(self, sep=None, maxsplit=-1) -> list[str]`
  - *Its use:* Used to break a sentence into words for frequency counting.
  - *Type:* Instance method on `str`.
  - *Responsibility:* Divide a string into substrings based on a delimiter.
  - *Depends on:* A string instance.
  - *Connects to:* Creates and returns a new list of strings.
  - *Shape:* Public API of the `str` class.

- **`str.lower()`**
  - *What it is:* A method that returns a lowercase copy of a string.
  - *Implementation:* `def lower(self) -> str`
  - *Its use:* Used to normalize words so 'The' and 'the' are counted as the same word.
  - *Type:* Instance method on `str`.
  - *Responsibility:* Convert all cased characters in the string to lowercase.
  - *Depends on:* A string instance.
  - *Connects to:* Returns a newly allocated string.
  - *Shape:* Public API of the `str` class.

- **`list.append()`**
  - *What it is:* A method to add a single item to the end of a list.
  - *Implementation:* `def append(self, object)`
  - *Its use:* Used to accumulate values into the lists managed by a `defaultdict`.
  - *Type:* Instance method on `list`.
  - *Responsibility:* Append an element to the end of the list in-place.
  - *Depends on:* A list instance and an element to add.
  - *Connects to:* Mutates the list internally.
  - *Shape:* Public API of the `list` class.

- **`collections.Counter`**
  - *What it is:* A specialized dictionary subclass designed specifically for counting hashable objects.
  - *Implementation:* `class Counter(dict)`
  - *Its use:* Used as the standard library, optimized version of the frequency counter pattern.
  - *Type:* Class in `collections` module.
  - *Responsibility:* Keep track of how many times equivalent values are added.
  - *Depends on:* An iterable or mapping to initialize counts.
  - *Connects to:* Inherits from `dict` and extends it with counting-specific methods.
  - *Shape:* Standard library utility class.

- **`collections.defaultdict`**
  - *What it is:* A dictionary subclass that calls a factory function to supply missing values.
  - *Implementation:* `class defaultdict(dict)`
  - *Its use:* Used to automatically initialize empty lists when grouping items.
  - *Type:* Class in `collections` module.
  - *Responsibility:* Provide a default value for missing keys automatically without raising KeyError.
  - *Depends on:* A default factory callable (e.g., `list`, `int`).
  - *Connects to:* Overrides `__missing__` method of standard dictionary.
  - *Shape:* Standard library utility class.

- **`ValueError`**
  - *What it is:* An exception raised when an operation or function receives an argument that has the right type but an inappropriate value.
  - *Implementation:* `class ValueError(Exception)`
  - *Its use:* Raised in the dispatch table example when an unknown operator string is passed.
  - *Type:* Built-in Exception class.
  - *Responsibility:* Signal that a value is semantically incorrect for the requested operation.
  - *Depends on:* The error message string.
  - *Connects to:* The Python exception handling system.
  - *Shape:* Python global namespace.

## Concept Unit: Creating dicts and basic access

### The Problem
How do we store data that relates a unique identifier to a specific value? If we want to map a person's name to their age, a list of ages isn't enough, because we don't know which age belongs to which person. We need a way to look up a value by its name, instantly.

### Introduce the concept in isolation
We can use a Python dictionary to map keys to values.

```python
>>> temp_dict = {'x': 100}
>>> temp_dict['x']
100
```
This proves that providing a key inside square brackets retrieves the associated value in O(1) time. This is called **dictionary access**.

### Discard the throwaway example
The `temp_dict` example is discarded and will not be used again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating core dictionary mechanics.
- **Files affected:** `main.py` (created)
- **Change type:** add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code
```python
d = {'name': 'Alice', 'age': 30, 'city': 'Boston'}
print(d['name'])
print(d['age'])
print(len(d))
print(type(d))

d2 = dict(name='Bob', age=25)
print(d2)
```

### The Updated Project
```python
# main.py
d = {'name': 'Alice', 'age': 30, 'city': 'Boston'} # ← new
print(d['name']) # ← new
print(d['age']) # ← new
print(len(d)) # ← new
print(type(d)) # ← new

d2 = dict(name='Bob', age=25) # ← new
print(d2) # ← new
```
This script creates a dictionary mapping person details, retrieves two specific values, inspects the dictionary's size and type, and demonstrates an alternative creation syntax.

### Mechanical walkthrough
- `d = {'name': 'Alice', 'age': 30, 'city': 'Boston'}`: The `{}` syntax creates a dictionary literal. `name` is the key, mapping to the string value `Alice`. Keys must be hashable.
- `print(d['name'])`: Looks up the key `'name'` in `d`. If the key doesn't exist, it raises a `KeyError`.
- `print(d['age'])`: Looks up the key `'age'` in `d`, returning `30`.
- `print(len(d))`: Calls the built-in `len()` function, returning `3` since there are three key-value pairs.
- `print(type(d))`: Calls the built-in `type()` function, outputting `<class 'dict'>`.
- `d2 = dict(name='Bob', age=25)`: Calls the `dict()` constructor using keyword arguments. This is an alternative way to build a dictionary when keys are valid Python identifiers.
- `print(d2)`: Prints the dictionary `{name: 'Bob', age: 25}`.

## Concept Unit: .get() — safe lookup with a default

### The Problem
When you use `d['key']` and the key doesn't exist, Python crashes with a `KeyError`. How can we attempt to look up a key and gracefully handle the case where it's missing, without writing an `if/else` block every time?

### Introduce the concept in isolation
We can use the `.get()` method.

```python
>>> test_dict = {'a': 1}
>>> test_dict.get('b', 0)
0
```
This proves that `.get()` returns the provided default value instead of crashing. This is called **safe lookup**.

### Discard the throwaway example
The `test_dict` example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of `main.py`.
- **Dependencies:** None.

### The New Code
```python
d3 = {'a': 1, 'b': 2}
print(d3.get('a'))
print(d3.get('z'))
print(d3.get('z', 0))
print(d3.get('a', 99))
```

### The Updated Project
```python
# main.py
d = {'name': 'Alice', 'age': 30, 'city': 'Boston'}
print(d['name'])
print(d['age'])
print(len(d))
print(type(d))

d2 = dict(name='Bob', age=25)
print(d2)

d3 = {'a': 1, 'b': 2} # ← new
print(d3.get('a')) # ← new
print(d3.get('z')) # ← new
print(d3.get('z', 0)) # ← new
print(d3.get('a', 99)) # ← new
```
This adds safe lookup demonstrations to our script, showing how missing keys return `None` or a specified default.

### Mechanical walkthrough
- `d3 = {'a': 1, 'b': 2}`: Creates a new dictionary literal.
- `print(d3.get('a'))`: Calls `.get('a')`. Since `'a'` exists, it prints `1`.
- `print(d3.get('z'))`: Calls `.get('z')`. Since `'z'` is absent, it prints `None`.
- `print(d3.get('z', 0))`: Calls `.get('z', 0)`. Since `'z'` is absent, it returns the provided default `0` and prints it.
- `print(d3.get('a', 99))`: Calls `.get('a', 99)`. Since `'a'` exists, it ignores the default `99` and prints the actual value `1`.

## Concept Unit: Adding, updating, and deleting entries

### The Problem
Once a dictionary is created, how do we modify it? Real-world data changes: new users register, existing users update their profiles, and old records get removed.

### Introduce the concept in isolation
Dictionaries are mutable, meaning we can change them in place.

```python
>>> mut_dict = {'x': 1}
>>> mut_dict['x'] = 2
>>> mut_dict
{'x': 2}
```
This proves that assigning to an existing key overwrites its value. This is called **dictionary mutation**.

### Discard the throwaway example
The `mut_dict` example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of `main.py`.
- **Dependencies:** None.

### The New Code
```python
d4 = {'a': 1, 'b': 2}
d4['c'] = 3
d4['a'] = 99
print(d4)
del d4['b']
print(d4)
print(d4.pop('c'))
print(d4)
d4.update({'x': 10, 'y': 20})
print(d4)
```

### The Updated Project
```python
# main.py
# ... previous code unchanged ...

d4 = {'a': 1, 'b': 2} # ← new
d4['c'] = 3 # ← new
d4['a'] = 99 # ← new
print(d4) # ← new
del d4['b'] # ← new
print(d4) # ← new
print(d4.pop('c')) # ← new
print(d4) # ← new
d4.update({'x': 10, 'y': 20}) # ← new
print(d4) # ← new
```
This adds dictionary mutation operations to the script, demonstrating adding, updating, and two forms of deletion, plus bulk merging.

### Mechanical walkthrough
- `d4 = {'a': 1, 'b': 2}`: Creates a new dictionary instance.
- `d4['c'] = 3`: Adds a new key `'c'` with value `3`.
- `d4['a'] = 99`: Updates the existing key `'a'` to a new value `99`.
- `print(d4)`: Prints the dictionary `{'a': 99, 'b': 2, 'c': 3}`.
- `del d4['b']`: Uses the `del` statement to remove the key `'b'` completely.
- `print(d4)`: Prints the dictionary `{'a': 99, 'c': 3}`.
- `print(d4.pop('c'))`: Calls `.pop('c')`, which removes the key `'c'` and simultaneously returns its value (`3`), which is printed.
- `print(d4)`: Prints the dictionary `{'a': 99}`.
- `d4.update({'x': 10, 'y': 20})`: Calls `.update()`, which merges the provided dictionary into `d4`, adding keys `'x'` and `'y'`.
- `print(d4)`: Prints the dictionary `{'a': 99, 'x': 10, 'y': 20}`.

## Concept Unit: Iterating over dicts

### The Problem
How do we loop over a dictionary if we want to print out all of its contents, or perform an operation on every value?

### Introduce the concept in isolation
A dictionary can be iterated over using a `for` loop.

```python
>>> loop_dict = {'a': 1}
>>> for k in loop_dict:
...     print(k)
a
```
This proves that iterating directly on a dictionary yields its keys. This is called **dictionary iteration**.

### Discard the throwaway example
The `loop_dict` example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of `main.py`.
- **Dependencies:** None.

### The New Code
```python
d5 = {'one': 1, 'two': 2, 'three': 3}

for key in d5:
    print(key)

for val in d5.values():
    print(val)

for key, val in d5.items():
    print(f'{key} -> {val}')
```

### The Updated Project
```python
# main.py
# ... previous code unchanged ...

d5 = {'one': 1, 'two': 2, 'three': 3} # ← new

for key in d5: # ← new
    print(key) # ← new

for val in d5.values(): # ← new
    print(val) # ← new

for key, val in d5.items(): # ← new
    print(f'{key} -> {val}') # ← new
```
This shows the three standard ways to loop through a dictionary: by keys, by values, and by both.

### Mechanical walkthrough
- `d5 = {'one': 1, 'two': 2, 'three': 3}`: Creates a dictionary.
- `for key in d5:`: Iterates over the dictionary directly using the `for` keyword. By default, this loops through the keys.
- `print(key)`: Prints each key.
- `d5.values()`: Calls `.values()`, returning a view of the dictionary's values.
- `for val in d5.values():`: Iterates through just the values (`1`, `2`, `3`).
- `print(val)`: Prints each value.
- `d5.items()`: Calls `.items()`, returning a view of `(key, value)` tuples.
- `for key, val in d5.items():`: Iterates through the tuple pairs, unpacking them into `key` and `val` on each iteration.
- `print(f'{key} -> {val}')`: Prints the formatted string of the pair. Note that these are dynamic views; they reflect changes in real-time, but for stable snapshots you would wrap them in `list()`.

## Concept Unit: Membership testing — in checks KEYS

### The Problem
If we have a dictionary, how do we quickly check if it contains a specific piece of data without looping through the entire thing?

### Introduce the concept in isolation
The `in` keyword checks for presence.

```python
>>> mem_dict = {'a': 1}
>>> 'a' in mem_dict
True
```
This proves that `in` works on dictionaries. This is called **membership testing**.

### Discard the throwaway example
The `mem_dict` example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of `main.py`.
- **Dependencies:** None.

### The New Code
```python
d6 = {'a': 1, 'b': 2}
print('a' in d6)
print(1 in d6)
print(1 in d6.values())
print('a' in d6.keys())
```

### The Updated Project
```python
# main.py
# ... previous code unchanged ...

d6 = {'a': 1, 'b': 2} # ← new
print('a' in d6) # ← new
print(1 in d6) # ← new
print(1 in d6.values()) # ← new
print('a' in d6.keys()) # ← new
```
This demonstrates how membership testing works against keys versus values.

### Mechanical walkthrough
- `d6 = {'a': 1, 'b': 2}`: Creates a dictionary.
- `print('a' in d6)`: Uses the `in` operator. For a dictionary, this specifically checks the keys, returning `True`. This is an O(1) operation.
- `print(1 in d6)`: Returns `False` because `1` is a value, not a key.
- `print(1 in d6.values())`: Explicitly checks the `.values()` view, returning `True`.
- `print('a' in d6.keys())`: Explicitly checks the `.keys()` view, returning `True`.

## Concept Unit: Dict as a frequency counter

### The Problem
Given a sequence of items, like words in a text, how do we count how many times each item appears?

### Introduce the concept in isolation
We can use a dictionary where the keys are the items and the values are the counts.

```python
>>> text = 'apple apple banana'
>>> count = {}
>>> for w in text.split():
...     count[w] = count.get(w, 0) + 1
>>> count
{'apple': 2, 'banana': 1}
```
This proves that `.get(key, 0) + 1` is an effective pattern for incrementing counts. This is called the **frequency counter pattern**.

### Discard the throwaway example
The `count` example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of `main.py`.
- **Dependencies:** None.

### The New Code
```python
def count_words(text):
    counts = {}
    for word in text.split():
        word = word.lower()
        counts[word] = counts.get(word, 0) + 1
    return counts

print(count_words('the cat sat on the mat the cat'))

from collections import Counter
print(Counter('the cat sat on the mat the cat'.split()))
```

### The Updated Project
```python
# main.py
# ... previous code unchanged ...

def count_words(text): # ← new
    counts = {} # ← new
    for word in text.split(): # ← new
        word = word.lower() # ← new
        counts[word] = counts.get(word, 0) + 1 # ← new
    return counts # ← new

print(count_words('the cat sat on the mat the cat')) # ← new

from collections import Counter # ← new
print(Counter('the cat sat on the mat the cat'.split())) # ← new
```
This implements a text frequency counter from scratch and then shows the standard library equivalent.

### Mechanical walkthrough
- `def count_words(text):`: Defines a new function named `count_words` receiving `text`.
- `counts = {}`: Initializes an empty dictionary to hold the tallies.
- `for word in text.split():`: Calls `.split()` on the string to break it into a list of words, iterating over each `word`.
- `word = word.lower()`: Normalizes the word by making it lowercase.
- `counts.get(word, 0)`: Retrieves the current count. If the word hasn't been seen yet, it safely defaults to `0`.
- `+ 1`: Increments the count.
- `counts[word] = ...`: Stores the updated count back under the word's key. This avoids a clunky `if word in counts:` check.
- `return counts`: Returns the assembled frequency map.
- `print(count_words(...))`: Calls the function and prints `{'the': 3, 'cat': 2, 'sat': 1, 'on': 1, 'mat': 1}`.
- `from collections import Counter`: Imports the `Counter` class from the `collections` module.
- `Counter('...'.split())`: Passes the split word list into `Counter`, which internally applies this exact frequency counting logic and returns a specialized dictionary containing the results.

## Concept Unit: Dict as a dispatch table

### The Problem
If we have a program that needs to run different functions based on a string command (like a calculator parsing `+`, `-`, `*`), a long chain of `if / elif` statements becomes hard to read and modify. Is there a better way?

### Introduce the concept in isolation
We can map strings directly to functions inside a dictionary.

```python
>>> fns = {'say_hi': lambda: print('hi')}
>>> fns['say_hi']()
hi
```
This proves that functions are objects and can be stored in dictionaries and called later. This is called a **dispatch table**.

### Discard the throwaway example
The `fns` example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of `main.py`.
- **Dependencies:** None.

### The New Code
```python
def operate(op, a, b):
    operations = {
        '+': lambda a, b: a + b,
        '-': lambda a, b: a - b,
        '*': lambda a, b: a * b,
        '/': lambda a, b: a / b,
    }
    if op not in operations:
        raise ValueError(f'Unknown operation: {op}')
    return operations[op](a, b)

print(operate('+', 3, 4))
print(operate('*', 5, 6))
```

### The Updated Project
```python
# main.py
# ... previous code unchanged ...

def operate(op, a, b): # ← new
    operations = { # ← new
        '+': lambda a, b: a + b, # ← new
        '-': lambda a, b: a - b, # ← new
        '*': lambda a, b: a * b, # ← new
        '/': lambda a, b: a / b, # ← new
    } # ← new
    if op not in operations: # ← new
        raise ValueError(f'Unknown operation: {op}') # ← new
    return operations[op](a, b) # ← new

print(operate('+', 3, 4)) # ← new
print(operate('*', 5, 6)) # ← new
```
This demonstrates replacing an `if/elif` chain with a dispatch table that routes the correct lambda function based on an operator string.

### Mechanical walkthrough
- `def operate(op, a, b):`: Defines the calculate function.
- `operations = { ... }`: Creates a dictionary where the keys are string operators.
- `lambda a, b: a + b`: Defines an anonymous, inline function that takes two arguments and returns their sum. These functions are stored as the values in the dictionary.
- `if op not in operations:`: Uses membership testing to check if the requested operator exists as a key.
- `raise ValueError(...)`: Halts execution and raises an error if the operation is invalid.
- `operations[op]`: Looks up the correct lambda function using the operator string.
- `(a, b)`: Immediately calls the retrieved lambda function, passing in `a` and `b`. By looking up the behavior in the dictionary, adding a new operation means adding one key-value pair, not a new `elif` branch.
- `print(operate('+', 3, 4))`: Evaluates to `7` and prints it.
- `print(operate('*', 5, 6))`: Evaluates to `30` and prints it.

## Concept Unit: collections.defaultdict

### The Problem
When grouping items, you often want to append to a list in a dictionary. But if the key doesn't exist yet, you can't append to it without first initializing an empty list.

### Introduce the concept in isolation
`defaultdict` solves this by automatically running a factory function for missing keys.

```python
>>> from collections import defaultdict
>>> test_dd = defaultdict(list)
>>> test_dd['a'].append(1)
>>> test_dd['a']
[1]
```
This proves that accessing a missing key in a `defaultdict` automatically creates it and assigns it the default value (an empty list). This is called an **automatic default value**.

### Discard the throwaway example
The `test_dd` example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of `main.py`.
- **Dependencies:** None.

### The New Code
```python
from collections import defaultdict

words = ['apple', 'avocado', 'banana', 'blueberry', 'cherry']
by_letter = defaultdict(list)
for word in words:
    by_letter[word[0]].append(word)
print(dict(by_letter))
```

### The Updated Project
```python
# main.py
# ... previous code unchanged ...

from collections import defaultdict # ← new

words = ['apple', 'avocado', 'banana', 'blueberry', 'cherry'] # ← new
by_letter = defaultdict(list) # ← new
for word in words: # ← new
    by_letter[word[0]].append(word) # ← new
print(dict(by_letter)) # ← new
```
This groups a list of words by their starting letter using `defaultdict` to seamlessly handle list initialization.

### Mechanical walkthrough
- `from collections import defaultdict`: Imports the `defaultdict` class.
- `words = ['apple', 'avocado', 'banana', 'blueberry', 'cherry']`: A list of words to group.
- `by_letter = defaultdict(list)`: Creates a new dictionary that will call the `list` factory function (which returns `[]`) anytime a non-existent key is accessed.
- `for word in words:`: Iterates through each string.
- `word[0]`: Extracts the first character of the string to use as the grouping key.
- `by_letter[word[0]]`: Looks up the list for that letter. If it doesn't exist, `defaultdict` quietly creates an empty list and stores it under that key.
- `.append(word)`: Calls the `.append()` method on that list, appending the full word.
- `print(dict(by_letter))`: Converts the `defaultdict` back to a plain dictionary for cleaner printing and outputs `{'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}`.

## Closing
Dictionaries are the key-value store of Python. They enable frequency counting, grouping, caching, dispatch tables, and named-field records. Lesson 10 covers sets — dicts without values, optimized for membership testing and set operations.

**Exercises:**
- Write a function `invert_dict(d)` that swaps keys and values.
- Write `most_common(text)` that returns the most frequent word.
- Write a phone book using a dict that supports lookup, add, and delete.
