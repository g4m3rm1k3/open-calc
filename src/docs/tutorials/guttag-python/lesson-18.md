# Lesson 18: Files — Reading, Writing, and with

What you will build
The reader understands file I/O in Python: opening files with `open()`, the `with` statement for guaranteed cleanup, reading (read, readline, readlines, iteration), writing, and working with text vs. binary modes. The transferable insight: a file object is an iterator. You can iterate it line by line with `for line in f`, which is memory-efficient even for huge files. Always use `with` to ensure the file is closed even if an exception occurs.

What you need to know first
Lessons 00-17

Terms used in this lesson
- **file object** — A Python object that provides methods to read from and write to a file on disk. It is an iterator over the lines of the file.
- **context manager** — An object that implements `__enter__` and `__exit__`, ensuring that resources are properly acquired and released, typically used with the `with` statement.
- **file mode** — A string indicating how a file is opened, such as 'r' for reading, 'w' for writing, 'a' for appending.

Objects and methods used
- **`open()`**
  - What it is: The built-in function to open a file.
  - Implementation: `open(file, mode='r', encoding=None)`
  - Its use: Returns a file object used for I/O operations.
  - Type: Built-in function.
  - Responsibility: Opens a file and returns a corresponding file object, or raises an OSError upon failure.
  - Depends on: A valid file path and mode.
  - Connects to: The OS file system.
  - Shape: System boundary.

- **`file.read()`**
  - What it is: Method to read the entire contents of a file.
  - Implementation: `read(size=-1)`
  - Its use: Reads all characters into a single string.
  - Type: Instance method on file object.
  - Responsibility: Reads and returns the file's contents.
  - Depends on: File opened in read mode.
  - Connects to: The file object.
  - Shape: I/O method.

- **`file.write()`**
  - What it is: Method to write a string to a file.
  - Implementation: `write(text)`
  - Its use: Writes the given text to the file.
  - Type: Instance method on file object.
  - Responsibility: Writes data to the stream.
  - Depends on: File opened in write or append mode.
  - Connects to: The file object.
  - Shape: I/O method.

- **`csv.reader`**
  - What it is: Function that returns a reader object.
  - Implementation: `csv.reader(csvfile)`
  - Its use: Parses a file object containing CSV data into lists of strings.
  - Type: Module function.
  - Responsibility: Iterates over lines in the given csvfile.
  - Depends on: An open file object.
  - Connects to: The file object and csv module.
  - Shape: Data parser.

- **`csv.writer`**
  - What it is: Function that returns a writer object.
  - Implementation: `csv.writer(csvfile)`
  - Its use: Writes lists of strings as comma-separated rows.
  - Type: Module function.
  - Responsibility: Formats data as CSV and writes to the given csvfile.
  - Depends on: An open file object in write mode.
  - Connects to: The file object and csv module.
  - Shape: Data serializer.

- **`Path`**
  - What it is: Class representing a filesystem path.
  - Implementation: `class pathlib.Path(*pathsegments)`
  - Its use: OS-independent path construction and manipulation.
  - Type: Class in `pathlib`.
  - Responsibility: Provides object-oriented filesystem paths.
  - Depends on: Path string segments.
  - Connects to: The filesystem.
  - Shape: System abstraction.

## Concept Unit: open() and file modes

### The Problem
How do we save data to a file on our hard drive, and how do we retrieve it later? If we just keep data in memory, it is lost when the program terminates. What would you try first to write to a file in Python? How would you retrieve it?

### Introduce the concept in isolation
```python
# open(path, mode, encoding)
# Modes: 'r' read (default), 'w' write (creates/truncates),
#        'a' append, 'x' exclusive create, 'b' binary, '+' update

# Write a file:
with open('data.txt', 'w', encoding='utf-8') as f:
    f.write('Hello, World!\n')
    f.write('Line two\n')

# Read it back:
with open('data.txt', 'r', encoding='utf-8') as f:
    content = f.read()   # reads entire file as one string
    print(repr(content)) # 'Hello, World!\nLine two\n'
```
This demonstrates **file I/O**. Trace: `open('data.txt', 'w')`: creates/truncates `data.txt`, returns file object `f`. `f.write('Hello, World!\n')`: writes 14 bytes. `with` block ends: `__exit__` calls `f.close()`. Second `with`: open for reading. `f.read()`: reads all bytes as str. `repr()` shows `\n` escapes. This proves we can persist data.

### Discard the throwaway
This code is discarded and will not be kept in the project.

### Project Change
- **Reference Source**: None — this is a from-scratch addition to introduce saving data.
- **Files affected**: `save_data.py` (created)
- **Change type**: add
- **Location**: N/A
- **Dependencies**: None.

### The New Code
```python
def save_greeting(filename):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write('Welcome to the project!\n')
```

### The Updated Project
```python
1: def save_greeting(filename):
2:     with open(filename, 'w', encoding='utf-8') as f: # ← new
3:         f.write('Welcome to the project!\n')         # ← new
```
This is a brand new file `save_greeting.py` that writes a greeting.

### Mechanical walkthrough
- `def save_greeting(filename):` defines a function.
- `with open(...) as f:` opens the file for writing and assigns the file object to `f`.
- `f.write(...)` writes the string to the file on disk.

### CS lens
File system interaction. 3-5 unrelated real-world places it appears: Log files on web servers, saving a game state on a console, configuration files in /etc on Linux, caching HTTP responses to disk.

### SE lens
Persisting state. The alternative NOT chosen: keeping everything in memory. Real tradeoff: disk is significantly slower than RAM, but it outlives the process.

### Commands needed
None for this unit.

### Run it
Predicted confidently: A file named whatever `filename` evaluates to is created with the string content.

### One sentence connecting to previous unit
Now that we can open files, we need to understand how the cleanup happens.

## Concept Unit: The with statement — guaranteed cleanup

### The Problem
What happens if our code crashes while writing to a file? Will the file stay locked or corrupted? How do we ensure cleanup always happens?

### Introduce the concept in isolation
```python
# WITHOUT with: risky (file stays open on exception)
f = open('data.txt', 'r')
try:
    content = f.read()
finally:
    f.close()   # must remember this

# WITH with: automatic cleanup
with open('data.txt', 'r', encoding='utf-8') as f:
    content = f.read()
# f is automatically closed here, even if read() raises

# with works on anything implementing __enter__ / __exit__
# File objects implement the context manager protocol
print(f.closed)  # True (after with block)
```
This demonstrates the **context manager**. Trace: `with open(...) as f`: calls `f.__enter__()` which returns `f`. Block executes. Normal exit or exception: Python calls `f.__exit__()`. `__exit__` calls `f.close()`. `f.closed` becomes `True`.

### Discard the throwaway
This code is discarded and will not be kept in the project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `save_data.py`
- **Change type**: configure
- **Location**: inside `save_greeting`
- **Dependencies**: None.

### The New Code
```python
        print(f"File {filename} is automatically closed: {f.closed}")
```

### The Updated Project
```python
1: def save_greeting(filename):
2:     with open(filename, 'w', encoding='utf-8') as f:
3:         f.write('Welcome to the project!\n')
4:     print(f"File {filename} is automatically closed: {f.closed}") # ← new
```
We verify that our context manager is cleaning up.

### Mechanical walkthrough
- `print(...)` outputs to stdout.
- `f.closed` accesses the boolean attribute of the file object indicating closure.

### CS lens
Resource management. 3-5 unrelated real-world places it appears: Database connections, network sockets, thread locks, hardware device handles.

### SE lens
RAII (Resource Acquisition Is Initialization). The alternative NOT chosen: manual `close()` calls everywhere. Real tradeoff: manual calls are prone to programmer error if exceptions skip the cleanup code.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Prints "File filename is automatically closed: True".

### One sentence connecting to previous unit
Knowing the file is safely closed, let's explore reading massive files.

## Concept Unit: Reading line by line — memory-efficient iteration

### The Problem
If a log file is 10 GB and our server only has 2 GB of RAM, how can we process it? What happens if we try to read it all at once?

### Introduce the concept in isolation
```python
# Write multi-line file:
with open('names.txt', 'w') as f:
    for name in ['Alice', 'Bob', 'Charlie', 'Diana']:
        f.write(name + '\n')

# Method 1: readlines() — loads all into memory as list
with open('names.txt') as f:
    lines = f.readlines()   # ['Alice\n', 'Bob\n', ...]
    names = [l.strip() for l in lines]
print(names)  # ['Alice', 'Bob', 'Charlie', 'Diana']

# Method 2: iterate directly — one line at a time (best for large files)
with open('names.txt') as f:
    for line in f:           # file object IS an iterator
        print(line.strip())  # Alice, Bob, Charlie, Diana

# Method 3: readline() — one line per call
with open('names.txt') as f:
    first = f.readline()    # 'Alice\n'
    second = f.readline()   # 'Bob\n'
```
This demonstrates **file iteration**. Trace: `for line in f`: Python calls `next(f)` repeatedly. Each call reads one line from disk. When EOF: raises `StopIteration`. Loop ends. Only one line in memory at a time.

### Discard the throwaway
This code is discarded and will not be kept in the project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `save_data.py`
- **Change type**: add
- **Location**: End of file.
- **Dependencies**: None.

### The New Code
```python
def read_greeting(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        for line in f:
            print("Found line:", line.strip())
```

### The Updated Project
```python
1: def save_greeting(filename):
2:     with open(filename, 'w', encoding='utf-8') as f:
3:         f.write('Welcome to the project!\n')
4:     print(f"File {filename} is automatically closed: {f.closed}")
5: 
6: def read_greeting(filename):                                       # ← new
7:     with open(filename, 'r', encoding='utf-8') as f:             # ← new
8:         for line in f:                                           # ← new
9:             print("Found line:", line.strip())                   # ← new
```
We added a function to read lines efficiently.

### Mechanical walkthrough
- `def read_greeting(filename):` starts new function.
- `with open(...)` opens file in read mode.
- `for line in f:` iterates the file object.
- `print(...)` outputs the stripped line.
- `line.strip()` removes trailing whitespace like `\n`.

### CS lens
Iterators. 3-5 unrelated real-world places it appears: Database cursors, stream processing like Kafka, pagination in REST APIs, generator functions yielding sequences.

### SE lens
Lazy evaluation and streaming. The alternative NOT chosen: loading the entire file into a list with `readlines()`. Real tradeoff: streaming saves memory but you cannot random-access index the data easily.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Will print "Found line: Welcome to the project!".

### One sentence connecting to previous unit
Lines of text are great, but structured data requires formats like CSV.

## Concept Unit: Writing, appending, and CSV

### The Problem
If we have a dictionary or list of fields, how do we write it such that another program (like Excel) can reliably read it? What happens if data contains commas itself?

### Introduce the concept in isolation
```python
import csv

# Write CSV:
with open('scores.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['Name', 'Score'])   # header
    writer.writerow(['Alice', 95])
    writer.writerow(['Bob', 87])
    writer.writerow(['Charlie', 92])

# Read CSV:
with open('scores.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)           # ['Name', 'Score']
    for row in reader:
        print(f'{row[0]}: {row[1]}') # Alice: 95, etc.

# Append to existing file:
with open('scores.csv', 'a', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Diana', 99])  # adds at end
```
This demonstrates the **CSV module**. Trace: `csv.writer` wraps the file object. `writerow(['Alice', 95])`: converts to `'Alice,95\n'`, writes to file. `csv.reader`: on each iteration, reads one line, splits on comma, returns list of strings.

### Discard the throwaway
This code is discarded and will not be kept in the project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `save_data.py`
- **Change type**: add
- **Location**: Top of file and end of file.
- **Dependencies**: `csv` module.

### The New Code
```python
import csv

def write_score(filename, name, score):
    with open(filename, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([name, score])
```

### The Updated Project
```python
1: import csv                                                       # ← new
2: 
3: def save_greeting(filename):
4:     with open(filename, 'w', encoding='utf-8') as f:
5:         f.write('Welcome to the project!\n')
6:     print(f"File {filename} is automatically closed: {f.closed}")
7: 
8: def read_greeting(filename):
9:     with open(filename, 'r', encoding='utf-8') as f:
10:        for line in f:
11:            print("Found line:", line.strip())
12:
13: def write_score(filename, name, score):                          # ← new
14:     with open(filename, 'a', newline='', encoding='utf-8') as f: # ← new
15:         writer = csv.writer(f)                                   # ← new
16:         writer.writerow([name, score])                           # ← new
```
We added CSV appending support.

### Mechanical walkthrough
- `import csv` imports the standard library module.
- `with open(...)` opens file in append mode (`'a'`).
- `csv.writer(f)` creates the writer wrapping the file.
- `writer.writerow([...])` writes a list as a CSV line.

### CS lens
Serialization. 3-5 unrelated real-world places it appears: JSON endpoints in REST, Protocol Buffers in gRPC, saving game configs in INI, object pickling.

### SE lens
Standard formats. The alternative NOT chosen: writing a custom format with string splits. Real tradeoff: using the `csv` module handles edge cases (like escaping commas in the data) that a naive split wouldn't catch.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Appends formatted CSV text to the file.

### One sentence connecting to previous unit
Handling files gets trickier when we need cross-platform path resolution.

## Concept Unit: Paths with pathlib and os.path

### The Problem
Windows uses backslashes `\` for paths. Linux uses forward slashes `/`. How do we write code that works on both without breaking?

### Introduce the concept in isolation
```python
from pathlib import Path
import os

# pathlib (modern Python):
p = Path('data') / 'scores.csv'    # OS-independent path joining
print(p)              # data/scores.csv (or data\scores.csv on Windows)
print(p.exists())     # True/False
print(p.suffix)       # '.csv'
print(p.stem)         # 'scores'
print(p.parent)       # Path('data')

# Read with pathlib:
if p.exists():
    content = p.read_text(encoding='utf-8')  # one-liner read
    p.write_text('new content', encoding='utf-8')  # one-liner write

# List directory:
for f in Path('.').iterdir():
    if f.suffix == '.csv':
        print(f.name)
```
This demonstrates **pathlib**. Trace: `Path('data') / 'scores.csv'`: `__truediv__` joins paths with OS separator. `p.exists()`: calls `os.path.exists` internally. `p.read_text()`: opens, reads all, closes. Returns str.

### Discard the throwaway
This code is discarded and will not be kept in the project.

### Project Change
- **Reference Source**: None.
- **Files affected**: `save_data.py`
- **Change type**: add
- **Location**: Top of file and end of file.
- **Dependencies**: `pathlib` module.

### The New Code
```python
from pathlib import Path

def list_csvs(directory):
    for f in Path(directory).iterdir():
        if f.suffix == '.csv':
            print(f.name)
```

### The Updated Project
```python
1: import csv
2: from pathlib import Path                                         # ← new
3: 
4: def save_greeting(filename):
5:     with open(filename, 'w', encoding='utf-8') as f:
6:         f.write('Welcome to the project!\n')
7:     print(f"File {filename} is automatically closed: {f.closed}")
8: 
9: def read_greeting(filename):
10:    with open(filename, 'r', encoding='utf-8') as f:
11:        for line in f:
12:            print("Found line:", line.strip())
13:
14: def write_score(filename, name, score):
15:     with open(filename, 'a', newline='', encoding='utf-8') as f:
16:         writer = csv.writer(f)
17:         writer.writerow([name, score])
18:
19: def list_csvs(directory):                                       # ← new
20:     for f in Path(directory).iterdir():                         # ← new
21:         if f.suffix == '.csv':                                  # ← new
22:             print(f.name)                                       # ← new
```
We added a method to reliably iterate and list CSV files in a directory.

### Mechanical walkthrough
- `from pathlib import Path` imports the Path object.
- `Path(directory).iterdir()` creates a path object and yields children.
- `f.suffix` gives the file extension.
- `print(f.name)` outputs the base name of the file.

### CS lens
Cross-platform abstractions. 3-5 unrelated real-world places it appears: JVM virtual machines abstracting hardware, Docker abstracting host OS, web browsers abstracting graphics APIs, ORMs abstracting SQL dialects.

### SE lens
Object-oriented standard libraries. The alternative NOT chosen: manipulating strings with `os.path.join()`. Real tradeoff: Path objects carry their methods with them, avoiding functional clutter, but you occasionally must cast them back to strings for older APIs.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Prints the names of all `.csv` files in the specified directory.

### One sentence connecting to previous unit
Let's trace everything we built from end to end.

## Closing

### Connect the pieces
We learned to open files in write mode and safely manage them using `with` and the context manager. When writing CSV data using `csv.writer`, the file handles formatting seamlessly, and we can append rows dynamically. We then learned how memory-efficient reading works: by iterating `for row in reader`, we read and parse one row at a time. If we run a trace writing `scores.csv`, reading it back, and filtering rows where the score > 90, we create the file context, wrap it in a writer, and save to disk; then we re-open it, iterate via `csv.reader`, check the row's second element, and print matches — all without ever loading the entire dataset into memory at once. Finally, `pathlib` ensures this pipeline operates safely across different operating systems.
