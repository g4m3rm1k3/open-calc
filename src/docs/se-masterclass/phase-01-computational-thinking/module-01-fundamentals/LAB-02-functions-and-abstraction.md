# SE Masterclass — LAB-02 — Functions, Closures, and Memoization

**Language: Python**
*Why Python here:* Python's syntax is minimal — no semicolons, no `main()` boilerplate, no braces. The concept stays in focus. Python also makes closures and first-class functions syntax-light, so you see the pattern without fighting the language.

**Prerequisites:** LAB-01 (Variables, Types, and Memory in JavaScript).
This lab builds on the concept of values — functions ARE values in Python.

**What this lab adds:**
- A Python script that runs from your terminal right now
- Pure vs impure functions — why the distinction matters for testability
- Callbacks — passing functions as arguments to other functions
- Closures — functions that capture and remember surrounding state
- Memoization — caching expensive results using a closure-owned dictionary

**Time:** 90–120 minutes

---

> **Quick Check — answer these before reading further:**
>
> 1. If you call the same function twice with the same inputs, should it always return the same output? What would make that NOT true?
> 2. Can a function be stored in a variable? What does that mean exactly?
> 3. If a function is defined inside another function, can the inner function still access the outer function's variables after the outer function has finished running?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python main.py` prints:

```
=== Hello from Python ===

=== Pure Function ===
area of 4x5: 20
area of 4x5 again: 20   ← same inputs always same output

=== Side Effects ===
total: 10
total: 20   ← calling it again changed something outside the function

=== Default Parameters ===
Hello, world!
Hello, Alice!

=== First-Class Functions ===
applying double to 5: 10
applying square to 5: 25
results: [10, 25, 125]

=== Callbacks ===
transform([1,2,3], double): [2, 4, 6]
transform([1,2,3], square): [1, 4, 9]
filter_by([1,2,3,4,5,6], is_even): [2, 4, 6]

=== Closures ===
counter(): 1
counter(): 2
counter(): 3
adder_5(3): 8
adder_10(3): 13
adder_5(3) again: 8   ← independent — does not share state with adder_10

=== Memoization ===
fib(10) = 55
cache after fib(10): {0: 0, 1: 1, 2: 1, 3: 2, 4: 3, 5: 5, 6: 8, 7: 13, 8: 21, 9: 34, 10: 55}
fib(10) again = 55   ← returned from cache, no recomputation
fib(12) = 144        ← only computed fib(11) and fib(12), rest from cache
```

Each section is produced by one step. The output grows as you add each step.

---

### Language: Python Basics

Before writing any functions, here is the Python syntax used in this lab.

**Running a Python file:**
```
python main.py        # Windows (if Python was added to PATH as 'python')
python3 main.py       # macOS/Linux, or if both Python 2 and 3 are installed
```

**Python indentation rule:**
Python uses indentation (spaces/tabs) to define blocks — not `{` and `}`.
Everything indented under a `def` line is part of that function.
Unindenting ends the function.

```python
def greet():          # colon starts the block
    print("hello")    # 4 spaces of indentation — this is inside the function
    print("world")    # also inside

print("done")         # back to zero indentation — outside the function
```

**`print()` vs `console.log()`:**
In Python, `print()` is the equivalent of `console.log()`.
It prints to stdout (your terminal).

---

## Step 1 — Get Python Running

Create a folder called `lab-02`. Inside it, create `main.py`:

```python
print("=== Hello from Python ===")   # print() sends text to the terminal
```

### SAVE AND TRY

Open your terminal. Navigate to `lab-02`. Run:

```
python main.py
```

**You should see:**

```
=== Hello from Python ===
```

**In the terminal, type:**

```
python --version
```

**Expected:** A version number like `Python 3.11.0` or higher. If you see `Python 2.x`, use `python3 main.py` for the rest of this lab.

**Change something:** Change the string to anything. Save. Run. See the change. Change it back.

---

### Concept: What Is a Function?

**What it is:** A function is a named, reusable unit of computation. You define it once, call it many times.

**The problem before:**

```python
# Without functions — calculating the area of three rectangles:
area1 = 4 * 5
area2 = 10 * 3
area3 = 7 * 2
print(area1, area2, area3)
# The formula 'width * height' is repeated everywhere.
# If the formula needs to change, you must find every occurrence.
```

**The solution:** A function names the computation and lets you reuse it by name.

```python
def area(width, height):       # define the computation once
    return width * height      # return sends a value back to the caller

print(area(4, 5))              # call it — result: 20
print(area(10, 3))             # same computation, different inputs — result: 30
```

**Canonical example (General Explanation):**

Think of a function like a vending machine. You put in inputs (coins + button press).
You get back an output (drink). The machine does the same thing every time for
the same inputs. You do not need to know what happens inside — you only need to
know what to put in and what you get back.

```python
def vending_machine(coins, button):
    if coins >= 100 and button == "cola":
        return "Cola dispensed"
    return "Insufficient funds or unknown item"
```

**Project Application (The "Why" here):**

Every concept in this curriculum — parsers, state machines, renderers — will be
built out of functions. Understanding what a function is (a named, reusable,
input-output transformation) is the foundation for everything above it.

**Smallest possible example:**

```python
def double(x):
    return x * 2

result = double(5)    # result = 10
print(result)
```

**Why it matters here:** The steps that follow build on this: pure functions,
default parameters, and first-class functions. All of them extend this basic shape.

**Watch for:** In Python, forgetting `return` does not cause an error — the
function returns `None` silently. This is a frequent source of bugs where you
expect a value but get `None`.

---

## Step 2 — Define and Call a Function

Add to `main.py`:

```python
# === Pure Function ===
print("\n=== Pure Function ===")   # \n prints a blank line before the header


def area(width, height):           # ← add: 'def' starts the function definition
    return width * height          # ← add: 'return' sends the result back to the caller
                                   # function body ends when indentation returns to zero

result1 = area(4, 5)               # ← add: call the function — parentheses trigger execution
result2 = area(4, 5)               # ← add: call with the same inputs

print("area of 4x5:", result1)
print("area of 4x5 again:", result2, "  ← same inputs always same output")
```

### SAVE AND TRY

Save. Run `python main.py`.

**You should see:**

```
=== Hello from Python ===

=== Pure Function ===
area of 4x5: 20
area of 4x5 again: 20   ← same inputs always same output
```

**In the terminal, type:**

```
python -c "def area(w,h): return w*h; print(area(3,3))"
```

**Expected:** `9` — this is a one-liner Python program. The `-c` flag runs a string as code, equivalent to Node's `-e`.

**Change something:** Call `area(0, 100)`. What do you expect? Run it. Then call `area(4, 5) + area(2, 3)`. What does that print?

---

### Concept: Pure Functions vs Side Effects

**What it is:** A **pure function** always returns the same output for the same inputs and changes nothing outside itself. A function with **side effects** modifies something in the outside world — a variable, a file, a database.

**The problem before:**

```python
total = 0

def add_to_total(amount):
    total = total + amount   # BUG: modifies 'total' from the outer scope
    return total
```

This function is unpredictable. Its output depends on what happened before it was called, not just its inputs.

**The solution:**

```python
# Pure — no external dependency
def add(a, b):
    return a + b    # output depends ONLY on inputs

# Impure — depends on external state
total = 0
def add_to_total(amount):
    global total          # 'global' declares intent to modify the outer variable
    total = total + amount
```

**Canonical example (General Explanation):**

A calculator is pure: press `3 + 4 =` and you always get `7`, regardless of what
you pressed before. A bank account balance is impure: the current balance depends
on all previous transactions.

**Project Application (The "Why" here):**

Pure functions are trivially testable — given the same input, they always produce
the same output. Every function you can make pure should be pure. Side effects
should be isolated to as few places as possible. This is the foundation of
testability in LAB-27.

**Smallest possible example:**

```python
score = 0   # external state

# Impure — output depends on 'score'
def add_score(points):
    global score
    score += points
    return score

print(add_score(10))   # 10
print(add_score(10))   # 20 — same input, different output!
```

**Why it matters here:** Recognizing the difference between pure and impure
functions determines how your systems are testable, debuggable, and composable.

**Watch for:** Printing inside a function is a side effect. It is not always
wrong, but be intentional. A function that both returns a value AND prints is
doing two things — often a sign it should be split.

---

## Step 3 — Pure vs Impure

Add to `main.py`:

```python
# === Side Effects ===
print("\n=== Side Effects ===")

total = 0                          # ← add: external state that the function depends on


def add_to_total(amount):
    global total                   # ← add: 'global' explicitly declares we're modifying the outer variable
    total = total + amount         # ← add: this is the side effect — modifying something outside the function


add_to_total(10)
print("total:", total)             # ← add

add_to_total(10)
print("total:", total, "  ← calling it again changed something outside the function")  # ← add
```

### SAVE AND TRY

Save. Run `python main.py`.

**You should see the new section:**

```
=== Side Effects ===
total: 10
total: 20   ← calling it again changed something outside the function
```

**In the terminal, type:**

```
python -c "
x = 5
def pure(n): return n * 2
def impure(n):
    global x
    x += n
    return x
print(pure(3), pure(3))
print(impure(3), impure(3))
"
```

**Expected:** `6 6` (pure — same every time) then `8 11` (impure — output changes).

**Change something:** Remove the `global total` line. Run. Python raises `UnboundLocalError`. This is Python telling you: "you're trying to read a variable before assigning it in this scope." Add `global total` back.

---

### Concept: Default Parameters

**What it is:** A default parameter is a parameter that has a fallback value. If the caller does not provide that argument, the default is used.

**The problem before:**

```python
def greet(name):
    print("Hello,", name + "!")

greet("Alice")   # works
greet()          # TypeError: greet() missing 1 required positional argument: 'name'
```

**The solution:**

```python
def greet(name="world"):      # 'world' is used if no argument is given
    print("Hello,", name + "!")

greet()           # Hello, world!
greet("Alice")    # Hello, Alice!
```

**Canonical example (General Explanation):**

Think of a coffee machine: by default it brews one cup. If you press the `2 cups`
button, you override the default. The machine doesn't break if you don't specify — it
falls back to a sensible default.

**Project Application (The "Why" here):**

Default parameters allow functions to be useful in the common case while still
being configurable for specific cases. They reduce the number of overloaded
function variants needed. You will use this in LAB-25 (Configuration System)
where every config key has a default.

**Smallest possible example:**

```python
def connect(host, port=3000):
    print(f"Connecting to {host}:{port}")

connect("localhost")         # Connecting to localhost:3000
connect("localhost", 8080)   # Connecting to localhost:8080
```

**Watch for:** Default values are evaluated ONCE when the function is defined,
not every time it is called. This causes a classic Python bug with mutable defaults:

```python
def append_to(item, lst=[]):    # BUG: this list is shared across all calls!
    lst.append(item)
    return lst

print(append_to(1))   # [1]
print(append_to(2))   # [1, 2] — NOT [2]! The same list is reused.
```

The fix: use `None` as the default and create the list inside the function.

---

## Step 4 — Default Parameters

Add to `main.py`:

```python
# === Default Parameters ===
print("\n=== Default Parameters ===")


def greet(name="world"):              # ← add: "world" is used if no argument is given
    print(f"Hello, {name}!")          # ← add: f-string — curly braces insert the value of 'name'


greet()           # ← add: no argument — uses the default "world"
greet("Alice")    # ← add: provides an argument — overrides the default
```

### SAVE AND TRY

Save. Run `python main.py`.

**You should see:**

```
=== Default Parameters ===
Hello, world!
Hello, Alice!
```

**In the terminal:**

```
python -c "
def power(base, exponent=2):
    return base ** exponent    # ** is the power operator in Python
print(power(3))       # uses default exponent of 2
print(power(3, 3))    # uses provided exponent of 3
"
```

**Expected:** `9` then `27`.

**Change something:** Add a second default parameter `punctuation="!"` and change
the print to use it: `f"Hello, {name}{punctuation}"`. Call `greet("Alice", ".")`.
See `Hello, Alice.`. Change it back.

---

## 🎯 Challenge: Safe Divide

**You know:** Default parameters provide fallback values when arguments are not supplied.

**Task:** Write a function `safe_divide(a, b)` where `b` defaults to `1`.
It should return the division result. When called as `safe_divide(10)`, it
should return `10.0` (not crash with a ZeroDivisionError).

**Starting code:**

```python
def safe_divide(a, b=???):    # TODO: fill in the default
    # TODO: return the result
    pass   # 'pass' is Python for "empty body — do nothing yet"

print(safe_divide(10, 2))   # should print: 5.0
print(safe_divide(10))      # should print: 10.0  (b defaults to 1)
print(safe_divide(10, 0))   # should print: Error: division by zero
```

**Hint:** Handle the `b == 0` case with an `if` statement. In Python, `if b == 0: return "Error: division by zero"`.

---

<details>
<summary>▶ Show Solution</summary>

```python
def safe_divide(a, b=1):               # b defaults to 1, making division by nothing safe
    if b == 0:
        return "Error: division by zero"   # guard clause — handle the impossible input
    return a / b                       # / in Python always returns a float

print(safe_divide(10, 2))   # 5.0
print(safe_divide(10))      # 10.0
print(safe_divide(10, 0))   # Error: division by zero
```

**Key insight:** The guard clause (`if b == 0: return ...`) is a common pattern
for input validation at function boundaries. The function returns early with an
error description rather than crashing. This is the beginning of defensive
programming — an idea that reappears in every production system.

</details>

---

### Concept: First-Class Functions

**What it is:** In Python (and JavaScript), functions are values. You can
assign a function to a variable, store it in a list, or pass it as an argument
to another function — exactly like you would with a number or a string.

**The problem before:**

```python
# You want to apply different operations to a number.
# Without first-class functions, you write separate code for each case:
def apply_double(x):
    return x * 2

def apply_square(x):
    return x * x

# This scales badly — a new function per operation, repeated structure everywhere.
```

**The solution:** Accept the operation as a parameter:

```python
def apply(operation, x):    # 'operation' is a function passed in as a value
    return operation(x)     # call the function that was passed in

def double(x):
    return x * 2

print(apply(double, 5))   # 10 — double is passed without calling it (no parentheses)
```

**Canonical example (General Explanation):**

Think of a universal remote. The remote (the `apply` function) does not care what
it controls — it just presses the button. You decide what device to point it at
(which function to pass in). Same remote, different behavior depending on the device.

```python
def press_button(device, channel):   # device is a function
    return device(channel)           # call whatever function was passed

def tv(ch):  return f"TV on channel {ch}"
def radio(ch): return f"Radio on {ch}FM"

print(press_button(tv, 5))       # TV on channel 5
print(press_button(radio, 101))  # Radio on 101FM
```

**Project Application (The "Why" here):**

This is the foundation of the **Strategy Pattern** (LAB-40), **Plugin System**
(LAB-21), and **Command System** (LAB-23). Any time a system needs to do
"one of several possible things" without knowing in advance which one, it stores
a function and calls it. This is one of the most used patterns in all of software.

**Smallest possible example:**

```python
def apply(fn, value):
    return fn(value)

def double(x): return x * 2
def negate(x): return -x

print(apply(double, 5))   # 10
print(apply(negate, 5))   # -5
```

**Why it matters here:** The next step uses this to apply different operations
to a list of numbers — the same shape as `map()` in any language.

**Watch for:** `apply(double, 5)` passes `double` as a value — no parentheses.
`apply(double(), 5)` would CALL `double` immediately (with no arguments) and
pass its return value instead. Missing or adding parentheses when working with
first-class functions is the most common mistake here.

---

## Step 5 — First-Class Functions

Add to `main.py`:

```python
# === First-Class Functions ===
print("\n=== First-Class Functions ===")


def double(x):              # ← add: a simple operation — multiply by 2
    return x * 2


def square(x):              # ← add: another operation — multiply by itself
    return x * x


def cube(x):                # ← add: a third operation
    return x * x * x


def apply(operation, value):   # ← add: 'operation' is a function received as an argument
    return operation(value)    # ← add: call the function that was passed in


print("applying double to 5:", apply(double, 5))   # ← add: pass 'double' as a value — no ()
print("applying square to 5:", apply(square, 5))   # ← add

# Store functions in a list — they are just values
operations = [double, square, cube]                # ← add: a list of functions
results = []
for op in operations:                              # ← add: iterate over function values
    results.append(apply(op, 5))                  # ← add: apply each function to 5

print("results:", results)                         # ← add
```

### SAVE AND TRY

Save. Run `python main.py`.

**You should see the full output:**

```
=== Hello from Python ===

=== Pure Function ===
area of 4x5: 20
area of 4x5 again: 20   ← same inputs always same output

=== Side Effects ===
total: 10
total: 20   ← calling it again changed something outside the function

=== Default Parameters ===
Hello, world!
Hello, Alice!

=== First-Class Functions ===
applying double to 5: 10
applying square to 5: 25
results: [10, 25, 125]
```

**In the terminal:**

```
python -c "
def double(x): return x * 2
fn = double          # assign the function to a variable
print(fn(7))         # call it through the variable
print(fn is double)  # True — same function object
"
```

**Expected:** `14` then `True`. This confirms `fn` and `double` point to the same function object.

**Change something:** Add a `halve` function that divides by `2.0` and add it to
the `operations` list. Run. The results list grows to four items. Change it back.

---

## 🎯 Challenge: apply_all

**You know:** Functions are values. You can store them in a list and call them in a loop.

**Task:** Write a function `apply_all(operations, value)` that takes a list of
functions and a single value, and returns a list of results — one result per function.

**Starting code:**

```python
def double(x): return x * 2
def square(x): return x * x
def negate(x): return -x

def apply_all(operations, value):
    # TODO: apply each operation in the list to 'value'
    # TODO: return the list of results
    pass

results = apply_all([double, square, negate], 4)
print(results)   # should print: [8, 16, -4]
```

**Hint:** Create an empty list `[]`, loop over `operations`, append each result.

---

<details>
<summary>▶ Show Solution</summary>

```python
def apply_all(operations, value):
    results = []                        # start with an empty list
    for op in operations:               # loop over the list of function values
        results.append(op(value))       # call each function with the value, collect results
    return results
```

**Key insight:** `apply_all` is a manual implementation of Python's built-in
`map()` function. You will use this exact shape — "apply a function to every
item in a collection" — throughout the curriculum. In LAB-03 you will see how
Python's `map()`, `filter()`, and `reduce()` build on this same idea. In LAB-21
(Plugin System), plugins are stored exactly like the `operations` list here —
a collection of callable functions that get applied to data.

</details>

---

---

### Concept: Callbacks

**What it is:** A **callback** is a function passed to another function to be called at a specific point during that function's execution. The calling function decides *when* to call it; the caller decides *what* it does.

**The problem before:** Without callbacks, you write a separate function for every variation of "iterate and do something":

```python
def double_all(lst):
    result = []
    for x in lst:
        result.append(x * 2)   # hardcoded — can't reuse for other operations
    return result

def square_all(lst):
    result = []
    for x in lst:
        result.append(x * x)   # same loop structure, duplicated
    return result
```

**The solution:** Extract the varying part (the operation) as a parameter:

```python
def transform(lst, func):       # func is the callback
    result = []
    for x in lst:
        result.append(func(x)) # call whatever function was passed in
    return result

transform([1,2,3], double)      # [2, 4, 6]
transform([1,2,3], square)      # [1, 4, 9]
```

**What it hides (Law 7):** The loop mechanics. The callback only handles one element. `transform` handles all the iteration. Each side is isolated from the other's concerns.

**The protected invariant:** `transform` guarantees it applies `func` to every element in order and collects all results. The callback does not need to know it is being called in a loop.

**Where you will see this:** `Array.map()` in JavaScript, Python's `map()` and `filter()`, every event listener, every HTTP request handler, every timer — all callbacks.

---

## Step 6 — Callbacks

Add to `main.py`:

```python
# === Callbacks ===
print("\n=== Callbacks ===")

def transform(lst, func):          # ← add: func is a callback — applied to each element
    result = []
    for x in lst:
        result.append(func(x))     # ← add: call whatever function was passed in
    return result

# double and square already defined above — reuse them here
print(f"transform([1,2,3], double): {transform([1,2,3], double)}")   # ← add
print(f"transform([1,2,3], square): {transform([1,2,3], square)}")   # ← add

def is_even(x):                    # ← add: a predicate — returns True or False
    return x % 2 == 0              # % is modulo: x % 2 == 0 means x divides evenly by 2

def filter_by(lst, predicate):     # ← add: keep only elements where predicate returns True
    result = []
    for x in lst:
        if predicate(x):           # ← add: call the predicate callback
            result.append(x)
    return result

print(f"filter_by([1,2,3,4,5,6], is_even): {filter_by([1,2,3,4,5,6], is_even)}")  # ← add
```

### SAVE AND TRY

```
python main.py
```

**Expected new section:**
```
=== Callbacks ===
transform([1,2,3], double): [2, 4, 6]
transform([1,2,3], square): [1, 4, 9]
filter_by([1,2,3,4,5,6], is_even): [2, 4, 6]
```

**In the terminal, try:**
```
python -c "
def transform(lst, f): return [f(x) for x in lst]
def cube(x): return x**3
print(transform([1,2,3,4], cube))
"
```
**Expected:** `[1, 8, 27, 64]`

**Change something:** Write an `is_odd` predicate and pass it to `filter_by`. Check you get `[1, 3, 5]`. Change it back.

---

## 🎯 Challenge: compose

**You know:** Functions are values. Callbacks let you pass functions to other functions.

**Task:** Write a function `compose(f, g)` that returns a NEW function. When the returned function is called with a value `x`, it applies `g` first, then `f` to the result — equivalent to `f(g(x))`.

**Starting code:**
```python
def compose(f, g):
    # TODO: return a function that applies g then f
    pass

def double(x): return x * 2
def add_one(x): return x + 1

double_then_add = compose(add_one, double)   # add_one( double(x) )
print(double_then_add(5))    # double(5)=10, add_one(10)=11  → should print: 11

add_then_double = compose(double, add_one)   # double( add_one(x) )
print(add_then_double(5))    # add_one(5)=6, double(6)=12   → should print: 12
```

<details>
<summary>▶ Show Solution</summary>

```python
def compose(f, g):
    def composed(x):
        return f(g(x))    # apply g first, then f — this is function composition
    return composed
```

**Key insight:** `composed` is a closure — it captures `f` and `g` from `compose`'s scope. When `composed(5)` is called later, it still has access to those captured values even though `compose` finished executing. This is the same mechanism as `make_adder` — the inner function remembers the outer scope.

Function composition is a fundamental idea in functional programming, rendering pipelines, Unix pipes (`ls | grep | wc`), and middleware stacks.

</details>

---

### Concept: Closures

**What it is:** A **closure** is a function that retains access to variables from the scope where it was defined — even after that outer scope has finished executing. The inner function "closes over" the outer variables, keeping them alive.

**The problem before:** The only ways to give a function persistent private state are global variables (anything can modify them) or a class (heavy for simple cases).

**The solution:** Define the function inside another function. The inner function captures the outer function's local variables by reference. Those variables stay alive as long as the inner function exists.

**Canonical example:**

```python
def make_counter():
    count = 0                   # local variable in make_counter's scope

    def counter():              # inner function — closes over 'count'
        nonlocal count          # 'nonlocal' lets the inner function MODIFY the outer variable
        count += 1              # modifies the captured variable
        return count

    return counter              # return the function, NOT the result of calling it

c = make_counter()   # c is the inner 'counter' function
c()   # → 1
c()   # → 2
c()   # → 3
```

**What it hides (Law 7):** The `count` variable is invisible from outside. There is no way to set `count = 0` or `count = 999` from the calling code. The counter can only go up by exactly 1 per call, enforced by the function. That invariant is unbreakable from outside.

**The raw version — without closures:**
```python
count = 0           # global — anyone can do: count = 999
def counter():
    global count
    count += 1
    return count
# Nothing stops: count = -50
# The invariant "count only increments by 1" cannot be enforced
```

**The protected invariant:** The closure guarantees `count` can ONLY be modified by calling `counter()`. No external code can read or write `count` directly.

**`nonlocal` keyword:** Tells Python: "this variable comes from the immediately enclosing function scope." Required when you need to *reassign* (not just read) a variable from an outer scope. Without it, Python creates a new local variable instead.

**Where you will see this:** React's `useState` hook is a closure over internal component state. Every JavaScript event listener is a closure over the variables in scope when it was attached. The module pattern uses closures to create private variables in JavaScript (since there was no `class` with truly private fields until ES2022).

---

## Step 7 — Closures

Add to `main.py`:

```python
# === Closures ===
print("\n=== Closures ===")

def make_counter():              # ← add: outer function — owns the 'count' variable
    count = 0                    # ← add: this variable lives inside the closure

    def counter():               # ← add: inner function — closes over 'count'
        nonlocal count           # ← add: use the outer 'count', not a new local one
        count += 1
        return count

    return counter               # ← add: return the function itself (no parentheses = not calling it)

counter = make_counter()         # ← add: creates one closure with its own private 'count'
print(f"counter(): {counter()}")   # ← add
print(f"counter(): {counter()}")
print(f"counter(): {counter()}")

# Each call to make_adder creates a SEPARATE closure with its own 'n'
def make_adder(n):               # ← add
    def adder(x):                # ← add: closes over 'n'
        return x + n
    return adder

adder_5  = make_adder(5)         # ← add: adder_5 closes over n=5
adder_10 = make_adder(10)        # ← add: adder_10 closes over n=10 — completely separate closure

print(f"adder_5(3): {adder_5(3)}")          # ← add
print(f"adder_10(3): {adder_10(3)}")
print(f"adder_5(3) again: {adder_5(3)}   ← independent — does not share state with adder_10")
```

### SAVE AND TRY

**Expected new section:**
```
=== Closures ===
counter(): 1
counter(): 2
counter(): 3
adder_5(3): 8
adder_10(3): 13
adder_5(3) again: 8   ← independent — does not share state with adder_10
```

**In the terminal, try:**
```
python -c "
def make_multiplier(n):
    def multiplier(x): return x * n
    return multiplier
times3 = make_multiplier(3)
times7 = make_multiplier(7)
print(times3(4), times7(4))
"
```
**Expected:** `12 28` — two independent closures, each with their own captured `n`.

**Change something:** Create `counter2 = make_counter()`. Call it 3 times. Call the original `counter` 2 more times. Confirm they each track completely independently. Change it back.

---

## 🎯 Challenge: Closure with Reset

**You know:** `make_counter` returns an inner function that increments a captured variable.

**Task:** Write `make_counter_with_reset()` that returns TWO functions: `increment` and `reset`. Both share the same captured `count`. `increment` adds 1 and returns the new count. `reset` sets count back to `0`.

**Starting code:**
```python
def make_counter_with_reset():
    count = 0

    def increment():
        # TODO
        pass

    def reset():
        # TODO
        pass

    return increment, reset   # Python can return multiple values as a tuple

inc, rst = make_counter_with_reset()
print(inc())   # 1
print(inc())   # 2
print(inc())   # 3
rst()
print(inc())   # 1  ← back to 1 after reset
```

<details>
<summary>▶ Show Solution</summary>

```python
def make_counter_with_reset():
    count = 0

    def increment():
        nonlocal count
        count += 1
        return count

    def reset():
        nonlocal count
        count = 0   # both functions close over the SAME 'count' variable

    return increment, reset
```

**Key insight:** Both `increment` and `reset` close over the *same* `count` variable. When `reset` sets it to `0`, the next `increment` call sees `0`. Multiple closures can share and mutate the same captured state — this is essentially a lightweight object without needing a class.

</details>

---

### Concept: Memoization

**What it is:** **Memoization** (from "memo" — write it down) is an optimization where a function caches its results. The first time it is called with a given input, it computes the result and stores it. On subsequent calls with the same input, it returns the stored result immediately — no recomputation.

**The problem before:** Some functions are called repeatedly with the same arguments and are expensive to compute. Recursive Fibonacci is the clearest example — without caching, `fib(35)` recomputes `fib(10)` thousands of times:

```
fib(5)
├── fib(4)
│   ├── fib(3)
│   │   ├── fib(2)
│   │   │   ├── fib(1)  ← computed
│   │   │   └── fib(0)
│   │   └── fib(1)      ← computed AGAIN
│   └── fib(2)          ← entire subtree computed AGAIN
└── fib(3)              ← entire subtree computed AGAIN
```

Without memoization, `fib(35)` makes 29+ million recursive calls.

**The solution:** Store computed results in a dictionary (cache). Before computing, check the cache. If the answer is there, return it. If not, compute, store, return.

**The closure connection:** The cache dictionary lives in the outer function's scope. The inner (memoized) function closes over it — the cache persists between calls because it lives in the closure, not in the function's local scope which is destroyed after each call.

**What it hides (Law 7):** Whether the result came from computation or cache. The caller calls `fib(10)` both times and gets `55` both times. They never know or care which path was taken.

**The protected invariant:** The cache is private. External code cannot corrupt it — only the memoized function reads from and writes to it.

**Where you will see this:** Python's `@functools.lru_cache` is built-in memoization. React's `useMemo` hook memoizes expensive computed values. DNS lookups are cached. HTTP responses are cached. The pattern is universal.

---

## Step 8 — Memoization

Add to `main.py`:

```python
# === Memoization ===
print("\n=== Memoization ===")

def make_memoized_fib():          # ← add: outer function creates and owns the cache
    cache = {}                    # ← add: the cache — dictionary mapping input → result

    def fib(n):                   # ← add: the fibonacci function, closed over cache
        if n in cache:            # ← add: cache hit — return stored result immediately
            return cache[n]

        if n <= 1:                # ← add: base cases — fib(0)=0, fib(1)=1
            result = n
        else:
            result = fib(n-1) + fib(n-2)   # ← add: recursive — fib calls itself

        cache[n] = result         # ← add: store result in cache before returning
        return result

    return fib                    # ← add: return the inner function (which closes over cache)

fib = make_memoized_fib()        # ← add: creates the closure — fib has its own private cache

print(f"fib(10) = {fib(10)}")
print(f"cache after fib(10): {fib.__closure__[0].cell_contents}")   # ← inspect closure internals
print(f"fib(10) again = {fib(10)}   ← returned from cache, no recomputation")
print(f"fib(12) = {fib(12)}        ← only computed fib(11) and fib(12), rest from cache")
```

### SAVE AND TRY

**Expected new section:**
```
=== Memoization ===
fib(10) = 55
cache after fib(10): {0: 0, 1: 1, 2: 1, 3: 2, 4: 3, 5: 5, 6: 8, 7: 13, 8: 21, 9: 34, 10: 55}
fib(10) again = 55   ← returned from cache, no recomputation
fib(12) = 144        ← only computed fib(11) and fib(12), rest from cache
```

**Measure the difference — run these two in the terminal:**

*Without memoization:*
```
python -c "
import time
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)
start = time.time()
print(fib(35))
print(f'no cache: {time.time()-start:.4f}s')
"
```

*With memoization:*
```
python -c "
import time
def make_fib():
    cache = {}
    def fib(n):
        if n in cache: return cache[n]
        result = n if n <= 1 else fib(n-1) + fib(n-2)
        cache[n] = result
        return result
    return fib
fib = make_fib()
start = time.time()
print(fib(35))
print(f'memoized: {time.time()-start:.6f}s')
"
```

**Expected:** Same result (`9227465`). The no-cache version takes seconds. The memoized version is effectively instant. Same output, completely different performance.

---

## 🎯 Challenge: Generic memoize

**You know:** Memoization stores results keyed by input. Closures provide the private cache.

**Task:** Write a generic `memoize(func)` that takes ANY single-argument function and returns a memoized version. The cache should be private to each memoized function — calling `memoize` twice creates two independent caches.

**Starting code:**
```python
def memoize(func):
    # TODO: create a cache, return an inner function that checks the cache
    # before calling func
    pass

def slow_double(x):
    return x * 2   # pretend this is expensive

fast_double = memoize(slow_double)
print(fast_double(5))   # 10  — computed and cached
print(fast_double(5))   # 10  — from cache
print(fast_double(3))   # 6   — computed (new input)
print(fast_double(3))   # 6   — from cache

fast_square = memoize(lambda x: x * x)   # 'lambda' is Python's one-line anonymous function
print(fast_square(4))   # 16  — independent cache from fast_double
```

**Hint:** `lambda x: x * x` is shorthand for `def f(x): return x * x` — a function with no name. The cache is keyed by the argument value.

<details>
<summary>▶ Show Solution</summary>

```python
def memoize(func):
    cache = {}                  # private cache — one per call to memoize()

    def wrapper(x):
        if x in cache:
            return cache[x]     # cache hit
        result = func(x)        # cache miss — call the original function
        cache[x] = result       # store before returning
        return result

    return wrapper
```

**Key insight:** `memoize` is a **higher-order function** — it takes a function and returns a function. `wrapper` closes over both `cache` AND `func` from `memoize`'s scope. Each call to `memoize()` creates its own independent cache. This is the exact pattern behind Python's `@functools.lru_cache` — which does this same thing but also supports evicting old entries when the cache grows too large (LRU = Least Recently Used).

You can use `memoize` as a decorator: `@memoize` above a function definition is syntactic sugar for `func = memoize(func)`.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `python main.py` runs without errors | No red text, all 7 sections print |
| `area(4, 5)` returns `20` both times | Pure function section shows identical results |
| `add_to_total(10)` returns `10` then `20` | Same input, different output due to side effect |
| `greet()` with no argument prints `Hello, world!` | Default parameter works |
| `apply(double, 5)` returns `10` | First-class function passed and called |
| `transform([1,2,3], double)` returns `[2, 4, 6]` | Callback applied to list |
| `filter_by([1,2,3,4,5,6], is_even)` returns `[2, 4, 6]` | Predicate callback filters correctly |
| `counter()` returns 1, 2, 3 on successive calls | Closure captures and increments count |
| `adder_5` and `adder_10` are independent | Each closure holds its own captured `n` |
| `fib(10)` returns `55` | Memoized recursive fibonacci correct |
| `fib(10)` second call hits cache (cache shows 11 entries after first call) | Cache inspection confirms no recomputation |
| `fib(12)` returns `144` with only 2 new cache entries added | Incremental cache usage confirmed |
| You can explain what a closure is out loud in one sentence | Without notes |

---

## Quick Check Answers

**1. If you call the same function twice with the same inputs, should it always return the same output? What would make that NOT true?**

For a **pure function**, yes — same inputs always produce the same output. For an **impure function**, no — if the function reads external state (a global variable, a file, the current time, a database) between calls, the same inputs can produce different results. `add_to_total(10)` returns `10` the first time and `20` the second — same input, different output — because it reads AND writes `total` which persists between calls.

**2. Can a function be stored in a variable? What does that mean exactly?**

Yes. Functions in Python are first-class values. `double` (no parentheses) is the function object — a value in memory. `double(5)` calls it and produces `10`. When you write `fn = double`, both `fn` and `double` point to the same function object. `fn(5)` is identical to `double(5)`. This is what makes callbacks possible: you pass `double` (not `double(5)`) as an argument, and the receiving function calls it later.

**3. If a function is defined inside another function, can the inner function still access the outer function's variables after the outer function has finished running?**

Yes — this is exactly what a closure is. The inner function captures the outer function's local variables. Those variables stay alive as long as the inner function exists, even after the outer function's call stack frame is gone. In `make_counter`, after `make_counter()` returns, `count` continues to exist inside the closure. Each call to `counter()` reads and modifies that captured `count`. The outer function is done; its variable lives on inside the closure.

---

*Next: [LAB-03 — Arrays, Iteration, and Higher-Order Functions](LAB-03-arrays-and-iteration.md)*
