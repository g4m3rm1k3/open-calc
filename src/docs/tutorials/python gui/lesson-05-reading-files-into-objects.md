# Lesson 5: Reading Files Into Objects

**What you will build:** a real function, `parse_invoices(path)`, that
reads an actual text file off disk and returns real `InvoiceData`
objects — tested and proven correct with zero CustomTkinter import
anywhere near it — and then a "Load file..." button wiring that
function into the `App` class from Lesson 4, replacing the two
hard-coded invoices it's carried since Lesson 4 with whatever a real
file actually contains. The transferable problem this lesson is
actually about is the one you described at the very start: parsing and
GUI code, in your own app, currently happen in the same place, which
means you can't test or even read your parsing logic without a running
window attached to it. This lesson draws that specific line, on
purpose, and then proves — not just asserts — that the line held, by
running the parser completely on its own before it ever touches `App`.

**What you need to know first:** Lesson 1 (the window, event loop,
`.pack()`), Lesson 2 (callbacks, `command=`, `.configure()`), Lesson 3
(subclassing `ctk.CTk`, `self`, bound methods, `@dataclass` models), and
Lesson 4 (`_build_widgets`, `_refresh_display`, `ctk.CTkOptionMenu`, and
`self.invoices` as a dict of `InvoiceData`). This lesson replaces
Lesson 4's hard-coded two-invoice dict with one built from a real file.

**Terms used in this lesson**

- **context manager (the `with` statement)** — a language construct
  that guarantees a piece of setup and its matching cleanup both
  happen, even if something goes wrong in between — `with open(path) as f:`
  guarantees the file gets closed when the block ends, whether it ends
  normally or because an exception was raised partway through. This
  exists because forgetting to close a file is a real, common bug: a
  program can run out of available file handles, or, on some systems,
  lose data that was written but never flushed to disk, if a file is
  opened and never explicitly closed — the `with` statement makes
  "forgetting" structurally impossible rather than relying on the
  programmer to remember a matching `.close()` call on every code path,
  including error paths.
- **text mode and string typing** — every value read from a plain text
  file arrives as a `str`, regardless of what the text *looks like* —
  `"401.50"` read from a file is the three-character-longer string
  `'401.50'`, not the number 401.5, until something explicitly converts
  it. This exists because a text file has no concept of Python's own
  types at all; it's just bytes, decoded into characters — the
  boundary between "text that came from outside the program" and "data
  your program can actually compute with" is one your own code always
  has to cross deliberately.
- **pure function** — a function whose entire result depends only on
  the arguments you give it, with no dependency on, or effect on,
  anything outside itself (no reading from or writing to global state,
  no touching a GUI, no hidden dependency on what else has already run).
  This exists as a named, valuable property because a pure function can
  be tested, read, and reasoned about in complete isolation — call it
  with the same input, get the same output, every time, regardless of
  whether a window happens to be open anywhere in the same program.

**Objects and methods used**

- **`open`**
  - *What it is:* Python's built-in function for opening a file,
    returning a file object you can read from (or write to, with a
    different mode).
  - *Implementation:* a built-in, implemented in C, not in Python
    itself — its documented behavior (confirmed via Python's own
    official documentation, the fastest way to check a built-in's
    contract, per this curriculum's own standing convention) is that,
    called with just a path, it opens the file in read, text mode by
    default, decoding its raw bytes into `str` using the platform's
    default text encoding, and returns an iterable file object.
  - *Its use:* this lesson's code calls it as `open(path)`, always
    through a `with` statement — never on its own — supplying only the
    path and relying on every other option's default (read mode, text
    mode).
  - *Type:* a built-in function; calling it returns a real file object,
    specifically a `TextIOWrapper` in CPython, though this lesson's
    code never needs to name that type directly.
  - *Responsibility:* to ask the operating system for access to a real
    file on disk and hand back a Python object that can read its
    contents, piece by piece, without loading unrelated files or
    touching anything else on the filesystem.
  - *Depends on:* a real path to a file that actually exists and is
    readable — this lesson's code doesn't yet handle the case where it
    doesn't (see this unit's own SE Lens for that honest gap).
  - *Connects to:* it's always called as the target of a `with`
    statement (Terms, above) in this lesson's code, which is what
    guarantees the returned file object's own `.close()` gets called
    automatically.
  - *Shape:* the actual boundary between "a file sitting on a disk
    somewhere" and "something Python code can iterate over" — every
    other concept in this lesson's first unit exists downstream of this
    one call.

- **`filedialog.askopenfilename`**
  - *What it is:* a function that pops open the operating system's own,
    real "choose a file" window and pauses until the user picks a file
    or cancels.
  - *Implementation:* part of Python's own standard library, in
    `tkinter.filedialog` — Tkinter's own file-picker module, which
    CustomTkinter does not replace or restyle; you use it exactly as a
    plain Tkinter program would. Its real, complete body, read from the
    installed Python 3.12 standard library this session, is two lines:
    `def askopenfilename(**options): "Ask for a filename to open"; return Open(**options).show()`
    — nearly all of the real work happens inside `Open(...).show()`,
    a class that actually drives the native dialog; `askopenfilename`
    itself is a thin, convenience wrapper around it.
  - *Its use:* this lesson's code calls
    `filedialog.askopenfilename(title="Choose an invoices file")` —
    supplying only the dialog's window title, a keyword argument,
    and accepting every other option's default.
  - *Type:* a free function (not a method on any widget) imported
    directly from `tkinter.filedialog`.
  - *Responsibility:* to show a real, native file-picker window,
    block — pausing whatever code called it — until the user makes a
    choice, and return the chosen file's path as a string, or an empty
    string if the user cancels without picking anything.
  - *Depends on:* a running Tk application already existing — it's a
    Tkinter function, and needs the same underlying Tcl/Tk runtime
    every widget in this curriculum has depended on since Lesson 1.
  - *Connects to:* called from inside this lesson's own
    `_on_load_click` method; its return value — a path, or an empty
    string — is what `parse_invoices` (this lesson's own subject) is
    then called with.
  - *Shape:* the point where a real human, not just this lesson's own
    code, gets to choose which file becomes the program's data — every
    other widget so far has offered a fixed, code-defined set of
    choices; this is the first one that hands control to the
    filesystem itself.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`ctk.CTk`, `super().__init__()`, `self`, bound methods,
  `ctk.CTkLabel`, `ctk.CTkButton`, `ctk.CTkOptionMenu`, `.pack()`,
  `.configure()`, `@dataclass`, `_build_widgets`, `_refresh_display`**
  - *What they are:* every mechanism Lessons 1 through 4 already
    covered in full.
  - *Its use here:* all unchanged; this lesson adds one new button
    (`self.load_button`, built exactly the way `self.button` and
    `self.menu` were in earlier lessons) and one new method,
    `_on_load_click`, following the same bound-method-as-callback
    pattern Lesson 3 already established in full.
  - See Lessons 1 through 4 for complete CRC treatment of each.

---

## Concept Unit: Reading a File's Lines — `with open(...) as f:`

### The Problem

Your app's parsed data has always come from somewhere real — an actual
file on disk. Every lesson in this curriculum so far has used
hard-coded, made-up invoice data instead, specifically so the GUI
concepts could be taught without a second, unrelated concept (file
reading) tangled in at the same time. That's no longer true starting
here: this unit is the first time this curriculum's own code touches a
real file.

> **Stop and think before reading on:** you already know that opening
> something — a door, a valve, a network connection — usually implies
> you're also responsible for closing it again afterward, and that
> forgetting to is a real problem, not just untidiness. Python's
> `open()` function returns a file object; what do you think happens if
> your code never explicitly closes it? Would you expect Python to warn
> you, silently handle it for you, or just leave the file open
> indefinitely? Given that a *lot* of real code needs to open a file,
> read from it, and then close it — always in that order, every time —
> do you think Python's own syntax might have a dedicated way to
> express exactly that pattern, once, instead of writing "open, then
> definitely close, even if something goes wrong in between" by hand
> every time?

### The New Code

```python
with open(path) as f:
    for line in f:
        print(repr(line))
```

### The Updated Project

**Reference Source:** none — from-scratch continuation of this
curriculum's own example. **Files affected:** a new file this unit
introduces to the curriculum's own working directory,
`sample_invoices.txt`, plus the ongoing Python file this curriculum has
built since Lesson 1. **Change type:** add — this is the first unit of
this lesson; the actual `parse_invoices` function it's building toward
doesn't exist in the real project file until Concept Unit 3, below.
**Location:** N/A yet — this unit's own code is throwaway, proving the
mechanism in isolation before Concept Unit 2 starts assembling the real
function. **Dependencies:** a real text file to read, described next.

This lesson's own example data file, `sample_invoices.txt`, created
once, alongside the code, holds two lines:

```
Acme Corp,401.50
Globex Inc,1287.00
```

One invoice per line; a customer name, a comma, and a total — the
smallest real file format that still has more than one field to
extract per line, which the next unit's own parsing needs.

### Isolating It

```python
with open("sample_invoices.txt") as f:
    for line in f:
        print(repr(line))

print("f.closed after the `with` block ends:", f.closed)
```

Real output, from an actual run this session:

```
'Acme Corp,401.50\n'
'Globex Inc,1287.00\n'
```
```
f.closed after the `with` block ends: True
```

This is called a **context manager**, named in full in the Header's
Terms, above — this specific use of it, opening and automatically
closing a file, is Python's own single most common example of the
pattern. What this output proves: `repr(line)` — which shows a string's
*exact* contents, including characters that would otherwise be
invisible — reveals that each line read from the file still has its
trailing `\n` (newline) character attached; `open()` and file iteration
don't strip it for you, which the next unit's own code has to handle
explicitly. And `f.closed`, checked *after* the `with` block has
already ended, is `True` — even though nothing in this lesson's own
code ever wrote `f.close()` anywhere — proof the `with` statement
handled it automatically, exactly when the indented block finished.

A second, contrasting lab makes the actual risk concrete instead of
assumed, by deliberately not using `with`:

```python
f = open("sample_invoices.txt")
lines = f.readlines()
print("read lines without `with`:", lines)
print("f.closed immediately after reading:", f.closed)
```

Real output, from an actual run this session:

```
read lines without `with`: ['Acme Corp,401.50\n', 'Globex Inc,1287.00\n']
f.closed immediately after reading: False
```

The reading itself still works — that's exactly what makes this pattern
easy to fall into without noticing anything wrong, the same shape of
problem Lesson 3's own God-object unit demonstrated for `self`. But
`f.closed` here is `False`, and nothing in this version of the code
ever changes that; in a longer-running real program — especially one
opening many files over its lifetime, or one where an exception might
be raised between opening a file and getting around to closing it —
this is exactly the class of bug the `with` statement exists to make
structurally impossible instead of merely discouraged.

This throwaway example is now discarded — printing each raw line, and
the deliberately-`with`-free contrast, both stay out of the real
project. What stays, conceptually, is the commitment to always opening
files this lesson's parser touches through a `with` statement — shown
for real in Concept Unit 3, below.

### Mechanical Walkthrough

1. `with open(path) as f:` — the `with` statement (this unit's own
   Terms) wraps a call to `open`, fully covered in the Header's Objects
   and methods section, above; `as f` binds the returned file object to
   the local name `f` for the duration of the indented block beneath
   it.
2. `for line in f:` — a `for` loop, already-assumed general Python per
   this curriculum's own prerequisite, iterating directly over the file
   object itself; a Python file object is iterable, yielding one line
   at a time, including each line's own trailing newline character, as
   this unit's own lab output proved.
3. `print(repr(line))` — `repr`, a built-in already assumed as ordinary
   Python, used here specifically because it reveals a string's exact
   contents, including otherwise-invisible characters like `\n`, unlike
   plain `print(line)`, which would render the newline as an actual
   line break instead of showing it explicitly.

### CS Lens

The context manager is a specific instance of a broader idea:
**deterministic resource cleanup** — guaranteeing that a resource
(here, a file handle; elsewhere, a network connection, a database
transaction, or a lock) is released exactly once, exactly when it's no
longer needed, regardless of how the code using it exits — normally, or
via an error.

```
Also recognized in: C++'s RAII (Resource Acquisition Is Initialization)
pattern, a database library's `with connection.begin():` transaction
block, a `try`/`finally` block written out by hand in any language
without dedicated syntax for this, a lock guard in multi-threaded code,
a using statement in C#
```

### SE Lens

The tradeoff here is **implicit-but-guaranteed cleanup** (the `with`
statement) versus **explicit-but-fallible cleanup** (calling
`.close()` yourself, by hand, at the end of the code). The
explicit-cleanup alternative is not actually simpler in practice — it
requires correctly handling every possible early exit from the code
between `open()` and `.close()`, including exceptions, which usually
means also writing a `try`/`finally` block, at which point the `with`
statement is doing the identical job with less code and no way to get
it wrong. The real cost of relying on `with`, worth naming honestly: it
only closes what you actually opened inside it — Concept Unit 3's real
`parse_invoices` function, below, still has to get the *placement* of
that `with` block right, so that the entire read happens inside it, not
partially outside it.

### Commands Needed

None new — plain Python, no installation required.

### Run It

Both real runs shown above, under Isolating It, plus the file itself,
`sample_invoices.txt`, actually created this session and read from for
real, not simulated.

### Connecting to What Came Before

Every previous lesson's data was invented directly in the code; this
unit is the first time this curriculum's own example reads something
real off disk — the next unit is what turns each of these raw,
newline-terminated strings into an actual `InvoiceData` object.

---

## Concept Unit: Turning One Line Into a Model Object

### The Problem

The previous unit proved you can read a file's lines, each one still a
raw string like `'Acme Corp,401.50\n'`. `InvoiceData`, from Lesson 3,
wants a `customer_name` (a string, which is fine as-is) and an
`invoice_total` — but per this unit's own Terms, above, on a *typed*
`float` field — and everything read from a text file arrives as a
plain `str`, with no exceptions.

> **Stop and think before reading on:** if you have the string
> `"Acme Corp,401.50"` and you want to split it into two separate
> pieces at the comma, do you already know a string method, from
> general Python, that does exactly that? And once you have the second
> piece as its own string, `"401.50"` — do you know of a built-in way
> to turn a string that *looks like* a number into an actual number
> Python can do arithmetic with?

### The New Code

```python
customer_name, total_text = line.strip().split(",")
invoice = InvoiceData(customer_name=customer_name, invoice_total=float(total_text))
```

### The Updated Project

**Reference Source:** none. **Files affected:** same ongoing file.
**Change type:** N/A — like the previous unit, this unit's own code is
still throwaway, proving the line-to-object conversion in isolation
before it's assembled into the real function in Concept Unit 3.
**Location / Dependencies:** N/A for the same reason.

### Isolating It

```python
from dataclasses import dataclass

@dataclass
class InvoiceData:
    customer_name: str
    invoice_total: float

line = "Acme Corp,401.50\n"
print("raw line:", repr(line))

cleaned = line.strip()
print("after .strip():", repr(cleaned))

customer_name, total_text = cleaned.split(",")
print("customer_name:", repr(customer_name), "total_text:", repr(total_text), "type(total_text):", type(total_text))

invoice = InvoiceData(customer_name=customer_name, invoice_total=float(total_text))
print("invoice:", invoice)
print("type(invoice.invoice_total):", type(invoice.invoice_total))
```

Real output, from an actual run this session:

```
raw line: 'Acme Corp,401.50\n'
after .strip(): 'Acme Corp,401.50'
customer_name: 'Acme Corp' total_text: '401.50' type(total_text): <class 'str'>
invoice: InvoiceData(customer_name='Acme Corp', invoice_total=401.5)
type(invoice.invoice_total): <class 'float'>
```

This is called crossing the **text-mode/string-typing boundary**, named
in full in the Header's Terms, above. What this output proves, step by
step: `.strip()` removes the trailing `\n` the previous unit's own
output showed was still attached — `repr(cleaned)` confirms it's gone.
`.split(",")` — a string method, already assumed as ordinary Python —
divides the cleaned line into exactly two pieces at the comma,
unpacked directly into `customer_name` and `total_text` by position.
Critically, `type(total_text)` is printed *before* any conversion
happens, and it reports `str` — proving, concretely, that
`"401.50"` really is still just a string, three extra characters and
all, with nothing about it being "secretly" numeric. Only
`float(total_text)`, a built-in type-conversion function
(already-assumed general Python), actually produces a real number — and
`type(invoice.invoice_total)`, checked on the finished object, confirms
it's a genuine `float`, matching `InvoiceData`'s own declared field
type from Lesson 3.

This throwaway example is now discarded — the standalone `line`
variable and its step-by-step prints never appear in the real project.
What stays, conceptually, is exactly this two-step sequence — split,
then convert — assembled into a real loop in the next unit.

### Mechanical Walkthrough

1. `line.strip()` — a string method call (already-assumed general
   Python) removing leading and trailing whitespace, including the
   trailing `\n` this unit's own lab specifically proved was still
   present after reading.
2. `.split(",")` — chained directly onto the result of `.strip()`
   (both calls happening on one line, evaluated left to right); splits
   the cleaned string into a list of pieces wherever a comma appears —
   already-assumed general Python, called out here specifically because
   it's the actual parsing decision this file format depends on: one
   comma, two fields, no more.
3. `customer_name, total_text = ...` — tuple unpacking (already-assumed
   general Python), assigning the two-item result of `.split(",")` to
   two names at once, by position.
4. `InvoiceData(customer_name=customer_name, invoice_total=float(total_text))`
   — the same `@dataclass`-generated constructor fully covered in
   Lesson 3's Header, called here with two **keyword arguments**
   (Lesson 1's Terms): `customer_name` passed through unchanged (it was
   already the right type), and `invoice_total` passed through
   `float(...)` first — the actual moment this unit's whole point
   happens, converting a piece of text into a real number.

### CS Lens

Converting external, untyped text into your program's own internal,
typed data structures is the general idea of **parsing** — more
specifically here, **deserialization**: taking data in some external,
serialized form (plain text, in this case) and reconstructing it into
your program's own real objects.

```
Also recognized in: `json.loads()` turning a JSON string into a Python
dict, a web form's submitted text fields being converted into a
database record's typed columns, a compiler's own lexer and parser
turning source code text into a structured syntax tree, a spreadsheet
program interpreting the text you type into a cell as a number, a date,
or a formula
```

### SE Lens

The design tradeoff worth naming honestly here is what this unit's code
does *not* yet handle: `float(total_text)` will raise a real
`ValueError` if a line's second field isn't actually a valid number —
a stray typo, an extra comma, a blank line with no comma at all. This
lesson's own parser, in the next unit, does the minimum needed to skip
genuinely blank lines and nothing more; it does not yet validate that
every remaining line is well-formed, or give a helpful error message
naming which line was bad. That's a deliberate, honest scope limit,
not an oversight — real, production-grade parsing of imperfect,
human-edited files (exactly the kind your own real app almost
certainly reads) is a substantial topic in its own right, worth its
own future lesson rather than folded in here as an afterthought.

### Commands Needed

None new.

### Run It

Real output, from an actual run this session, already shown in full
above under Isolating It.

### Connecting to What Came Before

The previous unit proved a file's lines can be read, each one still raw
text; this unit proved a single one of those lines can become a real,
correctly-typed `InvoiceData` object — the next unit is only a loop
away from having both of these units working together, for a whole
file, as one real function.

---

## Concept Unit: A Pure Parsing Function — `parse_invoices`

### The Problem

The two units above each proved half of what's needed, in isolation,
using code that was explicitly thrown away afterward. It's time to
assemble both halves into one real function this curriculum's own
project actually keeps — and, per this lesson's whole point, to prove
that function works with zero CustomTkinter involvement at all before
it ever gets near `App`.

> **Stop and think before reading on:** if you combined the previous
> two units — reading every line of a file, and turning one line into
> an `InvoiceData` — into a single function that takes a file path and
> gives back every invoice in that file, what would you want that
> function's return value to actually be? Given Lesson 4's `App`
> already expects `self.invoices` to be a dict, keyed by customer name
> — would it make sense for this new function to hand back that exact
> shape directly, ready to drop straight into `self.invoices`, or
> would you want it to return something more generic that `App` would
> then have to convert?

### The New Code

```python
def parse_invoices(path):
    invoices = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            customer_name, total_text = line.split(",")
            invoices[customer_name] = InvoiceData(
                customer_name=customer_name,
                invoice_total=float(total_text),
            )
    return invoices
```

### The Updated Project

**Reference Source:** none. **Files affected:** the same ongoing
Python file, plus `sample_invoices.txt`, already created in this
lesson's first unit. **Change type:** add — this is the first genuinely
new, permanent function this lesson contributes to the real project.
**Location:** defined at module level, above `class App`, directly
below `InvoiceData`'s own definition — the same relative position
`InvoiceData` itself has held since Lesson 3, since `App` will depend
on both. **Dependencies:** `InvoiceData` must already be defined above
it.

```python
 1  from dataclasses import dataclass
 2
 3
 4  @dataclass
 5  class InvoiceData:
 6      customer_name: str
 7      invoice_total: float
 8
 9
10  def parse_invoices(path):
11      invoices = {}
12      with open(path) as f:
13          for line in f:
14              line = line.strip()
15              if not line:
16                  continue
17              customer_name, total_text = line.split(",")
18              invoices[customer_name] = InvoiceData(
19                  customer_name=customer_name,
20                  invoice_total=float(total_text),
21              )
22      return invoices
```

Notice what's *not* here: no `import customtkinter`, nowhere in this
function or above it. That absence is not an accident of this
particular example — it's the entire point of this lesson, made
checkable rather than just claimed.

### Isolating It

```python
def parse_invoices(path):
    invoices = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            customer_name, total_text = line.split(",")
            invoices[customer_name] = InvoiceData(
                customer_name=customer_name,
                invoice_total=float(total_text),
            )
    return invoices


result = parse_invoices("sample_invoices.txt")
print("type(result):", type(result))
print("result:", result)
for name, invoice in result.items():
    print(f"  {name!r} -> {invoice}")

import sys
print("'customtkinter' in sys.modules:", "customtkinter" in sys.modules)
```

Real output, from an actual run this session:

```
type(result): <class 'dict'>
result: {'Acme Corp': InvoiceData(customer_name='Acme Corp', invoice_total=401.5), 'Globex Inc': InvoiceData(customer_name='Globex Inc', invoice_total=1287.0)}
  'Acme Corp' -> InvoiceData(customer_name='Acme Corp', invoice_total=401.5)
  'Globex Inc' -> InvoiceData(customer_name='Globex Inc', invoice_total=1287.0)
'customtkinter' in sys.modules: False
```

This is called a **pure function**, named in full in the Header's
Terms, above. What this output proves: calling `parse_invoices` with a
real file path returns a real `dict`, keyed by customer name, holding
real `InvoiceData` instances — exactly the shape `App.__init__` has
built by hand since Lesson 4, now built by reading an actual file
instead. The final line is the real, checkable proof of this lesson's
own central claim: `sys.modules` is Python's own record of every module
that has actually been imported into the running program so far; it
reports `False` for `'customtkinter' in sys.modules` — meaning nothing
about running this exact function, right up to and including this
check, ever caused CustomTkinter to load at all. This isn't a claim
about how the code is *organized* — it's a real, runtime fact about
what did and didn't happen.

This throwaway example is now discarded in the sense that the
`sys.modules` check and the manual print loop are lab-only — but,
exactly as Lesson 4's own final unit noted about its own core fix, the
function itself, `parse_invoices`, is not discarded: it's already
identical to what The New Code and Updated Project, above, show as the
real, kept addition to the project.

### Mechanical Walkthrough

1. `def parse_invoices(path):` — a function definition (already-assumed
   general Python) taking one parameter, `path` — a plain function, not
   a method; it takes no `self` and belongs to no class, which is
   itself part of this unit's own point: nothing about it depends on
   any particular `App` instance existing.
2. `invoices = {}` — an empty dict, already-assumed general Python,
   built up one entry at a time as the function reads through the
   file.
3. `with open(path) as f:` — the context manager fully covered in this
   lesson's first unit, guaranteeing the file gets closed once parsing
   finishes, however it finishes.
4. `for line in f:` — file iteration, also covered in this lesson's
   first unit, yielding one raw line at a time, newline included.
5. `line = line.strip()` — reassigns the loop variable to its own
   stripped version; the same `.strip()` method covered in this
   lesson's second unit, now applied inside a real loop instead of to
   one isolated example line.
6. `if not line: continue` — a genuinely new piece of this function,
   not present in either earlier unit's own throwaway lab: an empty
   string is falsy in Python (already-assumed general Python), so this
   skips any blank line entirely — `continue` immediately moves on to
   the next iteration of the loop without running any of the lines
   below it. This handles a real, if narrow, edge case: a trailing
   blank line at the end of a file (common when a file is edited by
   hand) would otherwise crash the very next line trying to `.split(",")`
   an empty string.
7. `customer_name, total_text = line.split(",")` — the same splitting
   and unpacking covered in this lesson's second unit.
8. `invoices[customer_name] = InvoiceData(customer_name=customer_name, invoice_total=float(total_text))`
   — a dict assignment by key (already-assumed general Python),
   storing the newly-built `InvoiceData` — constructed exactly as this
   lesson's second unit already covered in full — under its own
   customer name, growing the `invoices` dict by one entry per
   non-blank line.
9. `return invoices` — returns the completed dict once every line has
   been processed, outside the `with` block (note the indentation:
   this line is not indented under `with open(path) as f:`), meaning
   the file has already been closed by the time this function hands
   its result back to whatever called it.

### CS Lens

Building up a collection one item at a time, across a loop, from an
external, sequential source, is the general shape of a **loader** or
**batch import** routine.

```
Also recognized in: a database bulk-import tool reading rows from a
CSV file, a web crawler building an index one page at a time, a build
tool reading a project's dependency list file and constructing objects
for each package, a log analyzer reading a log file line by line and
building a summary structure as it goes
```

### SE Lens

This is the actual payoff of the pure-function principle, stated
concretely: because `parse_invoices` never touches `self`, never
imports `customtkinter`, and never depends on any particular `App`
instance existing, it can be tested, debugged, and trusted completely
on its own — exactly as this unit's own lab just did — before it's ever
wired into a single line of GUI code. The alternative this curriculum
is deliberately not taking — writing this same parsing logic directly
inside a method on `App`, reading `self.something` for the path and
setting `self.invoices` directly at the end — would work today, in this
small example, exactly as well. Its real cost only shows up the moment
something needs to test the parsing logic on its own (a real,
significant category of bug — a malformed file — could then only ever
be reproduced by launching the entire GUI and clicking through it), or
the moment the same parsing logic needs to be reused somewhere that
isn't `App` at all (a command-line tool that processes the same files
without ever opening a window, for instance). Keeping it a pure
function, from the very first line, is what keeps both of those doors
open for free.

### Commands Needed

None new.

### Run It

Real output, from an actual run this session, already shown in full
above under Isolating It.

### Connecting to What Came Before

The previous two units each proved one half of this function's own
logic in isolation; this unit is where both halves actually became one
real, permanent, independently-tested piece of the project — the next
unit is the only place in this entire lesson where CustomTkinter
finally gets involved at all.

---

## Concept Unit: Wiring It to a Real File — `filedialog.askopenfilename`

### The Problem

`parse_invoices` is real, tested, and correct, entirely on its own. But
it's not yet reachable from the running app at all — `App` still has no
way to ask the user which file to load, or to actually call this
function with a real answer.

> **Stop and think before reading on:** `App` already has a
> `_on_select` method (Lesson 4) that's called by `CTkOptionMenu`
> whenever the user picks something from a fixed, code-defined list of
> choices. A file path is different — it's not a fixed list at all;
> it depends entirely on what files actually exist on the user's own
> computer, which your code can't know in advance. What kind of
> interaction would let a user pick from something your code
> genuinely doesn't have a predetermined list for?

### The New Code

```python
self.load_button = ctk.CTkButton(self, text="Load file...", command=self._on_load_click)
self.load_button.pack(pady=10)
```

```python
def _on_load_click(self):
    path = filedialog.askopenfilename(title="Choose an invoices file")
    if not path:
        return
    self.invoices = parse_invoices(path)
    self.selected_name = next(iter(self.invoices), None)
    self.menu.configure(values=list(self.invoices.keys()))
    if self.selected_name:
        self.menu.set(self.selected_name)
    self._refresh_display()
```

### The Updated Project

**Reference Source:** none. **Files affected:** the same ongoing
Python file — one new top-level import, one new button in
`_build_widgets`, one new method, and `__init__` now starts with no
invoices at all instead of Lesson 4's hard-coded two. **Change type:**
add (the button and the new method) plus replace (`__init__`'s own
starting data). **Location:** the import goes at the top of the file,
alongside `from dataclasses import dataclass`; the button goes inside
`_build_widgets`, after the option menu; `_on_load_click` goes as a new
method on `App`, alongside `_on_select`. **Dependencies:**
`parse_invoices`, defined earlier in this same lesson.

```python
 1  import customtkinter as ctk
 2  from dataclasses import dataclass
 3  from tkinter import filedialog
 4
 5
 6  @dataclass
 7  class InvoiceData:
 8      customer_name: str
 9      invoice_total: float
10
11
12  def parse_invoices(path):
13      invoices = {}
14      with open(path) as f:
15          for line in f:
16              line = line.strip()
17              if not line:
18                  continue
19              customer_name, total_text = line.split(",")
20              invoices[customer_name] = InvoiceData(
21                  customer_name=customer_name,
22                  invoice_total=float(total_text),
23              )
24      return invoices
25
26
27  class App(ctk.CTk):
28      def __init__(self):
29          super().__init__()
30
31          self.invoices = {}
32          self.selected_name = None
33
34          self._build_widgets()
35          self._refresh_display()
36
37      def _build_widgets(self):
38          self.label = ctk.CTkLabel(self, text="No file loaded yet")
39          self.label.pack(pady=20)
40
41          self.menu = ctk.CTkOptionMenu(self, values=[""], command=self._on_select)
42          self.menu.pack(pady=10)
43
44          self.load_button = ctk.CTkButton(self, text="Load file...", command=self._on_load_click)
45          self.load_button.pack(pady=10)
46
47      def _on_load_click(self):
48          path = filedialog.askopenfilename(title="Choose an invoices file")
49          if not path:
50              return
51          self.invoices = parse_invoices(path)
52          self.selected_name = next(iter(self.invoices), None)
53          self.menu.configure(values=list(self.invoices.keys()))
54          if self.selected_name:
55              self.menu.set(self.selected_name)
56          self._refresh_display()
57
58      def _on_select(self, chosen_name):
59          self.selected_name = chosen_name
60          self._refresh_display()
61
62      def _refresh_display(self):
63          if self.selected_name is None:
64              self.label.configure(text="No file loaded yet")
65              return
66          model = self.invoices[self.selected_name]
67          self.label.configure(text=f"{model.customer_name}: ${model.invoice_total:.2f}")
```

This is the complete file this lesson builds toward. Notice line 62's
own change from Lesson 4: `_refresh_display` now has a real
`if self.selected_name is None:` guard at its top — needed for the
first time because, unlike Lesson 4's version, `App` can now genuinely
start with zero invoices loaded at all, before the user has clicked
"Load file..." even once.

### Isolating It

Real interactive use of `askopenfilename` requires an actual human
clicking an actual file in a real OS window — not something a lesson's
own automated verification can script directly. This unit's lab
instead proves the *real* code — everything in `_on_load_click` after
the dialog call — with the one genuinely un-automatable step, the
dialog itself, temporarily stood in for:

```python
# The real askopenfilename() call opens an interactive OS dialog and
# blocks waiting for a human to click a file -- it cannot be scripted
# in an automated verification run. It is temporarily replaced here
# with a stand-in that returns a real path directly, so the rest of
# the real _on_load_click code (everything after the dialog call)
# still runs for real, against a real file, with real output.
filedialog.askopenfilename = lambda **kwargs: "sample_invoices.txt"

app._on_load_click()
print("self.invoices after real load:", app.invoices)
print("self.selected_name after real load:", app.selected_name)
```

Real output, from an actual run under a virtual display this session:

```
self.invoices after real load: {'Acme Corp': InvoiceData(customer_name='Acme Corp', invoice_total=401.5), 'Globex Inc': InvoiceData(customer_name='Globex Inc', invoice_total=1287.0)}
self.selected_name after real load: Acme Corp
```

A real screenshot, taken before this call, shows the label reading
"No file loaded yet" and an empty dropdown — the honest starting state
now that `App.__init__` no longer hard-codes any invoices. A second
real screenshot, taken immediately after, shows the label reading
"Acme Corp: $401.50" and the dropdown now showing "Acme Corp" as a real
option — proof the entire chain, from a file path to pixels on screen,
genuinely ran.

What this proves, and what it honestly doesn't: every line of
`_on_load_click` after the `askopenfilename` call ran for real, against
a real file on disk, through the real `parse_invoices` function proven
independently in the previous unit, into real widget updates. What's
stood in for is exactly one line — the interactive dialog itself —
because a human clicking a real file in a real OS window is not
something any automated lesson verification can honestly claim to have
run. This is a real, standard testing technique, not a shortcut unique
to this lesson: substituting a small, well-defined piece of a system
(here, "ask the user for a path") with a stand-in that returns a known
value, so everything *around* that piece can still be verified for
real.

This throwaway example is now discarded — the manual reassignment of
`filedialog.askopenfilename` exists only for this lab's own automated
verification and is never part of the real project. What stays in the
real project is only what's shown in The New Code and Updated Project,
above, with the real, interactive dialog call left completely intact.

### Mechanical Walkthrough

1. `ctk.CTkButton(self, text="Load file...", command=self._on_load_click)`
   — the same constructor fully covered in Lesson 2's Header, wired to
   a bound method (Lesson 3's Terms), exactly the pattern
   `self.button`'s own construction already established.
2. `filedialog.askopenfilename(title="Choose an invoices file")` —
   fully covered in the Header's Objects and methods section, above;
   `title=` is a **keyword argument** (Lesson 1's Terms) setting the
   real dialog window's own title bar text.
3. `if not path: return` — an empty string is falsy (already-assumed
   general Python); `askopenfilename`'s own real contract, per the
   Header, returns an empty string specifically when the user cancels
   the dialog without picking anything — this line is what makes
   cancelling safe, exiting the method immediately rather than trying
   to parse a path that doesn't exist.
4. `self.invoices = parse_invoices(path)` — calls this lesson's own
   pure function, fully covered above, and stores its real return value
   directly onto `self`, replacing whatever `self.invoices` held
   before — an attribute assignment (Lesson 3's Terms), the same
   mechanism used for every other piece of state on `self` so far.
5. `self.selected_name = next(iter(self.invoices), None)` — already-
   assumed general Python (`iter()` and `next()` together retrieve the
   first key of a dict, with `None` as a default if the dict is
   empty), picking some sensible invoice to show immediately after a
   load, rather than leaving the display pointed at a name that may no
   longer exist in the newly-loaded data.
6. `self.menu.configure(values=list(self.invoices.keys()))` — the same
   `.configure()` method fully covered in Lesson 2's Header, here
   called on the option menu rather than the label, updating its
   available choices to match whatever the newly-loaded file actually
   contained — proof `.configure()`'s own general job (Lesson 2:
   "accept any subset of a widget's settings, by keyword, and apply
   each one") applies to more than just a label's `text`.
7. `if self.selected_name: self.menu.set(self.selected_name)` —
   `.set()`, a real `CTkOptionMenu` method (not previously covered,
   used here only to keep the dropdown's own displayed choice in sync
   with `self.selected_name` after a fresh load) — visible directly in
   this unit's own before/after screenshots, where the dropdown itself,
   not just the label, changes.
8. `self._refresh_display()` — the same bound method call, fully
   covered in Lesson 4's own third unit, now doing its one job (render
   whichever invoice is currently selected) after a real file load
   instead of only after a dropdown selection.

### CS Lens

Standing in a real, well-defined piece of a system with a controlled
substitute, specifically so everything around it can still be tested
for real, is the general technique of using a **test double** (a
**stub**, specifically, since this unit's stand-in simply returns a
fixed value rather than recording or verifying how it was called).

```
Also recognized in: a payment processor's own "sandbox mode" standing
in for a real credit card charge during testing, a weather app's
automated tests using a canned forecast instead of a real network
call, a flight simulator standing in for a real aircraft during pilot
training, a car manufacturer crash-testing with a dummy instead of a
real passenger
```

### SE Lens

The design principle this unit's own testing approach depends on is the
same **separation of concerns** this whole lesson has been building
toward: because `_on_load_click` cleanly separates "ask for a path"
(one line, calling a real Tkinter function) from "do something with
that path" (everything after it, calling this lesson's own pure
`parse_invoices`), it's possible to substitute *just* the first part
for testing while leaving the second part completely real. If parsing
logic and dialog-showing logic were tangled together in one
undifferentiated block — the exact shape of problem this entire lesson
exists to move away from — there would be no clean seam to substitute
anything at, and proving this code works without a human physically
clicking a file, every single time, would be much harder. This is a
second, concrete payoff of the separation Concept Unit 3 established,
beyond the first one (testing the parser alone): it's also what makes
the *GUI wiring itself* independently testable, one layer up.

### Commands Needed

None new — `tkinter.filedialog` ships with Python itself, alongside
`tkinter`.

### Run It

Real output, from an actual run of the complete file shown in this
unit's Updated Project, under a virtual display this session, already
shown in full above under Isolating It, with real before/after
screenshots proving the visible result.

### Connecting to What Came Before

The previous unit proved `parse_invoices` works correctly, entirely on
its own; this unit is the only place, in this entire lesson, where that
proven function actually meets a real button, a real dialog, and the
real `App` class — and it does so through exactly one new method,
`_on_load_click`, whose own first line is the only part of this whole
chain that isn't, and can't be, covered by this lesson's own automated
verification.

---

## Connect the Pieces

Follow one single real file, `sample_invoices.txt`, through every unit
this lesson built, start to finish:

Before any of this lesson's own code runs, it's just two lines of plain
text sitting on disk — nothing about it is Python yet. Concept Unit 1's
`with open(path) as f:` is the first contact: it becomes a real,
iterable file object, and this unit's own lab proved, concretely, that
each line arrives with its trailing newline still attached, and that
the file itself closes automatically the moment the `with` block ends,
whether or not anything goes wrong inside it. Concept Unit 2 took
exactly one of those raw lines and proved, string method by string
method, exactly how `'Acme Corp,401.50\n'` becomes a real, typed
`InvoiceData(customer_name='Acme Corp', invoice_total=401.5)` — with a
real, printed `type(total_text)` proving the number stayed a plain
string, `'401.50'`, right up until `float()` was explicitly asked to
convert it. Concept Unit 3 combined both units into `parse_invoices`, a
single real function proven, with a real `sys.modules` check, to have
never once caused `customtkinter` to load — tested and trusted entirely
on its own, before `App` ever touched it. Only in Concept Unit 4 does
this same file finally reach the screen: a real button click asks a
real OS dialog for a path, that path is handed to the now-proven
`parse_invoices`, and the real dict it returns replaces `self.invoices`
outright — flowing on, immediately, into the exact `_refresh_display`
method Lesson 4 already built, with no changes needed to that method at
all. This is, concretely, the shape your own real app's file-to-screen
path should have: a boundary, provably crossable in exactly one
direction, between "reading a real file" and "everything CustomTkinter
does with what that reading produced."
