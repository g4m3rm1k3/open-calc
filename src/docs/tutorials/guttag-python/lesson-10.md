# Lesson 10: Sets — Membership and Uniqueness

What you will build: The reader understands Python sets: unordered collections of unique hashable elements, O(1) membership test, and set algebra (union, intersection, difference, symmetric difference). The transferable insight: a set is the right data structure when you care about MEMBERSHIP and UNIQUENESS, not order or count. Any 'does this item exist?' question that iterates a list should use a set.

What you need to know first: Lessons 00-09.

**Terms used in this lesson:**
- **Set** — an unordered collection of unique hashable elements. It exists to provide fast O(1) membership testing and deduplication, solving the problem of slow O(n) list lookups.
- **Hashable** — an object whose value never changes during its lifetime (like an integer or string) and can be mapped to an integer via a hash function. It exists because sets and dicts require stable memory locations to provide fast lookups.
- **Set Literal** — a comma-separated list of items enclosed in curly braces `{1, 2, 3}`. It exists as a concise way to create sets with known elements.
- **Set Algebra** — mathematical operations on sets (union, intersection, difference). It exists to easily compare, combine, and filter collections of data.
- **Deduplication** — the process of removing duplicate elements from a collection. It exists to ensure each element is unique, saving space and preventing double-counting.
- **O(1) vs O(n) lookup** — time complexity describing how lookup time scales with collection size. It exists to analyze performance; O(1) is constant time regardless of size, O(n) grows linearly.

**Objects and methods used:**
- **`set()`**
  - *What it is:* The Python built-in constructor for creating a set object.
  - *Implementation:* `class set([iterable])` returns a new set object.
  - *Its use:* Used to create an empty set (since `{}` creates a dictionary) or to convert an iterable (like a list) into a set for deduplication or membership testing.
  - *Type:* Built-in class constructor.
  - *Responsibility:* Creates a mutable set object in memory containing unique hashable elements.
  - *Depends on:* An optional iterable object containing hashable elements.
  - *Connects to:* Called by application code; returns a new set instance.
  - *Shape:* A fundamental data structure at the language level.
- **`add()`**
  - *What it is:* A method that adds a single element to a set.
  - *Implementation:* `s.add(elem)` returns None and mutates the set `s` in place.
  - *Its use:* Used to insert a new unique item into an existing set.
  - *Type:* Instance method of the `set` class.
  - *Responsibility:* Inserts an element into the set if it doesn't already exist; does nothing if it does.
  - *Depends on:* A hashable element to add.
  - *Connects to:* Called by application code on a set instance.
  - *Shape:* Mutator method for the set object.
- **`remove()`**
  - *What it is:* A method that removes a specific element from a set, raising an error if not found.
  - *Implementation:* `s.remove(elem)` mutates `s` in place, raises `KeyError` if `elem` is absent.
  - *Its use:* Used when you want to remove an item and logically expect it to be there (so its absence is an error condition).
  - *Type:* Instance method of the `set` class.
  - *Responsibility:* Removes the specified element from the set.
  - *Depends on:* A hashable element to remove.
  - *Connects to:* Called by application code on a set instance.
  - *Shape:* Mutator method for the set object.
- **`discard()`**
  - *What it is:* A method that removes a specific element from a set, doing nothing if not found.
  - *Implementation:* `s.discard(elem)` mutates `s` in place, returns None.
  - *Its use:* Used when you want to ensure an item is not in the set, without caring if it was there to begin with.
  - *Type:* Instance method of the `set` class.
  - *Responsibility:* Silently removes the specified element from the set if it is present.
  - *Depends on:* A hashable element to remove.
  - *Connects to:* Called by application code on a set instance.
  - *Shape:* Mutator method for the set object.
- **`pop()`**
  - *What it is:* A method that removes and returns an arbitrary element from the set.
  - *Implementation:* `s.pop()` mutates `s` and returns the removed element. Raises `KeyError` if empty.
  - *Its use:* Used to process elements one by one until the set is empty, when order does not matter.
  - *Type:* Instance method of the `set` class.
  - *Responsibility:* Removes and returns an arbitrary element from the set.
  - *Depends on:* The set not being empty.
  - *Connects to:* Called by application code on a set instance.
  - *Shape:* Mutator method for the set object.
- **`clear()`**
  - *What it is:* A method that removes all elements from the set.
  - *Implementation:* `s.clear()` mutates `s` to be empty.
  - *Its use:* Used to reset a set for reuse.
  - *Type:* Instance method of the `set` class.
  - *Responsibility:* Removes all elements from the set.
  - *Depends on:* The set instance.
  - *Connects to:* Called by application code on a set instance.
  - *Shape:* Mutator method for the set object.
- **`update()`**
  - *What it is:* A method that adds multiple elements from an iterable to a set.
  - *Implementation:* `s.update(iterable)` mutates `s` in place.
  - *Its use:* Used to bulk-add items to an existing set.
  - *Type:* Instance method of the `set` class.
  - *Responsibility:* Adds all unique elements from the given iterable into the set.
  - *Depends on:* An iterable containing hashable elements.
  - *Connects to:* Called by application code on a set instance.
  - *Shape:* Mutator method for the set object.
- **`frozenset()`**
  - *What it is:* The Python built-in constructor for creating an immutable set object.
  - *Implementation:* `class frozenset([iterable])` returns a new frozenset object.
  - *Its use:* Used to create sets that can be used as dictionary keys or elements of other sets.
  - *Type:* Built-in class constructor.
  - *Responsibility:* Creates an immutable, hashable set object.
  - *Depends on:* An optional iterable object containing hashable elements.
  - *Connects to:* Called by application code; returns a new frozenset instance.
  - *Shape:* A fundamental data structure at the language level.

## Concept Unit: Set literals and creation

### The Problem
How do you store a collection of unique items where the order does not matter? If you have a list of items and you want to remove duplicates quickly, what data structure is best? If you need to repeatedly check whether an item exists in a large collection, what offers the fastest lookup?

### Introduce the concept in isolation
```python
# Create a set literal
my_set = {1, 2, 3, 2, 1}
print(my_set)

# Create an empty set
empty_set = set()
print(empty_set)

# Convert list to set to deduplicate
my_list = [10, 20, 10, 30]
list_as_set = set(my_list)
print(list_as_set)

# Membership test
print(20 in list_as_set)
print(99 not in list_as_set)
```
Output:
```text
{1, 2, 3}
set()
{10, 20, 30}
True
True
```
This output proves that **sets** automatically deduplicate their contents and do not guarantee insertion order. It also proves that creating an empty set requires `set()` because `{}` creates a dictionary, and that `in` and `not in` are used to check membership.

### Discard the throwaway
This code is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we need to track unique processed user IDs.
- **Files affected**: `processor.py` (created)
- **Change type**: Add
- **Location**: Top-level script
- **Dependencies**: None

### The New Code
```python
processed_ids = set([101, 102, 103, 101])
unique_count = len(processed_ids)
is_processed = 102 in processed_ids
```

### The Updated Project
```python
1: # ← new: processed_ids = set([101, 102, 103, 101])
2: # ← new: unique_count = len(processed_ids)
3: # ← new: is_processed = 102 in processed_ids
```
This structure creates a new set from a list, deduplicating the IDs, counts the unique elements, and tests for membership.

### Mechanical walkthrough
- `set()` is called, passing a list `[101, 102, 103, 101]`.
- The list `[101, 102, 103, 101]` provides the initial elements.
- `processed_ids` is assigned the resulting set `{101, 102, 103}`.
- `len(processed_ids)` calculates the number of elements in the set, returning `3`.
- `unique_count` is assigned the value `3`.
- `102 in processed_ids` checks if the integer `102` exists in the set, evaluating to `True`.
- `is_processed` is assigned the value `True`.

### CS lens
The concept here is a Hash Set. It appears in databases (for fast indexing of unique values), in caching systems (to track which keys have been seen), and in graph traversal algorithms (like breadth-first search) to remember which nodes have already been visited in O(1) time.

### SE lens
Design principle: Choose the right data structure for the job. We could have used a list and manually checked for duplicates using loops, but that would be O(n^2) for deduplication. Using a set makes it O(n) to build and O(1) to query. The tradeoff is that sets consume slightly more memory overhead than lists and discard original insertion order.

### Commands needed
python3

### Run it
Predicted confidently: The `processed_ids` set will contain `{101, 102, 103}`, `unique_count` will be `3`, and `is_processed` will be `True`.

### One sentence connecting to previous unit
Now that we have created a set and checked its contents, we need to know how to modify it dynamically.

## Concept Unit: Set mutation methods

### The Problem
What if your collection of unique items needs to grow or shrink over time? How do you add an item without checking if it already exists? How do you remove an item safely whether it's there or not?

### Introduce the concept in isolation
```python
s = {1, 2, 3}
s.add(4)
s.add(4) # Duplicate add is a no-op
print(s)

s.remove(2)
# s.remove(99) # This would raise a KeyError
s.discard(99) # This does nothing, safely
print(s)

popped = s.pop()
print(popped, s)

s.update([10, 11])
print(s)

s.clear()
print(s)
```
Output:
```text
{1, 2, 3, 4}
{1, 3, 4}
1 {3, 4}
{10, 11, 3, 4}
set()
```
This output proves that **mutation methods** alter the set in place: `add` ignores duplicates, `remove` throws an error on missing items while `discard` does not, `pop` removes an arbitrary element, `update` merges multiple elements, and `clear` empties the set completely.

### Discard the throwaway
This code is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we need to dynamically update our tracking.
- **Files affected**: `processor.py` (modified)
- **Change type**: Add
- **Location**: Below the `is_processed` assignment
- **Dependencies**: None

### The New Code
```python
processed_ids.add(104)
processed_ids.discard(101)
processed_ids.update([201, 202])
```

### The Updated Project
```python
1: processed_ids = set([101, 102, 103, 101])
2: unique_count = len(processed_ids)
3: is_processed = 102 in processed_ids
4: processed_ids.add(104) # ← new
5: processed_ids.discard(101) # ← new
6: processed_ids.update([201, 202]) # ← new
```
This structure takes the existing set and dynamically updates it by adding one new ID, safely removing an old one, and bulk-adding a list of new IDs.

### Mechanical walkthrough
- `processed_ids.add(104)` calls the `add` method on the set, inserting the integer `104`.
- `processed_ids.discard(101)` calls the `discard` method, silently removing `101` if it exists.
- `processed_ids.update([201, 202])` calls the `update` method, iterating over the list `[201, 202]` and adding each element to the set.

### CS lens
The concept here is Mutability in Hash-based Data Structures. It appears in memory management (tracking active memory allocations), event driven programming (subscribing and unsubscribing listeners), and session management (adding and dropping active user sessions).

### SE lens
Design principle: Fail-fast versus safe-defaults. The choice between `remove` (which raises an error) and `discard` (which silently ignores missing items) forces the programmer to explicitly state their expectation. The alternative not chosen is having only one removal method, which would either hide bugs or require manual existence checks.

### Commands needed
python3

### Run it
Predicted confidently: The `processed_ids` set will be mutated in place and will contain `{102, 103, 104, 201, 202}`.

### One sentence connecting to previous unit
Modifying individual sets is useful, but often we need to compare and combine multiple sets together.

## Concept Unit: Set algebra — union, intersection, difference

### The Problem
How do you find the elements that exist in two different collections? What if you want to combine two collections while removing all duplicates? How do you find elements that are in one collection but not another?

### Introduce the concept in isolation
```python
a = {1, 2, 3}
b = {3, 4, 5}

print(a | b) # Union
print(a & b) # Intersection
print(a - b) # Difference
print(a ^ b) # Symmetric difference
print(a <= b) # Subset test
```
Output:
```text
{1, 2, 3, 4, 5}
{3}
{1, 2}
{1, 2, 4, 5}
False
```
This output proves that **set algebra** operators return entirely new sets based on mathematical relationships: `|` combines them, `&` finds commonalities, `-` subtracts elements, and `^` finds items exclusive to one or the other. It also proves that `<= `checks if one set is a subset of another.

### Discard the throwaway
This code is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we need to compare user access lists.
- **Files affected**: `processor.py` (modified)
- **Change type**: Add
- **Location**: At the bottom of the file
- **Dependencies**: None

### The New Code
```python
admins = {101, 102}
editors = {102, 103, 104}
super_users = admins & editors
only_admins = admins - editors
```

### The Updated Project
```python
6: processed_ids.update([201, 202])
7: admins = {101, 102} # ← new
8: editors = {102, 103, 104} # ← new
9: super_users = admins & editors # ← new
10: only_admins = admins - editors # ← new
```
This structure creates two sets of roles and uses set algebra to find users who hold both roles and users who are exclusively admins.

### Mechanical walkthrough
- `admins` is assigned the set literal `{101, 102}`.
- `editors` is assigned the set literal `{102, 103, 104}`.
- `admins & editors` computes the intersection of the two sets, returning `{102}`.
- `super_users` is assigned the resulting intersection set `{102}`.
- `admins - editors` computes the difference, returning elements in `admins` that are not in `editors`, which is `{101}`.
- `only_admins` is assigned the resulting difference set `{101}`.

### CS lens
The concept here is Relational Algebra. It appears in SQL databases (JOINs and EXCEPT clauses), Boolean search queries (AND/OR operators in search engines), and access control lists (calculating effective permissions from multiple groups).

### SE lens
Design principle: Expressiveness. We could achieve these results by iterating through lists and manually checking conditions, but set operators natively communicate the mathematical intent of the operation. The real tradeoff is readability for those unfamiliar with the mathematical operators vs verbose but universally understood loop logic.

### Commands needed
python3

### Run it
Predicted confidently: `super_users` will be `{102}` and `only_admins` will be `{101}`.

### One sentence connecting to previous unit
Sets are mutable by default, but sometimes you need a set that cannot be changed so it can be used as a key in a dictionary or placed inside another set.

## Concept Unit: frozenset — the hashable set

### The Problem
Dictionaries require their keys to be hashable and immutable, and sets require their elements to be hashable and immutable. If you want to use a set itself as a dictionary key or store a set inside another set, how do you prevent it from being mutated?

### Introduce the concept in isolation
```python
# Mutable sets cannot be elements of another set
# This would raise a TypeError: unhashable type: 'set'
# nested_sets = {{1, 2}, {3, 4}}

# frozenset solves this
f_set = frozenset([1, 2])
valid_nested_set = {f_set, frozenset([3, 4])}
print(valid_nested_set)

# f_set.add(3) # This would raise an AttributeError
```
Output:
```text
{frozenset({1, 2}), frozenset({3, 4})}
```
This output proves that a **frozenset** is an immutable, hashable version of a set. It can be stored inside another set, but attempts to mutate it (like calling `add`) will fail.

### Discard the throwaway
This code is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we need to map combinations of permissions to roles.
- **Files affected**: `processor.py` (modified)
- **Change type**: Add
- **Location**: At the bottom of the file
- **Dependencies**: None

### The New Code
```python
role_permissions = {
    frozenset(["read", "write"]): "Editor",
    frozenset(["read"]): "Viewer"
}
```

### The Updated Project
```python
9: super_users = admins & editors
10: only_admins = admins - editors
11: role_permissions = { # ← new
12:     frozenset(["read", "write"]): "Editor", # ← new
13:     frozenset(["read"]): "Viewer" # ← new
14: } # ← new
```
This structure creates a dictionary where the keys are immutable `frozenset` objects representing collections of permissions, mapping to a string role name.

### Mechanical walkthrough
- `role_permissions` is assigned a new dictionary literal.
- `frozenset(["read", "write"])` is called to create an immutable set from a list of two strings.
- This `frozenset` is used as the first key in the dictionary, mapping to the value `"Editor"`.
- `frozenset(["read"])` is called to create an immutable set from a list of one string.
- This second `frozenset` is used as the second key in the dictionary, mapping to the value `"Viewer"`.

### CS lens
The concept here is Immutability and Hashing. It appears in functional programming paradigms (where data is never mutated), in cryptography (where hashing requires stable inputs), and in memoization (caching function results using their immutable arguments as keys).

### SE lens
Design principle: Type safety and invariants. By using `frozenset`, the language guarantees that the key can never change underneath the dictionary, preserving the integrity of the hash table. The alternative not chosen is using a sorted tuple, which works but loses the unordered mathematical semantics of a set.

### Commands needed
python3

### Run it
Predicted confidently: `role_permissions` will be a valid dictionary with two `frozenset` keys.

### One sentence connecting to previous unit
Knowing how to create and manipulate sets is only half the battle; knowing when to choose them over other data structures is equally important.

## Concept Unit: When to use set vs. list vs. dict

### The Problem
You have tools like lists, dictionaries, and sets. When building a new feature, how do you decide which one to use? What is the performance penalty of choosing the wrong one?

### Introduce the concept in isolation
```python
data = [1, 2, 3, 4, 5, 5, 4, 3, 2, 1]

# Set comprehension
unique_squares = {x * x for x in data if x % 2 != 0}
print(unique_squares)
```
Output:
```text
{1, 9, 25}
```
This output proves that a **set comprehension** works exactly like a list comprehension but uses curly braces `{}` and automatically deduplicates the results, building a set in a single pass. It proves that filtering and mapping can be combined with deduplication concisely.

### Discard the throwaway
This code is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we need to extract unique error codes quickly.
- **Files affected**: `processor.py` (modified)
- **Change type**: Add
- **Location**: At the bottom of the file
- **Dependencies**: None

### The New Code
```python
logs = ["ERR_500", "INFO_200", "ERR_500", "ERR_404"]
unique_errors = {log for log in logs if log.startswith("ERR_")}
```

### The Updated Project
```python
11: role_permissions = {
12:     frozenset(["read", "write"]): "Editor",
13:     frozenset(["read"]): "Viewer"
14: }
15: logs = ["ERR_500", "INFO_200", "ERR_500", "ERR_404"] # ← new
16: unique_errors = {log for log in logs if log.startswith("ERR_")} # ← new
```
This structure creates a list of log messages and uses a set comprehension to extract and deduplicate only the error codes in one efficient step.

### Mechanical walkthrough
- `logs` is assigned a list literal containing four string elements.
- The `{ ... }` syntax initiates a set comprehension.
- `for log in logs` iterates over each element in the `logs` list.
- `if log.startswith("ERR_")` filters the iteration, selecting only strings that begin with `"ERR_"`.
- `log` (before the `for`) is the expression that determines what value is added to the set.
- `unique_errors` is assigned the resulting set, which automatically drops the duplicate `"ERR_500"`.

### CS lens
The concept here is Asymptotic Time Complexity. It appears in algorithm analysis (Big O notation), database query optimization (table scans vs index lookups), and load balancing (evaluating the cost of routing decisions under heavy traffic).

### SE lens
Design principle: Intentional Data Modeling. We could just use a list comprehension and cast it to a set later (`set([x for x in ...])`), but a set comprehension expresses the intent to build a set directly, and avoids allocating intermediate memory for the list. The tradeoff is that the set comprehension does not preserve the order of the logs.

### Commands needed
python3

### Run it
Predicted confidently: `unique_errors` will be a set containing `{"ERR_500", "ERR_404"}`.

### One sentence connecting to previous unit
Understanding the appropriate use cases for sets unifies all the operations and properties we've explored.

## Closing

### Connect the pieces
Let's trace these concepts through a practical scenario: processing email lists. If we have a list `['alice@x.com', 'bob@x.com', 'alice@x.com']`, converting it with `set(emails)` immediately gives us deduplication (`{'alice@x.com', 'bob@x.com'}`). If we have a second list of emails from a different department, we can find the common emails using set intersection (`emails1 & emails2`). If we need to find emails that are only in the first list but not the second, we use set difference (`emails1 - emails2`). We can mutate our primary set by dropping invalid emails with `emails.discard("invalid@x.com")` safely. If we need to use this set of verified emails as a cache key, we convert it to a `frozenset`. By understanding when to use a set—specifically when we care about membership and uniqueness rather than order—we replace slow O(n) list iterations with fast O(1) hash lookups, making our code more declarative, safer, and highly performant.
