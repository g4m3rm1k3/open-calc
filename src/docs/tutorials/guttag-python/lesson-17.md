# Lesson 17: Debugging — Systematic Fault Finding

**What you will build**
You will build a systematic mental framework and toolset for identifying, isolating, and fixing bugs in your programs. A bug always has a CAUSE and a SYMPTOM. The traceback shows the symptom, not always the cause. Reading tracebacks bottom-to-top finds the cause. Print-debugging is the fastest tool for simple bugs, while the `pdb` debugger is for complex ones. Bisection debugging — narrowing the bug's location by eliminating half the code at a time — is a universal strategy that works on any program.

**What you need to know first**
- Lessons 0–16 (all prior Python through exceptions and testing).

**Terms used in this lesson**
- **SyntaxError** — an error that occurs when Python parses the code, before execution even begins. It exists to stop the program from running at all if the code violates the language rules.
- **ZeroDivisionError** — a runtime error that occurs when dividing a number by zero. It exists to prevent undefined mathematical operations from producing silent garbage values.
- **Traceback** — a report of the call stack at the point an exception was raised. It exists to show you exactly which function calls led to the crash, helping trace the execution path backward.
- **pdb** — the Python Debugger module. It exists to let developers pause execution, step through code line by line, and inspect variables interactively, rather than guessing what happened.
- **float('-inf')** — a special floating-point representation of negative infinity. It exists to provide a starting comparison value guaranteed to be smaller than any real number.
- **None** — the null object in Python. It exists to represent the absence of a value or a state where a variable hasn't been assigned anything meaningful yet.

**Objects and methods used**
- **print**
  - *What it is:* A built-in function that outputs data to the standard output stream.
  - *Implementation:* `def print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)`
  - *Its use:* Used here as the primary tool for "print-debugging" to reveal variable states during execution.
  - *Type:* Built-in free function.
  - *Responsibility:* Converts given objects to strings and writes them to the console so developers and users can see output.
  - *Depends on:* The objects passed to it, and an available standard output stream.
  - *Connects to:* Called by your code; connects to `sys.stdout` and the terminal display.
  - *Shape:* A standard library utility used anywhere in the application layer.
- **breakpoint**
  - *What it is:* A built-in function that drops the program into the interactive debugger (`pdb`).
  - *Implementation:* `def breakpoint(*args, **kws)`
  - *Its use:* Used to pause execution at a specific line to interactively explore variables and step through loops.
  - *Type:* Built-in free function.
  - *Responsibility:* Triggers a debugger break, temporarily halting program execution and opening an interactive prompt.
  - *Depends on:* The `sys.breakpointhook()` which by default invokes `pdb.set_trace()`.
  - *Connects to:* Called by your code; connects to the `pdb` module and intercepts terminal standard input.
  - *Shape:* A diagnostic tool injected directly into business logic, intended to be removed before production.
- **enumerate**
  - *What it is:* A built-in function that adds a counter to an iterable.
  - *Implementation:* `class enumerate(iterable, start=0)`
  - *Its use:* Used to get both the index (`i`) and the value (`x`) simultaneously while iterating over a list, which is crucial for printing detailed debug logs.
  - *Type:* Built-in class/iterator.
  - *Responsibility:* Yields pairs containing a count (from start) and a value yielded by the iterable argument.
  - *Depends on:* An iterable object (like a list) provided as its argument.
  - *Connects to:* Called by a `for` loop; connects to the internal sequence of the provided list.
  - *Shape:* A loop utility used in any block of code processing collections.
- **type**
  - *What it is:* A built-in function that returns the type of an object.
  - *Implementation:* `class type(object)`
  - *Its use:* Used in print-debugging to verify if a value is secretly an unexpected type (e.g., `NoneType` instead of `int`).
  - *Type:* Built-in class used as a function.
  - *Responsibility:* Inspects an object in memory and returns its exact runtime class.
  - *Depends on:* The object instance passed into it.
  - *Connects to:* Called by your debug code; returns a type object.
  - *Shape:* A runtime introspection tool.
- **id**
  - *What it is:* A built-in function that returns the unique identity of an object.
  - *Implementation:* `def id(obj)`
  - *Its use:* Used to check for aliasing bugs by confirming whether two variables point to the exact same memory address.
  - *Type:* Built-in free function.
  - *Responsibility:* Returns an integer that is guaranteed to be unique and constant for this object during its lifetime.
  - *Depends on:* The object instance passed to it.
  - *Connects to:* Called by your code; queries the CPython memory allocator.
  - *Shape:* A low-level inspection tool.

---

## Concept Unit: Three Kinds of Errors

### The Problem

Programs fail. When writing software, things go wrong in different ways: sometimes a program won't even start, sometimes it crashes halfway through, and sometimes it finishes but gives you a completely wrong answer. 

Given what you already know about how Python executes code, what happens if you forget a closing parenthesis? What happens if you try to divide by zero? Pause and try predicting the exact error messages before reading further.

### Introduce the concept in isolation

Let's run a quick throwaway lab to see these failures directly.

```python
# Lab: Three errors
# 1. Syntax Error (Uncomment to see)
# def bad_function(
#    print('hello')

# 2. Runtime Error
def runtime_error():
    return 1 / 0
    
# 3. Semantic Error
def average(lst):
    return sum(lst) / len(lst) + 1  # BUG

try:
    runtime_error()
except Exception as e:
    print(f"Caught: {type(e).__name__}")
    
print(f"Average of [1, 2, 3]: {average([1, 2, 3])}")
```

Running this code produces:

```
Caught: ZeroDivisionError
Average of [1, 2, 3]: 3.0
```

This lab demonstrates **Syntax, Runtime, and Semantic Errors**. The output proves that runtime errors crash explicitly (`ZeroDivisionError`), while semantic errors silently return the wrong value (`3.0` instead of `2.0`). Syntax errors prevent execution entirely.

### Discard the throwaway example

The lab snippet above is deleted. It will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our debugging scripts.
- **Files affected:** Created `math_utils.py`
- **Change type:** Add
- **Location:** At the top of the file
- **Dependencies:** None

### The New Code

```python
def calculate_average(numbers):
    total = sum(numbers)
    count = len(numbers)
    return total / count + 1
```

### The Updated Project

```python
# ← new
def calculate_average(numbers):
    total = sum(numbers)
    count = len(numbers)
    return total / count + 1
```

The function `calculate_average` computes the average of a list of numbers, but it contains a semantic error that needs to be debugged.

### Mechanical walkthrough

- `def calculate_average(numbers):` defines a new function. `def` is a keyword creating a function object.
- `total = sum(numbers)` calls the built-in `sum` function to add up the elements.
- `count = len(numbers)` calls the built-in `len` function to find the number of elements.
- `return total / count + 1` performs division and addition. The `+ 1` introduces a semantic bug, meaning the function runs smoothly but produces incorrect mathematics.

### CS lens

Also recognized in: compiler theory (lexical vs syntactic vs semantic analysis), database query planning, communication protocols (malformed packets vs logical state errors). 

### SE lens

The principle here is **Fail Fast**. Syntax errors and runtime errors fail fast—they scream immediately. Semantic errors do not fail fast; they corrupt data silently. The engineering cost of a semantic bug is vastly higher because it might persist for months before being noticed, which is why testing exists.

### Commands needed

No commands needed yet.

### Run it

```python
print(calculate_average([10, 20, 30]))
```

Output:
```
21.0
```

### One sentence connecting this unit to what came immediately before

Now that we know semantic errors are silent and deadly, we need a way to trace exactly what a program did when a runtime error *does* make it crash.

---

## Concept Unit: Reading a Traceback

### The Problem

When a program crashes deeply inside a sequence of function calls, the final error message (like `ZeroDivisionError`) tells you *what* happened, but not *how* the program got there. How can you figure out the exact path execution took?

Look at a crash message. What information would you need to retrace the steps from the start of the program to the line that crashed?

### Introduce the concept in isolation

Let's look at a throwaway lab to see how Python reports the path to a crash.

```python
def c_lab(x):
    return 1 / x

def b_lab(x):
    return c_lab(x - 1)

def a_lab(x):
    return b_lab(x - 1)

a_lab(1)
```

Running this prints:

```
Traceback (most recent call last):
  File "lab.py", line 10, in <module>
    a_lab(1)
  File "lab.py", line 8, in a_lab
    return b_lab(x - 1)
  File "lab.py", line 5, in b_lab
    return c_lab(x - 1)
  File "lab.py", line 2, in c_lab
    return 1 / x
ZeroDivisionError: division by zero
```

This demonstrates a **Traceback**. The output proves that the crash happened in `c_lab` at line 2, but the root cause (passing `1`) started all the way up at line 10. By reading from bottom to top, we can follow the exact flow of data.

### Discard the throwaway example

The lab snippet above is deleted. It will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** Modified `math_utils.py`
- **Change type:** Add
- **Location:** Below `calculate_average`
- **Dependencies:** None

### The New Code

```python
def divide_by(x):
    return 100 / x

def process_data(value):
    return divide_by(value - 5)

def run_pipeline():
    process_data(5)
```

### The Updated Project

```python
def calculate_average(numbers):
    total = sum(numbers)
    count = len(numbers)
    return total / count + 1

# ← new
def divide_by(x):
    return 100 / x

def process_data(value):
    return divide_by(value - 5)

def run_pipeline():
    process_data(5)
```

These new functions simulate a multi-step pipeline where bad data entering at the top causes a crash at the bottom.

### Mechanical walkthrough

- `def divide_by(x):` defines a function.
- `return 100 / x` performs division. If `x` is `0`, it raises a `ZeroDivisionError`.
- `def process_data(value):` takes a value.
- `return divide_by(value - 5)` calls `divide_by`.
- `def run_pipeline():` starts the chain.
- `process_data(5)` passes `5`. `5 - 5` becomes `0`, crashing `divide_by`.

### CS lens

Also recognized in: Call stacks in operating systems, execution contexts in JavaScript, stack unwinding in C++ exceptions.

### SE lens

The principle is **Observability**. A system must record how it arrived at a failure state. The alternative is crashing silently, which requires guessing. The cost of generating a traceback is minimal compared to the hours saved during incident response.

### Commands needed

No commands needed.

### Run it

```python
run_pipeline()
```

Output:
```
Traceback (most recent call last):
  File "math_utils.py", line 14, in <module>
    run_pipeline()
  File "math_utils.py", line 12, in run_pipeline
    process_data(5)
  File "math_utils.py", line 9, in process_data
    return divide_by(value - 5)
  File "math_utils.py", line 6, in divide_by
    return 100 / x
ZeroDivisionError: division by zero
```

### One sentence connecting this unit to what came immediately before

Tracebacks show us the path to a crash, but when a program *doesn't* crash and just gives wrong answers, we need to inspect data while it runs using print debugging.

---

## Concept Unit: Print-Debugging

### The Problem

If a function returns the wrong value, a traceback won't help you because the code never crashed. You need to see what the variables are actually holding at different moments in time. 

If you have a loop that is mysteriously skipping elements, where is the most logical place to look at the data?

### Introduce the concept in isolation

Let's run a throwaway lab to see print-debugging.

```python
def find_max_lab(lst):
    best = 0 
    for i, x in enumerate(lst):
        print(f'DEBUG: i={i}, x={x}, best={best}')
        if x > best:
            best = x
    return best

find_max_lab([-3, -1, -5])
```

Output:
```
DEBUG: i=0, x=-3, best=0
DEBUG: i=1, x=-1, best=0
DEBUG: i=2, x=-5, best=0
```

This demonstrates **Print-Debugging**. The output proves that `best` starts at `0` and never updates because none of the negative numbers are greater than `0`. By using **print**, we exposed the silent logical state.

### Discard the throwaway example

The lab snippet above is deleted. It will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** Modified `math_utils.py`
- **Change type:** Add
- **Location:** Below `run_pipeline`
- **Dependencies:** None

### The New Code

```python
def find_max(lst):
    best = 0
    for i, x in enumerate(lst):
        print(f'DEBUG: i={i}, x={x}, best={best}')
        if x > best:
            best = x
    return best
```

### The Updated Project

```python
def run_pipeline():
    process_data(5)

# ← new
def find_max(lst):
    best = 0
    for i, x in enumerate(lst):
        print(f'DEBUG: i={i}, x={x}, best={best}')
        if x > best:
            best = x
    return best
```

The `find_max` function includes our debug print to reveal its broken internal logic.

### Mechanical walkthrough

- `best = 0` initializes the variable to `0`.
- `for i, x in enumerate(lst):` loops over the list. **enumerate** is a built-in function that yields both the index `i` and the value `x` simultaneously, crucial for detailed debugging.
- `print(f'DEBUG: i={i}, x={x}, best={best}')` calls the built-in **print** function. **print** converts the formatted string into terminal output, revealing the internal state.
- `if x > best:` evaluates the condition. Since all `x` values are negative, this is always false against `0`.

### CS lens

Also recognized in: System logging, audit trails, printf-debugging in C.

### SE lens

The principle is **State Transparency**. We are taking invisible memory states and making them visible on the console. The alternative is using a heavy debugger, which can be overkill for simple logic checks. The trade-off is that `print` statements must be manually cleaned up before production.

### Commands needed

No commands needed.

### Run it

```python
result = find_max([-10, -20, -5])
print(f"Final: {result}")
```

Output:
```
DEBUG: i=0, x=-10, best=0
DEBUG: i=1, x=-20, best=0
DEBUG: i=2, x=-5, best=0
Final: 0
```

### One sentence connecting this unit to what came immediately before

Print-debugging is incredibly fast for loops, but when a function is highly complex or state changes continuously, we need a way to literally pause time using `pdb`.

---

## Concept Unit: `breakpoint()` and `pdb`

### The Problem

Sometimes printing isn't enough. If you have 10,000 items and the bug happens on item 8,900, printing everything will flood your terminal. You need to pause the program exactly when things get weird and explore the data manually.

What would you do if you could freeze a running program right in the middle of a loop?

### Introduce the concept in isolation

Let's use a throwaway lab to demonstrate `breakpoint()`.

```python
def compute_lab(data):
    total = 0
    for item in data:
        # We will not actually pause in this non-interactive test, 
        # but this is exactly how you trigger pdb.
        breakpoint() 
        total += item
    return total
```

This demonstrates the **pdb interactive debugger**. The `breakpoint()` function halts execution and hands control over to the terminal, where you can type `p item` to inspect values, `n` to step to the next line, or `c` to continue. 

### Discard the throwaway example

The lab snippet above is deleted. It will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** Modified `math_utils.py`
- **Change type:** Add
- **Location:** Below `find_max`
- **Dependencies:** None

### The New Code

```python
def compute(data):
    total = 0
    for item in data:
        breakpoint()
        total += item
    return total
```

### The Updated Project

```python
def find_max(lst):
    # ... logic ...
    return best

# ← new
def compute(data):
    total = 0
    for item in data:
        breakpoint()
        total += item
    return total
```

The `compute` function now explicitly pauses execution on every loop iteration, dropping the developer into `pdb`.

### Mechanical walkthrough

- `for item in data:` begins a loop over the elements.
- `breakpoint()` calls the built-in **breakpoint** function. This function pauses the program's execution entirely and invokes the `pdb` module. It hijacks the terminal, presenting an interactive `(Pdb)` prompt. 
- `total += item` adds the item to the total, but only after the developer types `c` (continue) or `n` (next) in the interactive prompt.

### CS lens

Also recognized in: GDB in C/C++, hardware breakpoints in CPU architecture, browser DevTools debuggers.

### SE lens

The principle is **Interactive Introspection**. Being able to poke at live memory saves you from having to guess what state caused the crash. The trade-off is speed; interactive debugging is a manual, human-time process, unlike automated tests.

### Commands needed

No external commands; within `pdb`, commands are:
- `p expr`: print expression
- `n`: next line
- `c`: continue execution
- `q`: quit

### Run it

*(Stated from confidence, not executed interactively since this environment is non-interactive)*
When you run `compute([10, 20])`, the terminal pauses and shows:
```
-> total += item
(Pdb) p item
10
(Pdb) c
-> total += item
(Pdb)
```

### One sentence connecting this unit to what came immediately before

While `pdb` lets you inspect a specific line, finding *which* line has the bug in a massive file requires a search strategy known as Bisection Debugging.

---

## Concept Unit: Bisection Debugging

### The Problem

If you have a 1,000-line script that produces the wrong output, reading all 1,000 lines top-to-bottom is incredibly slow. How can you find the exact line causing the problem faster?

Think about how you look up a word in a physical dictionary. Do you read from page 1, or do you open it to the middle?

### Introduce the concept in isolation

Let's run a throwaway lab to demonstrate Bisection Debugging logically.

```python
def massive_process():
    x = 10
    # ... 50 lines of code ...
    x = 20
    print(f"MIDPOINT: x is {x}") # The bisection print
    # ... 50 lines of code ...
    x = -5 # BUG!
    return x

massive_process()
```

Output:
```
MIDPOINT: x is 20
```

This demonstrates **Bisection Debugging**. By printing at the midpoint, the output proves the bug (returning `-5`) happens *after* the midpoint, meaning we can completely ignore the first 50 lines of code.

### Discard the throwaway example

The lab snippet above is deleted. It will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** Modified `math_utils.py`
- **Change type:** Add
- **Location:** Below `compute`
- **Dependencies:** None

### The New Code

```python
def process_data_long(val):
    val = val * 2
    val = val + 10
    print(f"MIDPOINT DEBUG: val={val}")
    val = val - 50
    val = val / 2
    return val
```

### The Updated Project

```python
def compute(data):
    # ... logic ...
    return total

# ← new
def process_data_long(val):
    val = val * 2
    val = val + 10
    print(f"MIDPOINT DEBUG: val={val}")
    val = val - 50
    val = val / 2
    return val
```

We added `process_data_long`, artificially inserting a print statement directly in the middle to cut our search space in half.

### Mechanical walkthrough

- `val = val * 2` and `val = val + 10` execute the first half of the logic.
- `print(f"MIDPOINT DEBUG: val={val}")` calls the built-in **print** function. We check the value here. If the value is correct at this point, the bug *must* be in the second half.
- `val = val - 50` and `val = val / 2` execute the second half.

### CS lens

Also recognized in: Binary search algorithms, Git bisect, decision trees.

### SE lens

The principle is **Logarithmic Search**. Bisection debugging is $O(\log N)$. If a file has 1,000 lines, you can find the exact bug in just 10 midpoint checks. The alternative is linear search $O(N)$, reading line-by-line, which scales terribly.

### Commands needed

No commands needed.

### Run it

```python
result = process_data_long(10)
print(f"FINAL: {result}")
```

Output:
```
MIDPOINT DEBUG: val=30
FINAL: -10.0
```

### One sentence connecting this unit to what came immediately before

Bisection tells you *where* the bug is, but once you find the line, you must use Scientific Debugging to prove *why* it's broken.

---

## Concept Unit: Scientific Debugging

### The Problem

You found the line that breaks. Now you have to fix it. Guessing and randomly changing `+` to `-` until the code works is dangerous. How do you systematically figure out what went wrong?

If a machine stops working, an engineer doesn't just kick it; they form a hypothesis. How can you test a hypothesis in code?

### Introduce the concept in isolation

Let's run a throwaway lab to see the scientific method applied to code.

```python
# Symptom: This fails when passing a list with None in it.
# Hypothesis: None is being compared with an integer.
# Test: Print the types.

def find_smallest_lab(lst):
    for x in lst:
        # Test the hypothesis
        if x is None:
            print("Hypothesis confirmed: Found None!")
            continue

find_smallest_lab([5, 3, None, 1])
```

Output:
```
Hypothesis confirmed: Found None!
```

This demonstrates **Scientific Debugging**. The output proves our hypothesis was true without changing the fundamental logic of the program. 

### Discard the throwaway example

The lab snippet above is deleted. It will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** Modified `math_utils.py`
- **Change type:** Add
- **Location:** Below `process_data_long`
- **Dependencies:** None

### The New Code

```python
def get_minimum(lst):
    minimum = float('inf')
    for x in lst:
        print(f"DEBUG: Checking {x}, type: {type(x)}")
        if x < minimum:
            minimum = x
    return minimum
```

### The Updated Project

```python
def process_data_long(val):
    # ... logic ...
    return val

# ← new
def get_minimum(lst):
    minimum = float('inf')
    for x in lst:
        print(f"DEBUG: Checking {x}, type: {type(x)}")
        if x < minimum:
            minimum = x
    return minimum
```

We added `get_minimum` and included a print statement that outputs `type(x)` to specifically test the hypothesis that bad types are entering the loop.

### Mechanical walkthrough

- `minimum = float('inf')` sets the starting value.
- `for x in lst:` loops through items.
- `print(f"DEBUG: Checking {x}, type: {type(x)}")` uses the built-in **print** function to output the value, and the built-in **type** function. **type** returns the exact class of the object in memory, testing our hypothesis about what data we are actually receiving.

### CS lens

Also recognized in: Scientific method, root cause analysis, A/B testing.

### SE lens

The principle is **Falsifiability**. Every debug print or test should be designed to definitively prove a hypothesis true or false. Guess-and-check programming creates fragile systems because you might "fix" the bug by introducing another one.

### Commands needed

No commands needed.

### Run it

```python
try:
    get_minimum([10, 5, None, 3])
except Exception as e:
    print(f"Crashed with: {type(e).__name__}")
```

Output:
```
DEBUG: Checking 10, type: <class 'int'>
DEBUG: Checking 5, type: <class 'int'>
DEBUG: Checking None, type: <class 'NoneType'>
Crashed with: TypeError
```

### One sentence connecting this unit to what came immediately before

Now that we know how to form hypotheses, we can look at the most common bugs that you will hypothesize about daily.

---

## Concept Unit: Common Bugs and How to Catch Them

### The Problem

Many bugs aren't unique snowflakes; they are the exact same logical mistakes repeated by every programmer on earth. 

What happens if a loop processes 9 items instead of 10? What happens if two variables secretly point to the same list?

### Introduce the concept in isolation

Let's demonstrate a common bug (Aliasing) in a throwaway lab.

```python
def alias_lab():
    list_a = [1, 2, 3]
    list_b = list_a  # Aliasing bug
    list_b.append(4)
    print(f"list_a id: {id(list_a)}, content: {list_a}")
    print(f"list_b id: {id(list_b)}, content: {list_b}")

alias_lab()
```

Output:
```
list_a id: 1403212456, content: [1, 2, 3, 4]
list_b id: 1403212456, content: [1, 2, 3, 4]
```
*(Memory IDs will vary, but they will be identical)*

This demonstrates **Aliasing**. The output proves that modifying `list_b` also modified `list_a` because they share the same memory location, revealed by the `id()` function.

### Discard the throwaway example

The lab snippet above is deleted. It will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** Modified `math_utils.py`
- **Change type:** Add
- **Location:** Bottom of file
- **Dependencies:** None

### The New Code

```python
def clean_list(lst):
    print(f"DEBUG ID: {id(lst)}")
    for item in lst:
        if item < 0:
            lst.remove(item)
    return lst
```

### The Updated Project

```python
def get_minimum(lst):
    # ... logic ...
    return minimum

# ← new
def clean_list(lst):
    print(f"DEBUG ID: {id(lst)}")
    for item in lst:
        if item < 0:
            lst.remove(item)
    return lst
```

This function demonstrates Mutating While Iterating, another incredibly common bug.

### Mechanical walkthrough

- `print(f"DEBUG ID: {id(lst)}")` uses the built-in **id** function. **id** returns the unique memory address of the object, which helps us track if this list is shared elsewhere. **print** displays it.
- `for item in lst:` iterates through the list.
- `lst.remove(item)` modifies the list *while* the loop is running over it, causing the loop's internal index to skip the next item entirely.

### CS lens

Also recognized in: Concurrent modification exceptions in Java, data races in multithreading, memory aliasing in C.

### SE lens

The principle is **Immutability by Default**. Modifying a data structure while iterating over it breaks the iterator's implicit contract. The solution is always to iterate over a copy or build a new list from scratch.

### Commands needed

No commands needed.

### Run it

```python
my_data = [1, -1, -2, 3]
print(clean_list(my_data))
```

Output:
```
DEBUG ID: 1234567890
[1, -2, 3]
```
*(Notice how `-2` was skipped because removing `-1` shifted `-2` into the position the loop had already processed).*

### One sentence connecting this unit to what came immediately before

Understanding these common traps allows you to short-circuit the bisection and hypothesis steps entirely when you recognize the symptoms.

---

## Closing

We've explored tracebacks to find the crash source, print-debugging to reveal hidden states, `pdb` for interactive exploration, bisection to narrow search spaces, and the scientific method for isolating root causes.

Let's connect the pieces: a bug in a massive file throws a **ZeroDivisionError** (Runtime error). We read the **Traceback** bottom-to-top to find the crashed function. We use **Bisection Debugging** to find exactly where the bad `0` entered the system. We formulate a hypothesis that the user passed a `None` which converted to `0`, test it with **type()** via **print-debugging**, and finally fix the issue.

Next lesson: Lesson 18 covers files — reading and writing data from disk.
