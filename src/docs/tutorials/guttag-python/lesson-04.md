# Lesson 04: Iteration — while and for

The reader understands Python's two loop constructs — while (condition-controlled) and for (iterator-controlled) — plus break, continue, else-on-loop, and range(). The transferable insight: iteration is controlled repetition. while tests a condition; for consumes an iterator. Every loop can be written as a while loop, but for loops are safer (no manual index management, no infinite-loop risk).

What you need to know first: 
Lessons 00-03.

Terms used in this lesson:
- **while** — A control flow statement that allows code to be executed repeatedly based on a given boolean condition. It tests the condition before each iteration.
- **for** — A control flow statement for iterating over a sequence (such as a list, tuple, dictionary, set, or string). It consumes an iterator and executes the body for each item.
- **break** — A keyword that immediately terminates the innermost enclosing loop, skipping the optional else clause if present.
- **continue** — A keyword that skips the rest of the current loop iteration and immediately returns to the loop's condition or next item to continue with the next iteration.
- **else (loop)** — An optional clause on a loop that executes only if the loop completed normally, meaning without encountering a break statement.
- **iterable** — Any object capable of returning its members one at a time, allowing it to be iterated over in a for loop.
- **iterator protocol** — The mechanism in Python where an iterable provides an iterator, which then produces values one by one until it signals exhaustion.
- **infinite loop** — A loop whose condition never becomes false, causing it to run endlessly unless interrupted externally.
- **accumulator pattern** — A common programming pattern where a variable is initialized before a loop and updated during each iteration to accumulate a final result, such as a sum or a list of items.

Objects and methods used:
- **range()**
  - *What it is:* The integer sequence generator in Python.
  - *Implementation:* `range(start, stop[, step])`. It returns an immutable sequence type.
  - *Its use:* To generate a sequence of numbers, commonly used to control the number of iterations in a `for` loop.
  - *Type:* A built-in class (though often used like a function) that represents an immutable sequence of numbers.
  - *Responsibility:* Generates arithmetic progressions of integers lazily, without creating a full list in memory.
  - *Depends on:* An integer `stop` value, and optionally integer `start` and `step` values.
  - *Connects to:* Consumed by `for` loops, or functions like `list()` that iterate over its generated values.
  - *Shape:* A standard library built-in accessible globally, acting as an iterable generator.

## Concept Unit: while loop — condition-controlled repetition

### The Problem
How do we execute a block of code multiple times without copying and pasting it? If we want to count down from 5 to 1, writing five separate print statements works, but what if we need to count down from 500? How can we tell the program to repeat an action as long as a certain condition remains true?

### Introduce the concept in isolation
```python
n = 5
while n > 0:
    print(n)
    n = n - 1
print("Done")
```
Output:
```text
5
4
3
2
1
Done
```
This proves that the code inside the **while** block repeatedly executes as long as `n > 0` evaluates to True, and execution continues sequentially after the condition becomes False. 

### Discard the throwaway
This code is discarded and will not be used in our project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating loop constructs.
- **Files affected:** `scratch/countdown.py` (created)
- **Change type:** add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code
```python
def count_down_while(start):
    current = start
    while current > 0:
        print(f"T-minus: {current}")
        current -= 1
```

### The Updated Project
```python
# 1: def count_down_while(start):
# 2:     current = start
# 3:     while current > 0:           # <- new
# 4:         print(f"T-minus: {current}") # <- new
# 5:         current -= 1             # <- new
```
The `count_down_while` function now takes a starting number and uses a while loop to print a countdown until it reaches zero.

### Mechanical walkthrough
- `while` keyword begins the loop.
- `current > 0` is the condition evaluated before each iteration. If it's `False` initially, the body is skipped completely.
- `:` marks the end of the condition and start of the indented block.
- `print(f"T-minus: {current}")` executes if the condition is `True`.
- `current -= 1` decrements the variable, which is crucial because something must change to eventually make the condition `False`, otherwise it results in an infinite loop.

### CS lens
The CS concept is **Condition-Controlled Iteration**. This appears in real-world systems like event loops in graphical user interfaces (running while the app is open), polling mechanisms waiting for a network response, or a thermostat continually checking the temperature while a target isn't met.

### SE lens
Design principle: state mutation visibility. The alternative not chosen is recursion. Using a while loop requires explicitly updating state (`current -= 1`), making the mutation visible and local, though it carries the tradeoff of potentially forgetting the update and causing an infinite loop.

### Commands needed
`python3 scratch/countdown.py`

### Run it
Predicted confidently:
```text
T-minus: 5
T-minus: 4
...
```

### One sentence connecting to previous unit
Now that we have condition-controlled repetition, let's look at how to repeat based on a fixed sequence rather than a changing condition.

## Concept Unit: for loop — iterator-controlled repetition

### The Problem
When we have a collection of items (like a list) and want to do something with each one, using a while loop requires manually managing an index variable and checking its bounds. How can we iterate directly over the items without manually tracking where we are?

### Introduce the concept in isolation
```python
items = ["apple", "banana", "cherry"]
for fruit in items:
    print(fruit)
```
Output:
```text
apple
banana
cherry
```
This proves that the **for** loop automatically extracts each item from the list sequentially and assigns it to the loop variable `fruit`, without needing a manual index or bounds check.

### Discard the throwaway
This code is discarded and will not be used in our project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating loop constructs.
- **Files affected:** `scratch/fruit_loop.py` (created)
- **Change type:** add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code
```python
def print_fruits(fruits):
    for fruit in fruits:
        print(f"Fruit: {fruit}")
```

### The Updated Project
```python
# 1: def print_fruits(fruits):
# 2:     for fruit in fruits:          # <- new
# 3:         print(f"Fruit: {fruit}")  # <- new
```
The `print_fruits` function iterates over the `fruits` iterable directly.

### Mechanical walkthrough
- `for` begins the iterator-controlled loop.
- `fruit` is the loop variable, which is assigned the current item from the iterable on each pass. Meaningful names are preferred (e.g., `for fruit in fruits` not `for x in y`).
- `in` specifies the iterable to draw values from.
- `fruits` is the iterable being consumed.
- `:` ends the declaration and starts the indented body.
- `print(f"Fruit: {fruit}")` uses the loop variable. The loop is safer than a while loop because there's no manual increment or risk of an infinite loop from a forgotten update.

### CS lens
The CS concept is the **Iterator Pattern**. This appears in real-world systems like reading rows from a database cursor one by one, processing lines in a massive log file without loading it all into memory, or traversing a directory structure in a file system.

### SE lens
Design principle: declarative over imperative code. The alternative not chosen is a `while` loop with an index counter. Using a `for` loop declares *what* we are iterating over rather than *how* to index into it. The tradeoff is slightly less control over the exact stepping mechanism in exchange for much higher safety and readability.

### Commands needed
`python3 scratch/fruit_loop.py`

### Run it
Predicted confidently: It will print each fruit in the provided list.

### One sentence connecting to previous unit
Since a for loop consumes iterables, we need a way to generate a sequence of numbers when we want to repeat something a specific number of times.

## Concept Unit: range() — the integer sequence generator

### The Problem
We know how to iterate over an existing list, but what if we just want to run a loop exactly 10 times? Creating a list manually like `[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]` is tedious and wastes memory for large numbers. How do we generate an integer sequence on the fly?

### Introduce the concept in isolation
```python
for i in range(3):
    print(i)
```
Output:
```text
0
1
2
```
This proves that **range()** acts as an iterable that generates integers starting from 0 up to, but not including, the specified stop value, allowing a C-style counted loop idiom.

### Discard the throwaway
This code is discarded and will not be used in our project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating loop constructs.
- **Files affected:** `scratch/range_demo.py` (created)
- **Change type:** add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code
```python
def count_up_to(limit):
    for i in range(1, limit + 1, 2):
        print(f"Odd number: {i}")
```

### The Updated Project
```python
# 1: def count_up_to(limit):
# 2:     for i in range(1, limit + 1, 2):    # <- new
# 3:         print(f"Odd number: {i}")       # <- new
```
The `count_up_to` function uses `range(start, stop, step)` to generate only odd numbers up to the limit.

### Mechanical walkthrough
- `range` is called as a function.
- `1` is the start argument (inclusive).
- `limit + 1` is the stop argument (exclusive), ensuring `limit` itself can be included if it's odd.
- `2` is the step argument, meaning it counts by 2s.
- `range` is lazy: it doesn't create a list in memory, making it memory efficient. To get a real list, you would need to use `list(range(5))`.

### CS lens
The CS concept is **Lazy Evaluation (or Generator)**. This appears in infinite scrolling on social media feeds, generating prime numbers on demand in cryptography, and streaming video chunks over a network where generating/sending everything upfront is impossible.

### SE lens
Design principle: memory efficiency via deferred execution. The alternative not chosen is generating an entire list of integers upfront. Range trades a tiny amount of CPU overhead on each iteration to save an unbounded amount of memory allocation, which is crucial for scalability.

### Commands needed
`python3 scratch/range_demo.py`

### Run it
Predicted confidently: For a limit of 5, it will print 1, 3, 5.

### One sentence connecting to previous unit
Now that we can loop efficiently, we need ways to alter the control flow midway through a loop.

## Concept Unit: break, continue, and loop else

### The Problem
Sometimes we need to stop a loop early (like when searching for an item and we find it), or skip processing the current item and move to the next. How do we jump out of an active loop iteration without waiting for the condition to fail or the iterable to exhaust?

### Introduce the concept in isolation
```python
for n in range(1, 5):
    if n == 2:
        continue
    if n == 4:
        break
    print(n)
else:
    print("Loop finished")
```
Output:
```text
1
3
```
This proves that **continue** skips the rest of the body (skipping 2), and **break** immediately terminates the innermost loop entirely (stopping at 4). The **else** block does not run because the loop exited via a break rather than natural completion.

### Discard the throwaway
This code is discarded and will not be used in our project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `scratch/search_demo.py` (created)
- **Change type:** add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code
```python
def find_item(items, target):
    for item in items:
        if item == target:
            print(f"Found {target}!")
            break
    else:
        print(f"{target} not found in the list.")
```

### The Updated Project
```python
# 1: def find_item(items, target):
# 2:     for item in items:
# 3:         if item == target:                    # <- new
# 4:             print(f"Found {target}!")         # <- new
# 5:             break                             # <- new
# 6:     else:                                     # <- new
# 7:         print(f"{target} not found in the list.") # <- new
```
This function uses the loop-else pattern for a search algorithm, breaking on success and using `else` for the not-found case.

### Mechanical walkthrough
- `if item == target:` checks the condition.
- `break` exits the loop immediately if the condition is met.
- `else:` is aligned with the `for` loop, not the `if`. It runs only if the loop exhausts the iterable without ever hitting a `break`.
- This pattern specifically prevents needing a boolean flag like `found = False` tracked outside the loop.

### CS lens
The CS concept is **Early Exit (Short-Circuiting)**. This appears in searching algorithms, network protocol handshakes aborting on an invalid packet, and compiler lexical analysis stopping on a syntax error.

### SE lens
Design principle: expressive control flow. The alternative not chosen is tracking a boolean variable. Loop-else reduces the amount of state needed, making the intention of a "search loop" syntactically native to the language, although some find it less readable due to unfamiliarity.

### Commands needed
`python3 scratch/search_demo.py`

### Run it
Predicted confidently: Will print "Found" if target exists, or "not found" if it doesn't.

### One sentence connecting to previous unit
Sometimes the logic we need requires looping over a structure while simultaneously looping over something else inside it.

## Concept Unit: Nested loops and loop patterns

### The Problem
How do we process multidimensional data or combine multiple collections, like creating every possible pair of elements from two different lists? 

### Introduce the concept in isolation
```python
for letter in ['A', 'B']:
    for number in [1, 2]:
        print(f"{letter}{number}")
```
Output:
```text
A1
A2
B1
B2
```
This proves that the inner loop runs completely from start to finish for every single iteration of the outer loop, creating a combinatorial effect (outer loop * inner loop = total iterations).

### Discard the throwaway
This code is discarded and will not be used in our project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `scratch/nested_demo.py` (created)
- **Change type:** add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code
```python
def print_grid(rows, cols):
    for r in range(rows):
        for c in range(cols):
            print(f"({r},{c})", end=" ")
        print() # Newline after each row
```

### The Updated Project
```python
# 1: def print_grid(rows, cols):
# 2:     for r in range(rows):                 # <- new
# 3:         for c in range(cols):             # <- new
# 4:             print(f"({r},{c})", end=" ")  # <- new
# 5:         print() # Newline after each row  # <- new
```
This function uses nested for loops to print a 2D coordinate grid.

### Mechanical walkthrough
- `for r in range(rows):` is the outer loop, controlling the rows.
- `for c in range(cols):` is the inner loop, controlling the columns.
- `print(..., end=" ")` prevents the inner loop from printing a new line for each coordinate.
- `print()` outside the inner loop but inside the outer loop prints a newline after an entire row has been processed.

### CS lens
The CS concept is **Combinatorial Iteration (Nested Loops)**. This appears in image processing algorithms operating on 2D pixel grids, matrix multiplication in machine learning, and brute-force password cracking generating permutations.

### SE lens
Design principle: algorithmic complexity awareness. The alternative not chosen is flattening the data structure. The tradeoff with nested loops is performance: O(N * M) complexity can quickly become a bottleneck if the collections grow large, so they must be used carefully.

### Commands needed
`python3 scratch/nested_demo.py`

### Run it
Predicted confidently: Will print a coordinate grid.

### One sentence connecting to previous unit
Having seen the major pieces of iteration in Python, we can now compare our primary loop structures directly on the same task.

## Closing
### Connect the pieces
Let's see how both approaches handle the **accumulator pattern**, where we sum the numbers from 1 to 5.

First, using the `while` loop:
```python
total = 0
current = 1
while current <= 5:
    total += current
    current += 1
print(total) # 15
```
This requires manual initialization, a condition check, and manual incrementation.

Now, using the `for` loop and `range`:
```python
total = 0
for current in range(1, 6):
    total += current
print(total) # 15
```
This is much safer and cleaner. The `range()` generates the sequence exactly as needed, and the `for` loop handles updating the variable and stopping at the right time. Both accomplish controlled repetition, but the `for` loop combined with `range` handles the state management for us, removing the risk of an infinite loop.
