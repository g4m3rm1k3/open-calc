# Lesson 1: Read Real Data

**What you will build:** A real Python program — `house_stats.py` — that
opens an actual CSV file of house sale data (`houses.csv`, sitting
alongside this lesson) and prints the number of houses, and the
average, lowest, and highest price among them. Every value you have
worked with in Python so far has been typed directly into your own
source code. Today, for the first time in this track, your program
reads data it never saw while you were writing it — a file that could
have a different number of rows, different values, or not exist at
all, and your program needs to survive all three.

**What you need to know first:** Nothing beyond this track's own
stated floor: variables, functions, loops, lists, dictionaries, and
basic Python syntax (`if`, `print`, calling a function you've defined).
No file handling, no external libraries, no error handling of any
kind — every one of those is this lesson's own subject, taught from
scratch, at the exact point your program first needs it.

**Terms introduced in this lesson:**
- **Module** — a file of Python code that can be brought into another
  file with `import`; the mechanism behind every `import` statement you
  will ever write, standard-library or otherwise.
- **`with` statement / context manager** — a block that guarantees a
  cleanup action (here, closing a file) runs automatically when the
  block ends, even if the code inside it crashes partway through.
- **`csv` module** — the standard library's tool for reading and
  writing comma-separated text files as structured rows instead of raw
  text.
- **`csv.reader` / `csv.DictReader`** — two ways to read a CSV file's
  rows: as plain lists of strings (`reader`), or as dictionaries keyed
  by the file's own header row (`DictReader`).
- **Helper function** — a function that exists to give a self-contained
  piece of work its own name, so the code that calls it can be read
  without also reading how that work gets done.
- **Exception** — an object Python raises when something goes wrong
  while a program is running, immediately stopping normal execution
  unless something explicitly catches it.
- **Traceback** — the report Python prints when an exception goes
  uncaught, listing every function call that was active at the moment
  it was raised, most recent first.
- **`try`/`except`** — a block that lets a program catch a specific
  exception and decide what "recovery" means, instead of crashing.
- **`assert`** — a statement that states an assumption directly in
  code, raising `AssertionError` immediately if that assumption turns
  out to be false.

---

## Concept Unit: Modules and `import` — Borrowing Code You Didn't Write

### The Problem

The very first real line of code this lesson needs is `import csv` —
using code the standard library already wrote, instead of writing a
CSV parser by hand. `import` has almost certainly appeared in code
you've read before, but this track assumes nothing was explained the
first time you saw it. What does `import` actually do?

### Introduce the Concept in Isolation

Create a folder for this lesson's labs. Inside it, create
`import_demo.py`:

```python
import math

print(math.sqrt(16))
print(math.pi)
```

Run it:

```
python3 import_demo.py
```

Real output, this session:

```
4.0
3.141592653589793
```

### Discard the Throwaway Example

Delete `import_demo.py` — it exists only to prove what `import` does in
isolation; the real project imports `csv`, not `math`, starting in the
next unit.

### Mechanical Walkthrough

- `import math` — **first appearance.** `math` is a **module** — a file
  of Python code, written by someone else, that Python already knows
  how to find because it ships as part of the standard library. This
  line makes everything defined inside that file available in yours,
  reachable through the name `math`.
- `math.sqrt(16)` calls a function that belongs to an imported module
  — **first appearance of dotted access into an imported module.**
  `sqrt` is a function defined inside the `math` module, not a
  function you wrote; `math.sqrt(...)` calls it exactly the same way
  you'd call any function, just reached through the module's name
  first. Returns `4.0`, a `float`, not the `int` `4` — worth noting
  since `16` itself was a plain `int`.
- `math.pi` — **first appearance of reading a plain value (not calling
  a function) out of a module.** `pi` isn't a function — no
  parentheses — it's just a number, `3.141592653589793`, that already
  exists inside the `math` module and can be read directly.

### CS Lens

This is **namespacing** — every name inside `math` (`sqrt`, `pi`, and
many others) lives inside its own separate container, reached only
through `math.`, so it can never accidentally collide with a `sqrt` or
`pi` you might define yourself elsewhere in your own code. Also
recognized in: any language's package/module system, a filesystem's own
folder structure keeping two files both named `notes.txt` apart as long
as they're in different directories, and a company's org chart
disambiguating two employees who happen to share a first name by which
department they're in.

### SE Lens

**Why does Python make you write `math.sqrt(...)` instead of just
`import math` making `sqrt` available directly, with no prefix?** The
alternative — every imported name dropping directly into your own
code with no module prefix — is genuinely possible in Python
(`from math import *`), and it's avoided by convention specifically
because it silently reintroduces the exact collision namespacing was
meant to prevent: if you `import` two different modules that both
happen to define something called `sqrt`, whichever one was imported
second would silently overwrite the first, with no error, no warning
— a real bug with no visible cause in your own code. Writing
`math.sqrt(...)` costs a few extra characters in exchange for that
becoming structurally impossible.

---

## Concept Unit: Files, `open()`, and Why `with` Exists

### The Problem

Before this project can read `houses.csv`, it has to open it. The most
direct way — call `open()`, do something with the file, then call
`close()` — genuinely works, but has a real, provable flaw worth seeing
before reaching for the safer tool.

### Introduce the Concept in Isolation

In the same lab folder, create `scratch.txt`:

```
hello from a file
second line
```

Create `manual_close_demo.py`:

```python
f = open("scratch.txt")
print("File open?", not f.closed)
contents = f.read()
print(repr(contents))
f.close()
print("File open?", not f.closed)
```

Run it:

```
python3 manual_close_demo.py
```

Real output, this session:

```
File open? True
'hello from a file\nsecond line\n'
File open? False
```

`f.closed` is a property every open file object has — `True` once
`.close()` has run, `False` before. `repr(...)`, used here instead of
`print(contents)` directly, shows the string's own escape sequences
(`\n`) rather than rendering them as real line breaks — useful for
seeing exactly what characters a value actually contains.

Now see the real flaw. Create `manual_close_broken.py`:

```python
f = open("scratch.txt")
print("File open?", not f.closed)
contents = f.read()
number = int(contents)  # this will fail -- contents isn't a number
f.close()
print("File open?", not f.closed)
```

Run it:

```
python3 manual_close_broken.py
```

Real output, this session:

```
File open? True
Traceback (most recent call last):
  File "manual_close_broken.py", line 4, in <module>
    number = int(contents)  # this will fail -- contents isn't a number
             ^^^^^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'hello from a file\nsecond line\n'
```

What this proves: the crash happens on the line *before* `f.close()`
ever runs. Execution stops the instant `int(contents)` fails and never
reaches `f.close()` at all — the file is left open, permanently, for
as long as this program keeps running. `f.close()` being the very next
line in your source doesn't mean it's guaranteed to execute; only code
that actually runs, runs.

Now the fix. Create `with_demo.py`:

```python
with open("scratch.txt") as f:
    print("Inside the with-block, file open?", not f.closed)
    contents = f.read()

print("After the with-block, file open?", not f.closed)
```

Run it:

```
python3 with_demo.py
```

Real output, this session:

```
Inside the with-block, file open? True
After the with-block, file open? False
```

That alone doesn't prove much — `close()` was still reachable normally
in this version too. Prove the real claim: does `with` actually close
the file even when the block crashes? Create `with_demo_crash.py`:

```python
f = None
try:
    with open("scratch.txt") as f:
        contents = f.read()
        number = int(contents)  # crashes inside the with-block
except ValueError:
    print("Caught the crash. File open after the crash?", not f.closed)
```

(`try`/`except` here is genuinely reappearing content from the moment
you read it — this lab is proving `with`, not `try`/`except`, which
gets its own full treatment later in this lesson; it's used here only
so the crash doesn't stop the script before you can check `f.closed`.)

Run it:

```
python3 with_demo_crash.py
```

Real output, this session:

```
Caught the crash. File open after the crash? False
```

This is the actual proof: even though the code inside the `with`-block
crashed partway through, exactly the way `manual_close_broken.py` did,
the file was still closed. `with` doesn't just call `close()` for you
at the end of the block — it guarantees `close()` runs no matter how
the block ends, success or crash.

### Discard the Throwaway Example

Delete `scratch.txt` and all four demo files — none of it appears in
the project again. The real project only ever uses the `with` form.

### Mechanical Walkthrough

- The built-in `open()` function, called here as `open("scratch.txt")`,
  opens a file and returns a file object — **first appearance.** That
  returned object has its own methods (`.read()`, `.close()`) and
  properties (`.closed`) for interacting with the now-open file.
- That file object's own `.close()` method, called here as `f.close()`,
  releases the file — **first appearance.** After this call, the
  operating system knows your program is done with it, and `.read()`
  would no longer work on `f`.
- `f.read()` — **first appearance.** Reads the entire remaining
  contents of the file as one string.
- `with open("scratch.txt") as f:` — **first appearance of the `with`
  statement.** `with` wraps a **context manager** (here, the file
  object `open()` returns) in a block; whatever `close()`-equivalent
  cleanup that object defines is guaranteed to run when the block ends
  — proven above to include the case where the block ends via a crash,
  not just normal completion. `as f` names the value the context
  manager hands back, the same file object `open()` alone would have
  returned.

### CS Lens

This is **guaranteed cleanup / deterministic resource release** — a
language-level guarantee that a specific action happens when a block
ends, regardless of *how* it ends. Also recognized in: Java's/C#'s
`try`-with-resources and `using` blocks (the same guarantee, different
syntax), a database connection pool that always returns a connection
even if the query using it threw, and a lock that always gets released
even if the code holding it crashes — one of the most common real-world
sources of "this program hung forever" bugs is exactly a lock acquired
without this guarantee.

### SE Lens

**Why does this matter for a file specifically, when the operating
system would eventually clean up after your program exits anyway?**
Because "eventually, when the whole program exits" is not the same
guarantee as "right when I'm done with it" — a long-running program
(a web server, a script processing thousands of files in a loop) that
leaks one file handle per crash will eventually hit the operating
system's limit on how many files one process can have open
simultaneously, at which point *every* file operation starts failing,
including ones completely unrelated to the original bug. `with` costs
nothing extra to write over remembering to call `close()` yourself, in
exchange for that failure mode being structurally impossible rather
than a discipline you have to maintain forever.

---

## Concept Unit: Reading Real Rows — the `csv` Module

### The Problem

`f.read()` gives back one giant string — the whole file's raw text,
with no idea that it's supposed to be rows and columns. Splitting that
manually (on newlines, then on commas) would work for a moment and
quietly break the first time a value legitimately contains a comma
inside quotes. The standard library already solved this correctly.

### Introduce the Concept in Isolation

In the lab folder, create `tiny.csv`:

```
name,age,city
Ana,34,Denver
Bo,28,Reno
Cy,41,Tulsa
```

Create `csv_reader_demo.py`:

```python
import csv

with open("tiny.csv") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)
```

Run it:

```
python3 csv_reader_demo.py
```

Real output, this session:

```
['name', 'age', 'city']
['Ana', '34', 'Denver']
['Bo', '28', 'Reno']
['Cy', '41', 'Tulsa']
```

Two things worth pausing on in this real output: the header row
(`'name', 'age', 'city'`) came back as an ordinary row, exactly like
every other row — `csv.reader` has no idea one row is special. And
every value, including `'34'` and `'28'`, is a **string**, quoted just
like `'Ana'` — a CSV file has no concept of numbers at all; every field
is text until your own code decides otherwise.

### Discard the Throwaway Example

Delete `tiny.csv` and `csv_reader_demo.py` — the next unit's
`csv.DictReader` is what the real project actually uses; this one
existed only to prove `csv.reader`'s own shape first.

### Mechanical Walkthrough

- `import csv` — **reappearing** (Concept Unit 1's own mechanism),
  bringing in the standard library's CSV-handling module.
- `csv.reader(f)` — **first appearance.** Takes an open file object (`f`,
  from the `with` block) and returns a reader object — not the rows
  themselves yet, just something that knows how to produce them one at
  a time.
- `for row in reader:` — **reappearing** (`for` loop, already-basic),
  new detail worth naming: `reader` is directly iterable — each pass
  through the loop asks it for the next row, read fresh from the file,
  rather than loading the entire file into memory as one big list up
  front.
- Each `row` — **first appearance of what `csv.reader` actually
  produces**: a plain Python `list` of strings, one per comma-separated
  field, in the exact order they appeared in that line of the file.

### CS Lens

This is **parsing** — converting raw, structureless text into a
structured, typed(-ish; still all strings, but at least separated
correctly) in-memory representation your program can actually work
with, rather than a blob of characters. Also recognized in: a JSON
library turning a text file into nested Python dicts/lists, a web
browser turning raw HTML text into the DOM tree it actually renders,
and a compiler's own first stage turning source code text into tokens
before anything about the program's meaning is considered.

### SE Lens

**Why reach for the standard library's `csv` module instead of just
calling `line.split(",")` on each line yourself, which would produce
the exact same result for `tiny.csv`?** Because `tiny.csv` was
deliberately simple. Real CSV files routinely contain a comma *inside*
a field's own value — an address like `"123 Main St, Apt 4"` — which
the format handles by wrapping that field in quotes; `line.split(",")`
has no idea those quotes mean anything and would incorrectly split that
one field into two. `csv.reader` already handles quoting, escaped
quotes, and a handful of other real edge cases correctly — using it
costs one `import` line in exchange for never having to rediscover
each of those edge cases yourself, the hard way, on a real file that
happens to contain one.

---

## Concept Unit: Naming Beats Counting — `csv.DictReader`

### The Problem

Reading `row[5]` to get a house's price works, but only as long as you
remember that price is specifically the sixth column (index `5`) — add
a column to the CSV file later, or reorder the existing ones, and every
`row[5]` in your code now silently means something else, with no error
at all.

### Introduce the Concept in Isolation

In the same lab folder (recreate `tiny.csv` if you deleted it), create
`dictreader_demo.py`:

```python
import csv

with open("tiny.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row)
        print("Just the age:", row["age"])
```

Run it:

```
python3 dictreader_demo.py
```

Real output, this session:

```
{'name': 'Ana', 'age': '34', 'city': 'Denver'}
Just the age: 34
{'name': 'Bo', 'age': '28', 'city': 'Reno'}
Just the age: 28
{'name': 'Cy', 'age': '41', 'city': 'Tulsa'}
Just the age: 41
```

Compare this directly against the previous unit's real output: the
header row (`'name', 'age', 'city'`) no longer appears as its own
printed row at all — `DictReader` consumed it automatically, using it
to build the key names (`'name'`, `'age'`, `'city'`) for every
dictionary that follows. Reading `row["age"]` by name works
correctly regardless of which column position `age` happens to sit in.

### Discard the Throwaway Example

Delete `tiny.csv` and `dictreader_demo.py` — the real project uses
`csv.DictReader` against `houses.csv`, next.

### Mechanical Walkthrough

- `csv.DictReader(f)` — **first appearance.** Same shape as
  `csv.reader(f)` — reappearing there — but the object it returns
  produces `dict`s instead of plain lists, one per row.
- `row["age"]` — **first appearance of reading a CSV value by column
  name.** Reappearing dictionary-indexing syntax (already-basic),
  applied here to a dictionary `DictReader` built for you, keyed by
  whatever the file's own first row said each column was called.

### CS Lens

This is the same **encapsulation-of-position** idea behind why
`Item.getName()` is preferred over reaching directly into a data
structure's raw layout in any language — reading by a stable name
instead of a position that can silently shift. Also recognized in: a
database `SELECT name FROM table` versus assuming `name` is always
column 3, a JSON API response read by key (`response["price"]`) rather
than by array position, and named function arguments in any language
that supports them, versus relying on positional order alone.

### SE Lens

**If `DictReader` is strictly safer, why does `csv.reader` exist at
all?** `DictReader` has a real cost `csv.reader` doesn't: it rebuilds a
whole dictionary, with all the memory and per-row overhead that
implies, for every single row — for a file with millions of rows (a
problem this track's next lesson runs directly into), that overhead
adds up in a way it doesn't for the header-position-tracking `reader`
does. `csv.reader` remains the right tool when a file's columns are
truly fixed and performance matters more than the name-safety
`DictReader` buys you; `DictReader` is the right default otherwise,
which is why the real project reaches for it.

---

## Concept Unit: One Script Becomes Two Functions

### The Problem

Reading `houses.csv` and computing statistics from it are two
genuinely different jobs — "get the data" and "do something with the
data" — currently tangled into whatever order they happen to be typed
in. Give each one a name of its own.

### Project Change

- **Reference Source:** No reference counterpart — this is this
  track's own first project file, not built against any external
  reference implementation.
- **Files affected:** New file, `house_stats.py`, in this same folder
  as `houses.csv`.
- **Change type:** Create.
- **Dependencies:** `houses.csv` (already provided alongside this
  lesson).

### The New Code

```python
import csv


def load_houses(filepath):
    houses = []
    with open(filepath) as f:
        reader = csv.DictReader(f)
        for row in reader:
            row["bedrooms"] = int(row["bedrooms"])
            row["bathrooms"] = int(row["bathrooms"])
            row["sqft"] = int(row["sqft"])
            row["price"] = int(row["price"])
            row["year_built"] = int(row["year_built"])
            houses.append(row)
    return houses


def print_statistics(houses):
    prices = []
    for house in houses:
        prices.append(house["price"])

    count = len(prices)
    average_price = sum(prices) / count
    lowest_price = min(prices)
    highest_price = max(prices)

    print("Houses loaded:", count)
    print("Average price:", average_price)
    print("Lowest price:", lowest_price)
    print("Highest price:", highest_price)


houses = load_houses("houses.csv")
print_statistics(houses)
```

### The Updated Project

This is the whole file — nothing larger to show it landing inside yet.
Run it:

```
python3 house_stats.py
```

Real output, this session:

```
Houses loaded: 25
Average price: 368380.0
Lowest price: 158000
Highest price: 899000
```

### Mechanical Walkthrough

- `load_houses(filepath)` is this project's first helper function —
  **first appearance of a helper function in this project
  specifically**, though `def` itself is already-basic. Its one job:
  turn a file path into a list of
  dictionaries — nothing in this function knows or cares what happens
  to that list afterward.
- `row["bedrooms"] = int(row["bedrooms"])` and its four siblings —
  **first appearance of converting a CSV value's type.** Every value
  `DictReader` hands back is a string (proven two units ago) — `int(...)`
  converts the text `'285000'` into the real number `285000`. Without
  this, `sum(prices)` later would try to add strings together, which
  concatenates text instead of computing a sum — a real, silent
  correctness bug, not a crash.
- `houses.append(row)` — reappearing (`list.append`, already-basic),
  building up the full list one converted row at a time.
- `return houses` — reappearing (already-basic), handing the completed
  list back to whatever called `load_houses`.
- `def print_statistics(houses):` — **first appearance.** Its one job:
  given an already-loaded list of houses, compute and print facts about
  it — nothing in this function knows or cares how that list was
  produced.
- `prices = []` then the `for` loop appending into it — reappearing
  (already-basic list-building pattern), pulling just the `price` field
  out of every house dictionary into its own flat list.
- `sum(prices)`, `min(prices)`, `max(prices)`, `len(prices)` — **first
  appearance of these four built-in functions** — each takes a list of
  numbers and returns one summary number: the total, the smallest, the
  largest, and the count, respectively.
- `houses = load_houses("houses.csv")` then `print_statistics(houses)`
  — **first appearance of composing two functions together**: the
  `list` `load_houses` returns is passed directly as the argument
  `print_statistics` expects — the two functions never need to know
  anything about each other beyond that one shared shape.

### CS Lens

Splitting "produce a value" from "consume a value" into two functions
that only communicate through that one returned/passed value is
**separation of concerns** — the same idea, in miniature, behind every
larger architectural split this track will build toward. Also
recognized in: a web server's route handler calling a separate
database-query function rather than embedding raw SQL inline, a
compiler's lexer handing tokens to a parser that has no idea how those
tokens were produced, and Unix's own pipe (`|`) convention, where one
program's whole job is producing output another program consumes,
neither aware of the other's internals.

### SE Lens

**Why does this matter for an 18-line script — isn't this over-
engineering something this small?** At today's size, splitting these
into two functions barely matters; it would run identically as one
long block. It matters because of what's coming, not what's here:
Lesson 2 needs to filter houses before computing statistics on them,
Lesson 3 needs `load_houses` to handle a dataset a thousand times
larger, and later lessons need to reuse `load_houses` completely
unchanged while replacing what happens to its output entirely. A
function with one clear job or a script would have to touch it
directly to reuse it; a function with one clear job can be reused,
tested, and replaced independently the moment two things ever need to
happen with the same data. Naming the two jobs now, while there's
nothing at stake in doing so, means every lesson from here on
extends this file instead of first having to untangle it.

---

## Concept Unit: When the File Isn't There — Exceptions and Reading a Traceback

### The Problem

`load_houses("houses.csv")` works because `houses.csv` genuinely exists
in this folder. What happens if it doesn't — a typo in the filename, a
file moved to a different folder, a dataset that hasn't been downloaded
yet?

### Introduce the Concept in Isolation

In the lab folder, create `missing_file_demo.py`:

```python
import csv

with open("does_not_exist.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row)
```

Run it:

```
python3 missing_file_demo.py
```

Real output, this session:

```
Traceback (most recent call last):
  File "missing_file_demo.py", line 3, in <module>
    with open("does_not_exist.csv") as f:
         ^^^^^^^^^^^^^^^^^^^^^^^^^^
FileNotFoundError: [Errno 2] No such file or directory: 'does_not_exist.csv'
```

This is a **traceback**, and it has real structure worth reading
deliberately rather than skimming past: `Traceback (most recent call
last):` announces what follows; `File "missing_file_demo.py", line 3,
in <module>` names the exact file and line number where the failure
happened, followed by that line's own source text and a `^` marker
pointing at the specific part of it that failed; the final line,
`FileNotFoundError: [Errno 2] No such file or directory:
'does_not_exist.csv'`, names the **exception** type
(`FileNotFoundError`) and a message describing exactly what went
wrong. Reading a traceback bottom-to-top for the exception type and
message, then top-to-bottom for exactly where it happened, is the same
skill regardless of how long or short the traceback is.

Now prove this is a genuinely different exception type from a second
real failure mode — malformed data, not a missing file. Create
`bad_data.csv`:

```
address,city,bedrooms,bathrooms,sqft,price,year_built
1 Test St,Springfield,3,2,1450,unknown,1998
```

Create `bad_data_demo.py`:

```python
import csv

with open("bad_data.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        price = int(row["price"])
        print(price)
```

Run it:

```
python3 bad_data_demo.py
```

Real output, this session:

```
Traceback (most recent call last):
  File "bad_data_demo.py", line 6, in <module>
    price = int(row["price"])
            ^^^^^^^^^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'unknown'
```

Same traceback shape, genuinely different exception type —
`ValueError`, not `FileNotFoundError` — because `int("unknown")` fails
for a completely different reason than a missing file does. This
distinction matters directly for the fix, next: catching one specific
exception type does not catch the other.

Now the fix. Create `missing_file_handled.py`:

```python
import csv


def load_houses(filepath):
    houses = []
    try:
        with open(filepath) as f:
            reader = csv.DictReader(f)
            for row in reader:
                houses.append(row)
    except FileNotFoundError:
        print("Could not find a file at:", filepath)
        return []
    return houses


houses = load_houses("does_not_exist.csv")
print("Houses loaded:", len(houses))
```

Run it:

```
python3 missing_file_handled.py
```

Real output, this session:

```
Could not find a file at: does_not_exist.csv
Houses loaded: 0
```

No crash — the program noticed the specific problem it was prepared
for, printed something useful, and kept running with an empty list
instead of stopping entirely.

### Discard the Throwaway Example

Delete `missing_file_demo.py`, `bad_data.csv`, `bad_data_demo.py`, and
`missing_file_handled.py` — the real `house_stats.py`, next, gets this
exact `try`/`except` added directly.

### The New Code

Update `load_houses` in `house_stats.py`:

```python
def load_houses(filepath):
    houses = []
    try:
        with open(filepath) as f:
            reader = csv.DictReader(f)
            for row in reader:
                row["bedrooms"] = int(row["bedrooms"])
                row["bathrooms"] = int(row["bathrooms"])
                row["sqft"] = int(row["sqft"])
                row["price"] = int(row["price"])
                row["year_built"] = int(row["year_built"])
                houses.append(row)
    except FileNotFoundError:
        print("Could not find a file at:", filepath)
        return []
    return houses
```

### The Updated Project

```python
import csv


def load_houses(filepath):
    houses = []
    try:                                                          # ← new
        with open(filepath) as f:
            reader = csv.DictReader(f)
            for row in reader:
                row["bedrooms"] = int(row["bedrooms"])
                row["bathrooms"] = int(row["bathrooms"])
                row["sqft"] = int(row["sqft"])
                row["price"] = int(row["price"])
                row["year_built"] = int(row["year_built"])
                houses.append(row)
    except FileNotFoundError:                                     # ← new
        print("Could not find a file at:", filepath)               # ← new
        return []                                                  # ← new
    return houses


def print_statistics(houses):
    prices = []
    for house in houses:
        prices.append(house["price"])

    count = len(prices)
    average_price = sum(prices) / count
    lowest_price = min(prices)
    highest_price = max(prices)

    print("Houses loaded:", count)
    print("Average price:", average_price)
    print("Lowest price:", lowest_price)
    print("Highest price:", highest_price)


houses = load_houses("houses.csv")
print_statistics(houses)
```

`load_houses` now does everything it did before, plus survives a
missing file by reporting the problem and returning an empty list
instead of crashing the whole program.

### Mechanical Walkthrough

- `try:` / `except FileNotFoundError:` — reappearing (this lesson's own
  lab, above), now wrapping the real project's file-opening code
  instead of a throwaway example.
- `return []` inside the `except` block — **first appearance of
  returning early from inside error handling.** As soon as the file is
  known to be missing, there is nothing left to load — returning
  immediately with an empty list means the rest of `load_houses`'s body
  (everything inside the `with` block) is simply never reached for this
  call.

### CS Lens

**This is a hard concept — exception handling as control flow — and it
recurs constantly.** A `try`/`except` block is a structured escape
hatch: instead of letting one bad condition crash an entire program,
the failure is contained to exactly the operation that produced it, and
the surrounding code decides what "recovery" means. Also recognized
in: a web server catching a malformed request and returning an HTTP 400
instead of crashing the whole process, a batch job skipping one corrupt
record instead of aborting the entire run, and Java's near-identical
`try`/`catch` (`catch (FileNotFoundException e)` reads almost like this
exact Python).

### SE Lens

**Why catch `FileNotFoundError` specifically, instead of a bare
`except:` that catches anything at all?** Catching narrowly states,
explicitly, exactly which failure this code is prepared to recover
from — a missing file — and lets every other, genuinely unexpected
failure keep propagating and crashing loudly, where it can actually be
noticed and fixed. A bare `except:` here would also silently swallow
the `ValueError` this same unit just proved a malformed `price` field
produces, turning a loud, fixable crash into a quiet, wrong result (an
empty list, indistinguishable from a genuinely missing file) with no
clue what actually went wrong.

---

## Concept Unit: Stating What Should Always Be True — `assert`

### The Problem

`print_statistics` calls `sum(prices) / count`. If `houses` were ever
an empty list — which `load_houses` can now genuinely return, thanks
to the unit just finished — `count` would be `0`, and dividing by zero
crashes with a real but unhelpful error, far from the actual root
cause (an empty file, or a missing one, several function calls back).

### Introduce the Concept in Isolation

In the lab folder, create `assert_demo.py`:

```python
def average(numbers):
    assert len(numbers) > 0, "average() needs at least one number"
    return sum(numbers) / len(numbers)


print(average([10, 20, 30]))
print(average([]))
```

Run it:

```
python3 assert_demo.py
```

Real output, this session:

```
20.0
Traceback (most recent call last):
  File "assert_demo.py", line 7, in <module>
    print(average([]))
          ^^^^^^^^^^^^
  File "assert_demo.py", line 2, in average
    assert len(numbers) > 0, "average() needs at least one number"
           ^^^^^^^^^^^^^^^^
AssertionError: average() needs at least one number
```

The first call succeeds normally, printing `20.0`. The second call's
own traceback points directly at the `assert` line itself, with the
exact message you wrote — "average() needs at least one number" — not
a generic division error several lines away from the real problem.

### Discard the Throwaway Example

Delete `assert_demo.py` — the real project adds this exact assertion
to `print_statistics`, next.

### The New Code

Add one line to the top of `print_statistics` in `house_stats.py`:

```python
def print_statistics(houses):
    assert len(houses) > 0, "print_statistics() needs at least one house"
    prices = []
    ...
```

### The Updated Project

```python
def print_statistics(houses):
    assert len(houses) > 0, "print_statistics() needs at least one house"  # ← new
    prices = []
    for house in houses:
        prices.append(house["price"])

    count = len(prices)
    average_price = sum(prices) / count
    lowest_price = min(prices)
    highest_price = max(prices)

    print("Houses loaded:", count)
    print("Average price:", average_price)
    print("Lowest price:", lowest_price)
    print("Highest price:", highest_price)
```

`print_statistics` now refuses to even attempt its own calculations
against an empty list, failing immediately and specifically instead of
failing several lines later with a division-by-zero error that would
say nothing about *why* the list was empty in the first place.

### Mechanical Walkthrough

- `assert len(houses) > 0, "print_statistics() needs at least one house"`
  — reappearing (this lesson's own lab), the exact same shape: a
  condition that should always be true, followed by the message shown
  if it isn't.

### CS Lens

This is a **precondition** — a statement of what a function requires to
be true about its own inputs *before* it does any real work, checked
explicitly rather than assumed. Also recognized in: a REST API
validating a request body before touching a database, a compiler's own
type checker rejecting a program before it ever runs, and design-by-
contract as a formal discipline in languages like Eiffel, where
preconditions are a first-class part of a function's own declared
signature, not just a convention.

### SE Lens

**`try`/`except` and `assert` both involve something going wrong — why
does this project use `except FileNotFoundError` for one and `assert`
for the other, instead of just one mechanism for both?** They answer
two genuinely different questions. `except FileNotFoundError` handles
a failure that is *expected to sometimes happen*, caused by something
outside this program's own control — the file system, the user, the
network — and the code has a real, deliberate answer for what to do
about it (report the problem, return an empty list). `assert` states
something that should be **impossible** if every function upstream of
it did its own job correctly — `print_statistics` receiving an empty
list should never happen in normal operation, since `load_houses`
either returns real data or has already handled the failure case
itself. An `assert` failing means *this program has a bug somewhere*,
not that the outside world misbehaved; using `try`/`except` for that
case would silently paper over a real defect instead of surfacing it
loudly, right at the point where the broken assumption was first
detected rather than wherever it eventually causes a confusing crash.

---

## Connect the Pieces

Full trace through the whole lesson: `house_stats.py` opens
`houses.csv` inside a `with` block — guaranteed to close even if
anything inside it fails — wraps that in `try`/`except FileNotFoundError`
so a missing file is reported and handled instead of crashing the
program, and uses `csv.DictReader` to turn each row into a dictionary
keyed by column name rather than position. `load_houses` converts every
numeric field from the string `DictReader` hands back into a real
`int`, then returns the completed list — a job entirely separate from,
and unaware of, what `print_statistics` does with that list once it's
handed over. `print_statistics` asserts its own precondition (at least
one house) before doing any real work, then computes and prints the
count, average, minimum, and maximum price using `sum`/`len`/`min`/`max`
against a flat list of just the prices. Every piece — `import`, `with`,
`csv`, two functions instead of one script, `try`/`except`, and
`assert` — exists because the project genuinely needed it at the exact
point it was introduced, not because a syllabus scheduled it.

## What Breaks Without This

In `house_stats.py`, temporarily change the very last line from
`houses = load_houses("houses.csv")` to
`houses = load_houses("nope.csv")` — a file that doesn't exist — while
leaving everything else, including the `assert` in `print_statistics`,
untouched. Run it. Real, representative output, this session:

```
Could not find a file at: nope.csv
Traceback (most recent call last):
  File "house_stats.py", line 31, in <module>
    print_statistics(houses)
  File "house_stats.py", line 23, in print_statistics
    assert len(houses) > 0, "print_statistics() needs at least one house"
AssertionError: print_statistics() needs at least one house
```

Two real, different things happened, in order: `load_houses` caught
its own expected failure (the missing file) and printed a clear
message about it, then returned an empty list exactly as designed —
followed by `print_statistics`'s own `assert` catching what should
never happen if every upstream function did its job, which this one
did. Restore the filename to `"houses.csv"` afterward.

## Exercises

1. Temporarily remove just the `except FileNotFoundError:` block
   (leave the `try:` and the code inside it), then run
   `load_houses("nope.csv")` again. Read the real traceback that comes
   back and confirm it's the exact same `FileNotFoundError` shown
   earlier in this lesson — restore the `except` block afterward.
2. Add a second precondition to `load_houses` itself: `assert
   filepath.endswith(".csv"), "load_houses() only accepts .csv files"`,
   placed as the very first line inside the function. Call
   `load_houses("houses.txt")` (a file that doesn't need to actually
   exist for this test) and confirm the `AssertionError` fires before
   Python ever attempts to open the file at all.
3. Add a fourth statistic to `print_statistics`: the average number of
   bedrooms across all houses, using the exact same
   build-a-flat-list-then-`sum`/`len` pattern already used for price.

## Definition of Done

- [ ] You ran every throwaway lab in this lesson yourself — the
      `import` demo, both `with`-vs-manual-close demos, both `csv.reader`
      and `csv.DictReader` demos, both exception demos, and the `assert`
      demo — and saw real output, not just read about it.
- [ ] `house_stats.py` exists, loads `houses.csv`, and prints the
      count, average, minimum, and maximum price.
- [ ] You triggered the real `FileNotFoundError` and `ValueError`
      tracebacks shown in this lesson yourself, and can read a
      traceback's file name, line number, and exception type without
      help.
- [ ] You triggered the `AssertionError` from an empty house list on
      purpose (via a missing file) and can explain, in your own words,
      why this project uses `assert` for that case instead of another
      `try`/`except`.
- [ ] You can explain why `load_houses` and `print_statistics` are two
      functions instead of one.

Lesson 2 is next: the single number "average price" already computed
here isn't enough — real questions ("houses over $500,000," "average
price per city") need filtering and grouping, which is exactly where
list comprehensions, `sorted(key=...)`, and `lambda` earn their place.
