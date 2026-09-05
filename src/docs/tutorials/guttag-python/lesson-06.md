# Lesson 06: Strings in Depth

What you will build: The reader understands Python strings as immutable sequences of Unicode characters: indexing, slicing, common methods, string formatting with f-strings, and the split/join pattern. The transferable insight: a string is a sequence. Every sequence operation (len, indexing, slicing, iteration, in) works on strings. Immutability means 'modification' always produces a new string. This is safe but can be expensive if done in a loop (use join instead).

What you need to know first: Lessons 00-05.

**Terms used in this lesson**
- **Index** — A zero-based integer representing a position in a sequence. It exists to provide constant-time access to any element.
- **Slice** — A sub-sequence extracted using start, stop, and step indices. It exists to efficiently read portions of data without manual loops.
- **Immutability** — The property of an object whose state cannot be modified after it is created. It exists to guarantee safe sharing of data across a program without unexpected side-effects.
- **f-string** — A formatted string literal. It exists to interpolate expressions directly into string constants cleanly and safely.
- **Iteration** — The process of processing each item in a sequence sequentially. It exists to apply uniform logic to a collection of items.

**Objects and methods used**
- **`len`**
  - *What it is:* A built-in function that returns the number of items in a sequence.
  - *Implementation:* `def len(obj: Sized) -> int:`
  - *Its use:* To determine the bounds of a string or any sequence.
  - *Type:* Built-in function.
  - *Responsibility:* Computes and returns the integer length of a sequence or collection.
  - *Depends on:* An object implementing the `__len__` protocol (like a string).
  - *Connects to:* Called by user code, returns an integer to the caller.
  - *Shape:* A global built-in at the top level of the Python runtime.
- **`str.upper`**
  - *What it is:* A string method that returns a copy of the string converted to uppercase.
  - *Implementation:* `def upper(self) -> str:`
  - *Its use:* To normalize text for case-insensitive processing.
  - *Type:* Instance method.
  - *Responsibility:* Produces a new string representing the uppercase version of the original.
  - *Depends on:* The string instance it is called on.
  - *Connects to:* Called by user code, returns a new string object.
  - *Shape:* An API surface on the `str` class.
- **`str.split`**
  - *What it is:* A string method that returns a list of substrings.
  - *Implementation:* `def split(self, sep: str | None = None, maxsplit: int = -1) -> list[str]:`
  - *Its use:* To parse structured text into a list of usable tokens.
  - *Type:* Instance method.
  - *Responsibility:* Breaks a string into a list of substrings based on a delimiter.
  - *Depends on:* The string instance and an optional separator string.
  - *Connects to:* Called by user code, returns a `list` of `str`.
  - *Shape:* A parsing API surface on the `str` class.
- **`str.join`**
  - *What it is:* A string method that concatenates an iterable of strings.
  - *Implementation:* `def join(self, iterable: Iterable[str]) -> str:`
  - *Its use:* To efficiently combine a list of strings into a single string.
  - *Type:* Instance method.
  - *Responsibility:* Glues together a sequence of strings using the instance string as the separator.
  - *Depends on:* The separator string (the instance) and an iterable of strings.
  - *Connects to:* Called by user code, returns a new `str`.
  - *Shape:* A formatting API surface on the `str` class.

## Concept Unit: Strings as sequences — indexing and slicing

### The Problem
If we have a string representing a fixed-width record, how do we access just the characters representing a specific field? How can we get just the first character? How can we process each character one by one?

### Introduce the concept in isolation
```python
text = "Python"
print(text[0])       # P
print(text[-1])      # n
print(text[0:4])     # Pyth
print(text[::-1])    # nohtyP
print(len(text))     # 6
print('y' in text)   # True
```
This proves that **indexing and slicing** provide direct access to parts of a sequence, and standard sequence operations like `len()` and `in` work natively on strings.

### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we need to extract a specific prefix from input.
- **Files affected**: `parser.py` (created)
- **Change type**: Add
- **Location**: Top of file
- **Dependencies**: None

### The New Code
```python
def get_prefix(record: str) -> str:
    return record[0:3]
```

### The Updated Project
```python
# 1: def get_prefix(record: str) -> str:
# 2:     return record[0:3] # ← new
```
This structure takes a string and extracts the first three characters.

### Mechanical walkthrough
- `def get_prefix(record: str) -> str:` defines a function taking a string and returning a string.
- `return` sends the evaluated result back to the caller.
- `record` accesses the passed argument string.
- `[` begins the slice syntax.
- `0` is the starting index (inclusive).
- `:` separates the start and stop indices.
- `3` is the stop index (exclusive).
- `]` ends the slice syntax.

### CS lens
Sequence data structures. This appears in arrays in C, lists in Lisp, memory buffers in networking, and file streams in operating systems.

### SE lens
Zero-based indexing is a design principle. The alternative NOT chosen is 1-based indexing (like in Lua or R). The real tradeoff is that 0-based indexing makes calculating offsets easier (distance = stop - start), but it is slightly less intuitive for non-programmers.

### Commands needed
None for this unit.

### Run it
Predicted confidently: calling `get_prefix("ABCDE")` returns `'ABC'`.

### One sentence connecting to previous unit
Now that we can extract parts of a string, we need to know what happens if we try to alter those parts.

## Concept Unit: Immutability — strings cannot be changed in place

### The Problem
What if we want to capitalize just the first letter of a string in memory? Why can't we just assign `text[0] = 'H'` like we do with arrays in other languages?

### Introduce the concept in isolation
```python
text = "hello"
try:
    text[0] = "H"
except TypeError as e:
    print(e)  # 'str' object does not support item assignment

text = "H" + text[1:]
print(text)   # Hello
```
This proves **Immutability**. Strings cannot be modified in place; you must construct and return a completely new string.

### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we need safe string mutation behavior.
- **Files affected**: `parser.py` (modified)
- **Change type**: Add
- **Location**: Below `get_prefix`
- **Dependencies**: None

### The New Code
```python
def capitalize_record(record: str) -> str:
    if len(record) == 0:
        return record
    return record[0].upper() + record[1:]
```

### The Updated Project
```python
# 1: def get_prefix(record: str) -> str:
# 2:     return record[0:3]
# 3: 
# 4: def capitalize_record(record: str) -> str: # ← new
# 5:     if len(record) == 0:                   # ← new
# 6:         return record                      # ← new
# 7:     return record[0].upper() + record[1:]  # ← new
```
This structure creates a new string with an uppercase first letter, rather than modifying the original string.

### Mechanical walkthrough
- `def capitalize_record(record: str) -> str:` defines the function.
- `if len(record) == 0:` checks if the string is empty.
- `return record` returns the empty string safely.
- `return` sends the result back.
- `record[0]` gets the first character.
- `.upper()` calls the method to return an uppercase version of that character.
- `+` concatenates two strings.
- `record[1:]` slices the string from index 1 to the end.

### CS lens
Immutability. This appears in functional programming (Haskell), version control (Git commits), database transaction logs, and concurrent lock-free data structures.

### SE lens
Value semantics vs Reference semantics. The design principle is safe sharing. Alternative NOT chosen: mutable strings (like C `char[]`). The real tradeoff is that immutability prevents bugs from accidental side-effects when passing strings around, but requires more memory allocation since every "modification" creates a new copy.

### Commands needed
None for this unit.

### Run it
Predicted confidently: calling `capitalize_record("test")` returns `'Test'`.

### One sentence connecting to previous unit
Since we can't change strings, we rely heavily on built-in methods that return new, modified copies.

## Concept Unit: String methods — the built-in toolkit

### The Problem
If building strings manually is tedious, how do we easily perform common text manipulations like removing extra whitespace or making everything lowercase? Do we have to slice and concatenate manually every time?

### Introduce the concept in isolation
```python
raw = "  hello world  "
print(f"'{raw.strip()}'")       # 'hello world'
print(raw.replace("o", "0"))    #   hell0 w0rld  
print(raw.startswith(" "))      # True
```
This proves that **string methods** exist to handle common text parsing and formatting needs out-of-the-box.

### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we need to clean up input records.
- **Files affected**: `parser.py` (modified)
- **Change type**: Add
- **Location**: Below `capitalize_record`
- **Dependencies**: None

### The New Code
```python
def clean_record(record: str) -> str:
    return record.strip().replace(" ", "_")
```

### The Updated Project
```python
# 4: def capitalize_record(record: str) -> str:
# 5:     if len(record) == 0:
# 6:         return record
# 7:     return record[0].upper() + record[1:]
# 8:
# 9: def clean_record(record: str) -> str:           # ← new
# 10:    return record.strip().replace(" ", "_")     # ← new
```
This structure chains string methods to first trim whitespace and then replace internal spaces with underscores.

### Mechanical walkthrough
- `def clean_record(record: str) -> str:` defines the function.
- `return` sends the result back.
- `record` is the input string.
- `.strip()` is a method call that returns a new string with leading/trailing whitespace removed.
- `.replace(" ", "_")` is a method call on the returned string that replaces all space characters with underscores.

### CS lens
Standard libraries and common APIs. This appears in regex engines, POSIX text utilities (sed/awk), browser DOM string APIs, and SQL string functions.

### SE lens
Method chaining. The alternative NOT chosen is procedural calls like `replace(strip(record), " ", "_")`. The real tradeoff is that method chaining (fluent interfaces) reads left-to-right matching the order of operations, which is highly readable, but can be hard to debug if an intermediate step fails.

### Commands needed
None for this unit.

### Run it
Predicted confidently: calling `clean_record("  some data  ")` returns `'some_data'`.

### One sentence connecting to previous unit
Now that we can clean up text, we need a way to build larger descriptive strings out of multiple variables.

## Concept Unit: String formatting — f-strings and format()

### The Problem
How do we efficiently inject variables into a string template? Do we really have to use `+` to concatenate strings and manually cast numbers with `str(n)` every time?

### Introduce the concept in isolation
```python
name = "Alice"
age = 30
print(f"User {name} is {age} years old.")
# User Alice is 30 years old.
```
This proves that **f-strings** evaluate expressions embedded in curly braces and automatically cast the results to strings inside the template.

### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we need to format a log message.
- **Files affected**: `parser.py` (modified)
- **Change type**: Add
- **Location**: Below `clean_record`
- **Dependencies**: None

### The New Code
```python
def format_log(name: str, score: float) -> str:
    return f"Record: {name.upper()} | Score: {score:.2f}"
```

### The Updated Project
```python
# 9: def clean_record(record: str) -> str:
# 10:    return record.strip().replace(" ", "_")
# 11:
# 12: def format_log(name: str, score: float) -> str:                    # ← new
# 13:     return f"Record: {name.upper()} | Score: {score:.2f}"          # ← new
```
This structure creates a formatted string that interpolates an uppercase name and a float rounded to two decimal places.

### Mechanical walkthrough
- `def format_log(name: str, score: float) -> str:` defines the function.
- `return` sends the result back.
- `f"` indicates the start of an f-string literal.
- `Record: ` is literal text.
- `{` begins an interpolation block.
- `name.upper()` evaluates to the uppercase name.
- `}` ends the interpolation block.
- ` | Score: ` is literal text.
- `{` begins another interpolation block.
- `score` is the float variable.
- `:.2f` is a format specifier telling Python to display the float with 2 decimal places.
- `}` ends the block.
- `"` ends the string literal.

### CS lens
String interpolation and macro expansion. This appears in Bash shell variable expansion, HTML templating engines (Jinja/React JSX), C's `printf`, and SQL prepared statements.

### SE lens
Declarative formatting. The alternative NOT chosen is string concatenation (`"Record: " + name.upper() + ...`). The real tradeoff is that interpolation is vastly more readable and less error-prone regarding type conversion, though it requires the language parser to understand special string syntax.

### Commands needed
None for this unit.

### Run it
Predicted confidently: calling `format_log("bob", 95.1234)` returns `'Record: BOB | Score: 95.12'`.

### One sentence connecting to previous unit
While f-strings are great for building one-off sentences, dealing with large collections of data requires splitting text apart and joining it back together.

## Concept Unit: The split/join pattern — working with structured text

### The Problem
If we are given a string representing a CSV row like `"Alice,30,Engineer"`, how do we break it down into usable pieces, process them, and reassemble them into a new format?

### Introduce the concept in isolation
```python
line = "a,b,c"
parts = line.split(",")
print(parts)               # ['a', 'b', 'c']
new_line = "-".join(parts) 
print(new_line)            # a-b-c
```
This proves the **split/join pattern**: `split` breaks a delimiter-separated string into a list, and `join` glues an iterable of strings back into a single string using a specified separator.

### Discard the throwaway
This throwaway code is discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we need to parse and reconstruct CSV rows.
- **Files affected**: `parser.py` (modified)
- **Change type**: Add
- **Location**: Below `format_log`
- **Dependencies**: None

### The New Code
```python
def reformat_csv(line: str) -> str:
    fields = line.split(",")
    return " | ".join(fields)
```

### The Updated Project
```python
# 12: def format_log(name: str, score: float) -> str:
# 13:     return f"Record: {name.upper()} | Score: {score:.2f}"
# 14:
# 15: def reformat_csv(line: str) -> str:       # ← new
# 16:     fields = line.split(",")              # ← new
# 17:     return " | ".join(fields)             # ← new
```
This structure breaks a comma-separated string into fields and recombines them using a pipe and spaces.

### Mechanical walkthrough
- `def reformat_csv(line: str) -> str:` defines the function.
- `fields =` assigns the result to a variable.
- `line` is the input string.
- `.split(",")` calls the method to divide the string at commas, returning a list.
- `return` sends the result back.
- `" | "` is a literal string that will act as the separator.
- `.join(fields)` calls the method on the separator, passing the list of strings to be combined.

### CS lens
Serialization and deserialization. This appears in parsing network packets, reading environment variables (like `PATH`), breaking down command line arguments, and processing log files.

### SE lens
O(N) string construction. The alternative NOT chosen is looping over the fields and using `+=` to append strings. The real tradeoff is that `join` calculates the final required memory size once and allocates exactly what is needed, avoiding the O(N^2) overhead of repeatedly reallocating memory for immutable strings during a loop.

### Commands needed
None for this unit.

### Run it
Predicted confidently: calling `reformat_csv("Alice,30,Engineer")` returns `'Alice | 30 | Engineer'`.

### One sentence connecting to previous unit
Understanding how strings are sliced, formatted, split, and joined gives us complete control over textual data.

## Closing

### Connect the pieces
Let's trace how all of these sequence operations and methods work together on a simple input like `'Alice,30,Engineer'`. First, we can test membership (`'Alice' in text`) or find its length (`len(text)`). Because strings are immutable, we can't change the characters directly; instead, we rely on the split/join pattern. `text.split(',')` produces `['Alice', '30', 'Engineer']`. We can access individual fields using zero-based indexing (`fields[0]` gives `'Alice'`), extract slices if needed, or apply methods like `upper()` to generate new string copies. Finally, we can reconstruct a completely new string efficiently using `" | ".join(fields)` or precisely format the output using an f-string like `f"Name: {fields[0]} | Role: {fields[2]}"`, safely managing textual data through sequences and immutability across the entire pipeline.
