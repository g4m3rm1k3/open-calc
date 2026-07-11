---
series: python-fundamentals
level: 35
title: CSV
lang: python
---

CSV (Comma-Separated Values) is the most common format for tabular data — spreadsheet exports, database dumps, financial records, sensor readings. Unlike JSON, CSV has no hierarchy: every row is flat, every column is a string unless you convert it. Python's `csv` module handles the parsing details so you do not have to split on commas manually.

## Why Not Just split(",")

A row like `Alice,28,"Software Engineer, Backend"` cannot be split correctly on commas — the third field contains a comma inside quotes. The `csv` module handles quoting, escaping, different delimiters, and newlines inside quoted fields. Manual splitting breaks on any of these.

## csv.reader — Reading Rows as Lists

`csv.reader(iterable)` takes any iterable of lines and yields each row as a list of strings:

```python
import csv
import io

raw_csv = "name,age,city\nAlice,28,London\nBob,35,Paris\nEve,22,Tokyo"

reader = csv.reader(io.StringIO(raw_csv))

for row in reader:
    print(row)
```

```text
['name', 'age', 'city']
['Alice', '28', 'London']
['Bob', '35', 'Paris']
['Eve', '22', 'Tokyo']
```

`io.StringIO(string)` — wraps a string so it behaves like a file object. `csv.reader` expects a file-like object or a list of strings; `StringIO` lets you use CSV text you already have in memory without writing it to disk.

Every value is a string — including `'28'` and `'35'`. To work with numbers, convert them: `int(row[1])` or `float(row[1])`.

The first row here is the header. `reader` does not skip it automatically — your code must decide what to do with it.

**CS lens:** `csv.reader` is a **streaming parser** — it reads one row at a time and yields it. Like iterating over a file line by line (Level 28), this means reading a 10-million-row CSV file uses the same small amount of memory as reading a 10-row file. The entire file is never loaded into memory at once.

## csv.DictReader — Rows as Dictionaries

`csv.DictReader(iterable)` uses the first row as column names and yields each subsequent row as a `dict`:

```python
import csv
import io

raw_csv = "name,age,city\nAlice,28,London\nBob,35,Paris"

reader = csv.DictReader(io.StringIO(raw_csv))

for row in reader:
    print(row["name"], "is", row["age"], "years old.")
```

```text
Alice is 28 years old.
Bob is 35 years old.
```

The header row is consumed to build the keys. Every subsequent row is a dict with those keys. Access by column name instead of by index number — `row["age"]` instead of `row[1]`. This is safer: if columns are reordered, index-based code breaks silently; name-based code still works.

## Skipping the Header with csv.reader

When using `csv.reader` and you want to skip the header, call `next()` on the reader:

```python
import csv
import io

raw_csv = "product,price,stock\nApple,1.20,500\nBanana,0.50,1200\nCherry,3.00,80"

reader = csv.reader(io.StringIO(raw_csv))
header = next(reader)
print("Columns:", header)

for row in reader:
    product_name = row[0]
    unit_price = float(row[1])
    quantity = int(row[2])
    print(f"{product_name}: £{unit_price:.2f} × {quantity} = £{unit_price * quantity:.2f}")
```

```text
Columns: ['product', 'price', 'stock']
Apple: £1.20 × 500 = £600.00
Banana: £0.50 × 1200 = £600.00
Cherry: £3.00 × 80 = £240.00
```

`next(reader)` — advances the reader by one row and returns it. After this call, the `for` loop starts from the second row (the first data row).

`next(iterable)` works on any iterator: files, `csv.reader`, `enumerate`, `range`. It returns the next value the iterator would have yielded. Calling it when the iterator is exhausted raises `StopIteration`.

## Writing CSV

`csv.writer` writes rows. Pass it a file-like object and call `.writerow(list)`:

```python
import csv
import io

output = io.StringIO()
writer = csv.writer(output)

writer.writerow(["name", "score"])
writer.writerow(["Alice", 92])
writer.writerow(["Bob", 87])

print(output.getvalue())
```

```text
name,score
Alice,92
Bob,87

```

`output.getvalue()` returns the entire contents of the `StringIO` buffer as a string. In real code, replace `io.StringIO()` with `open("output.csv", "w", newline="")` — the `newline=""` argument prevents `csv.writer` from adding extra blank lines on Windows.

**SE lens:** Always use `csv.writer` to write CSV, never string concatenation. Fields containing commas, quotes, or newlines must be quoted — `csv.writer` handles this automatically. Manual concatenation silently produces malformed CSV for any such field.

## Challenge: average_column

Write a function `average_column(csv_text, column_name)` that parses the CSV string, reads the column with the given name, converts its values to floats, and returns the average rounded to 2 decimal places.

`csv.DictReader(io.StringIO(csv_text))` — parses the CSV into a dict reader.
`float(value)` — converts a string to a float.
`round(number, 2)` — rounds to 2 decimal places.

```challenge
def average_column(csv_text, column_name):
    import csv
    import io
    pass
```

```test
data = "name,score\nAlice,88\nBob,92\nEve,75"
assert average_column(data, "score") == 85.0
data2 = "item,price\nApple,1.20\nBanana,0.50\nCherry,3.00"
assert average_column(data2, "price") == round((1.20 + 0.50 + 3.00) / 3, 2)
assert average_column("x,y\n0,0\n10,5", "y") == 2.5
assert average_column("val\n4\n4\n4", "val") == 4.0
assert average_column("a,b\n1,3\n2,7", "b") == 5.0
```
