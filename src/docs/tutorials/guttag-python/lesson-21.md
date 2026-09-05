# Lesson 21: Program Structure — Decomposition and Style

What you will build: The reader understands how to decompose a program into well-named functions, follow PEP 8 style, write good docstrings, use the if __name__ == '__main__' guard, and structure a module for reuse. The transferable insight: decomposition is the act of breaking a problem into sub-problems that can be solved independently. A well-decomposed program has functions that each do ONE thing, have meaningful names, and are short enough to understand at a glance.

What you need to know first: Lessons 00-20.

Terms used in this lesson:
- **Decomposition** — breaking a problem into sub-problems that can be solved independently.
- **PEP 8** — Python's style guide to make code readable and consistent.
- **Docstrings** — documentation strings embedded directly in Python code.
- **Module guard** — the `if __name__ == '__main__':` construct preventing code execution upon import.
- **Magic numbers** — unexplained numerical values in code that should be replaced with named constants.

Objects and methods used:
- **`open`**
  - *What it is:* Built-in function to open a file.
  - *Implementation:* `open(file, mode='r', ...)`
  - *Its use:* To read the CSV file.
  - *Type:* Built-in function.
  - *Responsibility:* Provides a file object to read or write contents.
  - *Depends on:* A valid file path.
  - *Connects to:* Returns a file object with methods like `readlines()`.
  - *Shape:* Boundary to the file system.
- **`readlines`**
  - *What it is:* File object method.
  - *Implementation:* `f.readlines()`
  - *Its use:* To read all lines from a file into a list.
  - *Type:* Instance method of a file object.
  - *Responsibility:* Reads to EOF and returns a list of lines.
  - *Depends on:* An open file object.
  - *Connects to:* Called on the file object, returns a list of strings.
  - *Shape:* Internal data processing.
- **`strip`**
  - *What it is:* String method.
  - *Implementation:* `str.strip()`
  - *Its use:* Removes whitespace/newlines from ends of a string.
  - *Type:* Instance method of string.
  - *Responsibility:* Cleans a string of leading/trailing whitespace.
  - *Depends on:* The string it is called on.
  - *Connects to:* Returns a new cleaned string.
  - *Shape:* Data cleaning.
- **`split`**
  - *What it is:* String method.
  - *Implementation:* `str.split(sep)`
  - *Its use:* Splits a string into a list by a separator.
  - *Type:* Instance method of string.
  - *Responsibility:* Tokenizes a string.
  - *Depends on:* The string and an optional separator.
  - *Connects to:* Returns a list of strings.
  - *Shape:* Data parsing.
- **`sorted`**
  - *What it is:* Built-in function.
  - *Implementation:* `sorted(iterable, key=None, reverse=False)`
  - *Its use:* Sorts the scores list.
  - *Type:* Built-in function.
  - *Responsibility:* Returns a new sorted list from the iterable.
  - *Depends on:* An iterable and optional key/reverse arguments.
  - *Connects to:* Returns a new list.
  - *Shape:* Data transformation.
- **`help`**
  - *What it is:* Built-in function.
  - *Implementation:* `help(object)`
  - *Its use:* Displays documentation for a function.
  - *Type:* Built-in function.
  - *Responsibility:* Accesses and prints the `__doc__` attribute nicely.
  - *Depends on:* The object passed to it.
  - *Connects to:* Outputs to console.
  - *Shape:* Interactive help / inspection.

## Concept Unit: Decomposition — one function, one job

### The Problem
When you write a single script that reads a file, parses the data, filters it, sorts it, and prints it, testing any single part of that process becomes nearly impossible. How do you test just the sorting logic if the only way to run it is to provide a real file? What if another part of the program needs to parse a similar line of data? 

### Introduce the concept in isolation
```python
# Throwaway example demonstrating the concept
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

def math_pipeline(x, y):
    sum_val = add(x, y)
    return multiply(sum_val, 2)

print(math_pipeline(3, 4))
```
Predicted confidently: `14`. This proves **Decomposition**. By breaking the pipeline into independent functions, we can verify `add` and `multiply` on their own, outside the context of `math_pipeline`.

### Discard the throwaway
The throwaway example above is discarded and will not appear in our project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating refactoring a monolithic script.
- **Files affected**: `process_data.py` (refactored)
- **Change type**: Refactor
- **Location**: Entire file contents
- **Dependencies**: A file `scores.csv` containing name,score pairs.

### The New Code
```python
def read_scores(filename):
    with open(filename) as f:
        return f.readlines()

def parse_score_line(line):
    parts = line.strip().split(',')
    if len(parts) != 2:
        return None
    return parts[0], int(parts[1])

def sort_scores(scores):
    return sorted(scores, key=lambda x: x[1], reverse=True)

def print_scores(scores):
    for name, score in scores:
        print(f'{name}: {score}')

def process_data(filename):
    lines = read_scores(filename)
    scores = [parse_score_line(l) for l in lines]
    scores = [s for s in scores if s is not None]
    print_scores(sort_scores(scores))
```

### The Updated Project
```python
1: def read_scores(filename): # ← new
2:     with open(filename) as f: # ← new
3:         return f.readlines() # ← new
4: 
5: def parse_score_line(line): # ← new
6:     parts = line.strip().split(',') # ← new
7:     if len(parts) != 2: # ← new
8:         return None # ← new
9:     return parts[0], int(parts[1]) # ← new
10: 
11: def sort_scores(scores): # ← new
12:     return sorted(scores, key=lambda x: x[1], reverse=True) # ← new
13: 
14: def print_scores(scores): # ← new
15:     for name, score in scores: # ← new
16:         print(f'{name}: {score}') # ← new
17: 
18: def process_data(filename): # ← new
19:     lines = read_scores(filename) # ← new
20:     scores = [parse_score_line(l) for l in lines] # ← new
21:     scores = [s for s in scores if s is not None] # ← new
22:     print_scores(sort_scores(scores)) # ← new
```
We have refactored a monolithic script into five distinct functions. Each function handles exactly one job.

### Mechanical walkthrough
- `def read_scores(filename):` defines a function taking a string path.
- `with open(filename) as f:` opens the file context safely.
- `return f.readlines()` reads all lines and returns them as a list of strings.
- `def parse_score_line(line):` defines a parser for a single line.
- `parts = line.strip().split(',')` cleans whitespace and splits by comma.
- `if len(parts) != 2: return None` checks validity and returns `None` on failure.
- `return parts[0], int(parts[1])` returns a tuple of name and integer score.
- `def sort_scores(scores):` defines a sorting function.
- `return sorted(scores, key=lambda x: x[1], reverse=True)` sorts the list of tuples by the second element descending.
- `def print_scores(scores):` defines the output function.
- `for name, score in scores:` unpacks each tuple.
- `print(f'{name}: {score}')` prints it cleanly.
- `def process_data(filename):` the main driver function.
- `lines = read_scores(filename)` gets lines.
- `scores = [parse_score_line(l) for l in lines]` parses them into tuples (or None).
- `scores = [s for s in scores if s is not None]` filters out the invalid parsing results.
- `print_scores(sort_scores(scores))` sorts and prints the clean data.

### CS lens
**Decomposition**. In computer science, decomposition is breaking a complex problem down into highly cohesive, loosely coupled parts. You see this in: microservices architecture, CPU instruction pipelining, and network OSI layers.

### SE lens
**Single Responsibility Principle (SRP)**. Every function should have one reason to change. The alternative is a monolithic script, which makes changes risky since touching the sort logic could inadvertently break file reading. We trade slightly more boilerplate (function definitions) for vastly improved testability and maintainability.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Assuming a valid `scores.csv`, it will print `Name: Score` in descending order of scores.

### One sentence connecting to previous unit
Now that our functions are cleanly separated, we need to ensure they are readable to other developers.

## Concept Unit: PEP 8 — Python style guide

### The Problem
If ten developers write Python in ten different styles (different indentation, capitalization, spacing), reading their combined code is exhausting. How do we ensure any Python programmer can read any other Python programmer's code without style friction? 

### Introduce the concept in isolation
```python
# Throwaway code breaking style
def calculateAverage(Numbers):
  return sum(Numbers)/len(Numbers)

# Throwaway code following PEP 8
def calculate_average(numbers):
    return sum(numbers) / len(numbers)
```
Predicted confidently: Both behave identically. This proves **PEP 8** style compliance doesn't change execution, but standardizes formatting (e.g. 4 spaces, snake_case).

### Discard the throwaway
The throwaway example above is discarded and will not appear in our project.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `process_data.py` (style updates)
- **Change type**: Refactor
- **Location**: We will apply PEP 8 rules across our definitions.
- **Dependencies**: None.

### The New Code
```python
MAX_RETRIES = 3

class StudentRecord:
    pass

def calculate_average(numbers):
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)
```

### The Updated Project
```python
1: MAX_RETRIES = 3 # ← new
2: 
3: class StudentRecord: # ← new
4:     pass # ← new
5: 
6: def calculate_average(numbers): # ← new
7:     if not numbers: # ← new
8:         return 0.0 # ← new
9:     return sum(numbers) / len(numbers) # ← new
```
We applied PEP 8 naming conventions: UPPER_SNAKE_CASE for constants, CamelCase for classes, and snake_case for functions and variables.

### Mechanical walkthrough
- `MAX_RETRIES = 3` defines a constant in UPPER_SNAKE_CASE.
- `class StudentRecord:` defines a class in CamelCase.
- `pass` is a placeholder.
- `def calculate_average(numbers):` defines a function in snake_case.
- `if not numbers:` handles an empty list cleanly.
- `return 0.0` early exit.
- `return sum(numbers) / len(numbers)` has spaces around the division operator.

### CS lens
**Coding Standards**. Universal conventions in programming reduce cognitive load. You see this in C++ style guides, the `gofmt` tool in Go, and REST API naming conventions.

### SE lens
**Readability over writeability**. Python's creator, Guido van Rossum, noted that code is read much more often than it is written. Following PEP 8 makes your code instantly recognizable to others. We avoid personalized styling in favor of community consensus.

### Commands needed
`pylint`, `black`

### Run it
Predicted confidently: No runtime output, but tools like `black` will reformat the code to match these rules automatically.

### One sentence connecting to previous unit
Style makes the code structure readable, but it doesn't explain the intent or types of our functions to others.

## Concept Unit: Docstrings — documentation as code

### The Problem
How does a developer calling `parse_score_line` know what to pass in and what it returns, without having to read and trace the function's internal implementation?

### Introduce the concept in isolation
```python
def multiply(a, b):
    """
    Multiply two numbers.
    """
    return a * b

print(multiply.__doc__.strip())
```
Predicted confidently: `Multiply two numbers.`. This proves **Docstrings**. Python attaches the first string literal of a function to its `__doc__` attribute.

### Discard the throwaway
The throwaway example above is discarded and will not appear in our project.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `process_data.py`
- **Change type**: Refactor
- **Location**: Inside `parse_score_line`
- **Dependencies**: None.

### The New Code
```python
def parse_score_line(line):
    """
    Parse a CSV line of format 'name,score' into a (str, int) tuple.

    Args:
        line (str): A single CSV line, e.g. 'Alice,95'

    Returns:
        tuple[str, int] | None: (name, score) if valid, else None

    Examples:
        >>> parse_score_line('Alice,95')
        ('Alice', 95)
        >>> parse_score_line('bad_line')
        None
    """
    parts = line.strip().split(',')
    if len(parts) != 2:
        return None
    try:
        return parts[0], int(parts[1])
    except ValueError:
        return None
```

### The Updated Project
```python
1: def parse_score_line(line):
2:     """ # ← new
3:     Parse a CSV line of format 'name,score' into a (str, int) tuple. # ← new
4:  # ← new
5:     Args: # ← new
6:         line (str): A single CSV line, e.g. 'Alice,95' # ← new
7:  # ← new
8:     Returns: # ← new
9:         tuple[str, int] | None: (name, score) if valid, else None # ← new
10:     """ # ← new
11:     parts = line.strip().split(',')
12:     if len(parts) != 2:
13:         return None
14:     try: # ← new
15:         return parts[0], int(parts[1]) # ← new
16:     except ValueError: # ← new
17:         return None # ← new
```
We added a comprehensive docstring and a `try/except` block to cleanly handle malformed integers, fulfilling the docstring's contract.

### Mechanical walkthrough
- `"""` opens a multi-line string literal immediately after the function signature.
- `Parse a CSV line...` provides a summary.
- `Args:` describes the parameters and their types.
- `Returns:` describes the return value and type.
- `try:` attempts to execute code that might raise an exception.
- `return parts[0], int(parts[1])` parses the int; if it fails, a `ValueError` occurs.
- `except ValueError:` catches specifically a ValueError.
- `return None` handles the error by returning None as promised in the docstring.

### CS lens
**Interface Contracts**. A docstring defines the contract between the caller and the callee. You see this in JavaDocs, OpenAPI specifications, and statically typed function signatures.

### SE lens
**Documentation as Code**. Keeping documentation inside the code file ensures it travels with the code and is updated alongside it. Alternative is an external wiki, which inevitably falls out of sync.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `help(parse_score_line)` will print the formatted docstring to the terminal.

### One sentence connecting to previous unit
Our functions are now documented, but we need a safe way to reuse this file in other scripts without accidentally running the main processing logic.

## Concept Unit: if __name__ == '__main__' — module guard

### The Problem
If we `import process_data` in another script just to use the `sort_scores` function, Python will immediately run the `process_data('scores.csv')` logic at the bottom of the file. How can we make a script act as a library when imported, but a runnable program when executed directly?

### Introduce the concept in isolation
```python
# Throwaway module guard
def main():
    print("Running directly")

if __name__ == '__main__':
    main()
```
Predicted confidently: Prints "Running directly" if executed as a script, but nothing if imported. This proves the **Module guard**. Python automatically sets the special `__name__` variable to `'__main__'` for the primary executed script.

### Discard the throwaway
The throwaway example above is discarded and will not appear in our project.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `process_data.py`
- **Change type**: Refactor
- **Location**: Bottom of the file
- **Dependencies**: None.

### The New Code
```python
def main():
    process_data('scores.csv')

if __name__ == '__main__':
    main()
```

### The Updated Project
```python
# ... (earlier functions omitted for brevity in explanation, but they exist)
1: def process_data(filename):
2:     lines = read_scores(filename)
3:     scores = [parse_score_line(l) for l in lines]
4:     scores = [s for s in scores if s is not None]
5:     print_scores(sort_scores(scores))
6: 
7: def main(): # ← new
8:     process_data('scores.csv') # ← new
9: 
10: if __name__ == '__main__': # ← new
11:     main() # ← new
```
We encapsulated the script execution inside a `main()` function and guarded it.

### Mechanical walkthrough
- `def main():` defines an entry point function.
- `process_data('scores.csv')` calls our driver function.
- `if __name__ == '__main__':` checks the built-in `__name__` string.
- `main()` executes the program only if the check passes.

### CS lens
**Entry Points**. Programs need a designated start location. You see this in `public static void main(String[] args)` in Java, `int main()` in C, and `package main` in Go.

### SE lens
**Reusability**. By separating definition from execution, one file serves two roles: a command-line utility and an importable library. Without this, you would have to maintain two separate files.

### Commands needed
`python3 process_data.py`

### Run it
Predicted confidently: Will execute `main()` and process the CSV file. `import process_data` will not execute `main()`.

### One sentence connecting to previous unit
Our module is reusable, but we still have hardcoded numbers scattered inside our functions that lack context.

## Concept Unit: Constants, magic numbers, and named values

### The Problem
If someone sees `if score >= 90:` in the code, they might guess what 90 means, but what if they see `if rate == 1.42:`? Unexplained "magic numbers" make code hard to read and hard to change across multiple locations.

### Introduce the concept in isolation
```python
# Throwaway magic numbers
def is_passing(score):
    return score >= 65

# Throwaway named constants
PASSING_SCORE = 65

def is_passing_constant(score):
    return score >= PASSING_SCORE
```
Predicted confidently: Both behave identically. This proves **Magic numbers** can be replaced by named constants to provide context and a single source of truth.

### Discard the throwaway
The throwaway example above is discarded and will not appear in our project.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `process_data.py`
- **Change type**: Refactor
- **Location**: Top of the file and inside a new grading function.
- **Dependencies**: None.

### The New Code
```python
MIN_SCORE = 0
MAX_SCORE = 100
GRADE_THRESHOLDS = {'A': 90, 'B': 80, 'C': 70}

def is_valid_score(score):
    return MIN_SCORE <= score <= MAX_SCORE

def grade(score):
    for letter, threshold in sorted(GRADE_THRESHOLDS.items(),
                                     key=lambda kv: kv[1], reverse=True):
        if score >= threshold:
            return letter
    return 'F'
```

### The Updated Project
```python
1: MIN_SCORE = 0 # ← new
2: MAX_SCORE = 100 # ← new
3: GRADE_THRESHOLDS = {'A': 90, 'B': 80, 'C': 70} # ← new
4: 
5: def is_valid_score(score): # ← new
6:     return MIN_SCORE <= score <= MAX_SCORE # ← new
7: 
8: def grade(score): # ← new
9:     for letter, threshold in sorted(GRADE_THRESHOLDS.items(), # ← new
10:                                      key=lambda kv: kv[1], reverse=True): # ← new
11:         if score >= threshold: # ← new
12:             return letter # ← new
13:     return 'F' # ← new
```
We elevated hardcoded numbers into module-level constants.

### Mechanical walkthrough
- `MIN_SCORE = 0` creates a constant integer.
- `MAX_SCORE = 100` creates a constant integer.
- `GRADE_THRESHOLDS = {'A': 90, 'B': 80, 'C': 70}` creates a constant dictionary mapping strings to integers.
- `def is_valid_score(score):` takes a score.
- `return MIN_SCORE <= score <= MAX_SCORE` uses chained comparison using the named constants.
- `def grade(score):` takes a score.
- `for letter, threshold in sorted(...):` iterates through the dictionary sorted by values descending.
- `key=lambda kv: kv[1]` extracts the dictionary value (threshold) for sorting.
- `if score >= threshold: return letter` matches the highest threshold reached.
- `return 'F'` is the fallback.

### CS lens
**Configuration vs Logic**. Extracting values from algorithms separates business rules (thresholds) from pure logic (sorting and checking). You see this in `.env` files, config maps in Kubernetes, and externalized string resources in Android.

### SE lens
**Single Source of Truth**. If the passing grade changes from 70 to 65, you only update the constant `GRADE_THRESHOLDS`. If it was a magic number, you would have to find and replace every instance in the codebase, risking a miss.

### Commands needed
None for this unit.

### Run it
Predicted confidently: `grade(85)` will evaluate thresholds [90, 80, 70] and return `'B'`.

### One sentence connecting to previous unit
All our pieces are now in place to build robust, maintainable Python scripts.

## Closing
### Connect the pieces
We started with a monolithic, hard-to-read, 30-line script. We **decomposed** it into 5 focused functions, making each part testable. We applied **PEP 8** style guidelines so anyone can read it smoothly. We wrote **docstrings** so callers know the contract without reading the implementation. We added a **module guard** (`if __name__ == '__main__':`) so the file can be safely imported elsewhere. Finally, we extracted **magic numbers** into named constants to create a single source of truth. The result is a professional, reusable Python module.
