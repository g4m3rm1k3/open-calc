# Lesson 3: CSV Is Not "Split On Commas"

**What you will build:** a `csv_source` module added to `recordkeeper`
with `load_contacts_csv` and `write_contacts_csv`, using the standard
library's `csv` module to read and write a real `data/contacts.csv`
file. The transferable problem: why splitting a line on `,` is a
plausible-looking but genuinely wrong way to parse CSV, what real CSV
data actually needs to represent (commas and newlines *inside* a
field), and how `csv.DictReader`/`csv.DictWriter` turn rows into the
same dict shape `recordkeeper` already works with.

**What you need to know first:** Lesson 1 — `open()`, the `with`
statement, streaming line-by-line iteration over a file object, text
encoding. Lesson 2 — binary vs. text mode (referenced, not reused
directly, in this lesson's own `newline=""` explanation).

**Terms used in this lesson**

- **Delimiter** — the character that separates one field from the next
  within a row; a comma by default in CSV, but not required to be one.
  It exists because a row's fields have to be told apart somehow, and a
  single, agreed-upon separator character is the simplest possible rule
  for doing that.
- **Quoting** — wrapping a field's value in quote characters (`"..."`
  by default) specifically when that value itself contains the
  delimiter, a quote character, or a newline. It exists because without
  it, a field's own content could be indistinguishable from the
  structure around it — a comma *inside* a field would look identical
  to a comma *between* fields with no other rule to tell them apart.
- **`newline=""` (universal newline handling, disabled)** — an argument
  to `open()` that turns off Python's own automatic newline translation
  when text mode is used together with the `csv` module. It exists
  because the `csv` module needs to see a field's own embedded `\n`
  characters exactly as they are on disk, to correctly tell a quoted
  field's internal newline apart from the newline that ends a row —
  something Python's default newline translation would otherwise
  interfere with.

**Objects and methods used**

- **`csv.reader`**
  - *What it is:* A function from the standard library's `csv` module
    that wraps an open file object and yields one list per row.
  - *Implementation:* `csv.reader(csvfile, dialect='excel', **fmtparams)
    -> an iterator of lists`; each row is yielded as a `list[str]`, one
    element per field, with quoting already resolved.
  - *Its use:* Proves, in this lesson's first lab, that a purpose-built
    parser correctly reconstructs rows a naive `.split(",")` cannot.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    factory function returning an iterator; responsible for turning a
    stream of raw CSV text into a stream of correctly-split rows,
    handling quoting and embedded delimiters/newlines according to its
    dialect rules; depends on an already-open file object opened with
    `newline=""`; consumed by a `for row in reader:` loop, the same
    file-iteration idea from Lesson 1 applied to an object other than a
    raw file; shape is one `list[str]` per row, lazily, never a
    pre-built list of all rows.

- **`csv.DictReader`**
  - *What it is:* A class from the `csv` module that wraps `csv.reader`
    and yields each row as a `dict` keyed by column header instead of a
    plain list.
  - *Implementation:* `csv.DictReader(f, fieldnames=None, ...)`; if
    `fieldnames` is omitted, the first row read is consumed as the
    header and used as the keys for every row after it, exposed
    afterward as `reader.fieldnames`.
  - *Its use:* What `load_contacts_csv` uses to turn each CSV row
    directly into the same dict shape the rest of `recordkeeper` will
    work with, without a separate step to pair header names to values
    by hand.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    class wrapping `csv.reader`; responsible for reading the header row
    once, then producing one dict per subsequent row, keyed
    consistently by that header; depends on an open file object (same
    `newline=""` requirement as `csv.reader`) and, optionally, an
    explicit `fieldnames` list when the file has no header row of its
    own; connects directly to `csv.reader` internally and is iterated
    the same way; shape is one `dict[str, str]` per row, lazily.

- **`csv.DictWriter`**
  - *What it is:* A class from the `csv` module that writes dicts out
    as CSV rows, in a fixed column order.
  - *Implementation:* `csv.DictWriter(f, fieldnames)` — `fieldnames` is
    required (there's no row to infer it from, unlike `DictReader`);
    `.writeheader()` writes the header row; `.writerow(dict)` /
    `.writerows(list_of_dicts)` write data rows, in `fieldnames`' order
    regardless of each dict's own key order; raises `ValueError` if a
    given dict contains a key not present in `fieldnames`.
  - *Its use:* What `write_contacts_csv` uses to turn `recordkeeper`'s
    own dict-shaped records back into a real, correctly-quoted CSV
    file.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A class
    wrapping `csv.writer`; responsible for enforcing one fixed, known
    column order across every row it writes, and rejecting any dict
    that doesn't match the columns it was told to expect, rather than
    silently writing extra or misaligned columns; depends on an open,
    writable file object (`newline=""` again) and an explicit
    `fieldnames` list; connects to `csv.writer` internally; shape in is
    one `dict` per `.writerow()` call, shape out is one written text
    row per call, with no return value used by this lesson's code.

---

## Concept Unit: Why `line.split(",")` is the wrong tool

### The Problem

Lesson 1's `for line in infile:` streamed a log file where each line
had a fixed, simple shape — timestamp, event, key=value pairs — with no
field ever containing the characters used to separate fields.
Real-world tabular data doesn't get that guarantee: a contact's notes
field, for instance, is free text a person typed, and free text can
contain a comma, or even span multiple lines, with nothing stopping it.

> **Stop and think:** If one field's own text contains a comma — say, a
> notes field reading `"Prefers email, not calls"` — and a whole row is
> written as that field joined with others using `,` as the separator,
> what would happen if you tried to split that row back apart on `,`
> with no other rule involved? How many pieces would you get, and would
> you be able to tell, just from the pieces themselves, which comma was
> "real" and which one was just part of the text?

### Introduce the concept in isolation

```python
import csv

rows = [
    {"id": "1", "name": "Alice Smith", "email": "alice@example.com",
     "notes": "Prefers email, not calls"},
    {"id": "2", "name": "Bob Lee", "email": "bob@example.com",
     "notes": "Referred by Alice\nFollow up in June"},
]

with open("scratch_contacts.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["id", "name", "email", "notes"])
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

with open("scratch_contacts.csv", encoding="utf-8") as f:
    print(repr(f.read()))

with open("scratch_contacts.csv", encoding="utf-8") as f:
    for i, line in enumerate(f, start=1):
        fields = line.rstrip("\n").split(",")
        print(f"line {i}: {fields}")

with open("scratch_contacts.csv", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    for i, row in enumerate(reader, start=1):
        print(f"row {i}: {row}")
```

Real output:

```
'id,name,email,notes\n1,Alice Smith,alice@example.com,"Prefers email, not calls"\n2,Bob Lee,bob@example.com,"Referred by Alice\nFollow up in June"\n'

line 1: ['id', 'name', 'email', 'notes']
line 2: ['1', 'Alice Smith', 'alice@example.com', '"Prefers email', ' not calls"']
line 3: ['2', 'Bob Lee', 'bob@example.com', '"Referred by Alice']
line 4: ['Follow up in June"']

row 1: ['id', 'name', 'email', 'notes']
row 2: ['1', 'Alice Smith', 'alice@example.com', 'Prefers email, not calls']
row 3: ['2', 'Bob Lee', 'bob@example.com', 'Referred by Alice\nFollow up in June']
```

The naive version fails in two different, real ways, both visible
above. Alice's row splits into *five* pieces instead of four — the
comma inside `"Prefers email, not calls"` is indistinguishable, to
`.split(",")`, from the comma that actually separates fields, so the
notes field gets torn in half. Bob's row fails even worse: his notes
field contains a real newline character, which means `for line in f:`
itself — Lesson 1's own streaming tool — hands back that one logical
row as *two* separate physical lines, because as far as line-by-line
iteration is concerned, a newline always ends a line, whether or not
it's "supposed to" semantically.

`csv.reader`, given the identical file, gets exactly three rows —
matching the three logical records that were actually written,
regardless of where commas or newlines happen to fall inside a field's
own text. This works because of **quoting**, named here in full: the
writer wrapped both problem fields in `"..."` specifically because
each one contained the delimiter or a newline, and the reader uses
those same quote marks to know a comma or newline found *inside* a
quoted span isn't a real separator at all.

### Discard the throwaway example

`scratch_contacts.csv` and this lab's code are discarded; they exist
only to make naive splitting's real failure, and `csv.reader`'s
correct handling of the same file, directly observable side by side.

### Project Change

- **Reference Source** — none; from-scratch, as in Lessons 1-2.
- **Files affected** — new file `recordkeeper/ingest/csv_source.py`;
  new sample data file `data/contacts.csv`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `csv`, standard library.

### The New Code

```python
import csv


def load_contacts_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **`open(path, newline="", encoding="utf-8")`** — the same `open`
  builtin from Lesson 1, with a new argument: `newline=""`, full
  treatment above under Terms. Without it, Python's own default
  newline handling would translate certain newline byte sequences on
  the way in, which can conflict with how `csv` needs to see a quoted
  field's embedded newline exactly as written — this is why every
  file opened for `csv` reading or writing in this lesson passes
  `newline=""` explicitly, on both the read and write side.
- **`import csv`** — brings the standard library's `csv` module into
  scope; nothing in this module is called yet on this line, but every
  name used below it (`csv.DictReader`, later `csv.DictWriter`) resolves
  through this import.

### CS lens

Quoting a field specifically because its content collides with the
format's own structural characters is an instance of **escaping** —
marking data so it can't be confused with the syntax surrounding it,
used anywhere a format's content and its structure share the same
character set.

```
Also recognized in: HTML entity-escaping `<` as `&lt;` so literal text
isn't parsed as a tag, SQL string literals doubling an embedded quote
character, shell scripts quoting an argument containing a space so it
isn't split into two arguments, JSON escaping a literal `"` inside a
string value
```

### SE lens

The alternative not chosen is writing a custom parser — splitting on
`,`, then separately handling the quoting/embedded-newline cases by
hand. That's not a hypothetical; it's exactly what the naive lab just
tried and got wrong on the very first realistic input. The real
tradeoff isn't "the standard library is better than DIY" as a general
rule — it's that CSV's quoting rules have enough edge cases (a quote
character inside a quoted field, trailing whitespace around a
delimiter, different quoting styles entirely) that a hand-rolled
parser's debt compounds with every new edge case a real data source
eventually produces, while `csv.reader`, having already been exercised
against those edge cases by everyone else who's ever used it, doesn't
re-incur that cost for `recordkeeper`.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output.

### Connect

Lesson 1 streamed a log file where line-by-line iteration was always
safe; this unit shows that assumption breaking the moment a field can
contain the delimiter or a newline, and introduces `csv.reader` as the
tool that handles it correctly — the next unit builds
`load_contacts_csv` and `write_contacts_csv` around `csv`'s
dict-shaped variants of the same idea.

---

## Concept Unit: `DictReader` and `DictWriter`

### The Problem

`csv.reader` (previous unit) hands back each row as a plain
`list[str]` — position, not name, is what tells one field from
another. That's workable for a three-column file read once, but every
piece of code touching that list has to already know that index `0`
means `id`, index `1` means `name`, and so on — a fragile, silent
assumption that breaks the moment a column is added or reordered.

> **Stop and think:** The very first row `csv.reader` yields for a file
> with a header is just another row — a `list[str]` like any other,
> holding the column names themselves as strings. Given that, what
> would it take to turn every *later* row into a dict keyed by those
> same names, instead of leaving each row as a bare, position-only
> list? What piece of information would have to be read and held onto
> first, before any data row could be converted?

### Introduce the concept in isolation

```python
import csv

with open("scratch_contacts.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    print("reader.fieldnames ->", reader.fieldnames)
    for row in reader:
        print(type(row), dict(row))

new_rows = [{"id": "3", "name": "Cara Diaz", "email": "cara@example.com", "notes": ""}]
with open("scratch_contacts_out.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["id", "name", "email", "notes"])
    writer.writeheader()
    writer.writerows(new_rows)

with open("scratch_contacts_out.csv", encoding="utf-8") as f:
    print(repr(f.read()))

try:
    with open("scratch_contacts_bad.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "name", "email", "notes"])
        writer.writeheader()
        writer.writerow({"id": "4", "name": "Dax", "email": "dax@example.com",
                          "notes": "", "phone": "555-1234"})
except ValueError as e:
    print(f"{type(e).__name__}:", e)
```

Real output:

```
reader.fieldnames -> ['id', 'name', 'email', 'notes']
<class 'dict'> {'id': '1', 'name': 'Alice Smith', 'email': 'alice@example.com', 'notes': 'Prefers email, not calls'}
<class 'dict'> {'id': '2', 'name': 'Bob Lee', 'email': 'bob@example.com', 'notes': 'Referred by Alice\nFollow up in June'}

'id,name,email,notes\n3,Cara Diaz,cara@example.com,\n'

ValueError: dict contains fields not in fieldnames: 'phone'
```

`reader.fieldnames` confirms `DictReader` consumed the first row as a
header automatically, without that row also showing up as data; every
row after it comes back as a real `dict`, keyed by those same header
strings, matching exactly what `csv.reader` alone would have returned
as a bare list at that same position. `DictWriter`'s round trip proves
the reverse holds too — `fieldnames` controls both the header row and
the order every dict's values are written in, regardless of the order
keys happen to be in inside the dict itself. The last block proves
`DictWriter` doesn't silently drop or misplace an unexpected key like
`"phone"` — it raises a real `ValueError` naming exactly which key
didn't belong, instead of writing a malformed row or quietly losing
data.

### Discard the throwaway example

`scratch_contacts_out.csv`, `scratch_contacts_bad.csv`, and this lab's
code are discarded; `scratch_contacts.csv` (from the previous unit) was
reused here as input rather than recreated, since its content didn't
need to change for this lab.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — `recordkeeper/ingest/csv_source.py` (modified,
  completing both functions); `data/contacts.csv` (new sample file,
  created via this lesson's own `write_contacts_csv`).
- **Change type** — add (finishing `load_contacts_csv`, adding
  `write_contacts_csv`).
- **Location** — `load_contacts_csv`'s body, inside the `with` block
  already started; `write_contacts_csv` as a new, second function in
  the same file.
- **Dependencies** — none new.

### The New Code

```python
        reader = csv.DictReader(f)
        return [row for row in reader]


def write_contacts_csv(path, contacts, fieldnames):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(contacts)
```

### The Updated Project

```python
 1  import csv
 2
 3
 4  def load_contacts_csv(path):
 5      with open(path, newline="", encoding="utf-8") as f:
 6          reader = csv.DictReader(f)               # ← new
 7          return [row for row in reader]            # ← new
 8
 9
10  def write_contacts_csv(path, contacts, fieldnames):  # ← new
11      with open(path, "w", newline="", encoding="utf-8") as f:  # ← new
12          writer = csv.DictWriter(f, fieldnames=fieldnames)     # ← new
13          writer.writeheader()                                  # ← new
14          writer.writerows(contacts)                            # ← new
```

The module now does both directions: `load_contacts_csv` opens a CSV
file and returns a plain Python `list` of `dict`s, one per data row,
using `DictReader` to pair each value with its column name
automatically; `write_contacts_csv` takes that same list-of-dicts
shape and a `fieldnames` list controlling column order, and produces a
real, correctly-quoted CSV file from it — the two functions are
inverses of each other, both built around the same dict-per-row shape.

### Mechanical walkthrough

- **`reader = csv.DictReader(f)`** — full treatment above (Objects and
  methods used); wraps the already-open file object `f`, consuming its
  first row as the header.
- **`[row for row in reader]`** — a list comprehension: builds one
  `list` by iterating `reader` (the same file-iteration idea from
  Lesson 1, here applied to a `DictReader` instead of a raw file
  object) and collecting every `row` it yields, in order, with no
  transformation applied to each row.
- **`return ...`** — a `return` statement: ends `load_contacts_csv`
  and hands the built list back to whoever called it.
- **`writer = csv.DictWriter(f, fieldnames=fieldnames)`** — full
  treatment above; `fieldnames` here is `write_contacts_csv`'s own
  parameter, passed straight through, so the caller controls column
  order rather than this module hard-coding it.
- **`writer.writeheader()`** — writes one row containing `fieldnames`
  itself, as column headers; must be called before any data rows if a
  header is wanted at all, since `DictWriter` never writes one
  automatically.
- **`writer.writerows(contacts)`** — writes every dict in `contacts` as
  one data row each, in `fieldnames`' column order; equivalent to
  calling `.writerow()` once per item, batched into a single call.

### CS lens

Converting a row's data from position-based access (a list, "column
0") to name-based access (a dict, `row["name"]`) is an instance of
attaching a **schema** to otherwise-anonymous data — giving each
position a stable, named meaning instead of relying on every consumer
of the data to already know what each position means by convention.

```
Also recognized in: a database table's own column names vs. a raw
binary row format, a function's keyword arguments vs. purely
positional ones, a JSON object's named keys vs. a bare JSON array,
Protocol Buffers' named fields vs. an unstructured byte stream
```

### SE lens

The alternative not chosen is keeping `load_contacts_csv` built around
`csv.reader`'s plain lists and letting every caller remember which
index means what. That's marginally faster (no dict construction per
row) and marginally less memory per row — a real, if usually small,
cost `DictReader` does pay. The tradeoff is that a list-based version
silently breaks the moment `contacts.csv` gains a new column before
`notes`, shifting every later index by one with no error raised
anywhere — exactly the kind of debt that surfaces far from where it
was introduced, in whatever code reads index `3` expecting `notes` and
silently gets something else instead. `DictWriter`'s `ValueError` on an
unexpected key is the same tradeoff from the write side: a plain
`csv.writer` would happily write a `phone` value into whatever the next
column happened to be, embedding the same class of silent misalignment
on write instead of read.

### Commands needed

None new.

### Run it

Shown above — real output, from an actual run.

### Connect

The previous unit established that `csv.reader` correctly splits real,
quoted CSV data where naive `.split(",")` cannot; this unit builds
`load_contacts_csv` and `write_contacts_csv` on top of that same
correctness, adding one more layer — turning each row into a named
dict — so the rest of `recordkeeper` never has to reason about column
position at all.

---

## Connect the pieces

`recordkeeper.ingest.csv_source.write_contacts_csv` was used to create
this lesson's own sample file, `data/contacts.csv`, from two contact
dicts — one with a comma inside its `notes` field, one with a real
newline inside its `notes` field, the exact two cases this lesson's
first unit proved naive splitting cannot survive. The file it produced:

```
id,name,email,notes
1,Alice Smith,alice@example.com,"Prefers email, not calls"
2,Bob Lee,bob@example.com,"Referred by Alice
Follow up in June"
```

Reading it back with `load_contacts_csv` — built on `csv.DictReader`,
built in turn on the same quoting-aware `csv.reader` proven in the
first unit — returns:

```python
{'id': '1', 'name': 'Alice Smith', 'email': 'alice@example.com', 'notes': 'Prefers email, not calls'}
{'id': '2', 'name': 'Bob Lee', 'email': 'bob@example.com', 'notes': 'Referred by Alice\nFollow up in June'}
```

Both dicts' `notes` fields come back exactly as they went in, comma and
embedded newline intact — a real, verified round trip through the same
`newline=""`-opened files, quoting rules, and dict-per-row shape this
whole lesson was built around.
