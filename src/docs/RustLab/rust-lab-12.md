# Rust Web Server — LAB 12 — Processes, Pipes, and the Bridge to Phase 3

**Prerequisites:** LAB 01–11. You understand the OS, system calls, file descriptors, files, and the filesystem. You have built a file-reading log parser that handles real I/O errors.

**What this lab adds:**
- What spawning a process means at the OS level — `fork` and `exec`
- Pipes — the OS mechanism for connecting processes, and why they are file descriptors
- Rust's `Command` API — spawning child processes, capturing their output, and piping data
- Process exit codes — the universal language of success and failure between programs
- Standard streams as plumbing — composing programs together
- Signal concepts — how the OS tells a process to stop
- Environment variable inheritance — how child processes get their configuration
- A process pipeline builder: a Rust program that chains external commands the same way a shell does
- The mental model for Phase 3 — a TCP connection is a socket, a socket is a file descriptor, and everything you know about I/O already applies

**Time:** 4–6 hours

---

> **Quick Check — try to answer before reading further:**
>
> 1. When you type `cargo run` in a terminal, a new program starts running. What do you think actually happens at the OS level to make that happen — the shell is already running, so where does the new process come from?
> 2. In a Unix shell you can write `ls | grep .rs | wc -l` to count Rust files. Three separate programs run and their output flows through the chain. What mechanism do you think connects them?
> 3. The web server you are building will handle multiple clients simultaneously. Each client needs its own connection. What do you think the options are for handling them — does one program have to handle all of them, or can the work be divided?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, a Rust program that behaves like a miniature shell — spawning external programs, piping their output, and composing them into a pipeline:

```
$ cargo run

=== System Information Pipeline ===

Step 1: List files in current directory
  Found 8 items

Step 2: Filter for Rust source files
  cargo.toml
  src/main.rs

Step 3: Count lines in each file
  src/main.rs: 187 lines

Step 4: Run git log (if available)
  Last 3 commits:
    a1b2c3d Add process pipeline builder
    e4f5g6h Add file log parser
    i7j8k9l Add process inspector

=== Pipeline complete ===
```

Every step spawns a real child process, captures its output, and passes it to the next step. This is the same mechanism that web servers use to spawn worker processes for handling concurrent connections.

---

## Part 1 — How Processes Are Born

### Concept: `fork` — Duplicating a Process

**What it is:** `fork()` is a system call that creates an exact copy of the calling process. The original is called the **parent**; the copy is called the **child**. After `fork()`, both processes continue running from the same point — but they are completely independent, with separate memory spaces.

**What `fork()` produces:**

```
Before fork():
  Parent process (PID 1000):
    memory: [code, stack, heap, fd table]
    executing: at the fork() call

After fork():
  Parent process (PID 1000):        Child process (PID 1001):
    memory: [code, stack, heap]        memory: [copy of parent's memory]
    fd table: [0, 1, 2, ...]           fd table: [copy of parent's fds]
    fork() returns: 1001 (child PID)   fork() returns: 0 (magic value — "I am the child")

The return value is the only difference between parent and child.
Parent gets the child's PID. Child gets 0.
This is how both processes know which role they are playing.
```

**Copy-on-write — why forking is fast:**

Actually duplicating all of a process's memory would be expensive — a process with 500MB of heap would require copying 500MB. Modern OS kernels use **copy-on-write** (COW): the child initially shares the parent's physical memory pages, marked read-only. Only when either process writes to a page does the kernel make a separate copy of that page. If the child immediately calls `exec()` without touching much memory, almost nothing is copied — fork is nearly instant.

**Why `fork` is the foundation of all process creation on Unix:**

On Unix-like systems (Linux, macOS), every process is born from a `fork()`. When you type `ls` in a shell, the shell calls `fork()` to create a child process, then the child calls `exec()` to replace itself with `ls`. The shell itself started as a fork of the login process. All the way up, every process traces its lineage to process 1 (the init process, which the kernel creates directly at boot).

**Windows is different:** Windows does not use `fork()`. It uses `CreateProcess()` — a single call that creates a new process from an executable file directly. Rust's `Command` API abstracts over both: you use `Command::new("ls")` and Rust handles the platform difference.

---

### Concept: `exec` — Replacing a Process Image

**What it is:** `exec()` is a system call that replaces the current process's code, stack, and heap with a new program loaded from an executable file. The PID stays the same; everything else is replaced.

**The `fork` + `exec` pattern — how every program launch works on Unix:**

```
Shell process running bash:
  1. User types: ls -la
  2. Shell calls fork()
  3. Child process (copy of shell) begins
  4. Child calls exec("/bin/ls", ["-la"])
  5. Child's code/memory replaced with ls's code
  6. ls runs, outputs files, exits
  7. Parent (shell) detects child exited
  8. Shell prints prompt again, waits for next command
```

**Why separate fork and exec?** Between `fork()` and `exec()`, the child can configure its environment: close file descriptors it should not inherit, redirect stdin/stdout to pipes, set environment variables. This window between fork and exec is where all process plumbing happens. A single `CreateProcess()` call (Windows style) requires passing all this configuration upfront — more complex API, less flexible composition.

---

### Concept: Process Exit Code — The Return Value of a Program

**What it is:** When a process finishes, it calls `exit(code)` — a system call that terminates the process and reports an integer exit code to the parent process.

**The convention:**
- **0** — success. The program completed its job without errors.
- **Non-zero** — failure. Different non-zero values mean different kinds of failure (by convention, but not enforced by the OS).

**How the parent reads the exit code:**

After spawning a child, the parent can call `wait()` — a system call that blocks until the child exits and returns the child's exit code. This is how `cargo run` knows whether your program crashed.

**Exit codes in shell scripts:**

```bash
cargo build
if [ $? -eq 0 ]; then    # $? is the exit code of the last command
    echo "Build succeeded"
else
    echo "Build failed"
fi
```

You set the exit code in Rust with `process::exit(1)` — which you used in Lab 11 for error conditions. `main()` returning normally produces exit code 0.

---

### Concept: Pipe — A File Descriptor Connecting Two Processes

**What it is:** A pipe is a kernel-managed, unidirectional channel connecting two file descriptors. Data written to one end appears at the other end. The two ends are just file descriptors — one for writing, one for reading.

**What it hides:** A pipe hides the buffer management, the blocking/waking coordination, and the kernel synchronization needed to safely pass data between processes. You write to fd 4; data appears at fd 3 in another process. The kernel manages everything in between.

The invariant pipes protect: **data flows in one direction only, in order, without loss.** What goes into the write end comes out the read end in the exact same order. The kernel buffers the data if the reader is slow. If the buffer fills up, the writer blocks until the reader catches up. This backpressure mechanism prevents one process from overwhelming another.

**The pipe as plumbing:**

```
ls process:            pipe (kernel buffer):     grep process:
  stdout (fd 1) ──────►  [bytes flow here]  ──────► stdin (fd 0)
```

The shell creates the pipe before forking either child. After forking, it configures:
- `ls`'s fd 1 (stdout) to be the write end of the pipe
- `grep`'s fd 0 (stdin) to be the read end of the pipe

Both children are then exec'd. `ls` writes to its stdout (which goes into the pipe). `grep` reads from its stdin (which comes from the pipe). Neither process knows about the other — they just use their standard fds.

**Pipe closure and EOF:**

When `ls` finishes and its process exits, the write end of the pipe is closed (all fds are closed on process exit). `grep` reads until it gets EOF — which happens when the write end closes. `grep` then knows `ls` has no more output, finishes its own processing, and exits. This automatic EOF propagation is what makes pipelines self-terminating.

---

## Part 2 — Rust's `Command` API

### Concept: `std::process::Command` — Spawning Child Processes

**What it is:** `Command` is Rust's builder for spawning child processes. It encapsulates the platform-specific process creation machinery behind a clean, unified API.

**What it hides:** `Command` hides `fork()` and `exec()` on Unix, `CreateProcess()` on Windows, handle management, pipe creation, fd duplication, and platform-specific path resolution. You write `Command::new("ls")` and get a running process.

The invariant `Command` protects: **the child process is always either running, completed, or errored — never in an undefined state.** `Command::spawn()` returns `Result<Child, io::Error>` — either a handle to a running child or an error describing why the process could not start. You cannot accidentally have a half-created process.

**The three ways to run a command:**

```rust
use std::process::Command;

// 1. Run and wait — captures nothing, inherits parent's stdio:
let status = Command::new("ls")
    .arg("-la")
    .status()?;           // blocks until done, returns ExitStatus
println!("exited with: {}", status);

// 2. Run and capture output — captures stdout and stderr as Vec<u8>:
let output = Command::new("ls")
    .arg("-la")
    .output()?;           // blocks until done, returns Output { stdout, stderr, status }
let text = String::from_utf8_lossy(&output.stdout);  // convert bytes to string
println!("{}", text);

// 3. Spawn and interact — returns immediately with a Child handle:
let mut child = Command::new("cat")
    .stdin(Stdio::piped())   // connect stdin to a pipe
    .stdout(Stdio::piped())  // connect stdout to a pipe
    .spawn()?;               // start immediately, do not wait
// now communicate with child through child.stdin and child.stdout
let status = child.wait()?;  // wait for it to finish
```

**The builder pattern:** Each `.arg()`, `.env()`, `.stdin()`, `.stdout()` call configures the command and returns `&mut Command`, allowing chaining. The same Builder pattern as `OpenOptions` in Lab 11 and the `GameState::new_with_options` discussion in Lab 04.

---

### Concept: `Stdio` — Configuring a Child's Standard Streams

**What it is:** `Stdio` is an enum that controls how a child process's stdin, stdout, or stderr is connected.

**The variants:**

| Variant | What it does |
|---|---|
| `Stdio::inherit()` | Child shares the parent's stream — output appears on your terminal |
| `Stdio::null()` | Stream is connected to `/dev/null` — output is discarded |
| `Stdio::piped()` | Stream is connected to a pipe — parent can read/write through it |
| `Stdio::from(file)` | Stream is connected to an open `File` |

**Why this matters for your web server:**

A web server that spawns a CGI script (a program that generates HTTP responses) must:
- Connect the script's stdin to the HTTP request body (a pipe from the socket)
- Connect the script's stdout to the HTTP response (a pipe to the socket)
- Connect the script's stderr to the server's log file

All of this is `Stdio` configuration. The OS plumbing is the same mechanism as `ls | grep` — just with network sockets instead of terminal output.

---

### Concept: `String::from_utf8_lossy` — Safe Bytes-to-String Conversion

**What it is:** A function that converts `&[u8]` (raw bytes) to a string, replacing any invalid UTF-8 sequences with the Unicode replacement character `'?'` rather than returning an error.

**Why it exists:**

External programs may output bytes that are not valid UTF-8 — legacy encodings, binary data mixed with text, or platform-specific encodings. `String::from_utf8(bytes)` returns `Result` and fails on invalid UTF-8. `String::from_utf8_lossy(bytes)` always succeeds, silently replacing bad bytes with `?`. For reading command output that you know should be text, `lossy` is usually the right choice.

```rust
let output = Command::new("ls").output()?;
let text = String::from_utf8_lossy(&output.stdout);
// text is a Cow<str> — either borrowed (if all bytes were valid UTF-8)
//                      or owned (if replacement was needed)
// either way, you can use it like a &str
```

**`Cow<str>` — Clone on Write:**

`from_utf8_lossy` returns `Cow<'_, str>` — a **Clone on Write** smart pointer. It is either a borrowed `&str` (if the bytes were valid UTF-8 — no allocation needed) or an owned `String` (if bytes had to be replaced — new allocation required). `Cow` is Rust's way of deferring allocation until it is actually necessary. You can use a `Cow<str>` anywhere you would use `&str` — the compiler handles the dereference.

---

## Part 3 — Building the Process Pipeline

### Step 1 — Create the Project

```
cargo new process_pipeline
cd process_pipeline
```

Open `src/main.rs`. Replace everything:

```rust
use std::process::{Command, Stdio};
use std::io::{self, Write};

fn main() {
    println!("=== System Information Pipeline ===");
    println!();
}
```

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
=== System Information Pipeline ===

```

---

### Step 2 — Write a Helper That Runs a Command and Returns Its Output

Add above `main()`:

```rust
/// Run a command and return its stdout as a String.
/// Returns Err if the command could not be started or exited with failure.
fn run_command(program: &str, args: &[&str]) -> Result<String, String> {
//                                    ↑
//                                    &[&str] — a slice of string slices
//                                    accepts any slice of &str: arrays, Vec references, etc.

    let output = Command::new(program)
        .args(args)                        // .args() accepts any iterator of &str
        .stderr(Stdio::inherit())          // let error messages appear on our terminal
        .output()                          // run and capture stdout, wait for completion
        .map_err(|e| format!("Could not run '{}': {}", program, e))?;
        //        ↑
        //        .map_err() transforms the error type
        //        io::Error → String (our error type for this function)
        //        the ? then propagates the String error

    if !output.status.success() {          // .success() returns true if exit code was 0
        return Err(format!(
            "'{}' failed with exit code: {}",
            program,
            output.status.code()           // .code() returns Option<i32> — the exit code
                .map(|c| c.to_string())    // convert i32 to String if present
                .unwrap_or_else(|| "unknown".to_string()) // or "unknown" if terminated by signal
        ));
    }

    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
    //                                          ↑
    //                                          .into_owned() converts Cow<str> to String
    //                                          — always gives us an owned value to return
}
```

**`output.status.code()` returns `Option<i32>`:**

On Unix, a process can be terminated by a signal (like SIGKILL when the OS kills it for using too much memory) rather than by calling `exit()`. In that case, there is no exit code — `status.code()` returns `None`. `.unwrap_or_else(|| "unknown".to_string())` provides a fallback for this case. You will handle signals more carefully in Phase 4.

**`.map_err()` — transforming error types:**

`Command::output()` returns `Result<Output, io::Error>`. Our function returns `Result<String, String>`. We need to convert the `io::Error` into a `String` error. `.map_err(|e| format!(...))` applies a closure to the `Err` variant — leaving `Ok` unchanged, transforming `Err(io::Error)` into `Err(String)`. Then `?` propagates the now-compatible error type.

---

### SAVE AND TRY

Add a test call in `main()`:

```rust
fn main() {
    println!("=== System Information Pipeline ===");
    println!();

    // Test the helper with a simple command
    match run_command("echo", &["Hello from a child process!"]) {
        Ok(output)  => println!("echo output: {}", output.trim()),
        Err(e)      => eprintln!("Error: {}", e),
    }
}
```

```
cargo run
```

**You should see:**

```
=== System Information Pipeline ===

echo output: Hello from a child process!
```

`echo` is an external program. Your Rust process spawned a child, the child ran `echo`, the child wrote to its stdout (which was captured by the pipe), the child exited, your process read the captured output from the pipe buffer and printed it. The full fork/exec/pipe/wait cycle happened behind `run_command`.

**Change something:** Change `"echo"` to `"nonexistent_command"`. You should see `"Could not run 'nonexistent_command': ..."`. The `map_err` gave us a clear error message. Change it back.

---

### Step 3 — List Files in the Current Directory

Replace the test call in `main()` with the first pipeline step:

```rust
fn main() {
    println!("=== System Information Pipeline ===");
    println!();

    // Step 1: List files in the current directory
    println!("Step 1: List files in current directory");

    let ls_output = run_command_cross_platform();
    //              ↑ we will define this below — handles Windows vs Unix

    match ls_output {
        Ok(output) => {
            let lines: Vec<&str> = output
                .lines()
                .filter(|l| !l.is_empty())
                .collect();
            println!("  Found {} items", lines.len());
            for line in &lines {
                println!("  {}", line);
            }
        }
        Err(e) => eprintln!("  Error: {}", e),
    }

    println!();
}
```

Add the cross-platform listing function:

```rust
fn run_command_cross_platform() -> Result<String, String> {
    // Different platforms have different directory listing commands
    #[cfg(target_os = "windows")]               // ← conditional compilation
    {                                            //   this block only compiles on Windows
        run_command("cmd", &["/C", "dir", "/B"])
    }

    #[cfg(not(target_os = "windows"))]          // ← this block compiles on everything else
    {
        run_command("ls", &[])
    }
}
```

**`#[cfg(...)]` — Conditional Compilation:**

`#[cfg(target_os = "windows")]` is a compile-time attribute that includes the following item only when compiling for Windows. `#[cfg(not(target_os = "windows"))]` is the complement. The Rust compiler evaluates these conditions before generating code — code that does not match the current target is completely excluded from the binary. This is how `std` provides different implementations for different OS — one Rust file, multiple platform-specific blocks.

Other useful cfg conditions:
- `target_os = "linux"`, `target_os = "macos"`, `target_os = "windows"`
- `target_arch = "x86_64"`, `target_arch = "aarch64"`
- `debug_assertions` — true in debug builds, false in release builds
- `feature = "some_feature"` — enabled by `Cargo.toml` feature flags

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
=== System Information Pipeline ===

Step 1: List files in current directory
  Found 3 items
  Cargo.lock
  Cargo.toml
  src

```

(Your listing may differ. The key: a real external command ran, its output was captured, and your Rust code processed the lines.)

---

### Step 4 — Filter and Count Lines With Piped Input

Now demonstrate piping — sending the output of one command as the input of another:

```rust
fn pipe_commands(
    first_program:  &str,
    first_args:     &[&str],
    second_program: &str,
    second_args:    &[&str],
) -> Result<String, String> {

    // Spawn the first command with its stdout connected to a pipe
    let mut first = Command::new(first_program)
        .args(first_args)
        .stdout(Stdio::piped())         // capture stdout — will feed to second command
        .stderr(Stdio::inherit())
        .spawn()
        .map_err(|e| format!("Could not start '{}': {}", first_program, e))?;

    // Take ownership of the first command's stdout pipe
    let first_stdout = first.stdout.take()
        //                      ↑
        //                      .take() removes the Option<ChildStdout> from the Child struct
        //                      giving us ownership — necessary because we need to give it
        //                      to the second command
        .ok_or_else(|| "Could not get stdout of first command".to_string())?;
        //  ↑
        //  .ok_or_else() converts Option to Result — None becomes Err with our message

    // Spawn the second command, feeding the first's stdout as its stdin
    let second = Command::new(second_program)
        .args(second_args)
        .stdin(Stdio::from(first_stdout))  // connect first's stdout to second's stdin
        //                 ↑
        //                 Stdio::from() accepts anything that can be converted to a stdio
        //                 ChildStdout implements this — it is a file descriptor under the hood
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .spawn()
        .map_err(|e| format!("Could not start '{}': {}", second_program, e))?;

    // Wait for the first command to finish
    first.wait()
        .map_err(|e| format!("Error waiting for '{}': {}", first_program, e))?;

    // Wait for the second command and collect its output
    let output = second.wait_with_output()
        //              ↑
        //              .wait_with_output() waits AND collects stdout into Vec<u8>
        .map_err(|e| format!("Error waiting for '{}': {}", second_program, e))?;

    if !output.status.success() {
        return Err(format!("'{}' failed", second_program));
    }

    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}
```

**Why `first.stdout.take()`?**

`Child.stdout` is `Option<ChildStdout>`. We need to take ownership of the `ChildStdout` to give it to the second `Command` via `Stdio::from()`. `.take()` on `Option<T>` replaces the value with `None` and returns the original `Some(T)` — it moves the value out of the struct without consuming the struct. After `.take()`, `first.stdout` is `None`, but `first` itself still exists so we can call `first.wait()` on it.

**The pipe lifecycle:**

```
first  ──[stdout pipe write end]──► [kernel buffer] ──[pipe read end]──► second stdin
  │                                                                              │
  └──[first process writes its output]                   [second process reads]──┘

When first exits:
  write end of pipe closes → second's read gets EOF → second finishes → we collect output
```

Add to `main()`:

```rust
// Step 2: Count Rust source files using a pipeline
println!("Step 2: Count files containing 'Cargo'");

#[cfg(not(target_os = "windows"))]
{
    match pipe_commands("ls", &[], "grep", &["Cargo"]) {
        Ok(output) => {
            let matches: Vec<&str> = output.lines().filter(|l| !l.is_empty()).collect();
            println!("  Found {} matching items:", matches.len());
            for m in &matches {
                println!("  {}", m);
            }
        }
        Err(e) => eprintln!("  Error: {}", e),
    }
}

#[cfg(target_os = "windows")]
println!("  (pipe demo skipped on Windows — use PowerShell pipelines instead)");

println!();
```

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
Step 2: Count files containing 'Cargo'
  Found 2 matching items:
  Cargo.lock
  Cargo.toml

```

Two real OS processes ran. Their connection was a kernel pipe — a file descriptor on each end, managed by the kernel. Your Rust program was the orchestrator, not a participant in the data flow.

**Change something:** Change `"grep"` to `"grep"` and `&["Cargo"]` to `&["src"]`. Now it filters for entries containing "src". Change it back.

---

### Step 5 — Capture stderr Separately

Add a function demonstrating stderr capture:

```rust
fn run_capturing_both(program: &str, args: &[&str]) -> Result<(String, String), String> {
//                                                           ↑
//                                                           returns a tuple: (stdout, stderr)

    let output = Command::new(program)
        .args(args)
        .stdout(Stdio::piped())       // capture stdout
        .stderr(Stdio::piped())       // capture stderr separately
        .output()
        .map_err(|e| format!("Could not run '{}': {}", program, e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).into_owned();
    let stderr = String::from_utf8_lossy(&output.stderr).into_owned();

    Ok((stdout, stderr))
}
```

Add to `main()`:

```rust
// Step 3: Demonstrate stderr capture
println!("Step 3: Separate stdout and stderr");

// cargo --version writes its version to stdout
// an invalid cargo command writes errors to stderr
match run_capturing_both("cargo", &["--version"]) {
    Ok((out, err)) => {
        if !out.trim().is_empty() {
            println!("  stdout: {}", out.trim());
        }
        if !err.trim().is_empty() {
            println!("  stderr: {}", err.trim());
        }
    }
    Err(e) => eprintln!("  Error: {}", e),
}

println!();

// Now deliberately cause an error to see stderr
match run_capturing_both("cargo", &["nonexistent-subcommand"]) {
    Ok((out, err)) => {
        if !err.trim().is_empty() {
            // Show only the first line of the error
            let first_line = err.lines().next().unwrap_or("(no message)");
            println!("  cargo error (stderr): {}", first_line);
        }
        let _ = out; // out is likely empty — explicitly ignore it
    }
    Err(e) => eprintln!("  Could not run: {}", e),
}

println!();
```

**`let _ = out` — explicitly ignoring a value:**

The `_` pattern tells Rust "I know this value exists and I am intentionally not using it." Without it, Rust might warn about an unused variable. Using `_` as a variable name (rather than binding to `_out`) tells the compiler the value is intentionally discarded — it is dropped immediately.

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
Step 3: Separate stdout and stderr
  stdout: cargo 1.XX.X (...)

  cargo error (stderr): error: no such command: `nonexistent-subcommand`

```

Two different streams, captured separately, handled differently. The stderr of a child process did not mix with its stdout — exactly how a production server keeps its log output clean.

---

### Step 6 — Environment Inheritance

Add to `main()`:

```rust
// Step 4: Environment variables in child processes
println!("Step 4: Environment variable inheritance");

// Set a custom variable for the child, inheriting the rest
let output = Command::new("env")           // 'env' prints all environment variables
    .env("MY_SERVER_PORT", "8080")         // add/override one variable
    .env("MY_SERVER_HOST", "localhost")    // add another
    .output();

#[cfg(not(target_os = "windows"))]
match output {
    Ok(out) => {
        let text = String::from_utf8_lossy(&out.stdout);
        // Find our custom variables in the output
        for line in text.lines() {
            if line.starts_with("MY_SERVER") {
                println!("  {}", line);
            }
        }
    }
    Err(e) => eprintln!("  Error: {}", e),
}

#[cfg(target_os = "windows")]
println!("  (env command not available — use 'set' in cmd or Get-ChildItem Env: in PowerShell)");

println!();
```

**Environment inheritance rules:**

By default, a child process inherits all of the parent's environment variables. `.env("KEY", "VALUE")` adds or overrides one variable. `.env_remove("KEY")` removes one. `.env_clear()` removes all inherited variables — starting with a clean environment. The web server will use `.env_clear().env("PORT", port)` when spawning workers — each worker only gets exactly the variables it needs.

---

### Step 7 — Complete `main()` and Clean Up

Final `main()` with all steps and a summary:

```rust
fn main() {
    println!("=== System Information Pipeline ===");
    println!();

    // Step 1: Directory listing
    println!("Step 1: List files in current directory");
    match run_command_cross_platform() {
        Ok(output) => {
            let lines: Vec<&str> = output.lines().filter(|l| !l.is_empty()).collect();
            println!("  Found {} items", lines.len());
        }
        Err(e) => eprintln!("  Error: {}", e),
    }
    println!();

    // Step 2: Pipeline
    println!("Step 2: Count files containing 'Cargo'");
    #[cfg(not(target_os = "windows"))]
    {
        match pipe_commands("ls", &[], "grep", &["Cargo"]) {
            Ok(output) => {
                let n = output.lines().filter(|l| !l.is_empty()).count();
                println!("  Found {} matching items", n);
            }
            Err(e) => eprintln!("  Error: {}", e),
        }
    }
    println!();

    // Step 3: Separate streams
    println!("Step 3: cargo --version");
    match run_capturing_both("cargo", &["--version"]) {
        Ok((out, _)) => println!("  {}", out.trim()),
        Err(e)       => eprintln!("  Error: {}", e),
    }
    println!();

    // Step 4: Environment
    println!("Step 4: Custom environment variables in child");
    #[cfg(not(target_os = "windows"))]
    {
        if let Ok(out) = Command::new("env").env("MY_PORT", "8080").output() {
            let text = String::from_utf8_lossy(&out.stdout);
            for line in text.lines().filter(|l| l.starts_with("MY_PORT")) {
                println!("  {}", line);
            }
        }
    }
    println!();

    println!("=== Pipeline complete ===");
}
```

---

### SAVE AND TRY

```
cargo run
```

Verify all four steps produce output. On Windows, steps using Unix commands will show the skip message — this is correct and intentional.

---

## Part 4 — Signals: How the OS Talks to Processes

### Concept: Signal — An Asynchronous Notification to a Process

**What it is:** A signal is a notification sent by the OS (or another process) to a process, interrupting its normal execution. The process can choose to handle the signal, ignore it (for most signals), or let the default action happen.

**Why signals exist:** Signals are the OS's mechanism for out-of-band communication — messages that arrive regardless of what the process is doing, without the process explicitly checking for them. They are the OS equivalent of a phone call interrupting whatever you are currently doing.

**The most important signals:**

| Signal | Number | Default action | Meaning |
|---|---|---|---|
| `SIGINT` | 2 | Terminate | Ctrl+C — user requests interruption |
| `SIGTERM` | 15 | Terminate | Polite termination request (from `kill` command) |
| `SIGKILL` | 9 | Terminate (cannot be caught) | Forceful termination — cannot be handled |
| `SIGHUP` | 1 | Terminate | Terminal closed, or "reload config" for daemons |
| `SIGCHLD` | 17 | Ignore | Child process changed state (exited, stopped) |
| `SIGPIPE` | 13 | Terminate | Write to a closed pipe |

**`SIGPIPE` — the web server's constant companion:**

When your web server writes a response to a client and the client has already disconnected, the write goes to a pipe (the socket) whose read end is closed. The OS sends `SIGPIPE` to your server. By default, `SIGPIPE` terminates the process — which would crash your entire server because one client disconnected. Production web servers always either ignore `SIGPIPE` or handle it gracefully. We will configure this in Lab 15 when the server handles real connections.

**`SIGTERM` — the graceful shutdown signal:**

When you run `kill <PID>` in the terminal, the OS sends `SIGTERM` by default. A well-behaved server catches `SIGTERM`, finishes any in-progress requests, closes all connections cleanly, and then exits. A server that is killed with `SIGKILL` (which cannot be caught) may leave connections half-open and corrupt in-progress operations. Graceful shutdown handling is a Phase 4 topic.

**Sending signals in Rust:**

```rust
use std::process::Command;

// Spawn a long-running child:
let mut child = Command::new("sleep").arg("60").spawn()?;

// Kill it with SIGTERM (platform-specific):
#[cfg(unix)]
{
    use std::os::unix::process::CommandExt;
    // On Unix, Child has a .kill() method that sends SIGKILL:
    child.kill()?;
}

// Or wait with a timeout (more sophisticated — covered in Phase 4)
```

For now, understanding that signals exist and that `SIGPIPE` will affect your web server is the key takeaway. We will implement signal handling properly in Phase 4.

---

## Part 5 — The Bridge to Phase 3

### Mental Model: A TCP Connection Is Just a File Descriptor

This is the most important concept in the entire lab. Read it carefully.

**Everything you have learned about file I/O applies directly to network I/O.**

When your web server accepts a TCP connection in Lab 13, the OS returns a file descriptor — an integer in your process's fd table, exactly like the file descriptor you get from `File::open()`. You read from it with `read()`. You write to it with `write()`. It closes when dropped. It can be passed to a child process via `Stdio::from()`. It shows up in `/proc/<PID>/fd/`.

**The only difference:** instead of reading from a disk, you are reading from a network buffer maintained by the kernel. Instead of writing to a disk, you are writing to a network buffer that the kernel transmits over the wire.

**The mental model:**

```
File on disk:
  File::open("sample.log") → fd 3 → BufReader::new(file) → .lines()

TCP connection from a client:
  TcpListener::accept() → fd 3 → BufReader::new(stream) → .lines()

The code is structurally identical.
The fd points to different kernel resources.
The abstractions are the same.
```

This is why Lab 10's "file descriptor" concept was taught before networking. The fd table, the read/write interface, the ownership model — all of it transfers directly. In Lab 13 you will open a `TcpListener` (which gets an fd), call `.accept()` to get a `TcpStream` (another fd), wrap it in a `BufReader`, and read HTTP request lines with `.lines()`. The only new concept is how TCP connections are established — everything about working with them once established is already familiar.

**The web server architecture preview:**

```
Main process:
  TcpListener::bind("0.0.0.0:8080")    ← one fd: the listening socket
  loop {
    let stream = listener.accept()      ← new fd for each connection
    // Option A: handle in same process (Labs 13–14)
    handle_connection(stream)

    // Option B: spawn a thread (Lab 15)
    thread::spawn(|| handle_connection(stream))

    // Option C: spawn a child process (Lab 16)
    Command::new("handler").stdin(Stdio::from(stream)).spawn()

    // Option D: async (Labs 21–28)
    tokio::spawn(handle_connection(stream))
  }
```

You now understand Options A and C from first principles. Options B and D are coming. The socket fd is the same in all four cases — only the concurrency model changes.

---

## 🎯 Challenge: Build a Command Runner With Timeout

**You know:** `Command`, `Child`, `spawn()`, `wait()`, environment variables, exit codes.

**Task:** Write a function `run_with_timeout(program: &str, args: &[&str], timeout_secs: u64) -> Result<String, String>` that runs a command and kills it if it takes longer than `timeout_secs` seconds.

**The approach:**

```rust
use std::time::{Duration, Instant};
use std::thread;
```

1. Spawn the child with `.spawn()` (not `.output()` — `.output()` blocks forever)
2. Loop, calling `child.try_wait()?` repeatedly
3. `.try_wait()` returns `Ok(None)` if the child is still running, `Ok(Some(status))` if done
4. If the child is still running and `Instant::now().duration_since(start) > timeout`, call `child.kill()` and return `Err("timed out")`
5. Sleep briefly between checks: `thread::sleep(Duration::from_millis(50))`

**Hint — skeleton:**

```rust
fn run_with_timeout(
    program:      &str,
    args:         &[&str],
    timeout_secs: u64,
) -> Result<String, String> {
    let mut child = Command::new(program)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .spawn()
        .map_err(|e| format!("Could not start '{}': {}", program, e))?;

    let start = Instant::now();
    let timeout = Duration::from_secs(timeout_secs);

    loop {
        match child.try_wait() {
            // child finished — your code here
            // still running — check timeout, sleep, continue — your code here
            // error — return Err — your code here
        }
    }
}
```

Test it with:

```rust
// Should complete in time:
run_with_timeout("echo", &["hello"], 5)

// Should time out:
run_with_timeout("sleep", &["10"], 1)
```

Try for 15 minutes before revealing.

---

<details>
<summary>▶ Show Solution</summary>

```rust
use std::time::{Duration, Instant};
use std::thread;

fn run_with_timeout(
    program:      &str,
    args:         &[&str],
    timeout_secs: u64,
) -> Result<String, String> {
    let mut child = Command::new(program)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .spawn()
        .map_err(|e| format!("Could not start '{}': {}", program, e))?;

    let start   = Instant::now();
    let timeout = Duration::from_secs(timeout_secs);

    loop {
        match child.try_wait() {
            Ok(Some(status)) => {
                // Child finished — collect its output
                let output = child.wait_with_output()
                    .map_err(|e| format!("Error collecting output: {}", e))?;

                if status.success() {
                    return Ok(String::from_utf8_lossy(&output.stdout).into_owned());
                } else {
                    return Err(format!(
                        "'{}' exited with code {}",
                        program,
                        status.code().unwrap_or(-1)
                    ));
                }
            }
            Ok(None) => {
                // Child still running
                if start.elapsed() >= timeout {
                    child.kill()
                        .map_err(|e| format!("Could not kill '{}': {}", program, e))?;
                    return Err(format!("'{}' timed out after {}s", program, timeout_secs));
                }
                thread::sleep(Duration::from_millis(50)); // poll every 50ms
            }
            Err(e) => {
                return Err(format!("Error checking '{}': {}", program, e));
            }
        }
    }
}
```

Test in `main()`:

```rust
println!("Timeout demo:");
match run_with_timeout("echo", &["completed quickly"], 5) {
    Ok(out) => println!("  OK: {}", out.trim()),
    Err(e)  => println!("  Err: {}", e),
}

#[cfg(not(target_os = "windows"))]
match run_with_timeout("sleep", &["10"], 1) {
    Ok(_)  => println!("  OK (unexpected)"),
    Err(e) => println!("  Timed out: {}", e),
}
```

**Key insight:** Polling with `try_wait()` and sleeping between checks is the simplest timeout implementation. The cost is up to 50ms of extra delay after the process exits before we notice. For a web server handling CGI scripts, this is acceptable. For lower latency, you would use OS-level mechanisms: on Linux, `signalfd` or `waitpid` with `WNOHANG` in a dedicated thread; in async Rust (Phase 4), `tokio::time::timeout` wraps any future with a timeout using the async runtime's timer wheel. The polling approach here is the foundation — understanding why the async approach is better requires understanding this approach first.

</details>

---

## 🎯 Challenge 2: The Architecture Decision

**This is a thinking challenge — no new code.**

Your web server will handle multiple simultaneous clients. Consider these four architectures:

```
A) Single process, single thread — handle one connection at a time, in sequence
B) Single process, multiple threads — one thread per connection
C) Multiple processes — fork() for each connection
D) Async — one thread, many concurrent connections via an event loop
```

For each architecture, answer:
1. What happens if one connection is slow (client on a bad network)?
2. What happens if one connection crashes its handler?
3. How much memory does each additional connection require?
4. What is the maximum number of connections before performance degrades?

**The answers — think through them before reading:**

**A — Single process, single thread:**
1. All other connections wait — completely blocked
2. The whole server crashes or hangs
3. No extra memory per connection
4. 1 — can only serve one connection at a time

**B — One thread per connection:**
1. Other connections continue unaffected
2. That thread crashes; the server and other threads survive
3. Each thread needs its own stack: ~8MB by default (configurable)
4. ~10,000 threads before OS scheduling overhead dominates — the "C10K problem"

**C — Fork per connection:**
1. Other connections continue unaffected
2. That process crashes; the server and other processes survive
3. Each process needs its own copy of memory (COW reduces this initially): ~50MB+
4. ~1,000 processes before memory pressure dominates — fewer than threads

**D — Async event loop:**
1. The slow connection yields its CPU time; other connections progress during the wait
2. A crashed async task can be caught; the event loop continues
3. ~kilobytes per connection — just the task's stack frame
4. ~1,000,000 connections — the theoretical "C1M problem" that modern async servers approach

**The conclusion:** Architecture D (async) wins on scaling. Architecture B (threads) is simpler to implement and fine for moderate traffic. Architecture C (processes) provides the strongest isolation — a crashed worker cannot corrupt the server. All four architectures appear in real production software. The web server you will build starts at A, moves to B in Lab 15, and arrives at D in Phase 4.

---

## Final Check

| Feature | How to verify |
|---|---|
| `run_command` works | `echo` output captured and printed |
| Non-existent command gives clear error | `run_command("nonexistent", &[])` → error message |
| `pipe_commands` connects two processes | `ls \| grep Cargo` finds Cargo files |
| Stdout and stderr captured separately | `cargo --version` stdout; `cargo nonexistent` stderr |
| Environment variable set in child | `MY_PORT=8080` appears in child's env output |
| `#[cfg]` compiles correctly | No errors on your platform |
| Exit code checked | Failed command returns `Err`, not `Ok` |
| Timeout function kills slow processes | `sleep 10` with 1s timeout returns Err |
| `cargo run` shows all four steps | Complete pipeline output visible |

---

## Quick Check Answers

**1. What happens at the OS level when you type `cargo run` and a new process starts?**

The shell (bash, zsh, PowerShell) calls `fork()` to create an exact copy of itself. The child process (the copy) then calls `exec()` with the path to `cargo` — replacing its entire code, stack, and heap with cargo's executable. Cargo runs, sees `run` as a subcommand, builds your program (possibly spawning another child process for `rustc`), and then forks again to run the compiled binary. Each `fork()` creates a new entry in the OS process table with a new PID. Each `exec()` loads a new executable into that process's virtual memory space. The original shell process calls `wait()` after forking, blocking until cargo exits. When cargo (and your program) finish, they call `exit()`, the OS removes them from the process table, and `wait()` in the shell returns. The shell prints its prompt again.

**2. What connects three programs in `ls | grep .rs | wc -l`?**

Two pipes — kernel-managed buffers, each with a write end and a read end. The shell creates both pipes before forking any child processes. Then it forks three children and configures their file descriptors: `ls` gets the write end of pipe 1 as its stdout; `grep` gets the read end of pipe 1 as its stdin and the write end of pipe 2 as its stdout; `wc` gets the read end of pipe 2 as its stdin. All three children are then exec'd simultaneously. `ls` writes to pipe 1; `grep` reads from pipe 1, filters, and writes matching lines to pipe 2; `wc` reads from pipe 2 and counts lines. When `ls` exits, pipe 1's write end closes, `grep` sees EOF and exits, pipe 2's write end closes, `wc` sees EOF and prints its count and exits. The shell's three `wait()` calls return; the shell prints the prompt.

**3. What are the options for handling multiple simultaneous clients?**

Four main architectures, each with different tradeoffs. A single-threaded, sequential server handles one client at a time — simple but unusable in practice. A multi-threaded server gives each connection its own thread — works well up to thousands of connections, limited by thread overhead (~8MB stack per thread). A multi-process server forks a child for each connection — strongest isolation (a crashed child cannot corrupt others) but highest memory cost. An async server uses an event loop with cooperative multitasking — the same thread handles thousands of connections by processing each one only when data is available, yielding between I/O operations. Modern high-performance servers (nginx, tokio-based servers) use async with a fixed thread pool — one thread per CPU core, each running its own event loop. All four approaches are built on the same OS primitives: file descriptors, system calls, and the kernel's ability to notify a process when a fd is ready for I/O.
