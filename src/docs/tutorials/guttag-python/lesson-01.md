# Lesson 01: Types — int, float, bool, str, and None

What you will build: The reader understands Python's five fundamental scalar types, their literal syntax, the type() function, and how Python distinguishes values from their type containers. The transferable insight: a type is a set of values plus the operations defined on them. Every programming language's type system is a contract between programmer and runtime about which operations are valid.

What you need to know first: Lesson 00.

Terms used in this lesson:
- **Type** — a set of values plus the operations defined on them, representing a contract between programmer and runtime about which operations are valid.
- **Literal** — the syntactic representation of a value directly in source code.
- **Arbitrary precision** — the ability of a number representation to grow to accommodate any value without overflowing, bounded only by available memory.
- **IEEE 754 double precision** — the standard for representing floating-point numbers in computers, inherently involving approximations.
- **Truthy/falsy** — the boolean evaluation of non-boolean values when used in conditional contexts.
- **Short-circuit evaluation** — a logical operation semantics where the second argument is executed or evaluated only if the first argument does not suffice to determine the value of the expression.
- **Immutability** — the property of an object whose state cannot be modified after it is created.
- **F-string** — formatted string literals that allow expression interpolation directly within strings.
- **Singleton** — a design pattern and language feature where only one instance of a particular class or value exists.
- **Sentinel** — a specific value used to indicate the end of a sequence, an uninitialized state, or a default condition.

Objects and methods used:
- **`type()`**
  - *What it is:* A built-in function that returns the type of an object.
  - *Implementation:* `def type(object) -> type`
  - *Its use:* Used to inspect and prove the runtime type of literals and values.
  - *Type:* Built-in function.
  - *Responsibility:* Identifies and returns the class of the given object, exposing Python's dynamic type system.
  - *Depends on:* Any Python object passed as an argument.
  - *Connects to:* Called by the programmer, returns a `type` object.
  - *Shape:* Core runtime API boundary.
- **`int()`**
  - *What it is:* A built-in function to construct an integer from a number or string.
  - *Implementation:* `def int(x=0) -> int`
  - *Its use:* Used to convert floats, booleans, or strings into integer representation.
  - *Type:* Built-in class/constructor.
  - *Responsibility:* Parses strings or truncates floats to create integer values.
  - *Depends on:* A valid number or convertible string.
  - *Connects to:* Returns an `int` object.
  - *Shape:* Core type conversion API.
- **`float()`**
  - *What it is:* A built-in function to construct a floating-point number.
  - *Implementation:* `def float(x=0.0) -> float`
  - *Its use:* Used to convert integers or strings into floats.
  - *Type:* Built-in class/constructor.
  - *Responsibility:* Parses strings or promotes integers to IEEE 754 double precision floats.
  - *Depends on:* A valid number or convertible string.
  - *Connects to:* Returns a `float` object.
  - *Shape:* Core type conversion API.
- **`str()`**
  - *What it is:* A built-in function to construct a string representation of an object.
  - *Implementation:* `def str(object='') -> str`
  - *Its use:* Used to convert numbers and other objects into text sequences.
  - *Type:* Built-in class/constructor.
  - *Responsibility:* Generates a human-readable text representation of an object.
  - *Depends on:* Any Python object.
  - *Connects to:* Returns a `str` object.
  - *Shape:* Core text rendering API.
- **`bool()`**
  - *What it is:* A built-in function to convert a value to a boolean.
  - *Implementation:* `def bool(x=False) -> bool`
  - *Its use:* Used to evaluate the truthiness of integers, floats, strings, or None.
  - *Type:* Built-in class/constructor.
  - *Responsibility:* Evaluates whether an object is truthy or falsy according to Python's rules.
  - *Depends on:* Any Python object.
  - *Connects to:* Returns `True` or `False`.
  - *Shape:* Core logical evaluation API.
- **`len()`**
  - *What it is:* A built-in function that returns the length of a sequence or collection.
  - *Implementation:* `def len(s) -> int`
  - *Its use:* Used to determine the number of characters in a string.
  - *Type:* Built-in function.
  - *Responsibility:* Counts and returns the number of items in a container.
  - *Depends on:* A sequence or collection (like a string).
  - *Connects to:* Returns an `int`.
  - *Shape:* Core sequence API.

Everything else in the file, not this lesson's subject but still explained:
- **`print()`**
  - *What it is:* A built-in function to display output.
  - *Implementation:* `def print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)`
  - *Its use:* Used to display the results of our evaluations.
  - *Type:* Built-in function.
  - *Responsibility:* Writes string representations of objects to standard output.
  - *Depends on:* The objects to print.
  - *Connects to:* Standard output stream.
  - *Shape:* Core I/O API.

## Concept Unit: int — whole numbers

### The Problem
When we want to count items or perform exact mathematical arithmetic like calculating combinations, we need a way to represent whole numbers. How can we ensure the numbers don't lose precision if they get very large? What would happen if we used approximations for counting exact discrete items?

### Introduce the concept in isolation
```python
print(type(42))
print(2**1000)
```
**Output:**
```
<class 'int'>
10715086071862673209484250490600018105614048117055336074437503883703510511249361224931983788156958581275946729175531468251871452856923140435984577574698574803934567774824230985421074605062371141877954182153046474983581941267398767559165543946077062914571196477686542167660429831652624386837205668069376
```
This output proves that the literal `42` is of the **int** type, and that Python handles arbitrarily large whole numbers perfectly without overflow.

### Discard the throwaway
The throwaway example code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `types_demo.py` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: none

### The New Code
```python
x = 42
y = 1_000_000
z = -7
print(x + y * z)
print(7 // 2)
print(7 % 2)
```

### The Updated Project
```python
1: x = 42 // <- new
2: y = 1_000_000 // <- new
3: z = -7 // <- new
4: print(x + y * z) // <- new
5: print(7 // 2) // <- new
6: print(7 % 2) // <- new
```
We have established a script that assigns integer literals to variables and performs exact arithmetic operations on them.

### Mechanical walkthrough
- `x = 42`: We assign the literal integer `42` to the variable `x`.
- `y = 1_000_000`: We assign the literal integer `1_000_000` (using underscores for readability) to the variable `y`.
- `z = -7`: We assign the literal negative integer `-7` to the variable `z`.
- `print(...)`: We call the `print` function.
- `x + y * z`: We evaluate a mathematical expression using addition `+` and multiplication `*`. Multiplication takes precedence.
- `7 // 2`: We use floor division `//`, which divides 7 by 2 and truncates the fractional part, yielding the integer 3.
- `7 % 2`: We use the modulo operator `%`, which returns the remainder of 7 divided by 2, yielding the integer 1.

### CS lens
The fundamental CS concept is **arbitrary-precision arithmetic**. In many languages, integers are fixed to 32 or 64 bits and will "overflow" (wrap around to negative numbers) if they exceed that limit. Real-world places this appears: cryptography (where 2048-bit numbers are standard), astronomical calculations, financial accounting of vast sums, and scientific computing frameworks that require exact combinatorial counting.

### SE lens
The design principle here is favoring correctness and developer ergonomics over raw hardware performance. Python dynamically allocates more memory for integers as they grow. The alternative NOT chosen was fixed-width integers (like C's `int` or Java's `int`). The real tradeoff is that while Python prevents overflow bugs, math operations on very large integers are significantly slower than fixed-width arithmetic that runs directly in CPU registers.

### Commands needed
`python types_demo.py`

### Run it
Predicted confidently: The output will first show `-6999958`, then `3`, then `1`.

### One sentence connecting to previous unit
While integers are perfect for exact counting, they cannot represent continuous values like measurements or fractions, which requires a different type.

## Concept Unit: float — approximations of real numbers

### The Problem
If we divide 3 by 2 exactly, the result is 1.5, which is not a whole number. How can we represent parts of a whole, percentages, or real-world measurements like distance and weight? Why might it be dangerous to use these numbers for precise financial calculations?

### Introduce the concept in isolation
```python
print(type(3.14))
print(0.1 + 0.2)
```
**Output:**
```
<class 'float'>
0.30000000000000004
```
This output proves that decimal literals are of the **float** type, and it reveals the classic floating-point trap: approximations of real numbers can lead to small precision errors due to the underlying binary representation.

### Discard the throwaway
The throwaway example code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `types_demo.py` (modified)
- **Change type**: add
- **Location**: appended to the end of the file
- **Dependencies**: none

### The New Code
```python
pi = 3.14
gravity = 9.81e-1
print(1 + 1.0)
```

### The Updated Project
```python
1: x = 42
2: y = 1_000_000
3: z = -7
4: print(x + y * z)
5: print(7 // 2)
6: print(7 % 2)
7: pi = 3.14 // <- new
8: gravity = 9.81e-1 // <- new
9: print(1 + 1.0) // <- new
```
We added floating-point literals, including one in scientific notation, and demonstrated mixed-type arithmetic.

### Mechanical walkthrough
- `pi = 3.14`: We assign a standard floating-point decimal literal to `pi`.
- `gravity = 9.81e-1`: We use scientific notation (`e-1` means times 10 to the power of -1) to assign a float equivalent to 0.981.
- `print(...)`: We invoke the `print` function.
- `1 + 1.0`: We add an `int` and a `float`. Python automatically promotes the integer to a float (`1.0`) so the operation can proceed without data loss.

### CS lens
The fundamental CS concept is **floating-point arithmetic**, specifically IEEE 754 double precision. Computers represent floats in base-2, which means fractions like 1/10 cannot be represented finitely (just as 1/3 cannot be represented finitely in base-10). Real-world places this appears: physics engines in games, 3D graphics rendering, machine learning neural networks, and GPS coordinate calculations.

### SE lens
The design principle is interoperability through automatic type promotion. Python implicitly converts integers to floats in mixed expressions. The alternative NOT chosen was strict typing that requires explicit casting (like OCaml, where you cannot write `1 + 1.0`). The real tradeoff is convenience versus predictability; automatic promotion saves typing but can sometimes mask subtle bugs if a developer expected an integer division result to remain an integer.

### Commands needed
`python types_demo.py`

### Run it
Predicted confidently: The output will print `2.0`, showing the integer was promoted to a float.

### One sentence connecting to previous unit
Numbers are useful for calculation, but programming also requires making decisions based on whether a condition is true or false.

## Concept Unit: bool — truth values

### The Problem
How does a program decide whether to run a piece of code or skip it? We need a way to mathematically represent the concepts of "yes" and "no" or "on" and "off." What happens if we try to treat non-boolean values as truth?

### Introduce the concept in isolation
```python
print(type(True))
print(True == 1)
print(bool(0))
print(bool("text"))
```
**Output:**
```
<class 'bool'>
True
False
True
```
This output proves that `True` and `False` are of the **bool** type, that `bool` is technically a subclass of `int` (where True is 1), and that Python dynamically evaluates empty/zero values as "falsy" and populated values as "truthy".

### Discard the throwaway
The throwaway example code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `types_demo.py` (modified)
- **Change type**: add
- **Location**: appended to the end of the file
- **Dependencies**: none

### The New Code
```python
is_active = True
is_empty = False
print(is_active and not is_empty)
print(is_active or (1 / 0))
```

### The Updated Project
```python
7: pi = 3.14
8: gravity = 9.81e-1
9: print(1 + 1.0)
10: is_active = True // <- new
11: is_empty = False // <- new
12: print(is_active and not is_empty) // <- new
13: print(is_active or (1 / 0)) // <- new
```
We added boolean logic demonstrating `and`, `not`, and the short-circuiting behavior of `or`.

### Mechanical walkthrough
- `is_active = True`: We assign the literal boolean `True` to a variable.
- `is_empty = False`: We assign the literal boolean `False`.
- `print(...)`: We output the result of boolean expressions.
- `is_active and not is_empty`: We use the `and` operator to require both sides to be true, and the `not` operator to invert `is_empty` from False to True.
- `is_active or (1 / 0)`: We use the `or` operator. Because `is_active` is `True`, the expression is guaranteed to be true.
- `(1 / 0)`: This division by zero would normally crash the program, but due to **short-circuit evaluation**, Python never executes it.

### CS lens
The fundamental CS concept is **Boolean algebra**. It is the mathematical foundation of all digital logic. Real-world places this appears: logic gates in CPU hardware, search engine query syntax (AND, OR, NOT), database filtering (SQL WHERE clauses), and permissions systems (access control lists).

### SE lens
The design principle is defensive execution via short-circuiting. The alternative NOT chosen was eager evaluation, where both sides of an `or` or `and` are evaluated before the operator is applied. The real tradeoff is that short-circuiting allows developers to guard unsafe operations (like dividing by zero, or accessing a null pointer) on the right side of a boolean expression safely, but any side-effects (like modifying a variable or printing) placed on the right side are not guaranteed to execute.

### Commands needed
`python types_demo.py`

### Run it
Predicted confidently: The output will print `True` for the first print, and `True` again for the second without throwing a ZeroDivisionError.

### One sentence connecting to previous unit
While booleans control logic and numbers control math, we need another type to handle the text we display to human users.

## Concept Unit: str — immutable text sequences

### The Problem
How do we represent names, messages, or whole documents inside our code? If we need to build a dynamic message that includes a number, how do we combine text and variables safely? What does it mean that a string cannot be changed once created?

### Introduce the concept in isolation
```python
print(type("hello"))
s = "word"
print(s[0])
print(s[1:3])
```
**Output:**
```
<class 'str'>
w
or
```
This output proves that quoted text is of the **str** type, and that strings are sequences that can be indexed to retrieve single characters or sliced to retrieve substrings.

### Discard the throwaway
The throwaway example code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `types_demo.py` (modified)
- **Change type**: add
- **Location**: appended to the end of the file
- **Dependencies**: none

### The New Code
```python
greeting = "Hello"
target = 'World'
message = f"{greeting}, {target}!"
print(message * 2)
print(len(message))
```

### The Updated Project
```python
10: is_active = True
11: is_empty = False
12: print(is_active and not is_empty)
13: print(is_active or (1 / 0))
14: greeting = "Hello" // <- new
15: target = 'World' // <- new
16: message = f"{greeting}, {target}!" // <- new
17: print(message * 2) // <- new
18: print(len(message)) // <- new
```
We added strings using single quotes, double quotes, and f-strings, and demonstrated string repetition and length calculation.

### Mechanical walkthrough
- `greeting = "Hello"`: We define a string literal using double quotes.
- `target = 'World'`: We define a string literal using single quotes (they are functionally identical in Python).
- `message = f"{greeting}, {target}!"`: We define an **f-string** (formatted string literal) by prefixing the string with `f`. The curly braces `{}` interpolate the variables directly into the text.
- `print(...)`: We output the constructed strings.
- `message * 2`: We use the repetition operator `*` on a string, which concatenates the string with itself.
- `len(message)`: We call the built-in `len` function to count the exact number of characters in the `message` string.

### CS lens
The fundamental CS concept is the **immutable sequence**. A string is not a single value but an array of characters in memory. Because it is immutable, modifying a string actually allocates a completely new string in memory. Real-world places this appears: file paths, DNA sequences in bioinformatics, text parsers/lexers, and network protocol payloads (like HTTP headers).

### SE lens
The design principle is memory safety and predictability via immutability. The alternative NOT chosen was mutable strings (like C arrays or Ruby's default strings), where you could overwrite the 5th character of a string in place. The real tradeoff is that immutable strings are safe to share across different parts of a program or multiple threads without fear of them changing unexpectedly, but repeatedly modifying or appending to a string inside a large loop creates severe performance overhead due to constant memory reallocation.

### Commands needed
`python types_demo.py`

### Run it
Predicted confidently: The output will print `Hello, World!Hello, World!` and then `13` (the length of "Hello, World!").

### One sentence connecting to previous unit
Sometimes a variable is defined but has no text, no number, and no truth value—it simply holds nothing at all.

## Concept Unit: None — the absence of a value

### The Problem
How do you explicitly state that a variable is empty without using arbitrary magic numbers like 0 or empty strings like ""? If a function doesn't return anything, what does it actually give back?

### Introduce the concept in isolation
```python
print(type(None))
x = None
print(x is None)
```
**Output:**
```
<class 'NoneType'>
True
```
This output proves that `None` is of the **NoneType** type. It also proves that we use the `is` operator, not `==`, to check for None, because None is a singleton (there is only one instance of it in the entire running program).

### Discard the throwaway
The throwaway example code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a standalone theory lesson.
- **Files affected**: `types_demo.py` (modified)
- **Change type**: add
- **Location**: appended to the end of the file
- **Dependencies**: none

### The New Code
```python
def do_nothing():
    pass

result = do_nothing()
print(result is None)
```

### The Updated Project
```python
14: greeting = "Hello"
15: target = 'World'
16: message = f"{greeting}, {target}!"
17: print(message * 2)
18: print(len(message))
19: def do_nothing(): // <- new
20:     pass // <- new
21:  // <- new
22: result = do_nothing() // <- new
23: print(result is None) // <- new
```
We define a function that performs no action and show that capturing its result yields `None`.

### Mechanical walkthrough
- `def do_nothing():`: We define a new function using the `def` keyword.
- `pass`: A keyword that does literally nothing, used as a structural placeholder because Python requires an indented block.
- `result = do_nothing()`: We call the function and assign its return value to `result`. Because the function has no explicit `return` statement, it implicitly returns `None`.
- `print(...)`: We output the result of the identity check.
- `result is None`: We use the `is` operator to check if `result` refers to the exact same object in memory as the `None` singleton, which evaluates to `True`.

### CS lens
The fundamental CS concept is the **null pointer or sentinel value**. It represents the deliberate absence of a reference or value. Real-world places this appears: linked lists (the final node points to null), database records (NULL for a missing column value), optional configuration settings, and binary search trees (leaf nodes pointing to null).

### SE lens
The design principle is the Null Object pattern or explicit void returns. The alternative NOT chosen was having functions return an uninitialized memory state or crash if no return is specified (as in older low-level languages). The real tradeoff is that having `None` as a valid object prevents immediate crashes when reading an unreturned value, but shifts the burden to the developer to constantly check if variables `is None` before trying to use them (often leading to the infamous "NoneType object has no attribute..." errors).

### Commands needed
`python types_demo.py`

### Run it
Predicted confidently: The output will print `True`, confirming the function implicitly returned `None`.

### One sentence connecting to previous unit
All of these types exist in a hierarchy and can be inspected or converted using their built-in constructors.

## Closing
### Connect the pieces
Every value in Python has an exact type that dictates what operations are valid. Let's trace the literal `42` through the built-in conversion functions we've explored.

Starting with the integer `42`, we can prove its identity: `type(42)` is `int`. If we need it for a continuous measurement, we can pass it to the float constructor: `float(42)` yields `42.0`. If we need to concatenate it with text to display on a screen, we convert it: `str(42)` yields the string `"42"`. And if we place it inside a conditional `if 42:`, Python implicitly calls `bool(42)`, which evaluates to `True` because any non-zero integer is truthy. In contrast, `bool(0)` would evaluate to `False`. 

When a variable lacks any of these values, we assign it the `None` singleton to explicitly declare its emptiness. The type system represents the core contract between you and the Python runtime.
