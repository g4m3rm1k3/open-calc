# Lesson 51: A Comma Is Not Always a Separator

## What you will build

A CSV-to-SQLite importer and SQLite-to-CSV exporter, built on the `csv`
module rather than naive `split(",")`, wired through Lesson 50's
parameterized-query discipline for every value that comes from the file
itself. Along the way, two real, directly demonstrated failures worth
knowing before they're encountered by accident: naive comma-splitting
breaking on a field that legitimately contains a comma, and numbers
imported as plain text comparing in the wrong order entirely.

## What you need to know first

- **Lesson 50** — `sqlite3`, parameterized queries with `?`, and why
  string-formatted SQL is never acceptable for values that didn't
  originate as a fixed literal in the program's own source. Every insert
  in this lesson follows that exact rule, applied now to values read
  from a file instead of typed by a user.

---

## The Problem, in prose, no code yet

A CSV file's name promises something simple — "comma-separated values" —
and for the simplest possible file, splitting each line on `,` would
work perfectly. Real CSV data routinely contains commas *inside* a
single field: an address ("123 Main St, Apt 4"), a name written
"Last, First," a free-text note. The CSV format has a real, specified way
to handle this — wrapping such a field in quotes — and a naive
line-by-line comma split doesn't know anything about that convention at
all, silently producing the wrong number of fields with no error, no
warning, and a result that looks plausible enough to miss on a casual
glance.

---

## Concept Unit: Why Not Just `split(",")`

### The Problem

Before reaching for the `csv` module, it's worth seeing directly what
goes wrong without it, using a single realistic line.

### Introduce the concept in isolation

```python
raw_csv_line = '"Smith, John",42,"123 Main St, Apt 4"'
print("raw line:", raw_csv_line)

naive_fields = raw_csv_line.split(",")
print("naive split(',') gives", len(naive_fields), "fields:", naive_fields)

import csv
import io

correct_fields = next(csv.reader(io.StringIO(raw_csv_line)))
print("csv.reader gives", len(correct_fields), "fields:", correct_fields)
```

Run it:

```
raw line: "Smith, John",42,"123 Main St, Apt 4"
naive split(',') gives 5 fields: ['"Smith', ' John"', '42', '"123 Main St', ' Apt 4"']
csv.reader gives 3 fields: ['Smith, John', '42', '123 Main St, Apt 4']
```

What this proves: this line represents exactly **3 real fields** — a
name, an age, an address — but `str.split(",")` (reused, but shown here
being the wrong tool) has no concept of quoting at all, and splits on
every literal comma, producing 5 fragments, two of which are broken
halves of fields that were never meant to be separated. `io.StringIO`
(**first appearance**) wraps a plain string so it can be read exactly
like a file — `csv.reader` (**first appearance**) is built to read from
any file-like object, and this lets the lab feed it one line directly
without creating a real file on disk just to demonstrate the parser.
`csv.reader` correctly recognizes the quotes, treats the commas inside
them as ordinary characters rather than separators, and strips the
quotes themselves from the final values.

This lab is deleted now; it never appears in the project. What survives
is the proof that this isn't a hypothetical concern: a single realistic
line, containing nothing unusual for real-world data, breaks the naive
approach silently.

### CS Lens

This is a small, real instance of needing an actual **parser** rather
than a fixed-delimiter split — CSV's quoting rule means a comma's
meaning depends on *context* (inside or outside quotes), which a single
`split()` call, by design, cannot track at all; it has no memory of
anything beyond the one character it's currently matching.

Also recognized in: this curriculum's own Lesson 24 raw HTTP parsing
(splitting on `\r\n` works because HTTP headers, unlike CSV fields, don't
allow embedded newlines — a genuinely different, simpler situation that
happens to make naive splitting safe there), shell argument parsing
(`"two words"` as one argument, the same quoting-changes-meaning idea).

### SE Lens

The `csv` module exists specifically because this exact mistake is easy
to make and easy to miss: naive splitting doesn't crash, doesn't warn,
and produces output that can look correct for a quick spot-check against
simple test data — precisely the same "looks right, isn't" failure shape
Lesson 50's SQL injection took specific effort to expose rather than
assuming correctness from a successful run.

---

## Concept Unit: Importing Into SQLite

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `csv_sqlite_tool.py`.
- **Change type:** add.
- **Dependencies:** `csv`, `sqlite3` (Lesson 50).

### The New Code

```python
def import_csv(connection, csv_path, table_name):
    with open(csv_path, newline="") as csv_file:
        reader = csv.reader(csv_file)
        column_names = next(reader)
        rows = list(reader)

    quoted_columns = ", ".join(f'"{name}" TEXT' for name in column_names)
    connection.execute(f'CREATE TABLE "{table_name}" ({quoted_columns})')

    placeholders = ", ".join("?" for _ in column_names)
    insert_sql = f'INSERT INTO "{table_name}" VALUES ({placeholders})'
    connection.executemany(insert_sql, rows)
    connection.commit()

    return len(rows)
```

### The Updated Project

A new, freestanding function with nothing surrounding it yet.

### Mechanical Walkthrough

- `open(csv_path, newline="")` — **first appearance of the `newline=""`
  argument.** The Python `csv` module's own documentation specifically
  requires this: CSV's line-ending rules are subtly different from a
  plain text file's, and opening without this argument can cause quoted
  fields containing newlines to be read incorrectly on some platforms —
  a real, documented gotcha this lesson avoids by following the
  established correct pattern rather than discovering the bug later.
- `csv.reader(csv_file)` then `next(reader)` — a **hard concept
  reappearing**: `next()` (established since early iterator-pattern
  lessons) pulls exactly the first row — the header line naming each
  column — off the reader, leaving the remaining rows for `list(reader)`
  to collect afterward.
- `f'"{name}" TEXT'` — every column is created as `TEXT`, deliberately,
  regardless of whether its values look numeric — every value read from
  a CSV file is, at the file level, *always* a string; deciding whether
  `"42"` should become the number `42` or stay the text `"42"` is a
  genuine judgment call this lesson does not make automatically, for a
  reason the next unit demonstrates directly rather than glossing over.
  Column names are wrapped in double quotes specifically so a column
  name that happens to collide with a SQL keyword, or contain a space,
  doesn't break the generated `CREATE TABLE` statement.
- `insert_sql` built with `?` placeholders, one per column, and
  `connection.executemany(insert_sql, rows)` — a **hard concept
  reappearing** directly from Lesson 50: every single value read from
  the CSV file — entirely untrusted, external data — is inserted only
  through parameter binding, never string-formatted into the SQL text,
  regardless of what characters it might contain.

### Run it

Against a real, deliberately tricky CSV file — embedded commas, an
embedded semicolon, and an embedded, doubled-up quote character (CSV's
own escaping convention for a literal `"` inside a quoted field):

```
name,age,address,notes
"Smith, John",42,"123 Main St, Apt 4","Prefers email; says ""call after 5pm"""
"Diaz, Maria",35,77 Oak Ave,None
"O'Brien, Sean",29,"5 River Rd, Unit 2B","Referred by Smith, John"
```

```python
connection = sqlite3.connect(":memory:")
imported_count = import_csv(connection, "contacts.csv", "contacts")
print(f"imported {imported_count} rows")

cursor = connection.execute("SELECT name, address FROM contacts WHERE age > ?", ("30",))
print("contacts older than 30:", cursor.fetchall())
```

```
imported 3 rows
contacts older than 30: [('Smith, John', '123 Main St, Apt 4'), ('Diaz, Maria', '77 Oak Ave')]
```

Every field, including the two names with embedded commas and the note
with an embedded semicolon and escaped quotes, imported correctly and is
independently queryable — including using this lesson's own `?`
parameter for the `age` comparison, exactly per Lesson 50's rule, even
though `age` came from a trusted, fixed literal here rather than
external input.

### CS Lens

Deferring the string-versus-number decision entirely — storing every
imported value as `TEXT` — is a deliberate, conservative default:
**lossless import**, prioritizing "every value round-trips exactly,
unchanged" over "every value has the type it probably should," a
tradeoff the next unit shows has a real, sharp edge of its own.

### SE Lens

A more ambitious importer could try to guess each column's type from
its values (all-digit strings become integers, and so on) — genuinely
useful, and genuinely risky: a ZIP code, a phone number, or an ID that
happens to look all-numeric would be silently converted to a number,
potentially losing a meaningful leading zero (`"00501"` becoming `501`)
with no error at all. This lesson's simpler, text-only default is safer
by construction, at the cost — demonstrated directly next — of losing
numeric comparison behavior for anything actually used as a number.

---

## Concept Unit: Text That Looks Like Numbers Compares Like Text

### The Problem

Storing everything as `TEXT`, as just built, has a real, sharp
consequence worth confronting directly rather than leaving implicit: SQL
comparison operators (`>`, `<`) behave differently for text than for
numbers, and nothing about importing a column as `TEXT` changes that
behavior to match what a person would expect from looking at the
values.

### Run it

```python
connection.execute("CREATE TABLE nums (value TEXT)")
connection.executemany("INSERT INTO nums VALUES (?)", [("30",), ("100",), ("9",)])
connection.commit()
cursor = connection.execute("SELECT value FROM nums WHERE value > ? ORDER BY value", ("30",))
print("rows with value > 30 (TEXT comparison):", cursor.fetchall())
```

```
rows with value > 30 (TEXT comparison): [('9',)]
```

The real answer is exactly backwards from what a person would expect:
`"100"` — genuinely greater than `30` — is silently excluded, and
`"9"` — genuinely less than `30` — is incorrectly included. What
happened: SQLite compared these as **text**, character by character —
`"9"` starts with the character `'9'`, which sorts after `'3'`
alphabetically, so `"9" > "30"` is true under text comparison, even
though `9 > 30` is false as numbers. `"100"` starts with `'1'`, which
sorts *before* `'3'`, so `"100" > "30"` is false under text comparison,
even though `100 > 30` is true as numbers.

### CS Lens

This is **lexicographic versus numeric ordering** — two genuinely
different, both entirely valid orderings of the same values, that agree
only by coincidence for numbers of equal length (as this lesson's own
earlier `age > 30` query happened to benefit from — every age in that
table was exactly two digits) and diverge sharply the moment lengths
differ.

Also recognized in: this exact bug appearing in real-world software
whenever a "version number" or "ID" field is sorted as a string
(`"10" < "9"` under text ordering — a well-known, recurring real-world
class of bug in build tools and package managers historically), file
listings sorted alphabetically rather than numerically (`file10.txt`
appearing before `file9.txt`).

### SE Lens

This is the concrete cost of the previous unit's conservative,
text-only import default, made visible rather than left as a silent
trap: any column genuinely meant to be compared or sorted numerically
needs an explicit, deliberate conversion — either at import time (a real
design decision this lesson chose not to make automatically) or at query
time (`CAST(value AS INTEGER)`, SQLite's own explicit conversion,
outside this lesson's scope but worth knowing exists) — never assumed
to happen automatically just because the values happen to look numeric.

---

## Concept Unit: Exporting Back to CSV

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `csv_sqlite_tool.py`.
- **Change type:** add.
- **Location:** below `import_csv`.

### The New Code

```python
def export_csv(connection, table_name, csv_path):
    cursor = connection.execute(f'SELECT * FROM "{table_name}"')
    column_names = [description[0] for description in cursor.description]
    rows = cursor.fetchall()

    with open(csv_path, "w", newline="") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(column_names)
        writer.writerows(rows)

    return len(rows)
```

### Mechanical Walkthrough

- `cursor.description` and the column-name extraction — a **hard
  concept reappearing** from Lesson 50's own `run_query`.
- `csv.writer(csv_file)` — **first appearance**, the direct counterpart
  to `csv.reader`: `writer.writerow(column_names)` writes the header
  line; `writer.writerows(rows)` (plural — reused from the CSV-writing
  already shown in this lesson's own test-data setup) writes every data
  row, and — this is the payoff of using the module rather than joining
  strings with commas by hand — automatically re-applies the correct
  quoting to any field that needs it, exactly reversing what `csv.reader`
  undid on the way in.

### Run it

A full round trip — import the tricky CSV, export it back out, and
compare the *parsed* content of both files (not the raw bytes, since
`csv.writer`'s own quoting choices don't have to byte-for-byte match
however the original file happened to be quoted, only represent the
same data):

```python
exported_count = export_csv(connection, "contacts", "contacts_roundtrip.csv")

original_rows = list(csv.reader(open("contacts.csv", newline="")))
roundtrip_rows = list(csv.reader(open("contacts_roundtrip.csv", newline="")))
print("content identical after round-trip:", original_rows == roundtrip_rows)
```

```
content identical after round-trip: True
```

Every field — including the embedded commas, the embedded semicolon,
and the escaped internal quote character — survived the full
CSV → SQLite → CSV round trip exactly, character for character.

### CS Lens and SE Lens

Both already covered by the general read/write symmetry established
across this unit and the import unit above — `csv.writer` undoing
exactly what `csv.reader` does, the same reversible-pair relationship
Lesson 45's `encrypt_bytes`/`decrypt_bytes` and Lesson 48's
`base64url_encode`/`base64url_decode` already established in different
contexts, per the Repetition Rule.

---

## Connect the pieces

One field, `"123 Main St, Apt 4"`, followed through the entire round
trip: `csv.reader` correctly recognizes the surrounding quotes in the
source file and reads it as one complete value despite its internal
comma — proven, directly, against the naive `split(",")` alternative
that would have broken it into two. `import_csv` stores it via a
parameterized `INSERT`, never touching Lesson 50's forbidden
string-formatted-SQL territory even once. A later query retrieves it
unchanged. `export_csv` writes it back out, and `csv.writer`
automatically re-wraps it in quotes exactly where needed — arriving,
confirmed directly by re-parsing both files, at content identical to
where it started.

## What breaks without this

Already demonstrated directly, twice: naive `split(",")` on a realistic
line produces 5 fragments instead of 3, silently corrupting two fields
into broken halves; and a `TEXT` column holding number-shaped values
under a `>` comparison returns `[('9',)]` instead of the numerically
correct answer, backwards in a way that would be very easy to miss in a
larger, less carefully checked dataset.

## Definition of done

- [ ] `csv.reader` correctly parses a line with an embedded comma inside
      quotes into the right number of fields; naive `split(",")` on the
      same line does not.
- [ ] `import_csv` on a CSV with commas, semicolons, and escaped quotes
      inside quoted fields produces a table where every value matches
      the original field exactly.
- [ ] A `TEXT`-typed numeric column produces a demonstrably wrong result
      under `>` comparison for values of different digit lengths.
- [ ] `export_csv` followed by re-parsing both the original and exported
      files with `csv.reader` produces identical parsed content.
- [ ] You can explain, without looking back at this lesson, why this
      importer stores every column as `TEXT` rather than guessing types,
      and what real problem that avoids.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add csv_sqlite_tool.py
  git commit -m "Add CSV/SQLite import and export using the csv module and parameterized inserts — naive comma-splitting demonstrably breaks on real-world fields, and TEXT-stored numbers demonstrably compare in the wrong order"
  ```

## What's next

Lesson 52's database backup and migration lesson builds directly on this
one's `import_csv`/`export_csv` pair as one concrete migration strategy —
export every table to CSV, move it, re-import — alongside SQLite's own
native backup mechanisms, compared directly against each other for what
each does and doesn't preserve.
