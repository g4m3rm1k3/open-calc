# Lesson 07: Lists — The Workhorse

What you will build: The reader understands Python lists: mutable ordered sequences, indexing/slicing, mutation methods (append, insert, remove, pop, sort), aliasing vs. copying, and list-as-stack/queue patterns. The transferable insight: a list is a mutable sequence. Mutability means methods like append() change the list IN PLACE and return None. This catches many beginners: sorted(lst) returns a new list; lst.sort() mutates in place and returns None.

What you need to know first: Lesson 06

**Terms used in this lesson:**
- **mutable** — an object whose state or contents can be changed after it is created. Mutability requires careful handling to avoid accidental changes to shared data.
- **sequence** — an ordered collection of elements. A sequence allows access to elements by their integer position.
- **index** — a zero-based integer indicating an element's position within a sequence. Used to retrieve or modify specific elements.
- **slice** — a subset of a sequence, extracted by specifying a start, stop, and optional step index. It creates a new sequence containing the requested elements.
- **aliasing** — when two or more variables refer to the exact same object in memory. A change through one alias is visible through all others.
- **in-place mutation** — modifying an existing object directly rather than creating a new copy with the changes. Operations that mutate in place typically return `None` in Python.
- **stack** — a data structure that follows the Last-In, First-Out (LIFO) principle, where elements are added and removed from the same end.
- **queue** — a data structure that follows the First-In, First-Out (FIFO) principle, where elements are added at one end and removed from the other.
- **LIFO** — Last-In, First-Out. The last item added is the first one removed.
- **FIFO** — First-In, First-Out. The first item added is the first one removed.

**Objects and methods used:**
- **list**
  - *What it is:* Python's built-in mutable sequence type.
  - *Implementation:* `class list([iterable])`. A dynamic array capable of holding heterogeneous elements.
  - *Its use:* To store and manipulate ordered collections of items.
  - *Type:* built-in class
  - *Responsibility:* Maintains an ordered, mutable collection of items with O(1) random access.
  - *Depends on:* Optionally, an iterable to initialize its contents.
  - *Connects to:* Accessed by index, iterated over by loops, modified by sequence methods.
  - *Shape:* A fundamental data structure used throughout Python applications.

- **len**
  - *What it is:* A built-in function that returns the number of items in a container.
  - *Implementation:* `def len(s: Sized) -> int`. Calls the object's `__len__()` method.
  - *Its use:* To determine the size of a list or other sequence.
  - *Type:* built-in function
  - *Responsibility:* Accurately reports the count of elements in a sized container.
  - *Depends on:* An object implementing the `__len__` protocol.
  - *Connects to:* Used in loop conditions, index bounds checking, and general logic.
  - *Shape:* Global utility function.

- **id**
  - *What it is:* A built-in function that returns the unique memory address (identity) of an object.
  - *Implementation:* `def id(obj: object) -> int`. Returns a unique integer for the object's lifetime.
  - *Its use:* To verify if two variables alias the same object in memory, especially before and after mutation.
  - *Type:* built-in function
  - *Responsibility:* Provides a guaranteed unique identifier for an existing object.
  - *Depends on:* Any Python object.
  - *Connects to:* Used primarily for debugging and understanding reference semantics.
  - *Shape:* Global utility function.

- **append**
  - *What it is:* A list method that adds a single element to the end of the list.
  - *Implementation:* `def append(self, object: _T) -> None`. Mutates the list in place.
  - *Its use:* To incrementally build a list by adding items one by one.
  - *Type:* instance method on `list`
  - *Responsibility:* Increases list length by 1, placing the new item at the final index.
  - *Depends on:* The element to add.
  - *Connects to:* Modifies the list object it is called on.
  - *Shape:* Primary mutation interface for lists.

- **insert**
  - *What it is:* A list method that inserts an element before a specified index.
  - *Implementation:* `def insert(self, index: int, object: _T) -> None`. Mutates in place.
  - *Its use:* To place an item at a specific position, shifting subsequent elements right.
  - *Type:* instance method on `list`
  - *Responsibility:* Injects a new element at the target index, maintaining order of other elements.
  - *Depends on:* The target integer index and the element to insert.
  - *Connects to:* Modifies the list object it is called on.
  - *Shape:* Positional mutation interface.

- **remove**
  - *What it is:* A list method that removes the first occurrence of a value.
  - *Implementation:* `def remove(self, value: _T) -> None`. Raises ValueError if value is not found.
  - *Its use:* To delete a known value from a list without knowing its index.
  - *Type:* instance method on `list`
  - *Responsibility:* Finds and removes the first matching element, shifting subsequent elements left.
  - *Depends on:* The value to search for and remove.
  - *Connects to:* Modifies the list object it is called on.
  - *Shape:* Value-based deletion interface.

- **pop**
  - *What it is:* A list method that removes and returns the element at a given index (defaulting to the last).
  - *Implementation:* `def pop(self, index: int = -1) -> _T`. Mutates in place and returns the item.
  - *Its use:* To extract an element while simultaneously removing it, useful for stacks.
  - *Type:* instance method on `list`
  - *Responsibility:* Removes the element at the specified index and yields it to the caller.
  - *Depends on:* An optional integer index (defaults to -1).
  - *Connects to:* Modifies the list object and passes data back to the caller.
  - *Shape:* Index-based extraction interface.

- **extend**
  - *What it is:* A list method that appends all elements from an iterable to the list.
  - *Implementation:* `def extend(self, iterable: Iterable[_T]) -> None`. Mutates in place.
  - *Its use:* To concatenate another sequence or iterable onto the end of an existing list.
  - *Type:* instance method on `list`
  - *Responsibility:* Expands the list by unpacking the provided iterable into it.
  - *Depends on:* An iterable object containing elements to add.
  - *Connects to:* Modifies the list object it is called on.
  - *Shape:* Bulk mutation interface.

- **clear**
  - *What it is:* A list method that removes all items from the list.
  - *Implementation:* `def clear(self) -> None`. Equivalent to `del lst[:]`.
  - *Its use:* To empty a list entirely while preserving the list object itself (and any aliases to it).
  - *Type:* instance method on `list`
  - *Responsibility:* Resets the list to a length of 0.
  - *Depends on:* None.
  - *Connects to:* Modifies the list object it is called on.
  - *Shape:* State reset interface.

- **sort**
  - *What it is:* A list method that sorts the list in place.
  - *Implementation:* `def sort(self, *, key: Callable = None, reverse: bool = False) -> None`.
  - *Its use:* To arrange elements in a specific order (ascending by default) without creating a new list.
  - *Type:* instance method on `list`
  - *Responsibility:* Reorders the elements of the list according to natural ordering or a provided key function.
  - *Depends on:* Optional keyword arguments `key` and `reverse`.
  - *Connects to:* Modifies the list object it is called on.
  - *Shape:* In-place sorting algorithm.

- **sorted**
  - *What it is:* A built-in function that returns a new sorted list from the items in any iterable.
  - *Implementation:* `def sorted(iterable: Iterable, *, key: Callable = None, reverse: bool = False) -> list`.
  - *Its use:* To obtain a sorted version of a collection without mutating the original collection.
  - *Type:* built-in function
  - *Responsibility:* Generates a brand new list containing the sorted elements of the input iterable.
  - *Depends on:* An iterable, and optional `key` and `reverse` arguments.
  - *Connects to:* Reads the iterable, outputs a new list.
  - *Shape:* Pure function for sorting.

- **copy.deepcopy**
  - *What it is:* A function from the `copy` module that creates a fully independent clone of an object and all objects it contains.
  - *Implementation:* `def deepcopy(x, memo=None, _nil=[]) -> Any`.
  - *Its use:* To duplicate nested lists or complex objects to prevent aliasing at all levels.
  - *Type:* function in `copy` module
  - *Responsibility:* Recursively copies the object and every nested reference within it.
  - *Depends on:* The object to copy.
  - *Connects to:* Reads the original object tree, returns a new distinct object tree.
  - *Shape:* Deep cloning utility.

- **collections.deque**
  - *What it is:* A double-ended queue from the `collections` module.
  - *Implementation:* `class deque([iterable[, maxlen]])`.
  - *Its use:* To provide O(1) time complexity for append and pop operations from both ends, ideal for queues.
  - *Type:* class in `collections` module
  - *Responsibility:* Maintains a thread-safe, memory-efficient double-ended queue.
  - *Depends on:* Optional iterable and maxlen.
  - *Connects to:* Acts as a drop-in replacement for lists when FIFO behavior is needed.
  - *Shape:* Specialized sequence data structure.

## Concept Unit: List literals and indexing — mutable ordered sequence

### The Problem
When dealing with multiple related values, such as a row of sensor readings or a collection of user inputs, storing each one in a separate variable (`val1`, `val2`, `val3`) quickly becomes unmanageable. How can you group an arbitrary number of values together in a specific, predictable order? If you need to retrieve the exact first or last item of that group, how would you target it? What if you need to update one specific value within the group without recreating the entire structure?

### Introduce the concept in isolation
```python
my_list = [1, 'a', True, None]
print(my_list[0])
print(my_list[-1])
print(my_list[1:3])
print(len(my_list))
print('a' in my_list)

original_id = id(my_list)
my_list[0] = 99
print(my_list)
print(id(my_list) == original_id)
```
Output:
```text
1
None
['a', True]
4
True
[99, 'a', True, None]
True
```
This proves that a **list** is a heterogeneous, ordered sequence that supports zero-based indexing (`my_list[0]`), negative indexing from the end (`my_list[-1]`), slicing (`my_list[1:3]`), length checking (`len()`), and membership testing (`in`). Crucially, it proves that lists are mutable: assigning `99` to index `0` changes the list in place, and the `id()` check confirms it is the exact same object in memory, just with different contents.

### Discard the throwaway
The throwaway code above is discarded and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are initializing our working list structure for the concepts.
- **Files affected:** `src/main.py` (created)
- **Change type:** add
- **Location:** At the top of the new file.
- **Dependencies:** None.

### The New Code
```python
names = ['Alice', 'Bob', 'Charlie']
names[0] = 'Alicia'
```

### The Updated Project
```python
# 1
# 2
1: names = ['Alice', 'Bob', 'Charlie'] # ← new
2: names[0] = 'Alicia'                 # ← new
```
This initializes a list of strings and immediately mutates its first element in place.

### Mechanical walkthrough
- `names`: A variable bound to the list object.
- `=`: The assignment operator.
- `['Alice', 'Bob', 'Charlie']`: A list literal containing three string elements.
- `names[0]`: Indexing syntax targeting the element at integer position 0.
- `=`: The assignment operator used for item assignment.
- `'Alicia'`: A new string literal replacing the old element.

### CS lens
The CS concept is the **Dynamic Array**. Unlike static arrays in C or Java which have fixed sizes determined at creation, a dynamic array grows and shrinks automatically. It appears in Java's `ArrayList`, C++'s `std::vector`, and Ruby's `Array`. It provides O(1) random access by index but O(n) insertions/deletions in the middle of the array, as elements must be shifted.

### SE lens
The design principle here is **Mutability vs Immutability**. Python chose to make its primary sequence type mutable for convenience and performance in scripting tasks. The alternative NOT chosen is making all sequences immutable (like functional languages or Python's own `tuple`). The real tradeoff is that mutable objects can be modified unexpectedly if shared across different parts of a program, leading to bugs, but they avoid the overhead of copying entire structures for tiny updates.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The list `names` will contain `['Alicia', 'Bob', 'Charlie']`.

### One sentence connecting to previous unit
Now that we can create a list and change existing items, we need to add entirely new items to it.

## Concept Unit: Mutation methods — append, insert, remove, pop

### The Problem
We have a list, but it currently only holds the items we provided when we typed the literal `[...]`. How do we add a new item dynamically to the end of the list? What if we need to insert an item exactly at the beginning? If an item needs to be removed, how do we delete it by its value or by its index?

### Introduce the concept in isolation
```python
sandbox = [10, 20]
print(sandbox.append(30))
print(sandbox)

sandbox.insert(0, 5)
print(sandbox)

sandbox.remove(20)
print(sandbox)

popped = sandbox.pop(1)
print(f"Popped: {popped}, List: {sandbox}")

sandbox.extend([40, 50])
print(sandbox)

sandbox.clear()
print(sandbox)
```
Output:
```text
None
[10, 20, 30]
[5, 10, 20, 30]
[5, 10, 30]
Popped: 10, List: [5, 30]
[5, 30, 40, 50]
[]
```
This proves that **list mutation methods** (`append`, `insert`, `remove`, `extend`, `clear`) change the list in place and explicitly return `None`. `pop` is the exception, mutating the list by removing an item and returning that removed item.

### Discard the throwaway
The throwaway code above is discarded and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are expanding our sequence.
- **Files affected:** `src/main.py` (modified)
- **Change type:** add
- **Location:** After the existing code.
- **Dependencies:** The `names` list from the previous unit.

### The New Code
```python
names.append('David')
names.insert(1, 'Eve')
names.remove('Bob')
last = names.pop()
```

### The Updated Project
```python
1: names = ['Alice', 'Bob', 'Charlie']
2: names[0] = 'Alicia'
3: names.append('David')       # ← new
4: names.insert(1, 'Eve')      # ← new
5: names.remove('Bob')         # ← new
6: last = names.pop()          # ← new
```
This sequence of method calls mutates the list by appending 'David', inserting 'Eve' at index 1, removing 'Bob', and popping the last element ('David') into a variable.

### Mechanical walkthrough
- `names.append('David')`: Calls the `append` method on the `names` list, mutating it to add the string `'David'` to the end, returning `None`.
- `names.insert(1, 'Eve')`: Calls `insert` on `names`, shifting elements from index 1 rightward, and placing `'Eve'` at index 1, returning `None`.
- `names.remove('Bob')`: Calls `remove` on `names`, searching for the exact value `'Bob'` and removing its first occurrence, returning `None`.
- `last = names.pop()`: Calls `pop` on `names` with no arguments, which removes and returns the last element. The returned string is assigned to the variable `last`.

### CS lens
The CS concept is **In-Place Modification (Side Effects)**. Methods that perform side effects (like mutating the underlying data structure) typically do not return the structure itself. It appears in REST APIs (POST/DELETE don't always return the full state), database UPDATE statements, and object-oriented state machines.

### SE lens
The design principle is **Command-Query Separation (CQS)**. A method should either be a command that performs an action (mutates state) and returns void/None, or a query that returns data without side effects, but not both. Python adheres to this strictly with `append()`, `insert()`, and `remove()`. `pop()` is a deliberate, pragmatic violation of CQS because separating a stack pop into a peek followed by a delete would create race conditions in concurrent environments.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The list `names` will contain `['Alicia', 'Eve', 'Charlie']` and `last` will hold `'David'`.

### One sentence connecting to previous unit
Now that our list contains exactly the elements we want, we need a way to organize them into a specific order.

## Concept Unit: Sorting — sort() vs sorted()

### The Problem
If you have a list of names and need to present them alphabetically, how do you reorder them? If you need to keep the original list exactly as it is but also need an alphabetical copy for a specific report, how do you accomplish both? What if you want to sort them by length instead of alphabetical order?

### Introduce the concept in isolation
```python
letters = ['b', 'a', 'd', 'c']
new_letters = sorted(letters)
print(f"Original: {letters}")
print(f"Sorted copy: {new_letters}")

result = letters.sort(reverse=True)
print(f"Return value: {result}")
print(f"Mutated original: {letters}")

words = ['apple', 'Banana', 'cherry']
words.sort(key=str.lower)
print(f"Case-insensitive: {words}")
```
Output:
```text
Original: ['b', 'a', 'd', 'c']
Sorted copy: ['a', 'b', 'c', 'd']
Return value: None
Mutated original: ['d', 'c', 'b', 'a']
Case-insensitive: ['apple', 'Banana', 'cherry']
```
This proves the difference between **`sorted()`** (which returns a new list and leaves the original alone) and **`lst.sort()`** (which mutates the list in place and returns `None`). Both accept keyword arguments `key` and `reverse` to customize the sorting logic.

### Discard the throwaway
The throwaway code above is discarded and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are organizing our sequence.
- **Files affected:** `src/main.py` (modified)
- **Change type:** add
- **Location:** After the existing code.
- **Dependencies:** The `names` list from the previous unit.

### The New Code
```python
alphabetical_names = sorted(names)
names.sort(key=len)
```

### The Updated Project
```python
1: names = ['Alice', 'Bob', 'Charlie']
2: names[0] = 'Alicia'
3: names.append('David')
4: names.insert(1, 'Eve')
5: names.remove('Bob')
6: last = names.pop()
7: alphabetical_names = sorted(names) # ← new
8: names.sort(key=len)                # ← new
```
This uses the `sorted()` built-in to create a new alphabetical list, and then mutates the original `names` list in place to sort its elements by length.

### Mechanical walkthrough
- `alphabetical_names`: A new variable bound to the result of `sorted()`.
- `=`: The assignment operator.
- `sorted(names)`: Calls the built-in `sorted` function with `names` as the argument, returning a brand new list sorted in ascending order.
- `names.sort(key=len)`: Calls the `sort` method on `names`, mutating it in place. The `key=len` argument specifies that the built-in `len` function should be called on each element to determine its sort weight, sorting by string length.

### CS lens
The CS concept is **Stable Sorting**. Python's sorting algorithm (Timsort) is guaranteed to be stable, meaning that if two elements compare as equal (e.g., they have the same length when `key=len` is used), their original relative order is preserved in the sorted output. It appears in SQL `ORDER BY` clauses, spreadsheet sorting, and multi-pass sorting algorithms where you sort by one criteria and then another without losing the first pass's grouping.

### SE lens
The design principle is **Pure Functions vs Mutating Methods**. `sorted()` is a pure-like function: it takes an input, returns an output, and has no side effects (it doesn't alter the input). `sort()` is an impure method: it relies entirely on side effects. Python provides both so the developer can choose based on the tradeoff: `sorted()` is safer because it prevents accidental corruption of shared state, while `sort()` is significantly more memory-efficient for massive datasets because it doesn't allocate a new array.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `alphabetical_names` will be `['Alicia', 'Charlie', 'Eve']`. `names` will be `['Eve', 'Alicia', 'Charlie']` (sorted by length, 'Eve' is 3, 'Alicia' is 6, 'Charlie' is 7).

### One sentence connecting to previous unit
Now that we understand how lists can be mutated in place, we must confront the hidden dangers of sharing mutable lists across different variables.

## Concept Unit: Aliasing vs. copying — the mutation trap

### The Problem
If you assign a list to a new variable (like `backup = names`), and then modify the new variable, what happens to the original list? Why does modifying `backup` magically alter `names`? If you actually need an independent copy to modify safely, how do you create one?

### Introduce the concept in isolation
```python
import copy

a = [1, [2, 3]]
b = a
b.append(4)
print(f"a after b mutates: {a}")

c = a[:]
c.append(5)
print(f"a after c appends: {a}")

c[1].append(99)
print(f"a after c mutates nested list: {a}")

d = copy.deepcopy(a)
d[1].append(100)
print(f"a after d mutates nested list: {a}")
```
Output:
```text
a after b mutates: [1, [2, 3], 4]
a after c appends: [1, [2, 3], 4]
a after c mutates nested list: [1, [2, 3, 99], 4]
a after d mutates nested list: [1, [2, 3, 99], 4]
```
This proves **aliasing** (`b = a` points to the exact same list) and **shallow copying** (`c = a[:]` creates a new outer list, but the nested list `[2, 3]` is still aliased). Finally, it proves **deep copying** (`copy.deepcopy()`) clones the list and everything inside it, fully severing the connection.

### Discard the throwaway
The throwaway code above is discarded and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating reference semantics.
- **Files affected:** `src/main.py` (modified)
- **Change type:** add
- **Location:** After the existing code.
- **Dependencies:** The `names` list from the previous unit.

### The New Code
```python
names_alias = names
names_alias.append('Frank')
names_copy = names.copy()
names_copy.append('Grace')
```

### The Updated Project
```python
1: names = ['Alice', 'Bob', 'Charlie']
2: names[0] = 'Alicia'
3: names.append('David')
4: names.insert(1, 'Eve')
5: names.remove('Bob')
6: last = names.pop()
7: alphabetical_names = sorted(names)
8: names.sort(key=len)
9: names_alias = names               # ← new
10: names_alias.append('Frank')       # ← new
11: names_copy = names.copy()         # ← new
12: names_copy.append('Grace')        # ← new
```
This creates an alias to `names` and mutates it (affecting `names`), then creates a shallow copy of `names` and mutates it (leaving `names` alone).

### Mechanical walkthrough
- `names_alias`: A new variable.
- `= names`: Binds `names_alias` to the exact same list object in memory that `names` points to.
- `names_alias.append('Frank')`: Mutates the shared list object in place, adding 'Frank'.
- `names_copy`: A new variable.
- `= names.copy()`: Calls the `copy` method on `names` (equivalent to `names[:]` or `list(names)`), returning a shallow copy, and binds it to `names_copy`.
- `names_copy.append('Grace')`: Mutates the independent copy in place, adding 'Grace'. The original `names` list is unaffected.

### CS lens
The CS concept is **Reference Semantics vs Value Semantics**. Variables in Python are labels (references) pointing to objects in memory, not boxes containing values. When you pass a list to a function or assign it to a variable, you pass the memory address (reference), not the data payload. It appears in Java objects, JavaScript objects/arrays, and pointers in C/C++.

### SE lens
The design principle is **Defensive Copying**. The alternative NOT chosen is passing the mutable reference blindly to a function. The real tradeoff is that defensive copying prevents subtle bugs where a called function unexpectedly ruins the caller's data structure, but it incurs a severe performance and memory penalty if the list is large. You copy when mutation is dangerous; you pass the reference when mutation is intended or copying is too slow.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `names` will contain `['Eve', 'Alicia', 'Charlie', 'Frank']`. `names_copy` will contain `['Eve', 'Alicia', 'Charlie', 'Frank', 'Grace']`.

### One sentence connecting to previous unit
Knowing how to safely modify lists allows us to use them as structural foundations for more specialized data structures.

## Concept Unit: Lists as stacks and queues

### The Problem
Sometimes you don't need a random-access list, but rather a structure that enforces a strict processing order: processing the most recently added task first (LIFO) or processing tasks in the exact order they arrived (FIFO). How can a Python list simulate a stack? Can it simulate a queue efficiently?

### Introduce the concept in isolation
```python
from collections import deque

stack = []
stack.append('A')
stack.append('B')
print(f"Stack pop: {stack.pop()}")

queue_bad = ['A', 'B']
print(f"List queue pop(0): {queue_bad.pop(0)}")

queue_good = deque(['A', 'B'])
queue_good.append('C')
print(f"Deque popleft: {queue_good.popleft()}")
```
Output:
```text
Stack pop: B
List queue pop(0): A
Deque popleft: A
```
This proves that lists act naturally as **stacks** using `append()` and `pop()`. Using a list as a queue by calling `pop(0)` works but is extremely inefficient (O(n)) because all subsequent elements must be shifted left in memory. `collections.deque` provides O(1) performance for both ends.

### Discard the throwaway
The throwaway code above is discarded and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating list-as-stack patterns.
- **Files affected:** `src/main.py` (modified)
- **Change type:** add
- **Location:** At the very top of the file for the import, and at the bottom for the code.
- **Dependencies:** The standard library `collections` module.

### The New Code
```python
from collections import deque

task_stack = []
task_stack.append('Task 1')
task_stack.pop()

task_queue = deque()
task_queue.append('Job 1')
task_queue.popleft()
```

### The Updated Project
```python
1: from collections import deque       # ← new
2: 
3: names = ['Alice', 'Bob', 'Charlie']
4: names[0] = 'Alicia'
5: names.append('David')
6: names.insert(1, 'Eve')
7: names.remove('Bob')
8: last = names.pop()
9: alphabetical_names = sorted(names)
10: names.sort(key=len)
11: names_alias = names
12: names_alias.append('Frank')
13: names_copy = names.copy()
14: names_copy.append('Grace')
15: 
16: task_stack = []                     # ← new
17: task_stack.append('Task 1')         # ← new
18: task_stack.pop()                    # ← new
19: 
20: task_queue = deque()                # ← new
21: task_queue.append('Job 1')          # ← new
22: task_queue.popleft()                # ← new
```
This demonstrates the idiomatic way to implement LIFO stacks (using standard lists) and FIFO queues (using `collections.deque`) in Python.

### Mechanical walkthrough
- `from collections import deque`: Imports the `deque` class from the `collections` module.
- `task_stack = []`: Initializes an empty list to act as a stack.
- `task_stack.append('Task 1')`: Pushes an item onto the top (end) of the stack.
- `task_stack.pop()`: Pops and returns the item from the top of the stack.
- `task_queue = deque()`: Initializes a new, empty double-ended queue.
- `task_queue.append('Job 1')`: Enqueues an item to the right end of the deque.
- `task_queue.popleft()`: Dequeues and returns an item from the left end of the deque efficiently.

### CS lens
The CS concepts are **Time Complexity (Big O Notation)** and **Abstract Data Types (ADTs)**. A Stack and a Queue are ADTs: theoretical models defining behavior (LIFO/FIFO). Arrays and Linked Lists are concrete data structures. Using a dynamic array (Python list) to implement a Stack is O(1) for push/pop. Using it to implement a Queue is O(N) for dequeue (`pop(0)`) because of memory shifting. The `deque` is internally implemented as a doubly-linked list of fixed-size blocks, making ends-operations O(1).

### SE lens
The design principle is **Choosing the Right Abstraction for Performance**. The alternative NOT chosen is just using `list.pop(0)` everywhere because it's technically functional. The real tradeoff is that `pop(0)` works fine for 10 items but grinds the CPU to a halt for 100,000 items, causing a severe performance bottleneck. A professional engineer uses `deque` specifically to guarantee O(1) queue performance, signaling intent to future readers.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `task_stack` will be empty `[]`. `task_queue` will be an empty `deque([])`.

### One sentence connecting to previous unit
Understanding how lists behave mechanically gives us the confidence to build and manipulate them correctly in real applications.

## Closing
### Connect the pieces
Through this lesson, we traced a raw collection of names as it evolved using Python's list capabilities. We started with a basic list literal and saw how indexing and slicing allow targeted access and mutation. We modified it in place by appending, inserting, and popping elements, proving that lists are mutable containers that change state rather than returning new copies. We then sorted the collection, distinguishing sharply between `sorted(names)` returning a fresh sequence and `names.sort()` mutating the list in place. We observed the dangers of aliasing when multiple variables share a reference, and how to safely duplicate structures with shallow and deep copies. Finally, we constrained the list's random access to specific patterns, turning it into a LIFO stack and introducing `deque` for high-performance FIFO queues. This lifecycle — creation, in-place mutation, defensive copying, and patterned access — forms the daily reality of managing state in Python.
