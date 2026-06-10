# Rust Web Server — LAB 11 — Files, the Filesystem, and Reading Real Data

**Prerequisites:** LAB 01–10. You understand the OS, system calls, file descriptors, processes, strings, slices, and lifetimes.

**What this lab adds:**
- The filesystem as a tree — inodes, directories, and paths
- File permissions — read, write, execute and why they matter for a server
- Opening files in Rust — `File::open`, `File::create`, and the `OpenOptions` builder
- `BufReader` — efficient buffered I/O and why you never read files directly
- Writing files — creating, overwriting, and appending
- Structured I/O error handling — the full `io::ErrorKind` enum
- The log parser from Lab 09 reads a real file on disk instead of a hardcoded string
- Writing the parsed results to a new output file

**Time:** 4–5 hours

---

> **Quick Check — try to answer before reading further:**
>
> 1. If every `read()` system call has overhead (privilege switch, kernel validation), what is the problem with calling `read()` once per byte when reading a file?
> 2. A web server needs to serve files from a directory — like `/var/www/html/index.html`. What could go wrong if the server does not check file permissions before opening a file?
> 3. When a program fails to open a file, it might be because the file does not exist, or because permissions are denied, or because the disk is full. Why does the caller need to know which of these happened, rather than just "it failed"?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the log parser from Lab 09 reads from a real file and writes its parsed output to a new file:

```
$ cargo run -- sample.log output.log

Reading from: sample.log
─────────────────────────────────────
[OK]   2024-01-15 10:23:45 INFO  Server started on port 8080
[OK]   2024-01-15 10:23:46 DEBUG Accepting connections
[OK]   2024-01-15 10:24:01 ERROR Connection refused: timeout after 30s
[SKIP] 2024-01-15 malformed line — missing fields
[OK]   2024-01-15 10:24:15 INFO  Request: GET /index.html HTTP/1.1

Done. Writing to: output.log
Wrote 4 entries.

$ cat output.log
2024-01-15 10:23:45 [INFO]  Server started on port 8080
2024-01-15 10:23:46 [DEBUG] Accepting connections
2024-01-15 10:24:01 [ERROR] Connection refused: timeout after 30s
2024-01-15 10:24:15 [INFO]  Request: GET /index.html HTTP/1.1
```

The web server in Phase 3 uses this exact pattern: read from a socket (fd), parse the bytes, write a response back to the same socket.

---

## Part 1 — The Filesystem

### Concept: The Filesystem — A Tree of Files and Directories

**What it is:** A filesystem is the OS abstraction for persistent storage — the layer between your program and the raw sectors of a disk. It organizes data into a hierarchical tree of **files** (sequences of bytes) and **directories** (containers that hold files and other directories).

**The tree structure:**

```
/ (root — the top of the tree on Unix)
├── home/
│   └── user/
│       ├── projects/
│       │   └── log_parser/
│       └── .bashrc
├── var/
│   ├── log/
│   │   └── system.log
│   └── www/
│       └── html/
│           └── index.html
└── usr/
    └── bin/
        └── ls
```

Every file has a location in this tree, expressed as a **path** — a sequence of directory names separated by `/` (Unix) or `\` (Windows).

**Absolute vs relative paths:**

```
/home/user/projects/log_parser   ← absolute: starts from root (/)
projects/log_parser              ← relative: starts from the current working directory
./projects/log_parser            ← relative: ./ explicitly means "current directory"
../other_project                 ← relative: ../ means "parent directory"
```

When your program opens a file by path, the OS resolves the path through the directory tree to find the actual data. Relative paths are resolved relative to the process's current working directory — which you saw in Lab 10.

---

### Concept: Inode — What a File Actually Is

**What it is:** An inode (index node) is the actual data structure the filesystem uses to represent a file. A file's name is just a label in a directory — the inode holds the real metadata and points to the actual data blocks on disk.

**What an inode contains:**

```
Inode 47291:
  file type:    regular file
  permissions:  -rw-r--r--   (owner: read/write, group: read, others: read)
  owner:        user (UID 1000)
  group:        users (GID 1000)
  size:         4,096 bytes
  last modified: 2024-01-15 10:24:01
  data blocks:  [block 8421, block 8422]  ← where the actual bytes are on disk
```

**What a directory actually is:**

A directory is a special file that maps names to inode numbers:

```
Directory /home/user/projects/:
  "."         → inode 47280  (this directory itself)
  ".."        → inode 47250  (parent directory)
  "log_parser" → inode 47291
  "other_proj" → inode 47350
```

When you open `/home/user/projects/log_parser/sample.log`, the OS walks the path one component at a time: find `/`, find `home` in its directory, find `user` in that, find `projects`, find `log_parser`, find `sample.log` — each step reads a directory file to get the next inode number. Only the last lookup returns the file's inode.

**Hard links — why this matters:**

Because names and inodes are separate, multiple names can point to the same inode. These are called **hard links**. Deleting one name does not delete the data — it decrements the inode's link count. Only when the count reaches zero (no names remain) is the data freed. This is why on Unix, "deleting" a file does not immediately free the disk space if another process has it open — the inode's link count is 0 (no names) but the reference count is still 1 (one open fd). The data is freed when the last fd is closed. Your web server will rely on this behavior when serving files that are updated while a download is in progress.

---

### Concept: File Permissions — Who Can Do What

**What they are:** Every file and directory has permission bits that control which users can read, write, and execute it. The OS enforces these permissions when any program tries to access a file.

**The Unix permission model:**

```
-rw-r--r--  1  user  group  4096  Jan 15 10:24  sample.log
↑↑↑↑↑↑↑↑↑↑
│└────────┘
│  permission bits (10 characters)
│
└ file type: - = regular file, d = directory, l = symlink

Permission bits:
- │ rw- │ r-- │ r--
  │owner│group│others
  │     │     │
  │     │     └ others (everyone else): read only
  │     └ group members: read only
  └ file owner: read and write (no execute)
```

**The three permission types:**

| Bit | On a file | On a directory |
|---|---|---|
| `r` (read) | Can read the file's contents | Can list the directory's contents |
| `w` (write) | Can modify the file | Can create/delete files in the directory |
| `x` (execute) | Can run the file as a program | Can enter the directory (cd into it) |

**Why permissions matter for a web server:**

A web server runs as a specific user (often `www-data` or `nginx`). When it tries to open `/var/www/html/secret.txt`, the kernel checks: does the server's user have read permission on that file? If not, `open()` returns `EACCES` — permission denied.

This is the access control mechanism that prevents your web server from serving files it should not. If you configure permissions correctly — sensitive configuration files readable only by root, web files readable by the server user — the OS enforces the boundaries automatically.

---

## Part 2 — Opening Files in Rust

### Concept: `File` — Rust's Handle to an Open File

**What it is:** `std::fs::File` is a Rust struct that wraps a file descriptor. Creating a `File` opens the file (calls the `open()` system call) and gives you an fd. When `File` is dropped, it calls `close()` on the fd automatically — the same ownership/drop pattern from Lab 03.

**What it hides:** `File` hides the fd number, the `open()` system call, the error code handling, and the `close()` system call. You get a named, typed handle that automatically cleans up.

The invariant `File` protects: **the file is always closed exactly once, exactly when `File` goes out of scope.** You cannot forget to close a file. You cannot accidentally close it twice. The OS fd is tied to the `File`'s lifetime through Rust's ownership system.

**Opening for reading:**

```rust
use std::fs::File;

let file = File::open("sample.log");
// Returns Result<File, io::Error>
// Ok(file) if the file exists and is readable
// Err(e) if anything goes wrong
```

**Opening for writing (creates or truncates):**

```rust
let file = File::create("output.log");
// Creates the file if it does not exist
// Truncates (empties) it if it does exist
// Returns Result<File, io::Error>
```

**The `OpenOptions` builder — full control:**

```rust
use std::fs::OpenOptions;

let file = OpenOptions::new()
    .read(true)
    .write(true)
    .create(true)        // create if does not exist
    .append(true)        // write at the end instead of overwriting
    .open("logfile.log");
```

`OpenOptions` is the **Builder pattern** — a struct whose methods each configure one option and return `&mut self`, allowing chaining. This pattern is common in Rust for constructing complex objects. You will use it again when configuring the TCP listener in Lab 13.

---

### Concept: `io::Error` and `io::ErrorKind` — Structured I/O Errors

**What it is:** `io::Error` is the error type for all I/O operations. It wraps a system-level error code and provides `kind()` — a method that returns an `io::ErrorKind` enum describing what went wrong.

**The most important variants:**

```rust
use std::io;

match file_result {
    Err(e) => match e.kind() {
        io::ErrorKind::NotFound      => println!("file does not exist"),
        io::ErrorKind::PermissionDenied => println!("access denied"),
        io::ErrorKind::AlreadyExists => println!("file already exists"),
        io::ErrorKind::WouldBlock    => println!("operation would block"),
        io::ErrorKind::TimedOut      => println!("operation timed out"),
        io::ErrorKind::BrokenPipe    => println!("connection broken"),
        io::ErrorKind::ConnectionRefused => println!("connection refused"),
        other => println!("other error: {:?}", other),
    }
    Ok(file) => { /* use the file */ }
}
```

**Why `ErrorKind` matters for your web server:**

A web server must respond differently to different file errors:
- `NotFound` → HTTP 404 response
- `PermissionDenied` → HTTP 403 response
- A network `TimedOut` → log the error and close the connection
- `BrokenPipe` → the client disconnected mid-response — clean up silently

Treating all errors as "something went wrong" loses the information needed to respond correctly. `ErrorKind` is the structured error type that makes differentiated handling possible — exactly the same design as `GuessError` in Lab 05, now built into the standard library.

---

### Concept: `BufReader` — Why You Never Read Files Directly

**What it is:** `BufReader<R>` wraps any `Read` implementor (like `File`) and adds an in-memory buffer between the OS and your code. Instead of making one system call per byte or per line, `BufReader` reads a large chunk at once and serves your code from the buffer.

**What it hides:** `BufReader` hides the buffering logic — the buffer allocation, the refill strategy, the pointer tracking. You call `.lines()` or `.read_line()` and get clean results. The buffer management is invisible.

The invariant `BufReader` protects: **the number of system calls is minimized regardless of how you read.** Whether you read one byte at a time or one line at a time, the actual `read()` syscalls happen in large chunks. The access pattern your code uses is decoupled from the access pattern the OS sees.

**The cost of unbuffered reading:**

```
Unbuffered — reading a 10,000 line file one line at a time:
  10,000 read() system calls
  10,000 × ~500ns privilege switches = ~5ms syscall overhead

Buffered (BufReader with 8KB buffer) — same file:
  ~15 read() system calls (10,000 lines ÷ ~700 lines per 8KB buffer)
  15 × ~500ns = ~7.5μs syscall overhead

Speedup: roughly 650× for syscall overhead alone
```

**The canonical example:**

```rust
use std::fs::File;
use std::io::{BufReader, BufRead};

let file = File::open("sample.log")?;
let reader = BufReader::new(file);  // wrap the File in a BufReader

for line in reader.lines() {        // .lines() is provided by the BufRead trait
    let line = line?;               // each element is Result<String, io::Error>
    println!("{}", line);           //   the ? propagates any read error
}
```

**`BufReader::new(file)` takes ownership of `file`:** The `BufReader` now owns the `File`. When `BufReader` is dropped, it drops the `File`, which closes the fd. The ownership chain is: `BufReader` owns `File` owns fd. Drop propagates through the chain.

**The `BufRead` trait:**

`.lines()` is not a method on `File` — it is a method on the `BufRead` trait, which `BufReader` implements. This is the trait system from Lab 06 in action: `BufReader<File>` implements `BufRead`, so it gets all `BufRead` methods. `BufReader<TcpStream>` also implements `BufRead` — meaning the same `.lines()` method works for reading HTTP request lines from a network socket in Lab 13.

---

## Part 3 — Building the File-Reading Log Parser

### Step 1 — Copy and Extend the Log Parser

Create a new project:

```
cargo new file_log_parser
cd file_log_parser
```

Copy the log parser types from Lab 09 into `src/main.rs`. We start from the complete state:

```rust
use std::fs::File;
use std::io::{self, BufRead, BufReader, Write};
//            ↑
//            self brings io itself into scope (for io::Error, io::ErrorKind)
//            BufRead brings the .lines() method
//            BufReader is the buffered reader wrapper
//            Write brings .write_all() and .flush() for file writing

use std::env;

// ── Log types (carried over from Lab 09) ─────────────────────────────────────

#[derive(Debug, PartialEq, Clone)]
enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}

impl LogLevel {
    fn from_str(s: &str) -> Option<LogLevel> {
        match s.trim() {
            "DEBUG" => Some(LogLevel::Debug),
            "INFO"  => Some(LogLevel::Info),
            "WARN"  => Some(LogLevel::Warn),
            "ERROR" => Some(LogLevel::Error),
            _       => None,
        }
    }

    fn as_str(&self) -> &str {
        match self {
            LogLevel::Debug => "DEBUG",
            LogLevel::Info  => "INFO",
            LogLevel::Warn  => "WARN",
            LogLevel::Error => "ERROR",
        }
    }
}

#[derive(Debug)]
struct LogEntry {
    date:    String,
    time:    String,
    level:   LogLevel,
    message: String,
}

fn parse_line(line: &str) -> Option<LogEntry> {
    let line = line.trim();
    if line.is_empty() { return None; }

    let mut parts = line.splitn(4, ' ');

    let date    = parts.next()?.to_string();
    let time    = parts.next()?.to_string();
    let level   = LogLevel::from_str(parts.next()?)?;
    let message = parts.next()?.trim().to_string();

    Some(LogEntry { date, time, level, message })
}
```

**Note the `?` operator on `Option` here** — `parts.next()?` returns `None` from `parse_line` if any field is missing. You saw this in the challenge in Lab 09. It is now the standard pattern throughout.

---

### SAVE AND TRY

```
cargo build
```

No errors expected — the types compile cleanly.

---

### Step 2 — Create the Sample Log File

Create the file `sample.log` in the project root (next to `Cargo.toml`, not in `src/`):

```
2024-01-15 10:23:45 INFO  Server started on port 8080
2024-01-15 10:23:46 DEBUG Accepting connections
2024-01-15 10:24:01 ERROR Connection refused: timeout after 30s
2024-01-15 malformed line — missing fields
2024-01-15 10:24:15 INFO  Request: GET /index.html HTTP/1.1
2024-01-15 10:24:16 WARN  High memory usage: 87%
2024-01-15 10:24:20 INFO  Request: POST /api/data HTTP/1.1
2024-01-15 10:24:21 ERROR Database connection lost
```

**This is a real file on your filesystem.** Your program will open it through a system call. The bytes are stored in filesystem data blocks, managed by an inode, accessible through the path `sample.log` relative to your working directory.

---

### Step 3 — Write the File Reader Function

Add below `parse_line()`:

```rust
fn read_log_file(path: &str) -> Result<Vec<LogEntry>, io::Error> {
//                              ↑
//                              Returns Result — file operations can fail
//                              Ok(entries) on success, Err(io::Error) on failure

    let file = File::open(path)?;
    //                         ↑
    //                         ? on Result: if Err, return Err from this function
    //                         the caller (main) handles the error

    let reader = BufReader::new(file);   // wrap in BufReader for efficient line reading
    let mut entries = Vec::new();
    let mut skipped = 0u32;

    for line_result in reader.lines() {
        //             ↑
        //             .lines() produces Iterator<Item = Result<String, io::Error>>
        //             each iteration produces Result<String, io::Error>

        let line = line_result?;         // ? propagates read errors up to the caller
        //         ↑
        //         if reading a line fails (disk error, etc.), return the error

        match parse_line(&line) {
            Some(entry) => {
                println!("[OK]   {} {} {}  {}",
                    entry.date,
                    entry.time,
                    entry.level.as_str(),
                    entry.message
                );
                entries.push(entry);
            }
            None => {
                if !line.trim().is_empty() {
                    println!("[SKIP] {} — missing fields", line.trim());
                    skipped += 1;
                }
            }
        }
    }

    println!();
    println!("Parsed {} entries, skipped {}.", entries.len(), skipped);

    Ok(entries)  // return all successfully parsed entries
}
```

**The `?` chain in `read_log_file`:**

Two uses of `?` here. `File::open(path)?` propagates any file-open error. `line_result?` propagates any line-read error. Both return `io::Error` — which matches the function's return type `Result<Vec<LogEntry>, io::Error>`. The `?` operator checks the error types are compatible.

This is the real power of `?`: a chain of fallible operations written linearly, with all error propagation handled mechanically. The happy path is clear; the error path is implicit.

---

### Step 4 — Write the File Writer Function

Add below `read_log_file()`:

```rust
fn write_output_file(path: &str, entries: &[LogEntry]) -> Result<(), io::Error> {
//                                          ↑
//                                          &[LogEntry] — a slice: accepts Vec<LogEntry> or arrays
//                                          we only read the entries, not own them

    let mut file = File::create(path)?;
    //             ↑
    //             File::create truncates if exists, creates if not
    //             ? propagates creation errors

    for entry in entries {
        // Format each entry as a line in the output file
        let line = format!(
            "{} {} [{}] {}\n",   // \n is the line separator
            entry.date,
            entry.time,
            entry.level.as_str(),
            entry.message
        );

        file.write_all(line.as_bytes())?;
        //             ↑
        //             .write_all() writes ALL bytes — keeps writing until done
        //             (contrast with .write() which may write fewer bytes)
        //             .as_bytes() converts &str to &[u8] — the raw bytes
        //             ? propagates write errors (disk full, etc.)
    }

    file.flush()?;   // ensure all buffered bytes reach the OS
    //          ↑
    //          File has its own output buffer (for efficiency)
    //          flush() forces it to be sent to the OS
    //          Without flush(), the last bytes might be lost if the program crashes

    Ok(())  // success — return the unit type ()
            // () is Rust's "nothing" — used when a function succeeds but has no value to return
}
```

**`write_all` vs `write`:**

The `write()` system call may write fewer bytes than requested — this is not an error, just a partial write. The OS might have limited buffer space. `write_all()` is a Rust wrapper that calls `write()` in a loop until all bytes are written. Always use `write_all()` unless you specifically need partial-write behavior.

**`as_bytes()` — converting `&str` to `&[u8]`:**

`write_all()` accepts `&[u8]` — raw bytes. `as_bytes()` reinterprets a `&str` as the underlying byte slice. No allocation happens — this is a zero-cost view reinterpretation. Because Rust strings are UTF-8, the bytes are valid UTF-8 encoded text.

**`Ok(())` — returning nothing on success:**

`()` (pronounced "unit") is Rust's empty type — a tuple with no elements. It is used when a function needs to return something (to fit the `Result<T, E>` pattern) but has no meaningful value to return on success. `Result<(), io::Error>` means "either success (with nothing) or failure (with an error)."

---

### Step 5 — Wire Everything in `main()`

Replace the existing `main()`:

```rust
fn main() {
    // Read file paths from command-line arguments
    let args: Vec<String> = env::args().collect();

    let input_path = if args.len() >= 2 {
        args[1].as_str()          // use the first argument
    } else {
        "sample.log"              // default: look for sample.log in the working directory
    };

    let output_path = if args.len() >= 3 {
        args[2].as_str()          // use the second argument
    } else {
        "output.log"              // default output file
    };

    println!("Reading from: {}", input_path);
    println!("{}", "─".repeat(37));

    // Read and parse the log file
    let entries = match read_log_file(input_path) {
        Ok(entries) => entries,
        Err(e) => {
            // Differentiate the error for a useful message
            match e.kind() {
                io::ErrorKind::NotFound => {
                    eprintln!("Error: file '{}' not found.", input_path);
                    eprintln!("Create the file or provide a path as an argument:");
                    eprintln!("  cargo run -- path/to/file.log output.log");
                }
                io::ErrorKind::PermissionDenied => {
                    eprintln!("Error: permission denied reading '{}'.", input_path);
                }
                other => {
                    eprintln!("Error reading '{}': {:?}", input_path, other);
                }
            }
            std::process::exit(1);   // exit with code 1 — non-zero means failure
            //                       ↑
            //                       process::exit(code) terminates the program immediately
            //                       code 0 = success, non-zero = failure
            //                       shells use this to detect whether a program succeeded
        }
    };

    if entries.is_empty() {
        println!("No valid entries found.");
        return;
    }

    // Write the output file
    println!();
    println!("Writing to: {}", output_path);

    match write_output_file(output_path, &entries) {
        Ok(()) => println!("Wrote {} entries.", entries.len()),
        Err(e) => {
            match e.kind() {
                io::ErrorKind::PermissionDenied => {
                    eprintln!("Error: permission denied writing to '{}'.", output_path);
                }
                _ => {
                    eprintln!("Error writing '{}': {}", output_path, e);
                }
            }
            std::process::exit(1);
        }
    }
}
```

**`eprintln!` — printing to stderr:**

`eprintln!` is like `println!` but writes to stderr (fd 2) instead of stdout (fd 1). Error messages belong on stderr — they should appear even when stdout is redirected to a file, and tools that process program output should not see error messages mixed with data. Always use `eprintln!` for errors, warnings, and diagnostic messages.

**`process::exit(1)` — controlled termination:**

`process::exit(code)` terminates the program immediately with the given exit code. Exit code 0 means success. Any non-zero code means failure. Shells, CI systems, and parent processes read the exit code to know whether a program succeeded. Returning from `main()` normally gives exit code 0. Explicit `process::exit(1)` communicates failure to the caller.

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
Reading from: sample.log
─────────────────────────────────────
[OK]   2024-01-15 10:23:45 INFO  Server started on port 8080
[OK]   2024-01-15 10:23:46 DEBUG Accepting connections
[OK]   2024-01-15 10:24:01 ERROR Connection refused: timeout after 30s
[SKIP] 2024-01-15 malformed line — missing fields — missing fields
[OK]   2024-01-15 10:24:15 INFO  Request: GET /index.html HTTP/1.1
[OK]   2024-01-15 10:24:16 WARN  High memory usage: 87%
[OK]   2024-01-15 10:24:20 INFO  Request: POST /api/data HTTP/1.1
[OK]   2024-01-15 10:24:21 ERROR Database connection lost

Parsed 7 entries, skipped 1.

Writing to: output.log
Wrote 7 entries.
```

Then check the output file:

```
cat output.log
```

**You should see:**

```
2024-01-15 10:23:45 [INFO]  Server started on port 8080
2024-01-15 10:23:46 [DEBUG] Accepting connections
2024-01-15 10:24:01 [ERROR] Connection refused: timeout after 30s
2024-01-15 10:24:15 [INFO]  Request: GET /index.html HTTP/1.1
2024-01-15 10:24:16 [WARN]  High memory usage: 87%
2024-01-15 10:24:20 [INFO]  Request: POST /api/data HTTP/1.1
2024-01-15 10:24:21 [ERROR] Database connection lost
```

**Test the error handling:**

```
cargo run -- nonexistent.log output.log
```

**You should see:**

```
Reading from: nonexistent.log
─────────────────────────────────────
Error: file 'nonexistent.log' not found.
Create the file or provide a path as an argument:
  cargo run -- path/to/file.log output.log
```

And the exit code is 1 — verify with:

```bash
echo $?    # Unix/macOS
# or
echo %ERRORLEVEL%    # Windows
```

**Change something:** Add some malformed lines to `sample.log` — lines with only two fields, or empty lines. Verify they appear as `[SKIP]` or are silently skipped (empty lines). The parsed count in the output reflects the actual valid entries.

---

### Step 6 — Add File Append Mode

Add a function to append new entries to an existing output file without overwriting it:

```rust
fn append_to_file(path: &str, entries: &[LogEntry]) -> Result<usize, io::Error> {
//                                                     ↑
//                                                     returns count of entries written

    let mut file = OpenOptions::new()
        .create(true)         // create if does not exist
        .append(true)         // write at the end — do not truncate
        .open(path)?;

    for entry in entries {
        let line = format!(
            "{} {} [{}] {}\n",
            entry.date,
            entry.time,
            entry.level.as_str(),
            entry.message
        );
        file.write_all(line.as_bytes())?;
    }

    file.flush()?;

    Ok(entries.len())
}
```

Add `use std::fs::OpenOptions;` to the top imports.

Update `main()` to offer append mode when called with a third argument:

```rust
// After the write_output_file match, add:
println!();
println!("Appending ERROR entries only to: errors.log");

let error_entries: Vec<&LogEntry> = entries.iter()
    .filter(|e| e.level == LogLevel::Error)
    .collect();

match append_to_file("errors.log", &error_entries) {
    Ok(n)  => println!("Appended {} error entries.", n),
    Err(e) => eprintln!("Could not append errors: {}", e),
}
```

**`Vec<&LogEntry>` — a vector of references:**

`entries.iter()` produces `&LogEntry` references — we do not want to clone the entries, just select some of them. The filtered result is a `Vec<&LogEntry>` — a vector of references into the original `entries` vector. This works because `entries` lives in `main()` and outlives the `error_entries` variable.

---

### SAVE AND TRY

```
cargo run
```

After running, check `errors.log`:

```
cat errors.log
```

**You should see only the ERROR entries:**

```
2024-01-15 10:24:01 [ERROR] Connection refused: timeout after 30s
2024-01-15 10:24:21 [ERROR] Database connection lost
```

**Run it again.** The errors are appended — `errors.log` now has them twice. This is append mode — each run adds to the end without erasing previous content. Run it a third time and verify three copies are present.

**Change something:** Change `.append(true)` to `.truncate(true)` in `OpenOptions`. Now each run overwrites instead of appending. Verify only one copy of the errors appears after each run. Change back to `.append(true)`.

---

## 🎯 Challenge: Filter and Transform on Write

**You know:** File reading, file writing, iterators, closures, `BufReader`, `OpenOptions`.

**Task:** Add a function `write_filtered<F>(path: &str, entries: &[LogEntry], filter: F) -> Result<usize, io::Error>` where `F: Fn(&LogEntry) -> bool`. It writes only entries for which `filter` returns `true` to the given path.

Use it in `main()` to create three output files:
- `errors_only.log` — only `Error` entries
- `info_and_above.log` — `Info`, `Warn`, and `Error` entries (not `Debug`)
- `recent.log` — entries whose time is after "10:24:00" (string comparison works for ISO times)

**Hints:**
1. The signature is similar to `write_output_file` but with an extra `F: Fn(&LogEntry) -> bool` parameter
2. Inside, use `entries.iter().filter(|e| filter(e))` to get the matching entries
3. String comparison with `>` works correctly for ISO-format times: `"10:24:15" > "10:24:00"` is `true`

Try before revealing.

---

<details>
<summary>▶ Show Solution</summary>

```rust
fn write_filtered<F>(
    path:    &str,
    entries: &[LogEntry],
    filter:  F,
) -> Result<usize, io::Error>
where
    F: Fn(&LogEntry) -> bool,
{
    let mut file = File::create(path)?;
    let mut count = 0;

    for entry in entries.iter().filter(|e| filter(e)) {
        let line = format!(
            "{} {} [{}] {}\n",
            entry.date, entry.time,
            entry.level.as_str(), entry.message
        );
        file.write_all(line.as_bytes())?;
        count += 1;
    }

    file.flush()?;
    Ok(count)
}
```

In `main()`:

```rust
// Errors only:
if let Ok(n) = write_filtered("errors_only.log", &entries, |e| {
    e.level == LogLevel::Error
}) {
    println!("errors_only.log: {} entries", n);
}

// Info and above (not Debug):
if let Ok(n) = write_filtered("info_and_above.log", &entries, |e| {
    e.level != LogLevel::Debug
}) {
    println!("info_and_above.log: {} entries", n);
}

// After 10:24:00:
if let Ok(n) = write_filtered("recent.log", &entries, |e| {
    e.time.as_str() > "10:24:00"
}) {
    println!("recent.log: {} entries", n);
}
```

**Key insight:** `write_filtered` is a higher-order function — it takes a closure that decides which entries to write. This is the same Strategy pattern from Lab 08, now applied to file I/O. The function provides the mechanism (open file, format entries, write bytes); the closure provides the selection logic. In the web server, this pattern appears as middleware: the server provides the request/response mechanism, each middleware provides a closure that decides how to handle or modify the request. The same function, with a different closure, produces completely different behavior.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `sample.log` file read correctly | 7 entries parsed, 1 skipped |
| `output.log` file written | `cat output.log` shows 7 formatted entries |
| `NotFound` error handled | Run with nonexistent file — clear error message |
| Exit code 1 on error | `echo $?` after failed run shows `1` |
| `eprintln!` goes to stderr | Redirect stdout to file — errors still visible |
| Append mode works | `errors.log` grows with each run |
| ERROR entries filtered correctly | `errors.log` has exactly 2 entries |
| `write_filtered` with closures | Three output files with different entry sets |
| `BufReader` used for reading | `.lines()` iterator used — no direct `read()` call |
| `write_all` used for writing | Not `.write()` — full bytes guaranteed written |
| `flush()` called after writing | Files are complete when program exits |

---

## Quick Check Answers

**1. What is the problem with calling `read()` once per byte when reading a file?**

Each `read()` call is a system call — it requires a CPU privilege switch from Ring 3 to Ring 0, validation by the kernel, and a switch back. This overhead costs roughly 100–1000 nanoseconds per call. Reading a 1MB file one byte at a time requires about 1,000,000 system calls — potentially 1 second of pure syscall overhead, even though the actual data transfer takes microseconds. `BufReader` amortizes this cost: it reads 8KB at a time (about 8000 bytes per syscall), then serves your code from the buffer. Reading the same 1MB file requires about 125 syscalls instead of 1,000,000 — a roughly 8000× reduction in syscall overhead. This is the same buffering principle as `io::stdout().flush()` — accumulate data, send in bulk.

**2. What could go wrong if a web server opens files without checking permissions?**

Several categories of failure. First, information disclosure: if the server serves any file the OS allows it to read, an attacker could request `/etc/passwd`, configuration files with database passwords, or TLS private keys — files the server process can read but should never serve publicly. Second, directory traversal: a request for `GET /../../../etc/passwd HTTP/1.1` might resolve outside the intended web root if the path is not properly validated. Third, serving executable files as data: a request for the server binary itself could expose the compiled code. The correct approach: resolve the requested path, verify it is inside the web root directory, then check that it is a regular file (not a directory or device). The OS permission system provides one layer of defense; explicit path validation provides another. Defense in depth — multiple independent checks — is the correct security model.

**3. Why does a caller need to know which specific I/O error occurred?**

Because different errors require different responses. `NotFound` means the resource does not exist — the correct action for a web server is to return HTTP 404. `PermissionDenied` means the resource exists but the server is not allowed to read it — the correct response is HTTP 403. A disk full error (`StorageFull`) means the server cannot write logs — it should alert the operator, not return an error to the client. `BrokenPipe` means the client disconnected — the server should clean up silently, not log an error. `TimedOut` suggests the resource is temporarily unavailable — the server might retry or return HTTP 503. Treating all errors as "something failed" forces the server to respond identically to all failures, producing incorrect HTTP status codes and losing diagnostic information. The structured `io::ErrorKind` enum is exactly the `GuessError` pattern from Lab 05 applied to the standard library — error variants carry the context needed to respond correctly.
