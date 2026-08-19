# Lesson 2: Variables, Assignment, and Names

What you will build: The reader will understand what a variable is (a name bound to an object), how assignment works in Python's object model, augmented assignment, multiple assignment, `id()` and object identity, and the dangers of shadowing built-ins. The transferable problems: (1) in Python, variables are not boxes that hold values — they are names that POINT TO objects; this distinction matters when you assign `b = a` and then modify the object; (2) augmented assignment (`+=`, `-=`, etc.) is shorthand but has subtleties with immutable vs mutable objects; (3) shadowing built-in names (`list`, `dict`, `print`) is a silent bug that breaks your code in confusing ways.

What you need to know first: Lesson 0 (REPL, arithmetic, print, type), Lesson 1 (int, float, bool, str, None, type conversion).

Terms used in this lesson:
- **Variable** — A name that is bound to an object in memory. In Python, variables are not containers or boxes; they are labels or references that point to an object.
- **Assignment** — The process of binding a name to an object. The `=` operator evaluates the expression on the right, creates or finds the resulting object, and binds the name on the left to it.
- **Object** — A piece of data in memory with a type, a value, and a unique identity. 
- **Immutable** — An object whose value cannot be changed after it is created. Integers, floats, strings, and booleans are immutable.
- **Mutable** — An object whose state or value can be changed in place after creation (e.g., lists, dicts).
- **Identifier** — A valid name for a variable, function, class, etc. Must start with a letter or underscore, and contain only letters, digits, or underscores.
- **Keyword** — A reserved word in Python that has special meaning and cannot be used as a variable name (e.g., `True`, `def`, `if`).
- **Tuple Unpacking** — The ability to assign multiple names to multiple values in a single statement by unpacking an iterable (like a tuple) on the right side into a sequence of names on the left.
- **Augmented Assignment** — Shorthand operators (like `+=`, `-=`) that combine an arithmetic operation with assignment. 
- **Shadowing** — Reusing a built-in name (like `list` or `print`) for a local variable, which hides the built-in function and makes it inaccessible in that scope.

Objects and methods used:
- **`id`**
  - *What it is:* A built-in function that returns the unique identity of an object.
  - *Implementation:* `id(object) -> integer`
  - *Its use:* Used to demonstrate whether two variable names point to the exact same object in memory.
  - *Type:* Built-in function.
  - *Responsibility:* Returns a unique integer identifying the object during its lifetime. In CPython, this is typically the memory address.
  - *Depends on:* An object passed as an argument.
  - *Connects to:* Called by user code to inspect object identity.
  - *Shape:* A fundamental built-in utility available globally.
- **`keyword.kwlist`**
  - *What it is:* A list of all reserved keywords in the current Python version.
  - *Implementation:* `kwlist` is a list of strings within the `keyword` module.
  - *Its use:* Used to show which names are forbidden as identifiers.
  - *Type:* Module attribute (list of strings).
  - *Responsibility:* Maintains the definitive list of reserved keywords for the Python parser.
  - *Depends on:* The `keyword` module being imported.
  - *Connects to:* Accessed by developers or tools to check for keyword validity.
  - *Shape:* A static data structure provided by the standard library.
- **`del`**
  - *What it is:* A statement used to delete a name binding or elements from a container.
  - *Implementation:* `del target`
  - *Its use:* Used to remove a variable name from the current namespace, unbinding it from its object.
  - *Type:* Language statement / keyword.
  - *Responsibility:* Removes the binding between a name and an object. If it is the last reference, the object may be garbage collected.
  - *Depends on:* An existing bound name.
  - *Connects to:* Interacts with the local or global namespace dictionary.
  - *Shape:* Core language syntax for namespace management.

## Concept Unit: What a variable is — names and objects

### The Problem
When programming, you need a way to store data and refer to it later. If you calculate `42 * 10`, how do you keep that result so you can use it in the next step?

> **Socratic prompt:** If you write `x = 42` in Python, what do you think actually happens behind the scenes? Is Python creating a box named "x" and putting the number 42 inside it, or is it doing something else? 

### Introduce the concept in isolation
```python
>>> x = 42
>>> x
42
>>> y = x
>>> y
42
>>> x = 100
>>> x
100
>>> y
42
```
This demonstrates that variables in Python are **names bound to objects**. The statement `x = 42` does NOT create a box named `x` and put 42 in it. It creates the integer object `42` in memory, and binds the name `x` to that object. `y = x` binds the name `y` to the SAME object as `x`. Then `x = 100` rebinds `x` to a new object (`100`) — `y` still points to `42`. This is the crucial distinction from some other languages. For **immutable** objects (int, float, str, bool), this distinction is safe — you can't modify the integer 42 in place. For **mutable** objects (lists, dicts), it matters enormously (covered in Lessons 7 and 9).

### Discard the throwaway example
This throwaway REPL session is discarded and will not appear in our project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating core language mechanics in the REPL.
- **Files affected:** None (REPL session).
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** Python 3.12 REPL.

### The New Code
```python
x = 42
```

### The Updated Project
```python
# In the REPL
>>> x = 42
```
This creates an integer object 42 and binds the name `x` to it.

### Mechanical walkthrough
- `x` is the variable name (identifier) being bound.
- `=` is the assignment operator. It evaluates the right side first, then binds the name on the left.
- `42` is an integer literal. It evaluates to an integer object in memory.

## Concept Unit: `id()` — the identity of an object

### The Problem
How can we prove that `x` and `y` are pointing to the exact same object in memory, rather than just two different objects that both happen to have the value 42?

> **Socratic prompt:** How might a programming language tell the difference between "two things that look the same" and "literally the exact same thing"?

### Introduce the concept in isolation
```python
>>> x = 42
>>> id(x)
140234567890
>>> y = 42
>>> id(y)
140234567890
>>> z = 1000
>>> w = 1000
>>> id(z) == id(w)
False
>>> x is y
True
>>> z is w
False
```
This demonstrates `id()` and the `is` operator. `id()` returns the memory address (identity) of an object. The `is` operator checks if two names point to the SAME object (same id). The `==` operator checks if two objects have the SAME VALUE. For small integers (-5 to 256), Python reuses objects as an optimization, so `42 is 42` is True. For large integers, `1000 is 1000` is False in general. 

### Discard the throwaway example
This throwaway code is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** Python 3.12 REPL.

### The New Code
```python
id(x)
```

### The Updated Project
```python
>>> x = 42
>>> id(x)
140234567890
```
This shows the unique identity of the object `x` points to.

### Mechanical walkthrough
- `id` is a built-in function that returns an object's unique integer identity.
- `(` and `)` enclose the arguments for the function call.
- `x` is the variable passed as an argument.

## Concept Unit: Valid variable names — identifiers and keywords

### The Problem
What rules govern what you can name a variable? Can you name it `2bad` or `True`?

> **Socratic prompt:** Try to guess what happens if you name a variable `1st_place = "John"`.

### Introduce the concept in isolation
```python
>>> my_variable = 5
>>> _private = 10
>>> CamelCase = 15
>>> 2bad = 3
SyntaxError: invalid decimal literal
>>> import keyword
>>> keyword.kwlist
['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
 'while', 'with', 'yield']
```
This demonstrates that a valid **identifier** starts with a letter or underscore, followed by letters, digits, or underscores. **Keywords** are reserved and cannot be used as variable names. By convention, use `snake_case` for variables, `CamelCase` for classes, and `ALL_CAPS` for constants.

### Discard the throwaway example
This code is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** Python 3.12 REPL.

### The New Code
```python
my_variable = 5
```

### The Updated Project
```python
>>> my_variable = 5
```
A valid assignment using a proper identifier.

### Mechanical walkthrough
- `my_variable` is an identifier starting with a letter and containing an underscore.
- `=` is the assignment operator.
- `5` is an integer literal.

## Concept Unit: Multiple assignment and swap

### The Problem
How do you swap the values of two variables? In many languages, you need a temporary variable to hold one value so it isn't overwritten.

> **Socratic prompt:** If `a = 10` and `b = 20`, what happens if you just write `a = b` and then `b = a`?

### Introduce the concept in isolation
```python
>>> a, b = 10, 20
>>> a
10
>>> b
20
>>> a, b = b, a
>>> a
20
>>> b
10
>>> x = y = z = 0
>>> x, y, z
(0, 0, 0)
```
This demonstrates **multiple assignment** and swap. `a, b = 10, 20` is **tuple unpacking** — the right side creates a tuple `(10, 20)`, then Python assigns the first element to `a` and the second to `b`. The swap `a, b = b, a` works because the right side is fully evaluated BEFORE any assignment happens. Python evaluates `(b, a)` = `(20, 10)` and then assigns. This is atomic: no temporary variable needed. `x = y = z = 0` is chain assignment.

### Discard the throwaway example
This throwaway is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** Python 3.12 REPL.

### The New Code
```python
a, b = b, a
```

### The Updated Project
```python
>>> a, b = 10, 20
>>> a, b = b, a
```
The variables' bindings are swapped atomically.

### Mechanical walkthrough
- `a, b` on the left is a sequence of variable names to unpack into.
- `=` is the assignment operator.
- `b, a` on the right is evaluated first as a tuple, capturing the current bindings.

## Concept Unit: Augmented assignment

### The Problem
Updating a variable based on its current value (e.g., adding 5 to a score) is extremely common. Writing `score = score + 5` feels repetitive. Is there a shorter way?

> **Socratic prompt:** If `x = 10`, what do you think `x += 5` does?

### Introduce the concept in isolation
```python
>>> x = 10
>>> x += 5
>>> x
15
>>> x -= 3
>>> x
12
>>> x *= 2
>>> x
24
>>> x //= 5
>>> x
4
>>> x **= 3
>>> x
64
```
This demonstrates **augmented assignment**. `x += 5` is shorthand for `x = x + 5`. For immutable objects (int, str), this rebinds the name to a new object. For mutable objects (list), `+=` modifies the object in place (using the list's `__iadd__` method).

### Discard the throwaway example
This is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** Python 3.12 REPL.

### The New Code
```python
x += 5
```

### The Updated Project
```python
>>> x = 10
>>> x += 5
```
Updates `x` by binding it to the result of `x + 5`.

### Mechanical walkthrough
- `x` is the variable being modified.
- `+=` is the augmented assignment operator for addition. It evaluates `x + 5` and then rebinds `x` to the result.
- `5` is the value to add.

## Concept Unit: Shadowing built-in names — a silent danger

### The Problem
Python has many built-in functions like `print`, `list`, and `type`. What happens if you accidentally use one of those names for your own variable?

> **Socratic prompt:** What would occur if you wrote `print = 5` and then tried to call `print("Hello")`?

### Introduce the concept in isolation
```python
>>> list([1, 2, 3])
[1, 2, 3]
>>> list = [1, 2, 3]
>>> list([4, 5, 6])
TypeError: 'list' object is not callable
>>> del list
>>> list([4, 5, 6])
[4, 5, 6]
```
This demonstrates **shadowing**. Python has no protection against this — it silently rebinds the name `list` to your new object (the list `[1, 2, 3]`). The built-in `list` function is now shadowed and inaccessible in this scope. The bug is confusing because the error (`'list' object is not callable`) appears later, when you try to use it as a function. Never shadow built-ins like `list`, `dict`, `set`, `str`, `print`, etc.

### Discard the throwaway example
This code is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** Python 3.12 REPL.

### The New Code
```python
list = [1, 2, 3]
```

### The Updated Project
```python
>>> list = [1, 2, 3]
```
This shadows the built-in `list` identifier.

### Mechanical walkthrough
- `list` is the identifier being bound. Here, it overwrites the reference to the built-in type.
- `=` is the assignment operator.
- `[1, 2, 3]` is a list literal.

## Concept Unit: `del` — removing a name binding

### The Problem
If you accidentally shadow a built-in like `list`, or if you simply want to remove a variable name so it can no longer be used, how do you get rid of it?

> **Socratic prompt:** If you delete a variable name, does the object it pointed to get destroyed immediately?

### Introduce the concept in isolation
```python
>>> x = 42
>>> x
42
>>> del x
>>> x
NameError: name 'x' is not defined
```
This demonstrates the `del` statement. `del x` removes the name binding from the namespace. It does NOT necessarily destroy the object — if another name points to the same object, the object lives on. Python's garbage collector reclaims memory when no names point to an object.

### Discard the throwaway example
Discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** Python 3.12 REPL.

### The New Code
```python
del x
```

### The Updated Project
```python
>>> x = 42
>>> del x
```
Removes the name `x`.

### Mechanical walkthrough
- `del` is a keyword statement that unbinds a name.
- `x` is the identifier being unbound.

---
Closing: variables in Python are name bindings — not boxes. This distinction becomes critical when you start using mutable objects (lists, dicts) in Lessons 7 and 9. Lesson 3 covers conditionals: how to make your program choose between different paths. 

Exercises: 
- without running it first, predict the output of `a, b = 1, 2; a, b = a + b, a - b; print(a, b)`
- explain what happens to the integer object 42 when you run `x = 42; x = 100`.
