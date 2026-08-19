# Lesson 7: Lists — The Workhorse

What you will build
The reader will master Python lists: creation, indexing, slicing, mutation, all key methods, and the critical aliasing vs copying distinction. The transferable problems: (1) lists are MUTABLE — methods like `.append()`, `.sort()`, and `.reverse()` change the list IN PLACE and return None; this surprises beginners who expect a new list; (2) aliasing: `b = a` makes b point to the SAME list as a — modifying b modifies a; (3) `copy()` and `[:]` make a SHALLOW copy — nested lists are still shared.

What you need to know first
Lessons 0–6 (REPL, types, variables, conditionals, iteration, functions, strings).

Terms used in this lesson
- **list** — an ordered, mutable sequence of elements in Python, capable of holding heterogeneous types. It exists to group related data together so it can be manipulated as a collection.
- **mutation** — changing the state of an existing object in memory without creating a new one. It exists for performance and memory efficiency, avoiding the need to copy large structures.
- **aliasing** — when two or more variables refer to the exact same object in memory. It exists as a natural consequence of variables holding references rather than values, but can cause bugs when mutability is involved.
- **shallow copy** — creating a new collection object but populating it with references to the child objects found in the original. It solves the need to copy the outer container without expensively duplicating all nested contents.
- **index** — an integer representing a specific position within a sequence. It allows random access to elements without iterating.
- **slice** — a subset of a sequence, extracted by specifying start, stop, and step bounds. It provides a concise way to work with sub-ranges of data.

Objects and methods used

**`len()`**
- *What it is:* A built-in function to get the number of items in a container.
- *Implementation:* `def len(obj: Sized) -> int`
- *Its use:* To determine how many elements are currently in our lists.
- *Type:* Built-in function.
- *Responsibility:* Computes and returns the size or length of a supported object.
- *Depends on:* An object implementing the `__len__()` protocol.
- *Connects to:* Called by user code, calls into the object's internal C struct or `__len__`.
- *Shape:* Public standard library surface.

**`append()`**
- *What it is:* A method that adds a single element to the end of a list.
- *Implementation:* `def append(self, object: _T) -> None`
- *Its use:* Used to grow a list dynamically by adding one item at a time.
- *Type:* Instance method of `list`.
- *Responsibility:* Modifies the list in place by appending the passed object to its tail.
- *Depends on:* A mutable list instance and the object to append.
- *Connects to:* Called by user code; modifies the internal array.
- *Shape:* Public API of the `list` class.

**`extend()`**
- *What it is:* A method that appends all items from an iterable to the list.
- *Implementation:* `def extend(self, iterable: Iterable[_T]) -> None`
- *Its use:* Used to concatenate another collection onto the end of an existing list.
- *Type:* Instance method of `list`.
- *Responsibility:* Modifies the list in place by appending each element of the given iterable.
- *Depends on:* A mutable list instance and any iterable.
- *Connects to:* Reads the iterable, modifies the internal array.
- *Shape:* Public API of the `list` class.

**`insert()`**
- *What it is:* A method that inserts an item at a given index.
- *Implementation:* `def insert(self, index: int, object: _T) -> None`
- *Its use:* Used when we need to add an element somewhere other than the very end of the list.
- *Type:* Instance method of `list`.
- *Responsibility:* Shifts elements to the right and places the new object at the specified index.
- *Depends on:* A mutable list, an integer index, and the object.
- *Connects to:* Internal array shifting operations.
- *Shape:* Public API of the `list` class.

**`remove()`**
- *What it is:* A method that removes the first occurrence of a value.
- *Implementation:* `def remove(self, value: _T) -> None`
- *Its use:* Used to delete a specific item by its value rather than its position.
- *Type:* Instance method of `list`.
- *Responsibility:* Finds and removes the first matching element, raising ValueError if not found.
- *Depends on:* A mutable list and a comparable value.
- *Connects to:* Equality checks on elements.
- *Shape:* Public API of the `list` class.

**`pop()`**
- *What it is:* A method that removes and returns an item at a given index (defaulting to the last item).
- *Implementation:* `def pop(self, index: int = -1) -> _T`
- *Its use:* Used to extract an item from the list while simultaneously shrinking the list.
- *Type:* Instance method of `list`.
- *Responsibility:* Returns the item at `index` and deletes it from the list.
- *Depends on:* A mutable list and an optional integer index.
- *Connects to:* Returns a reference to the removed object to the caller.
- *Shape:* Public API of the `list` class.

**`sort()`**
- *What it is:* A method that sorts the list in place.
- *Implementation:* `def sort(self, *, key: Callable = None, reverse: bool = False) -> None`
- *Its use:* Used to organize data into ascending or descending order without creating a new list.
- *Type:* Instance method of `list`.
- *Responsibility:* Reorders the elements of the list in place using Timsort.
- *Depends on:* A mutable list whose elements support comparison.
- *Connects to:* Element comparison operations (like `<`).
- *Shape:* Public API of the `list` class.

**`reverse()`**
- *What it is:* A method that reverses the elements of the list in place.
- *Implementation:* `def reverse(self) -> None`
- *Its use:* Used to flip the ordering of elements efficiently.
- *Type:* Instance method of `list`.
- *Responsibility:* Swaps elements symmetrically across the center of the list.
- *Depends on:* A mutable list.
- *Connects to:* Internal array manipulation.
- *Shape:* Public API of the `list` class.

**`sorted()`**
- *What it is:* A built-in function that returns a new sorted list from an iterable.
- *Implementation:* `def sorted(iterable: Iterable[_T], *, key: Callable = None, reverse: bool = False) -> list[_T]`
- *Its use:* Used when we need a sorted version of our data but must preserve the original list.
- *Type:* Built-in function.
- *Responsibility:* Consumes the iterable, builds a new list, sorts it, and returns it.
- *Depends on:* An iterable with comparable elements.
- *Connects to:* Caller code, returns a new list.
- *Shape:* Public standard library surface.

**`sum()`**
- *What it is:* A built-in function that sums the items of an iterable.
- *Implementation:* `def sum(iterable: Iterable, start: _T = 0) -> _T`
- *Its use:* Used to aggregate numerical data stored in lists.
- *Type:* Built-in function.
- *Responsibility:* Accumulates the values from left to right and returns the total.
- *Depends on:* An iterable containing numbers.
- *Connects to:* Addition operators of the contained elements.
- *Shape:* Public standard library surface.

**`max()`**
- *What it is:* A built-in function that returns the largest item.
- *Implementation:* `def max(iterable: Iterable, *[, key, default]) -> _T`
- *Its use:* Used to find the peak value in a data set.
- *Type:* Built-in function.
- *Responsibility:* Scans the iterable to find the maximum element based on comparison.
- *Depends on:* An iterable of comparable elements.
- *Connects to:* Element comparison operations.
- *Shape:* Public standard library surface.

**`min()`**
- *What it is:* A built-in function that returns the smallest item.
- *Implementation:* `def min(iterable: Iterable, *[, key, default]) -> _T`
- *Its use:* Used to find the lowest value in a data set.
- *Type:* Built-in function.
- *Responsibility:* Scans the iterable to find the minimum element based on comparison.
- *Depends on:* An iterable of comparable elements.
- *Connects to:* Element comparison operations.
- *Shape:* Public standard library surface.

**`index()`**
- *What it is:* A method that returns the first index of a value.
- *Implementation:* `def index(self, value: _T, start: int = 0, stop: int = ...) -> int`
- *Its use:* Used to find where a specific piece of data resides in a list.
- *Type:* Instance method of `list`.
- *Responsibility:* Performs a linear search and returns the integer position of a match.
- *Depends on:* A list and a comparable value.
- *Connects to:* Equality checks on elements.
- *Shape:* Public API of the `list` class.

**`count()`**
- *What it is:* A method that returns the number of occurrences of a value.
- *Implementation:* `def count(self, value: _T) -> int`
- *Its use:* Used to tally how many times a specific element appears.
- *Type:* Instance method of `list`.
- *Responsibility:* Scans the whole list and tallies matches for the given value.
- *Depends on:* A list and a comparable value.
- *Connects to:* Equality checks on elements.
- *Shape:* Public API of the `list` class.

**`copy()`**
- *What it is:* A method that returns a shallow copy of the list.
- *Implementation:* `def copy(self) -> list[_T]`
- *Its use:* Used to duplicate a list so we can modify the new one without altering the original.
- *Type:* Instance method of `list`.
- *Responsibility:* Allocates a new list and copies all element references into it.
- *Depends on:* The original list instance.
- *Connects to:* Caller code, returns a new distinct list object.
- *Shape:* Public API of the `list` class.

**`list()`**
- *What it is:* The list type constructor.
- *Implementation:* `class list(Iterable[_T])`
- *Its use:* Used here to create a copy of an existing list by casting it.
- *Type:* Built-in class / constructor.
- *Responsibility:* Instantiates a new list object from any iterable passed to it.
- *Depends on:* An iterable to source elements from.
- *Connects to:* Memory allocator and the iterable's iteration protocol.
- *Shape:* Public standard library surface.

**`id()`**
- *What it is:* A built-in function that returns the unique memory identity of an object.
- *Implementation:* `def id(obj: object) -> int`
- *Its use:* Used to prove whether two variables point to the same physical object (aliasing).
- *Type:* Built-in function.
- *Responsibility:* Returns a guaranteed unique integer for an object's lifetime (usually memory address).
- *Depends on:* Any Python object.
- *Connects to:* The Python runtime's object memory layout.
- *Shape:* Public standard library surface.


## Concept Unit: Creating and accessing lists

### The Problem
We have learned to store individual values in variables, like `name = "Alice"` or `score = 42`. But what if we need to track ten scores? Or a hundred? Creating `score1`, `score2`, `score3` is impossible to maintain and cannot be looped over easily. How do we group multiple related pieces of data into a single, ordered container?

> How would you currently write a function that needs to return three different related values using only what we've learned in Lessons 0-6? Take a moment to sketch it out.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our list-based script in a new file.
- **Files affected:** `main.py` (created)
- **Change type:** add
- **Location:** At the top of the file
- **Dependencies:** None

### The New Code
```python
fruits = ['apple', 'banana', 'cherry']
mixed = [1, 'hello', 3.14, True, None]
```

### The Updated Project
```python
# main.py
fruits = ['apple', 'banana', 'cherry'] # ← new
mixed = [1, 'hello', 3.14, True, None] # ← new
```
This script now defines two variables holding lists of elements, which group these items under single names we can manipulate.

### Introduce the concept in isolation
```python
>>> colors = ['red', 'green', 'blue']
>>> colors[0]
'red'
>>> colors[-1]
'blue'
>>> len(colors)
3
>>> colors[1:3]
['green', 'blue']
>>> type(colors)
<class 'list'>
```
This demonstrates exactly how to create a list using square brackets, how to index into it (0-indexed), and how to slice it. The output proves that lists behave very much like strings do for indexing and slicing. This is called a **list**.

### Discard the throwaway example
The `colors` REPL example above is discarded and will not be used in our project code.

### Mechanical walkthrough
1. `fruits = ['apple', 'banana', 'cherry']`
   - **`fruits`**: A variable name being assigned a reference.
   - **`[` and `]`**: The literal syntax to create a list.
   - **`'apple'`, `'banana'`, `'cherry'`**: String literals, the elements of the list.
2. `mixed = [1, 'hello', 3.14, True, None]`
   - Python lists can hold heterogeneous types. We mix an `int`, `str`, `float`, `bool`, and `NoneType`.
3. **`colors[0]`**:
   - Uses zero-based indexing to access the first element, evaluating to `'red'`.
4. **`colors[-1]`**:
   - Uses negative indexing to access the last element, evaluating to `'blue'`.
5. **`len(colors)`**:
   - - *What it is:* A built-in function to get the number of items in a container.
     - *Implementation:* `def len(obj: Sized) -> int`
     - *Its use:* To determine how many elements are currently in our lists.
     - *Type:* Built-in function.
     - *Responsibility:* Computes and returns the size or length of a supported object.
     - *Depends on:* An object implementing the `__len__()` protocol.
     - *Connects to:* Called by user code, calls into the object's internal C struct.
     - *Shape:* Public standard library surface.
6. **`colors[1:3]`**:
   - Uses slicing `[start:stop]`. Includes index 1, up to but not including index 3, returning a new sub-list.


## Concept Unit: Mutating lists — changing elements in place

### The Problem
We know that strings are immutable: `s = "hello"; s[0] = "H"` results in an error. If we want to change a list we just created, do we have to build a completely new list from scratch?

> Try to guess what Python does if you type `fruits[1] = 'blueberry'`. Does it crash like a string, or does it work?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are experimenting.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** Below the existing `fruits` list.
- **Dependencies:** None

### The New Code
```python
fruits[1] = 'blueberry'
fruits[0:2] = ['mango', 'kiwi']
```

### The Updated Project
```python
fruits = ['apple', 'banana', 'cherry'] 
mixed = [1, 'hello', 3.14, True, None]
fruits[1] = 'blueberry'           # ← new
fruits[0:2] = ['mango', 'kiwi']   # ← new
```
Our script now demonstrates changing existing elements within the list without reassigning the `fruits` variable to a whole new object.

### Introduce the concept in isolation
```python
>>> data = [10, 20, 30]
>>> data[0] = 99
>>> data
[99, 20, 30]
>>> data[1:3] = [44, 55]
>>> data
[99, 44, 55]
```
This is called **mutation**. The list object itself changes; no new list is created. The output proves that elements can be updated individually or in bulk via slices.

### Discard the throwaway example
The `data` list REPL example is discarded.

### Mechanical walkthrough
1. `fruits[1] = 'blueberry'`
   - **`fruits[1]`**: Targets the second slot in the list.
   - **`=`**: The assignment operator.
   - **`'blueberry'`**: The new value. This replaces `'banana'`. Unlike strings, lists support item assignment.
2. `fruits[0:2] = ['mango', 'kiwi']`
   - **`fruits[0:2]`**: Targets the first two slots (indices 0 and 1).
   - **`['mango', 'kiwi']`**: An iterable providing the replacements. Slice assignment can replace a range of elements with a different-length sequence.


## Concept Unit: Key list methods — the mutating ones

### The Problem
We can change existing elements, but how do we dynamically add or remove elements after a list is created?

> How would you add a new item to the very end of `fruits` using only slice assignment?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** At the bottom of `main.py`
- **Dependencies:** None

### The New Code
```python
lst = [3, 1, 4, 1, 5]
lst.append(9)
lst.sort()
```

### The Updated Project
```python
fruits = ['apple', 'banana', 'cherry'] 
mixed = [1, 'hello', 3.14, True, None]
fruits[1] = 'blueberry'           
fruits[0:2] = ['mango', 'kiwi']   

lst = [3, 1, 4, 1, 5] # ← new
lst.append(9)         # ← new
lst.sort()            # ← new
```
This adds list methods that change the list in-place.

### Introduce the concept in isolation
```python
>>> temp = [3, 1, 2]
>>> result = temp.sort()
>>> print(result)
None
>>> temp
[1, 2, 3]
```
This output proves that mutating methods like `sort()` change the list in place and return `None`. This is called an **in-place mutation method**. 

### Discard the throwaway example
The `temp` example above is discarded.

### Mechanical walkthrough
1. `lst = [3, 1, 4, 1, 5]`
2. `lst.append(9)`
   - - *What it is:* A method that adds a single element to the end of a list.
     - *Implementation:* `def append(self, object: _T) -> None`
     - *Its use:* Used to grow a list dynamically by adding one item at a time.
     - *Type:* Instance method of `list`.
     - *Responsibility:* Modifies the list in place by appending the passed object to its tail.
     - *Depends on:* A mutable list instance and the object to append.
     - *Connects to:* Called by user code; modifies the internal array.
     - *Shape:* Public API of the `list` class.
3. `lst.sort()`
   - - *What it is:* A method that sorts the list in place.
     - *Implementation:* `def sort(self, *, key: Callable = None, reverse: bool = False) -> None`
     - *Its use:* Used to organize data into ascending or descending order without creating a new list.
     - *Type:* Instance method of `list`.
     - *Responsibility:* Reorders the elements of the list in place using Timsort.
     - *Depends on:* A mutable list whose elements support comparison.
     - *Connects to:* Element comparison operations (like `<`).
     - *Shape:* Public API of the `list` class.
   - It is a common bug to write `lst = lst.sort()`, which replaces `lst` with `None`.


## Concept Unit: Key list functions — the non-mutating ones

### The Problem
What if we want to sort a list, but we *must* preserve the original unsorted data? Mutating methods destroy the original order.

> If `.sort()` destroys the old order, how might we keep the old data and get sorted data at the same time?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** At the bottom
- **Dependencies:** None

### The New Code
```python
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
sorted_nums = sorted(numbers)
```

### The Updated Project
```python
# ... previous lines omitted ...
lst = [3, 1, 4, 1, 5] 
lst.append(9)         
lst.sort()            

numbers = [3, 1, 4, 1, 5, 9, 2, 6] # ← new
sorted_nums = sorted(numbers)      # ← new
```
This introduces functions that return new data without mutating the original list.

### Introduce the concept in isolation
```python
>>> data = [3, 1, 2]
>>> sorted(data)
[1, 2, 3]
>>> data
[3, 1, 2]
>>> max(data)
3
```
This demonstrates the **sorted()** function. The output proves that the original `data` list is completely unchanged, while a new sorted list is returned.

### Discard the throwaway example
The `data` example above is discarded.

### Mechanical walkthrough
1. `numbers = [3, 1, 4, 1, 5, 9, 2, 6]`
2. `sorted_nums = sorted(numbers)`
   - **`sorted()`**:
     - *What it is:* A built-in function that returns a new sorted list from an iterable.
     - *Implementation:* `def sorted(iterable: Iterable[_T], *, key: Callable = None, reverse: bool = False) -> list[_T]`
     - *Its use:* Used when we need a sorted version of our data but must preserve the original list.
     - *Type:* Built-in function.
     - *Responsibility:* Consumes the iterable, builds a new list, sorts it, and returns it.
     - *Depends on:* An iterable with comparable elements.
     - *Connects to:* Caller code, returns a new list.
     - *Shape:* Public standard library surface.
   - Unlike `.sort()`, `sorted()` creates and returns a brand-new list object.


## Concept Unit: Aliasing — the critical gotcha

### The Problem
If we do `b = a`, and then change `b`, what happens to `a`? With integers, they are distinct. But lists are mutable objects holding references.

> If `a = [1, 2, 3]` and `b = a`, write down what you think `a` is after `b.append(4)`.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** At the bottom
- **Dependencies:** None

### The New Code
```python
a = [1, 2, 3]
b = a
b.append(4)
```

### The Updated Project
```python
# ... previous lines omitted ...
numbers = [3, 1, 4, 1, 5, 9, 2, 6] 
sorted_nums = sorted(numbers)      

a = [1, 2, 3] # ← new
b = a         # ← new
b.append(4)   # ← new
```
This shows assigning a list to a new variable and mutating it.

### Introduce the concept in isolation
```python
>>> x = [1, 2, 3]
>>> y = x
>>> y.append(4)
>>> x
[1, 2, 3, 4]
>>> x is y
True
>>> id(x) == id(y)
True
```
This output proves that `y = x` does NOT copy the list. Both `x` and `y` point to the EXACT SAME list object in memory. This is called **aliasing**.

### Discard the throwaway example
The `x` and `y` REPL example is discarded.

### Mechanical walkthrough
1. `a = [1, 2, 3]`
   - Creates a new list object in memory, and the variable `a` holds a reference to it.
2. `b = a`
   - Copies the *reference*, not the list. `b` now points to the exact same list object in memory as `a`.
3. `b.append(4)`
   - Modifying through `b` mutates the single underlying list object. Because `a` points to the same object, checking `a` will show it is also "changed."


## Concept Unit: Copying lists — three ways

### The Problem
Since `b = a` creates an alias, how do we actually make a distinct, separate clone of a list so that modifying one doesn't affect the other?

> Using what we learned about strings in Lesson 6, how could you use slicing to get a full copy of a list?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** At the bottom
- **Dependencies:** None

### The New Code
```python
a = [1, 2, 3]
b = a[:]
c = a.copy()
d = list(a)
```

### The Updated Project
```python
# ... previous lines omitted ...
a = [1, 2, 3]
b = a[:]       # ← new (overwrites previous b)
c = a.copy()   # ← new
d = list(a)    # ← new
```
This shows three valid ways to produce a shallow copy of a list.

### Introduce the concept in isolation
```python
>>> original = [[1, 2], [3, 4]]
>>> clone = original[:]
>>> clone[0].append(99)
>>> original
[[1, 2, 99], [3, 4]]
```
This is called a **shallow copy**. The outer list is a new object, but it is filled with references to the exact same inner objects. The output proves that modifying an inner nested list affects both the original and the clone.

### Discard the throwaway example
The `original` example is discarded.

### Mechanical walkthrough
1. `b = a[:]`
   - Uses a slice from start to end, which creates a new list containing the same elements.
2. `c = a.copy()`
   - **`copy()`**:
     - *What it is:* A method that returns a shallow copy of the list.
     - *Implementation:* `def copy(self) -> list[_T]`
     - *Its use:* Used to duplicate a list so we can modify the new one without altering the original.
     - *Type:* Instance method of `list`.
     - *Responsibility:* Allocates a new list and copies all element references into it.
     - *Depends on:* The original list instance.
     - *Connects to:* Caller code, returns a new distinct list object.
     - *Shape:* Public API of the `list` class.
3. `d = list(a)`
   - **`list()`**:
     - *What it is:* The list type constructor.
     - *Implementation:* `class list(Iterable[_T])`
     - *Its use:* Used here to create a copy of an existing list by casting it.
     - *Type:* Built-in class / constructor.
     - *Responsibility:* Instantiates a new list object from any iterable passed to it.
     - *Depends on:* An iterable to source elements from.
     - *Connects to:* Memory allocator and the iterable's iteration protocol.
     - *Shape:* Public standard library surface.


## Concept Unit: Lists and for loops — common patterns

### The Problem
We need to run operations on every item in a list, but we shouldn't manually index `lst[0]`, `lst[1]`, etc. Also, modifying a list while iterating over it causes bizarre bugs.

> What do you think happens if you try to `remove()` items from a list inside a `for` loop that is iterating over that same list?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** At the bottom
- **Dependencies:** None

### The New Code
```python
squares = [x**2 for x in range(1, 6)]
for i, item in enumerate(['a', 'b', 'c']):
    print(i, item)
```

### The Updated Project
```python
# ... previous lines omitted ...
a = [1, 2, 3]
b = a[:]       
c = a.copy()   
d = list(a)    

squares = [x**2 for x in range(1, 6)]      # ← new
for i, item in enumerate(['a', 'b', 'c']): # ← new
    print(i, item)                         # ← new
```
This shows generating a list and iterating over one safely.

### Introduce the concept in isolation
```python
>>> lst = [1, 2, 3, 4, 5]
>>> for x in lst:
...     if x % 2 == 0:
...         lst.remove(x)
... 
>>> lst
[1, 3, 5]
```
This proves the point: iterating over a list while mutating it causes erratic behavior (in this specific case it happened to "work" by skipping element `4` when `2` was removed, changing its internal indexing). The safe idiom is to build a new list: `[x for x in lst if x % 2 != 0]`.

### Discard the throwaway example
The `lst` loop bug example is discarded.

### Mechanical walkthrough
1. `squares = [x**2 for x in range(1, 6)]`
   - This is a preview of list comprehensions. It builds a new list by applying `x**2` to each item generated by `range(1, 6)`.
2. `for i, item in enumerate(['a', 'b', 'c']):`
   - Iterates using **`enumerate()`**, yielding both the index `i` and the value `item` on each pass.
3. `print(i, item)`
   - Prints the index and the value together.

---

Closing: lists are the most-used data structure in Python. Lesson 8 introduces tuples — immutable lists used for records and multiple return values.

**Exercises:**
- Write `flatten(nested)` that takes a list of lists and returns a single flat list.
- Write `remove_duplicates(lst)` that returns a new list with duplicates removed (preserving order).
- Trace exactly what happens to `a` when you run `b = a; b = b + [4]` (different from `b.append(4)` — why?).
