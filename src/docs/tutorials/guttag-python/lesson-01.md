# Lesson 1: Types — `int`, `float`, `bool`, `str`, and `None`

Python programs manipulate data, and every piece of data has a specific type. In this lesson, we cover the five core scalar types that form the foundation of Python computation.

## What you will build

The reader will understand Python's five core scalar types, how Python determines the type of a value, how to convert between types, and why types matter. The transferable problems you will solve are: (1) a type is a set of values together with the operations valid on those values — knowing a value's type tells you exactly what you can do with it; (2) Python is dynamically typed — variables don't have types, values do; (3) the rules for implicit type conversion (coercion) in mixed-type expressions are small and learnable.

## What you need to know first

- Lesson 0 (the Python REPL, arithmetic operators, `print()`, `type()`).

## Terms used in this lesson

- **Type** — A set of values together with the operations valid on those values. Knowing the type tells the system how to interpret the bits in memory and what actions are safe.
- **Dynamic typing** — Python does not associate variables with static types. Instead, the values themselves carry the type information.
- **Coercion** — Implicit type conversion where the language automatically converts a value from one type to another (e.g., an integer to a float) during an operation.
- **`+` (Addition)** — Operator that computes the sum of numbers or concatenates sequences like strings.
- **`-` (Subtraction)** — Operator that subtracts the right operand from the left.
- **`*` (Multiplication)** — Operator that multiplies two numbers or repeats sequences.
- **`//` (Integer division)** — Operator that performs division and truncates the fractional part, always returning an integer if the operands are integers.
- **`/` (True division)** — Operator that performs division and always returns a floating-point number.
- **`%` (Modulo)** — Operator that returns the remainder of a division operation.
- **`**` (Exponentiation)** — Operator that raises the left operand to the power of the right operand.
- **`==` (Equality)** — Operator that checks if two values are equal.
- **`!=` (Inequality)** — Operator that checks if two values are not equal.
- **`<` (Less than)** — Operator that checks if the left value is strictly less than the right.
- **`>` (Greater than)** — Operator that checks if the left value is strictly greater than the right.
- **`<=` (Less than or equal)** — Operator that checks if the left value is less than or equal to the right.
- **`>=` (Greater than or equal)** — Operator that checks if the left value is greater than or equal to the right.
- **`and`** — Boolean operator that returns True only if both operands are True.
- **`or`** — Boolean operator that returns True if at least one operand is True.
- **`not`** — Boolean operator that inverts a boolean value (True becomes False, and vice versa).
- **Escape sequence** — A backslash (`\`) followed by a character, used to represent a special character within a string (e.g., `\n` for newline).
- **Truthiness** — The boolean evaluation of a non-boolean value. In Python, `0`, `0.0`, `''`, `[]`, `{}`, and `None` are falsy; everything else is truthy.
- **`is`** — Identity operator that checks if two references point to the exact same object in memory, often used to check for `None`.

## Objects and methods used

- **`type()`**
  - *What it is:* A built-in Python function that inspects the type of a value.
  - *Implementation:* `type(object) -> type`
  - *Its use:* Used to dynamically confirm what kind of data we are working with in the REPL.
  - *Type:* Built-in function.
  - *Responsibility:* Returns the class (type) of the argument passed to it.
  - *Depends on:* A single object argument to inspect.
  - *Connects to:* Called by the user, returns a type object to the runtime/REPL.
  - *Shape:* Global built-in API.

- **`print()`**
  - *What it is:* A built-in function that outputs data to the standard output.
  - *Implementation:* `print(value, ..., sep=' ', end='\n', file=sys.stdout, flush=False)`
  - *Its use:* Used to display values, especially to show escape sequence effects in strings.
  - *Type:* Built-in function.
  - *Responsibility:* Converts its arguments to strings and writes them to a stream.
  - *Depends on:* The values passed as arguments.
  - *Connects to:* Called by the user, writes to standard output stream.
  - *Shape:* Global built-in API.

- **`len()`**
  - *What it is:* A built-in function that returns the number of items in an object.
  - *Implementation:* `len(s) -> int`
  - *Its use:* Used to find out the length (number of characters) of a string.
  - *Type:* Built-in function.
  - *Responsibility:* Returns the integer size of the collection or sequence.
  - *Depends on:* A sequence or collection (like a string).
  - *Connects to:* Called by the user, calls the object's `__len__` method under the hood.
  - *Shape:* Global built-in API.

- **`int()`**
  - *What it is:* A built-in type constructor used to create an integer.
  - *Implementation:* `int(x) -> integer`
  - *Its use:* Used to explicitly convert a float or string into an integer.
  - *Type:* Built-in class/constructor.
  - *Responsibility:* Constructs and returns an integer object from a number or string.
  - *Depends on:* A number or string that can validly be parsed as an integer.
  - *Connects to:* Called by the user, returns an `int`.
  - *Shape:* Global built-in API.

- **`float()`**
  - *What it is:* A built-in type constructor used to create a floating-point number.
  - *Implementation:* `float(x) -> floating point number`
  - *Its use:* Used to explicitly convert an integer or string into a float.
  - *Type:* Built-in class/constructor.
  - *Responsibility:* Constructs and returns a float object from a number or string.
  - *Depends on:* A number or string that can validly be parsed as a float.
  - *Connects to:* Called by the user, returns a `float`.
  - *Shape:* Global built-in API.

- **`str()`**
  - *What it is:* A built-in type constructor used to create a string.
  - *Implementation:* `str(object='') -> str`
  - *Its use:* Used to explicitly convert numbers or other objects into their string representation.
  - *Type:* Built-in class/constructor.
  - *Responsibility:* Constructs and returns a string version of an object.
  - *Depends on:* An object to convert.
  - *Connects to:* Called by the user, calls the object's `__str__` method.
  - *Shape:* Global built-in API.

- **`bool()`**
  - *What it is:* A built-in type constructor used to get the boolean value of an object.
  - *Implementation:* `bool(x) -> bool`
  - *Its use:* Used to check the truthiness of values like integers, strings, or `None`.
  - *Type:* Built-in class/constructor.
  - *Responsibility:* Evaluates an object's truth value and returns `True` or `False`.
  - *Depends on:* Any object.
  - *Connects to:* Called by the user, calls the object's `__bool__` or `__len__` method.
  - *Shape:* Global built-in API.


## Concept Unit: `int` — integers

### The Problem
How do we represent exact whole numbers in Python without arbitrary size limits? In many languages, integers have a maximum size, but Python handles them differently. How do we verify the type of a whole number?

### Introduce the concept in isolation
```python
>>> 42
42
```
This output proves that entering a sequence of digits evaluates to an integer value in the REPL.

### Discard the throwaway example
The throwaway example of typing just `42` is now discarded.

### Project Change
- **Reference Source:** None — this is a from-scratch addition because we are exploring fundamental types in the REPL.
- **Files affected:** Interactive Python REPL.
- **Change type:** Add.
- **Location:** At the prompt.
- **Dependencies:** Python 3.12 running in interactive mode.

### The New Code
```python
>>> 42
>>> -17
>>> 2 ** 62
>>> 2 ** 100
>>> type(42)
```

### The Updated Project
```python
>>> 42
42
>>> -17
-17
>>> 2 ** 62
4611686018427387904
>>> 2 ** 100
1267650600228229401496703205376
>>> type(42)
<class 'int'>
```
The REPL evaluates each expression and outputs its value or type.

### Mechanical walkthrough
- **`42`** and **`-17`** are literal integer values. They represent whole numbers.
- **`2 ** 62`** and **`2 ** 100`** use the exponentiation operator (`**`). Python integers have UNLIMITED precision — they can be as large as memory allows. This is different from most languages (Java's `int` maxes out at ~2 billion).
- **`type(42)`** calls the built-in function to inspect the type. It returns `<class 'int'>`, proving that `42` is an integer.
- All the arithmetic operators from Lesson 0 (`+`, `-`, `*`, `//`, `%`, `**`) work on integers. Integer division `//` always returns an integer; true division `/` always returns a float.


## Concept Unit: `float` — floating-point numbers

### The Problem
How do we represent decimal numbers or real numbers in Python, especially very large or very small ones? And are there limits to their precision?

### Introduce the concept in isolation
```python
>>> 3.14
3.14
```
This output proves that numbers with a decimal point evaluate to a different type.

### Discard the throwaway example
The throwaway example of `3.14` alone is now discarded.

### Project Change
- **Reference Source:** None.
- **Files affected:** Interactive Python REPL.
- **Change type:** Add.
- **Location:** At the prompt.
- **Dependencies:** None.

### The New Code
```python
>>> 3.14
>>> 1.0
>>> 1e6
>>> 1.5e-3
>>> 0.1 + 0.2
>>> type(3.14)
```

### The Updated Project
```python
>>> 3.14
3.14
>>> 1.0
1.0
>>> 1e6
1000000.0
>>> 1.5e-3
0.0015
>>> 0.1 + 0.2
0.30000000000000004
>>> type(3.14)
<class 'float'>
```
These expressions evaluate to floating-point numbers.

### Mechanical walkthrough
- **`3.14`** and **`1.0`** are floating-point literals because they contain a decimal point.
- **`1e6`** and **`1.5e-3`** use scientific notation. `e6` means times 10 to the power of 6.
- floats use IEEE 754 double-precision (64 bits). They can represent very large and very small numbers (up to ~10^308), but NOT all real numbers exactly.
- **`0.1 + 0.2`** results in `0.30000000000000004`. The notorious `0.1 + 0.2 = 0.30000000000000004` is not a Python bug — it is a consequence of representing 0.1 in binary: 0.1 cannot be expressed exactly in finite binary. In practice: never compare floats with `==`; use `abs(a - b) < epsilon` instead.
- **`type(3.14)`** confirms the class is `'float'`.


## Concept Unit: `bool` — booleans

### The Problem
How does Python represent logical truth? When we compare values, what is the result?

### Introduce the concept in isolation
```python
>>> True
True
```
This output proves that `True` is a recognized keyword and evaluates to itself.

### Discard the throwaway example
The throwaway example is discarded.

### Project Change
- **Reference Source:** None.
- **Files affected:** Interactive Python REPL.
- **Change type:** Add.
- **Location:** At the prompt.
- **Dependencies:** None.

### The New Code
```python
>>> True
>>> False
>>> type(True)
>>> 3 > 2
>>> 3 < 2
>>> True and False
>>> True or False
>>> not True
```

### The Updated Project
```python
>>> True
True
>>> False
False
>>> type(True)
<class 'bool'>
>>> 3 > 2
True
>>> 3 < 2
False
>>> True and False
False
>>> True or False
True
>>> not True
False
```
Boolean logic in the REPL.

### Mechanical walkthrough
- **`True`** and **`False`** are built-in boolean literals.
- **`type(True)`** returns `<class 'bool'>`.
- `bool` is a subtype of `int` in Python — `True == 1` and `False == 0`. This means `True + True == 2` is legal (though rarely intended).
- **`3 > 2`** and **`3 < 2`** use comparison operators. Comparison operators: `==`, `!=`, `<`, `>`, `<=`, `>=` — all return a bool.
- **`and`**, **`or`**, and **`not`** are boolean operators. `and` is true if both operands are true, `or` is true if at least one is true, and `not` flips True to False.


## Concept Unit: `str` — strings

### The Problem
How do we represent text and manipulate words or sentences in Python?

### Introduce the concept in isolation
```python
>>> 'hello'
'hello'
```
This proves that quotes create text sequence values.

### Discard the throwaway example
The string isolated test is discarded.

### Project Change
- **Reference Source:** None.
- **Files affected:** Interactive Python REPL.
- **Change type:** Add.
- **Location:** At the prompt.
- **Dependencies:** None.

### The New Code
```python
>>> 'hello'
>>> "world"
>>> "it's a string"
>>> 'he said "hello"'
>>> len('hello')
>>> 'hello' + ' ' + 'world'
>>> 'ha' * 3
>>> type('hello')
>>> print('line1\nline2')
>>> print('tab\there')
>>> print('back\\slash')
```

### The Updated Project
```python
>>> 'hello'
'hello'
>>> "world"
'world'
>>> "it's a string"
"it's a string"
>>> 'he said "hello"'
'he said "hello"'
>>> len('hello')
5
>>> 'hello' + ' ' + 'world'
'hello world'
>>> 'ha' * 3
'hahaha'
>>> type('hello')
<class 'str'>
>>> print('line1\nline2')
line1
line2
>>> print('tab\there')
tab     here
>>> print('back\\slash')
back\slash
```
Text representation and operations.

### Mechanical walkthrough
- **`'hello'`** and **`"world"`**: a string is an immutable sequence of characters. Single and double quotes are interchangeable.
- Using **`"`** around `'it's'` or **`'`** around `"hello"` allows nesting quotes without escaping.
- **`len('hello')`** returns the number of characters, which is 5.
- **`+`** concatenates strings; **`*`** repeats a string n times.
- Strings are NOT bytes — they are Unicode text, so they can hold any character from any language.
- **`type('hello')`** confirms the class is `'str'`.
- Escape sequences like **`\n`** (newline), **`\t`** (tab), and **`\\`** (literal backslash) are interpreted when processed, which can be seen cleanly using `print()`.


## Concept Unit: `None` — the absence of a value

### The Problem
How do we represent a variable or a return state that intentionally has no value?

### Introduce the concept in isolation
```python
>>> None
```
Evaluating `None` produces no output, proving it represents emptiness to the REPL.

### Discard the throwaway example
The isolated `None` check is discarded.

### Project Change
- **Reference Source:** None.
- **Files affected:** Interactive Python REPL.
- **Change type:** Add.
- **Location:** At the prompt.
- **Dependencies:** None.

### The New Code
```python
>>> None
>>> type(None)
>>> print(None)
>>> x = None
>>> x is None
>>> x == None
```

### The Updated Project
```python
>>> None
>>> type(None)
<class 'NoneType'>
>>> print(None)
None
>>> x = None
>>> x is None
True
>>> x == None
True
```
`None` handling in Python.

### Mechanical walkthrough
- **`None`** is Python's way of saying "no value."
- **`type(None)`** returns `<class 'NoneType'>`.
- A function that has no `return` statement returns `None`. Variables that haven't been given a meaningful value are often initialized to `None`.
- **`print(None)`** displays the word "None" because `print` explicitly converts it to a string for display.
- **`x is None`** uses the identity operator. Use `is None` (identity check) rather than `== None` (equality check) when testing for `None` — this is a Python convention. Both work, but `is` is preferred.


## Concept Unit: Type conversion — `int()`, `float()`, `str()`, `bool()`

### The Problem
If we have a string `'42'` but we need to do math with it, how do we change its type? Can we convert values between types on demand?

### Introduce the concept in isolation
```python
>>> int('42')
42
```
This proves a string of digits can be parsed into an integer value.

### Discard the throwaway example
The isolated conversion is discarded.

### Project Change
- **Reference Source:** None.
- **Files affected:** Interactive Python REPL.
- **Change type:** Add.
- **Location:** At the prompt.
- **Dependencies:** None.

### The New Code
```python
>>> int(3.7)
>>> int('42')
>>> int('3.14')
>>> float('3.14')
>>> str(42)
>>> str(3.14)
>>> bool(0)
>>> bool(1)
>>> bool('')
>>> bool('hello')
>>> bool(None)
```

### The Updated Project
```python
>>> int(3.7)
3
>>> int('42')
42
>>> int('3.14')  # FAILS
ValueError: invalid literal for int() with base 10: '3.14'
>>> float('3.14')
3.14
>>> str(42)
'42'
>>> str(3.14)
'3.14'
>>> bool(0)
False
>>> bool(1)
True
>>> bool('')
False
>>> bool('hello')
True
>>> bool(None)
False
```
Explicit conversions between types.

### Mechanical walkthrough
- **`int(3.7)`** truncates (does not round) floats, returning `3`.
- **`int('42')`** successfully converts the string to the integer `42`.
- **`int('3.14')`** fails because `'3.14'` is not a valid integer literal — use `int(float('3.14'))` instead.
- **`float('3.14')`** parses the string into a float.
- **`str(42)`** and **`str(3.14)`** convert the numbers into text strings.
- **`bool()`** evaluates truthiness: `0`, `0.0`, `''`, `[]`, `{}`, `None` are all falsy (return False); everything else is truthy (returns True).


## Concept Unit: Mixed-type arithmetic — implicit coercion

### The Problem
What happens if we add an integer and a float, or a boolean and an integer? Does Python figure it out, or do we have to convert them manually?

### Introduce the concept in isolation
```python
>>> 1 + 2.0
3.0
```
This proves that mixing an int and a float safely produces a float.

### Discard the throwaway example
The isolated math is discarded.

### Project Change
- **Reference Source:** None.
- **Files affected:** Interactive Python REPL.
- **Change type:** Add.
- **Location:** At the prompt.
- **Dependencies:** None.

### The New Code
```python
>>> 1 + 2.0
>>> True + 1
>>> True + 1.5
>>> '3' + 3
```

### The Updated Project
```python
>>> 1 + 2.0
3.0
>>> True + 1
2
>>> True + 1.5
2.5
>>> '3' + 3
TypeError: can only concatenate str (not "int") to str
```
Implicit coercion behaviors.

### Mechanical walkthrough
- **`1 + 2.0`**: Python automatically promotes `int` to `float` in mixed arithmetic, so the result is `3.0`. This is called implicit coercion.
- **`True + 1`** and **`True + 1.5`**: `True`/`False` are treated as `1`/`0` in arithmetic. So `True + 1` becomes `2`, and `True + 1.5` becomes `2.5`.
- **`'3' + 3`**: But Python will NOT coerce between `str` and numeric types — `'3' + 3` is a `TypeError`. Use explicit conversion: `int('3') + 3` works.

---

## Next Steps

Python has five scalar types (`int`, `float`, `bool`, `str`, `None`) plus collection types (lists, tuples, dicts, sets) covered in Module 1. Lesson 2 covers variables — how you give names to values and reuse them. 

Exercises: 
- Predict the type of `type(True + 1)` before running it.
- Write an expression that converts the string '3.14159' to a float and multiplies it by 2.
- Explain why `int(True)` is 1.
