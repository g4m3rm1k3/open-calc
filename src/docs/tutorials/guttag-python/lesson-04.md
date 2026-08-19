# Lesson 4: Iteration — `while` and `for`

What you will build: The reader will write programs that repeat using `while` and `for`, understand `range()`, use `break` and `continue`, and write nested loops. The transferable problems: (1) a `while` loop repeats as long as a condition is true — you must ensure the condition eventually becomes False or the loop runs forever; (2) a `for` loop iterates over a sequence of values — it is the right tool when you know what you're iterating over; (3) `break` and `continue` control the flow inside a loop, but overuse makes code hard to follow.

What you need to know first: Lessons 0–3 (REPL, arithmetic, types, variables, conditionals, boolean operators).

**Terms used in this lesson**
- **`while`** — A language keyword that repeats a block of code continuously as long as its condition evaluates to True. It solves the problem of needing to do something an unknown number of times until a state changes.
- **`True`** — A boolean literal representing truth. It is used as a condition to deliberately create a loop that does not stop on its own.
- **`False`** — A boolean literal representing falsehood. A `while` loop stops when its condition becomes False.
- **`for`** — A language keyword that iterates over elements in a sequence, one by one. It solves the problem of needing to process every item in a known collection or sequence.
- **`in`** — A keyword used alongside `for` to specify the sequence from which elements are drawn.
- **`break`** — A keyword that immediately exits the innermost enclosing loop. It solves the problem of needing to stop iteration early when a target is found or an exit condition is met.
- **`continue`** — A keyword that skips the remaining statements in the current iteration of a loop and moves directly to the next iteration. It solves the problem of bypassing specific items without stopping the entire loop.
- **infinite loop** — A logical error (or intentional design) where a loop's condition never evaluates to False, causing execution to never proceed past the loop.
- **accumulator pattern** — A fundamental programming design pattern where a variable is initialized before a loop, updated incrementally during each iteration, and used after the loop completes. It solves the problem of calculating an aggregate value like a sum, count, or maximum.

**Objects and methods used**
- **`print`**
  - *What it is:* A built-in function that outputs text to the standard output stream.
  - *Implementation:* `print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)`
  - *Its use:* Used to display output to the user, such as the results of loop iterations or computations.
  - *Type:* Built-in function.
  - *Responsibility:* Converts given objects to strings and writes them to a stream, handling spacing and line endings.
  - *Depends on:* The objects passed to it, and standard output configuration.
  - *Connects to:* Calls `str()` on arguments and writes to standard output.
  - *Shape:* A global utility function available everywhere.
- **`input`**
  - *What it is:* A built-in function that reads a line of text from standard input.
  - *Implementation:* `input(prompt='')`
  - *Its use:* Used to pause execution and wait for the user to type a value, which is then used in a loop.
  - *Type:* Built-in function.
  - *Responsibility:* Displays an optional prompt, reads text from the user until a newline, and returns it as a string.
  - *Depends on:* Standard input stream being available.
  - *Connects to:* Halts execution waiting for user input, returning the typed string.
  - *Shape:* A global utility function for interactive I/O.
- **`float`**
  - *What it is:* A built-in class/function to represent and convert values to floating-point numbers.
  - *Implementation:* `class float(x=0.0)`
  - *Its use:* Used to convert user string input from `input()` into mathematical numbers.
  - *Type:* Built-in class constructor.
  - *Responsibility:* Parses a string or converts another number type into an IEEE 754 double-precision float.
  - *Depends on:* A parseable string or numeric argument.
  - *Connects to:* Returns a new float object.
  - *Shape:* A core type constructor used at data boundaries.
- **`range`**
  - *What it is:* A built-in sequence type that generates an arithmetic progression of integers.
  - *Implementation:* `class range(start, stop[, step])`
  - *Its use:* Used to generate a sequence of numbers for a `for` loop to iterate over.
  - *Type:* Built-in sequence class.
  - *Responsibility:* Lazily generates integers on demand based on start, stop, and step parameters.
  - *Depends on:* Integer arguments for its bounds.
  - *Connects to:* Consumed by iterators, like a `for` loop or `list()`.
  - *Shape:* A sequence generator used to drive iteration.
- **`list`**
  - *What it is:* A built-in mutable sequence type.
  - *Implementation:* `class list(iterable=())`
  - *Its use:* Used to force a lazy `range()` generator into a concrete collection of values for demonstration.
  - *Type:* Built-in class constructor.
  - *Responsibility:* Creates a concrete, mutable array of elements from an iterable.
  - *Depends on:* An iterable object (like a `range`).
  - *Connects to:* Consumes an iterable and stores its elements in memory.
  - *Shape:* A core data structure constructor.
- **`str.upper`**
  - *What it is:* A string instance method that returns a capitalized version of a string.
  - *Implementation:* `def upper(self) -> str`
  - *Its use:* Used in a loop to demonstrate processing and transforming each element of a collection.
  - *Type:* Instance method on the `str` class.
  - *Responsibility:* Computes and returns a new string where all cased characters are uppercase.
  - *Depends on:* The string instance it is called upon.
  - *Connects to:* Returns a new transformed string to the caller.
  - *Shape:* A pure data-transformation method on a primitive type.

## Concept Unit: The `while` loop — repeat while true

### The Problem
We need to execute a sequence of instructions multiple times without copying and pasting the code. How can we tell Python to keep repeating an action as long as some condition remains valid?

Given what you know about `if` statements checking conditions once, what would you try here first? Can you imagine a keyword that acts like an `if` but repeats? Pause and write a guess for what such syntax might look like.

### Introduce the concept in isolation
```python
x = 1
while x <= 5:
    print(x)
    x += 1
```

Output:
```text
1
2
3
4
5
```

Execution trace:
- Before iter 1: x=1, 1<=5 True → print 1, x becomes 2
- Before iter 2: x=2, 2<=5 True → print 2, x becomes 3
- Before iter 3: x=3, 3<=5 True → print 3, x becomes 4
- Before iter 4: x=4, 4<=5 True → print 4, x becomes 5
- Before iter 5: x=5, 5<=5 True → print 5, x becomes 6
- Before iter 6: x=6, 6<=5 False → loop exits

This construct is called a **`while` loop**. It evaluates the condition, and if `True`, runs the body. Crucially, something inside the body must eventually make the condition `False`.

### Discard the throwaway example
The isolated `while` loop example is now discarded and will not appear in our project again.

### Project Change
No reference counterpart — this is a from-scratch addition because we are writing a script to demonstrate loops.
- **Files affected**: `counter.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code
```python
x = 1
while x <= 5:
    print(x)
    x += 1
```

### The Updated Project
```python
# counter.py
x = 1         # ← new
while x <= 5: # ← new
    print(x)  # ← new
    x += 1    # ← new
```
This script initializes a variable and continuously prints and increments it until it exceeds 5.

### Mechanical walkthrough
- `x = 1`: Assigns the integer `1` to variable `x`.
- `while x <= 5:`: The `while` keyword starts the loop. It checks the boolean expression `x <= 5`.
- `print(x)`: Calls the built-in `print` function to output the value.
- `x += 1`: Modifies the variable `x` by adding `1`. This provides the mechanism to eventually make the loop condition False.

## Concept Unit: The infinite loop and how to exit it

### The Problem
What happens if the loop's condition never becomes False? How can we intentionally run a loop indefinitely but allow the user to exit when they are done?

If you forget to update the condition variable in a `while` loop, what do you think Python will do? Pause and guess what the program's behavior would be.

### Introduce the concept in isolation
```python
# Infinite loop (DON'T run without Ctrl+C ready):
while True:
    print('forever')
```

Output (Predicted):
The loop will endlessly print "forever" to the terminal.

This behavior is called an **infinite loop**. The condition `True` is always True, so it never stops. To stop it, you must press `Ctrl+C` in the terminal to interrupt the program.

### Discard the throwaway example
The isolated infinite loop is discarded and will not be used in our project as-is.

### Project Change
No reference counterpart — this is a from-scratch addition because we are writing a number-averaging script.
- **Files affected**: `average.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code
```python
total = 0
count = 0
while True:
    val = float(input('Enter a number (or -1 to stop): '))
    if val == -1:
        break
    total += val
    count += 1
if count > 0:
    print('Average:', total / count)
```

### The Updated Project
```python
# average.py
total = 0                                                   # ← new
count = 0                                                   # ← new
while True:                                                 # ← new
    val = float(input('Enter a number (or -1 to stop): '))  # ← new
    if val == -1:                                           # ← new
        break                                               # ← new
    total += val                                            # ← new
    count += 1                                              # ← new
if count > 0:                                               # ← new
    print('Average:', total / count)                        # ← new
```
This code creates a continuous prompt for user input, calculating an average. It stops deliberately when `-1` is given.

### Mechanical walkthrough
- `while True:`: Starts an infinite loop since `True` never evaluates to `False`.
- `input(...)`: Halts execution and reads text from the user.
- `float(...)`: Converts the entered string into a floating-point number.
- `if val == -1:`: Checks if the user intends to quit.
- `break`: The `break` keyword immediately halts the `while` loop, jumping to the first line after it.
- `total += val`: Adds to a running sum.
- `print(...)`: Outputs the final computed average.

## Concept Unit: `range()` — generating sequences of integers

### The Problem
If we want to iterate over numbers from 0 to 9, it is tedious to write them all out in a list or manually initialize a `while` loop counter. How can we ask Python to generate a sequence of numbers for us?

Think about how you count by twos, or count backwards. What parameters would a tool need to know to generate those sequences automatically?

### Introduce the concept in isolation
```python
print(list(range(5)))
print(list(range(1, 6)))
print(list(range(0, 10, 2)))
print(list(range(10, 0, -1)))
```

Output:
```text
[0, 1, 2, 3, 4]
[1, 2, 3, 4, 5]
[0, 2, 4, 6, 8]
[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
```

This tool is called **`range()`**. It takes a stop value (`range(stop)`), an optional start value (`range(start, stop)`), and an optional step (`range(start, stop, step)`). The stop value is always exclusive. Since `range` is lazy and computes values on demand, we wrap it in `list()` here just to force it to show all its values at once.

### Discard the throwaway example
The list-wrapped `range` examples are discarded and will not appear in the project.

### Project Change
No reference counterpart — building foundational iteration examples.
- **Files affected**: `range_demo.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code
```python
numbers = range(5)
```

### The Updated Project
```python
# range_demo.py
numbers = range(5) # ← new
```
Creates a sequence generator ready to be iterated over.

### Mechanical walkthrough
- `range(5)`: Calls the built-in `range` sequence constructor with a stop value of 5. It will lazily provide 0, 1, 2, 3, and 4.
- `numbers =`: Assigns the sequence generator to a variable.

## Concept Unit: The `for` loop — iterate over a sequence

### The Problem
When we have a collection of items (like the sequence from `range` or characters in a string), a `while` loop requires manually handling the indexing. How can we easily grab each item one by one?

If you have a string `"hello"`, how would you predict a loop processes it natively? Pause and think about what each step of an automatic sequence loop would bind to.

### Introduce the concept in isolation
```python
for i in range(5):
    print(i)

for char in 'hello':
    print(char)

fruits = ['apple', 'banana', 'cherry']
for fruit in fruits:
    print(fruit.upper())
```

Output:
```text
0
1
2
3
4
h
e
l
l
o
APPLE
BANANA
CHERRY
```

Execution trace for the `fruits` loop:
- Iter 1: `fruit` bound to `'apple'` → prints `APPLE`
- Iter 2: `fruit` bound to `'banana'` → prints `BANANA`
- Iter 3: `fruit` bound to `'cherry'` → prints `CHERRY`
- Exhausted sequence → loop ends.

This construct is called a **`for` loop**. It binds the target variable to each element of a sequence in turn. You cannot skip ahead by modifying the loop variable, because the loop just assigns it to the next element automatically at the start of the next iteration.

### Discard the throwaway example
The multiple `for` loops are discarded and will not be used in the project.

### Project Change
No reference counterpart.
- **Files affected**: `for_demo.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code
```python
for i in range(5):
    print(i)
```

### The Updated Project
```python
# for_demo.py
for i in range(5): # ← new
    print(i)       # ← new
```
This script iterates specifically over the numbers 0 through 4, printing each one.

### Mechanical walkthrough
- `for`: The language keyword initiating sequence iteration.
- `i`: The variable bound to the current element in the sequence during each step.
- `in`: The keyword linking the variable to the sequence it draws from.
- `range(5)`: The built-in sequence generator providing the elements.
- `print(i)`: Outputs the current element.

## Concept Unit: `break` — exit the loop early

### The Problem
Sometimes you are searching for a specific item in a sequence. Once you find it, there is no need to keep checking the rest. How can we stop a `for` loop before it finishes its sequence?

If you found the winning ticket in a pile, would you keep scratching the rest? Pause and think about how you might signal an early exit.

### Introduce the concept in isolation
```python
for i in range(1, 100):
    if i * i > 50:
        print('First i where i*i > 50:', i)
        break
```

Output:
```text
First i where i*i > 50: 8
```

Execution trace:
- i=1 to 7: condition False
- i=8: `8 * 8 > 50` is True → prints output → loop exits.

This keyword is called **`break`**. It immediately exits the innermost loop, jumping past any remaining iterations. It is perfect for stopping a search early.

### Discard the throwaway example
The search loop is discarded.

### Project Change
No reference counterpart.
- **Files affected**: `search.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code
```python
for i in range(1, 100):
    if i * i > 50:
        break
```

### The Updated Project
```python
# search.py
for i in range(1, 100): # ← new
    if i * i > 50:      # ← new
        break           # ← new
```
Searches through a range and stops early when a condition is met.

### Mechanical walkthrough
- `for i in range(1, 100):`: Iterates `i` from 1 to 99.
- `if i * i > 50:`: Checks if the square of `i` exceeds 50.
- `break`: Halts the loop immediately upon the condition evaluating to True.

## Concept Unit: `continue` — skip the rest of this iteration

### The Problem
What if we want to skip processing for just some elements, but we still want the loop to finish checking the rest of the sequence?

If you want to print only odd numbers, how can you bypass the print statement when you encounter an even one?

### Introduce the concept in isolation
```python
for i in range(10):
    if i % 2 == 0:
        continue
    print(i)
```

Output:
```text
1
3
5
7
9
```

Execution trace:
- i=0: `0 % 2 == 0` is True → continue → moves to i=1
- i=1: `1 % 2 == 0` is False → prints 1
- i=2: `2 % 2 == 0` is True → continue → moves to i=3

This keyword is called **`continue`**. It skips any remaining lines inside the loop body for the current iteration and goes straight to the next element.

### Discard the throwaway example
The odds-printing loop is discarded.

### Project Change
No reference counterpart.
- **Files affected**: `skip.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code
```python
for i in range(10):
    if i % 2 == 0:
        continue
    print(i)
```

### The Updated Project
```python
# skip.py
for i in range(10):     # ← new
    if i % 2 == 0:      # ← new
        continue        # ← new
    print(i)            # ← new
```
Iterates and skips even numbers using `continue`.

### Mechanical walkthrough
- `for i in range(10):`: Iterates `i` from 0 to 9.
- `if i % 2 == 0:`: Evaluates whether `i` is cleanly divisible by 2.
- `continue`: Aborts this specific iteration, jumping back to the top of the loop to fetch the next `i`.
- `print(i)`: Outputs the number, which only runs for odd values.

## Concept Unit: Nested loops

### The Problem
How can we generate combinations of things, like rows and columns in a grid? A single loop only travels along one dimension.

If you have a loop for "rows" and a loop for "columns", what happens if you place one inside the other? Pause and predict how many total print statements run if both loops repeat 3 times.

### Introduce the concept in isolation
```python
for i in range(1, 4):
    for j in range(1, 4):
        print(i * j, end='\t')
    print()  # newline after each row
```

Output:
```text
1	2	3	
2	4	6	
3	6	9	
```

Execution trace:
- i=1:
  - j=1: prints `1`
  - j=2: prints `2`
  - j=3: prints `3`
  - prints newline
- i=2:
  - j=1: prints `2`
  - ...and so on.

This is a **nested loop**. The inner loop completes its entire lifecycle for every single iteration of the outer loop. The `end='\t'` argument changes the `print` function's default behavior from printing a newline to printing a tab character, keeping outputs on the same line.

### Discard the throwaway example
The multiplication table is discarded.

### Project Change
No reference counterpart.
- **Files affected**: `grid.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code
```python
for i in range(1, 4):
    for j in range(1, 4):
        print(i * j, end='\t')
    print()
```

### The Updated Project
```python
# grid.py
for i in range(1, 4):           # ← new
    for j in range(1, 4):       # ← new
        print(i * j, end='\t')  # ← new
    print()                     # ← new
```
Generates a simple 3x3 coordinate grid layout of multiplication.

### Mechanical walkthrough
- `for i in range(1, 4):`: The outer loop, running 3 times.
- `for j in range(1, 4):`: The inner loop, which executes fully for each `i`.
- `print(i * j, end='\t')`: Computes the product and outputs it. `end='\t'` tells `print` to append a tab, not a newline.
- `print()`: An empty `print` call to move the cursor to the next line when the inner loop finishes.

## Concept Unit: Accumulator pattern — summing, counting, finding max

### The Problem
Looping over data is only half the battle. Often, we want to calculate a single summary value, like a total sum or the largest number seen. How do we keep track of data across multiple iterations?

If you are counting passing cars, you have a tally in your head that starts at 0. How does that translate to code before, during, and after a loop?

### Introduce the concept in isolation
```python
# Sum of squares from 1 to 10:
total = 0
for i in range(1, 11):
    total += i ** 2
print(total)

# Count evens:
count = 0
for i in range(100):
    if i % 2 == 0:
        count += 1
print(count)

# Find max without using max():
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
best = numbers[0]
for n in numbers:
    if n > best:
        best = n
print(best)
```

Output:
```text
385
50
9
```

Execution trace for sum of squares:
- Start: `total` = 0
- iter 1 (i=1): `total` + 1**2 → `total` becomes 1
- iter 2 (i=2): `total` + 2**2 → `total` becomes 5
- iter 3 (i=3): `total` + 3**2 → `total` becomes 14
- ... finishes at 385.

This design is the **accumulator pattern**. You initialize a variable before the loop, update it during each iteration based on your logic, and use the finalized value after the loop completes.

### Discard the throwaway example
The accumulator examples are discarded.

### Project Change
No reference counterpart.
- **Files affected**: `accumulate.py` (created)
- **Change type**: add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code
```python
total = 0
for i in range(1, 11):
    total += i ** 2
print(total)
```

### The Updated Project
```python
# accumulate.py
total = 0                # ← new
for i in range(1, 11):   # ← new
    total += i ** 2      # ← new
print(total)             # ← new
```
A script demonstrating the accumulator pattern to total a sequence of squares.

### Mechanical walkthrough
- `total = 0`: The initialization step. The accumulator starts at zero.
- `for i in range(1, 11):`: The loop providing the values.
- `total += i ** 2`: The update step. The square of `i` is computed and added to `total`.
- `print(total)`: The utilization step. We look at the final accumulated result.

---

Closing: iteration and conditionals together give a program the ability to do different things based on data and to repeat operations. Lesson 5 introduces functions — the tool for naming and reusing a computation. Exercises: write a program that prints the first 20 Fibonacci numbers; write a function `is_prime(n)` that returns True if n is prime (hint: check divisibility from 2 to sqrt(n)); write a nested loop that prints Pascal's triangle first 5 rows.
