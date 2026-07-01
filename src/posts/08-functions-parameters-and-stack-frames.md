# Post 8: Functions, Parameters, and Stack Frames

## What you will build

Your own reusable, named pieces of code that take input, do something with
it, and hand back a result — the tool that turns scattered, repeated logic
into a single, callable, well-named unit. By the end you'll understand not
just how to write a function, but what actually happens in memory each
time one runs.

## What you need to know first

Post 7 (Dictionaries and Hash Maps), and everything before it — variables,
control flow, loops, lists. Functions are used throughout this post in
service of ideas you already know; nothing new is assumed beyond those.

---

## The lesson

### Step 1: The problem repetition (again) solves

You've already seen `print()`, `len()`, `range()`, and other **built-in
functions** throughout this series — pieces of pre-written functionality
you call by name. This post is about writing your *own*.

Suppose you need to greet several people:

```python
print(f"Hello, Alice! Welcome.")
print(f"Hello, Bob! Welcome.")
print(f"Hello, Carol! Welcome.")
```

```
Hello, Alice! Welcome.
Hello, Bob! Welcome.
Hello, Carol! Welcome.
```

This works, but the *pattern* — "Hello, [name]! Welcome." — is duplicated
three times. If you wanted to change the message later (say, to "Hi"
instead of "Hello"), you'd need to find and edit every single occurrence.
This is exactly the same repetition problem loops solved for repeated
*actions* — functions solve it for repeated *logic*, callable by name
wherever it's needed.

---

### Step 2: Defining your first function

Open the REPL or a file:

```python
def greet(name):
    print(f"Hello, {name}! Welcome.")
```

**Walkthrough:** `def` is a **keyword** (recall from the control-flow post:
a reserved word with special meaning) that begins a **function
definition**. `greet` is the name you're giving this function — chosen by
you, following the same naming rules as variables. `(name)` declares a
**parameter**: a placeholder name that will receive a value each time the
function is called. The colon and indented block below it work exactly
like an `if` statement's block (from the control-flow post) — the
indentation defines what's "inside" the function.

Defining a function does not run it. Type just the definition above and
press Enter (or run a file containing only it) — nothing prints. The
function now *exists*, ready to be called, but defining it is not the same
as calling it.

```python
greet("Alice")
greet("Bob")
greet("Carol")
```

```
Hello, Alice! Welcome.
Hello, Bob! Welcome.
Hello, Carol! Welcome.
```

**Walkthrough:** `greet("Alice")` is a **function call** — the parentheses
with a value inside them tell Python "run the `greet` function now, with
`name` bound to `"Alice"`." Each call temporarily binds the parameter
`name` to whatever **argument** (the actual value passed in) was given,
runs the function's body using that value, and then moves on. The pattern
("Hello, [name]! Welcome.") now exists in exactly one place — if you want
to change the message, there's exactly one line to edit.

**What breaks without correct indentation:** Exactly as with `if`
statements, if the body of a function isn't indented:

```python
def greet(name):
print(f"Hello, {name}! Welcome.")
```

```
IndentationError: expected an indented block after function definition on line 1
```

This is the same category of error from the control-flow post — Python
needs indentation to know which lines belong inside the function.

---

### Step 3: Returning a value

`greet` *prints* something, but doesn't give anything back to whatever
called it. Often, you want a function to compute a value and hand it back
for further use:

```python
def square(number):
    return number * number
```

```python
result = square(5)
print(result)
print(square(3) + square(4))
```

```
25
25
```

**Walkthrough:** `return` is a keyword that does two things at once: it
immediately stops the function's execution at that point, and it sends a
value back to wherever the function was called from. `result = square(5)`
calls `square` with `number` bound to `5`, computes `5 * 5 = 25`, and the
`return` statement sends `25` back — which is then assigned to `result`,
exactly like any other assignment from this series' variables post.
`square(3) + square(4)` calls `square` twice, getting back `9` and `16`,
then adds those two *returned* results together — `25`. This is an
important capability: a function's return value can be used directly
inside a larger expression, not just stored in a variable first.

**What's the difference between `print` and `return`?** This trips up
many beginners, so it's worth stopping on directly:

```python
def add_and_print(a, b):
    print(a + b)


def add_and_return(a, b):
    return a + b


add_and_print(2, 3)
result = add_and_return(2, 3)
print(f"The stored result is: {result}")
```

```
5
The stored result is: 5
```

**Walkthrough:** `add_and_print` displays a value on the screen but gives
nothing back to the caller — try `x = add_and_print(2, 3)` and `x` would be
`None` (Python's "nothing" value, briefly seen in the dictionaries post),
because nothing was ever `return`ed. `add_and_return` computes a value and
sends it back silently — nothing appears on screen unless the *caller*
explicitly prints it. `print` is for *displaying* something to a human
right now; `return` is for *handing back* a value so other code can use it
later, possibly without ever displaying it at all.

**CS lens — what does "stops execution immediately" actually mean?**

```python
def check_number(n):
    if n < 0:
        return "negative"
    return "non-negative"
    print("This line never runs")


print(check_number(-5))
print(check_number(5))
```

```
negative
non-negative
```

**Walkthrough:** `print("This line never runs")` is never reached, for
*either* call — every path through `check_number` hits a `return` before
ever reaching it. The first call enters the `if`, finds `n < 0` true, and
returns `"negative"` immediately, skipping everything after the `if`
block entirely. The second call skips the `if` body (since `5 < 0` is
`False`) and hits the second `return` directly. Once a function executes
a `return` statement, it is done — no further lines in that function run
for that particular call, no matter what comes after in the code.

---

### Step 4: Multiple parameters, and the symbol table connection

```python
def calculate_total(price, quantity, tax_rate):
    subtotal = price * quantity
    tax = subtotal * tax_rate
    return subtotal + tax


total = calculate_total(9.99, 3, 0.08)
print(f"${total:.2f}")
```

```
$32.37
```

**Walkthrough:** `calculate_total` takes three parameters, separated by
commas — the call `calculate_total(9.99, 3, 0.08)` matches each argument
to each parameter *by position*: `price` gets `9.99`, `quantity` gets `3`,
`tax_rate` gets `0.08`, in the order both were written. Inside the
function, `subtotal` and `tax` are **local variables** — created fresh,
inside the function's own symbol table (recall the symbol table from this
series' variables post), existing only while this particular call is
running.

**CS lens — what is a stack frame?** This is worth stopping on directly,
because it explains behavior you'll otherwise find confusing later. Every
time a function is called, Python creates a new, separate **stack frame**:
a chunk of memory holding that call's own local variables (its own
symbol table, distinct from any other function's, and distinct from the
symbol table at the top level of your program) and tracking exactly where
execution should resume once the function returns. Picture stack frames as
physically stacked, like a stack of trays: calling a function adds a new
tray on top; returning from it removes that tray, revealing whatever was
beneath. Prove this directly:

```python
def outer_function():
    x = "outer's x"
    inner_function()
    print(x)


def inner_function():
    x = "inner's x"
    print(x)


outer_function()
```

```
inner's x
outer's x
```

**Walkthrough:** Two completely separate variables, both named `x`, exist
at the same time — one inside `outer_function`'s stack frame, one inside
`inner_function`'s. They do not collide or overwrite each other, because
each function call has its own private symbol table. When `inner_function`
finishes and returns, its stack frame (and its `x`) is discarded entirely
— execution resumes in `outer_function`, where its *own* `x` is completely
unaffected, still holding `"outer's x"`.

**What breaks without separate stack frames:** If every function shared
one single, global symbol table, then calling any function with a
parameter or local variable name that happened to match a variable name
used somewhere else in the program would silently overwrite it — a bug
that would make writing any function riskier the larger a codebase grows,
since you'd need to know every variable name used *anywhere* in the
program to avoid an accidental collision. Separate stack frames are what
make it safe to write a function without knowing or caring what variable
names exist outside it.

---

### Step 5: Default arguments

```python
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")


greet("Alice")
greet("Bob", "Hi")
greet("Carol", greeting="Hey")
```

```
Hello, Alice!
Hi, Bob!
Hey, Carol!
```

**Walkthrough:** `greeting="Hello"` gives the `greeting` parameter a
**default value** — if a call doesn't provide a value for it, `"Hello"` is
used automatically. `greet("Alice")` supplies only `name`, so `greeting`
falls back to its default. `greet("Bob", "Hi")` supplies both, by
position — `"Hi"` matches `greeting` because it's the second argument,
matching the second parameter. `greet("Carol", greeting="Hey")` uses a
**keyword argument** — naming the parameter explicitly at the call site
(`greeting="Hey"`) rather than relying on position. Keyword arguments are
especially useful once a function has several parameters, since they make
a call self-documenting: `greet("Carol", greeting="Hey")` is clearer at a
glance than a long call relying purely on positional order.

**What breaks without care here:** Default arguments must come *after*
non-default ones in a function's parameter list:

```python
def broken_greet(greeting="Hello", name):
    print(f"{greeting}, {name}!")
```

```
SyntaxError: parameter without a default follows parameter with a default
```

**Walkthrough of the failure:** Python needs to be able to tell,
unambiguously, which arguments in a call correspond to which parameters
when some have defaults and some don't — placing a non-default parameter
after a default one creates a structural ambiguity Python refuses to
allow, catching this at parse time (recall from the control-flow post:
before the program even runs) rather than letting it become a confusing
runtime bug.

---

### Step 6: Functions calling functions

Functions can call other functions — this is how complex behavior gets
built from simple pieces:

```python
def is_even(number):
    return number % 2 == 0


def count_evens(numbers):
    count = 0
    for number in numbers:
        if is_even(number):
            count += 1
    return count


result = count_evens([1, 2, 3, 4, 5, 6])
print(result)
```

```
3
```

**Walkthrough:** `%` is the **modulo operator** — new syntax, briefly
worth defining here even though it's a small piece: it returns the
*remainder* of dividing the left side by the right side. `number % 2`
gives `0` for any even number (no remainder when divided by 2) and `1`
for any odd number — `number % 2 == 0` is therefore a standard, idiomatic
way to test evenness. `count_evens` uses the accumulator pattern from the
loops post (`count = 0`, incremented inside the loop) combined with a call
to `is_even` on each item — `count_evens` doesn't need to know *how*
`is_even` determines evenness, only that calling it with a number returns
`True` or `False`. This separation — one function focused narrowly on one
small check, another function focused on iterating and counting — is the
beginning of writing functions that are each individually simple and
easy to verify, combined to do more complex work.

**SE lens — why split this into two functions instead of one?** A single
function combining both jobs would work identically for this exact use
case — but `is_even` alone is now independently reusable anywhere
evenness needs checking, and independently testable (you could verify
`is_even(4) == True` and `is_even(3) == False` without needing a list at
all). This is an early, concrete instance of a principle named more fully
in later posts in this series: each function should ideally do one
well-defined job, and complex behavior should be built by combining
simple, well-tested pieces rather than writing one large function that
does everything at once.

---

### Step 7: Putting it together

Create `temperature_converter.py`, building incrementally.

```python
def celsius_to_fahrenheit(celsius):
    return celsius * 9 / 5 + 32
```

Run a quick check in the REPL or a temporary line: `print(celsius_to_fahrenheit(0))` should give `32.0`, and `print(celsius_to_fahrenheit(100))` should give `212.0` — confirming the formula before building further.

Now extend the file:

```python
def celsius_to_fahrenheit(celsius):
    return celsius * 9 / 5 + 32


def fahrenheit_to_celsius(fahrenheit):
    return (fahrenheit - 32) * 5 / 9


def describe_temperature(celsius):
    fahrenheit = celsius_to_fahrenheit(celsius)
    if celsius <= 0:
        description = "freezing"
    elif celsius < 20:
        description = "cool"
    elif celsius < 30:
        description = "warm"
    else:
        description = "hot"
    return f"{celsius}°C ({fahrenheit:.1f}°F) is {description}"


temperatures = [-5, 15, 25, 35]

for temp in temperatures:
    print(describe_temperature(temp))
```

```
python3 temperature_converter.py
```

```
-5°C (23.0°F) is freezing
15°C (59.0°F) is cool
25°C (77.0°F) is warm
35°C (95.0°F) is hot
```

**Walkthrough:** `describe_temperature` calls `celsius_to_fahrenheit`
internally — combining a small, focused conversion function with
branching logic (from the control-flow post) to build a more complete
piece of behavior. The `for` loop (from the loops post) calls
`describe_temperature` once per item in `temperatures`, printing each
result. Every concept from this series so far — variables, f-strings,
control flow, loops — is being reused here, now organized through
functions rather than written as one long, undifferentiated block of
code.

---

## Connect the pieces

Functions are the mechanism that turns "a sequence of steps" into "a
named, reusable, independently callable unit." Every concept from earlier
in this series — variables and the symbol table, control flow, loops,
lists, dictionaries — continues to work exactly the same way *inside* a
function as outside one; what changes is that each function call gets its
own private stack frame, its own symbol table, isolated from every other
call happening anywhere else in the program. This isolation is what makes
it safe to write `is_even` without worrying about what variables exist in
`count_evens`, or in any other function in the program. Every class you'll
meet in the very next post in this series is, underneath, built from
functions — a method is simply a function that lives inside a class and
automatically receives the specific object it was called on.

## What breaks without this

Without functions, every piece of repeated logic must be copy-pasted
everywhere it's needed, with every copy needing to be found and updated in
sync if the logic ever changes — exactly the same problem loops solved
for repeated *actions*, but for repeated *logic* instead. Programs beyond
a trivial size become unmanageable without the ability to name a piece of
logic once and call it by that name everywhere it's needed.

## Definition of done

- [ ] You can define a function with parameters and call it with different
      arguments.
- [ ] You can explain the difference between `print`ing a value inside a
      function and `return`ing it, including what happens if you try to
      store the result of a function that only prints.
- [ ] You've proven to yourself that two functions can each have a local
      variable with the same name without conflict, and can explain why,
      using the term "stack frame."
- [ ] You've used a default argument and a keyword argument in a function
      call.
- [ ] You've written one function that calls another function, and can
      explain why splitting logic into smaller functions can be useful
      even when a single larger function would technically work.
- [ ] You have a working, saved `temperature_converter.py` that uses at
      least two functions, one of which calls the other, and you've run it
      successfully.
