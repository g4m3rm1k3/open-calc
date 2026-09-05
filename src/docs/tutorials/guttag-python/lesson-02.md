# Lesson 02: Variables, Assignment, and Names

What you will build: The reader understands that a Python variable is a NAME bound to an OBJECT, not a container. Assignment binds a name to an object. Rebinding changes what object the name refers to. Multiple names can bind to the same object. The transferable insight: Python variables are references, not boxes. This is why a = b; a = 99 does NOT change b. It is also why mutable aliasing surprises (a = []; b = a; b.append(1) DOES change a). Understanding this model eliminates an entire class of bugs.

What you need to know first: Lessons 00-01.

**Terms used in this lesson**
- **Variable** — A name that refers to an object in memory, not a container that holds a value. Exists to give a human-readable label to data so it can be referenced and manipulated.
- **Assignment** — The operation (`=`) that binds a name to an object. Exists to establish the reference between a label and the data.
- **Rebinding** — The act of pointing an existing name to a different object. Exists to update what a name refers to without modifying the original object.
- **Object Identity** — The unique memory address of an object, checked via `is`. Exists to distinguish between two objects that have the same value but live in different places in memory.
- **Aliasing** — When multiple names refer to the exact same object. Exists as a natural consequence of assignment by reference, allowing shared access to data without copying it.
- **Mutability** — The ability of an object to be changed in place (e.g., lists). Exists to allow efficient in-place updates of large data structures.
- **Garbage Collection** — The automatic process of freeing memory when an object has no more names bound to it. Exists to manage memory automatically without explicit deallocation by the programmer.
- **Name Mangling** — Python's convention of rewriting names starting with `__` to make them harder to access from outside a class. Exists to prevent accidental name collisions in subclasses.
- **snake_case** — The naming convention of using lowercase letters separated by underscores. Exists to make variable names readable and consistent across Python code.

**Objects and methods used**

**`id`**
- *What it is:* A built-in function that returns the unique integer identity of an object.
- *Implementation:* `def id(obj, /): ...` returning an integer (the memory address in CPython).
- *Its use:* Used here to prove whether two names refer to the exact same underlying object in memory.
- *Type:* Built-in function.
- *Responsibility:* Returns a unique and constant identifier for an object during its lifetime.
- *Depends on:* Any Python object passed as an argument.
- *Connects to:* Called by user code to inspect object identity; interacts with the Python runtime's memory management.
- *Shape:* A fundamental runtime introspection tool.

**`type`**
- *What it is:* A built-in function that returns the class type of an object.
- *Implementation:* `class type(object)` returning the type object.
- *Its use:* Used here to demonstrate that types belong to objects, not to the names bound to them.
- *Type:* Built-in class/function.
- *Responsibility:* Determines and returns the type of the given object.
- *Depends on:* Any Python object.
- *Connects to:* Called by user code for type checking and introspection.
- *Shape:* A fundamental runtime introspection tool.

**`list`**
- *What it is:* A built-in mutable sequence type, and its constructor.
- *Implementation:* `class list(iterable=(), /)` returning a new list object.
- *Its use:* Used here to demonstrate mutable objects and how aliasing affects them, and to create shallow copies.
- *Type:* Built-in class.
- *Responsibility:* Manages a mutable, ordered sequence of items.
- *Depends on:* An optional iterable to initialize the list.
- *Connects to:* Called by user code to group items; used widely across all Python programs as a primary data structure.
- *Shape:* Core data structure.

**`copy.copy`**
- *What it is:* A function from the `copy` module that creates a shallow copy of an object.
- *Implementation:* `def copy(x): ...` returning a new object of the same type.
- *Its use:* Used here to show how to deliberately break an alias by duplicating the object rather than sharing the reference.
- *Type:* Module-level function.
- *Responsibility:* Produces a shallow copy of the input object.
- *Depends on:* The object to be copied; requires `import copy`.
- *Connects to:* Called by user code to avoid unintended mutation of shared state.
- *Shape:* Utility function in the standard library.

**`__iadd__`**
- *What it is:* The magic method that implements in-place addition (e.g., `+=`).
- *Implementation:* `def __iadd__(self, other): ...` modifying `self` and returning it.
- *Its use:* Discussed here to explain why `+=` mutates lists in place but rebinds integers.
- *Type:* Instance method (dunder method).
- *Responsibility:* Implements augmented assignment, updating the object in place if possible.
- *Depends on:* The object itself and the value being added.
- *Connects to:* Invoked implicitly by the Python runtime when `+=` is used on an object.
- *Shape:* Protocol method defining core operator behavior.


## Concept Unit: Names and objects — binding vs. storing

### The Problem
When you assign a value to a variable in Python, what exactly is happening under the hood? Is the variable a box that now contains a value? If we create two variables with the same value, do we have two boxes or one? What would happen if we checked their underlying memory addresses?

### Introduce the concept in isolation
```python
x = 42
y = 42
print(id(x) == id(y))
print(type(x))
print(x is y)
```
Output:
```
True
<class 'int'>
True
```
This proves that Python variables are names bound to objects, not containers. Because of small int caching (CPython caches -5 to 256), both `x` and `y` are bound to the exact same object `42` in memory, which is an integer type. This is **Binding**.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating variable binding mechanics in our calculator.
- **Files affected**: `src/calc.py`
- **Change type**: add
- **Location**: Top of the file.
- **Dependencies**: None.

### The New Code
```python
default_value = 0
```

### The Updated Project
```python
# src/calc.py
1: default_value = 0 # <- new
```
This adds a module-level name bound to the integer object `0`.

### Mechanical walkthrough
- `default_value`: The name being declared and bound to an object.
- `=`: The assignment operator that performs the binding.
- `0`: The integer literal object created in memory (or retrieved from cache) to which the name is bound.

### CS lens
**Name Binding**: The association of a human-readable identifier with a lower-level construct like a memory address or an object. It appears in DNS (domain names to IP addresses), compilers (symbol tables mapping variable names to memory offsets), and environment variables in operating systems.

### SE lens
**Meaningful Naming**: We chose `default_value` instead of `x`. The design principle is self-documenting code. The tradeoff is typing a few extra characters versus making the code immediately understandable to the next reader without needing a comment.

### Commands needed
None for this unit.

### Run it
Predicted confidently: This simply assigns a variable in the script and produces no console output.

### One sentence connecting to previous unit
Now that we know how to bind names to objects, let's explore what happens when we want to change what a name points to.


## Concept Unit: Rebinding — names are not containers

### The Problem
If a variable is just a name bound to an object, what happens when we use the assignment operator again on the same variable? Does it overwrite the object in memory, or does it do something else? If we try to increment a number, are we modifying the number itself?

### Introduce the concept in isolation
```python
x = 1
old_id = id(x)
x = 2
print(id(x) == old_id)
x += 1
print(x)
```
Output:
```
False
3
```
This proves that assigning a new value to an existing name does not overwrite the original object; it binds the name to a completely new object. Even `x += 1` for an integer is just syntactic sugar for `x = x + 1`, causing a **Rebinding**. The original object `1` is unchanged (and may be garbage collected if no other names reference it).

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating rebinding.
- **Files affected**: `src/calc.py`
- **Change type**: add
- **Location**: After `default_value`.
- **Dependencies**: None.

### The New Code
```python
default_value = 1
```

### The Updated Project
```python
# src/calc.py
1: default_value = 0
2: default_value = 1 # <- new
```
This rebinds the existing name `default_value` to the new integer object `1`.

### Mechanical walkthrough
- `default_value`: The existing name being rebound.
- `=`: The assignment operator performing the new binding.
- `1`: The new integer object that `default_value` now points to.

### CS lens
**Immutability**: Integers in Python are immutable; they cannot be changed once created. Appears in functional programming languages (where all data is immutable), Git commits (which cannot be altered once written), and string pools in Java or C#.

### SE lens
**Reassignment vs Single Assignment**: Reusing a variable name for a new value is a design choice. The alternative is single-assignment (creating a new variable `default_value_2`). The tradeoff is saving variable names and memory overhead versus making the code's state harder to track over time.

### Commands needed
None for this unit.

### Run it
Predicted confidently: No output, it simply rebinds a variable.

### One sentence connecting to previous unit
Since rebinding changes the name's target but not the object, we must consider what happens if multiple names target the same object.


## Concept Unit: Multiple names, one object — aliasing

### The Problem
If we have a mutable object like a list, and we assign it to a new variable, do we get a copy of the list? What happens if we append an item to the new variable? Will the original variable see the change?

### Introduce the concept in isolation
```python
import copy
a = [1, 2, 3]
b = a
b.append(4)
print(a)
b = b + [5]
print(a)
c = copy.copy(a)
c.append(6)
print(a)
```
Output:
```
[1, 2, 3, 4]
[1, 2, 3, 4]
[1, 2, 3, 4]
```
This proves **Aliasing**. `b = a` means both names refer to the exact same list object. Mutating it via `b.append(4)` makes the change visible to `a`. However, `b = b + [5]` evaluates to a *new* list object and rebinds `b`, leaving `a` unchanged. Using `copy.copy(a)` creates a distinct shallow copy, so mutating `c` does not affect `a`.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating aliasing.
- **Files affected**: `src/calc.py`
- **Change type**: add
- **Location**: After the previous code.
- **Dependencies**: None.

### The New Code
```python
history = []
backup = history
```

### The Updated Project
```python
# src/calc.py
1: default_value = 0
2: default_value = 1
3: history = [] # <- new
4: backup = history # <- new
```
This creates a list and aliases it with two different names.

### Mechanical walkthrough
- `history`: A new name bound to a new empty list.
- `=`: Assignment operator.
- `[]`: Empty list literal, creating a new mutable list object.
- `backup`: Another new name.
- `=`: Assignment operator.
- `history`: Evaluates to the list object bound to `history`, which is then bound to `backup`.

### CS lens
**Shared Reference**: When multiple pointers or references point to the same memory location. Appears in database connection pools, shared memory in multithreading, and file hard links in UNIX file systems.

### SE lens
**Defensive Copying**: We created an alias. The alternative is defensive copying (e.g., `backup = history[:]`). The tradeoff is performance (avoiding copying data) versus safety (preventing unintended side effects when one part of the system modifies shared state).

### Commands needed
None for this unit.

### Run it
Predicted confidently: No output, it just creates a list and an alias.

### One sentence connecting to previous unit
Understanding aliasing is crucial when dealing with operations that might either mutate an object in place or return a completely new one.


## Concept Unit: Augmented assignment and mutability

### The Problem
We've seen `x += 1` rebind `x` when dealing with integers. But what happens if we use `+=` on a mutable object like a list? Does it rebind the name to a new list, or does it mutate the existing list in place? How does this affect aliased variables?

### Introduce the concept in isolation
```python
def f_int(n):
    n += 1

def f_list(lst):
    lst += [1]

x = 0
f_int(x)
print(x)

my_list = []
f_list(my_list)
print(my_list)
```
Output:
```
0
[1]
```
This proves that `+=` behaves differently based on mutability. For integers (immutable), `n += 1` rebinds the local name `n`, leaving the caller's `x` unchanged. For lists (mutable), `lst += [1]` calls `__iadd__`, mutating the list in place, which modifies the caller's list. This difference is a major source of **Mutability** bugs.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating augmented assignment on mutable types.
- **Files affected**: `src/calc.py`
- **Change type**: add
- **Location**: After the alias creation.
- **Dependencies**: None.

### The New Code
```python
history += [default_value]
```

### The Updated Project
```python
# src/calc.py
1: default_value = 0
2: default_value = 1
3: history = []
4: backup = history
5: history += [default_value] # <- new
```
This mutates the list bound to `history` (and consequently `backup`) in place by appending `1`.

### Mechanical walkthrough
- `history`: The name bound to the list object.
- `+=`: Augmented assignment operator; for lists, it maps to `__iadd__` and mutates in place.
- `[` and `]`: List literal syntax for the right-hand side.
- `default_value`: The name evaluating to the integer `1`.

### CS lens
**In-place Modification**: Modifying a data structure directly in memory rather than allocating a new one. Appears in sorting algorithms (like Quicksort), graphics buffers, and memory-mapped files.

### SE lens
**Pure Functions vs Side Effects**: Modifying an object passed as an argument is a side effect. The alternative is returning a new object (a pure function). Tradeoff is performance (in-place is faster and uses less memory) versus predictability (pure functions are easier to test and reason about).

### Commands needed
None for this unit.

### Run it
Predicted confidently: No output, it just mutates the list.

### One sentence connecting to previous unit
As our codebase grows with these variables, we must follow rules and conventions to name them appropriately so we don't confuse ourselves or others.


## Concept Unit: Variable naming rules and conventions

### The Problem
We need to name our variables, but can we name them whatever we want? What if we start a name with a number, or use a keyword like `if`? And even if a name is technically legal, how do we write it so it matches what other Python developers expect?

### Introduce the concept in isolation
```python
_private_var = 10
MAX_RETRIES = 3
user_age = 25
print(user_age)
```
Output:
```
25
```
This proves the conventions in Python. Variable names must start with a letter or underscore, contain only letters, digits, or underscores, and are case-sensitive. We use **snake_case** for regular variables (`user_age`), UPPER_SNAKE for constants (`MAX_RETRIES`), and a leading underscore to indicate a variable is meant for internal use (`_private_var`). Double leading underscores (`__name`) invoke name mangling in classes.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating variable naming.
- **Files affected**: `src/calc.py`
- **Change type**: add
- **Location**: Bottom of the file.
- **Dependencies**: None.

### The New Code
```python
_execution_count = 0
```

### The Updated Project
```python
# src/calc.py
1: default_value = 0
2: default_value = 1
3: history = []
4: backup = history
5: history += [default_value]
6: _execution_count = 0 # <- new
```
This adds a "private" variable to track internal state using snake_case and a leading underscore.

### Mechanical walkthrough
- `_execution_count`: A new variable name. The leading `_` signals by convention that it's private. The `snake_case` format makes multiple words readable.
- `=`: Assignment operator binding the name.
- `0`: The integer object.

### CS lens
**Lexical Rules**: The rules defined by a language's grammar that dictate valid tokens. Appears in regex parsers, configuration file formats (like JSON or YAML keys), and database table naming schemas.

### SE lens
**Convention over Configuration**: Adopting a standard like snake_case means developers don't have to debate or document naming rules per project. The alternative is mixed conventions or strict tooling constraints. The tradeoff is relying on developer discipline versus enforcing rules with a linter.

### Commands needed
None for this unit.

### Run it
Predicted confidently: No output. It successfully binds the conventionally named variable.

### One sentence connecting to previous unit
With a firm grasp on how names bind to objects and how to write them correctly, we can now see the entire picture of Python variables in action.


## Closing
### Connect the pieces
Let's trace a simple sequence to lock in exactly what we've learned: `x = 3; y = x; x = 99; print(y)`.
1. `x = 3`: We create an integer object `3` and bind the name `x` to it. (Names and objects — binding vs. storing)
2. `y = x`: We take the object `x` is bound to (`3`) and also bind the name `y` to it. Now `x` and `y` are aliases for the exact same integer object. (Multiple names, one object — aliasing)
3. `x = 99`: We create a new integer object `99` and rebind `x` to it. This is a rebinding operation on the name `x`, not a mutation of the object `3`. (Rebinding — names are not containers)
4. `print(y)`: The name `y` was never rebound. It still points to the integer object `3`. (Augmented assignment and mutability proves integers are immutable, so `3` could not have changed in place).
This is why `y` is still `3`. Variables are references to objects, not boxes containing values. Assignment changes what the reference points to, and multiple references can point to the same object simultaneously.
