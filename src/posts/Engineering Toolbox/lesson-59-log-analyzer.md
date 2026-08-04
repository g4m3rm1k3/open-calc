# Lesson 59: Counting Things Is Cheap Once the Structure Is Extracted

## What you will build

A real log analyzer for Combined Log Format access logs — regex-based
line parsing, streamed one line at a time rather than loaded whole —
producing top-IP, status-code, and top-path reports via
`collections.Counter`, plus a general-purpose word frequency counter
applied to ordinary text. The transferable problem this lesson is
actually about: once unstructured text has been converted into
structured records (Lesson 59's own regex extraction step), *counting
and ranking* becomes almost trivial — the real work is entirely in
getting from raw text to structured data correctly; the analysis on top
of it is a few lines using a tool built for exactly this.

## What you need to know first

- **Lesson 44** — chunked, streaming file reading and its measured
  memory advantage. Today reuses that same principle for line-oriented
  text instead of raw bytes, measured again on real data.
- **Lesson 54** — `GROUP BY`/`SUM` aggregation in SQL. Today's
  `Counter`-based aggregation solves the identical kind of problem in
  pure Python, worth contrasting directly.
- **Lesson 55/57/58** — regex-based extraction, reused here for a real,
  standard text format rather than a lesson-specific grammar.

---

## The Problem, in prose, no code yet

A raw access log line is just text: `198.51.100.99 - - [01/Aug/2026...]
"GET /cart HTTP/1.1" 404 3155 "-" "Mozilla/5.0..."`. Nothing about that
string is directly countable or rankable — "which IP requested the most
pages" isn't a question you can ask of undifferentiated text at all.
The actual work of a log analyzer is almost entirely in the first step:
recognizing which part of that line is the IP, which part is the status
code, which part is the path — turning one unstructured line into one
structured record. Once *that's* done correctly, "top 5 IPs" is a
one-line question a general-purpose counting tool answers immediately.

---

## Concept Unit: Extracting Structure From a Real Line Format

### The Problem

The Combined Log Format — used by Apache, nginx, and many other real
web servers — packs seven distinct pieces of information into one
line, using a mix of spaces, brackets, and quotes as separators, none of
which can be split on reliably with a single fixed delimiter (Lesson 51's
own CSV lesson already established why a fixed-character split breaks
the moment a field itself can contain that character — the timestamp's
own spaces inside `[...]` are exactly this problem again).

### Introduce the concept in isolation

```python
import re

LOG_PATTERN = re.compile(
    r'(?P<ip>\S+) \S+ \S+ \[(?P<timestamp>[^\]]+)\] '
    r'"(?P<method>\S+) (?P<path>\S+) \S+" '
    r'(?P<status>\d+) (?P<size>\d+) "(?P<referrer>[^"]*)" "(?P<user_agent>[^"]*)"'
)

sample_line = '198.51.100.99 - - [01/Aug/2026:00:00:05 +0000] "GET /cart HTTP/1.1" 404 3155 "-" "Mozilla/5.0 (X11; Linux x86_64)"'

match = LOG_PATTERN.match(sample_line)
for field_name in ["ip", "timestamp", "method", "path", "status", "size", "user_agent"]:
    print(f"{field_name}: {match.group(field_name)!r}")
```

Run it:

```
ip: '198.51.100.99'
timestamp: '01/Aug/2026:00:00:05 +0000'
method: 'GET'
path: '/cart'
status: '404'
size: '3155'
user_agent: 'Mozilla/5.0 (X11; Linux x86_64)'
```

What this proves: `\S+` (**first appearance of this specific
shorthand**, though `\s` for whitespace has appeared before) matches one
or more *non*-whitespace characters — used for the IP and the two `-`
placeholder fields, none of which can contain a space themselves.
`[^\]]+` inside the timestamp's brackets matches anything *except* a
literal `]`, correctly capturing the space-containing timestamp as one
piece specifically because the pattern's boundary is "until the closing
bracket," not "until the next space." The named groups (a **hard concept
reappearing** from Lesson 55's own tokenizer) let every extracted piece
be retrieved by a clear name — `match.group("ip")` — rather than a
easy-to-miscount positional index.

This lab is deleted now; it never appears in the project. The pattern
survives directly into the real parser, wrapped for reuse.

### CS Lens

This is exactly Lesson 55's lexing/tokenizing concept, applied to a
single line rather than a whole document, and to a fixed, known
real-world format rather than a general grammar — one regex match
performing the entire "recognize the pieces" job in one step, since
this format, unlike JSON, has no recursive structure needing a separate
parsing stage at all.

### SE Lens

A single named-group regex, rather than several sequential `.split()`
calls each peeling off one field, keeps the entire line format
specified in one place — changing the format (a proxy server adding a
new field, for instance) means changing one pattern, not re-threading
logic spread across several sequential string operations each assuming
the previous one left the remaining text in a particular shape.

---

## Concept Unit: Streaming, Not Loading, the Whole File

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `log_analyzer.py`.
- **Change type:** add.
- **Dependencies:** `re`, `collections.Counter`, `collections.namedtuple`.

### The New Code

```python
LogEntry = namedtuple("LogEntry", ["ip", "timestamp", "method", "path", "status", "size", "user_agent"])


def parse_log_line(line):
    match = LOG_PATTERN.match(line)
    if not match:
        return None
    return LogEntry(
        ip=match.group("ip"),
        timestamp=match.group("timestamp"),
        method=match.group("method"),
        path=match.group("path"),
        status=int(match.group("status")),
        size=int(match.group("size")),
        user_agent=match.group("user_agent"),
    )


def analyze_log(log_path):
    ip_counts = Counter()
    status_counts = Counter()
    path_counts = Counter()
    total_bytes = 0
    line_count = 0
    unparsed_count = 0

    with open(log_path) as log_file:
        for line in log_file:
            line_count += 1
            entry = parse_log_line(line)
            if entry is None:
                unparsed_count += 1
                continue
            ip_counts[entry.ip] += 1
            status_counts[entry.status] += 1
            path_counts[entry.path] += 1
            total_bytes += entry.size

    return {"line_count": line_count, "unparsed_count": unparsed_count,
            "ip_counts": ip_counts, "status_counts": status_counts,
            "path_counts": path_counts, "total_bytes": total_bytes}
```

### Mechanical Walkthrough

- `namedtuple("LogEntry", [...])` — **first appearance.** Creates a new,
  lightweight tuple-like type whose elements are accessible both by
  position *and* by name (`entry.ip`, not just `entry[0]`) — a smaller,
  simpler alternative to a full class (Lesson 37's `CheckResult`,
  Lesson 39's `MacroEvent`) for a case like this one, where every field
  is set once at creation and never modified afterward.
- `parse_log_line` returning `None` on a non-matching line, rather than
  raising an exception — a **hard concept reappearing** from Lesson 56's
  own error-vs-skip design choices, here deliberately choosing "skip and
  count as unparsed" over "stop the whole analysis," since one malformed
  or unexpected line in a large real log shouldn't halt analysis of
  every other line.
- `for line in log_file:` — a **hard concept reappearing**, but worth
  naming explicitly here for the first time: iterating a file object
  directly, line by line, is *already* streaming — Python never loads
  the whole file into memory as one string this way, reading only as
  much as the next `line` actually requires, the identical principle
  Lesson 44 measured directly for chunked byte reading, now applying
  automatically to line-oriented text with no explicit chunk size
  needed at all.
- `Counter()` and `counter[key] += 1` — **first appearance of
  `collections.Counter`.** A specialized dictionary subtype whose
  missing keys default to `0` automatically — `ip_counts[entry.ip] += 1`
  works correctly even the very first time a given IP is seen, with no
  `if ip not in ip_counts:` check required, unlike Lesson 32's own
  `client_buckets` dictionary, which needed exactly that check by hand.

### Run it — Measuring the Real Memory Difference

Against a real, synthetic 400-line access log:

```python
def analyze_streaming(path):
    ...  # for line in open(path): ...

def analyze_whole_file(path):
    ...  # readlines() first, then loop over the list

print("streaming peak memory:", streaming_peak, "bytes")
print("whole-file peak memory:", whole_file_peak, "bytes")
```

```
streaming peak memory: 22859 bytes
whole-file peak memory: 83071 bytes
```

Even on this lesson's own modest 400-line test file, streaming used
roughly **3.6x less peak memory** than reading the whole file into a
list first — the same class of measured advantage Lesson 44 found for
chunked binary reading (there, 36.8x, on a larger, differently-shaped
test), scaling in the identical direction for the identical underlying
reason: real log files in production can run to millions of lines, and
`readlines()` holding every one of them as a separate string
simultaneously is exactly the kind of cost that grows without bound as
the file grows, while `for line in log_file:` does not.

### CS Lens

This is the line-oriented instance of the same **streaming processing**
principle Lesson 31's `relay()` and Lesson 44's chunked hashing already
established for network bytes and binary files respectively — Python's
own file iteration protocol handles the chunking automatically here,
requiring no manual `.read(chunk_size)` loop at all, because "one line"
is already a natural, bounded unit for this specific format.

### SE Lens

Using `for line in log_file:` instead of `.readlines()` costs nothing in
code simplicity — if anything, it's the more idiomatic, more commonly
seen Python pattern — while avoiding a real, measured memory cost that
scales directly with file size. This is a rare case where the more
efficient choice and the more conventional choice are the same choice;
`.readlines()` exists for cases that genuinely need random access to
every line at once, not as the default way to process a file
sequentially.

---

## Concept Unit: Reporting — What `Counter` Gives You for Free

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `log_analyzer.py`.
- **Change type:** add (usage, in the `__main__` block).

### Run it

```python
stats = analyze_log("access.log")

for ip, count in stats["ip_counts"].most_common(5):
    print(f"  {ip:<16} {count} requests")

for status, count in sorted(stats["status_counts"].items()):
    print(f"  {status}: {count}")

for path, count in stats["path_counts"].most_common(5):
    print(f"  {path:<15} {count} requests")
```

```
total lines: 400, unparsed: 0
total bytes served: 2,978,997

=== top 5 IPs by request count ===
  203.0.113.5      206 requests
  198.51.100.99    72 requests
  192.0.2.77       65 requests
  198.51.100.23    57 requests

=== status code distribution ===
  200: 208
  301: 48
  404: 104
  500: 40

=== top 5 requested paths ===
  /               79 requests
  /products       76 requests
  /login          46 requests
  /about          46 requests
  /cart           42 requests
```

`.most_common(5)` (**first appearance**) — a method only `Counter`
provides, not plain dictionaries — returns exactly the `5`
highest-count entries, already sorted, in one call, doing the
equivalent of Lesson 54's `ORDER BY ... DESC LIMIT 5` entirely in
Python, no database involved.

A direct cross-check against internal consistency, not just plausible-
looking output:

```python
ip_total = sum(stats["ip_counts"].values())
status_total = sum(stats["status_counts"].values())
path_total = sum(stats["path_counts"].values())
print(ip_total == stats["line_count"], status_total == stats["line_count"], path_total == stats["line_count"])
```

```
True True True
```

Every one of the three independent `Counter` totals sums back to
exactly `400` — this lesson's real `line_count` — confirming no line was
double-counted into any single aggregation and none was silently
dropped, the same "verify, don't just trust the output" discipline
Lesson 52 applied to backup consistency.

### CS Lens

`Counter` is a **multiset** (or "bag") — a collection that, unlike a
plain `set`, remembers *how many* times each distinct item appeared, not
just whether it appeared at all — exactly the data structure "count
occurrences of X" problems need, with ranking (`most_common`) built in
as a first-class operation rather than something to implement separately
with `sorted()` and a key function every time.

### SE Lens

Computing three separate `Counter` objects in a single pass over the
file — rather than three separate passes, one per report — means the
file is only ever read once regardless of how many different
breakdowns are needed from it, a direct, deliberate efficiency choice
that costs nothing in code clarity, since each `Counter` update is one
simple line inside the same loop already reading each line exactly
once.

---

## Concept Unit: A General-Purpose Word Frequency Counter

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `log_analyzer.py`.
- **Change type:** add.
- **Location:** below `analyze_log`.

### The New Code

```python
WORD_PATTERN = re.compile(r"[a-zA-Z']+")


def word_frequencies(text, top_n=None):
    words = (match.group().lower() for match in WORD_PATTERN.finditer(text))
    counts = Counter(words)
    return counts.most_common(top_n)
```

### Mechanical Walkthrough

- `WORD_PATTERN = re.compile(r"[a-zA-Z']+")` — matches runs of letters
  and apostrophes (so a contraction like `"don't"` stays one word rather
  than being split at the apostrophe), deliberately excluding digits and
  punctuation entirely — a genuinely different, much simpler pattern
  than this lesson's own `LOG_PATTERN`, chosen because this is a
  genuinely different, much simpler problem: no fixed field structure,
  just "find every word-shaped run of characters."
- `WORD_PATTERN.finditer(text)` — **first appearance of `.finditer()`.**
  Unlike `.match()` (tried once, at a fixed position, used throughout
  this lesson's log parsing) or `.findall()` (returns all matches as
  plain strings immediately), `.finditer()` returns an **iterator**
  (Lesson 68's own territory) of match objects, found one at a time as
  the surrounding generator expression consumes them — scanning the
  *entire* text for every occurrence of the pattern, anywhere, not just
  at the start.
- `match.group().lower()` inside the generator expression — reused
  string lowercasing, applied so `"The"` and `"the"` are counted as the
  same word rather than two separate ones.
- `Counter(words)` — **first appearance of constructing a `Counter`
  directly from an iterable**, rather than building it up one `+= 1` at
  a time: handed any sequence of items, `Counter` counts every
  occurrence of every distinct item in one call.

### Run it

```python
passage = """
The quick brown fox jumps over the lazy dog. The dog barks, but the fox
is already gone. The fox runs quickly, and the dog watches the fox go.
"""
for word, count in word_frequencies(passage, top_n=5):
    print(f"  {word!r}: {count}")
```

```
  'the': 7
  'fox': 4
  'dog': 3
  'quick': 1
  'brown': 1
```

`'the'` and `'The'` (the passage's own capitalized sentence-starting
instances) correctly collapse into one count of `7`, and `'fox'`/`'dog'`
are correctly ranked by their real occurrence counts — a completely
general tool, built from three lines beyond the regex itself, reusable
on any plain text at all, including — though not specifically wired up
in this lesson — the very `user_agent` or `referrer` fields this
lesson's own log parser already extracts.

### CS Lens and SE Lens

Both already covered by the previous unit's explanation of `Counter`
itself — this is a second, independent application of the identical
tool to a genuinely different kind of input, proving its generality
directly rather than only asserting it, per the Repetition Rule.

---

## Connect the pieces

One log file, followed through the whole lesson: `analyze_log` opens it
once and streams it line by line — never holding more than one line's
text in memory at a time, measured directly to use roughly 3.6x less
peak memory than loading it whole. Each line passes through
`parse_log_line`'s regex, turning unstructured text into a structured
`LogEntry`, which three separate `Counter` objects then tally in a
single pass — verified, not assumed, to sum back to the exact same
total line count from three independent angles. `word_frequencies`,
built from the same `Counter` tool applied to a completely different
extraction pattern, proves the counting-and-ranking half of this
lesson's work generalizes far beyond log analysis specifically.

## What breaks without this

Replacing `Counter()`'s automatic-zero-default behavior with a plain
`dict` and no `if key not in counts:` guard reproduces exactly the
`KeyError` risk Lesson 32's own `client_buckets` had to explicitly guard
against by hand — `dict_counts[ip] += 1` on a never-before-seen `ip`
raises `KeyError: '203.0.113.5'` immediately, rather than the correct,
silent `0 + 1 = 1` a real first occurrence should produce. `Counter`
removes an entire category of easy-to-forget boilerplate that a plain
`dict` would otherwise require at every single counting site.

## Definition of done

- [ ] `parse_log_line` correctly extracts all seven fields from a real
      Combined Log Format line.
- [ ] `analyze_log`'s three `Counter` totals each independently sum to
      the exact same `line_count`.
- [ ] Streaming line-by-line iteration measurably uses less peak memory
      than `.readlines()` on the same file.
- [ ] `word_frequencies` correctly case-folds and ranks words from a
      real passage of text.
- [ ] You can explain, without looking back at this lesson, why
      `Counter[missing_key] += 1` doesn't raise `KeyError` the way the
      same line would on a plain `dict`.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add log_analyzer.py
  git commit -m "Add streaming Combined Log Format analyzer and general word frequency counter using collections.Counter — verified all aggregations sum back to the true line count and streaming uses ~3.6x less peak memory than readlines()"
  ```

## What's next

Lesson 60's search-and-replace engine is this lesson's own `WORD_PATTERN`
taken further: matching text is only half of what regular expressions
can do, and that lesson builds the *replace* half properly, including
capture-group backreferences this lesson's simple word-matching never
needed.
