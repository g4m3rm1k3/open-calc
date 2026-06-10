# Rust Web Server — LAB 09 — Strings, Slices, and Text Processing

**Prerequisites:** LAB 01–08. You understand all of Phase 1 — types, ownership, borrowing, structs, enums, traits, generics, modules, collections, closures, and iterators.

**What this lab adds:**
- The complete story of strings in Rust — why there are two kinds and what each one is
- What a slice is — the most important type you have never formally met
- UTF-8 encoding — how text is actually stored in memory as bytes
- String methods for searching, splitting, and transforming text
- Building a mini text processor that parses structured lines
- The foundation of HTTP parsing — every HTTP request is a structured string

**Time:** 4–6 hours. Strings are deceptively deep. The `&str` vs `String` distinction resolves confusions that have been accumulating since Lab 01. Read Part 1 and Part 2 carefully before touching any code.

---

> **Quick Check — try to answer before reading further:**
>
> 1. You have used `"hello"` (with double quotes) and `String::from("hello")` since Lab 01. They both seem to be text — what do you think the actual difference is between them in memory?
> 2. A program reads a 1GB log file to find lines containing the word "ERROR". Should it load the entire file into a `String` first? What would be the problem with that approach?
> 3. HTTP requests look like this: `GET /index.html HTTP/1.1`. The server receives this as raw bytes. What steps do you think are needed to turn those bytes into something a program can act on?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, you have a working text processor that parses structured log lines — the same kind of parsing your web server will do with HTTP requests:

```
$ cargo run

Parsing log file...

[OK]   2024-01-15 10:23:45 INFO  Server started on port 8080
[OK]   2024-01-15 10:23:46 DEBUG Accepting connections
[OK]   2024-01-15 10:24:01 ERROR Connection refused: timeout
[SKIP] 2024-01-15 malformed line — missing fields
[OK]   2024-01-15 10:24:15 INFO  Request: GET /index.html

Summary:
  Total lines:     5
  Parsed OK:       4
  Skipped:         1
  ERROR entries:   1
  Levels seen: DEBUG, ERROR, INFO
```

Every technique used here — splitting on delimiters, parsing fields by position, collecting into structured types — reappears when you parse HTTP requests in Lab 13.

---

## Part 1 — The Two String Types

You have used strings since Lab 01 without a full explanation of what they are. That explanation is now essential — because understanding the difference between `&str` and `String` is required to write a text-processing server.

### Concept: `str` — The String Slice Primitive

**What it is:** `str` (pronounced "string slice" or just "str") is a primitive type representing a sequence of UTF-8 encoded bytes. It is always accessed through a reference: `&str`.

**`str` in memory:**

A `&str` is two values stored together — a pointer and a length:

```
&str on the stack:
┌─────────────────────┐
│ ptr  ───────────────────► (points somewhere into memory)
│ len: 5              │     (how many bytes the slice covers)
└─────────────────────┘
```

That is it. A `&str` is just a pointer and a length. It does not own the memory it points to. It is a **view** into bytes that live somewhere else.

**Where those bytes can live:**

```
1. In the program binary (for string literals):
   let greeting = "hello";
   // "hello" is baked into the compiled binary
   // greeting is a &str pointing into that binary
   // the bytes are never on the heap — they are read-only program data

2. Inside a String's heap allocation:
   let owned = String::from("hello");
   let slice: &str = &owned;   // or &owned[1..3] for a sub-slice
   // slice points into owned's heap memory
   // slice borrows from owned — cannot outlive owned

3. In any contiguous region of memory:
   // A &str can point into a buffer, a file mapping, a network packet
   // Anywhere bytes live, you can create a &str view of them
```

**Why `str` is always behind a `&`:**

`str` is a **dynamically sized type** (DST) — its size is not known at compile time. The compiler cannot put `str` on the stack because it does not know how many bytes to reserve. But `&str` has a known, fixed size: two words (pointer + length). So you always use `&str`, never `str` alone.

**The lifetime of a `&str`:**

Because `&str` is a borrow, it must not outlive the memory it points to. A `&str` pointing into a `String`'s heap allocation is invalidated when that `String` is dropped. A `&str` pointing into the program binary (a string literal) has `'static` lifetime — it lives for the entire duration of the program.

---

### Concept: `String` — The Owned, Growable String

**What it is:** `String` is a heap-allocated, owned, growable sequence of UTF-8 bytes. It is the string type you create and modify at runtime.

**`String` in memory — exactly like `Vec<u8>`:**

```
String on the stack:                  Heap:
┌──────────────────────┐              ┌────────────────────────────┐
│ ptr  ────────────────────────────►  │ h  e  l  l  o             │
│ len: 5               │              │ (UTF-8 bytes)              │
│ capacity: 8          │              └────────────────────────────┘
└──────────────────────┘
```

A `String` owns its heap allocation. When it is dropped, the heap memory is freed. It can grow (like `Vec`) through reallocation.

**The relationship between `String` and `&str`:**

```
String owns the bytes.
&str borrows a view into bytes.

You can get a &str from a String (borrowing):
    let owned = String::from("hello");
    let view: &str = &owned;         // borrows all of owned
    let part: &str = &owned[1..4];   // borrows "ell" — a sub-slice

You cannot get a String from &str without allocating:
    let view: &str = "hello";
    let owned: String = view.to_string();   // allocates heap memory
    let owned: String = String::from(view); // same thing
```

**The rule for choosing between them:**

| Situation | Use |
|---|---|
| You own the string and may need to modify or grow it | `String` |
| You are reading/examining a string you do not own | `&str` |
| Function parameter — reading a string | `&str` (more flexible — accepts both `&String` and `"literals"`) |
| Function return — returning owned text | `String` |
| Storing a string in a struct long-term | `String` (structs need owned data) |
| Temporary view into an existing string | `&str` |

**The critical function parameter rule:**

```rust
// Less flexible — only accepts &String:
fn greet(name: &String) { println!("Hello, {}!", name); }

// More flexible — accepts &String, &str, and string literals:
fn greet(name: &str) { println!("Hello, {}!", name); }

// Why: &String automatically coerces to &str
// String literals are already &str
// So &str parameters work with everything
```

Always use `&str` for function parameters that only read a string. Use `String` only when the function needs to own or modify the string.

---

### Concept: UTF-8 — How Text Is Actually Stored

**What it is:** UTF-8 is a variable-width encoding for Unicode characters. Each character is encoded as 1 to 4 bytes, depending on the character.

**Why variable-width?** Unicode defines over 140,000 characters. A fixed-width encoding that can represent all of them needs at least 3 bytes per character (24 bits = 16 million possibilities). But most text in the world is ASCII — the 128 basic English characters, digits, and punctuation. UTF-8 is designed so that ASCII characters take exactly 1 byte, making English text compact, while still supporting every other writing system.

**The encoding:**

```
ASCII characters (U+0000 to U+007F):     1 byte
  'A' = 0x41 = 01000001

Latin, Greek, Cyrillic (U+0080–U+07FF):  2 bytes
  'é' = 0xC3 0xA9

Most common non-Latin scripts (U+0800–U+FFFF): 3 bytes
  '中' = 0xE4 0xB8 0xAD

Rare characters and emoji (U+10000+):    4 bytes
  '🦀' = 0xF0 0x9F 0xA6 0x80
```

**The critical consequence for Rust:**

Because characters are variable width, you cannot index a string by character position the way you index a `Vec`. `string[3]` is ambiguous — does it mean the 4th byte, or the 4th character? These are different things for non-ASCII text. Rust makes this explicit by refusing to allow `string[3]`:

```rust
let s = String::from("hello");
let c = s[0];    // COMPILE ERROR: cannot index String by integer
```

Instead, you use:
- `s.chars()` — an iterator over Unicode characters (`char` values)
- `s.bytes()` — an iterator over raw bytes (`u8` values)
- `&s[0..3]` — a byte-range slice (panics if the range splits a multi-byte character)
- `s.chars().nth(0)` — the first character as `Option<char>`

**Why Rust makes this harder than other languages:**

Python and JavaScript let you index strings by character position with `string[3]`. They hide the complexity by always iterating to the `n`th character — an O(n) operation — or by storing strings as fixed-width UTF-16 (which has its own problems with characters outside the Basic Multilingual Plane).

Rust forces you to be explicit. Indexing by byte range is O(1) but can panic if you split a multi-byte character. Indexing by character is O(n) but always correct. Rust will not silently choose for you — the cost is always visible.

For HTTP parsing, this is not a problem: HTTP headers are guaranteed to be ASCII. We will use byte-range slicing freely.

**Watch for:** `s.len()` returns the number of **bytes**, not the number of characters. For ASCII text (all HTTP headers), these are the same. For Unicode text, they differ: `"café".len()` is 5 (the 'é' takes 2 bytes), but `"café".chars().count()` is 4.

---

## Part 2 — Slices

### Concept: Slice — A View Into a Contiguous Sequence

**What it is:** A slice is a reference to a contiguous portion of a collection — a window into part of a `Vec`, array, or string without copying the data.

**What it hides:** A slice hides the ownership and allocation of the underlying data. A function that accepts a slice does not know or care whether the data is in a `Vec`, a fixed array, or a `String`. It just sees: "here are `n` elements starting at this address."

The invariant slices protect: **a slice always refers to valid, initialized data.** You cannot create a slice that goes out of bounds of its source, points to freed memory, or covers a partial multi-byte character (for `&str` slices on byte boundaries). The borrow checker ensures the source data outlives the slice.

**Slice syntax:**

```rust
let numbers = vec![10, 20, 30, 40, 50];

let all:   &[i32] = &numbers;         // slice of the whole Vec
let first: &[i32] = &numbers[0..3];   // [10, 20, 30] — indices 0, 1, 2
let last:  &[i32] = &numbers[2..];    // [30, 40, 50] — from index 2 to end
let mid:   &[i32] = &numbers[1..4];   // [20, 30, 40]
```

**The range syntax:**

| Syntax | Meaning |
|---|---|
| `[a..b]` | From index `a` up to but not including `b` |
| `[a..=b]` | From index `a` to `b` inclusive |
| `[a..]` | From index `a` to the end |
| `[..b]` | From the start to index `b` (not including) |
| `[..]` | The entire sequence |

**String slices are byte ranges:**

```rust
let s = String::from("hello world");
let hello: &str = &s[0..5];    // "hello" — bytes 0 through 4
let world: &str = &s[6..11];   // "world" — bytes 6 through 10
let all:   &str = &s[..];      // "hello world" — the whole string
```

**The universal slice type `&[T]`:**

`&str` is specifically `&[u8]` with UTF-8 validation. The general slice type `&[T]` works for any type `T`. Functions that accept `&[T]` work with `Vec<T>`, fixed arrays, and other slices:

```rust
fn sum(numbers: &[i32]) -> i32 {    // accepts Vec<i32>, [i32; N], and slices
    numbers.iter().sum()
}

let vec_data = vec![1, 2, 3, 4, 5];
let arr_data = [1, 2, 3, 4, 5];

sum(&vec_data);          // Vec<i32> coerces to &[i32]
sum(&arr_data);          // [i32; 5] coerces to &[i32]
sum(&vec_data[1..4]);    // slice of a Vec — also &[i32]
```

**Project Application:**

When the web server receives an HTTP request, it arrives as `&[u8]` — a slice of raw bytes. We parse it into `&str` slices (lines, headers, the request body) using byte-range indexing. No copying happens — the slices all point into the original byte buffer. This is efficient: a 4KB HTTP request is never duplicated in memory during parsing.

---

## Part 3 — String Methods

### Concept: Essential String Methods

**What they are:** Methods on `&str` and `String` for finding, splitting, trimming, and transforming text. These are the tools of text processing.

**The most important methods:**

**Finding and testing:**

```rust
let s = "Hello, world!";

s.contains("world")      // true — does s contain this substring?
s.starts_with("Hello")   // true — does s start with this?
s.ends_with("!")         // true — does s end with this?
s.find("world")          // Some(7) — byte index of first occurrence, or None
s.is_empty()             // false — is s zero bytes long?
```

**Splitting:**

```rust
let csv = "one,two,three,four";

// Split into an iterator of &str slices:
let parts: Vec<&str> = csv.split(',').collect();
// ["one", "two", "three", "four"]

// Split on whitespace (any amount):
let words: Vec<&str> = "  hello   world  ".split_whitespace().collect();
// ["hello", "world"]

// Split into exactly N parts (stops after N-1 splits):
let parts: Vec<&str> = "one:two:three:four".splitn(3, ':').collect();
// ["one", "two", "three:four"] — split at most twice

// Split into lines:
let lines: Vec<&str> = "line1\nline2\nline3".lines().collect();
// ["line1", "line2", "line3"]
```

**Trimming:**

```rust
"  hello  ".trim()          // "hello" — remove leading and trailing whitespace
"  hello  ".trim_start()    // "hello  " — leading only
"  hello  ".trim_end()      // "  hello" — trailing only
"xxhelloxx".trim_matches('x') // "hello" — remove specific character
```

**Transforming:**

```rust
"hello".to_uppercase()      // "HELLO"
"HELLO".to_lowercase()      // "hello"
"hello".replace("l", "r")   // "herro"
"hello".repeat(3)           // "hellohellohello"
```

**Converting:**

```rust
"42".parse::<i32>()                 // Ok(42)
"hello".parse::<i32>()              // Err(ParseIntError)
42_i32.to_string()                  // "42"
format!("value is {}", 42)          // "value is 42"
```

**Watch for:** `.split()` returns an iterator, not a `Vec`. You need `.collect()` to turn it into a `Vec`. This is intentional — if you only need the first few parts, you can take them without processing the rest: `csv.split(',').take(2)`.

---

## Part 4 — Building the Log Parser

### Concept: Parsing — Turning Raw Text Into Structured Data

**What it is:** Parsing is the process of taking raw text (or bytes) and extracting structured information from it according to a grammar — a set of rules describing what valid input looks like.

**The grammar for our log lines:**

```
<date> <time> <level> <message>
  ↑      ↑      ↑        ↑
  fixed  fixed  fixed    variable-length, rest of line
  10     8      5        everything after position 26
  chars  chars  chars
```

Example: `2024-01-15 10:23:45 INFO  Server started on port 8080`

This is a **positional format** — fields are at fixed byte offsets. HTTP requests use a different format — **delimiter-separated** — where fields are separated by specific characters (spaces, colons, `\r\n`). You will handle both in this series.

### Concept: Finite State Machine (FSM) — First Appearance

**What it is:** A finite state machine (FSM) is a computational model that is always in exactly one of a finite set of states. Events (inputs) cause transitions from one state to another. The behavior of the machine is determined by which state it is in when each event arrives.

**Why introduce it here?** Parsing is almost always implemented as a finite state machine. The parser starts in an initial state, reads characters or bytes one at a time, and transitions between states based on what it reads. When it reaches a terminal state, parsing is complete. You will implement an explicit FSM in Lab 13 for HTTP request parsing. This lab builds the intuition.

**Our log parser's states:**

```
WAITING        → reading characters before any field begins
IN_DATE        → reading the date field (10 chars)
IN_TIME        → reading the time field (8 chars)
IN_LEVEL       → reading the log level field
IN_MESSAGE     → reading everything to end of line
COMPLETE       → all fields extracted successfully
ERROR          → line is malformed
```

For this lab, the log format is simple enough that we can parse it with string methods rather than an explicit state machine. But the mental model — "what state am I in? what transitions are valid?" — is the same thinking you will apply in Lab 13.

---

### Step 1 — Create a New Project

```
cargo new log_parser
cd log_parser
```

Open `src/main.rs`. Replace everything:

```rust
fn main() {
    println!("Parsing log file...");
    println!();
}
```

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
Parsing log file...

```

One visible step, immediately runnable.

---

### Step 2 — Define the Data Structures

Add the structs and enums that represent a parsed log entry. Add above `main()`:

```rust
// ── Log level ─────────────────────────────────────────────────────────────────

#[derive(Debug, PartialEq, Clone)]
enum LogLevel {       // the severity of a log entry
    Debug,
    Info,
    Warn,
    Error,
}

impl LogLevel {
    fn from_str(s: &str) -> Option<LogLevel> {   // parse a &str into a LogLevel
                                                   // returns None if the string is not a known level
        match s.trim() {
            "DEBUG" => Some(LogLevel::Debug),
            "INFO"  => Some(LogLevel::Info),
            "WARN"  => Some(LogLevel::Warn),
            "ERROR" => Some(LogLevel::Error),
            _       => None,                       // unknown level — malformed line
        }
    }

    fn as_str(&self) -> &str {                    // convert back to a string — for display
        match self {
            LogLevel::Debug => "DEBUG",
            LogLevel::Info  => "INFO",
            LogLevel::Warn  => "WARN",
            LogLevel::Error => "ERROR",
        }
    }
}

// ── Log entry ─────────────────────────────────────────────────────────────────

#[derive(Debug)]
struct LogEntry {
    date:    String,      // "2024-01-15"
    time:    String,      // "10:23:45"
    level:   LogLevel,    // the parsed level enum
    message: String,      // "Server started on port 8080"
}
```

**Why `String` instead of `&str` in `LogEntry`?** The `LogEntry` struct needs to own its data — it will outlive the raw line it was parsed from. If the raw line is a local variable in the parsing function, its `&str` slices would become invalid when that function returns. Owned `String`s avoid this lifetime problem. We will explore this tradeoff in depth in Lab 10.

---

### SAVE AND TRY

```
cargo build
```

**You should see:** Clean compile, no errors. The types are defined but not yet used — Rust may show "unused" warnings. Expected.

---

### Step 3 — Write the Line Parser

Add the parsing function above `main()`:

```rust
fn parse_line(line: &str) -> Option<LogEntry> {
    // Expected format: "2024-01-15 10:23:45 INFO  Server started on port 8080"
    //                   0123456789 0123456789 0123456789...
    //                   ^date(10)  ^time(8)   ^level(5+)  ^message

    let line = line.trim();    // remove leading/trailing whitespace and newlines

    if line.is_empty() {
        return None;           // blank lines are not errors — just skip them
    }

    // Split on whitespace — produces an iterator of &str tokens
    let mut parts = line.splitn(4, ' ');
    // splitn(4, ' ') splits into at most 4 parts:
    // part 0: date
    // part 1: time
    // part 2: level
    // part 3: message (everything remaining, including spaces)

    // Extract each field — .next() advances the iterator and returns Option<&str>
    let date = match parts.next() {
        Some(d) => d.to_string(),  // convert &str to String — LogEntry owns its data
        None    => return None,    // malformed: no date field
    };

    let time = match parts.next() {
        Some(t) => t.to_string(),
        None    => return None,    // malformed: no time field
    };

    let level_str = match parts.next() {
        Some(l) => l,
        None    => return None,    // malformed: no level field
    };

    let level = match LogLevel::from_str(level_str) {
        Some(l) => l,
        None    => return None,    // malformed: unknown log level
    };

    let message = match parts.next() {
        Some(m) => m.trim().to_string(),   // trim any extra spaces from the message
        None    => return None,            // malformed: no message field
    };

    // All fields parsed successfully — construct and return the entry
    Some(LogEntry { date, time, level, message })
}
```

**The `.next()` pattern on iterators:**

`.splitn(4, ' ')` returns an iterator. Calling `.next()` on that iterator produces the next token wrapped in `Option<&str>`. When the iterator is exhausted, `.next()` returns `None`. This is the direct use of the `Iterator` trait from Lab 07 — but instead of calling `.collect()` to get everything at once, we pull one element at a time.

**Why `splitn` instead of `split`?**

`split(' ')` would split the message on every space — `"Server started on port 8080"` would become five separate tokens. `splitn(4, ' ')` stops after 3 splits, so the fourth "part" is everything remaining: `"Server started on port 8080"` as one piece. This is essential for parsing formats where the last field can contain spaces.

---

### SAVE AND TRY

Add a test call in `main()`:

```rust
fn main() {
    println!("Parsing log file...");
    println!();

    // Test with one line — verify the parser works
    let test_line = "2024-01-15 10:23:45 INFO  Server started on port 8080";
    match parse_line(test_line) {
        Some(entry) => println!("Parsed: {:?}", entry),
        None        => println!("Parse failed"),
    }
}
```

```
cargo run
```

**You should see:**

```
Parsing log file...

Parsed: LogEntry { date: "2024-01-15", time: "10:23:45", level: Info, message: "Server started on port 8080" }
```

**Change something:** Change `"INFO"` to `"NOTREAL"` in the test line. The parse should fail — `LogLevel::from_str` returns `None` for unknown levels. Confirm "Parse failed" prints. Change it back.

**Change something else:** Remove the time field from the test line — `"2024-01-15 INFO Server started"`. Parse fails because `splitn` cannot find all four fields. Change it back.

---

### Step 4 — Parse Multiple Lines and Collect Results

Replace `main()` with the full parser:

```rust
fn main() {
    println!("Parsing log file...");
    println!();

    // Sample log data — a &str literal containing multiple lines
    // In Lab 11, this will be read from an actual file
    let log_data = "\
2024-01-15 10:23:45 INFO  Server started on port 8080
2024-01-15 10:23:46 DEBUG Accepting connections
2024-01-15 10:24:01 ERROR Connection refused: timeout after 30s
2024-01-15 malformed line — missing fields
2024-01-15 10:24:15 INFO  Request: GET /index.html HTTP/1.1
";
    // The \ after the opening " prevents a leading newline in the literal
    // Each line is separated by \n — .lines() will split on these

    let mut entries: Vec<LogEntry> = Vec::new();  // successfully parsed entries
    let mut skipped: u32 = 0;                      // count of lines that failed to parse

    for line in log_data.lines() {                 // .lines() splits on \n, strips the newline
        match parse_line(line) {
            Some(entry) => {
                println!("[OK]   {} {} {}  {}",
                    entry.date,
                    entry.time,
                    entry.level.as_str(),
                    entry.message
                );
                entries.push(entry);               // store the parsed entry
            }
            None => {
                // Only print skip message for non-empty lines
                if !line.trim().is_empty() {
                    println!("[SKIP] {} — missing fields", line.trim());
                    skipped += 1;
                }
            }
        }
    }

    // ── Summary ───────────────────────────────────────────────────────────────

    println!();
    println!("Summary:");
    println!("  Total lines:     {}", entries.len() + skipped as usize);
    println!("  Parsed OK:       {}", entries.len());
    println!("  Skipped:         {}", skipped);

    // Count ERROR entries using an iterator filter
    let error_count = entries.iter()
        .filter(|e| e.level == LogLevel::Error)  // keep only Error entries
        .count();                                  // count how many remain
    println!("  ERROR entries:   {}", error_count);

    // Collect unique log levels seen — using a Vec and dedup
    let mut levels_seen: Vec<&str> = entries.iter()
        .map(|e| e.level.as_str())    // get the string name of each level
        .collect();
    levels_seen.sort();               // sort alphabetically
    levels_seen.dedup();              // remove consecutive duplicates (works correctly after sort)
    println!("  Levels seen: {}", levels_seen.join(", "));
}
```

**New concept — `.dedup()`:**

`.dedup()` removes consecutive duplicate elements from a `Vec`. It only removes *consecutive* duplicates — so you must sort first to group identical values together. `[A, B, A, C].dedup()` gives `[A, B, A, C]` (A appears twice, not consecutively). `[A, A, B, C].dedup()` gives `[A, B, C]`. Sort first, then dedup, to remove all duplicates.

**The `\` at the start of the string literal:**

A backslash immediately followed by a newline inside a string literal tells Rust to ignore that newline. Without it, the string would start with a blank line. This is how you write multi-line string literals without a leading empty line.

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
Parsing log file...

[OK]   2024-01-15 10:23:45 INFO  Server started on port 8080
[OK]   2024-01-15 10:23:46 DEBUG Accepting connections
[OK]   2024-01-15 10:24:01 ERROR Connection refused: timeout after 30s
[SKIP] 2024-01-15 malformed line — missing fields — missing fields
[OK]   2024-01-15 10:24:15 INFO  Request: GET /index.html HTTP/1.1

Summary:
  Total lines:     5
  Parsed OK:       4
  Skipped:         1
  ERROR entries:   1
  Levels seen: DEBUG, ERROR, INFO
```

**Change something:** Add a `WARN` line to `log_data`:

```
2024-01-15 10:24:30 WARN  Memory usage above 80%
```

Confirm it appears as `[OK]` and "WARN" appears in the "Levels seen" output.

**Change something else:** Change the `filter` for error count to filter for `LogLevel::Info` instead. Confirm the count updates to reflect INFO entries. Change it back to `LogLevel::Error`.

---

### Step 5 — Add a Message Search Function

Add a function that searches parsed entries using a closure — connecting Lab 08's higher-order functions to this lab's string processing:

```rust
fn find_entries<'a, F>(entries: &'a [LogEntry], predicate: F) -> Vec<&'a LogEntry>
//              ↑
//              'a is a lifetime parameter — entries and the returned references
//              must live at least as long as 'a
//              Full lifetimes are covered in Lab 10 — for now, just use this signature
where
    F: Fn(&LogEntry) -> bool,   // predicate: a closure that decides yes/no for each entry
{
    entries.iter()
        .filter(|e| predicate(e))   // call the predicate closure on each entry
        .collect()                   // collect the matching references
}
```

Add usage in `main()` after the summary:

```rust
// Find all entries whose message contains "GET" (HTTP requests):
let http_requests = find_entries(&entries, |e| e.message.contains("GET"));
println!();
println!("HTTP request entries: {}", http_requests.len());
for entry in &http_requests {
    println!("  {} {}", entry.time, entry.message);
}
```

---

### SAVE AND TRY

```
cargo run
```

**You should see** the summary followed by:

```
HTTP request entries: 1
  10:24:15 Request: GET /index.html HTTP/1.1
```

**Change something:** Change the predicate to `|e| e.level == LogLevel::Debug`. Confirms the closure works for level filtering too. Change it back.

---

## 🎯 Challenge: Parse the HTTP Request Line

**You know:** String splitting, `splitn`, `Option`, `match`, structs, enums.

**Task:** Write a function `parse_http_request_line(line: &str) -> Option<HttpRequest>` that parses an HTTP request line — the first line of every HTTP request.

HTTP request lines look like:
```
GET /index.html HTTP/1.1
POST /api/users HTTP/1.1
DELETE /api/users/42 HTTP/1.1
```

Format: `<METHOD> <PATH> <VERSION>` — three fields separated by spaces.

**Define these types:**

```rust
#[derive(Debug)]
enum HttpMethod {
    Get,
    Post,
    Put,
    Delete,
    Head,
}

#[derive(Debug)]
struct HttpRequest {
    method:  HttpMethod,
    path:    String,
    version: String,
}
```

**Requirements:**
- Return `None` for any malformed line (wrong number of fields, unknown method)
- The method must be one of: GET, POST, PUT, DELETE, HEAD
- The path must start with `/`
- The version must start with `HTTP/`

**Test lines to handle:**

```rust
"GET /index.html HTTP/1.1"        // → Some(HttpRequest { method: Get, ... })
"POST /api/users HTTP/1.1"        // → Some(...)
"BREW /coffee HTTP/1.1"           // → None (unknown method)
"GET"                             // → None (too few fields)
"GET index.html HTTP/1.1"         // → None (path missing leading /)
"GET /index.html GOPHER/1.0"      // → None (not HTTP)
```

Try for at least 15 minutes — this is the exact parsing logic your web server will use in Lab 13.

---

<details>
<summary>▶ Show Solution</summary>

```rust
#[derive(Debug)]
enum HttpMethod {
    Get,
    Post,
    Put,
    Delete,
    Head,
}

impl HttpMethod {
    fn from_str(s: &str) -> Option<HttpMethod> {
        match s {
            "GET"    => Some(HttpMethod::Get),
            "POST"   => Some(HttpMethod::Post),
            "PUT"    => Some(HttpMethod::Put),
            "DELETE" => Some(HttpMethod::Delete),
            "HEAD"   => Some(HttpMethod::Head),
            _        => None,
        }
    }
}

#[derive(Debug)]
struct HttpRequest {
    method:  HttpMethod,
    path:    String,
    version: String,
}

fn parse_http_request_line(line: &str) -> Option<HttpRequest> {
    let line = line.trim();

    // Split into exactly 3 parts — method, path, version
    let mut parts = line.splitn(3, ' ');

    let method_str = parts.next()?;   // ← the ? operator on Option
    //                            ↑
    //                            ? on Option: if None, return None from this function
    //                            equivalent to: match x { Some(v) => v, None => return None }
    //                            the ? operator works on both Result AND Option

    let path = parts.next()?;
    let version = parts.next()?;

    // Validate each field
    let method = HttpMethod::from_str(method_str)?;  // None if unknown method

    if !path.starts_with('/') {
        return None;   // path must begin with /
    }

    if !version.starts_with("HTTP/") {
        return None;   // version must be HTTP/something
    }

    Some(HttpRequest {
        method,
        path: path.to_string(),
        version: version.to_string(),
    })
}
```

Test in `main()`:

```rust
let test_requests = vec![
    "GET /index.html HTTP/1.1",
    "POST /api/users HTTP/1.1",
    "BREW /coffee HTTP/1.1",
    "GET",
    "GET index.html HTTP/1.1",
];

for line in &test_requests {
    match parse_http_request_line(line) {
        Some(req) => println!("OK:   {:?}", req),
        None      => println!("FAIL: {}", line),
    }
}
```

**Key insight:** The `?` operator works on `Option` as well as `Result` — when applied to `Option<T>`, if the value is `None`, it immediately returns `None` from the enclosing function. This is the same propagation behavior as `?` on `Result`. The pattern `parts.next()?` is idiomatic Rust for "get the next token or bail out." Every field extraction becomes one line. This is the exact style you will use in the HTTP parser in Lab 13.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Log lines parse correctly | `[OK]` appears for all 4 valid lines |
| Malformed line skipped | `[SKIP]` appears for the bad line |
| Error count correct | Summary shows `ERROR entries: 1` |
| Level deduplication works | Each level appears once in "Levels seen" |
| `find_entries` with closure works | HTTP request entry found by `contains("GET")` |
| Unknown log level returns None | Change a level to "NOTREAL" — line skipped |
| `splitn` keeps message intact | Message with spaces preserved as one field |
| `cargo build` zero warnings | Rename unused vars with `_` prefix if needed |

---

## Quick Check Answers

**1. What is the actual difference between `"hello"` and `String::from("hello")` in memory?**

`"hello"` is a string literal — a `&str` whose bytes are baked directly into the compiled program binary at compile time. It has `'static` lifetime — it exists for the entire duration of the program and is read-only. `String::from("hello")` allocates heap memory at runtime, copies the bytes into that allocation, and returns an owned `String` that manages that memory. The `String` can be modified, appended to, and will be freed when dropped. The `&str` cannot be modified. For data known at compile time that will never change, `&str` is cheaper — no allocation needed. For data built or received at runtime, `String` is necessary.

**2. Should a program load a 1GB log file into a String to search it?**

No. Loading 1GB into a `String` requires 1GB of RAM — the operating system may refuse, and even if it does not, the program will consume that memory for the entire duration of the search. The correct approach is to read the file line by line: allocate a small buffer, read one line, process it, reuse the buffer for the next line. The maximum memory used is proportional to the longest line, not the file size. In Lab 11 you will implement this with Rust's `BufReader`, which wraps a file and provides efficient line-by-line reading. The web server will use the same pattern: process HTTP request bytes as they arrive, without buffering the entire request.

**3. What steps turn raw HTTP bytes into something a program can act on?**

Four steps. First, receive the bytes from the network into a buffer — a `&[u8]` slice in memory. Second, validate that the bytes are valid UTF-8 (HTTP/1.1 headers are guaranteed ASCII, which is a subset of UTF-8). Third, find the structural delimiters — the `\r\n` that ends each header line, the `\r\n\r\n` that separates headers from the body. Fourth, extract and interpret each field — the method, path, and version from the first line; the header names and values from subsequent lines. Each of these steps is a string/slice operation you now know how to do. Lab 13 assembles them into a complete HTTP parser.
