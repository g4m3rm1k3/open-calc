---
series: python-fundamentals
level: 28
title: Files
lang: python
---

Files let Python read and write data that persists beyond a single run. Configuration files, logs, CSV exports, and JSON payloads all start with opening a file. This lesson covers how Python opens, reads, and writes text files, and why the `with` statement is essential for doing it correctly.

## open() and the Context Manager

`open(filename, mode)` opens a file and returns a **file object**. Always wrap it in a `with` statement — it guarantees the file closes when the block exits, even if an exception is raised:

```python
with open("log.txt", "w") as log_file:
    log_file.write("Server started.\n")
    log_file.write("Listening on port 8080.\n")
```

- `"w"` — **write mode**: creates the file if it does not exist; **overwrites** it if it does
- `log_file` — the name for the file object inside the `with` block
- `.write(text)` — writes a string; does not add `\n` automatically

The file closes automatically when the `with` block ends — you do not call `.close()` manually.

**CS lens:** The `with` statement uses the **context manager protocol**: the file object's `__enter__` method runs when the block opens and `__exit__` runs when it closes. This guarantees cleanup regardless of whether the block succeeds or raises an exception. An unclosed file can corrupt writes, hold OS locks, and leak file descriptors — context managers prevent all three.

## Reading an Entire File

`"r"` (read mode) is the default:

```python
with open("log.txt", "r") as log_file:
    content = log_file.read()

print(content)
print(type(content))
```

```text
Server started.
Listening on port 8080.

<class 'str'>
```

`.read()` returns the entire file as a single string, including all newlines. If the file does not exist, Python raises `FileNotFoundError` (taught in Level 26).

## Reading Line by Line

For large files, `.read()` loads everything into memory at once. Iterating over the file object yields one line at a time — O(1) memory regardless of file size:

```python
line_number = 1

with open("log.txt", "r") as log_file:
    for line in log_file:
        stripped_line = line.strip()
        print(f"{line_number}: {stripped_line}")
        line_number = line_number + 1
```

```text
1: Server started.
2: Listening on port 8080.
```

Each `line` includes the trailing `\n`. `.strip()` removes leading and trailing whitespace, including `\n`.

**SE lens:** Prefer line-by-line iteration for any file that might be larger than a few megabytes. `.read()` is fine for small config files or short data files. For logs, CSVs, or data exports, iterate. You will not always know in advance how large a file will grow.

## File Modes

```text
Mode    Effect
"r"     Read. File must exist. Default.
"w"     Write. Creates file; truncates (erases) existing content.
"a"     Append. Creates file; adds to the end without erasing.
"r+"    Read and write. File must exist.
```

Append mode is the right choice for logs — each run adds lines without overwriting what is already there:

```python
with open("events.txt", "a") as event_file:
    event_file.write("User logged in.\n")
```

## str.splitlines() — Splitting Text into Lines

When you already have text as a string (from `.read()` or passed as a parameter), `.splitlines()` splits it into a list of lines without the trailing `\n`:

```python
report = "sales: 120\nreturns: 5\nnet: 115"
lines = report.splitlines()
print(lines)
print(len(lines))
```

```text
['sales: 120', 'returns: 5', 'net: 115']
3
```

`str.splitlines()` handles `\n` (Unix), `\r\n` (Windows), and `\r` (old Mac) correctly. `str.split("\n")` only handles `\n` — prefer `.splitlines()` when processing file content.

## Challenge: count_lines_and_words

Write a function `count_lines_and_words(text)` that takes the contents of a text file as a string and returns a tuple `(line_count, word_count)`.

- `line_count` — number of non-empty lines (lines where `line.strip()` is not `""`)
- `word_count` — total number of words across all lines

`.splitlines()` — splits a string into lines without `\n`.
`.split()` with no argument splits on any whitespace and ignores leading/trailing whitespace: `"  hello  world  ".split()` → `["hello", "world"]`.

```challenge
def count_lines_and_words(text):
    pass
```

```test
assert count_lines_and_words("hello world\nfoo bar baz") == (2, 5)
assert count_lines_and_words("one two three") == (1, 3)
assert count_lines_and_words("") == (0, 0)
assert count_lines_and_words("hello\n\nworld") == (2, 2)
assert count_lines_and_words("a b\nc d\ne f") == (3, 6)
```
