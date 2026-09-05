# Lesson 03: Conditionals — if, elif, else

**What you will build**
You will build an understanding of Python's conditional branch: if/elif/else, Boolean expressions with comparison and logical operators, short-circuit evaluation, and the ternary expression. The transferable insight is that a conditional is a binary decision point. Every conditional reduces a continuum of inputs to a discrete set of outcomes. The shape of your conditions determines the shape of your program's behavior.

**What you need to know first**
- Lessons 00-02.

**Terms used in this lesson**
- **if** — A conditional keyword that executes a block of code if its condition is true. It solves the problem of executing code conditionally.
- **elif** — Short for "else if", it allows checking multiple expressions for truth value. It avoids deep nesting of `if` statements.
- **else** — An optional keyword that catches anything not caught by preceding `if` or `elif` branches. It provides a default path.
- **==** — An equality comparison operator. It checks if two values are equal.
- **!=** — An inequality comparison operator. It checks if two values are not equal.
- **<, >, <=, >=** — Comparison operators. They compare relative sizes or orders of values.
- **is** — Identity check operator. It checks if two variables point to the same object in memory, differing from `==` which checks value equivalence.
- **None** — Python's null value. Used to represent the absence of a value.
- **and** — A logical operator that returns the first falsy value, or the last value if all are truthy. Used for short-circuit evaluation.
- **or** — A logical operator that returns the first truthy value, or the last value if all are falsy. Used for short-circuit evaluation.
- **not** — A logical operator that negates a boolean value.
- **Truthy** — Any value that evaluates to true in a boolean context. Everything except falsy values.
- **Falsy** — Any value that evaluates to false in a boolean context, such as `False`, `0`, `0.0`, `''`, `[]`, `{}`, `set()`, and `None`.
- **Conditional expression (ternary)** — An expression that evaluates to one value if a condition is true, and another if false. It solves the problem of writing a simple conditional assignment on one line.

**Objects and methods used**

- **classify**
  - *What it is:* A custom function written in this lesson.
  - *Implementation:* `def classify(n):` returning a string.
  - *Its use:* To demonstrate conditional branching logic on an integer input.
  - *Type:* A free function.
  - *Responsibility:* Reduces a continuum of numeric inputs to one of three discrete string outcomes: 'positive', 'negative', or 'zero'.
  - *Depends on:* An integer or numeric argument `n`.
  - *Connects to:* Called by the script execution, returns a string to the caller.
  - *Shape:* An internal implementation detail of our Python script.

## Concept Unit: if / elif / else — the basic branch
### The Problem
If we want our code to make a decision, how do we write it? What if we need to check multiple exclusive conditions?
### Introduce the concept in isolation
```python
x = 5
if x > 0:
    print("Positive")
elif x < 0:
    print("Negative")
else:
    print("Zero")
```
Predicted confidently: `Positive` because 5 > 0 is True. This proves the **if / elif / else** structure evaluates conditions in order and executes only the first matching block.
### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.
### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are building a new classification script.
- **Files affected**: `classify.py` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: none
### The New Code
```python
def classify(n):
    if n > 0:
        return 'positive'
    elif n < 0:
        return 'negative'
    else:
        return 'zero'
```
### The Updated Project
```python
1: def classify(n): // ← new
2:     if n > 0: // ← new
3:         return 'positive' // ← new
4:     elif n < 0: // ← new
5:         return 'negative' // ← new
6:     else: // ← new
7:         return 'zero' // ← new
```
This structure evaluates `n` and returns a string indicating its sign.
### Mechanical walkthrough
- `def classify(n):`: Defines a new function taking a single parameter `n`.
- `if n > 0:`: Checks if `n` is greater than 0. The indentation defines the block.
- `return 'positive'`: Returns this string if the condition is true.
- `elif n < 0:`: Evaluates if the previous condition was false. Short for 'else if'.
- `return 'negative'`: Returns this string if `elif` condition is true.
- `else:`: Catch-all block if all previous conditions were false.
- `return 'zero'`: Returns 'zero' as the fallback.
### CS lens
The fundamental CS concept is **branching (control flow)**. It appears in CPU instruction pipelines (branch prediction), finite state machines (transitions), state charts, routing algorithms, and decision trees.
### SE lens
Design principle: **Cyclomatic complexity**. Avoid deep nesting of `if` statements. The alternative NOT chosen is nesting `if` inside `else`, which hurts readability. The tradeoff is flatter code at the cost of evaluating conditions sequentially.
### Commands needed
None for this unit.
### Run it
Predicted confidently: calling `classify(5)` returns `'positive'`, since 5 > 0.
### One sentence connecting to previous unit
Now that we can branch, we need to know how to compare more complex types.

## Concept Unit: Comparison operators
### The Problem
How do we check for equality or relative order? What is the difference between comparing values and comparing object identity?
### Introduce the concept in isolation
```python
print('apple' < 'banana')
print(0 < 5 < 10)
print(None is None)
```
Predicted confidently: `True`, `True`, `True`. This proves **comparison operators**, **chaining**, and **identity checks** (`is`). String comparison is lexicographic. Chaining `0 < 5 < 10` is valid Python. Always use `is` for `None`.
### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.
### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: `classify.py`
- **Change type**: add
- **Location**: at the end of the file
- **Dependencies**: none
### The New Code
```python
def check_bounds(n):
    return 0 <= n <= 100
```
### The Updated Project
```python
1: def classify(n):
2:     if n > 0:
3:         return 'positive'
4:     elif n < 0:
5:         return 'negative'
6:     else:
7:         return 'zero'
8:
9: def check_bounds(n): // ← new
10:    return 0 <= n <= 100 // ← new
```
This adds a function to check if a number is bounded using operator chaining.
### Mechanical walkthrough
- `def check_bounds(n):`: Defines a new function.
- `return`: Returns the evaluated boolean result.
- `0 <= n <= 100`: Chains comparison operators. This is equivalent to `0 <= n and n <= 100`.
### CS lens
The fundamental CS concept is **relational algebra**. It appears in database queries (SQL WHERE clauses), sorting algorithms (comparators), binary search trees (node placement), and constraint satisfaction solvers.
### SE lens
Design principle: **Expressiveness over verbosity**. Chained comparisons `0 <= n <= 100` read like mathematical notation. The alternative NOT chosen is `0 <= n and n <= 100`. The real tradeoff is less generic code in other languages but highly readable Python code.
### Commands needed
None for this unit.
### Run it
Predicted confidently: `check_bounds(50)` returns `True`.
### One sentence connecting to previous unit
We've compared values directly, but how do we combine multiple unrelated conditions?

## Concept Unit: Boolean operators and short-circuit evaluation
### The Problem
How can we combine multiple boolean expressions? What happens if evaluating the second expression would cause an error?
### Introduce the concept in isolation
```python
print(0 and 1/0)
print(1 or 1/0)
print(not 0)
```
Predicted confidently: `0`, `1`, `True`. This proves **short-circuit evaluation** with **and**, **or**, and **not**. `1/0` is never evaluated, preventing a ZeroDivisionError. Precedence is not > and > or.
### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.
### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: `classify.py`
- **Change type**: add
- **Location**: at the end of the file
- **Dependencies**: none
### The New Code
```python
def is_valid_and_positive(n):
    return n is not None and n > 0
```
### The Updated Project
```python
8:
9: def check_bounds(n): 
10:    return 0 <= n <= 100 
11:
12: def is_valid_and_positive(n): // ← new
13:     return n is not None and n > 0 // ← new
```
This adds a check that relies on short-circuiting to avoid comparing `None` to `0`.
### Mechanical walkthrough
- `def is_valid_and_positive(n):`: Defines a function.
- `return`: Returns the evaluation result.
- `n is not None`: Uses the `is not` operator to ensure `n` exists.
- `and`: Logical operator. If the left side is falsy, it short-circuits and returns it.
- `n > 0`: Evaluated only if the left side was truthy.
### CS lens
The fundamental CS concept is **lazy evaluation**. It appears in infinite data structures (Haskell streams), boolean satisfiability (SAT solvers), database query optimization (filter pushdown), and package dependency resolution.
### SE lens
Design principle: **Guard clauses**. The alternative NOT chosen is using a nested `if` to check for None before comparing. The real tradeoff is concise expressions using short-circuiting versus explicit control flow.
### Commands needed
None for this unit.
### Run it
Predicted confidently: `is_valid_and_positive(None)` returns `False` without crashing.
### One sentence connecting to previous unit
Logical operators treat many values as true or false, bringing us to truthy and falsy values.

## Concept Unit: Truthy and falsy values in conditions
### The Problem
Do we always have to use `==` or `!=` in conditions? What if we just want to know if a list has items?
### Introduce the concept in isolation
```python
if "":
    print("Truthy")
else:
    print("Falsy")
```
Predicted confidently: `Falsy`. This proves **truthy and falsy values**. Python treats empty strings, lists, zeros, and None as falsy. Everything else is truthy.
### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.
### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `classify.py`
- **Change type**: add
- **Location**: at the end of the file
- **Dependencies**: none
### The New Code
```python
def has_items(lst):
    if lst:
        return True
    return False
```
### The Updated Project
```python
11:
12: def is_valid_and_positive(n): 
13:     return n is not None and n > 0
14:
15: def has_items(lst): // ← new
16:     if lst: // ← new
17:         return True // ← new
18:     return False // ← new
```
This adds a function demonstrating Pythonic empty checks.
### Mechanical walkthrough
- `def has_items(lst):`: Defines the function.
- `if lst:`: Evaluates the list implicitly. Pythonic way to check for emptiness.
- `return True`: Executed if list is not empty (truthy).
- `return False`: Executed if list is empty (falsy).
### CS lens
The fundamental CS concept is **implicit type coercion**. It appears in dynamic language interpreters (JavaScript type juggling), string formatting, shell scripting exit codes, and hardware bit masking.
### SE lens
Design principle: **Idiomatic coding (Pythonic)**. The alternative NOT chosen is `if len(lst) > 0:`. The real tradeoff is cleaner syntax but requiring the reader to memorize language-specific truthiness rules.
### Commands needed
None for this unit.
### Run it
Predicted confidently: `has_items([])` returns `False`.
### One sentence connecting to previous unit
Sometimes we just want a single assignment based on a condition without writing a full block.

## Concept Unit: The conditional expression (ternary)
### The Problem
How can we assign a value conditionally in a single expression? Do we always need four lines of code for a simple if/else assignment?
### Introduce the concept in isolation
```python
n = 4
x = 'even' if n % 2 == 0 else 'odd'
print(x)
```
Predicted confidently: `even`. This proves the **conditional expression (ternary)**. It allows an inline `value_if_true if condition else value_if_false`.
### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.
### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `classify.py`
- **Change type**: add
- **Location**: at the end of the file
- **Dependencies**: none
### The New Code
```python
def parity_label(n):
    return 'even' if n % 2 == 0 else 'odd'
```
### The Updated Project
```python
14:
15: def has_items(lst):
16:     if lst:
17:         return True
18:     return False
19:
20: def parity_label(n): // ← new
21:     return 'even' if n % 2 == 0 else 'odd' // ← new
```
Adds a function to label a number's parity using a ternary expression.
### Mechanical walkthrough
- `def parity_label(n):`: Defines the function.
- `return`: Returns the result of the expression.
- `'even'`: The value if the condition is true.
- `if n % 2 == 0`: The condition to evaluate.
- `else 'odd'`: The value if the condition is false.
### CS lens
The fundamental CS concept is **expressions vs. statements**. It appears in functional programming languages (where everything is an expression), compiler parsing phases, macro preprocessors, and lambda calculus.
### SE lens
Design principle: **Readability for simple branches**. The alternative NOT chosen is a full 4-line if/else block. The real tradeoff is a compact expression that can become unreadable if the logic grows too complex.
### Commands needed
None for this unit.
### Run it
Predicted confidently: `parity_label(3)` returns `'odd'`.
### One sentence connecting to previous unit
We've now mastered single-line, multi-line, and short-circuited conditionals.

## Closing
### Connect the pieces
Through these units, we wrote `classify(n)` to categorize numbers. 
If we call `classify(0)`: `0 > 0` is False, `0 < 0` is False, so it hits the `else` block and returns `'zero'`.
If we call `classify(5)`: `5 > 0` is True, so it immediately returns `'positive'` and skips the rest.
If we call `classify(-3)`: `-3 > 0` is False, `-3 < 0` is True, so it hits the `elif` block and returns `'negative'`.
Every conditional reduces a continuum of inputs to a discrete set of outcomes. The shape of your conditions determines the shape of your program's behavior.
