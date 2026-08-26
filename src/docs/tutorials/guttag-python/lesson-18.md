# Lesson 18: Files — Reading, Writing, and `with`

This is Lesson 18 of the Introduction to Computation and Programming Using Python series, part of Module 2 — Writing Good Programs.

What you will build:
The reader will read and write text files using `open()`, use the `with` statement as a context manager, work with CSV files using the `csv` module, and understand file modes and encoding. The transferable problems this lesson is actually about are: (1) the `with` statement guarantees the file is closed even if an exception occurs — always use `with open(...)` rather than manual `f.close()`; (2) files are sequences of bytes on disk; Python reads them as text (strings) or binary (bytes) depending on the mode; (3) the `csv` module handles the quoting and delimiter rules so you don't have to split on commas manually.

What you need to know first:
- Lesson 0–17 (all prior Python through exceptions, testing, debugging)

Terms used in this lesson:
- **file object** — an interface to a file on the computer's storage, allowing Python to read from or write to it. It manages the connection between your program and the operating system's file system.
- **context manager** — an object that sets up a context for a block of code and automatically cleans it up when the block exits. It exists to guarantee resources (like file handles) are released even if errors occur.
- **absolute path** — a file path that provides the complete route from the root of the file system to the file. It exists to point to exactly one file regardless of the program's current working directory.
- **relative path** — a file path resolved relative to the current working directory. It exists to let programs find local files without knowing the exact location on every machine.
- **encoding** — a specific set of rules for converting characters into bytes (and vice versa). It exists because disks only store bytes, while programs need text, and there needs to be an agreed-upon mapping (like UTF-8).
- **mode** — a string passed to `open()` that tells Python what you intend to do with the file (e.g., read, write, append). It exists to control permissions and prevent accidental modification of data.
- **newline** — a special character (e.g., `\n`) that marks the end of a line of text. It exists to divide a single long string of characters into separate physical lines.

Objects and methods used:

**`open`**
- *What it is:* A built-in Python function that opens a file and returns a file object.
- *Implementation:* `open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None, closefd=True, opener=None)`
- *Its use:* We use it to get access to the contents of a file on the disk or to create a new file to write to.
- *Type:* Built-in function.
- *Responsibility:* Interacts with the operating system to open a file and returns a file object that Python can use to interact with the file.
- *Depends on:* A string representing the file path, and optionally a mode string and encoding string.
- *Connects to:* Called by our code, returns a file object.
- *Shape:* A fundamental Python built-in function, serving as the boundary between our program and the file system.

**`file.read`**
- *What it is:* A method on a file object that reads the contents of the file.
- *Implementation:* `file.read(size=-1)` returns a string (in text mode) or bytes (in binary mode).
- *Its use:* We use it to read the entire file into a single string.
- *Type:* Instance method on a file object.
- *Responsibility:* Reads a specified number of characters/bytes from the file, or the entire file if no size is given.
- *Depends on:* The file object being open in a mode that allows reading.
- *Connects to:* Called on the file object, returns a string.
- *Shape:* An instance method of the file object interface.

**`file.close`**
- *What it is:* A method on a file object that closes the file and releases its resources.
- *Implementation:* `file.close()`
- *Its use:* We use it to tell the OS that we are done with the file, ensuring data is written and locks are released.
- *Type:* Instance method on a file object.
- *Responsibility:* Flushes any unwritten information and closes the file object, after which no more reading or writing can be done.
- *Depends on:* The file object itself.
- *Connects to:* Called on the file object.
- *Shape:* An instance method of the file object interface.

**`file.readlines`**
- *What it is:* A method that reads all lines from the file and returns them as a list of strings.
- *Implementation:* `file.readlines(hint=-1)` returns a list of strings.
- *Its use:* We use it to get every line of the file into memory at once as a distinct item in a list.
- *Type:* Instance method on a file object.
- *Responsibility:* Reads until EOF and returns a list of lines.
- *Depends on:* The file object being open for reading.
- *Connects to:* Called on the file object, returns a list.
- *Shape:* An instance method of the file object interface.

**`file.readline`**
- *What it is:* A method that reads a single line from the file.
- *Implementation:* `file.readline(size=-1)` returns a string.
- *Its use:* We use it to manually pull one line at a time from the file.
- *Type:* Instance method on a file object.
- *Responsibility:* Reads characters until a newline or EOF is reached, returning the line as a string.
- *Depends on:* The file object being open for reading.
- *Connects to:* Called on the file object, returns a string.
- *Shape:* An instance method of the file object interface.

**`file.write`**
- *What it is:* A method that writes a string to the file.
- *Implementation:* `file.write(s)` returns the number of characters written.
- *Its use:* We use it to put text into a file.
- *Type:* Instance method on a file object.
- *Responsibility:* Writes the string `s` to the stream and returns the number of characters written.
- *Depends on:* The file object being open in a mode that allows writing (e.g., `'w'`, `'a'`).
- *Connects to:* Called on the file object, takes a string.
- *Shape:* An instance method of the file object interface.

**`print`**
- *What it is:* A built-in function that prints objects to a text stream.
- *Implementation:* `print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)`
- *Its use:* We use it with the `file=` argument to redirect output to a file instead of the screen.
- *Type:* Built-in function.
- *Responsibility:* Converts objects to strings, joins them with `sep`, and writes them to the specified `file` stream, followed by `end`.
- *Depends on:* The objects to print, and the destination stream.
- *Connects to:* Called by our code, outputs to the specified stream.
- *Shape:* A fundamental Python built-in for output.

**`os.path.join`**
- *What it is:* A function in the `os.path` module that intelligently joins one or more path components.
- *Implementation:* `os.path.join(path, *paths)` returns a string.
- *Its use:* We use it to build file paths correctly for the current operating system (e.g., using `\` on Windows and `/` on Mac/Linux).
- *Type:* Function in the `os.path` module.
- *Responsibility:* Joins paths using the correct OS-specific separator.
- *Depends on:* Path components provided as strings.
- *Connects to:* Called by our code, returns a formatted path string.
- *Shape:* A standard library utility function.

**`os.path.exists`**
- *What it is:* A function that checks if a file or directory exists.
- *Implementation:* `os.path.exists(path)` returns a boolean.
- *Its use:* We use it to verify a file is present before attempting to open it, avoiding a `FileNotFoundError`.
- *Type:* Function in the `os.path` module.
- *Responsibility:* Returns `True` if path refers to an existing path or an open file descriptor.
- *Depends on:* A string path.
- *Connects to:* Called by our code, returns a boolean.
- *Shape:* A standard library utility function.

**`os.path.getsize`**
- *What it is:* A function that returns the size of a file in bytes.
- *Implementation:* `os.path.getsize(path)` returns an integer.
- *Its use:* We use it to find out how large a file is before reading it.
- *Type:* Function in the `os.path` module.
- *Responsibility:* Returns the size, in bytes, of path.
- *Depends on:* A string path.
- *Connects to:* Called by our code, returns an integer.
- *Shape:* A standard library utility function.

**`sys.getdefaultencoding`**
- *What it is:* A function that returns the name of the current default string encoding.
- *Implementation:* `sys.getdefaultencoding()` returns a string.
- *Its use:* We use it to illustrate that the default encoding is platform-dependent.
- *Type:* Function in the `sys` module.
- *Responsibility:* Returns the encoding used by the Python runtime for string operations when none is specified.
- *Depends on:* Nothing.
- *Connects to:* Called by our code, returns a string.
- *Shape:* A standard library utility function.

**`sys.stdout.encoding`**
- *What it is:* An attribute that holds the encoding of standard output.
- *Implementation:* A string attribute on the `sys.stdout` file object.
- *Its use:* We use it to show that terminal encoding may differ from the system default.
- *Type:* String attribute.
- *Responsibility:* Stores the encoding used to print to the console.
- *Depends on:* The `sys.stdout` object.
- *Connects to:* Accessed by our code.
- *Shape:* A property of the standard output stream.

**`csv.writer`**
- *What it is:* A function in the `csv` module that creates an object capable of writing CSV data.
- *Implementation:* `csv.writer(csvfile, dialect='excel', **fmtparams)` returns a writer object.
- *Its use:* We use it to write rows of data correctly formatted with commas and quotes.
- *Type:* Function returning a writer object.
- *Responsibility:* Converts user data into delimited strings and writes them to the given file-like object.
- *Depends on:* An open file object.
- *Connects to:* Called with a file object, returns a writer object.
- *Shape:* A factory function in the `csv` standard library.

**`csv.reader`**
- *What it is:* A function that creates an object capable of iterating over lines in a CSV file.
- *Implementation:* `csv.reader(csvfile, dialect='excel', **fmtparams)` returns a reader object.
- *Its use:* We use it to parse lines of text into lists of strings based on comma delimiters.
- *Type:* Function returning an iterator object.
- *Responsibility:* Parses CSV-formatted data from the given file-like object.
- *Depends on:* An open file object.
- *Connects to:* Called with a file object, returns an iterator.
- *Shape:* A factory function in the `csv` standard library.

**`csv.DictReader`**
- *What it is:* A class that operates like a regular reader but maps the information in each row to a dictionary.
- *Implementation:* `csv.DictReader(f, fieldnames=None, restkey=None, restval=None, dialect='excel', *args, **kwds)`
- *Its use:* We use it to read CSV rows as dictionaries, where the keys are the column headers.
- *Type:* Class in the `csv` module.
- *Responsibility:* Reads a CSV file and constructs a dictionary for each row using the header row as keys.
- *Depends on:* An open file object.
- *Connects to:* Instantiated with a file object, yields dictionaries on iteration.
- *Shape:* A class in the `csv` standard library.

**`next`**
- *What it is:* A built-in function that retrieves the next item from an iterator.
- *Implementation:* `next(iterator, default)`
- *Its use:* We use it to manually extract the first row (the header) from a `csv.reader` before looping through the rest.
- *Type:* Built-in function.
- *Responsibility:* Calls the `__next__()` method on the iterator to return the next item.
- *Depends on:* An iterator object.
- *Connects to:* Called with an iterator, returns an element.
- *Shape:* A fundamental Python built-in function.

## Concept Unit: Opening and Reading a File

### The Problem
We need our programs to be able to read data that was saved on the computer's hard drive, rather than typing all data directly into the source code. How do we access a file on disk?

### The Code in Isolation
```python
# Assume a file 'hello.txt' is created beforehand containing:
# Hello, World!
# This is line two.
# Third line.

f = open('hello.txt', 'r')  # 'r' = read mode
content = f.read()           # reads the whole file as a string
f.close()                    # MUST close!
print(content)
# Output proves we successfully read from disk:
# Hello, World!
# This is line two.
# Third line.
```
This proves that `open()` connects us to the file and `read()` pulls its contents into a standard Python string. 

### Discard the Example
The example above is throwaway code. We will discard it and not use it in our final project structure, because we will learn a safer way to manage the file object in the next unit.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `file_reading.py` (created).
- **Change type:** add.
- **Location:** at the top of the file.
- **Dependencies:** None.

### The New Code
```python
f = open('hello.txt', 'r')
content = f.read()
f.close()
```

### The Updated Project
```python
1: f = open('hello.txt', 'r')  # ← new
2: content = f.read()          # ← new
3: f.close()                   # ← new
```
This script now opens the file, reads it, and closes the handle.

### Mechanical Walkthrough
- `open('hello.txt', 'r')`: The built-in `open` function is called with the string `'hello.txt'` specifying the path, and `'r'` specifying read **mode**. It interacts with the operating system and returns a **file object**, assigned to `f`.
- `f.read()`: The `read` method is called on the file object `f`. It reads the entire file into memory and returns it as one large string, including **newlines**, which is assigned to `content`.
- `f.close()`: The `close` method is called on the file object. This tells the operating system we are done, releasing the file lock and freeing memory. Forgetting to close can cause data loss on write and resource leaks on read.


## Concept Unit: The `with` Statement

### The Problem
If an exception occurs between opening a file and closing it, the `f.close()` line might never execute, leaving the file handle open indefinitely and leaking resources. How can we ensure a file is always closed?

### The Code in Isolation
```python
with open('hello.txt', 'r') as f:
    content = f.read()
# f is automatically closed here, even if an exception occurs
print(content)
# Output proves we can read the file identically:
# Hello, World!
# This is line two.
# Third line.
```
This proves that the **context manager** pattern allows us to read the file, and as soon as the indented block finishes, the file is safely closed for us.

### Discard the Example
The throwaway example above is discarded.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `file_reading.py` (modified).
- **Change type:** replace.
- **Location:** replacing the previous manual `open`/`close` logic.
- **Dependencies:** None.

### The New Code
```python
with open('hello.txt', 'r') as f:
    content = f.read()
```

### The Updated Project
```python
1: with open('hello.txt', 'r') as f:  # ← new (replaces previous open)
2:     content = f.read()             # ← new (replaces previous read/close)
```
The file reading logic is now wrapped safely in a context manager.

### Mechanical Walkthrough
- `with`: The `with` keyword starts a context block. It evaluates the expression that follows, expecting a **context manager** object.
- `open('hello.txt', 'r')`: The `open` function returns our **file object**, which acts as a context manager.
- `as f`: The returned file object is bound to the variable `f` for use within the block.
- `content = f.read()`: We read the entire file string into `content`. When the block ends, Python guarantees `f.close()` is called automatically, regardless of success or exceptions.


## Concept Unit: Reading Line by Line

### The Problem
If a file is extremely large (e.g., gigabytes of logs), reading the entire thing into a single string using `.read()` will crash the program by running out of memory. How can we process files efficiently?

### The Code in Isolation
```python
# Method 2: iterate over the file object (memory-efficient)
with open('hello.txt', 'r') as f:
    for line in f:
        print(line.strip())  # .strip() removes the trailing \n

# Output proves we read each line separately:
# Hello, World!
# This is line two.
# Third line.
```
This proves that iterating over `f` yields one line at a time, consuming very little memory.

### Discard the Example
This iteration example is discarded from our working project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `line_reader.py` (created).
- **Change type:** add.
- **Location:** top of file.
- **Dependencies:** None.

### The New Code
```python
with open('hello.txt', 'r') as f:
    for line in f:
        print(line.strip())
```

### The Updated Project
```python
1: with open('hello.txt', 'r') as f:  # ← new
2:     for line in f:                 # ← new
3:         print(line.strip())        # ← new
```
This project now processes files in a memory-efficient loop.

### Mechanical Walkthrough
- `with open('hello.txt', 'r') as f:`: We safely open the file using a **context manager**.
- `for line in f:`: A `for` loop iterates directly over the **file object**. The file object acts as an iterator, yielding one line of text at a time.
- `line.strip()`: We call `.strip()` on the string to remove the trailing **newline** character that is included in each line read from the file.
- `print(...)`: The `print` function outputs the cleaned line.

## Concept Unit: Writing to a File

### The Problem
We can read data, but how do we save computed results back out to a file on the disk?

### The Code in Isolation
```python
# 'w' mode: create or OVERWRITE
with open('output.txt', 'w') as f:
    f.write('Line 1\n')
    f.write('Line 2\n')

# Verify:
with open('output.txt', 'r') as f:
    print(f.read())
# Output proves the file was created and written to:
# Line 1
# Line 2
```
This proves that using the `'w'` mode and `.write()` modifies the disk.

### Discard the Example
This write-test example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `file_writer.py` (created).
- **Change type:** add.
- **Location:** top of file.
- **Dependencies:** None.

### The New Code
```python
with open('output2.txt', 'w') as f:
    print('Hello from print', file=f)
```

### The Updated Project
```python
1: with open('output2.txt', 'w') as f:       # ← new
2:     print('Hello from print', file=f)     # ← new
```
This script creates a new file and writes a string directly to it.

### Mechanical Walkthrough
- `open('output2.txt', 'w')`: We open a file in write **mode** (`'w'`). This will create a new file or completely overwrite an existing one.
- `as f`: Bound to variable `f` via the **context manager**.
- `print('Hello from print', file=f)`: We use the built-in `print` function, but supply the `file=f` keyword argument. Instead of printing to the screen, `print` writes the formatted string, complete with an automatic **newline**, into the file object.


## Concept Unit: File Paths and `os.path`

### The Problem
So far we've just passed filenames like `'hello.txt'`, which looks in the folder the script runs from. What if the file is in a different directory, or we need to run on a different operating system?

### The Code in Isolation
```python
import os

data_dir = 'data'
filename = 'sales.csv'
path = os.path.join(data_dir, filename)

if os.path.exists(path):
    print("Found it!")
else:
    print(f'File not found: {path}')

# Output proves we can construct paths and check existence:
# File not found: data\sales.csv
```
This proves `os.path.join` creates the correct path format safely.

### Discard the Example
The path construction example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `path_example.py` (created).
- **Change type:** add.
- **Location:** top of file.
- **Dependencies:** None.

### The New Code
```python
import os
path = os.path.join('data', 'sales.csv')
print(os.path.exists(path))
```

### The Updated Project
```python
1: import os                                   # ← new
2: path = os.path.join('data', 'sales.csv')    # ← new
3: print(os.path.exists(path))                 # ← new
```
This script safely builds a relative path and checks if it exists.

### Mechanical Walkthrough
- `import os`: Imports the built-in operating system module.
- `os.path.join('data', 'sales.csv')`: Calls the `join` method. It combines directory names and filenames using the correct separator (e.g., `\` on Windows) and returns a **relative path**.
- `os.path.exists(path)`: Calls the `exists` function, returning a boolean indicating if the path points to a real file, preventing errors when opening missing files.


## Concept Unit: Encoding

### The Problem
Files on disk are just 1s and 0s (bytes). How does Python know which bytes correspond to "A" versus "Café"?

### The Code in Isolation
```python
# Writing with explicit encoding:
with open('unicode.txt', 'w', encoding='utf-8') as f:
    f.write('Caf\u00e9\n')  # Café
    f.write('\u4e2d\u6587\n')  # Chinese characters

with open('unicode.txt', 'r', encoding='utf-8') as f:
    print(f.read())
# Output proves characters are saved and read accurately:
# Café
# 中文
```
This proves explicitly setting `encoding='utf-8'` handles special characters perfectly.

### Discard the Example
This encoding demonstration is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `encoding_test.py` (created).
- **Change type:** add.
- **Location:** top of file.
- **Dependencies:** None.

### The New Code
```python
with open('unicode.txt', 'w', encoding='utf-8') as f:
    f.write('Caf\u00e9\n')
```

### The Updated Project
```python
1: with open('unicode.txt', 'w', encoding='utf-8') as f:  # ← new
2:     f.write('Caf\u00e9\n')                             # ← new
```
The file is now written using an explicit UTF-8 encoding.

### Mechanical Walkthrough
- `open('unicode.txt', 'w', encoding='utf-8')`: We pass the `encoding='utf-8'` keyword argument. This **encoding** guarantees Python maps our characters into bytes using the universal UTF-8 standard, avoiding platform-dependent crashes when writing text outside the basic alphabet.
- `f.write('Caf\u00e9\n')`: Writes the unicode string to the file, converted to bytes using the specified encoding.


## Concept Unit: CSV Files with the `csv` Module

### The Problem
Data is often saved in Comma Separated Value (CSV) format. Using `.split(',')` manually breaks if a data field itself contains a comma (e.g., `"Smith, John"`). How do we read it correctly?

### The Code in Isolation
```python
import csv

# Assume students.csv exists with headers and data
with open('students.csv', 'r', newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"{row['name']}: {row['score']}")
# Output proves DictReader parses rows into dictionaries safely:
# Alice: 95
# Bob: 82
# Carol: 91
```
This proves that the `csv` module correctly parses each row into a dictionary.

### Discard the Example
The CSV reader example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `csv_reader.py` (created).
- **Change type:** add.
- **Location:** top of file.
- **Dependencies:** `students.csv` file.

### The New Code
```python
import csv
with open('students.csv', 'r', newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row['name'])
```

### The Updated Project
```python
1: import csv                                                        # ← new
2: with open('students.csv', 'r', newline='', encoding='utf-8') as f: # ← new
3:     reader = csv.DictReader(f)                                    # ← new
4:     for row in reader:                                            # ← new
5:         print(row['name'])                                        # ← new
```
This script reliably reads complex data grids.

### Mechanical Walkthrough
- `import csv`: Imports the standard library CSV module.
- `newline=''`: Passed to `open()`, this prevents Python's default **newline** translation, handing control of row boundaries directly to the CSV module (preventing empty lines on Windows).
- `csv.DictReader(f)`: The `DictReader` class wraps our **file object** `f`. It reads the first row to determine column names.
- `for row in reader:`: We iterate over the `DictReader`.
- `row['name']`: Each `row` yielded is a Python dictionary, mapping the header string `'name'` to the actual string value in that column for this row.

Closing: file I/O is the bridge between your program and the outside world. Lesson 19 covers closures and decorators — advanced function patterns. Exercises: write a function `count_lines(path)` that returns the number of non-empty lines in a file; write a CSV-to-dict converter that reads a CSV and returns a list of dicts; write a word frequency counter that reads a text file and writes the results to a new file sorted by frequency.
