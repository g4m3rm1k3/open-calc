# Lesson 3: Conditionals — `if`, `elif`, `else`

What you will build: The reader will write programs that make decisions using `if`, `elif`, and `else`. The transferable problems this lesson is actually about are: (1) a conditional selects ONE branch to execute based on a boolean test — understanding evaluation order is essential; (2) short-circuit evaluation of `and`/`or` is not just an optimization — it enables safe evaluation patterns like `x != 0 and 1/x > 2`; (3) nested conditionals vs elif chains: knowing when to use which prevents deeply indented, unreadable code.

What you need to know first: Lessons 0–2 (REPL, arithmetic, types, variables, assignment).

## Terms used in this lesson

- **Boolean expression** — An expression that evaluates to one of the two truth values, `True` or `False`. It exists so programs can ask questions about data and act on the answers, rather than blindly executing the same steps every time.
- **`True`** — A built-in boolean primitive representing absolute truth. It exists to represent the affirmative state of a binary condition.
- **`False`** — A built-in boolean primitive representing absolute falsehood. It exists to represent the negative state of a binary condition.
- **`>` (greater than)** — A comparison operator that evaluates whether the left operand is strictly larger than the right. It exists to establish relative magnitude.
- **`<` (less than)** — A comparison operator that evaluates whether the left operand is strictly smaller than the right.
- **`==` (equality)** — A comparison operator that evaluates whether two values are logically identical. It exists to check for sameness without modifying either value.
- **`!=` (inequality)** — A comparison operator that evaluates whether two values are different. It exists as a more readable alternative to negating an equality check.
- **`>=` (greater than or equal to)** — A comparison operator checking if the left is larger than or identical to the right.
- **`<=` (less than or equal to)** — A comparison operator checking if the left is smaller than or identical to the right.
- **`=` (assignment)** — The operator that binds a name to a value. It exists to store state. Confusing it with `==` is a common source of bugs.
- **`and`** — A logical operator that evaluates to `True` only if both of its operands are true. It exists to combine multiple prerequisites that must all be satisfied.
- **`or`** — A logical operator that evaluates to `True` if at least one of its operands is true. It exists to provide alternative pathways for success.
- **`not`** — A logical operator that inverts a boolean value. It exists to express negative conditions clearly.
- **Short-circuit evaluation** — A language evaluation strategy where logical operators stop evaluating as soon as the final result is known. It exists not just for performance, but to allow safe sequential checks (e.g., checking if an object exists before checking its properties).
- **`if`** — A language keyword that begins a conditional statement. It exists to execute a block of code only when its associated condition is true.
- **`else`** — A language keyword providing a fallback block. It exists to guarantee an action happens when an `if` condition is false, ensuring exactly one path is taken.
- **`elif`** — A language keyword standing for "else if". It exists to chain multiple mutually exclusive conditions without creating deep nesting.
- **Nested conditionals** — Conditional blocks placed inside the body of other conditional blocks. They exist to evaluate conditions that only make sense if an earlier condition has already passed.
- **Conditional expression (ternary operator)** — An expression structured as `A if condition else B`. It exists to assign or return one of two values inline, treating a decision as an expression (which yields a value) rather than a statement (which performs an action).
- **Indentation** — The structural rule Python uses to group statements into blocks, typically 4 spaces. It exists to visually align code structure with logical structure, replacing braces `{}`.

## Objects and methods used

- **`print`**
  - *What it is:* A built-in standard library function that outputs data.
  - *Implementation:* `def print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)`
  - *Its use:* We use it to make our program's decisions visible on the screen.
  - *Type:* Built-in function.
  - *Responsibility:* Converts Python objects to strings and writes them to a standard output stream.
  - *Depends on:* The values passed to it, and an active standard output stream.
  - *Connects to:* Called by our script, connects to the operating system's standard out pipe.
  - *Shape:* A boundary function between the Python runtime and the host console.
- **`classify_temperature`**
  - *What it is:* A user-defined function for categorizing a body temperature.
  - *Implementation:* A function taking a single float parameter.
  - *Its use:* We build it to demonstrate basic two-branch `if`/`else` decision making.
  - *Type:* Custom function.
  - *Responsibility:* Maps a numeric temperature to a string category ('Fever' or 'Normal').
  - *Depends on:* A numeric `temp` argument.
  - *Connects to:* Called by our script's top level, calls `print` internally.
  - *Shape:* An internal domain logic function.
- **`grade`**
  - *What it is:* A user-defined function that assigns a letter grade.
  - *Implementation:* A function taking a single numeric parameter and returning a string.
  - *Its use:* We build it to demonstrate multi-branch `elif` chains.
  - *Type:* Custom function.
  - *Responsibility:* Converts a continuous numerical score into a discrete categorical letter.
  - *Depends on:* A numeric `score` argument.
  - *Connects to:* Called by our script, returns data back to the caller.
  - *Shape:* An internal domain logic function.
- **`abs_val_nested`**
  - *What it is:* A user-defined function to calculate absolute value using nested logic.
  - *Implementation:* A function taking a single numeric parameter and returning a number.
  - *Its use:* We build it to show how deeply nested conditions can become harder to read.
  - *Type:* Custom function.
  - *Responsibility:* Computes the magnitude of a number without regard to its sign.
  - *Depends on:* A numeric `x` argument.
  - *Connects to:* Called by script, returns data to caller.
  - *Shape:* Internal domain logic.
- **`abs_val_flat`**
  - *What it is:* A user-defined function to calculate absolute value using an `elif` chain.
  - *Implementation:* A function taking a single numeric parameter and returning a number.
  - *Its use:* We build it to demonstrate how flattening conditionals improves readability.
  - *Type:* Custom function.
  - *Responsibility:* Computes the magnitude of a number without regard to its sign.
  - *Depends on:* A numeric `x` argument.
  - *Connects to:* Called by script, returns data to caller.
  - *Shape:* Internal domain logic.

---

## Concept Unit: Boolean expressions

### The Problem

Before a program can make a decision, it has to ask a question. So far, we've only evaluated arithmetic expressions (`2 + 2`), which yield numbers. How do we ask a question that has a "yes" or "no" answer?

> **Socratic prompt:** Given what you know about how Python evaluates `2 + 2` to `4`, what do you think Python would evaluate the expression `3 > 2` to? What type of data would it be?

### Isolate the Concept

```python
>>> 3 > 2
True
>>> 3 < 2
False
>>> 3 == 3
True
>>> 3 != 4
True
>>> 3 >= 3
True
>>> 3 <= 2
False
```

This is called a **boolean expression**. It proves that Python has dedicated operators to compare values, and that these expressions evaluate to special built-in primitive values: `True` and `False`. 

### Discard the Example

This REPL code is discarded and will not appear in the project.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because this is a core language fundamentals lesson.
- **Files affected**: `decisions.py` (created)
- **Change type**: add
- **Location**: brand-new file
- **Dependencies**: none

### The New Code

```python
x = 5
is_five = x == 5
confusing_assignment = x = 5 == 5
```

### The Updated Project

```python
# decisions.py
# ← new
x = 5
is_five = x == 5
confusing_assignment = x = 5 == 5
```

Our script now defines variables that store the result of boolean expressions, highlighting the dangerous difference between `==` and `=`.

### Mechanical Walkthrough

- `x` — A variable being assigned to.
- `=` — The assignment operator. It binds the value on the right to the name on the left.
- `5` — An integer literal.
- `is_five` — A new variable.
- `=` — The assignment operator.
- `x == 5` — A **boolean expression**. The `==` operator checks for equality between the value of `x` and `5`. It evaluates to `True`.
- `confusing_assignment` — A variable name.
- `=` — The assignment operator.
- `x = 5 == 5` — This is a chained assignment mixed with an equality check. First, `5 == 5` is evaluated as a **boolean expression**, which yields `True`. Then, `True` is assigned to `x`, and also assigned to `confusing_assignment`. This proves why confusing `=` (assignment) with `==` (equality) is a fatal beginner bug: it silently overwrites your data with a boolean value!

### CS Lens

Boolean logic is the foundation of digital computing. Named after George Boole, it reduces all logical propositions to binary states (1 and 0, True and False). 
Also recognized in: digital logic gates (AND/OR/XOR hardware), database query filtering (SQL WHERE clauses), search engine queries, and bitwise networking masks.

### SE Lens

Why have separate `=` and `==` operators? Early languages like BASIC used `=` for both assignment and equality, inferring the meaning from context. C (and later Python) chose distinct operators to eliminate ambiguity. The tradeoff is that beginners often type `=` when they mean `==`, causing bugs. Python partially mitigates this by making assignment a statement rather than an expression in most contexts, but chained assignments (`x = y = True`) can still trap the unwary.

### Commands Needed

No new commands needed. We run our code with `python decisions.py`.

### Verification

Predicted output for `x` is `True`. Verified via mental evaluation of standard Python precedence rules and chained assignments.

### Connection

Now that we can ask a single true/false question, we need a way to combine multiple questions together.

---

## Concept Unit: `and`, `or`, `not`

### The Problem

Real-world decisions rarely depend on just one fact. A bank will only give a loan if you have good credit *and* sufficient income. How do we combine multiple boolean expressions into one?

> **Socratic prompt:** If `A` is True and `B` is False, what should the combined condition "A and B" evaluate to? What about "A or B"?

### Isolate the Concept

```python
>>> True and True
True
>>> True and False
False
>>> False or True
True
>>> False or False
False
>>> not True
False
>>> not False
True
>>> not True or False
False
>>> not (True or False)
False
```

These are **logical operators**. This output proves that `and` requires both sides to be true, `or` requires at least one side to be true, and `not` inverts a boolean. It also proves operator precedence: `not` evaluates before `and`, which evaluates before `or`, unless overridden by parentheses.

### Discard the Example

This REPL code is discarded and will not appear in the project.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `decisions.py` (modified)
- **Change type**: add
- **Location**: appended to file
- **Dependencies**: none

### The New Code

```python
is_weekend = True
has_homework = False
can_play_games = is_weekend and not has_homework
```

### The Updated Project

```python
# decisions.py
x = 5
is_five = x == 5
confusing_assignment = x = 5 == 5

# ← new
is_weekend = True
has_homework = False
can_play_games = is_weekend and not has_homework
```

Our script now evaluates a composite decision using `and` and `not` to determine if a condition is met.

### Mechanical Walkthrough

- `is_weekend` — A variable bound to the primitive **`True`**.
- `has_homework` — A variable bound to the primitive **`False`**.
- `can_play_games` — A variable storing our final decision.
- `=` — Assignment operator.
- `is_weekend` — Evaluates to `True`.
- `and` — A logical operator that requires both the left and right operands to be truthy.
- `not` — A logical operator that inverts the next operand.
- `has_homework` — Evaluates to `False`. 
Because `not` has higher precedence than `and`, `not has_homework` becomes `True`. Then `True and True` becomes `True`.

### CS Lens

This is Boolean algebra. The truth tables for AND, OR, and NOT are fundamental primitives. 
Also recognized in: bitwise masking, electrical relay circuits, discrete mathematics, set theory (intersection, union, complement).

### SE Lens

Why prioritize `not` over `and`, and `and` over `or`? It mirrors arithmetic precedence where multiplication (AND) happens before addition (OR), and negation (NOT) happens before both. The alternative is strict left-to-right evaluation, which APL uses, but that often confuses developers accustomed to standard algebraic rules. The tradeoff of implicit precedence rules is that developers must memorize them; explicit parentheses are often preferred for readability even when not strictly required.

### Commands Needed

None.

### Verification

Predicted output for `can_play_games` is `True`. Verified via mental evaluation of standard Python precedence rules.

### Connection

We now know how to combine questions. But what if evaluating the second question would crash the program if the first question is false?

---

## Concept Unit: Short-circuit evaluation

### The Problem

Consider checking if `10 / x` is greater than 2. If `x` is 0, division by zero crashes the program. We want to check `x != 0` AND `10 / x > 2`. If both parts are always evaluated, the program will crash on the second part whenever `x` is 0.

> **Socratic prompt:** If I tell you that the first half of an `and` statement is `False`, do you even need to look at the second half to know the final answer?

### Isolate the Concept

```python
>>> x = 0
>>> x != 0 and 10 / x > 2
False
>>> x == 0 or 10 / x > 2
True
```

This behavior is called **short-circuit evaluation**. This proves that Python evaluates logical operators left-to-right and stops evaluating as soon as the final boolean outcome is mathematically guaranteed.

### Discard the Example

This REPL code is discarded.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `decisions.py` (modified)
- **Change type**: add
- **Location**: appended to file
- **Dependencies**: none

### The New Code

```python
x = 0
is_safe = x != 0 and 10 / x > 2
```

### The Updated Project

```python
# decisions.py
x = 5
is_five = x == 5
confusing_assignment = x = 5 == 5

is_weekend = True
has_homework = False
can_play_games = is_weekend and not has_homework

# ← new
x = 0
is_safe = x != 0 and 10 / x > 2
```

Our script now relies on short-circuiting to safely perform a check that would otherwise crash.

### Mechanical Walkthrough

- `x = 0` — Assignment of integer `0` to `x`.
- `is_safe` — The result variable.
- `=` — The assignment operator.
- `x != 0` — A **boolean expression** checking inequality. Since `x` is 0, this is `False`.
- `and` — The logical AND operator. Because its left operand is `False`, the entire `and` expression is guaranteed to be `False`.
- `10 / x > 2` — The right operand. Because of **short-circuit evaluation**, Python skips this entirely. `10 / x` is never executed, saving us from a `ZeroDivisionError`.

### CS Lens

Short-circuit evaluation is a form of lazy evaluation. It delays or skips the evaluation of an expression until its value is strictly needed.
Also recognized in: Makefile dependency checks, React conditional rendering (`condition && <Component />`), optional chaining (`?.`), and bash control flow (`make build && make test`).

### SE Lens

Why short-circuit? It was initially an optimization to save CPU cycles. However, it quickly became a core design pattern. The alternative (eager evaluation of all operands) requires developers to write nested structures to guard unsafe operations. The tradeoff of short-circuiting is that if the right-hand side contains a function call with side effects (like saving to a database), that function might unpredictably not run. Good engineering practice dictates never putting side effects inside a short-circuited logical check.

### Commands Needed

None.

### Verification

Predicted behavior: No exception is raised, `is_safe` becomes `False`. Safe to assume per standard Python semantics.

### Connection

We have mastered asking questions. Now, we must use the answers to actually change what the program *does*.

---

## Concept Unit: The `if` statement

### The Problem

A boolean expression evaluates to True or False, but it doesn't do anything on its own. How do we make the program run a piece of code *only* if a condition is true?

> **Socratic prompt:** Look at this code snippet: `if x > 5: print('Yes')`. What do you think the colon (`:`) at the end of the line implies about what comes next?

### Isolate the Concept

```python
x = 10
if x > 5:
    print('x is greater than 5')
print('this always runs')
```
```text
x is greater than 5
this always runs
```

This is the **`if`** statement. This proves that code indented under the `if` runs selectively based on the condition, while code that is unindented runs unconditionally.

### Discard the Example

This isolated snippet is discarded.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `decisions.py` (modified)
- **Change type**: add
- **Location**: appended to file
- **Dependencies**: none

### The New Code

```python
temperature = 39.0
if temperature >= 37.5:
    print('Fever detected')
```

### The Updated Project

```python
# decisions.py
# ... previous code unchanged ...

x = 0
is_safe = x != 0 and 10 / x > 2

# ← new
temperature = 39.0
if temperature >= 37.5:
    print('Fever detected')
```

Our script now actively prints a warning if a condition is met.

### Mechanical Walkthrough

- `temperature = 39.0` — Variable assignment of a float.
- `if` — The statement keyword that begins a conditional block. It evaluates the expression immediately following it.
- `temperature >= 37.5` — A **boolean expression**. Evaluates to `True`.
- `:` — The colon indicates the start of a new block.
- `    print('Fever detected')` — The body of the `if` statement. Notice the **indentation** (4 spaces). Because the condition was true, `print` is called.

### CS Lens

This is a conditional branch. At the assembly level, a CPU executes instructions sequentially until it hits a conditional jump instruction, which tells the program counter to leap to a different memory address if a flag is set.
Also recognized in: Turing machine state transitions, routing protocols, regex alternations.

### SE Lens

Why use indentation for block scoping? Languages like C and Java use curly braces `{ }` to define blocks. Python's creator, Guido van Rossum, observed that programmers indent their code anyway for readability, so he made indentation syntactically meaningful. The tradeoff is that mixing tabs and spaces can break the program, and pasting code from the internet can misalign blocks. The benefit is that Python code is visually uncluttered and impossible to format misleadingly.

### Commands Needed

None.

### Verification

Output is strictly predicted: Prints 'Fever detected'.

### Connection

An `if` statement lets us do something extra. But what if we want to do one thing on success, and a completely *different* thing on failure?

---

## Concept Unit: `if` / `else`

### The Problem

If we want to print 'Fever' for high temperatures and 'Normal' otherwise, we could write two separate `if` statements. But that requires the CPU to evaluate two conditions, and there's a risk they might overlap or leave gaps. We need a guaranteed binary fork.

> **Socratic prompt:** If an `if` branch runs when the condition is `True`, when do you think an `else` branch would run?

### Isolate the Concept

```python
def classify_temperature(temp):
    if temp >= 37.5:
        print('Fever')
    else:
        print('Normal')

classify_temperature(38.0)
classify_temperature(36.8)
```
```text
Fever
Normal
```

This is an **`if` / `else`** block. This proves that exactly one branch executes — never both, never neither.

### Discard the Example

This REPL code is discarded.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `decisions.py` (modified)
- **Change type**: add
- **Location**: appended to file
- **Dependencies**: none

### The New Code

```python
def classify_temperature(temp):
    if temp >= 37.5:
        print('Fever')
    else:
        print('Normal')
```

### The Updated Project

```python
# decisions.py
# ... previous code unchanged ...
temperature = 39.0
if temperature >= 37.5:
    print('Fever detected')

# ← new
def classify_temperature(temp):
    if temp >= 37.5:
        print('Fever')
    else:
        print('Normal')
```

We have encapsulated our binary decision into a reusable function, `classify_temperature`.

### Mechanical Walkthrough

- `def classify_temperature(temp):` — Function definition accepting one parameter.
- `    if temp >= 37.5:` — The primary **`if`** branch. If `True`, the code indented underneath it runs.
- `        print('Fever')` — **`print`** called if the condition is met.
- `    else:` — The **`else`** keyword. It takes no condition. It acts as a catch-all that automatically runs if the preceding `if` was `False`.
- `        print('Normal')` — **`print`** called if the `if` condition was missed.

**Execution trace for `classify_temperature(38.0)` and `classify_temperature(36.8)`:**
1. `classify_temperature(38.0)` — calls the function, binding `temp` to 38.0.
2. `temp >= 37.5` — evaluates to `True`.
3. `print('Fever')` — executes. The `else` block is entirely skipped.
4. `classify_temperature(36.8)` — calls the function, binding `temp` to 36.8.
5. `temp >= 37.5` — evaluates to `False`.
6. `print('Normal')` — executes because the `if` failed and the `else` caught it.

### CS Lens

This is mutual exclusion in control flow. It partitions the input space into two complementary sets, guaranteeing totality (all inputs map to a branch) and exclusivity (no input maps to multiple branches).
Also recognized in: A/B testing splits, electrical double-throw switches, binary search trees (left vs right child traversal).

### SE Lens

Why not just write `if temp >= 37.5` and then `if temp < 37.5`? Using `else` is DRY (Don't Repeat Yourself). It ensures the condition is only evaluated once. If you later change the threshold to 38.0, you only have to change it in one place. Writing independent `if` statements invites bugs where changing one condition leaves a gap where neither runs.

### Commands Needed

None.

### Verification

Output is strictly predicted: verified standard branch logic.

### Connection

We can handle 1 or 2 outcomes. What if a problem has 5 possible outcomes, like grading a test?

---

## Concept Unit: `if` / `elif` / `else`

### The Problem

If we want to assign letter grades A, B, C, D, or F, a simple `if` / `else` isn't enough. We need a chain of conditions that are evaluated in order until one matches.

> **Socratic prompt:** If you get an 85 on a test, you qualify for a B (score >= 80) and a C (score >= 70). How do you think Python knows to stop at B and not also give you a C?

### Isolate the Concept

```python
def grade(score):
    if score >= 90:
        return 'A'
    elif score >= 80:
        return 'B'
    elif score >= 70:
        return 'C'
    elif score >= 60:
        return 'D'
    else:
        return 'F'

print(grade(95))
print(grade(83))
print(grade(55))
```
```text
A
B
F
```

This is an **`elif`** chain. This proves that Python tests conditions top-to-bottom, executes the FIRST branch that is `True`, and completely skips the rest.

### Discard the Example

This REPL code is discarded.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `decisions.py` (modified)
- **Change type**: add
- **Location**: appended to file
- **Dependencies**: none

### The New Code

```python
def grade(score):
    if score >= 90:
        return 'A'
    elif score >= 80:
        return 'B'
    elif score >= 70:
        return 'C'
    elif score >= 60:
        return 'D'
    else:
        return 'F'
```

### The Updated Project

```python
# decisions.py
# ... previous code unchanged ...
def classify_temperature(temp):
    if temp >= 37.5:
        print('Fever')
    else:
        print('Normal')

# ← new
def grade(score):
    if score >= 90:
        return 'A'
    elif score >= 80:
        return 'B'
    elif score >= 70:
        return 'C'
    elif score >= 60:
        return 'D'
    else:
        return 'F'
```

Our script now includes a multi-branch `grade` function.

### Mechanical Walkthrough

- `def grade(score):` — Function definition.
- `    if score >= 90:` — Evaluated first. If `True`, returns 'A'.
- `    elif score >= 80:` — **`elif`** is short for "else if". Evaluated *only if* the `score >= 90` condition was `False`.
- `    elif score >= 70:` — Evaluated only if the 80 condition was also `False`.
- `    else:` — The final catch-all. Runs only if every single `if` and `elif` above it was `False`.

**Execution trace for `grade(83)`:**
1. `grade(83)` — binds `score` to 83.
2. `score >= 90` — evaluates to `False`.
3. `score >= 80` — evaluates to `True`.
4. `return 'B'` — returns immediately. The 70, 60, and `else` branches are entirely skipped and never evaluated.

### CS Lens

This is a sequential pattern match or linear switch. It maps a single input through a prioritized cascade of predicates.
Also recognized in: firewall ruling tables (first match wins), HTTP routing middleware, pattern matching in functional languages (Ocaml, Rust).

### SE Lens

Why have a dedicated `elif` keyword? In languages like C or JavaScript, you write `else if`, which is technically an `else` block containing a brand-new `if` statement. Because Python uses strict indentation, writing `else:` followed by a nested `if` on the next line would force the code to march further to the right across the screen with every condition. `elif` keeps the chain perfectly flat visually, matching its logical flatness.

### Commands Needed

None.

### Verification

Output is strictly predicted: verified standard branch logic.

### Connection

We just saw `elif` keep things flat. What happens if we don't keep things flat, and instead nest `if` statements inside each other?

---

## Concept Unit: Nested conditionals vs elif chains

### The Problem

Sometimes, a secondary condition only makes sense to check if a primary condition passed. But placing `if` blocks inside other `if` blocks (nesting) can quickly make code unreadable. When should we nest, and when should we flatten?

> **Socratic prompt:** Look at the nested absolute value function below. Can you trace what path `x = 0` takes? How deeply indented is the `return 0` line?

### Isolate the Concept

```python
# Nested (harder to read):
def abs_val_nested(x):
    if x >= 0:
        if x == 0:
            return 0
        else:
            return x
    else:
        return -x

# Flat with elif (cleaner):
def abs_val_flat(x):
    if x > 0:
        return x
    elif x == 0:
        return 0
    else:
        return -x
```

These are **nested conditionals**. This proves that while nesting works logically, it forces the reader to hold multiple contexts in their head simultaneously. The flat `elif` version is vastly superior for readability.

### Discard the Example

This snippet is discarded.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `decisions.py` (modified)
- **Change type**: add
- **Location**: appended to file
- **Dependencies**: none

### The New Code

```python
def abs_val_flat(x):
    if x > 0:
        return x
    elif x == 0:
        return 0
    else:
        return -x
```

### The Updated Project

```python
# decisions.py
# ... previous code unchanged ...
def grade(score):
    # ...

# ← new
def abs_val_flat(x):
    if x > 0:
        return x
    elif x == 0:
        return 0
    else:
        return -x
```

We add the mathematically flat and readable `abs_val_flat` to our script.

### Mechanical Walkthrough

- `def abs_val_flat(x):` — Defines the absolute value function.
- `    if x > 0:` — First branch.
- `        return x` — Base positive case.
- `    elif x == 0:` — Evaluated only if `x <= 0`. If `True`, returns 0.
- `    else:` — Evaluated only if `x < 0`.
- `        return -x` — Negates a negative to make it positive.

By using `elif`, we avoid the **nested conditionals** pattern completely. In the nested version, the `else: return x` sits inside the `if x >= 0` block, forcing the reader to constantly track which indentation level they are in to understand what `else` belongs to.

### CS Lens

This is cyclomatic complexity management. Every `if` doubles the number of possible execution paths through a function. Deep nesting increases the cognitive load required to verify the code's correctness.
Also recognized in: Early returns (guard clauses), state machine flattening, and JSON parsing depth limits.

### SE Lens

Is nesting always bad? No. If the inner check only makes sense if the outer check passed (e.g., checking if a user is authenticated, and *then* checking if they have admin rights), nesting correctly models the domain. But when the conditions are mutually exclusive siblings (like positive, zero, and negative), nesting them arbitrarily is an anti-pattern. Prefer flat architectures (`elif`) over deep hierarchies (nesting).

### Commands Needed

None.

### Verification

Output is strictly predicted: flattening logic is syntactically equivalent.

### Connection

We've used statements to route control flow. But what if we just want to quickly assign a value based on a condition without dedicating 4 lines of code to it?

---

## Concept Unit: Conditional expressions (ternary operator)

### The Problem

If we want to label a number as 'positive' or 'non-positive', using a full `if`/`else` block requires 4 lines of code just to set one variable. Can we do this inline?

> **Socratic prompt:** If an `if` statement performs an action, and an expression (like `2 + 2`) evaluates to a value, how might a language combine them into an "if expression"?

### Isolate the Concept

```python
>>> x = 10
>>> label = 'positive' if x > 0 else 'non-positive'
>>> label
'positive'
>>> abs_x = x if x >= 0 else -x
>>> abs_x
10
```

This is a **conditional expression** (often called the ternary operator). This proves that `A if condition else B` evaluates directly to a value, making it an expression, not a statement.

### Discard the Example

This REPL code is discarded.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `decisions.py` (modified)
- **Change type**: add
- **Location**: appended to file
- **Dependencies**: none

### The New Code

```python
x = 10
label = 'positive' if x > 0 else 'non-positive'
```

### The Updated Project

```python
# decisions.py
# ... previous code unchanged ...
def abs_val_flat(x):
    # ...

# ← new
x = 10
label = 'positive' if x > 0 else 'non-positive'
```

Our script ends by elegantly labeling a variable in a single line.

### Mechanical Walkthrough

- `x = 10` — Variable assignment.
- `label` — New variable to store the string.
- `=` — Assignment operator.
- `'positive'` — The string evaluated and returned if the condition is `True`.
- `if x > 0` — The **boolean expression** condition placed in the middle.
- `else 'non-positive'` — The fallback string evaluated and returned if the condition is `False`.
This entire construct (`'positive' if x > 0 else 'non-positive'`) is a **conditional expression**. It evaluates to the string `'positive'`, which is then bound to `label`.

### CS Lens

This is an expression vs. statement distinction. In purely functional languages (like Haskell or Lisp), *everything* is an expression that returns a value, so `if` always works this way. Python is imperative, separating statements (which do things) from expressions (which yield values). The ternary operator bridges that gap.
Also recognized in: C/Java's `cond ? A : B`, Excel's `IF(cond, A, B)`.

### SE Lens

Why use this? It reduces boilerplate. However, it should only be used for trivial assignments. If you try to nest conditional expressions (e.g., `A if cond1 else B if cond2 else C`), it becomes an unreadable mess. Complex logic belongs in a full `if`/`elif`/`else` block. The tradeoff is terseness vs clarity; always choose clarity.

### Commands Needed

None.

### Verification

Predicted output for `label` is `'positive'`. Safe to assume.

### Connection

We can now route data and execution dynamically based on conditions.

---

## Closing

Conditionals are the bedrock of computation. Without them, a program is just a fixed sequence of steps. With them, programs can respond to data, make decisions, and handle unexpected states gracefully.

Lesson 4 adds iteration — making programs repeat steps, closing the loop on Turing completeness.

**Exercises:**
1. Write a function `fizzbuzz(n)` that returns `'FizzBuzz'` if n is divisible by both 3 and 5, `'Fizz'` if divisible by 3 only, `'Buzz'` if by 5 only, else the number as a string.
2. Write a function `bmi_category(bmi)` that returns `'Underweight'` (<18.5), `'Normal'` (18.5–25), `'Overweight'` (25–30), `'Obese'` (>=30).

---

## Connect the pieces

Let's trace how our script operates start to finish:
1. `is_five = x == 5` — A boolean expression asks a fundamental question and yields `True`.
2. `can_play_games = is_weekend and not has_homework` — Logical operators combine multiple booleans into a single state.
3. `is_safe = x != 0 and 10 / x > 2` — Short-circuit evaluation protects the program from crashing on a bad division.
4. `if temperature >= 37.5:` — A conditional statement acts on a boolean, printing a warning.
5. `grade(83)` — An `elif` chain evaluates a score against multiple thresholds, stopping flatly at `80` to return `'B'`.
6. `label = 'positive' if x > 0 else 'non-positive'` — A conditional expression quickly evaluates to a string inline.
Every piece is about formulating questions and defining the paths taken based on the answers.
